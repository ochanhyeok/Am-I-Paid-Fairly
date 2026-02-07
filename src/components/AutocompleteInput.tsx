"use client";

import { useState, useRef, useEffect } from "react";
import type { Occupation } from "@/types";

interface Props {
  occupations: Occupation[];
  value: string;
  onChange: (occupation: Occupation | null, displayValue: string) => void;
  placeholder?: string;
}

export default function AutocompleteInput({
  occupations,
  value,
  onChange,
  placeholder = "e.g. Software Engineer",
}: Props) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = query.length > 0
    ? occupations.filter((o) =>
        o.title.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(occ: Occupation) {
    setQuery(occ.title);
    onChange(occ, occ.title);
    setIsOpen(false);
    setHighlightIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(filtered[highlightIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(null, e.target.value);
          setIsOpen(true);
          setHighlightIndex(-1);
        }}
        onFocus={() => query.length > 0 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
      />
      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-dark-card border border-dark-border rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {filtered.map((occ, i) => (
            <li
              key={occ.slug}
              onClick={() => handleSelect(occ)}
              className={`px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                i === highlightIndex
                  ? "bg-accent-blue/20 text-white"
                  : "text-slate-300 hover:bg-slate-700/50"
              }`}
            >
              <span className="font-medium">{occ.title}</span>
              <span className="text-slate-500 ml-2 text-xs">{occ.category}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
