import {
  FileItem,
  QuestionCluster,
  AnswerResponse,
  MockPaperData,
  StrategyPlan,
  MemorySheetUnit,
  EvalResponse,
  ExamMode,
} from './types';

function getApiUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (envUrl && envUrl !== "http://localhost:8000") {
    return envUrl;
  }
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return "/api";
  }
  return "http://localhost:8000";
}

const API_URL = getApiUrl();

export async function uploadFile(fileItem: FileItem, subject: string): Promise<Record<string, unknown>> {
  const formData = new FormData();
  formData.append('file', fileItem.file);
  formData.append('subject', subject);
  formData.append('source_type', fileItem.sourceType);
  if (fileItem.year) {
    formData.append('year', fileItem.year);
  }
  formData.append('teacher_flagged', String(fileItem.starred));

  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Upload failed for ${fileItem.name}`);
  }
  return res.json();
}

export async function fetchImportantQuestions(
  subject: string,
  examType: string,
  unit?: number
): Promise<QuestionCluster[]> {
  const params = new URLSearchParams({
    subject,
    exam_type: examType,
  });
  if (unit && unit > 0) {
    params.append('unit', String(unit));
  }

  const res = await fetch(`${API_URL}/important-questions?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch important questions');
  }
  return res.json();
}

export async function generateAnswer(
  clusterId: number,
  examType: string,
  marks: number
): Promise<AnswerResponse> {
  const res = await fetch(`${API_URL}/generate-answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cluster_id: clusterId,
      exam_type: examType,
      marks: marks,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to generate answer');
  }
  return res.json();
}

export async function fetchMockPaper(
  subject: string,
  examType: ExamMode,
  patternMode = 'auto'
): Promise<MockPaperData> {
  const params = new URLSearchParams({
    subject,
    exam_type: examType,
    pattern_mode: patternMode,
  });
  const res = await fetch(`${API_URL}/generate-mock-paper?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch mock paper');
  }
  return res.json();
}

export async function fetchStrategyPlan(
  subject: string,
  examType: ExamMode,
  timeLeftHours = 24
): Promise<StrategyPlan> {
  const params = new URLSearchParams({
    subject,
    exam_type: examType,
    time_left_hours: String(timeLeftHours),
  });
  const res = await fetch(`${API_URL}/strategy-plan?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch strategy plan');
  }
  return res.json();
}

export async function fetchMemorySheet(subject: string): Promise<MemorySheetUnit[]> {
  const params = new URLSearchParams({ subject });
  const res = await fetch(`${API_URL}/memory-sheet?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch memory sheet');
  }
  const data = await res.json();
  return data.sheets || [];
}

export async function evaluateAnswerAttempt(
  questionText: string,
  studentAnswer: string,
  maxMarks: number
): Promise<EvalResponse> {
  const res = await fetch(`${API_URL}/evaluate-answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question_text: questionText,
      student_answer: studentAnswer,
      max_marks: maxMarks,
    }),
  });
  if (!res.ok) {
    throw new Error('Failed to evaluate answer attempt');
  }
  return res.json();
}

export async function seedDemoData(): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_URL}/seed-demo`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error('Failed to seed demo data');
  }
  return res.json();
}
