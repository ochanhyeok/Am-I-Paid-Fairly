"use client";

import { useState } from "react";
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

interface CitySuggestion {
  cityName: string;
  citySlug: string;
  countryName: string;
  countrySlug: string;
  countryFlag: string;
  estimatedSalary: number;
  colAdjusted: number;
}

interface Props {
  result: SalaryResult;
  miniCountries: CountryComparison[];
  userSalaryFormatted: string;
  userSalaryUSDFormatted: string;
  citySuggestions?: CitySuggestion[];
}

export default function ResultClient({
  result,
  miniCountries,
  userSalaryFormatted,
  userSalaryUSDFormatted,
  citySuggestions = [],
}: Props) {
  const [showRecompare, setShowRecompare] = useState(false);
  const [newSalary, setNewSalary] = useState("");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-8">
      <div className="max-w-lg mx-auto flex flex-col gap-6">
        {/* Back link + Quick re-compare */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-slate-500 text-sm hover:text-slate-300 transition-colors"
          >
            ← New comparison
          </Link>
          <button
            onClick={() => setShowRecompare(!showRecompare)}
            className="text-slate-500 text-sm hover:text-emerald-400 transition-colors"
          >
            {showRecompare ? "Cancel" : "Change salary ▾"}
          </button>
        </div>

        {showRecompare && (
          <form action="/result" className="bg-dark-card rounded-xl p-4 border border-dark-border">
            <p className="text-slate-400 text-xs mb-2">
              Quick re-compare as {result.occupation.title} in {result.userCountry.name}
            </p>
            <input type="hidden" name="job" value={result.occupation.slug} />
            <input type="hidden" name="country" value={result.userCountry.code} />
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                  {result.userCountry.currencySymbol}
                </span>
                <input
                  type="number"
                  name="salary"
                  placeholder="Enter new salary"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  className="w-full bg-slate-800 rounded-lg pl-8 pr-3 py-2.5 text-sm text-slate-200 border border-dark-border focus:border-emerald-500 outline-none"
                  required
                  min="1"
                />
              </div>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shrink-0"
              >
                Compare
              </button>
            </div>
          </form>
        )}

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

        {/* What if you moved? — City suggestions */}
        {citySuggestions.length > 0 && (
          <div className="bg-dark-card rounded-2xl p-5 border border-dark-border">
            <h3 className="text-slate-200 font-bold text-sm mb-1">
              What if you moved?
            </h3>
            <p className="text-slate-500 text-xs mb-3">
              Estimated {result.occupation.title} salary in other cities
            </p>
            <div className="grid grid-cols-2 gap-2">
              {citySuggestions.map((city) => (
                <Link
                  key={city.citySlug}
                  href={`/salary/${result.occupation.slug}/${city.countrySlug}/${city.citySlug}`}
                  className="bg-slate-800/50 hover:bg-slate-700/50 rounded-xl p-3 border border-dark-border hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{city.countryFlag}</span>
                    <span className="text-xs text-slate-300 font-medium truncate">{city.cityName}</span>
                  </div>
                  <p className="text-emerald-400 font-bold text-sm">
                    ${Math.round(city.estimatedSalary).toLocaleString("en-US")}
                  </p>
                  <p className="text-slate-500 text-[10px]">
                    Real value: ${Math.round(city.colAdjusted).toLocaleString("en-US")}
                  </p>
                </Link>
              ))}
            </div>
            <Link
              href="/relocate"
              className="block mt-3 text-center text-xs text-slate-400 hover:text-emerald-400 transition-colors"
            >
              Try Relocation Calculator for detailed analysis →
            </Link>
          </div>
        )}

        {/* Popular Comparisons */}
        <div className="bg-dark-card rounded-2xl p-5 border border-dark-border">
          <h3 className="text-slate-200 font-bold text-sm mb-3">
            Popular Comparisons
          </h3>
          <div className="flex flex-col gap-1.5">
            {[
              { pair: "united-states-vs-india", label: "US vs India" },
              { pair: "united-states-vs-united-kingdom", label: "US vs UK" },
              { pair: "united-states-vs-germany", label: "US vs Germany" },
              { pair: "united-states-vs-japan", label: "US vs Japan" },
              { pair: "south-korea-vs-japan", label: "Korea vs Japan" },
              { pair: "united-states-vs-canada", label: "US vs Canada" },
            ].map((p) => (
              <Link
                key={p.pair}
                href={`/compare/${result.occupation.slug}/${p.pair}`}
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
              >
                {result.occupation.title}: {p.label} →
              </Link>
            ))}
          </div>
          <div className="border-t border-dark-border mt-3 pt-3">
            <p className="text-slate-500 text-[10px] mb-2">City Comparisons</p>
            <div className="flex flex-col gap-1.5">
              {[
                { pair: "new-york-vs-london", label: "New York vs London" },
                { pair: "singapore-vs-tokyo", label: "Singapore vs Tokyo" },
                { pair: "seoul-vs-singapore", label: "Seoul vs Singapore" },
              ].map((p) => (
                <Link
                  key={p.pair}
                  href={`/compare-cities/${result.occupation.slug}/${p.pair}`}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  {result.occupation.title}: {p.label} →
                </Link>
              ))}
            </div>
          </div>
        </div>

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
