import type { Metadata } from "next";
import Link from "next/link";
import { getOccupations } from "@/lib/data-loader";
import type { Occupation } from "@/types";
import BrowseClient from "./BrowseClient";

export const metadata: Metadata = {
  title: "Browse All Occupations | Am I Paid Fairly?",
  description:
    "Explore salary data for 175 occupations across 42 countries. Compare salaries by category: Tech, Healthcare, Finance, Engineering, and more.",
  openGraph: {
    title: "Browse All Occupations | Am I Paid Fairly?",
    description: "Explore salary data for 175 occupations across 42 countries.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse All Occupations | Am I Paid Fairly?",
    description: "Explore salary data for 175 occupations across 42 countries.",
  },
  alternates: {
    canonical: "https://amipaidfairly.com/browse",
  },
};

export default function BrowsePage() {
  const occupations = getOccupations();

  // 카테고리별 그룹화
  const grouped = new Map<string, Occupation[]>();
  occupations.forEach((occ) => {
    if (!grouped.has(occ.category)) {
      grouped.set(occ.category, []);
    }
    grouped.get(occ.category)!.push(occ);
  });

  // 카테고리 수 기준 내림차순 정렬
  const sortedCategories: [string, Occupation[]][] = Array.from(
    grouped.entries()
  ).sort((a, b) => b[1].length - a[1].length);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">Browse Occupations</span>
        </nav>

        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 leading-tight">
            Browse All Occupations
          </h1>
          <p className="text-slate-400 text-sm mt-3">
            {occupations.length} occupations across{" "}
            {sortedCategories.length} categories · 42 countries
          </p>
        </header>

        {/* Client component with search */}
        <BrowseClient
          occupations={occupations}
          categories={sortedCategories}
        />

        {/* CTA */}
        <div className="text-center py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full text-sm transition-colors"
          >
            Compare your own salary
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
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
