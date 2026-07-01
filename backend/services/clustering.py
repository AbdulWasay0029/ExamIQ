import math
from typing import List
from datetime import datetime
from sqlmodel import Session, select
from models import Question, QuestionCluster

try:
    from sentence_transformers import SentenceTransformer
    embedder = SentenceTransformer("all-MiniLM-L6-v2")
except Exception as e:
    print(f"[Clustering] sentence-transformers not available ({e}). Using pure Python hash embeddings.")
    embedder = None

from services.llm import llm_service


def compute_cosine_sim(vec1: List[float], vec2: List[float]) -> float:
    if not vec1 or not vec2 or len(vec1) != len(vec2):
        return 0.0
    dot = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = math.sqrt(sum(a * a for a in vec1))
    norm2 = math.sqrt(sum(b * b for b in vec2))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)


def embed_text(text: str) -> List[float]:
    if embedder:
        try:
            vec = embedder.encode(text)
            return [float(x) for x in vec]
        except Exception:
            pass
    # Fast lightweight pure Python character trigram hashing (128-dim)
    dim = 128
    vec = [0.0] * dim
    clean = text.lower().strip()
    for i in range(max(1, len(clean) - 2)):
        trigram = clean[i:i+3]
        h = hash(trigram) % dim
        vec[h] += 1.0
    norm = math.sqrt(sum(x * x for x in vec))
    if norm > 0:
        vec = [x / norm for x in vec]
    return vec


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


import re

def normalize_question_to_topic(text: str, subject: str) -> str:
    # 1. Strip OCR garbage headers, college names, trailing page numbers
    clean = re.sub(r"^(CMR|JNTU|ANNA|VTU|BITS|IIT|NIT|HYDERABAD|INSTITUTE|COLLEGE|EXAM|QUESTION|PAPER).*?:?\s*", "", text, flags=re.I)
    clean = re.sub(r"^[a-z]([A-Z])", r"\1", clean)
    clean = re.sub(r"\b\d+,\s*\d+(,\s*\d+)*\s*$", "", clean).strip()
    
    lower = clean.lower()
    
    # Computer Networks Topics
    if any(w in lower for w in ["handshake", "3-way", "syn", "establishment", "connection-oriented"]):
        return "[Topic: TCP Connection Handshake] Explain the 3-way handshake mechanism and sequence synchronization."
    if any(w in lower for w in ["osi", "reference model", "7 layers", "iso-osi", "sketch osi"]):
        return "[Topic: OSI 7-Layer Model] Detail the OSI reference model architecture and individual layer responsibilities."
    if any(w in lower for w in ["dns", "domain name", "iterative", "recursive"]):
        return "[Topic: DNS Resolution Mechanics] Explain iterative vs. recursive Domain Name System (DNS) query resolution."
    if any(w in lower for w in ["subnet", "cidr", "vlsm", "masking", "classless"]):
        return "[Topic: Subnetting & CIDR] Illustrate Classless Inter-Domain Routing (CIDR) address blocks and subnet masking."
    if any(w in lower for w in ["dijkstra", "link state", "lsr", "shortest path"]):
        return "[Topic: Link State Routing] Explain Dijkstra's shortest path Link State Routing (LSR) algorithm."
    if any(w in lower for w in ["distance vector", "dvr", "bellman", "count-to-infinity", "count to infinity"]):
        return "[Topic: Distance Vector Routing] Detail Bellman-Ford routing updates and the count-to-infinity problem."
    if any(w in lower for w in ["arq", "sliding window", "go-back-n", "selective repeat"]):
        return "[Topic: Sliding Window ARQ] Compare Go-Back-N and Selective Repeat ARQ flow control protocols."
    if any(w in lower for w in ["csma", "collision", "ethernet", "carrier sense"]):
        return "[Topic: CSMA/CD Access Control] Explain Carrier Sense Multiple Access with Collision Detection in Ethernet."
    if any(w in lower for w in ["ipv4", "ipv6", "packet header"]):
        return "[Topic: IP Header Architecture] Compare IPv4 and IPv6 packet header formats and key structural improvements."
    if any(w in lower for w in ["http", "multiplexing", "pipelining", "www"]):
        return "[Topic: Application Layer Protocols] Write short notes on HTTP/2 multiplexing vs HTTP/1.1 pipelining."
        
    # Operating Systems Topics
    if any(w in lower for w in ["semaphore", "mutex", "critical section", "synchronization"]):
        return "[Topic: Process Synchronization] Define binary semaphores and solve the critical section synchronization problem."
    if any(w in lower for w in ["deadlock", "banker", "coffman"]):
        return "[Topic: Deadlock Management] State the 4 Coffman conditions for deadlock and explain Banker's algorithm."
    if any(w in lower for w in ["page replacement", "lru", "fifo", "optimal page"]):
        return "[Topic: Page Replacement Policies] Compare FIFO, LRU, and Optimal virtual memory page replacement algorithms."
    if any(w in lower for w in ["scheduling", "round robin", "sjf", "fcfs"]):
        return "[Topic: CPU Scheduling] Explain preemptive vs. non-preemptive CPU scheduling algorithms with Gantt charts."
        
    # DAA / Algorithms Topics
    if any(w in lower for w in ["strassen", "matrix multi"]):
        return "[Topic: Strassen's Matrix Multiplication] Derive the recurrence relation and time complexity of Strassen's algorithm."
    if any(w in lower for w in ["little oh", "big-o", "asymptotic", "space complexity"]):
        return "[Topic: Asymptotic Notations] Define Big-O, Omega, Theta, and Little-o bounding notations with examples."
    if any(w in lower for w in ["articulation", "biconnected"]):
        return "[Topic: Graph Articulation Points] Define articulation points in biconnected components using DFS tree analysis."

    return clean if len(clean) > 10 else text


def find_or_create_cluster(
    session: Session, new_question: Question, subject: str, threshold: float = 0.82
) -> int:
    # Topic-First Normalization
    normalized_title = normalize_question_to_topic(new_question.question_text, subject)
    new_question.question_text = normalized_title
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
            score = compute_cosine_sim(q_embedding, c_embedding)
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
