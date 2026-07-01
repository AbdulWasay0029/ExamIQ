"""
extractor.py — ExamIQ Document Extraction Engine
Primary path: Gemini Vision for images + scanned PDFs
Secondary path: pdfplumber for clean text PDFs (faster, no API call)
NO fake data fallbacks. Ever.
"""

import io
import os
import base64
from typing import Optional

try:
    import pdfplumber
except ImportError:
    pdfplumber = None


def _is_text_clean(text: str) -> bool:
    """Check if extracted text looks like real content vs OCR garbage."""
    if not text or len(text.strip()) < 30:
        return False
    # If more than 40% is non-ASCII, it's garbage
    non_ascii = sum(1 for c in text if ord(c) > 127)
    if non_ascii / len(text) > 0.4:
        return False
    # If it has real words (at least 5 words longer than 3 chars), it's okay
    real_words = [w for w in text.split() if len(w) > 3 and w.isalpha()]
    return len(real_words) >= 5


def _extract_pdf_with_pdfplumber(file_bytes: bytes) -> Optional[str]:
    """Try extracting text from a clean (non-scanned) PDF."""
    if not pdfplumber:
        return None
    try:
        parts = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    parts.append(page_text)
        result = "\n\n".join(parts).strip()
        return result if _is_text_clean(result) else None
    except Exception as e:
        print(f"[Extractor] pdfplumber failed: {e}")
        return None


def _pdf_pages_to_base64_images(file_bytes: bytes) -> list[str]:
    """Convert PDF pages to base64 PNG images for Gemini Vision."""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        images = []
        for page in doc:
            # Render at 2x resolution for better OCR accuracy
            mat = fitz.Matrix(2.0, 2.0)
            pix = page.get_pixmap(matrix=mat)
            img_bytes = pix.tobytes("png")
            images.append(base64.b64encode(img_bytes).decode("utf-8"))
        doc.close()
        return images
    except ImportError:
        print("[Extractor] PyMuPDF (fitz) not installed. Install with: pip install pymupdf")
        return []
    except Exception as e:
        print(f"[Extractor] PDF to image conversion failed: {e}")
        return []


def _extract_with_gemini_vision(
    image_b64_list: list[str],
    subject: str,
    filename: str
) -> Optional[str]:
    """Send image(s) to Gemini Vision and get clean extracted text back."""
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        print("[Extractor] No GEMINI_API_KEY found in environment.")
        return None

    try:
        import google.generativeai as genai
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = (
            f"This is an image of a university exam document for the subject: {subject}.\n"
            "Please extract ALL the exam questions you can see in this image.\n\n"
            "Instructions:\n"
            "1. Extract every question exactly as written, correcting any OCR/scan distortion\n"
            "2. Remove: college headers, roll number fields, instruction lines, page numbers\n"
            "3. Fix broken words caused by poor scan quality\n"
            "4. Preserve mark allocations if visible (e.g. 10M, 5 Marks, 2 marks)\n"
            "5. Preserve unit references if visible (e.g. Unit 2, UNIT-3)\n\n"
            "Return ONLY the clean questions, one per line, in this format:\n"
            "QUESTION: <question text> | MARKS: <number> | UNIT: <number>\n\n"
            "If marks or unit are not visible, make your best estimate based on question complexity.\n"
            "Do not add any preamble or explanation. Just the questions."
        )

        # Build content parts — text prompt + all page images
        content_parts = [prompt]
        for b64 in image_b64_list[:8]:  # Cap at 8 pages to avoid token limits
            content_parts.append({
                "inline_data": {
                    "mime_type": "image/png",
                    "data": b64
                }
            })

        response = model.generate_content(content_parts)
        extracted = response.text.strip()

        if not extracted or len(extracted) < 20:
            print(f"[Extractor] Gemini Vision returned empty response for {filename}")
            return None

        print(f"[Extractor] Gemini Vision extracted {len(extracted.splitlines())} lines from {filename}")
        return extracted

    except Exception as e:
        print(f"[Extractor] Gemini Vision failed for {filename}: {e}")
        return None


def _image_bytes_to_base64(file_bytes: bytes, filename: str) -> Optional[str]:
    """Convert image file bytes to base64 string."""
    try:
        return base64.b64encode(file_bytes).decode("utf-8")
    except Exception as e:
        print(f"[Extractor] Failed to encode image {filename}: {e}")
        return None


def extract_text_from_file(file_bytes: bytes, filename: str, subject: str) -> str:
    """
    Main extraction entry point. Returns clean text for downstream processing.
    
    Strategy:
    1. Plain text files (.txt, .md) → decode directly
    2. Clean PDFs (selectable text) → pdfplumber, then AI cleanup
    3. Scanned/image PDFs → convert pages to images → Gemini Vision
    4. Image files (.jpg, .png) → Gemini Vision directly
    
    NEVER returns fake hardcoded data. Returns empty string if all paths fail,
    which the pipeline should handle gracefully.
    """
    ext = os.path.splitext(filename.lower())[1]
    print(f"[Extractor] Processing {filename} (subject: {subject})")

    # ── Path 1: Plain text files ────────────────────────────────────────────
    if ext in [".txt", ".md", ".json"]:
        try:
            text = file_bytes.decode("utf-8", errors="ignore").strip()
            if text:
                print(f"[Extractor] Plain text extracted: {len(text)} chars")
                return text
        except Exception as e:
            print(f"[Extractor] Text decode failed: {e}")
        return ""

    # ── Path 2: PDF files ───────────────────────────────────────────────────
    if ext == ".pdf":
        # Try pdfplumber first (fast, no API call, works on text PDFs)
        clean_text = _extract_pdf_with_pdfplumber(file_bytes)
        if clean_text:
            print(f"[Extractor] pdfplumber succeeded: {len(clean_text)} chars")
            # Still run AI cleanup to normalize OCR artifacts and question format
            from services.llm import llm_service
            cleaned = llm_service.clean_raw_text_with_ai(clean_text, subject)
            return cleaned if cleaned else clean_text

        # pdfplumber got nothing useful → scanned PDF → convert to images → Gemini Vision
        print(f"[Extractor] pdfplumber got no clean text. Converting PDF pages to images for Gemini Vision...")
        page_images = _pdf_pages_to_base64_images(file_bytes)

        if page_images:
            vision_text = _extract_with_gemini_vision(page_images, subject, filename)
            if vision_text:
                return vision_text
        else:
            print(f"[Extractor] Could not convert PDF pages to images. Install PyMuPDF: pip install pymupdf")

        # Nothing worked
        print(f"[Extractor] WARNING: Could not extract text from PDF {filename}. Returning empty.")
        return ""

    # ── Path 3: Image files (.jpg, .png, .jpeg, .webp) ─────────────────────
    if ext in [".jpg", ".jpeg", ".png", ".webp", ".bmp"]:
        print(f"[Extractor] Image file detected. Sending to Gemini Vision...")
        b64 = _image_bytes_to_base64(file_bytes, filename)
        if b64:
            vision_text = _extract_with_gemini_vision([b64], subject, filename)
            if vision_text:
                return vision_text

        print(f"[Extractor] WARNING: Could not extract text from image {filename}. Returning empty.")
        return ""

    # ── Unsupported format ──────────────────────────────────────────────────
    print(f"[Extractor] Unsupported file format: {ext}")
    return ""
