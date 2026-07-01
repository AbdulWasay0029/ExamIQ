"use client";

import React from "react";
import { FileItem, SourceType } from "../lib/types";
import { X, Star, FileText } from "lucide-react";

interface FileRowProps {
  item: FileItem;
  onUpdate: (id: string, updates: Partial<FileItem>) => void;
  onRemove: (id: string) => void;
}

const SOURCE_TYPES: SourceType[] = [
  "PYQ",
  "Notes",
  "Teacher Hint",
  "Syllabus",
  "Friend Photo",
];

export const FileRow: React.FC<FileRowProps> = ({ item, onUpdate, onRemove }) => {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 bg-[#111827] border p-3.5 rounded-xl transition-all duration-200 ${
        item.starred
          ? "border-[#f59e0b]/60 bg-[#f59e0b]/5 shadow-sm shadow-[#f59e0b]/10"
          : "border-[#1e293b] hover:border-[#334155]"
      }`}
    >
      <div className="flex items-center gap-3 min-w-[180px] max-w-[260px] flex-1">
        <div className={`p-2 rounded-lg ${item.starred ? "bg-[#f59e0b]/15 text-[#f59e0b]" : "bg-[#1f2937] text-[#6366f1]"}`}>
          <FileText className="w-4 h-4 shrink-0" />
        </div>
        <div className="flex flex-col truncate">
          <span className="text-sm font-medium text-[#f3f4f6] truncate" title={item.name}>
            {item.name}
          </span>
          <span className="text-[11px] text-[#64748b]">
            {(item.size / 1024).toFixed(1)} KB
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={item.sourceType}
          onChange={(e) =>
            onUpdate(item.id, {
              sourceType: e.target.value as SourceType,
              starred: e.target.value === "Teacher Hint" ? true : item.starred,
            })
          }
          className="bg-[#090d16] border border-[#1e293b] text-xs font-medium px-2.5 py-1.5 rounded-lg text-[#f3f4f6] focus:outline-none focus:border-[#6366f1] transition-colors"
        >
          {SOURCE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {item.sourceType === "PYQ" && (
          <input
            type="text"
            placeholder="Year (e.g. 2024)"
            value={item.year || ""}
            onChange={(e) => onUpdate(item.id, { year: e.target.value })}
            className="w-24 bg-[#090d16] border border-[#1e293b] text-xs font-mono px-2.5 py-1.5 rounded-lg text-[#f3f4f6] placeholder-[#64748b] focus:outline-none focus:border-[#6366f1] transition-colors"
          />
        )}

        <button
          type="button"
          onClick={() => onUpdate(item.id, { starred: !item.starred })}
          title="Mark as Teacher Hint priority (boosts importance rank)"
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            item.starred
              ? "bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40 shadow-sm"
              : "bg-[#1f2937]/60 text-[#9ca3af] hover:text-[#f3f4f6] border border-transparent"
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${item.starred ? "fill-[#f59e0b]" : ""}`} />
          <span className="hidden sm:inline">Priority</span>
        </button>

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          title="Remove file"
          className="p-1.5 text-[#64748b] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
