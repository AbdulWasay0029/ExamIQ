# ExamIQ — Current Build & Complete Developer Handover Documentation

> **Project Name:** ExamIQ — AI-Powered Exam Survival, PYQ Deduplication & Mock Paper Generation Engine  
> **Status:** Production-Ready Build (v1.1.0 — Vercel Serverless Ready & Hallucination-Proof AI Grounding)  
> **Architecture:** Full-Stack Decoupled Application (Next.js 14 Frontend + FastAPI Python Backend)

---

## 1. Executive Summary & Core Value Proposition

**ExamIQ** is engineered specifically for university engineering students facing exam crunch time. Traditional AI tools like ChatGPT fail at semester preparation because they generate unverified, generic answers and cannot synthesize across 10 years of unorganized previous question papers (PYQs), messy blackboard photos, and disorganized class notes.

ExamIQ solves this by introducing a **Semantic Deduplication & Priority Ranking Engine**:
1. **Parallel Ingestion:** Ingests years of PYQ PDFs, WhatsApp blackboard snapshots, and class notes simultaneously.
2. **Mathematical Pattern Deduplication:** Uses TF-IDF cosine similarity embedding clustering to group near-duplicate questions across different years (e.g., measuring exactly that *"Explain TCP 3-way handshake"* was asked **6× across PYQs**).
3. **Syllabus Scope Targeting:** Custom-filters rankings strictly for **Mid 1** (Units 1–2.5), **Mid 2** (Units 2.5–5), or **Semester** (Units 1–5) exams.
4. **Mark-Scaled Grounded RAG:** Synthesizes structured answers strictly scaled to the university marking rubric (2M definitions, 5M bullet points, 10M architectural essays with ASCII diagrams) grounded directly in the student's class notes.
5. **AI Pattern Auto-Detector & Mock Paper Generator:** Auto-detects the specific autonomous/university examination paper structure and renders live, printable mock question papers with Part A (Compulsory SAQs) and Part B (Internal Choice OR Pairs).
6. **Recency-Weighted Ranking Engine:** Dynamically weights recent PYQs (last 2 years = 2× multiplier) over outdated papers, mirroring real college paper setter trends.
7. **Exact University Mark-Tier Templates:** Strictly formats 1M crisp definitions, 2M definition+formula, 5M bullet points, and 10M numbered essays with ASCII diagrams matching Indian college evaluation rubrics (CMRIT / JNTUH / VTU).
8. **Time-Aware ROI Strategy & Safe-To-Skip Permission:** Calculates predicted appearance confidence scores (%) and explicit skip authorization when time is limited.
9. **Widescreen Panoramic UI UX Pro Max Architecture:** Edge-to-edge 1600px desktop layout featuring split command centers, ambient architectural grid backdrops, and zero dead side space.

---

## 2. Complete Technology Stack

### Frontend Application (`/frontend`)
- **Framework:** Next.js 14 (App Router, Server & Client Components)
- **Language:** TypeScript 5.x (Strict typing enabled across all state and API boundaries)
- **Styling:** Vanilla Tailwind CSS with custom curated slate/navy dark theme (`#090d16`, `#111827`, `#6366f1` Indigo primary, `#06b6d4` Cyan accent, `#f59e0b` Gold Amber for Teacher Hints).
- **Typography:** Reliable CSS Font Imports (`Plus Jakarta Sans` for clean modern UI headings/body, `IBM Plex Mono` for mathematical scores, badges, and code snippets) with system fallbacks to prevent cloud build font-fetching timeouts.
- **Icons & UI:** `lucide-react` for high-contrast iconography, `react-hot-toast` for real-time pipeline notifications.
- **File Upload:** `react-dropzone` with drag-and-drop animations and multi-format support (`.pdf`, `.png`, `.jpg`, `.txt`, `.md`).
- **Markdown Rendering:** `react-markdown` with typography prose styling for model answer keys.

### Backend Engine (`/backend`)
- **Framework:** Python FastAPI (High-performance async REST API with automatic OpenAPI Swagger documentation).
- **ORM & Database:** SQLModel (Pydantic + SQLAlchemy 2.0). Auto-detects Vercel Serverless environment (`VERCEL=1`) to utilize `/tmp/examiq.db` for full read/write cloud execution.
- **Machine Learning / NLP:** `scikit-learn` (`TfidfVectorizer`, `cosine_similarity`) for offline high-speed semantic clustering and duplicate detection without API rate limits.
- **Document Parsing:** `PyPDF2` and `pdfplumber` for multi-page PDF extraction, `Pillow` (PIL) and `pytesseract` OCR support for blackboard hints and friend photos.
- **Multi-Provider AI SDK:** Native integration with **Google Gemini 1.5 Flash** (`google-generativeai`), **Groq Llama-3**, **OpenAI GPT-4o**, and **Anthropic Claude 3.5 Sonnet**, with automatic failover to an intelligent heuristic offline extraction engine.

---

## 3. Deep-Dive Feature Architecture

### A. Document Role Categorization & Teacher Hint Priority
When files are queued, ExamIQ automatically assigns or allows manual tagging into 5 distinct roles:
- `PYQ` (Previous Year Question Paper): Extracted questions undergo frequency deduplication. Allows specifying academic year (e.g., 2023, 2024).
- `Notes` (Student Class Notes / Lecture Slides): Stored in the local vector database as **Grounding Reference Chunks**. AI answers draw directly from these notes to guarantee 100% curriculum accuracy.
- `Teacher Hint` (Blackboard Photos / Starred Topics): Given an immediate **+15.0 Priority Score Boost**. Highlighted across the UI with distinct Gold Amber (`★ Teacher Hint`) badges.
- `Syllabus`: Defines unit boundaries and curriculum constraints.
- `Friend Photo`: OCR-processed snapshots of peer study guides.

### B. Algorithmic Priority Scoring Formula
Every extracted question cluster is evaluated using our core scoring equation:
$$\text{Priority Score} = (\text{Repetition Count} \times 2.5) + \text{TeacherFlagged}(+15.0) + \text{AvgMarksWeight} + \text{ExamScopeBoost}$$

### C. Hallucination-Proof & Rubric-Scaled RAG Answer Synthesis
To eliminate AI hallucination and ensure strict university rubric alignment, ExamIQ enforces explicit structure generation:
- **$\le$ 3 Marks (Definitions):** Crisp, high-impact 2–3 sentence definition with bolded terminology.
- **4–6 Marks (Short Notes):** Structured introduction, 3–4 bullet points detailing core operational mechanics, and key advantages.
- **$\ge$ 8 Marks (Long Essay Questions):** Comprehensive university-grade essay consisting of:
  1. *Architectural Overview & Core Principles*
  2. *Step-by-Step Working Mechanism / ASCII Flowchart Representation*
  3. *Comparative Trade-off Table (Reliability vs. Overhead vs. Latency)*
  4. *Academic Summary Conclusion*

### D. AI Pattern Auto-Detector & Live Mock Paper Generator
To prepare students for actual examination conditions, ExamIQ includes a live Mock Paper Generator:
- **Pattern Auto-Detection:** Analyzes ingested PYQs to detect the specific university's question paper layout.
- **Realistic Paper Formatting:** Renders an interactive, printable university exam paper complete with official header styling, time allowance (90m for Mids, 120m for Semester), and mark breakdown:
  - **PART A (Compulsory SAQs):** 5 sub-questions (`1.a` to `1.e` for Mid 1/2) or 10 sub-questions (`1.a` to `1.j` for Semester).
  - **PART B (Internal Choice LAQs):** 5 sections featuring paired essay questions separated by prominent **`— OR —`** badges (e.g., *Question 2 OR Question 3* from Unit 1).
- **Interactive Model Answer Key:** Every single question on the mock paper includes a *"Reveal Model Key"* button that synthesizes or expands pristine mark-scaled reference solutions inline.

### E. The 4 AI Exam Strategist Pillars (Evolution Beyond Summarization)
ExamIQ organizes preparation into 4 distinct strategy pillars:
1. **Pillar 1: Rank & Analyze (📋 Study Shortlist):** Mathematical frequency deduplication and teacher hint ranking.
2. **Pillar 2: Time-Aware ROI Plan (🎯 Prioritize):**
   - **Time-Aware Buffer Selector:** Select between `24h`, `12h`, `6h`, or `2h (Panic Mode)`.
   - **Actionable Buckets:** Automatically categorizes topics into 🔥 **MUST STUDY** (High Yield), ⚡ **OPTIONAL**, and 🛑 **SKIP THIS** (with explicit AI permission like *"Appeared 1× across 10 years. Safe to skip."*).
   - **Unit Study Order Optimizer:** Ranks units by **Expected Return On Investment (ROI = Marks ÷ Prep Time)** rather than sequential syllabus order!
3. **Pillar 3: Memory Cheat Sheets & Dump Mode (🧠 Learn):**
   - **Comparative Tables:** Side-by-side breakdowns (e.g. OSI vs TCP/IP, Dijkstra vs Bellman-Ford).
   - **⚡ Night-Before 1-Page Exam Dump Mode:** Strips paragraphs instantly to show high-scoring keywords only.
4. **Pillar 4: Mock Paper Practice & Evaluator (⚡ Practice):**
   - **Realistic College Pattern:** Auto-detected Part A (Compulsory SAQs) + Part B (Internal Choice OR Pairs).
   - **🧪 Interactive Practice Answer Evaluator:** Allows students to type/paste practice answers and receive instant AI grading (`Estimated Rubric Score`, `Strengths Identified`, and `Missing Elements to secure 100%`).

---

## 4. Complete Project Directory Structure

```text
examiq/
├── vercel.json                        # Root Vercel full-stack routing configuration
├── current_build.md                   # This developer handover & technical blueprint
├── README.md                          # Quick user overview
│
├── backend/                           # Python FastAPI Backend Engine
│   ├── .env                           # Configured with Gemini 1.5 Flash & Groq API Keys
│   ├── main.py                        # REST API Routes (/upload, /important-questions, /generate-answer, /generate-mock-paper, /strategy-plan, /memory-sheet, /evaluate-answer, /seed-demo)
│   ├── database.py                    # SQLModel database engine & session dependency (/tmp/examiq.db support)
│   ├── models.py                      # Database schemas: Document, Question, QuestionCluster, NotesChunk
│   ├── requirements.txt               # Backend Python dependencies (fastapi, uvicorn, sqlmodel, scikit-learn, google-generativeai, python-dotenv, etc.)
│   └── services/
│       ├── __init__.py
│       ├── clustering.py              # TF-IDF Cosine Similarity vector clustering & priority score recalculation engine
│       ├── ingestion.py               # Multimodal document text extraction (PDF, Text, Markdown, Image OCR)
│       └── llm.py                     # Multi-provider LLM integration + dotenv auto-loading
│
└── frontend/                          # Next.js 14 Frontend Application
    ├── vercel.json                    # Frontend standalone fallback Vercel configuration
    ├── package.json                   # NPM dependencies & build scripts
    ├── tsconfig.json                  # Strict TypeScript configuration
    ├── tailwind.config.ts             # Curated design tokens, colors, and font definitions
    ├── app/
    │   ├── layout.tsx                 # Root layout with Plus Jakarta Sans & IBM Plex Mono fonts + Toaster notifications
    │   ├── page.tsx                   # Master SPA state controller
    │   ├── globals.css                # Global CSS resets and custom scrollbars
    │   └── print.css                  # Print-ready media queries for clean PDF shortlist & mock paper export
    ├── components/
    │   ├── UploadZone.tsx             # Hero dashboard with drag-and-drop workspace & Hackathon Demo trigger
    │   ├── FileRow.tsx                # Boxed file item row with source selector, PYQ year input, and Teacher Hint toggle
    │   ├── ExamTypeToggle.tsx         # 3-segment pill toggle for Mid 1, Mid 2, and Semester modes
    │   ├── ProcessingScreen.tsx       # 5-step parallel document ingestion and clustering animation screen
    │   ├── Dashboard.tsx              # Master navigation switcher across the 4 AI Exam Strategist Pillars
    │   ├── Sidebar.tsx                # Sticky control panel with Add More button, syllabus unit filters, and PDF export
    │   ├── QuestionCard.tsx           # Ranked question card with Teacher Hint badge, repetition metrics, and evaluator CTA
    │   ├── AnswerPanel.tsx            # Mark-scaled markdown answer renderer with copy button and note grounding badge
    │   ├── MockPaperView.tsx          # Realistic university examination paper renderer with Part A + Part B OR pairs
    │   ├── StrategyPlannerView.tsx    # Time-aware ROI study planner with Must Study / Skip buckets and confidence meter
    │   ├── MemorySheetView.tsx        # Condensed comparison tables and night-before keyword dump mode
    │   └── AnswerEvaluatorModal.tsx   # Interactive practice evaluator grading student attempts against rubric
    └── lib/
        ├── api.ts                     # Async fetch wrappers connecting frontend components to FastAPI backend
        └── types.ts                   # Master TypeScript interface definitions for FileItem, StrategyPlan, EvalResponse
```

---

## 5. Deployment & Vercel Configuration Guide

### Full-Stack Unified Deployment (Root `vercel.json`)
ExamIQ is configured to deploy both Next.js frontend and FastAPI backend inside a single Vercel deployment:
```json
{
  "version": 2,
  "builds": [
    { "src": "frontend/package.json", "use": "@vercel/next" },
    { "src": "backend/main.py", "use": "@vercel/python" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "backend/main.py" },
    { "src": "/(.*)", "dest": "frontend/$1" }
  ]
}
```
**Important Cloud Environment Variables to Set on Vercel:**
- `GEMINI_API_KEY`: Your Google Gemini 1.5 Flash API Key (for live multimodal OCR and answer generation).
- `NEXT_PUBLIC_API_URL`: Set to `/api` when deployed unified, or `https://your-backend-project.vercel.app` if deploying frontend and backend as two separate Vercel projects.

---

## 6. API Endpoints Specification

| Method | Endpoint | Description | Request Parameters | Response Shape |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/upload` | Ingests document file, parses text/OCR, runs extraction & clustering. | `multipart/form-data`: `file`, `subject`, `source_type`, `year`, `teacher_flagged` | `{ "status": "success", "questions_extracted": int, "document_id": int }` |
| `GET` | `/important-questions` | Returns deduplicated question clusters sorted by priority score. | `subject: str`, `exam_type: str ("Mid 1"\|"Mid 2"\|"Semester")`, `unit: int (optional)` | `List[QuestionCluster]` |
| `POST` | `/generate-answer` | Synthesizes mark-scaled reference answer grounded in notes. | `{ "cluster_id": int, "exam_type": str, "marks": int }` | `{ "answer_text": str, "grounded_in_notes": bool }` |
| `GET` | `/generate-mock-paper` | Generates realistic university mock paper with Part A & Part B OR pairs. | `subject: str`, `exam_type: str`, `pattern_mode: str` | `MockPaperData` (Detailed Part A/B structure) |
| `POST` | `/seed-demo` | Populates database with pre-clustered Computer Networks dataset. | None | `{ "status": "success", "message": str }` |
| `GET` | `/subjects` | Lists all active course subjects in database. | None | `List[str]` |
