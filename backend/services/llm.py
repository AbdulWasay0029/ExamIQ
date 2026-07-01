import json
import os
import re
from typing import List, Dict, Any, Tuple
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


class LLMService:

    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")

    # ============================================================
    # FIX 1: AI OCR Cleanup — runs BEFORE extraction or clustering
    # ============================================================
    def clean_raw_text_with_ai(self, raw_text: str, subject: str) -> str:
        """Cleans raw OCR/PDF text using Gemini Flash.
        Removes college headers, page numbers, roll number fields,
        OCR artifacts, and returns only clean exam question text.
        This is the single most important AI call in the pipeline.
        """
        if not self.gemini_key:
            return raw_text  # No key = pass through

        try:
            import google.generativeai as genai
            genai.configure(api_key=self.gemini_key)
            model = genai.GenerativeModel("gemini-1.5-flash")

            prompt = (
                "You are cleaning raw OCR text extracted from a university exam paper.\n"
                f"Subject: {subject}\n\n"
                "Your job:\n"
                "1. Extract ONLY the actual exam questions from this text.\n"
                "2. REMOVE all of the following:\n"
                "   - College/university headers (CMR INSTITUTE, JNTUH, VTU, etc.)\n"
                "   - Roll number fields, date fields, time allowed text\n"
                "   - Instruction lines ('Answer any FIVE', 'Internal Choice', etc.)\n"
                "   - Page numbers or random numbers that leaked into question text\n"
                "   - OCR garbage characters, broken words, random symbols\n"
                "   - Question numbers at the start (1., 2., a), b), etc.)\n"
                "3. FIX broken OCR words (e.g., 'multi O pl Ric ation' → 'multiplication')\n"
                "4. Each question should be a clean, complete, standalone sentence\n"
                "5. Preserve mark allocations if clearly present (e.g., 10M, 5 Marks)\n\n"
                "Return ONLY a JSON array of objects:\n"
                '[{"question": "Clean question text", "marks": 10, "unit": 2}]\n\n'
                "If marks or unit are unclear, estimate based on question complexity and subject curriculum.\n\n"
                f"Raw OCR text:\n{raw_text[:8000]}"
            )

            res = model.generate_content(prompt)
            text = res.text
            match = re.search(r"\[.*\]", text, re.DOTALL)
            if match:
                cleaned = json.loads(match.group(0))
                # Reconstruct as clean text for downstream processing
                lines = []
                for item in cleaned:
                    q = item.get("question", "").strip()
                    m = item.get("marks", 10)
                    u = item.get("unit", 1)
                    if q and len(q) > 10:
                        lines.append(f"{q} ({m}M) [Unit {u}]")
                if lines:
                    return "\n".join(lines)
        except Exception as e:
            print(f"[LLMService] OCR cleanup failed, passing raw: {e}")

        return raw_text

    # ============================================================
    # FIX 2: AI Mock Paper Generation — replaces template garbage
    # ============================================================
    def generate_mock_paper_with_ai(
        self, subject: str, exam_type: str, ranked_topics: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generates a realistic university mock paper using Gemini Flash.
        Uses actual ranked topics from the database — never invents concepts.
        """
        if not self.gemini_key:
            return None  # Fallback to template if no key

        try:
            import google.generativeai as genai
            genai.configure(api_key=self.gemini_key)
            model = genai.GenerativeModel("gemini-1.5-flash")

            exam_mode = exam_type.strip().lower()
            is_semester = "sem" in exam_mode
            is_mid2 = "2" in exam_mode

            if is_semester:
                units_scope = "Units 1 through 5 (full syllabus)"
                part_a_spec = "10 compulsory SAQs (2 marks each, 2 per unit)"
                part_b_spec = "5 sections (one per unit), each with 2 OR-choice questions worth 10 marks"
                time = "180 Minutes"
                max_marks = 70
            elif is_mid2:
                units_scope = "Unit 3 (Part B), Unit 4, and Unit 5"
                part_a_spec = "5 compulsory SAQs (2 marks each)"
                part_b_spec = "3 sections with 2 OR-choice questions each worth 5 marks"
                time = "90 Minutes"
                max_marks = 30
            else:
                units_scope = "Unit 1, Unit 2, and Unit 3 (Part A)"
                part_a_spec = "5 compulsory SAQs (2 marks each)"
                part_b_spec = "3 sections with 2 OR-choice questions each worth 5 marks"
                time = "90 Minutes"
                max_marks = 30

            # Build ranked topics summary for the prompt
            topics_str = ""
            for i, t in enumerate(ranked_topics[:20]):
                topics_str += f"{i+1}. [{t.get('unit', '?')}] {t.get('text', t.get('canonical_text', ''))} (appeared {t.get('repetition_count', 1)}×, {t.get('marks', 5)}M)\n"

            prompt = (
                f"Generate a realistic Indian university exam mock paper for:\n"
                f"Subject: {subject}\n"
                f"Exam Type: {exam_type}\n"
                f"Syllabus Scope: {units_scope}\n"
                f"Time: {time}, Max Marks: {max_marks}\n\n"
                f"Paper Format:\n"
                f"- PART A: {part_a_spec}\n"
                f"- PART B: {part_b_spec}\n\n"
                f"These are the ACTUAL topics ranked by importance from real PYQ analysis:\n{topics_str}\n"
                "CRITICAL RULES:\n"
                "1. Questions must be SPECIFIC and answerable — no generic filler\n"
                "2. Use REAL terminology from the subject\n"
                "3. Part A tests definitions, short concepts, one-liners\n"
                "4. Part B tests working mechanisms, algorithms, comparisons, diagrams\n"
                "5. NEVER write generic placeholder text like 'analyze performance metrics in Unit X'\n"
                "6. ONLY use concepts from the ranked topics list above — do NOT invent new topics\n"
                "7. Each question must feel like it was written by an actual professor\n\n"
                "Return ONLY valid JSON in this exact shape:\n"
                '{\n'
                '  "part_a": [{"q_num": "1.a", "text": "...", "unit": 1, "marks": 2}],\n'
                '  "part_b": [{"unit": 1, "unit_label": "Unit 1 — Topic Area", '
                '"q_option_1": {"q_num": "2", "text": "...", "unit": 1, "marks": 5}, '
                '"q_option_2": {"q_num": "3", "text": "...", "unit": 1, "marks": 5}}]\n'
                '}'
            )

            res = model.generate_content(prompt)
            text = res.text
            match = re.search(r"\{.*\}", text, re.DOTALL)
            if match:
                paper = json.loads(match.group(0))
                # Assign IDs
                for i, q in enumerate(paper.get("part_a", [])):
                    q["id"] = 900 + i
                for i, sec in enumerate(paper.get("part_b", [])):
                    if "q_option_1" in sec:
                        sec["q_option_1"]["id"] = 950 + i * 2
                    if "q_option_2" in sec:
                        sec["q_option_2"]["id"] = 951 + i * 2
                return paper
        except Exception as e:
            print(f"[LLMService] AI mock paper generation failed: {e}")

        return None

    def extract_structured_questions(
        self, raw_text: str, subject: str
    ) -> List[Dict[str, Any]]:
        """Extracts individual questions from raw document text.

        Uses LLM if configured, otherwise uses intelligent heuristic extraction.
        """
        # If API keys exist, we attempt live LLM extraction
        if self.gemini_key or self.openai_key or self.anthropic_key:
            try:
                prompt = (
                    f"You are an expert university professor analyzing an exam preparation document for the subject '{subject}'.\n"
                    "Extract every distinct examination question or topic found in the text.\n"
                    "Return ONLY valid JSON, no markdown codeblocks, no preamble, in this exact shape:\n"
                    "[\n"
                    '  {\n    "question_text": "Clean, complete, standalone question string without question numbers",\n'
                    '    "marks": <integer marks e.g. 2, 5, 10>,\n'
                    '    "unit": <integer syllabus unit 1 to 5 based on content context>\n  }\n'
                    "]\n\n"
                    "Rules:\n"
                    "1. If marks are not explicitly mentioned, assign 10 for long essay/diagram questions, 5 for medium short notes, and 2 for definitions.\n"
                    "2. Assign unit numbers 1 through 5 logically based on standard university computer science curriculum flow.\n"
                    f"Document text:\n{raw_text[:6000]}"
                )

                if self.gemini_key:
                    import google.generativeai as genai

                    genai.configure(api_key=self.gemini_key)
                    model = genai.GenerativeModel("gemini-1.5-flash")
                    res = model.generate_content(prompt)
                    text = res.text
                    match = re.search(r"\[.*\]", text, re.DOTALL)
                    if match:
                        return json.loads(match.group(0))
            except Exception as e:
                print(
                    f"[LLMService] Live extraction error, falling back to heuristics: {e}"
                )

        # Intelligent Heuristic Fallback
        questions = []
        lines = raw_text.split("\n")
        current_unit = 1
        for line in lines:
            line = line.strip()
            # Check for Unit indicator
            unit_match = re.search(r"Unit\s*[-:]?\s*(\d+)", line, re.IGNORECASE)
            if unit_match:
                current_unit = int(unit_match.group(1))

            # Look for lines ending with a question mark or starting with question numbers
            q_match = re.search(
                r"^(\d+[\.\)]\s*)?([A-Z].*(?:\?|\b(explain|differentiate|discuss|define|write short notes|describe|compare)\b.*))",
                line,
                re.IGNORECASE,
            )
            if q_match and len(line) > 15:
                # Extract marks
                marks_match = re.search(r"\(?(\d+)\s*(?:M|marks|mark)\)?", line, re.I)
                marks = int(marks_match.group(1)) if marks_match else 10
                if len(line) < 40 and marks_match is None:
                    marks = 5

                clean_q = re.sub(r"^\d+[\.\)]\s*", "", line)
                clean_q = re.sub(
                    r"\s*\(?\d+\s*(?:M|marks|mark)\)?", "", clean_q, flags=re.I
                ).strip()

                if len(clean_q) > 12:
                    questions.append(
                        {
                            "question_text": clean_q,
                            "marks": marks,
                            "unit": current_unit,
                        }
                    )

        if not questions:
            # Fallback realistic questions if document had arbitrary notes
            questions = [
                {
                    "question_text": f"Explain the fundamental architecture and working principles of {subject}.",
                    "marks": 10,
                    "unit": 1,
                },
                {
                    "question_text": f"Discuss the trade-offs and performance optimizations in {subject}.",
                    "marks": 10,
                    "unit": 2,
                },
                {
                    "question_text": f"Define key terminology and core protocols used in {subject}.",
                    "marks": 5,
                    "unit": 1,
                },
            ]
        return questions

    def generate_grounded_answer(
        self, question_text: str, marks: int, exam_type: str, notes_chunks: List[str]
    ) -> Tuple[str, bool]:
        """Generates a structured markdown answer scoped to notes_chunks."""
        grounded = len(notes_chunks) > 0

        if self.gemini_key:
            try:
                import google.generativeai as genai

                genai.configure(api_key=self.gemini_key)
                model = genai.GenerativeModel("gemini-1.5-flash")
                notes_str = (
                    "\n\n".join(notes_chunks)
                    if grounded
                    else "No notes provided. Answer using general CS/engineering knowledge."
                )
                prompt = (
                    "You are an expert university examination evaluator writing the perfect, full-marks reference answer for a student in an Indian university (CMRIT / JNTUH / VTU style exam).\n"
                    f"Subject: {exam_type} level examination question.\n"
                    f"Question: {question_text}\n"
                    f"Allocated Marks: {marks} Marks\n\n"
                    "CRITICAL EVALUATION CONTEXT:\n"
                    "Note: This answer will be evaluated by a university examiner using keyword-based marking. Include bolded high-scoring technical vocabulary directly corresponding to standard syllabus terms.\n\n"
                    "EXACT ANSWER STRUCTURE PER MARK VALUE:\n"
                    "1. If 1 Mark:\n"
                    "   - Provide EXACTLY a one-line crisp definition only. No fluff.\n"
                    "2. If 2 Marks:\n"
                    "   - Provide a 2-sentence definition + one concrete technical example or formula.\n"
                    "3. If 4-6 Marks:\n"
                    "   - Provide a formal definition + 3-4 structured bullet points detailing operational mechanics + small ASCII diagram or example.\n"
                    "4. If >= 8 Marks (Long Answer / Essay):\n"
                    "   - Must provide a complete university-grade response containing:\n"
                    "     (a) Formal Definition (2 lines)\n"
                    "     (b) Step-by-Step Algorithm / Working Mechanics (numbered steps)\n"
                    "     (c) ASCII Flowchart or Architecture Diagram representation\n"
                    "     (d) Worked example or numerical/packet parameter values\n"
                    "     (e) Comparison / Trade-off Table if applicable\n\n"
                    "Ground your answer strictly in the provided student class notes if available.\n\n"
                    f"Reference Student Class Notes:\n{notes_str}"
                )
                res = model.generate_content(prompt)
                return res.text.strip(), grounded
            except Exception as e:
                print(f"[LLMService] Answer generation failed: {e}")

    def verify_semantic_match(self, q1: str, q2: str) -> bool:
        """Verifies if two differently worded exam questions ask for the exact same concept/answer."""
        if self.gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_key)
                model = genai.GenerativeModel("gemini-1.5-flash")
                prompt = f"Are these two university exam questions asking about the exact same concept or requiring the same answer? Reply ONLY with 'YES' or 'NO'.\nQ1: {q1}\nQ2: {q2}"
                res = model.generate_content(prompt)
                return "yes" in res.text.lower()
            except Exception:
                pass
        return False


llm_service = LLMService()
