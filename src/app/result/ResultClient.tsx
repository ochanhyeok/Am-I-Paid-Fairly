"use client";

import dynamic from "next/dynamic";
import type { SalaryResult, CountryComparison } from "@/types";
import ResultCard from "@/components/ResultCard";
import CountryMiniCards from "@/components/CountryMiniCards";
import CountryComparisonList from "@/components/CountryComparison";
import ShareCard from "@/components/ShareCard";
import AdUnit from "@/components/AdUnit";
import Link from "next/link";

// Lazy load ChoroplethMap with loading skeleton
const ChoroplethMap = dynamic(
  () => import("@/components/ChoroplethMap"),
  {
    ssr: false,
    loading: () => (
      <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
        <div className="h-4 w-48 bg-slate-700/50 rounded animate-pulse mb-3" />
        <div className="relative bg-slate-950 rounded-xl overflow-hidden h-[200px] sm:h-[250px] flex items-center justify-center">
          <div className="text-slate-600 text-sm animate-pulse">
            Loading map...
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="h-2 w-32 bg-slate-700/50 rounded animate-pulse" />
        </div>
      </div>
    ),
  }
);

interface Props {
  result: SalaryResult;
  miniCountries: CountryComparison[];
  userSalaryFormatted: string;
  userSalaryUSDFormatted: string;
}

export default function ResultClient({
  result,
  miniCountries,
  userSalaryFormatted,
  userSalaryUSDFormatted,
}: Props) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-8">
      <div className="max-w-lg mx-auto flex flex-col gap-6">
        {/* Back link */}
        <Link
          href="/"
          className="text-slate-500 text-sm hover:text-slate-300 transition-colors"
        >
          ← Compare another salary
        </Link>

        {/* User input summary */}
        <div className="text-center">
          <p className="text-slate-500 text-sm">
            {result.occupation.title} in {result.userCountry.name}
          </p>
          <p className="text-3xl font-extrabold text-slate-50 mt-1">
            {userSalaryFormatted}
          </p>
          <p className="text-slate-500 text-sm mt-1">
            ≈ {userSalaryUSDFormatted} USD
          </p>
        </div>

        {/* Percentile card */}
        <ResultCard
          percentile={result.globalPercentile}
          occupationTitle={result.occupation.title}
        />

        {/* Mini country cards */}
        <CountryMiniCards comparisons={miniCountries} />

        {/* Ad slot 1 */}
        <AdUnit slot="result-top" format="horizontal" />

        {/* World map */}
        <ChoroplethMap
          comparisons={result.countryComparisons}
          userSalaryUSD={result.userSalaryUSD}
          occupationTitle={result.occupation.title}
        />

        {/* Full country comparison */}
        <CountryComparisonList
          comparisons={result.countryComparisons}
          userCountryCode={result.userCountry.code}
        />

        {/* Ad slot 2 */}
        <AdUnit slot="result-bottom" format="rectangle" />

        {/* Share card */}
        <ShareCard
          percentile={result.globalPercentile}
          occupationTitle={result.occupation.title}
          miniCountries={miniCountries}
          userCountryCode={result.userCountry.code}
          bigMacCount={
            result.countryComparisons.find(
              (c) => c.country.code === result.userCountry.code
            )?.bigMacCount ?? 0
          }
        />

        {/* Explore more links */}
        <div className="bg-dark-card rounded-2xl p-5 border border-dark-border">
          <h3 className="text-slate-200 font-bold text-sm mb-3">
            Explore More
          </h3>
          <div className="flex flex-col gap-2">
            <Link
              href={`/salary/${result.occupation.slug}`}
              className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
            >
              {result.occupation.title} salary in all {result.countryComparisons.length} countries →
            </Link>
            <Link
              href={`/salary/${result.occupation.slug}/${result.userCountry.slug}`}
              className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
            >
              {result.occupation.title} salary in {result.userCountry.name} — detailed breakdown →
            </Link>
            <Link
              href={`/rankings/${result.occupation.slug}`}
              className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
            >
              Global rankings for {result.occupation.title}s →
            </Link>
            <Link
              href="/browse"
              className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
            >
              Browse all 175+ occupations →
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-slate-600 text-[10px] text-center pb-4">
          Estimated based on OECD &amp; BLS data. Actual salaries vary by
          experience, company, and region.{" "}
          <a
            href="https://stats.oecd.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Data sources
          </a>
        </p>
      </div>
    </main>
  );
}
