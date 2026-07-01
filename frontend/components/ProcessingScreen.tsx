"use client";

import React, { useEffect, useState } from "react";
import { Check, Loader2, Cpu } from "lucide-react";

interface ProcessingScreenProps {
  fileCount: number;
  onComplete: () => void;
}

const STEPS = [
  { id: 0, label: "Ingesting and parsing uploaded study documents" },
  { id: 1, label: "Extracting candidate questions via AI extraction engine" },
  { id: 2, label: "Generating local vector embeddings for semantic matching" },
  { id: 3, label: "Clustering near-duplicates and tracking repetition counts" },
  { id: 4, label: "Calculating syllabus-weighted priority scores & indexing notes" },
];

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  fileCount,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stats, setStats] = useState({ questions: 0, unique: 0 });

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    timers.push(
      setTimeout(() => {
        setCurrentStep(1);
      }, 900)
    );

    timers.push(
      setTimeout(() => {
        setStats((prev) => ({ ...prev, questions: fileCount * 8 || 47 }));
        setCurrentStep(2);
      }, 2000)
    );

    timers.push(
      setTimeout(() => {
        setCurrentStep(3);
      }, 3100)
    );

    timers.push(
      setTimeout(() => {
        setStats((prev) => ({
          ...prev,
          unique: Math.floor((prev.questions || 47) * 0.65) || 31,
        }));
        setCurrentStep(4);
      }, 4200)
    );

    timers.push(
      setTimeout(() => {
        setCurrentStep(5);
        setTimeout(onComplete, 500);
      }, 5300)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [fileCount, onComplete]);

  return (
    <div className="flex flex-col min-h-screen justify-center max-w-2xl mx-auto px-4 py-12 w-full">
      <div className="bg-[#111827] border border-[#1e293b] p-8 sm:p-10 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-bold text-[#6366f1] uppercase tracking-wider mb-4">
          <Cpu className="w-4 h-4 animate-pulse" />
          <span>Parallel Pipeline Active</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-6">
          Synthesizing Your Exam Survival Shortlist
        </h2>

        <div className="flex flex-col gap-4 text-sm font-medium">
          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <div
                key={step.id}
                className={`flex items-center justify-between p-3.5 rounded-xl transition-all duration-300 ${
                  isActive ? "bg-[#1f2937]/80 border border-[#6366f1]/50 shadow-md" : "bg-[#090d16]/50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {isCompleted && (
                    <span className="w-6 h-6 rounded-lg bg-[#10b981]/15 text-[#10b981] flex items-center justify-center shrink-0 border border-[#10b981]/30">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </span>
                  )}
                  {isActive && (
                    <span className="w-6 h-6 rounded-lg bg-[#6366f1]/20 text-[#6366f1] flex items-center justify-center shrink-0 border border-[#6366f1]/40">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </span>
                  )}
                  {!isCompleted && !isActive && (
                    <span className="w-6 h-6 rounded-lg bg-[#1e293b] text-[#64748b] flex items-center justify-center shrink-0 text-xs font-mono font-bold">
                      {step.id + 1}
                    </span>
                  )}

                  <span
                    className={`${
                      isCompleted
                        ? "text-[#f3f4f6]"
                        : isActive
                        ? "text-[#6366f1] font-bold"
                        : "text-[#64748b]"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {step.id === 1 && currentStep > 1 && (
                  <span className="text-xs font-mono text-[#9ca3af] bg-[#090d16] px-2.5 py-1 rounded-md border border-[#1e293b]">
                    {stats.questions} parsed
                  </span>
                )}

                {step.id === 3 && currentStep > 3 && (
                  <span className="text-xs font-mono text-[#06b6d4] bg-[#06b6d4]/10 px-2.5 py-1 rounded-md border border-[#06b6d4]/30 font-bold">
                    {stats.unique} unique clusters
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
