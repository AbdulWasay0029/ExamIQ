"use client";

import React, { useEffect, useState } from "react";
import { MemorySheetUnit } from "../lib/types";
import { fetchMemorySheet } from "../lib/api";
import { Zap, Table as TableIcon, FileText, Printer, Loader2 } from "lucide-react";

interface MemorySheetViewProps {
  subject: string;
}

export const MemorySheetView: React.FC<MemorySheetViewProps> = ({ subject }) => {
  const [sheets, setSheets] = useState<MemorySheetUnit[]>([]);
  const [dumpMode, setDumpMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetchMemorySheet(subject);
        setSheets(res);
      } catch {
        // Offline fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [subject]);

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full font-sans">
      {/* Header Bar */}
      <div className="bg-[#111827] border-2 border-[#1e293b] p-6 sm:p-8 rounded-2xl shadow-xl flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#f59e0b] uppercase tracking-wider">
            AI EXAM STRATEGIST PILLAR #3
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Memory Sheets & 1-Page Exam Dump
          </h1>
          <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
            Condensed comparison tables and keyword cheat sheets designed for rapid pre-exam memorization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDumpMode(!dumpMode)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg ${
              dumpMode
                ? "bg-[#f59e0b] text-[#090d16] shadow-[#f59e0b]/30"
                : "bg-[#1f2937] text-white hover:bg-[#334155] border border-[#334155]"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{dumpMode ? "Exit Dump Mode" : "⚡ Night-Before Dump Mode"}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-[#06b6d4] hover:bg-[#0284c7] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-[#111827] p-16 rounded-2xl border border-[#1e293b] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-[#f59e0b] animate-spin" />
          <span className="text-sm font-bold text-white">Synthesizing Unit Memory Tables...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {sheets.map((s) => (
            <div
              key={s.unit}
              className="bg-[#111827] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="bg-[#1f2937] px-6 py-4 border-b border-[#1e293b] flex justify-between items-center">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {s.title}
                </h3>
                <span className="text-xs font-mono font-bold text-[#06b6d4] bg-[#090d16] px-3 py-1 rounded-lg border border-[#1e293b]">
                  Unit {s.unit} Quick Recall
                </span>
              </div>

              {dumpMode ? (
                <div className="p-6 bg-[#090d16]">
                  <div className="flex items-center gap-2 mb-3 text-xs font-mono text-[#f59e0b] font-bold">
                    <Zap className="w-4 h-4" />
                    <span>NIGHT-BEFORE KEYWORD COMPRESSION (ZERO PARAGRAPHS):</span>
                  </div>
                  <p className="font-mono text-sm sm:text-base font-bold text-white leading-relaxed tracking-wide bg-[#111827] p-4 rounded-xl border border-[#1e293b]">
                    {s.keywords_dump}
                  </p>
                </div>
              ) : (
                <div className="p-6 flex flex-col gap-6">
                  {/* Comparison Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#334155] text-xs font-mono uppercase text-[#9ca3af]">
                          <th className="py-3 px-4 font-extrabold w-1/4">Core Concept</th>
                          <th className="py-3 px-4 font-extrabold w-1/2">Working Mechanism / Architecture</th>
                          <th className="py-3 px-4 font-extrabold w-1/4 text-right">Key Exam Metric</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e293b] text-sm">
                        {s.comparison_table.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-[#1f2937]/50 transition-colors">
                            <td className="py-4 px-4 font-extrabold text-white">
                              {row.concept}
                            </td>
                            <td className="py-4 px-4 text-[#cbd5e1] leading-snug">
                              {row.core_mechanism}
                            </td>
                            <td className="py-4 px-4 font-mono text-xs font-bold text-[#10b981] text-right">
                              {row.key_metric}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Keywords Strip */}
                  <div className="bg-[#090d16] p-4 rounded-xl border border-[#1e293b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <span className="text-xs font-mono text-[#64748b] uppercase font-bold shrink-0">
                      High-Scoring Vocabulary:
                    </span>
                    <span className="text-xs font-mono font-semibold text-[#6366f1] leading-relaxed">
                      {s.keywords_dump}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
