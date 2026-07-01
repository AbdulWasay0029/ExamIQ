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
        setQuestions([
          {
            cluster_id: 101,
            canonical_text: "Explain the working of TCP 3-way handshake with a neat diagram.",
            unit: 2,
            marks: 10,
            repetition_count: 6,
            teacher_flagged: true,
            priority_score: 34.5,
          },
          {
            cluster_id: 102,
            canonical_text: "Differentiate between OSI and TCP/IP reference models with layered architecture.",
            unit: 1,
            marks: 10,
            repetition_count: 5,
            teacher_flagged: false,
            priority_score: 25.0,
          },
        ]);
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
          canonical_text: "Explain the working of TCP 3-way handshake with a neat diagram.",
          unit: 2,
          marks: 10,
          repetition_count: 6,
          teacher_flagged: true,
          priority_score: 35.0,
        },
        {
          cluster_id: 3,
          canonical_text: "Differentiate between OSI and TCP/IP reference models with layered architecture.",
          unit: 1,
          marks: 10,
          repetition_count: 4,
          teacher_flagged: true,
          priority_score: 28.0,
        },
        {
          cluster_id: 2,
          canonical_text: "What is CIDR? Explain IP subnetting and classless routing with an example.",
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
