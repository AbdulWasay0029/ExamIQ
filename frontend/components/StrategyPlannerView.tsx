"use client";

import React, { useEffect, useState, useCallback } from "react";
import { StrategyPlan, ExamMode } from "../lib/types";
import { fetchStrategyPlan } from "../lib/api";
import { Clock, Flame, ShieldAlert, TrendingUp, Loader2 } from "lucide-react";

interface StrategyPlannerViewProps {
  subject: string;
  examType: ExamMode;
}

export const StrategyPlannerView: React.FC<StrategyPlannerViewProps> = ({
  subject,
  examType,
}) => {
  const [timeLeft, setTimeLeft] = useState(24);
  const [plan, setPlan] = useState<StrategyPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStrategy = useCallback(async (hours: number) => {
    setLoading(true);
    try {
      const res = await fetchStrategyPlan(subject, examType, hours);
      setPlan(res);
    } catch {
      // Offline fallback
      setPlan({
        status: "success",
        subject: subject || "Computer Networks",
        exam_type: examType,
        time_left_hours: hours,
        must_study: [
          {
            cluster_id: 1,
            text: "Explain the working of TCP 3-way handshake with sequence flowchart.",
            unit: 2,
            marks: 10,
            repetition_count: 6,
            teacher_flagged: true,
            priority_score: 45.0,
            prep_time_mins: 25,
            roi_score: 14.4,
            confidence_pct: 96,
            confidence_reasons: "Asked 6× across PYQs + Teacher Blackboard Hint ★",
          },
          {
            cluster_id: 2,
            text: "Explain Distance Vector Routing algorithm and detail the count-to-infinity problem.",
            unit: 4,
            marks: 10,
            repetition_count: 4,
            teacher_flagged: false,
            priority_score: 30.0,
            prep_time_mins: 25,
            roi_score: 9.6,
            confidence_pct: 88,
            confidence_reasons: "Asked 4× across PYQs + Core Unit 4 Mechanism",
          },
        ],
        optional: [
          {
            cluster_id: 3,
            text: "Compare IPv4 and IPv6 packet header formats and key improvements.",
            unit: 3,
            marks: 5,
            repetition_count: 2,
            teacher_flagged: true,
            priority_score: 25.0,
            prep_time_mins: 15,
            roi_score: 6.7,
            confidence_pct: 79,
            confidence_reasons: "Teacher Blackboard Hint ★ + Unit 3 Addressing",
          },
        ],
        skip: [
          {
            cluster_id: 4,
            text: "Write short notes on HTTP/2 multiplexing vs HTTP/1.1 pipelining.",
            unit: 5,
            marks: 5,
            repetition_count: 1,
            teacher_flagged: false,
            priority_score: 8.0,
            prep_time_mins: 15,
            roi_score: 3.3,
            confidence_pct: 65,
            confidence_reasons: "Appeared 1× across PYQs",
            skip_reason: "Appeared only once across 10 years, teacher never emphasized. Safe to skip.",
          },
        ],
        unit_roi_ranking: [
          { unit: 2, total_marks: 25, q_count: 3, prep_mins: 60, roi: 25.0 },
          { unit: 4, total_marks: 20, q_count: 2, prep_mins: 50, roi: 24.0 },
          { unit: 1, total_marks: 15, q_count: 2, prep_mins: 40, roi: 22.5 },
          { unit: 3, total_marks: 12, q_count: 2, prep_mins: 35, roi: 20.5 },
        ],
        progress_metrics: {
          attempt_coverage_pct: hours <= 6 ? 65 : 88,
          likely_score_range: hours <= 6 ? "45–54 Marks" : "62–70 Marks",
          total_study_time_hrs: hours <= 6 ? 1.5 : 3.8,
        },
      });
    } finally {
      setLoading(false);
    }
  }, [subject, examType]);

  useEffect(() => {
    loadStrategy(timeLeft);
  }, [timeLeft, loadStrategy]);

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full font-sans">
      {/* Time-Aware Mode Header Banner */}
      <div className="bg-[#111827] border-2 border-[#1e293b] p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col gap-6">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-[#1e293b] pb-6">
          <div>
            <span className="text-xs font-mono font-bold text-[#6366f1] uppercase tracking-wider">
              AI EXAM STRATEGIST PILLAR #2
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Time-Aware ROI Study Planner
            </h1>
            <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
              Optimizes your study sequence by Expected Return On Investment (Marks ÷ Time) rather than syllabus order.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#090d16] p-1.5 rounded-xl border border-[#1e293b]">
            {[24, 12, 6, 2].map((hrs) => (
              <button
                key={hrs}
                type="button"
                onClick={() => setTimeLeft(hrs)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                  timeLeft === hrs
                    ? hrs === 2
                      ? "bg-[#ef4444] text-white shadow-lg shadow-[#ef4444]/30"
                      : "bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/30"
                    : "text-[#9ca3af] hover:text-white"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{hrs}h Left</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Progress Metrics */}
        {plan && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#090d16] p-4 rounded-xl border border-[#1e293b] flex flex-col gap-1">
              <span className="text-xs font-mono text-[#9ca3af] uppercase">Estimated Exam Attempt</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-[#10b981]">
                  {plan.progress_metrics.attempt_coverage_pct}%
                </span>
                <span className="text-xs font-bold text-[#10b981]">Syllabus Covered</span>
              </div>
              <div className="w-full bg-[#1f2937] h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#10b981] h-full transition-all duration-500"
                  style={{ width: `${plan.progress_metrics.attempt_coverage_pct}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-[#090d16] p-4 rounded-xl border border-[#1e293b] flex flex-col gap-1">
              <span className="text-xs font-mono text-[#9ca3af] uppercase">Likely Exam Score Range</span>
              <span className="text-2xl font-black text-[#06b6d4]">
                {plan.progress_metrics.likely_score_range}
              </span>
              <span className="text-[11px] text-[#9ca3af]">Based on historical PYQ distribution</span>
            </div>

            <div className="bg-[#090d16] p-4 rounded-xl border border-[#1e293b] flex flex-col gap-1">
              <span className="text-xs font-mono text-[#9ca3af] uppercase">Total Must-Study Time</span>
              <span className="text-2xl font-black text-[#f59e0b]">
                ~{plan.progress_metrics.total_study_time_hrs} Hours
              </span>
              <span className="text-[11px] text-[#9ca3af]">Fits comfortably within your {timeLeft}h buffer</span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-[#111827] p-16 rounded-2xl border border-[#1e293b] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
          <span className="text-sm font-bold text-white">Re-calculating ROI Study Order for {timeLeft}h timeframe...</span>
        </div>
      ) : plan ? (
        <div className="flex flex-col gap-8">
          {/* Study Order Optimizer */}
          <div className="bg-[#111827] border border-[#1e293b] p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#06b6d4]" />
              <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                Unit ROI Study Order Optimizer (Do Not Study Syllabus Order!)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {plan.unit_roi_ranking.map((u, idx) => (
                <div
                  key={u.unit}
                  className={`p-4 rounded-xl border flex flex-col gap-2 ${
                    idx === 0
                      ? "bg-[#06b6d4]/10 border-[#06b6d4] shadow-md"
                      : "bg-[#090d16] border-[#1e293b]"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-white bg-[#1f2937] px-2 py-0.5 rounded">
                      #{idx + 1} START HERE
                    </span>
                    <span className="text-xs font-mono font-black text-[#06b6d4]">
                      ROI: ★★★★★
                    </span>
                  </div>
                  <h4 className="text-base font-black text-white">Unit {u.unit}</h4>
                  <p className="text-xs text-[#9ca3af]">
                    Expected: <strong className="text-white">{u.total_marks}M</strong> (~{u.prep_mins}m prep)
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bucket 1: Must Study */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 bg-[#10b981]/15 text-[#10b981] p-3 rounded-xl border border-[#10b981]/30">
              <Flame className="w-5 h-5 fill-current" />
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider">
                🔥 MUST STUDY TOP YIELD ({plan.must_study.length} Questions — High Return on Time)
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              {plan.must_study.map((q) => (
                <div
                  key={q.cluster_id}
                  className="p-5 bg-[#111827] border border-[#1e293b] hover:border-[#6366f1] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all shadow-md"
                >
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded font-mono text-xs font-black bg-[#6366f1]/20 text-[#818cf8] border border-[#6366f1]/30">
                        [Unit {q.unit}] ({q.marks}M)
                      </span>
                      {q.teacher_flagged && (
                        <span className="px-2.5 py-0.5 rounded font-mono text-xs font-black bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/40">
                          ★ Teacher Blackboard Hint
                        </span>
                      )}
                      <span className="text-xs font-mono font-bold text-[#10b981]">
                        Confidence: {q.confidence_pct}% ({q.confidence_reasons})
                      </span>
                    </div>
                    <p className="text-base font-bold text-white leading-snug">{q.text}</p>
                  </div>

                  <div className="flex flex-row sm:flex-col items-end gap-1 shrink-0 bg-[#090d16] px-4 py-2.5 rounded-xl border border-[#1e293b]">
                    <span className="text-xs font-mono text-[#9ca3af]">Est. Prep Time</span>
                    <span className="text-sm font-black text-[#06b6d4]">~{q.prep_time_mins} mins</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bucket 2: Skip This */}
          <div className="flex flex-col gap-4 pt-4 border-t border-[#1e293b]">
            <div className="flex items-center gap-2 bg-[#ef4444]/15 text-[#ef4444] p-3 rounded-xl border border-[#ef4444]/30">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider">
                🛑 SKIP THIS — AI PERMISSION GRANTED ({plan.skip.length} Low-Yield Topics)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plan.skip.map((q) => (
                <div
                  key={q.cluster_id}
                  className="p-4 bg-[#090d16]/70 border border-[#1e293b] rounded-xl flex flex-col gap-2 opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-[#64748b]">Unit {q.unit} · {q.marks}M</span>
                    <span className="text-[11px] font-mono text-[#ef4444] font-bold">Skip Approved</span>
                  </div>
                  <p className="text-sm font-semibold text-[#cbd5e1] line-through decoration-[#ef4444]/60">
                    {q.text}
                  </p>
                  <p className="text-xs text-[#9ca3af] italic bg-[#111827] p-2 rounded">
                    &quot;{q.skip_reason}&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
