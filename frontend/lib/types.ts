export type SourceType = 'PYQ' | 'Notes' | 'Teacher Hint' | 'Syllabus' | 'Friend Photo';

export type ExamMode = 'Mid 1' | 'Mid 2' | 'Semester';

export interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  sourceType: SourceType;
  year?: string;
  starred: boolean;
}

export interface QuestionCluster {
  cluster_id: number;
  canonical_text: string;
  unit: number;
  marks: number;
  repetition_count: number;
  teacher_flagged: boolean;
  priority_score: number;
}

export interface AnswerResponse {
  answer_text: string;
  grounded_in_notes: boolean;
}

export interface MockPaperQuestion {
  id: number;
  q_num: string;
  text: string;
  unit: number;
  marks: number;
}

export interface MockPaperSection {
  unit: number;
  unit_label: string;
  q_option_1: MockPaperQuestion;
  q_option_2: MockPaperQuestion;
}

export interface MockPaperData {
  status: string;
  subject: string;
  exam_type: ExamMode;
  paper_title: string;
  detected_pattern: string;
  time_allowed: string;
  max_marks: number;
  part_a: {
    title: string;
    questions: MockPaperQuestion[];
  };
  part_b: {
    title: string;
    sections: MockPaperSection[];
  };
}

export interface StrategyItem {
  cluster_id: number;
  text: string;
  unit: number;
  marks: number;
  repetition_count: number;
  teacher_flagged: boolean;
  priority_score: number;
  prep_time_mins: number;
  roi_score: number;
  confidence_pct: number;
  confidence_reasons: string;
  skip_reason?: string;
}

export interface UnitRoi {
  unit: number;
  total_marks: number;
  q_count: number;
  prep_mins: number;
  roi: number;
}

export interface StrategyPlan {
  status: string;
  subject: string;
  exam_type: ExamMode;
  time_left_hours: number;
  must_study: StrategyItem[];
  optional: StrategyItem[];
  skip: StrategyItem[];
  unit_roi_ranking: UnitRoi[];
  progress_metrics: {
    attempt_coverage_pct: number;
    likely_score_range: string;
    total_study_time_hrs: number;
  };
}

export interface MemorySheetUnit {
  unit: number;
  title: string;
  comparison_table: {
    concept: string;
    core_mechanism: string;
    key_metric: string;
  }[];
  keywords_dump: string;
}

export interface EvalResponse {
  status: string;
  estimated_score: number;
  max_marks: number;
  percentage: number;
  strengths: string[];
  missing_elements: string[];
  evaluator_verdict: string;
}
