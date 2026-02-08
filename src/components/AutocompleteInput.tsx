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

  // Popular jobs to show when input is empty
  const popularSlugs = [
    "software-developers-applications",
    "data-scientists",
    "registered-nurses",
    "secondary-school-teachers",
    "lawyers",
    "accountants-and-auditors",
    "general-and-operations-managers",
    "marketing-managers",
  ];

  const popularJobs = occupations.filter((o) => popularSlugs.includes(o.slug));

  // Filter and group by category when typing
  const filtered = query.length > 0
    ? occupations
        .filter((o) => o.title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10)
    : [];

  // Group filtered results by category
  const groupedResults: { category: string; items: Occupation[] }[] = [];
  if (filtered.length > 0) {
    const categoryMap = new Map<string, Occupation[]>();
    filtered.forEach((occ) => {
      const category = occ.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(occ);
    });
    categoryMap.forEach((items, category) => {
      groupedResults.push({ category, items });
    });
  }

  // Flatten for keyboard navigation
  const flatResults = query.length > 0 ? filtered : popularJobs;

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
    if (!isOpen || flatResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(flatResults[highlightIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  // Helper to highlight matching text
  function highlightMatch(text: string, query: string) {
    if (!query) return <span className="font-medium">{text}</span>;

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) return <span className="font-medium">{text}</span>;

    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);

    return (
      <span className="font-medium">
        {before}
        <strong className="text-white">{match}</strong>
        {after}
      </span>
    );
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
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
      />
      {isOpen && flatResults.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-dark-card border border-dark-border rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {query.length === 0 ? (
            // Show popular jobs when empty
            <>
              <li className="px-4 py-1.5 text-slate-600 text-[10px] uppercase tracking-wider font-semibold pointer-events-none">
                Popular
              </li>
              {popularJobs.map((occ, i) => (
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
            </>
          ) : (
            // Show grouped results when typing
            <>
              {groupedResults.map((group) => (
                <div key={group.category}>
                  <li className="px-4 py-1.5 text-slate-600 text-[10px] uppercase tracking-wider font-semibold pointer-events-none">
                    {group.category}
                  </li>
                  {group.items.map((occ) => {
                    const flatIndex = flatResults.indexOf(occ);
                    return (
                      <li
                        key={occ.slug}
                        onClick={() => handleSelect(occ)}
                        className={`px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                          flatIndex === highlightIndex
                            ? "bg-accent-blue/20 text-white"
                            : "text-slate-300 hover:bg-slate-700/50"
                        }`}
                      >
                        {highlightMatch(occ.title, query)}
                        <span className="text-slate-500 ml-2 text-xs">{occ.category}</span>
                      </li>
                    );
                  })}
                </div>
              ))}
            </>
          )}
        </ul>
      )}
    </div>
  );
}
