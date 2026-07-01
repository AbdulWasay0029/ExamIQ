"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { CheckCircle2, AlertTriangle, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

interface AnswerPanelProps {
  answerText: string;
  groundedInNotes: boolean;
  examType: string;
  marks: number;
  unit: number;
}

export const AnswerPanel: React.FC<AnswerPanelProps> = ({
  answerText,
  groundedInNotes,
  examType,
  marks,
  unit,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(answerText);
    setCopied(true);
    toast.success("Answer copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-5 pt-5 border-t border-[#1e293b] bg-[#090d16] p-5 sm:p-6 rounded-xl transition-all duration-200">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-4 border-b border-[#1e293b] text-xs">
        <div className="flex items-center gap-2 text-[#9ca3af] font-medium">
          <span className="font-bold text-white uppercase tracking-wider">{examType} Scope</span>
          <span>·</span>
          <span className="text-[#06b6d4] font-semibold">{marks} Marks</span>
          <span>·</span>
          <span>Unit {unit}</span>
        </div>

        <div className="flex items-center gap-3">
          {groundedInNotes ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Grounded in Your Notes
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#6366f1]/15 text-[#6366f1] border border-[#6366f1]/30 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              Standard Academic Synthesis
            </span>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] hover:bg-[#1f2937] border border-[#1e293b] text-[#f3f4f6] rounded-lg transition-colors text-xs font-semibold"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10b981]" />
                <span className="text-[#10b981]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#9ca3af]" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Markdown Body */}
      <div className="prose prose-invert max-w-none text-sm sm:text-[15px] leading-relaxed text-[#f3f4f6] prose-headings:font-sans prose-headings:font-bold prose-headings:text-[#6366f1] prose-h3:text-base prose-h4:text-sm prose-h4:text-[#06b6d4] prose-code:text-[#06b6d4] prose-code:font-mono prose-pre:bg-[#111827] prose-pre:border prose-pre:border-[#1e293b] prose-pre:rounded-xl">
        <ReactMarkdown>{answerText}</ReactMarkdown>
      </div>

      {/* Footer hint */}
      <div className="mt-6 pt-3 border-t border-[#1e293b]/60 text-[11px] text-[#64748b] flex justify-between items-center font-mono">
        <span>EXAMIQ MARK-SCALED RAG ENGINE</span>
        <span>Target structure verified for full academic credit</span>
      </div>
    </div>
  );
};
