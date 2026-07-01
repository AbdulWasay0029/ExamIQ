"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  Sparkles,
  FolderOpen,
  Layers,
  CheckCircle2,
  Cpu,
  TrendingUp,
  Award,
  Zap,
  BookOpen,
} from "lucide-react";
import { FileItem, SourceType, ExamMode } from "../lib/types";
import { FileRow } from "./FileRow";
import { ExamTypeToggle } from "./ExamTypeToggle";
import { seedDemoData } from "../lib/api";
import toast from "react-hot-toast";

interface UploadZoneProps {
  onAnalyze: (files: FileItem[], subject: string, examType: ExamMode) => void;
  onInstantDemo: () => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onAnalyze,
  onInstantDemo,
}) => {
  const [subject, setSubject] = useState("");
  const [examType, setExamType] = useState<ExamMode>("Mid 1");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);

  const detectSourceType = (filename: string): SourceType => {
    const name = filename.toLowerCase();
    if (name.includes("note") || name.includes("class") || name.includes("lec")) {
      return "Notes";
    }
    if (name.includes("hint") || name.includes("imp") || name.includes("flag")) {
      return "Teacher Hint";
    }
    if (name.includes("syl") || name.includes("curric")) {
      return "Syllabus";
    }
    if (
      name.includes("img") ||
      name.includes("photo") ||
      name.includes("wa") ||
      name.includes("whatsapp") ||
      name.includes("jpg") ||
      name.includes("png")
    ) {
      return "Teacher Hint"; // Auto-flag images as Teacher Hint per student workflow!
    }
    return "PYQ";
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newItems: FileItem[] = acceptedFiles.map((file) => {
      const sType = detectSourceType(file.name);
      return {
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        name: file.name,
        size: file.size,
        sourceType: sType,
        starred: sType === "Teacher Hint",
      };
    });

    setFiles((prev) => [...prev, ...newItems]);
    toast.success(`Added ${acceptedFiles.length} file(s)`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
      "text/plain": [".txt", ".md"],
    },
  });

  const handleUpdateFile = (id: string, updates: Partial<FileItem>) => {
    setFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const canAnalyze = subject.trim().length > 0 && files.length > 0;

  const handleTriggerDemo = async () => {
    setIsSeeding(true);
    const id = toast.loading("Synthesizing pre-clustered Computer Networks dataset...");
    try {
      await seedDemoData();
      toast.success("Computer Networks demo loaded!", { id });
      onInstantDemo();
    } catch (err) {
      console.error(err);
      toast.error("Using offline high-speed demo fallback!", { id });
      onInstantDemo();
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen justify-between max-w-[1600px] mx-auto w-full px-6 sm:px-12 lg:px-16 py-8 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-5 border-b border-[#1e293b] w-full">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#6366f1]/20 rounded-xl text-[#6366f1] border border-[#6366f1]/30 shadow-md">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
              Exam<span className="text-[#6366f1] underline decoration-[#06b6d4] decoration-wavy decoration-2">IQ</span>
            </span>
            <span className="text-xs text-[#9ca3af] block font-medium">
              AI Exam Strategist & PYQ Vector Deduplication Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 text-xs font-mono font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Recency & Keyword Rubric Ready
          </span>
          <button
            type="button"
            onClick={handleTriggerDemo}
            disabled={isSeeding}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#06b6d4]/20 hover:scale-[1.02]"
          >
            <FolderOpen className="w-4 h-4" />
            <span>⚡ Instant Load Demo (No Upload Needed)</span>
          </button>
        </div>
      </div>

      {/* Hero Title */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-4 leading-tight">
          Your Exam Night Survival Engine
        </h1>
        <p className="text-base sm:text-lg text-[#9ca3af] leading-relaxed">
          Turn messy WhatsApp photos and unorganized PYQs into high-ROI study plans and mark-scaled answers.
        </p>
      </div>

      {/* Widescreen Panoramic Grid (Expands across full desktop width) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12 w-full">
        {/* Left/Center Column: Primary Upload Command Center (8 Cols on XL, 7 on LG) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-[#111827]/90 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border-2 border-[#1e293b] shadow-2xl flex flex-col gap-8 w-full">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-[#6366f1]" />
              <span>Step 1: Configure Target Examination</span>
            </h2>
            <span className="text-xs font-mono font-bold text-[#6366f1] bg-[#6366f1]/10 px-3 py-1 rounded-lg border border-[#6366f1]/30">
              Parallel Vector Indexing
            </span>
          </div>

          {/* Subject & Exam Mode Form */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-5 flex flex-col gap-2.5">
              <label className="text-xs font-black text-[#cbd5e1] uppercase tracking-wider">
                Course / Subject Name
              </label>
              <input
                type="text"
                placeholder="e.g. Computer Networks"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#090d16] border border-[#1e293b] px-4 py-4 rounded-2xl text-sm font-bold text-white placeholder-[#475569] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all shadow-inner"
              />
            </div>

            <div className="xl:col-span-7 flex flex-col gap-2.5">
              <label className="text-xs font-black text-[#cbd5e1] uppercase tracking-wider">
                Target Syllabus Scope (Syllabus Filter)
              </label>
              <ExamTypeToggle value={examType} onChange={setExamType} />
            </div>
          </div>

          {/* Step 2: Main Dropzone */}
          <div className="flex flex-col gap-2.5 border-t border-[#1e293b] pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-[#06b6d4]" />
                <span>Step 2: Upload Study Queue</span>
              </h2>
              <span className="text-xs text-[#9ca3af]">Supports PDF, JPG, PNG, TXT</span>
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-3xl p-10 sm:p-14 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? "border-[#6366f1] bg-[#6366f1]/15 shadow-2xl shadow-[#6366f1]/20 scale-[0.995]"
                  : "border-[#334155] bg-[#090d16]/80 hover:border-[#6366f1]/70 hover:bg-[#0f172a]"
              }`}
            >
              <input {...getInputProps()} />
              <div className="p-5 bg-[#111827] rounded-2xl border border-[#1e293b] mb-5 shadow-xl">
                <Upload className={`w-10 h-10 ${isDragActive ? "text-[#6366f1] animate-bounce" : "text-[#06b6d4]"}`} />
              </div>
              <p className="text-xl font-black text-white mb-2">
                {isDragActive ? "Release files to instantly queue..." : "Drag & drop your study files here, or click to browse"}
              </p>
              <p className="text-xs sm:text-sm text-[#9ca3af] max-w-xl leading-relaxed">
                Images (.jpg, .png) are automatically OCR-scanned and flagged as <strong className="text-[#f59e0b]">Teacher Hints</strong>. PDFs & notes are embedded for 100% grounded curriculum answers.
              </p>
            </div>
          </div>

          {/* Queued Files Table */}
          {files.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-[#1e293b] pt-6 max-h-72 overflow-y-auto pr-2">
              <div className="flex justify-between items-center text-xs font-black text-[#9ca3af] px-1 uppercase tracking-wider">
                <span>QUEUED FILES ({files.length})</span>
                <span>AUTO-TAGGED ROLE & PRIORITY</span>
              </div>
              {files.map((item) => (
                <FileRow
                  key={item.id}
                  item={item}
                  onUpdate={handleUpdateFile}
                  onRemove={handleRemoveFile}
                />
              ))}
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="button"
            disabled={!canAnalyze}
            onClick={() => onAnalyze(files, subject, examType)}
            className={`w-full py-5 px-8 rounded-2xl font-black text-base uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-3 shadow-2xl ${
              canAnalyze
                ? "bg-gradient-to-r from-[#6366f1] via-[#4f46e5] to-[#06b6d4] text-white hover:opacity-95 hover:scale-[1.003] shadow-[#6366f1]/30"
                : "bg-[#1f2937] text-[#475569] border border-[#334155] cursor-not-allowed"
            }`}
          >
            <Sparkles className="w-6 h-6" />
            <span>Launch AI Exam Strategist Engine</span>
          </button>
        </div>

        {/* Right Column: Live Exam Strategy Radar & Pattern Analyzer (4 Cols on XL, 5 on LG) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 w-full">
          {/* Hackathon Judge VIP Box */}
          <div className="bg-gradient-to-br from-[#131b2e] to-[#111827] border-2 border-[#6366f1]/50 p-6 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-6 -translate-y-6 w-32 h-32 bg-[#6366f1]/15 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center gap-2 text-[#06b6d4] font-mono font-bold text-xs uppercase tracking-wider mb-2.5">
              <Sparkles className="w-4 h-4" />
              <span>Hackathon Judge VIP Action</span>
            </div>
            <h3 className="text-xl font-black text-white mb-2 leading-snug">
              Skip Uploading? Try Pre-Clustered Demo
            </h3>
            <p className="text-xs text-[#9ca3af] leading-relaxed mb-5">
              Instantly seed 10 years of Computer Networks PYQs, blackboard hints, and class notes. Watch our TF-IDF & LLM engine rank shortlist topics in under 2 seconds.
            </p>
            <button
              type="button"
              onClick={handleTriggerDemo}
              disabled={isSeeding}
              className="w-full py-4 px-5 rounded-2xl bg-[#1f2937] hover:bg-[#334155] border border-[#06b6d4]/50 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <FolderOpen className="w-4 h-4 text-[#06b6d4]" />
              <span>⚡ INSTANT LOAD COMPUTER NETWORKS DEMO</span>
            </button>
          </div>

          {/* Recency & Keyword Marking Breakdown */}
          <div className="bg-[#111827]/90 backdrop-blur-xl border border-[#1e293b] p-6 rounded-3xl flex flex-col gap-5 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-[#1e293b] pb-3 flex items-center justify-between">
              <span>Why ExamIQ Outperforms ChatGPT</span>
              <span className="text-[10px] text-[#10b981] bg-[#10b981]/10 px-2.5 py-1 rounded-md border border-[#10b981]/30 font-mono font-bold">
                Indian University Ready
              </span>
            </h3>

            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-2xl bg-[#6366f1]/15 text-[#6366f1] shrink-0 mt-0.5 border border-[#6366f1]/30">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white mb-1">
                  Recency-Weighted Priority Scoring
                </h4>
                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  Questions appearing in the last 2 years receive a 2× mathematical boost over older 2015 PYQs, reflecting real university paper setter trends.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-2xl bg-[#06b6d4]/15 text-[#06b6d4] shrink-0 mt-0.5 border border-[#06b6d4]/30">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white mb-1">
                  Exact University Mark-Structure
                </h4>
                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  Enforces exact Indian university marking rubrics: 1M crisp definitions, 2M definition+formula, 5M bullet points, and 10M numbered step essays with ASCII diagrams.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-2xl bg-[#f59e0b]/15 text-[#f59e0b] shrink-0 mt-0.5 border border-[#f59e0b]/30">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white mb-1">
                  Time-Aware &quot;Safe To Skip&quot; Permission
                </h4>
                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  When you have 2 hours left, our algorithm explicitly identifies low-yield 1× items and grants AI permission to skip them safely.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-2xl bg-[#10b981]/15 text-[#10b981] shrink-0 mt-0.5 border border-[#10b981]/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white mb-1">
                  Auto-Detected Mock Exam Papers
                </h4>
                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  Automatically formats Part A compulsory questions and Part B paired internal choice (OR) questions matching your college blueprint.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs font-mono text-[#64748b] border-t border-[#1e293b] pt-6 pb-2 w-full">
        EXAMIQ ADVANCED AGENTIC CODING PROJECT · BUILT FOR WIDESCREEN PANORAMIC PRODUCTIVITY & INSTANT EXAM PREP
      </footer>
    </div>
  );
};
