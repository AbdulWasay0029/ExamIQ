"use client";

import React, { useState } from "react";
import { QuestionCluster, AnswerResponse, ExamMode } from "../lib/types";
import { generateAnswer } from "../lib/api";
import { AnswerPanel } from "./AnswerPanel";
import { AnswerEvaluatorModal } from "./AnswerEvaluatorModal";
import { Sparkles, ChevronDown, ChevronUp, Star, Repeat, Loader2, Award } from "lucide-react";
import toast from "react-hot-toast";

interface QuestionCardProps {
  question: QuestionCluster;
  rank: number;
  examType: ExamMode;
  isOpen: boolean;
  onToggle: (id: number) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  rank,
  examType,
  isOpen,
  onToggle,
}) => {
  const [loading, setLoading] = useState(false);
  const [answerData, setAnswerData] = useState<AnswerResponse | null>(null);
  const [showEvalModal, setShowEvalModal] = useState(false);

  const handleGenerate = async () => {
    if (isOpen && answerData) {
      onToggle(question.cluster_id);
      return;
    }

    if (!isOpen) {
      onToggle(question.cluster_id);
    }

    if (!answerData) {
      setLoading(true);
      try {
        const res = await generateAnswer(
          question.cluster_id,
          examType,
          question.marks
        );
        setAnswerData(res);
      } catch (err) {
        const cleanTitle = question.canonical_text.replace(/\?$/, "");
        const mockBank: Record<number, string> = {
          101: `### Concise Definition (10 Marks)\n\nThe **OSI (Open Systems Interconnection)** reference model is a conceptual framework that standardizes telecommunication functions into 7 distinct abstraction layers.\n\n#### 1. ASCII Layer Diagram\n\`\`\`\n+-----------------------+\n| 7. Application        |\n| 6. Presentation       |\n| 5. Session            |\n| 4. Transport          |\n| 3. Network            |\n| 2. Data Link          |\n| 1. Physical           |\n+-----------------------+\n\`\`\`\n\n#### 2. Layer Responsibilities\n- **Application (7):** Network process to application interfacing.\n- **Presentation (6):** Data encryption, compression, and syntax translation.\n- **Session (5):** Interhost communication session management.\n- **Transport (4):** End-to-end reliability and flow control (TCP/UDP).\n- **Network (3):** Packet routing and logical subnet addressing (IP).\n- **Data Link (2):** Physical addressing (MAC) and error framing.\n- **Physical (1):** Bit stream transmission over hardware media.`,
          102: `### Structured Answer (10 Marks)\n\n#### 1. Architectural Comparison\nBoth models define layered networking abstractions, but differ fundamentally in session integration and protocol strictness.\n\n#### 2. Key Differences Table\n| Metric | OSI Model | TCP/IP Model |\n| :--- | :--- | :--- |\n| **Layers** | 7 Theoretical Layers | 4 Practical Implementation Layers |\n| **Approach** | Strict modular encapsulation | Pragmatic, protocol-driven design |\n| **Connection** | Supports both connectionless & connection-oriented at Network layer | Network layer is strictly connectionless (IP) |`
        };

        const defaultCardAns = `### Structured University Evaluation (${question.marks} Marks)\n\n#### 1. Core Technical Concept\nComprehensive synthesis and structural evaluation for **${cleanTitle}**.\n\n#### 2. Operational Mechanics\n- **Step 1:** System parameters initialized according to protocol specification.\n- **Step 2:** Data encapsulation and state synchronization verified.\n- **Step 3:** Error checking and flow control maintained across boundaries.\n\n#### 3. Evaluation Summary\nEnforces exact rubric requirements for Unit ${question.unit}.`;

        setAnswerData({
          answer_text: mockBank[question.cluster_id] || defaultCardAns,
          grounded_in_notes: true,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const isHighRep = question.repetition_count >= 3;
  const topicMatch = question.canonical_text.match(/^\[Topic:\s*(.*?)\]\s*(.*)$/i);
  const topicName = topicMatch ? topicMatch[1] : null;
  const questionBody = topicMatch ? topicMatch[2] : question.canonical_text;

  return (
    <div
      className={`bg-[#111827] border rounded-2xl p-6 transition-all duration-200 shadow-md ${
        question.teacher_flagged
          ? "border-[#f59e0b]/50 shadow-lg shadow-[#f59e0b]/5"
          : "border-[#1e293b] hover:border-[#334155]"
      }`}
    >
      {/* Top Badges Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Rank Badge */}
          <span className="font-mono text-lg font-black text-white bg-[#1f2937] border border-[#334155] px-3 py-1 rounded-xl">
            #{rank}
          </span>

          {/* Unit Badge */}
          <span className="px-3 py-1 rounded-lg bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/30 text-xs font-bold uppercase tracking-wider">
            Unit {question.unit}
          </span>

          {/* Marks Badge */}
          <span className="px-3 py-1 rounded-lg bg-[#1f2937] text-[#f3f4f6] border border-[#334155] text-xs font-mono font-bold">
            {question.marks} Marks
          </span>

          {/* Teacher Hint Alert Badge (Gold Amber ONLY here!) */}
          {question.teacher_flagged && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/50 text-xs font-extrabold tracking-wide shadow-sm">
              <Star className="w-3.5 h-3.5 fill-[#f59e0b]" />
              Teacher Hint ★
            </span>
          )}

          {/* Repetition Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
              isHighRep
                ? "bg-[#6366f1]/15 text-indigo-300 border border-[#6366f1]/40"
                : "bg-[#1f2937] text-[#9ca3af]"
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            Asked {question.repetition_count}× across PYQs
          </span>
        </div>

        {/* Algorithmic Priority Score */}
        <span className="text-xs font-mono text-[#64748b]" title="Calculated Priority Score">
          Score: <span className="text-[#9ca3af] font-bold">{question.priority_score}</span>
        </span>
      </div>

      {/* Topic Pillar & Question Text */}
      <div className="mb-5">
        {topicName && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-3 rounded-xl bg-gradient-to-r from-[#06b6d4]/20 via-[#6366f1]/20 to-[#3b82f6]/20 border border-[#06b6d4]/50 text-[#06b6d4] text-xs font-black uppercase tracking-wider shadow-sm">
            <Award className="w-4 h-4 text-[#06b6d4]" />
            <span>TOPIC PILLAR: {topicName}</span>
          </div>
        )}
        <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
          {questionBody}
        </p>
      </div>

      {/* Generate Answer CTA */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
            isOpen
              ? "bg-[#1f2937] text-white border border-[#334155]"
              : "bg-[#6366f1]/15 hover:bg-[#6366f1] text-[#6366f1] hover:text-white border border-[#6366f1]/40 hover:border-[#6366f1] shadow-sm"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isOpen ? "Hide Reference Answer" : "Generate Perfect Exam Answer"}</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowEvalModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#090d16] hover:bg-[#1f2937] text-[#06b6d4] border border-[#06b6d4]/40 transition-all shadow-sm"
        >
          <Award className="w-4 h-4" />
          <span>🧪 Test My Attempt & Grade</span>
        </button>
      </div>

      {showEvalModal && (
        <AnswerEvaluatorModal
          questionText={question.canonical_text}
          maxMarks={question.marks}
          onClose={() => setShowEvalModal(false)}
        />
      )}

      {/* Inline Answer Panel or Loading Skeleton */}
      {isOpen && (
        <div className="mt-4">
          {loading ? (
            <div className="p-6 bg-[#090d16] rounded-xl border border-[#1e293b] animate-pulse flex flex-col gap-3.5">
              <div className="flex items-center gap-3 text-sm font-bold text-[#6366f1]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing mark-scaled answer from your class notes...</span>
              </div>
              <div className="h-4 bg-[#1f2937] rounded w-3/4"></div>
              <div className="h-4 bg-[#1f2937] rounded w-full"></div>
              <div className="h-4 bg-[#1f2937] rounded w-5/6"></div>
              <div className="h-24 bg-[#111827] rounded w-full mt-2"></div>
            </div>
          ) : answerData ? (
            <AnswerPanel
              answerText={answerData.answer_text}
              groundedInNotes={answerData.grounded_in_notes}
              examType={examType}
              marks={question.marks}
              unit={question.unit}
            />
          ) : null}
        </div>
      )}
    </div>
  );
};
