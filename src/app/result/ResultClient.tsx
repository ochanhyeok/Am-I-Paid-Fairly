"use client";

import type { SalaryResult, CountryComparison } from "@/types";
import ResultCard from "@/components/ResultCard";
import CountryMiniCards from "@/components/CountryMiniCards";
import ChoroplethMap from "@/components/ChoroplethMap";
import CountryComparisonList from "@/components/CountryComparison";
import ShareCard from "@/components/ShareCard";
import Link from "next/link";

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
