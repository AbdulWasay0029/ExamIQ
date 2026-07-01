import numpy as np
from typing import List
from datetime import datetime
from sqlmodel import Session, select
from models import Question, QuestionCluster

try:
    from sentence_transformers import SentenceTransformer

    embedder = SentenceTransformer("all-MiniLM-L6-v2")
except Exception as e:
    print(
        f"[Clustering] sentence-transformers not available or still downloading ({e}). Using robust TF-IDF hash embeddings."
    )
    embedder = None

from sklearn.feature_extraction.text import HashingVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from services.llm import llm_service

# Hashing vectorizer produces fixed-size deterministic embeddings without needing fitting
hashing_vectorizer = HashingVectorizer(n_features=128, norm="l2", analyzer="char_wb", ngram_range=(3, 5))


def embed_text(text: str) -> List[float]:
    if embedder:
        try:
            vec = embedder.encode(text)
            return [float(x) for x in vec]
        except Exception:
            pass
    # Fast deterministic character trigram vector
    vec = hashing_vectorizer.transform([text.lower()]).toarray()[0]
    return [float(x) for x in vec]


def detect_question_type(text: str) -> str:
    lower = text.lower()
    if any(w in lower for w in ["compare", "differentiate", "distinguish", "vs", "difference between"]):
        return "Compare"
    if any(w in lower for w in ["draw", "construct", "diagram", "sketch", "architecture of", "block diagram"]):
        return "Construct/Draw"
    if any(w in lower for w in ["calculate", "compute", "find the", "solve", "determine the value"]):
        return "Compute"
    if any(w in lower for w in ["prove", "show that", "derive"]):
        return "Prove"
    if any(w in lower for w in ["define", "what is", "state the", "list the"]):
        return "Define"
    return "Explain"


def find_or_create_cluster(
    session: Session, new_question: Question, subject: str, threshold: float = 0.82
) -> int:
    q_embedding = new_question.get_embedding()
    if not q_embedding:
        q_embedding = embed_text(new_question.question_text)
        new_question.set_embedding(q_embedding)

    existing_clusters = session.exec(
        select(QuestionCluster).where(QuestionCluster.subject == subject)
    ).all()

    best_match = None
    best_score = -1.0

    for cluster in existing_clusters:
        c_embedding = cluster.get_embedding()
        if c_embedding:
            score = cosine_similarity([q_embedding], [c_embedding])[0][0]
            if score > best_score:
                best_score = score
                best_match = cluster

    is_teacher = new_question.source_type.lower() in [
        "teacher_hint",
        "teacher hint",
        "teacher_flagged",
    ]

    q_type = detect_question_type(new_question.question_text)

    is_matched = False
    if best_match:
        if best_score >= threshold:
            is_matched = True
        elif 0.45 <= best_score < threshold:
            print(f"[Clustering] Ambiguous score {best_score:.2f} for '{new_question.question_text[:30]}...'. Calling Gemini verification...")
            if llm_service.verify_semantic_match(new_question.question_text, best_match.canonical_text):
                is_matched = True
                print("[Clustering] Gemini verified semantic match!")

    if best_match and is_matched:
        best_match.repetition_count += 1
        if is_teacher:
            best_match.teacher_flagged = True
        # Rolling average marks
        q_marks = float(new_question.marks or 5.0)
        best_match.avg_marks = (
            best_match.avg_marks * (best_match.repetition_count - 1) + q_marks
        ) / best_match.repetition_count
        if not best_match.unit and new_question.unit:
            best_match.unit = new_question.unit
        best_match.question_type = q_type
        session.add(best_match)
        session.commit()
        session.refresh(best_match)
        return best_match.id
    else:
        new_cluster = QuestionCluster(
            canonical_text=new_question.question_text,
            unit=new_question.unit or 1,
            repetition_count=1,
            teacher_flagged=is_teacher,
            avg_marks=float(new_question.marks or 5.0),
            priority_score=0.0,
            subject=subject,
            question_type=q_type,
            years_appeared_json="[2024, 2023]",
            confidence_pct=85,
        )
        new_cluster.set_embedding(q_embedding)
        session.add(new_cluster)
        session.commit()
        session.refresh(new_cluster)
        return new_cluster.id


def recompute_priority_scores(
    session: Session, subject: str, exam_type: str = "Mid Exam"
):
    current_year = datetime.now().year
    clusters = session.exec(
        select(QuestionCluster).where(QuestionCluster.subject == subject)
    ).all()
    for cluster in clusters:
        # 1. Repetition base score
        rep_score = cluster.repetition_count * 2.5
        
        # 2. Teacher Hint boost (+15.0)
        flag_score = 15.0 if cluster.teacher_flagged else 0.0
        
        # 3. Recency Weighting Boost (User request #5)
        years = cluster.get_years()
        recency_boost = sum([
            2.0 if y >= current_year - 2 else (1.0 if y >= current_year - 4 else 0.5)
            for y in years
        ]) * 2.0
        
        # 4. Confirmed Appeared Student Feedback loop boost (User request #9)
        feedback_boost = cluster.confirmed_appeared * 5.0

        # 5. Mark weighting
        mark_score = cluster.avg_marks * 0.5

        # 6. Syllabus Scope Targeting (Mid 1 vs. Mid 2 vs. Semester)
        exam_boost = 0.0
        unit = cluster.unit or 1
        exam_mode = exam_type.strip().lower()
        if "1" in exam_mode or "mid 1" in exam_mode:
            # Mid 1 covers Units 1, 2, and first half of Unit 3
            if unit in [1, 2]:
                exam_boost = 12.0
            elif unit == 3:
                exam_boost = 4.0
            else:
                exam_boost = -20.0
        elif "2" in exam_mode or "mid 2" in exam_mode:
            # Mid 2 covers second half of Unit 3, and Units 4, 5
            if unit in [4, 5]:
                exam_boost = 12.0
            elif unit == 3:
                exam_boost = 4.0
            else:
                exam_boost = -20.0
        else:
            # Semester exam rewards full syllabus weighting across all 5 units
            exam_boost = 5.0

        cluster.priority_score = round(max(0.0, rep_score + flag_score + recency_boost + feedback_boost + mark_score + exam_boost), 1)

        # Calculate Prediction Confidence Score (%)
        conf = 60
        if cluster.repetition_count >= 3:
            conf += 18
        elif cluster.repetition_count == 2:
            conf += 10
        if cluster.teacher_flagged:
            conf += 15
        if any(y >= current_year - 2 for y in years):
            conf += 10
        if cluster.confirmed_appeared > 0:
            conf += 10
        cluster.confidence_pct = min(99, max(40, conf))

        session.add(cluster)
    session.commit()
