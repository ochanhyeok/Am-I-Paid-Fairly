"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface RecentSearch {
  occupationSlug: string;
  occupationTitle: string;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  salary: string;
  timestamp: number;
}

const STORAGE_KEY = "aipf_recent_searches";
const MAX_ITEMS = 5;

export function saveRecentSearch(search: Omit<RecentSearch, "timestamp">) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const existing: RecentSearch[] = stored ? JSON.parse(stored) : [];

    // 중복 제거 (같은 직업+국가)
    const filtered = existing.filter(
      (s) =>
        s.occupationSlug !== search.occupationSlug ||
        s.countryCode !== search.countryCode
    );

    const updated: RecentSearch[] = [
      { ...search, timestamp: Date.now() },
      ...filtered,
    ].slice(0, MAX_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage 비활성 시 무시
  }
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function RecentSearches() {
  const [searches, setSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSearches(parsed.slice(0, MAX_ITEMS));
        }
      }
    } catch {
      // localStorage 비활성 시 무시
    }
  }, []);

  if (searches.length === 0) return null;

  return (
    <div className="w-full max-w-md">
      <h2 className="text-sm font-semibold text-slate-300 mb-3 text-center">
        Recent Searches
      </h2>
      <div className="flex flex-col gap-1.5">
        {searches.map((search, idx) => {
          const params = new URLSearchParams();
          params.set("job", search.occupationSlug);
          params.set("country", search.countryCode);
          params.set("salary", search.salary);

          return (
            <Link
              key={`${search.occupationSlug}-${search.countryCode}-${idx}`}
              href={`/result?${params.toString()}`}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800/40 border border-dark-border hover:border-slate-600 transition-colors group"
            >
              <span className="text-lg shrink-0">{search.countryFlag}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 font-medium truncate group-hover:text-white transition-colors">
                  {search.occupationTitle}
                </p>
                <p className="text-xs text-slate-500">{search.countryName}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm text-slate-400 font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {Number(search.salary).toLocaleString("en-US")}
                </p>
                <p className="text-[10px] text-slate-600">{timeAgo(search.timestamp)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
