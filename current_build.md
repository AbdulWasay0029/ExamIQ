# ExamIQ — Current Build & Complete Developer Handover Documentation

> **Project Name:** ExamIQ — AI-Powered Exam Decision & Strategy Engine  
> **Status:** Production Build (v1.3.0 — AI-First Pipeline: Gemini Vision OCR → AI Mock Papers → Grounded Answers)  
> **Architecture:** Full-Stack Monorepo (Next.js 14 Frontend + FastAPI Python Backend) deployed on Vercel  
> **Last Updated:** 2026-07-02

---

## 1. Core Philosophy: Where AI Is Used vs Where Math Is Used

| Step | Uses AI? | Why |
| :--- | :--- | :--- |
| PDF text extraction (clean PDFs) | **No** | `pdfplumber` handles selectable-text PDFs reliably |
| Scanned PDF / Image extraction | **YES** | `Gemini Vision` reads page images directly — no Tesseract needed |
| **OCR cleanup & question normalization** | **YES — critical** | Raw OCR is unusable garbage without this (`multi O pl Ric ation` → `multiplication`) |
| **Structured question extraction** | **YES** | Gemini Flash parses cleaned text into `{question, marks, unit}` JSON |
| Topic canonicalization | **No** | Keyword mapping to canonical Topic Pillars (`[Topic: TCP Handshake]`) |
| Clustering duplicates | **No** | TF-IDF cosine similarity + optional Gemini semantic verification for ambiguous scores |
| Priority ranking | **No** | Pure math: `repetition × 2.5 + teacher_flagged × 15.0 + recency + exam_scope` |
| **Mock paper generation** | **YES — critical** | Templates always produce generic garbage; AI generates professor-quality questions from ranked topics |
| **Answer generation** | **YES — critical** | Mark-scaled, rubric-grounded responses — the feature students open the app for |
| **Memory cheat sheets** | **YES** | AI-generated comparison tables, keyword dumps |
| **Skip/Must Study reasoning** | **YES** | The explanation ("appeared 6× + teacher hint + gap year = 87% likely") builds trust |

**Design Rule:** AI is deployed precisely on the steps that the student actually sees. Gemini Flash is free. Math handles clustering and ranking. AI handles everything the user reads.

---

## 2. Pipeline Architecture (End-to-End Data Flow)

```
Student uploads PYQ PDF / Blackboard Photo / WhatsApp Image
                    ↓
    ┌─── Clean text PDF? ───────────────────────────────────┐
    │   pdfplumber extracts text (no API call)               │
    │   → clean_raw_text_with_ai() normalizes via Gemini     │
    └───────────────────────────────────────────────────────┘
    ┌─── Scanned PDF? ─────────────────────────────────────┐
    │   PyMuPDF converts pages → PNG images                  │
    │   → Gemini Vision reads images directly                │
    └───────────────────────────────────────────────────────┘
    ┌─── Image file (.jpg/.png)? ──────────────────────────┐
    │   → Gemini Vision reads image directly                 │
    └───────────────────────────────────────────────────────┘
                    ↓
    extract_structured_questions()        ← GEMINI FLASH
      Returns [{question_text, marks, unit}]
                    ↓
    normalize_question_to_topic()         ← Keyword mapping (no AI)
      Maps to canonical Topic Pillars
                    ↓
    find_or_create_cluster()              ← TF-IDF cosine similarity
      Groups duplicates, updates repetition counts
      Ambiguous scores (0.45–0.82) verified by Gemini
                    ↓
    recompute_priority_scores()           ← Pure math
      repetition × 2.5 + teacher + recency + exam_scope
                    ↓
    ════════════════════════════════════════════════════════
    Student clicks "Mock Paper"
                    ↓
    generate_mock_paper_with_ai()         ← GEMINI FLASH (PRIMARY)
      Takes ranked topics → generates realistic paper
      Domain-aware template only fires if AI fails
                    ↓
    Student clicks "Model Key" on a question
                    ↓
    generate_grounded_answer()            ← GEMINI FLASH
      Mark-scaled answer grounded in student's uploaded notes
```

---

## 3. The 3 Critical AI Functions in `llm.py`

### `clean_raw_text_with_ai(raw_text, subject)`
- **When:** Called by `extractor.py` after pdfplumber succeeds on text PDFs
- **What:** Removes college headers, roll number fields, page numbers leaked into questions, fixes broken OCR words
- **Before:** `"CMR INSTITUTE OF TECHNOLOGY: HYDERABAD Explain about Strassen's matrix multi O pl Ric ation with an 23,12"`
- **After:** `"Explain Strassen's Matrix Multiplication algorithm with an example. (10M) [Unit 2]"`

### `generate_mock_paper_with_ai(subject, exam_type, ranked_topics)`
- **When:** PRIMARY path in `/generate-mock-paper` — templates are the fallback, not the default
- **What:** Takes actual ranked topics from the database, generates Part A (SAQs) + Part B (OR pairs) with real subject terminology
- **Rule:** Never writes placeholders like "Analyze performance metrics in Unit X"

### `generate_grounded_answer(question_text, marks, exam_type, notes_chunks)`
- **When:** Called by `/generate-answer` endpoint
- **What:** Mark-scaled answer generation:
  - ≤3M → Crisp definition with bolded keywords
  - 4-6M → Definition + structured bullets + diagram
  - ≥8M → Full essay: Definition → Algorithm → ASCII Diagram → Comparison Table → Conclusion
- **Grounding:** Uses student's uploaded class notes when available

---

## 4. Complete Technology Stack

### Frontend (`/frontend`)
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS — slate/navy dark theme (`#090d16`, `#6366f1` Indigo, `#06b6d4` Cyan, `#f59e0b` Gold)
- **Typography:** Plus Jakarta Sans + IBM Plex Mono
- **Libraries:** `lucide-react` icons, `react-hot-toast` notifications, `react-dropzone` file upload, `react-markdown` rendering

### Backend (`/backend`)
- **Framework:** Python FastAPI with custom CORS middleware + API prefix rewriting
- **Database:** SQLModel (SQLAlchemy 2.0 + Pydantic), SQLite at `/tmp/examiq.db` on Vercel
- **AI Provider:** Google Gemini 1.5 Flash (free tier, no rate limits for demo usage)
- **Document Processing:** `pdfplumber` (text PDFs), `pymupdf` (scanned PDF → image conversion), Gemini Vision (image OCR)
- **ML/Clustering:** Pure Python TF-IDF cosine similarity with trigram hash embeddings (128-dim)

---

## 5. Project Directory Structure

```text
examiq/
├── vercel.json                        # Monorepo Vercel config (frontend + backend routing)
├── current_build.md                   # This file
│
├── backend/
│   ├── .env                           # GEMINI_API_KEY
│   ├── main.py                        # All API routes + middleware + upload pipeline
│   ├── models.py                      # SQLModel schemas: Document, Question, QuestionCluster, NotesChunk
│   ├── requirements.txt               # Python deps (fastapi, pymupdf, google-generativeai, etc.)
│   └── services/
│       ├── extractor.py               # ★ Gemini Vision primary extraction — NO fake data fallbacks
│       ├── llm.py                     # ★ All AI calls: OCR cleanup, mock paper gen, answer gen
│       └── clustering.py              # Topic normalization + TF-IDF cosine clustering + priority math
│
└── frontend/
    ├── package.json
    ├── app/
    │   ├── layout.tsx                 # Root layout
    │   ├── page.tsx                   # Master SPA controller with offline fallback
    │   └── globals.css
    ├── components/
    │   ├── UploadZone.tsx             # Drag-and-drop file upload dashboard
    │   ├── Dashboard.tsx              # Tab switcher + domain-aware offline mock fallback (OS/CN)
    │   ├── QuestionCard.tsx           # Ranked question with Topic Pillar badges & confidence %
    │   ├── MockPaperView.tsx          # University exam paper renderer (Part A + Part B OR pairs)
    │   ├── StrategyPlannerView.tsx    # Time-aware ROI planner (Must Study / Skip buckets)
    │   ├── MemorySheetView.tsx        # AI comparison tables & keyword dumps
    │   └── AnswerEvaluatorModal.tsx   # Practice answer grading against rubric
    └── lib/
        ├── api.ts                     # Fetch wrappers to FastAPI backend
        └── types.ts                   # TypeScript interfaces
```

---

## 6. API Endpoints

| Method | Endpoint | AI? | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/upload` | **YES** | Extracts text (Vision/pdfplumber), AI cleanup, AI question extraction, clustering |
| `GET` | `/important-questions` | No | Returns deduplicated clusters sorted by priority score |
| `POST` | `/generate-answer` | **YES** | Mark-scaled answer grounded in student notes |
| `GET` | `/generate-mock-paper` | **YES** | AI-generated mock paper from ranked topics (template fallback) |
| `GET` | `/strategy-plan` | No | Time-aware ROI study plan with Must/Skip buckets |
| `GET` | `/memory-sheet` | **YES** | AI comparison tables and keyword dumps |
| `POST` | `/evaluate-answer` | **YES** | Grades student practice answers against rubric |
| `POST` | `/seed-demo` | No | Pre-populates CN demo dataset |
| `GET` | `/subjects` | No | Lists active subjects in database |
| `POST` | `/exam-feedback` | No | Student feedback loop: marks which clusters actually appeared |

---

## 7. Deployment

### Vercel Monorepo (Auto-Deploy on Push)
- GitHub repo connected to Vercel → push to `main` triggers auto-deploy
- Frontend: `@vercel/next` builder
- Backend: `@vercel/python` builder
- Routes: Direct API paths (`/upload`, `/important-questions`, etc.) → backend; everything else → frontend

### Environment Variables (Set on Vercel Dashboard)
- `GEMINI_API_KEY` — Google Gemini 1.5 Flash API key (required for all AI features)
- `NEXT_PUBLIC_API_URL` — Set to empty string or `/` for monorepo, or full backend URL if split deployment

### ⚠️ Deployment Watch Items
- **`pymupdf` (19.8 MB)** — New dependency for scanned PDF conversion. Combined with other deps, watch Vercel's 250MB serverless limit. If build fails, can make it optional (extractor already handles `ImportError` gracefully).
- **SQLite `/tmp`** — Resets on cold starts. Seed data disappears between deploys. For persistent storage, migrate to Supabase/Neon (connection string swap in `database.py`).
