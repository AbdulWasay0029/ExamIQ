"use client";

import React, { useState } from "react";
import { UploadZone } from "../components/UploadZone";
import { ProcessingScreen } from "../components/ProcessingScreen";
import { Dashboard } from "../components/Dashboard";
import { FileItem, QuestionCluster, ExamMode } from "../lib/types";
import { uploadFile, fetchImportantQuestions } from "../lib/api";
import toast from "react-hot-toast";

type AppState = "upload" | "processing" | "results";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("upload");
  const [subject, setSubject] = useState("");
  const [examType, setExamType] = useState<ExamMode>("Mid 1");
  const [fileCount, setFileCount] = useState(0);
  const [questions, setQuestions] = useState<QuestionCluster[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const handleAnalyze = async (
    files: FileItem[],
    subj: string,
    type: ExamMode
  ) => {
    setSubject(subj);
    setExamType(type);
    setFileCount(files.length);
    setAppState("processing");

    try {
      await Promise.all(
        files.map((fileItem) => uploadFile(fileItem, subj))
      );

      const fetched = await fetchImportantQuestions(subj, type);
      setQuestions(fetched);
    } catch (err) {
      console.error("Analysis upload/fetch failed:", err);
      try {
        const fetched = await fetchImportantQuestions(subj, type);
        setQuestions(fetched);
      } catch (e) {
        console.error(e);
        toast.error("Backend offline. Using offline dataset.");
        const osTopics = [
          {
            cluster_id: 201,
            canonical_text: "[Topic: Process Synchronization] Define binary semaphores and solve the critical section synchronization problem.",
            unit: 2,
            marks: 10,
            repetition_count: 6,
            teacher_flagged: true,
            priority_score: 36.5,
          },
          {
            cluster_id: 202,
            canonical_text: "[Topic: Deadlock Management] State the 4 Coffman conditions for deadlock and explain Banker's algorithm.",
            unit: 3,
            marks: 10,
            repetition_count: 5,
            teacher_flagged: true,
            priority_score: 31.0,
          },
          {
            cluster_id: 203,
            canonical_text: "[Topic: Page Replacement Policies] Compare FIFO, LRU, and Optimal virtual memory page replacement algorithms.",
            unit: 4,
            marks: 10,
            repetition_count: 5,
            teacher_flagged: false,
            priority_score: 25.0,
          },
        ];

        const cnTopics = [
          {
            cluster_id: 101,
            canonical_text: "[Topic: TCP Connection Handshake] Explain the 3-way handshake mechanism and sequence synchronization.",
            unit: 2,
            marks: 10,
            repetition_count: 6,
            teacher_flagged: true,
            priority_score: 34.5,
          },
          {
            cluster_id: 102,
            canonical_text: "[Topic: OSI 7-Layer Model] Detail the OSI reference model architecture and individual layer responsibilities.",
            unit: 1,
            marks: 10,
            repetition_count: 5,
            teacher_flagged: false,
            priority_score: 25.0,
          },
          {
            cluster_id: 103,
            canonical_text: "[Topic: Subnetting & CIDR] Illustrate Classless Inter-Domain Routing (CIDR) address blocks and subnet masking.",
            unit: 3,
            marks: 10,
            repetition_count: 5,
            teacher_flagged: true,
            priority_score: 28.0,
          },
        ];

        setQuestions(subj.toLowerCase().includes("operating") ? osTopics : cnTopics);
      }
    }
  };

  const handleInstantDemo = async () => {
    const subj = "Computer Networks";
    const type = "Mid 1";
    setSubject(subj);
    setExamType(type);
    setFileCount(6);
    setAppState("processing");

    try {
      const fetched = await fetchImportantQuestions(subj, type);
      setQuestions(fetched);
    } catch (err) {
      console.error(err);
      setQuestions([
        {
          cluster_id: 1,
          canonical_text: "[Topic: TCP Connection Handshake] Explain the 3-way handshake mechanism and sequence synchronization.",
          unit: 2,
          marks: 10,
          repetition_count: 6,
          teacher_flagged: true,
          priority_score: 35.0,
        },
        {
          cluster_id: 3,
          canonical_text: "[Topic: OSI 7-Layer Model] Detail the OSI reference model architecture and individual layer responsibilities.",
          unit: 1,
          marks: 10,
          repetition_count: 4,
          teacher_flagged: true,
          priority_score: 28.0,
        },
        {
          cluster_id: 2,
          canonical_text: "[Topic: Subnetting & CIDR] Illustrate Classless Inter-Domain Routing (CIDR) address blocks and subnet masking.",
          unit: 3,
          marks: 10,
          repetition_count: 5,
          teacher_flagged: false,
          priority_score: 21.0,
        },
      ]);
    }
  };

  const handleProcessingComplete = () => {
    setAppState("results");
  };

  const handleExamTypeChange = async (newType: ExamMode) => {
    setExamType(newType);
    setLoadingQuestions(true);
    try {
      const fetched = await fetchImportantQuestions(subject, newType);
      setQuestions(fetched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleReset = () => {
    setAppState("upload");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#090d16] text-[#f3f4f6]">
      {appState === "upload" && (
        <UploadZone
          onAnalyze={handleAnalyze}
          onInstantDemo={handleInstantDemo}
        />
      )}

      {appState === "processing" && (
        <ProcessingScreen
          fileCount={fileCount}
          onComplete={handleProcessingComplete}
        />
      )}

      {appState === "results" && (
        <Dashboard
          subject={subject}
          examType={examType}
          onExamTypeChange={handleExamTypeChange}
          questions={questions}
          loading={loadingQuestions}
          onResetUpload={handleReset}
        />
      )}
    </div>
  );
}
