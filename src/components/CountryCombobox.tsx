"use client";

import { useState, useRef, useEffect } from "react";
import type { Country } from "@/types";

interface Props {
  countries: Country[];
  value: string; // country code
  onChange: (countryCode: string) => void;
}

export default function CountryCombobox({ countries, value, onChange }: Props) {
  const sorted = [...countries].sort((a, b) => a.name.localeCompare(b.name));
  const selected = sorted.find((c) => c.code === value);

  const [query, setQuery] = useState(selected ? `${selected.flag} ${selected.name}` : "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 인기 국가 (포커스 시 빈 쿼리일 때 표시)
  const popularCodes = ["US", "GB", "DE", "JP", "KR", "CA", "AU", "FR"];
  const popularCountries = sorted.filter((c) => popularCodes.includes(c.code));

  const filtered =
    query.length > 0
      ? sorted.filter(
          (c) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.code.toLowerCase().includes(query.toLowerCase())
        )
      : [];

  const displayList = query.length > 0 ? filtered : popularCountries;

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        // 선택된 국가가 있으면 표시 복원
        if (selected) {
          setQuery(`${selected.flag} ${selected.name}`);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selected]);

  function handleSelect(country: Country) {
    setQuery(`${country.flag} ${country.name}`);
    onChange(country.code);
    setIsOpen(false);
    setHighlightIndex(-1);
    inputRef.current?.blur();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || displayList.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, displayList.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(displayList[highlightIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      if (selected) {
        setQuery(`${selected.flag} ${selected.name}`);
      }
    }
  }

  function highlightMatch(text: string, q: string) {
    if (!q) return text;
    const lower = text.toLowerCase();
    const lq = q.toLowerCase();
    const idx = lower.indexOf(lq);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <strong className="text-white">{text.slice(idx, idx + q.length)}</strong>
        {text.slice(idx + q.length)}
      </>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!e.target.value) onChange("");
          setIsOpen(true);
          setHighlightIndex(-1);
        }}
        onFocus={() => {
          setIsOpen(true);
          // 포커스 시 텍스트 선택하여 바로 타이핑 가능하게
          if (selected) {
            setQuery("");
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search or select country"
        className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
      />
      {isOpen && displayList.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-dark-card border border-dark-border rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {query.length === 0 && (
            <li className="px-4 py-1.5 text-slate-600 text-[10px] uppercase tracking-wider font-semibold pointer-events-none">
              Popular
            </li>
          )}
          {displayList.map((country, i) => (
            <li
              key={country.code}
              onClick={() => handleSelect(country)}
              className={`px-4 py-2.5 cursor-pointer text-sm transition-colors flex items-center gap-2 ${
                i === highlightIndex
                  ? "bg-accent-blue/20 text-white"
                  : "text-slate-300 hover:bg-slate-700/50"
              }`}
            >
              <span className="text-base shrink-0">{country.flag}</span>
              <span className="font-medium">
                {query.length > 0 ? highlightMatch(country.name, query) : country.name}
              </span>
              <span className="text-slate-600 text-xs ml-auto">{country.code}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
