"use client";

import { useState, useRef, useEffect } from "react";
import type { City, Country } from "@/types";

interface Props {
  cities: City[];
  countries: Country[];
  value: string; // city slug
  onChange: (citySlug: string) => void;
  placeholder?: string;
}

export default function CityCombobox({ cities, countries, value, onChange, placeholder }: Props) {
  const sorted = [...cities].sort((a, b) => a.name.localeCompare(b.name));
  const selected = sorted.find((c) => c.slug === value);

  // 국가 코드 → Country 객체 룩업
  function getCountry(countryCode: string) {
    return countries.find((c) => c.code === countryCode);
  }

  const selectedCountry = selected ? getCountry(selected.countryCode) : undefined;

  const [query, setQuery] = useState(
    selected && selectedCountry
      ? `${selectedCountry.flag} ${selected.name}, ${selected.countryCode}`
      : ""
  );
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 인기 도시 (포커스 시 빈 쿼리일 때 표시)
  const popularSlugs = [
    "new-york",
    "london",
    "tokyo",
    "san-francisco",
    "seoul",
    "singapore",
    "berlin",
    "sydney",
  ];
  const popularCities = sorted.filter((c) => popularSlugs.includes(c.slug));

  const filtered =
    query.length > 0
      ? sorted.filter((c) => {
          const country = getCountry(c.countryCode);
          const countryName = country?.name ?? "";
          return (
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            countryName.toLowerCase().includes(query.toLowerCase())
          );
        })
      : [];

  const displayList = query.length > 0 ? filtered : popularCities;

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        if (selected && selectedCountry) {
          setQuery(`${selectedCountry.flag} ${selected.name}, ${selected.countryCode}`);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selected, selectedCountry]);

  function handleSelect(city: City) {
    const country = getCountry(city.countryCode);
    setQuery(country ? `${country.flag} ${city.name}, ${city.countryCode}` : city.name);
    onChange(city.slug);
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
      if (selected && selectedCountry) {
        setQuery(`${selectedCountry.flag} ${selected.name}, ${selected.countryCode}`);
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
          if (selected) {
            setQuery("");
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? "Search or select city"}
        className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
      />
      {isOpen && displayList.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-dark-card border border-dark-border rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {query.length === 0 && (
            <li className="px-4 py-1.5 text-slate-600 text-[10px] uppercase tracking-wider font-semibold pointer-events-none">
              Popular
            </li>
          )}
          {displayList.map((city, i) => {
            const country = getCountry(city.countryCode);
            return (
              <li
                key={city.slug}
                onClick={() => handleSelect(city)}
                className={`px-4 py-2.5 cursor-pointer text-sm transition-colors flex items-center gap-2 ${
                  i === highlightIndex
                    ? "bg-accent-blue/20 text-white"
                    : "text-slate-300 hover:bg-slate-700/50"
                }`}
              >
                <span className="text-base shrink-0">{country?.flag ?? ""}</span>
                <span className="font-medium">
                  {query.length > 0 ? highlightMatch(city.name, query) : city.name}
                </span>
                <span className="text-slate-600 text-xs ml-auto">
                  {country?.name ?? city.countryCode}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
