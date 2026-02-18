import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getOccupations,
  getOccupation,
  getCountries,
  getCountryBySlug,
  getSalaryEntry,
  getSalaryEntries,
  getCitySalaryEntriesByCountry,
  getCity,
} from "@/lib/data-loader";
import { getCountryInsight } from "@/data/country-insights";
import {
  calculateBigMacCount,
  calculateGlobalPercentile,
  convertFromUSD,
} from "@/lib/salary-calculator";
import {
  formatCurrency,
  formatNumber,
  formatPercentile,
  formatUSDShort,
} from "@/lib/format";

// --- 국가+직업 FAQ 헬퍼 ---

function buildCountryFaqItems(
  occupationTitle: string,
  countryName: string,
  estimatedSalary: number,
  localSalary: number,
  currency: string,
  currencySymbol: string,
  pppAdjusted: number,
  globalPercentile: number,
  currentRank: number,
  rankedCountries: { country: { name: string }; estimatedSalary: number }[],
  bigMacCount: number,
) {
  // 인접 국가 비교 데이터 (현재 순위 기준 ±1)
  const neighborAbove = currentRank > 1 ? rankedCountries[currentRank - 2] : null;
  const neighborBelow = currentRank < rankedCountries.length ? rankedCountries[currentRank] : null;

  const neighborComparison = neighborAbove && neighborBelow
    ? `${countryName} ranks #${currentRank} globally, just behind ${neighborAbove.country.name} (${formatCurrency(neighborAbove.estimatedSalary)} USD) and ahead of ${neighborBelow.country.name} (${formatCurrency(neighborBelow.estimatedSalary)} USD).`
    : neighborAbove
      ? `${countryName} ranks #${currentRank} globally, just behind ${neighborAbove.country.name} (${formatCurrency(neighborAbove.estimatedSalary)} USD).`
      : neighborBelow
        ? `${countryName} ranks #${currentRank} globally, ahead of ${neighborBelow.country.name} (${formatCurrency(neighborBelow.estimatedSalary)} USD).`
        : `${countryName} ranks #${currentRank} out of ${rankedCountries.length} countries.`;

  const pppNote = pppAdjusted >= estimatedSalary
    ? `The purchasing power-adjusted salary is ${formatCurrency(pppAdjusted)} USD, which is higher than the nominal figure, suggesting a relatively affordable cost of living in ${countryName}.`
    : `The purchasing power-adjusted salary is ${formatCurrency(pppAdjusted)} USD, which is lower than the nominal figure, indicating a relatively higher cost of living in ${countryName}.`;

  return [
    {
      question: `What is the average ${occupationTitle} salary in ${countryName}?`,
      answer: `The estimated annual salary for a ${occupationTitle} in ${countryName} is ${formatCurrency(estimatedSalary)} USD, which is approximately ${formatCurrency(localSalary, currencySymbol)} ${currency} at current exchange rates. This places ${countryName} at #${currentRank} out of ${rankedCountries.length} countries for this occupation.`,
    },
    {
      question: `How does ${countryName}'s tax system affect ${occupationTitle} take-home pay?`,
      answer: `Tax structures vary significantly and directly impact the net income of a ${occupationTitle} earning ${formatCurrency(estimatedSalary)} USD in ${countryName}. While the gross salary provides a useful benchmark, the effective take-home pay depends on income tax brackets, social contributions, and mandatory benefits specific to ${countryName}'s tax code.`,
    },
    {
      question: `Is ${countryName} a good place to work as a ${occupationTitle}?`,
      answer: `${countryName} offers a ${occupationTitle} salary in the ${globalPercentile >= 50 ? "upper" : globalPercentile >= 30 ? "middle" : "lower"} range globally, ranking #${currentRank} out of ${rankedCountries.length} countries. ${bigMacCount > 0 ? `With a Big Mac purchasing power of ${formatNumber(bigMacCount)} burgers per year, ${countryName} ${pppAdjusted >= estimatedSalary ? "offers strong real purchasing power" : "has a higher cost of living that reduces real purchasing power"}.` : `The purchasing power-adjusted salary of ${formatCurrency(pppAdjusted)} USD provides additional context on the real value of this compensation.`}`,
    },
    {
      question: `How does ${occupationTitle} salary in ${countryName} compare to neighboring countries?`,
      answer: `${neighborComparison} Across all ${rankedCountries.length} countries tracked, ${occupationTitle}s in ${countryName} earn more than ${globalPercentile}% of their peers worldwide.`,
    },
    {
      question: `What is the cost of living impact on ${occupationTitle} salary in ${countryName}?`,
      answer: `${pppNote} ${bigMacCount > 0 ? `Using the Big Mac Index, this salary can purchase approximately ${formatNumber(bigMacCount)} Big Macs per year, providing an everyday measure of how far the salary stretches in ${countryName}.` : `Evaluating purchasing power alongside the nominal salary is essential when considering compensation in ${countryName}.`}`,
    },
  ];
}

// --- Static Params (SSG) ---
// 상위 20 직업만 빌드 타임 생성, 나머지는 on-demand ISR (Vercel 75MB 제한 대응)

import { TOP_OCCUPATIONS_FOR_SSG } from "@/lib/ssg-config";

export function generateStaticParams() {
  const occupations = getOccupations().filter((o) =>
    TOP_OCCUPATIONS_FOR_SSG.includes(o.slug)
  );
  const countries = getCountries();

  const params: { occupation: string; country: string }[] = [];

  for (const occ of occupations) {
    for (const c of countries) {
      params.push({ occupation: occ.slug, country: c.slug });
    }
  }

  return params;
}

// --- SEO Metadata ---

interface PageProps {
  params: Promise<{ occupation: string; country: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { occupation: occSlug, country: countrySlug } = await params;
  const occupation = getOccupation(occSlug);
  const country = getCountryBySlug(countrySlug);

  if (!occupation || !country) {
    return { title: "Not Found | Am I Paid Fairly?" };
  }

  const title = `${occupation.title} Salary in ${country.name} | AIPF`;
  const description = `How much does a ${occupation.title} earn in ${country.name}? See estimated salary in USD and ${country.currency}, purchasing power-adjusted salary, Big Mac Index, and global percentile ranking.`;

  const ogParams = new URLSearchParams();
  ogParams.set("title", `${occupation.title} Salary in ${country.name}`);
  ogParams.set("subtitle", `Estimated annual salary (2026)`);
  const ogImage = `/api/og?${ogParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://amipaidfairly.com/salary/${occSlug}/${countrySlug}`,
    },
  };
}

// --- Page Component ---

export default async function OccupationCountryPage({ params }: PageProps) {
  const { occupation: occSlug, country: countrySlug } = await params;
  const occupation = getOccupation(occSlug);
  const country = getCountryBySlug(countrySlug);

  // 잘못된 직업 또는 국가 → 홈으로 리다이렉트
  if (!occupation || !country) {
    redirect("/");
  }

  const salaryEntry = getSalaryEntry(occSlug, country.code);

  // 급여 데이터가 없으면 홈으로
  if (!salaryEntry) {
    redirect("/");
  }

  const insight = getCountryInsight(country.code);

  const bigMacCount = calculateBigMacCount(country.code, salaryEntry.estimatedSalary);
  const globalPercentile = calculateGlobalPercentile(occSlug, salaryEntry.estimatedSalary);
  const localSalary = convertFromUSD(salaryEntry.estimatedSalary, country.code);

  // 모든 국가의 급여 데이터 (랭킹용)
  const allEntries = getSalaryEntries(occSlug);
  const countries = getCountries();

  // 국가별 급여 정보를 합쳐서 정렬
  const rankedCountries = allEntries
    .map((entry) => {
      const c = countries.find((ct) => ct.code === entry.countryCode);
      if (!c) return null;
      return {
        country: c,
        estimatedSalary: entry.estimatedSalary,
        pppAdjusted: entry.pppAdjusted,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.estimatedSalary - a!.estimatedSalary) as {
    country: (typeof countries)[0];
    estimatedSalary: number;
    pppAdjusted: number;
  }[];

  const top5 = rankedCountries.slice(0, 5);
  const bottom5 = rankedCountries.slice(-5).reverse();
  const currentRank = rankedCountries.findIndex((r) => r.country.code === country.code) + 1;

  // 다른 국가 링크용 (현재 국가 제외)
  const otherCountries = rankedCountries.filter((r) => r.country.code !== country.code);

  // 이 국가의 도시별 연봉 데이터
  const citySalaryEntries = getCitySalaryEntriesByCountry(occSlug, country.code);
  const citiesWithSalary = citySalaryEntries
    .map((entry) => {
      const c = getCity(entry.citySlug);
      if (!c) return null;
      const vsAvg = Math.round(
        ((entry.estimatedSalary - salaryEntry.estimatedSalary) /
          salaryEntry.estimatedSalary) *
          100
      );
      return { city: c, ...entry, vsAvg };
    })
    .filter(Boolean)
    .sort((a, b) => b!.estimatedSalary - a!.estimatedSalary) as {
    city: NonNullable<ReturnType<typeof getCity>>;
    estimatedSalary: number;
    colAdjusted: number;
    citySlug: string;
    vsAvg: number;
  }[];

  // Percentile bar 색상
  const percentileColor =
    globalPercentile >= 50
      ? "bg-emerald-500"
      : globalPercentile >= 30
        ? "bg-yellow-500"
        : "bg-red-500";

  const percentileTextColor =
    globalPercentile >= 50
      ? "text-emerald-400"
      : globalPercentile >= 30
        ? "text-yellow-400"
        : "text-red-400";

  // FAQ JSON-LD 구조화 데이터 — 국가+직업별 고유 질문/답변
  const faqItems = buildCountryFaqItems(
    occupation.title,
    country.name,
    salaryEntry.estimatedSalary,
    localSalary,
    country.currency,
    country.currencySymbol,
    salaryEntry.pppAdjusted,
    globalPercentile,
    currentRank,
    rankedCountries,
    bigMacCount,
  );

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      {/* JSON-LD 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://amipaidfairly.com" },
              { "@type": "ListItem", position: 2, name: occupation.title, item: `https://amipaidfairly.com/salary/${occSlug}` },
              { "@type": "ListItem", position: 3, name: country.name, item: `https://amipaidfairly.com/salary/${occSlug}/${countrySlug}` },
            ],
          }),
        }}
      />

      <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-8">
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
          {/* Back link */}
          <Link
            href={`/salary/${occSlug}`}
            className="text-slate-500 text-sm hover:text-slate-300 transition-colors"
          >
            &larr; {occupation.title} in all countries
          </Link>

          {/* H1 & Subtitle */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 leading-tight">
              {occupation.title} Salary in {country.name} (2026)
            </h1>
            <p className="text-xs text-slate-500 mt-1">Data last updated: February 2026</p>
            <p className="text-slate-500 text-sm mt-3 flex items-center justify-center gap-2">
              <span className="text-xl">{country.flag}</span>
              Estimated based on OECD &amp; BLS data
            </p>
          </div>

          {/* Main Stats Card */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Salary Overview
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Estimated Salary (USD) */}
              <div className="bg-slate-800/50 rounded-xl p-4">
                <p className="text-slate-500 text-xs mb-1">Estimated Salary (USD)</p>
                <p className="text-2xl font-bold text-slate-50">
                  {formatCurrency(salaryEntry.estimatedSalary)}
                </p>
                <p className="text-slate-500 text-xs mt-1">per year</p>
              </div>

              {/* Local Currency */}
              <div className="bg-slate-800/50 rounded-xl p-4">
                <p className="text-slate-500 text-xs mb-1">
                  Local Currency ({country.currency})
                </p>
                <p className="text-2xl font-bold text-slate-50">
                  {formatCurrency(localSalary, country.currencySymbol)}
                </p>
                <p className="text-slate-500 text-xs mt-1">per year</p>
              </div>

              {/* Purchasing Power */}
              <div className="bg-slate-800/50 rounded-xl p-4">
                <p className="text-slate-500 text-xs mb-1">Purchasing Power</p>
                <p className="text-2xl font-bold text-slate-50">
                  {formatCurrency(salaryEntry.pppAdjusted)}
                </p>
                <p className="text-slate-500 text-xs mt-1">purchasing power</p>
              </div>

              {/* Big Mac Count */}
              <div className="bg-slate-800/50 rounded-xl p-4">
                <p className="text-slate-500 text-xs mb-1">Big Mac Power</p>
                <p className="text-2xl font-bold text-slate-50">
                  <span className="mr-1">🍔</span>
                  {bigMacCount > 0 ? formatNumber(bigMacCount) : "N/A"}
                </p>
                <p className="text-slate-500 text-xs mt-1">burgers / year</p>
              </div>
            </div>
          </div>

          {/* How does it compare? */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              How does it compare?
            </h2>

            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-300 text-sm">
                Global Percentile
              </p>
              <p className={`text-sm font-bold ${percentileTextColor}`}>
                {formatPercentile(globalPercentile)}
              </p>
            </div>

            {/* Percentile bar */}
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${percentileColor}`}
                style={{ width: `${globalPercentile}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>

            <p className="text-slate-500 text-xs mt-3">
              A {occupation.title} in {country.name} earns more than{" "}
              <span className="text-slate-300 font-medium">{globalPercentile}%</span> of{" "}
              {occupation.title}s worldwide.
              Ranked <span className="text-slate-300 font-medium">#{currentRank}</span> out of{" "}
              {rankedCountries.length} countries.
            </p>
          </div>

          {/* Top 5 Highest-Paying Countries */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Top 5 Highest-Paying Countries
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs border-b border-dark-border">
                    <th className="text-left py-2 pr-2">#</th>
                    <th className="text-left py-2">Country</th>
                    <th className="text-right py-2">Salary (USD)</th>
                    <th className="text-right py-2 pl-2">Purch. Pwr</th>
                  </tr>
                </thead>
                <tbody>
                  {top5.map((entry, idx) => {
                    const isCurrentCountry = entry.country.code === country.code;
                    return (
                      <tr
                        key={entry.country.code}
                        className={`border-b border-slate-800/50 ${
                          isCurrentCountry ? "bg-slate-800/30" : ""
                        }`}
                      >
                        <td className="py-2.5 pr-2 text-slate-500">{idx + 1}</td>
                        <td className="py-2.5">
                          {isCurrentCountry ? (
                            <span className="text-slate-50 font-medium">
                              {entry.country.flag} {entry.country.name}
                            </span>
                          ) : (
                            <Link
                              href={`/salary/${occSlug}/${entry.country.slug}`}
                              className="text-accent-blue hover:text-blue-400 transition-colors"
                            >
                              {entry.country.flag} {entry.country.name}
                            </Link>
                          )}
                        </td>
                        <td className="py-2.5 text-right text-slate-300">
                          {formatUSDShort(entry.estimatedSalary)}
                        </td>
                        <td className="py-2.5 text-right text-slate-500 pl-2">
                          {formatUSDShort(entry.pppAdjusted)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom 5 Lowest-Paying Countries */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Bottom 5 Lowest-Paying Countries
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs border-b border-dark-border">
                    <th className="text-left py-2 pr-2">#</th>
                    <th className="text-left py-2">Country</th>
                    <th className="text-right py-2">Salary (USD)</th>
                    <th className="text-right py-2 pl-2">Purch. Pwr</th>
                  </tr>
                </thead>
                <tbody>
                  {bottom5.map((entry) => {
                    const rank = rankedCountries.findIndex(
                      (r) => r.country.code === entry.country.code
                    ) + 1;
                    const isCurrentCountry = entry.country.code === country.code;
                    return (
                      <tr
                        key={entry.country.code}
                        className={`border-b border-slate-800/50 ${
                          isCurrentCountry ? "bg-slate-800/30" : ""
                        }`}
                      >
                        <td className="py-2.5 pr-2 text-slate-500">{rank}</td>
                        <td className="py-2.5">
                          {isCurrentCountry ? (
                            <span className="text-slate-50 font-medium">
                              {entry.country.flag} {entry.country.name}
                            </span>
                          ) : (
                            <Link
                              href={`/salary/${occSlug}/${entry.country.slug}`}
                              className="text-accent-blue hover:text-blue-400 transition-colors"
                            >
                              {entry.country.flag} {entry.country.name}
                            </Link>
                          )}
                        </td>
                        <td className="py-2.5 text-right text-slate-300">
                          {formatUSDShort(entry.estimatedSalary)}
                        </td>
                        <td className="py-2.5 text-right text-slate-500 pl-2">
                          {formatUSDShort(entry.pppAdjusted)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Salary by City */}
          {citiesWithSalary.length > 0 && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                {occupation.title} Salary by City in {country.name}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-500 text-xs border-b border-dark-border">
                      <th className="text-left py-2">City</th>
                      <th className="text-right py-2">Salary (USD)</th>
                      <th className="text-right py-2">COL Adjusted</th>
                      <th className="text-right py-2">vs Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citiesWithSalary.map((entry) => (
                      <tr
                        key={entry.citySlug}
                        className="border-b border-slate-800/50"
                      >
                        <td className="py-2.5">
                          <Link
                            href={`/salary/${occSlug}/${country.slug}/${entry.citySlug}`}
                            className="text-accent-blue hover:text-blue-400 transition-colors"
                          >
                            {entry.city.name}
                            {entry.city.isTechHub && (
                              <span className="ml-1.5 text-[9px] bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded">
                                Tech
                              </span>
                            )}
                          </Link>
                        </td>
                        <td className="py-2.5 text-right text-slate-300">
                          {formatUSDShort(entry.estimatedSalary)}
                        </td>
                        <td className="py-2.5 text-right text-slate-500">
                          {formatUSDShort(entry.colAdjusted)}
                        </td>
                        <td className="py-2.5 text-right">
                          <span
                            className={
                              entry.vsAvg >= 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }
                          >
                            {entry.vsAvg >= 0 ? "+" : ""}
                            {entry.vsAvg}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Country Comparison Links */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Compare {country.name} with Other Countries
            </h2>
            <p className="text-slate-500 text-xs mb-4">
              See how {occupation.title} salaries in {country.name} stack up against other countries
            </p>
            <div className="flex flex-wrap gap-2">
              {["south-korea", "japan", "germany", "united-kingdom", "france", "switzerland", "australia", "canada"].filter(
                (slug) => slug !== country.slug
              ).slice(0, 5).map((countrySlug) => (
                <Link
                  key={countrySlug}
                  href={`/compare/${occSlug}/${country.slug}-vs-${countrySlug}`}
                  className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-emerald-400 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
                >
                  {country.name} vs {countrySlug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                </Link>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <Link
                href={`/rankings/${occSlug}`}
                className="text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1"
              >
                View global rankings
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
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

          {/* Narrative Content — SEO 본문 텍스트 */}
          <article className="flex flex-col gap-6">
            <section>
              <h2 className="text-lg font-bold text-slate-100 mb-3">
                {occupation.title} Salary in {country.name}: What You Need to Know
              </h2>
              <div className="text-slate-400 text-sm leading-relaxed space-y-3">
                <p>
                  {occupation.title}s in {country.name} earn an estimated{" "}
                  <strong className="text-slate-200">
                    {formatCurrency(salaryEntry.estimatedSalary)} USD
                  </strong>{" "}
                  per year, which is approximately{" "}
                  <strong className="text-slate-200">
                    {formatCurrency(localSalary, country.currencySymbol)} {country.currency}
                  </strong>{" "}
                  at current exchange rates. This places {country.name} at{" "}
                  <strong className="text-slate-200">
                    #{currentRank} out of {rankedCountries.length} countries
                  </strong>{" "}
                  in our global salary ranking for this occupation.
                </p>
                <p>
                  Compared to the United States, where {occupation.title}s earn
                  an estimated {formatCurrency(occupation.baseUSA)} USD per year,
                  the salary in {country.name} is{" "}
                  {salaryEntry.estimatedSalary >= occupation.baseUSA ? (
                    <>
                      <strong className="text-emerald-400">
                        {Math.round(((salaryEntry.estimatedSalary - occupation.baseUSA) / occupation.baseUSA) * 100)}% higher
                      </strong>
                    </>
                  ) : (
                    <>
                      <strong className="text-red-400">
                        {Math.round(((occupation.baseUSA - salaryEntry.estimatedSalary) / occupation.baseUSA) * 100)}% lower
                      </strong>
                    </>
                  )}
                  . This difference reflects variations in local economies,
                  cost of living, labor market conditions, and industry demand
                  for {occupation.title}s in {country.name}.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-100 mb-3">
                Purchasing Power and Cost of Living
              </h2>
              <div className="text-slate-400 text-sm leading-relaxed space-y-3">
                <p>
                  While nominal salary figures provide a useful starting point,
                  they don&apos;t tell the full story. When adjusted for
                  purchasing power (using the Big Mac Index), the salary for a {occupation.title}{" "}
                  in {country.name} is equivalent to{" "}
                  <strong className="text-slate-200">
                    {formatCurrency(salaryEntry.pppAdjusted)} USD
                  </strong>
                  . This means that after accounting for differences in the cost
                  of goods and services, the real buying power of this salary is{" "}
                  {salaryEntry.pppAdjusted >= salaryEntry.estimatedSalary ? (
                    <>
                      actually <strong className="text-emerald-400">higher</strong> than the
                      nominal figure suggests, indicating a relatively lower cost
                      of living in {country.name}
                    </>
                  ) : (
                    <>
                      actually <strong className="text-red-400">lower</strong> than the
                      nominal figure suggests, indicating a relatively higher
                      cost of living in {country.name}
                    </>
                  )}
                  .
                </p>
                {bigMacCount > 0 && (
                  <p>
                    To put this in more tangible terms, using The Economist&apos;s
                    Big Mac Index as an informal measure of purchasing power, a{" "}
                    {occupation.title}&apos;s annual salary in {country.name} could
                    buy approximately{" "}
                    <strong className="text-slate-200">
                      {formatNumber(bigMacCount)} Big Macs
                    </strong>{" "}
                    per year. This everyday comparison helps illustrate the real-world
                    purchasing power of this salary beyond abstract currency conversions.
                  </p>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-100 mb-3">
                How {country.name} Compares Globally
              </h2>
              <div className="text-slate-400 text-sm leading-relaxed space-y-3">
                <p>
                  Among the {rankedCountries.length} countries we track, a{" "}
                  {occupation.title} in {country.name} earns more than{" "}
                  <strong className="text-slate-200">{globalPercentile}%</strong>{" "}
                  of {occupation.title}s worldwide.
                  {rankedCountries.length > 0 && (
                    <> The highest-paying country for this role is{" "}
                      <strong className="text-slate-200">
                        {rankedCountries[0].country.name}
                      </strong>{" "}
                      at {formatCurrency(rankedCountries[0].estimatedSalary)} USD,
                      while the lowest is{" "}
                      <strong className="text-slate-200">
                        {rankedCountries[rankedCountries.length - 1].country.name}
                      </strong>{" "}
                      at {formatCurrency(rankedCountries[rankedCountries.length - 1].estimatedSalary)} USD.
                    </>
                  )}
                </p>
                <p>
                  These estimates are derived from publicly available data
                  from the U.S. Bureau of Labor Statistics (BLS), OECD average
                  wages, World Bank purchasing power parity factors, and
                  The Economist&apos;s Big Mac Index. The salary for each country
                  is calculated by adjusting the U.S. baseline salary using
                  country-specific wage ratios and sector multipliers. While
                  these figures provide a useful benchmark, actual salaries can
                  vary significantly based on experience level, company size,
                  specific city or region, education, and industry sector.
                </p>
              </div>
            </section>
          </article>

          {/* CTA: Compare your own salary */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-block bg-accent-blue hover:bg-blue-600 transition-colors text-white font-semibold px-8 py-3 rounded-xl text-sm"
            >
              Compare your own salary
            </Link>
            <p className="text-slate-600 text-xs mt-2">
              Free &middot; No login required
            </p>
          </div>

          {/* Internal Links: Other Jobs in this Country */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Other Jobs in {country.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {getOccupations()
                .filter((o) => o.slug !== occSlug)
                .sort((a, b) => {
                  // 같은 카테고리 우선
                  if (a.category === occupation.category && b.category !== occupation.category) return -1;
                  if (a.category !== occupation.category && b.category === occupation.category) return 1;
                  return a.title.localeCompare(b.title);
                })
                .slice(0, 12)
                .map((o) => (
                  <Link
                    key={o.slug}
                    href={`/salary/${o.slug}/${countrySlug}`}
                    className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
                  >
                    {o.title}
                  </Link>
                ))}
            </div>
            <div className="mt-3">
              <Link
                href="/browse"
                className="text-accent-blue hover:text-blue-400 transition-colors text-xs"
              >
                View all occupations &rarr;
              </Link>
            </div>
          </div>

          {/* Internal Links: Other Countries */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              {occupation.title} Salary in Other Countries
            </h3>
            <div className="flex flex-wrap gap-2">
              {otherCountries.map((entry) => (
                <Link
                  key={entry.country.code}
                  href={`/salary/${occSlug}/${entry.country.slug}`}
                  className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
                >
                  {entry.country.flag} {entry.country.name}
                </Link>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href={`/salary/${occSlug}`}
                className="text-accent-blue hover:text-blue-400 transition-colors text-sm"
              >
                View all countries for {occupation.title} &rarr;
              </Link>
            </div>
          </div>

          {/* Editorial Content — AdSense 승인용 고유 콘텐츠 */}
          {insight && (
            <section className="mt-12 space-y-8">
              {/* Working as a [occupation] in [country] */}
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <h3 className="text-xl font-bold text-slate-100 mb-3">
                  Working as a {occupation.title} in {country.name}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {insight.economy} For {occupation.title}s specifically, this economic
                  landscape shapes both the availability of positions and the compensation
                  packages offered by employers. {insight.jobMarket} Understanding these
                  dynamics is essential for anyone considering a career as a {occupation.title}{" "}
                  in {country.name}, whether you are a local professional evaluating your
                  current compensation or an international worker exploring relocation
                  opportunities. The interplay between the broader economy and the specific
                  demand for {occupation.title}s means that salaries can differ significantly
                  from global averages, reflecting local market conditions, industry maturity,
                  and the overall competitiveness of the talent pool in {country.name}.
                </p>
              </div>

              {/* Tax System and Take-Home Pay */}
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <h3 className="text-xl font-bold text-slate-100 mb-3">
                  Tax System and Take-Home Pay in {country.name}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {insight.taxSystem} For a {occupation.title} earning an estimated{" "}
                  {formatCurrency(salaryEntry.estimatedSalary)} USD per year in {country.name},
                  these tax obligations can meaningfully affect take-home pay. It is important
                  to consider net income rather than gross salary when evaluating a compensation
                  offer, as the gap between the two can vary substantially depending on {country.name}&apos;s
                  tax brackets and social contribution requirements. Additionally, the benefits
                  funded by these taxes — such as healthcare, pension, and social security —
                  should be factored into the overall value of the compensation package.
                </p>
              </div>

              {/* Cost of Living and Quality of Life */}
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <h3 className="text-xl font-bold text-slate-100 mb-3">
                  Cost of Living and Quality of Life
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {insight.costOfLiving} Beyond raw numbers, quality of life for a{" "}
                  {occupation.title} in {country.name} is also influenced by work culture
                  and lifestyle norms. {insight.workCulture} These factors combined — from
                  housing and food costs to working hours and vacation policies — paint a
                  more complete picture of what it truly means to earn a {occupation.title}{" "}
                  salary in {country.name}.
                </p>
              </div>

              {/* Key Industries and Employers */}
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <h3 className="text-xl font-bold text-slate-100 mb-3">
                  Key Industries and Employers
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {insight.topIndustries} These industries represent the primary employers
                  and sectors where {occupation.title}s in {country.name} are most likely
                  to find opportunities, and they often set the benchmark for salary
                  expectations across the country.
                </p>
              </div>
            </section>
          )}

          {/* FAQ Section */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Frequently Asked Questions
            </h3>
            <div className="flex flex-col gap-4">
              {faqItems.map((item, idx) => (
                <details key={idx} className="group">
                  <summary className="text-slate-300 text-sm font-medium cursor-pointer hover:text-slate-100 transition-colors list-none flex items-center justify-between">
                    {item.question}
                    <span className="text-slate-600 group-open:rotate-180 transition-transform ml-2">
                      &#9662;
                    </span>
                  </summary>
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

          {/* Data Source Disclaimer */}
          <div className="text-center pb-6">
            <p className="text-slate-600 text-[10px]">
              Estimated based on OECD &amp; BLS data. Actual salaries vary by
              experience, company, and region. Data is for informational
              purposes only.
            </p>
            <p className="text-slate-700 text-[10px] mt-1">
              Sources:{" "}
              <a
                href="https://www.bls.gov/oes/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-500"
              >
                BLS OEWS
              </a>
              {" "}&middot;{" "}
              <a
                href="https://stats.oecd.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-500"
              >
                OECD
              </a>
              {" "}&middot;{" "}
              <a
                href="https://data.worldbank.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-500"
              >
                World Bank
              </a>
              {" "}&middot;{" "}
              <a
                href="https://github.com/TheEconomist/big-mac-data"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-500"
              >
                Big Mac Index
              </a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
