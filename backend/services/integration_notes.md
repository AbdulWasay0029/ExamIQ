# Integration Notes — What to change in main.py

## 1. Replace the import

Old (in main.py or wherever upload is handled):
```python
from extractor import extract_text_from_file
# OR
from services.ingestion import extract_text_from_file
```

New:
```python
from services.extractor import extract_text_from_file
```

## 2. In your /upload endpoint

The upload endpoint should look like this — make sure it's calling 
extract_text_from_file AND then llm_service.extract_structured_questions:

```python
@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    subject: str = Form(...),
    source_type: str = Form("pyq"),
    year: Optional[int] = Form(None),
    teacher_flagged: bool = Form(False),
    db: Session = Depends(get_session)
):
    file_bytes = await file.read()
    
    # Step 1: Extract raw text (pdfplumber or Gemini Vision)
    raw_text = extract_text_from_file(file_bytes, file.filename, subject)
    
    if not raw_text or len(raw_text.strip()) < 10:
        raise HTTPException(
            status_code=422, 
            detail=f"Could not extract any text from {file.filename}. "
                   "Ensure the file is a readable PDF, image, or text file."
        )
    
    # Step 2: Save document record
    doc = Document(
        subject=subject,
        source_type=source_type,
        year=year,
        original_filename=file.filename,
        raw_text=raw_text
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    # Step 3: Extract structured questions via AI
    structured_questions = llm_service.extract_structured_questions(raw_text, subject)
    
    questions_saved = 0
    for q_data in structured_questions:
        q_text = q_data.get("question_text", "").strip()
        if not q_text or len(q_text) < 10:
            continue
        
        question = Question(
            document_id=doc.id,
            question_text=q_text,
            marks=q_data.get("marks", 5),
            unit=q_data.get("unit", 1),
            source_type=source_type,
            teacher_flagged=teacher_flagged
        )
        db.add(question)
        db.commit()
        db.refresh(question)
        
        # Step 4: Cluster this question
        cluster_id = find_or_create_cluster(db, question, subject)
        question.cluster_id = cluster_id
        db.add(question)
        db.commit()
        questions_saved += 1
    
    # Step 5: Recompute priority scores for this subject
    recompute_priority_scores(db, subject)
    
    return {
        "status": "success",
        "document_id": doc.id,
        "questions_extracted": questions_saved,
        "raw_text_length": len(raw_text)
    }
```

## 3. Install PyMuPDF if not already installed

```bash
pip install pymupdf
```

This is required for converting scanned PDF pages to images for Gemini Vision.
Add it to requirements.txt:
```
pymupdf>=1.23.0
```

## 4. Fix the dead code in llm.py

In llm.py, the `verify_semantic_match` method has a `return` statement,
but there's a giant dead code block after it that never runs (the markdown 
template generator). Delete everything from the line:

    # Intelligent Markdown Template Generation

...all the way to the end of the file (but keep `llm_service = LLMService()`).

## 5. Fix the memory cheat sheets subject bug

The CN seeded data showing for OS is because somewhere the seed endpoint 
hardcodes CN topics regardless of the current subject. 
Find your /seed-demo endpoint in main.py and make sure it takes a `subject`
parameter and generates subject-appropriate content, or just delete the seed 
endpoint entirely now that the real pipeline works.
```
