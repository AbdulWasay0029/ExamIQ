import json
from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, create_engine, Session


class Document(SQLModel, table=True):
    __tablename__ = "documents"

    id: Optional[int] = Field(default=None, primary_key=True)
    subject: str = Field(index=True)
    source_type: str  # 'pyq', 'notes', 'teacher_hint', 'syllabus', 'friend_photo'
    year: Optional[int] = None
    original_filename: Optional[str] = None
    raw_text: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class QuestionCluster(SQLModel, table=True):
    __tablename__ = "question_clusters"

    id: Optional[int] = Field(default=None, primary_key=True)
    canonical_text: str
    unit: Optional[int] = Field(default=None, index=True)
    repetition_count: int = Field(default=1)
    teacher_flagged: bool = Field(default=False)
    avg_marks: float = Field(default=5.0)
    priority_score: float = Field(default=0.0, index=True)
    subject: str = Field(index=True)
    years_appeared_json: Optional[str] = Field(default="[2024, 2023]")
    question_type: str = Field(default="Explain")  # Define, Explain, Construct/Draw, Compare, Prove, Compute
    confidence_pct: int = Field(default=85)
    confirmed_appeared: int = Field(default=0)
    representative_embedding: Optional[str] = None  # JSON serialized float list

    def get_years(self) -> List[int]:
        if not self.years_appeared_json:
            return [2024]
        try:
            return json.loads(self.years_appeared_json)
        except Exception:
            return [2024]

    def set_years(self, years: List[int]):
        self.years_appeared_json = json.dumps(list(set(years)))

    def get_embedding(self) -> Optional[List[float]]:
        if not self.representative_embedding:
            return None
        return json.loads(self.representative_embedding)

    def set_embedding(self, vec: List[float]):
        self.representative_embedding = json.dumps([float(x) for x in vec])


class Question(SQLModel, table=True):
    __tablename__ = "questions"

    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: Optional[int] = Field(default=None, foreign_key="documents.id")
    question_text: str
    marks: Optional[int] = None
    unit: Optional[int] = None
    source_type: str
    embedding: Optional[str] = None  # JSON serialized float list
    cluster_id: Optional[int] = Field(default=None, foreign_key="question_clusters.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    def get_embedding(self) -> Optional[List[float]]:
        if not self.embedding:
            return None
        return json.loads(self.embedding)

    def set_embedding(self, vec: List[float]):
        self.embedding = json.dumps([float(x) for x in vec])


class NotesChunk(SQLModel, table=True):
    __tablename__ = "notes_chunks"

    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: Optional[int] = Field(default=None, foreign_key="documents.id")
    chunk_text: str
    unit: Optional[int] = Field(default=None, index=True)
    embedding: Optional[str] = None  # JSON serialized float list
    subject: str = Field(index=True)

    def get_embedding(self) -> Optional[List[float]]:
        if not self.embedding:
            return None
        return json.loads(self.embedding)

    def set_embedding(self, vec: List[float]):
        self.embedding = json.dumps([float(x) for x in vec])


# Engine initialization
DATABASE_URL = "sqlite:///./examiq.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


def init_db():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
