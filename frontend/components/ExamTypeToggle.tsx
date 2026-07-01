"use client";

import React from "react";
import { ExamMode } from "../lib/types";

interface ExamTypeToggleProps {
  value: ExamMode;
  onChange: (val: ExamMode) => void;
}

const MODES: { label: ExamMode; desc: string; detail: string }[] = [
  {
    label: "Mid 1",
    desc: "Units 1, 2 & 3 (Part I)",
    detail: "Prioritizes early curriculum foundation & first 2.5 units",
  },
  {
    label: "Mid 2",
    desc: "Units 3 (Part II), 4 & 5",
    detail: "Prioritizes advanced topics & second 2.5 units",
  },
  {
    label: "Semester",
    desc: "Full Syllabus (Units 1–5)",
    detail: "Balanced importance across all five syllabus units",
  },
];

export const ExamTypeToggle: React.FC<ExamTypeToggleProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-1.5 bg-[#111827] border border-[#1e293b] p-1.5 rounded-xl">
        {MODES.map((m) => {
          const isSelected = value === m.label;
          return (
            <button
              key={m.label}
              type="button"
              onClick={() => onChange(m.label)}
              title={m.detail}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${
                isSelected
                  ? "bg-[#6366f1] text-white font-semibold shadow-md shadow-[#6366f1]/25"
                  : "text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#1f2937]/50"
              }`}
            >
              <span className="text-xs sm:text-sm font-bold tracking-wide">
                {m.label.toUpperCase()}
              </span>
              <span className={`text-[10px] hidden sm:block ${isSelected ? "text-indigo-100" : "text-[#64748b]"}`}>
                {m.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
