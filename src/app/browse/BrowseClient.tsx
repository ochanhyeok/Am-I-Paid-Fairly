"use client";

import { useState } from "react";
import Link from "next/link";
import type { Occupation } from "@/types";

const categoryIcons: Record<string, string> = {
  Tech: "\uD83D\uDCBB",
  Healthcare: "\uD83C\uDFE5",
  Finance: "\uD83D\uDCB0",
  Engineering: "\u2699\uFE0F",
  Business: "\uD83D\uDCCA",
  Legal: "\u2696\uFE0F",
  Education: "\uD83D\uDCDA",
  Trades: "\uD83D\uDD27",
  Science: "\uD83D\uDD2C",
  Service: "\uD83D\uDECE\uFE0F",
  Transportation: "\uD83D\uDE9B",
  Design: "\uD83C\uDFA8",
  Media: "\uD83D\uDCFA",
  "Public Service": "\uD83C\uDFDB\uFE0F",
  Agriculture: "\uD83C\uDF3E",
};

interface Props {
  occupations: Occupation[];
  categories: [string, Occupation[]][];
}

export default function BrowseClient({ occupations, categories }: Props) {
  const [search, setSearch] = useState("");

  const query = search.toLowerCase().trim();

  // 검색 중이면 전체 필터링, 아니면 카테고리별 표시
  const filteredOccupations = query
    ? occupations.filter((o) => o.title.toLowerCase().includes(query))
    : [];

  const isSearching = query.length > 0;

  return (
    <>
      {/* 검색 */}
      <div className="relative max-w-md mx-auto mb-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search occupations..."
          className="w-full bg-dark-card border border-dark-border rounded-lg pl-11 pr-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors text-sm"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>

      {isSearching ? (
        // 검색 결과
        <div>
          <p className="text-slate-500 text-sm mb-4">
            {filteredOccupations.length} result{filteredOccupations.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
          </p>
          {filteredOccupations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredOccupations.map((occ) => (
                <Link
                  key={occ.slug}
                  href={`/salary/${occ.slug}`}
                  className="group flex items-center justify-between bg-dark-card border border-dark-border rounded-lg px-4 py-3 hover:border-slate-600 hover:bg-slate-800/50 transition-colors"
                >
                  <div>
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                      {occ.title}
                    </span>
                    <span className="text-xs text-slate-600 ml-2">
                      {occ.category}
                    </span>
                  </div>
                  <span className="text-xs text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0 ml-2">
                    ${(occ.baseUSA / 1000).toFixed(0)}K
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 text-sm text-center py-8">
              No occupations found. Try a different search term.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Category quick nav */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map(([category, items]) => (
              <a
                key={category}
                href={`#${category.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-xs bg-dark-card border border-dark-border hover:border-slate-600 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-full transition-colors"
              >
                {categoryIcons[category] || "\uD83D\uDCCB"} {category} ({items.length})
              </a>
            ))}
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-10">
            {categories.map(([category, items]) => (
              <section
                key={category}
                id={category.toLowerCase().replace(/\s+/g, "-")}
              >
                <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <span className="text-xl">
                    {categoryIcons[category] || "\uD83D\uDCCB"}
                  </span>
                  {category}
                  <span className="text-sm font-normal text-slate-500">
                    ({items.length})
                  </span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {[...items]
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map((occ) => (
                      <Link
                        key={occ.slug}
                        href={`/salary/${occ.slug}`}
                        className="group flex items-center justify-between bg-dark-card border border-dark-border rounded-lg px-4 py-3 hover:border-slate-600 hover:bg-slate-800/50 transition-colors"
                      >
                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                          {occ.title}
                        </span>
                        <span className="text-xs text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0 ml-2">
                          ${(occ.baseUSA / 1000).toFixed(0)}K
                        </span>
                      </Link>
                    ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </>
  );
}
