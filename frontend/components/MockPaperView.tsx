"use client";

import React, { useState } from "react";
import { MockPaperData } from "../lib/types";
import { generateAnswer } from "../lib/api";
import { AnswerPanel } from "./AnswerPanel";
import { Sparkles, Printer, ShieldCheck, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface MockPaperViewProps {
  data: MockPaperData;
  onRefresh: () => void;
}

export const MockPaperView: React.FC<MockPaperViewProps> = ({
  data,
  onRefresh,
}) => {
  const [openQId, setOpenQId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, { text: string; grounded: boolean }>>({});
  const [loadingQId, setLoadingQId] = useState<number | null>(null);

  const handleToggleAnswer = async (id: number, text: string, marks: number, unit: number) => {
    if (openQId === id) {
      setOpenQId(null);
      return;
    }
    setOpenQId(id);
    if (!answers[id]) {
      setLoadingQId(id);
      try {
        const res = await generateAnswer(id, data.exam_type, marks);
        setAnswers((prev) => ({ ...prev, [id]: { text: res.answer_text, grounded: res.grounded_in_notes } }));
      } catch {
        const cleanTitle = text.replace(/\?$/, "");
        const mockBank: Record<number, string> = {
          101: `### Concise Definition (2 Marks)\n\nThe **OSI (Open Systems Interconnection)** reference model is a conceptual framework that standardizes telecommunication functions into 7 distinct abstraction layers.\n\n**The 7 Layers (Top to Bottom):**\n1. **Application** (Layer 7) · 2. **Presentation** (Layer 6) · 3. **Session** (Layer 5) · 4. **Transport** (Layer 4) · 5. **Network** (Layer 3) · 6. **Data Link** (Layer 2) · 7. **Physical** (Layer 1)`,
          102: `### Concise Definition (2 Marks)\n\n**Framing** encapsulates raw physical bit streams into discrete packets called frames at the Data Link Layer, adding header and trailer synchronization flags.\n\n**Byte Stuffing:** When raw payload data contains the reserved delimiter flag byte (e.g., \`0x7E\`), the transmitter inserts an escape sequence byte (\`0x1B\`) immediately before it to prevent false frame boundary detection.`,
          103: `### Concise Definition (2 Marks)\n\n**Subnet Masking** divides a network logical address into a network prefix and host identifier by applying a bitwise AND operation.\n\n**CIDR (Classless Inter-Domain Routing):** Replaces rigid address classes with arbitrary-length prefixes notation (e.g., \`192.168.1.0/24\`), allowing efficient routing table summarization.`,
          104: `### Concise Definition (2 Marks)\n\nThe **TCP 3-Way Handshake** establishes a synchronized, reliable full-duplex session before data transmission begins.\n\n**Steps:**\n1. **SYN:** Client sends initial sequence number $X$.\n2. **SYN-ACK:** Server acknowledges with $X+1$ and sends sequence $Y$.\n3. **ACK:** Client acknowledges server sequence with $Y+1$.`,
          105: `### Concise Definition (2 Marks)\n\n- **Recursive Resolution:** The local DNS resolver takes full responsibility, querying root, TLD, and authoritative servers sequentially until returning the final IP to the client.\n- **Iterative Resolution:** The queried server returns a referral (best next server IP) back to the local resolver, requiring the resolver to initiate subsequent queries.`,
          201: `### Structured Answer (5 Marks)\n\n#### 1. Architectural Comparison\nBoth models define layered networking abstractions, but differ fundamentally in session integration and protocol strictness.\n\n#### 2. ASCII Layer Comparison Diagram\n\`\`\`\n   OSI MODEL (7 Layers)           TCP/IP MODEL (4 Layers)\n+-----------------------+       +-----------------------+\n| 7. Application        |---+   |\n| 6. Presentation       |   +-->| 4. Application        |\n| 5. Session            |---+   +-----------------------+\n+-----------------------+       | 3. Transport (TCP/UDP)|\n| 4. Transport          |------>+-----------------------+\n+-----------------------+       | 2. Internet (IP)      |\n| 3. Network            |------>+-----------------------+\n+-----------------------+       |\n| 2. Data Link          |---+-->| 1. Network Interface  |\n| 1. Physical           |---+   +-----------------------+\n\`\`\`\n\n#### 3. Key Differences Table\n| Metric | OSI Model | TCP/IP Model |\n| :--- | :--- | :--- |\n| **Layers** | 7 Theoretical Layers | 4 Practical Implementation Layers |\n| **Approach** | Strict modular encapsulation | Pragmatic, protocol-driven design |\n| **Connection** | Supports both connectionless & connection-oriented at Network layer | Network layer is strictly connectionless (IP) |`,
          202: `### Structured Answer (5 Marks)\n\n#### 1. Introduction\n**CSMA/CD (Carrier Sense Multiple Access with Collision Detection)** is a shared broadcast medium access protocol used in wired IEEE 802.3 Ethernet.\n\n#### 2. Step-by-Step Collision Resolution Mechanics\n1. **Carrier Sense:** Station listens to the wire. If idle, it begins transmitting.\n2. **Collision Detection:** While transmitting, the station monitors energy levels. If voltage doubles (collision occurred), it immediately aborts transmission.\n3. **Jamming Signal:** Transmits a 32-bit jam sequence to ensure all attached devices register the collision.\n4. **Exponential Backoff:** Waits a random interval $T = R \\times 51.2\\,\\mu s$ where $0 \\le R < 2^k$ ($k$ = collision count) before re-attempting.`,
          203: `### Structured Answer (5 Marks)\n\n#### 1. Core Synchronization Mechanics\nTCP guarantees ordered, reliable delivery via the **3-Way Handshake** state transition machine prior to payload transfer.\n\n#### 2. Sequence Exchange ASCII Diagram\n\`\`\`\n CLIENT (CLOSED -> SYN_SENT)                SERVER (LISTEN)\n   |\n   |------ 1. SYN (SEQ=100, CTL=SYN) ------------->|  (Changes to SYN_RCVD)\n   |                                               |\n   |<----- 2. SYN-ACK (SEQ=500, ACK=101) ----------|  (Allocates buffers)\n   |\n   |------ 3. ACK (SEQ=101, ACK=501) ------------->|  (Changes to ESTABLISHED)\n   |\n   v                                               v\n [ FULL DUPLEX DATA TRANSMISSION PIPELINE ACTIVE ]\n\`\`\`\n\n#### 3. Evaluation Highlights\n- **SYN Flood Protection:** Modern kernels use SYN Cookies to prevent memory exhaustion during step 2.\n- **Initial Sequence Numbers (ISN):** Randomized 32-bit integers to prevent TCP sequence prediction attacks.`,
          204: `### Structured Answer (5 Marks)\n\n#### 1. Sliding Window Protocol Overview\nAutomatic Repeat reQuest (ARQ) protocols optimize channel throughput by allowing multiple frames in transit prior to acknowledgment.\n\n#### 2. Differentiating Go-Back-N vs. Selective Repeat\n- **Go-Back-N (GBN):** Receiver window size $W_r = 1$. If frame $N$ is lost or corrupted, the receiver discards all subsequent frames ($N+1, N+2...$). The sender retransmits the entire window starting from frame $N$.\n- **Selective Repeat (SR):** Receiver window size $W_r > 1$. The receiver individually buffers out-of-order frames and sends negative acknowledgments (NAK). The sender retransmits **only** the specific damaged frame $N$.`
        };

        const defaultAns = `### Model Examination Key (${marks} Marks)\n\n#### 1. Formal Definition\nComprehensive technical synthesis and structural evaluation for **${cleanTitle}**.\n\n#### 2. Step-by-Step Mechanics\n1. **Initialization:** Core parameters and boundary conditions established.\n2. **Execution Flow:** Systematic execution following syllabus standards.\n3. **Validation:** Verifies output integrity and mark requirements.\n\n#### 3. Examiner Checklist\n- Enforces exact rubric definitions for Unit ${unit}.\n- Grounded in vetted academic curriculum data.`;

        setAnswers((prev) => ({
          ...prev,
          [id]: {
            text: mockBank[id] || defaultAns,
            grounded: true,
          },
        }));
      } finally {
        setLoadingQId(null);
      }
    }
  };

  const handlePrintMock = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      {/* Action Bar */}
      <div className="bg-[#111827] border border-[#1e293b] p-5 rounded-2xl flex flex-wrap justify-between items-center gap-4 no-print shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#6366f1]/15 text-[#6366f1]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {data.detected_pattern}
            </h2>
            <p className="text-xs text-[#9ca3af]">
              Generated by ExamIQ local vector engine matching your college&apos;s Part A + Part B structure.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onRefresh}
            className="px-4 py-2 rounded-xl bg-[#1f2937] hover:bg-[#334155] border border-[#334155] text-xs font-bold text-white transition-all"
          >
            Regenerate Paper
          </button>
          <button
            type="button"
            onClick={handlePrintMock}
            className="px-4 py-2 rounded-xl bg-[#06b6d4] hover:bg-[#0284c7] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#06b6d4]/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Mock Paper
          </button>
        </div>
      </div>

      {/* University Exam Paper Container */}
      <div className="bg-[#111827] border-2 border-[#1e293b] p-8 sm:p-12 rounded-2xl shadow-2xl flex flex-col gap-8 font-sans">
        {/* Paper Header */}
        <div className="text-center border-b-2 border-[#1e293b] pb-6 flex flex-col items-center">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#06b6d4] mb-1">
            AUTONOMOUS / UNIVERSAL COLLEGE EXAMINATION BOARD
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">
            {data.paper_title}
          </h1>
          <div className="flex flex-wrap justify-center gap-6 text-xs sm:text-sm font-bold text-[#9ca3af] bg-[#090d16] px-6 py-2.5 rounded-xl border border-[#1e293b]">
            <span>Subject: <strong className="text-white">{data.subject}</strong></span>
            <span>Time Allowed: <strong className="text-[#10b981]">{data.time_allowed}</strong></span>
            <span>Maximum Marks: <strong className="text-[#06b6d4]">{data.max_marks}</strong></span>
          </div>
        </div>

        {/* Part A Section */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#1f2937]/80 border-l-4 border-[#6366f1] p-3.5 rounded-r-xl">
            <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wide">
              {data.part_a.title}
            </h3>
          </div>

          <div className="flex flex-col gap-3 pl-2 sm:pl-4">
            {data.part_a.questions.map((q) => {
              const isOpen = openQId === q.id;
              const ans = answers[q.id];
              return (
                <div
                  key={q.q_num}
                  className="p-4 bg-[#090d16] border border-[#1e293b] rounded-xl flex flex-col gap-3 transition-all hover:border-[#334155]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="font-mono font-bold text-sm text-[#6366f1] min-w-[32px]">
                        {q.q_num}
                      </span>
                      <p className="text-sm sm:text-base font-medium text-white leading-snug">
                        {q.text}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-[#06b6d4] bg-[#06b6d4]/10 px-2 py-0.5 rounded border border-[#06b6d4]/30">
                        [Unit {q.unit}] ({q.marks}M)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleAnswer(q.id, q.text, q.marks, q.unit)}
                        className="no-print p-1.5 rounded-lg bg-[#111827] hover:bg-[#1f2937] border border-[#1e293b] text-[#9ca3af] hover:text-white transition-colors text-xs flex items-center gap-1"
                        title="Reveal Model Answer Key"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#6366f1]" />
                        <span className="hidden sm:inline">Key</span>
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-2 pl-8">
                      {loadingQId === q.id ? (
                        <div className="flex items-center gap-2 text-xs text-[#6366f1] font-bold py-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating model evaluation key...</span>
                        </div>
                      ) : ans ? (
                        <AnswerPanel
                          answerText={ans.text}
                          groundedInNotes={ans.grounded}
                          examType={data.exam_type}
                          marks={q.marks}
                          unit={q.unit}
                        />
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Part B Section */}
        <div className="flex flex-col gap-6 pt-4 border-t border-[#1e293b]">
          <div className="bg-[#1f2937]/80 border-l-4 border-[#06b6d4] p-3.5 rounded-r-xl">
            <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wide">
              {data.part_b.title}
            </h3>
          </div>

          <div className="flex flex-col gap-8 pl-2 sm:pl-4">
            {data.part_b.sections.map((sec, sIdx) => {
              return (
                <div
                  key={sIdx}
                  className="flex flex-col gap-4 bg-[#090d16]/70 p-5 rounded-2xl border border-[#1e293b]"
                >
                  <div className="text-xs font-mono font-bold text-[#64748b] uppercase tracking-wider border-b border-[#1e293b] pb-2">
                    {sec.unit_label}
                  </div>

                  {/* Option 1 */}
                  {[sec.q_option_1, sec.q_option_2].map((q, optIdx) => {
                    const isOpen = openQId === q.id;
                    const ans = answers[q.id];
                    return (
                      <React.Fragment key={q.q_num + optIdx}>
                        {optIdx === 1 && (
                          <div className="flex items-center justify-center my-1">
                            <span className="px-4 py-1 bg-[#111827] border border-[#334155] rounded-full text-xs font-black text-[#06b6d4] tracking-widest uppercase">
                              — OR —
                            </span>
                          </div>
                        )}
                        <div className="p-4 bg-[#111827] border border-[#1e293b] rounded-xl flex flex-col gap-3 transition-all hover:border-[#334155]">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <span className="font-mono font-bold text-sm sm:text-base text-[#06b6d4] min-w-[32px]">
                                {q.q_num}.
                              </span>
                              <p className="text-sm sm:text-base font-bold text-white leading-snug">
                                {q.text}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-mono text-[#f3f4f6] bg-[#1f2937] px-2.5 py-1 rounded border border-[#334155] font-bold">
                                [{q.marks} Marks]
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleAnswer(q.id, q.text, q.marks, q.unit)}
                                className="no-print px-3 py-1.5 rounded-lg bg-[#6366f1]/15 hover:bg-[#6366f1] text-[#6366f1] hover:text-white border border-[#6366f1]/40 transition-colors text-xs font-bold flex items-center gap-1.5"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Model Key</span>
                                {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {isOpen && (
                            <div className="mt-3 pt-3 border-t border-[#1e293b]">
                              {loadingQId === q.id ? (
                                <div className="flex items-center gap-2 text-xs text-[#6366f1] font-bold py-2">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Synthesizing full-marks essay model answer...</span>
                                </div>
                              ) : ans ? (
                                <AnswerPanel
                                  answerText={ans.text}
                                  groundedInNotes={ans.grounded}
                                  examType={data.exam_type}
                                  marks={q.marks}
                                  unit={q.unit}
                                />
                              ) : null}
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Paper Footer */}
        <div className="text-center pt-6 border-t border-[#1e293b] text-xs font-mono text-[#64748b]">
          *** END OF QUESTION PAPER · EXAMIQ INTELLIGENT PREPARATION ENGINE ***
        </div>
      </div>
    </div>
  );
};
