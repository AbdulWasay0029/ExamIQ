"use client";

import React from "react";
import { ExamTypeToggle } from "./ExamTypeToggle";
import { Download, Layers, Sparkles, Star, PlusCircle } from "lucide-react";
import { QuestionCluster, ExamMode } from "../lib/types";

interface SidebarProps {
  subject: string;
  examType: ExamMode;
  onExamTypeChange: (type: ExamMode) => void;
  selectedUnit: number | null;
  onUnitChange: (unit: number | null) => void;
  questions: QuestionCluster[];
  onResetUpload: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  subject,
  examType,
  onExamTypeChange,
  selectedUnit,
  onUnitChange,
  questions,
  onResetUpload,
}) => {
  const units = Array.from(new Set(questions.map((q) => q.unit)))
    .filter((u) => u > 0)
    .sort((a, b) => a - b);

  if (units.length === 0) {
    units.push(1, 2, 3, 4, 5);
  }

  const totalQuestions = questions.reduce((acc, q) => acc + q.repetition_count, 0) || questions.length;
  const uniquePatterns = questions.length;
  const teacherFlaggedCount = questions.filter((q) => q.teacher_flagged).length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <aside className="w-full lg:w-[320px] shrink-0 bg-[#111827] border-b lg:border-b-0 lg:border-r border-[#1e293b] p-6 flex flex-col justify-between no-print shadow-xl">
      <div className="flex flex-col gap-6">
        {/* Header and Add More Button */}
        <div className="flex flex-col gap-3 pb-4 border-b border-[#1e293b]">
          <h2 className="text-2xl font-extrabold text-white tracking-tight truncate" title={subject}>
            {subject || "EXAM SUBJECT"}
          </h2>
          <button
            type="button"
            onClick={onResetUpload}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#1f2937] hover:bg-[#334155] border border-[#334155] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-[#06b6d4]" />
            <span>+ Add More Papers / Notes</span>
          </button>
        </div>

        {/* Exam mode toggle box */}
        <div className="bg-[#090d16] p-4 rounded-xl border border-[#1e293b]">
          <label className="block text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-2.5">
            Active Exam Syllabus Scope
          </label>
          <ExamTypeToggle value={examType} onChange={onExamTypeChange} />
        </div>

        {/* Unit Filter Tabs box */}
        <div className="bg-[#090d16] p-4 rounded-xl border border-[#1e293b]">
          <label className="block text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-2.5">
            Filter by Syllabus Unit
          </label>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => onUnitChange(null)}
              className={`text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 flex justify-between items-center ${
                selectedUnit === null
                  ? "bg-[#6366f1] text-white font-bold shadow-md shadow-[#6366f1]/20"
                  : "text-[#9ca3af] hover:text-white hover:bg-[#1f2937]/60"
              }`}
            >
              <span>All Active Units</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-md font-mono ${selectedUnit === null ? "bg-indigo-700 text-white" : "bg-[#1f2937] text-[#9ca3af]"}`}>
                {uniquePatterns}
              </span>
            </button>

            {units.map((u) => {
              const count = questions.filter((q) => q.unit === u).length;
              return (
                <button
                  key={u}
                  type="button"
                  onClick={() => onUnitChange(u)}
                  className={`flex justify-between items-center text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    selectedUnit === u
                      ? "bg-[#6366f1] text-white font-bold shadow-md shadow-[#6366f1]/20"
                      : "text-[#9ca3af] hover:text-white hover:bg-[#1f2937]/60"
                  }`}
                >
                  <span>Unit {u}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-md font-mono ${selectedUnit === u ? "bg-indigo-700 text-white" : "bg-[#1f2937] text-[#9ca3af]"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-5 pt-6 border-t border-[#1e293b]">
        {/* Stats Summary Box */}
        <div className="bg-[#090d16] border border-[#1e293b] p-4 rounded-xl flex flex-col gap-3 text-xs font-medium">
          <div className="flex justify-between items-center text-[#9ca3af]">
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#6366f1]" />
              Total Analyzed:
            </span>
            <span className="font-mono font-bold text-white">{totalQuestions}</span>
          </div>

          <div className="flex justify-between items-center text-[#9ca3af]">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#06b6d4]" />
              Unique Clusters:
            </span>
            <span className="font-mono font-bold text-white">{uniquePatterns}</span>
          </div>

          <div className="flex justify-between items-center text-[#9ca3af]">
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
              Teacher Hints ★:
            </span>
            <span className="font-mono font-bold text-[#f59e0b]">{teacherFlaggedCount}</span>
          </div>
        </div>

        {/* Download PDF Shortlist Button */}
        <button
          type="button"
          onClick={handlePrint}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#06b6d4]/20 hover:scale-[1.01]"
        >
          <Download className="w-4 h-4" />
          DOWNLOAD PRINTABLE PDF SHORTLIST
        </button>
      </div>
    </aside>
  );
};
