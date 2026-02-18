import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getOccupations,
  getOccupation,
  getCountries,
  getCountryBySlug,
  getCities,
  getCity,
  getCitiesByCountry,
  getCitySalaryEntry,
  getCitySalaryEntries,
  getCitySalaryEntriesByCountry,
  getSalaryEntry,
} from "@/lib/data-loader";
import {
  calculateCityBigMacCount,
  calculateCityPercentile,
  convertFromUSD,
} from "@/lib/salary-calculator";
import {
  formatCurrency,
  formatNumber,
  formatPercentile,
  formatUSDShort,
} from "@/lib/format";

// --- Static Params (SSG) ---
// 상위 20 직업만 빌드 타임 생성, 나머지는 on-demand ISR (Vercel 75MB 제한 대응)

import { TOP_OCCUPATIONS_FOR_SSG } from "@/lib/ssg-config";

export function generateStaticParams() {
  const occupations = getOccupations().filter((o) =>
    TOP_OCCUPATIONS_FOR_SSG.includes(o.slug)
  );
  const countries = getCountries();
  const cities = getCities();

  const params: { occupation: string; country: string; city: string }[] = [];

  for (const occ of occupations) {
    for (const city of cities) {
      const country = countries.find((c) => c.code === city.countryCode);
      if (!country) continue;
      params.push({
        occupation: occ.slug,
        country: country.slug,
        city: city.slug,
      });
    }
  }

  return params;
}

// --- SEO Metadata ---

interface PageProps {
  params: Promise<{ occupation: string; country: string; city: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { occupation: occSlug, country: countrySlug, city: citySlug } = await params;
  const occupation = getOccupation(occSlug);
  const country = getCountryBySlug(countrySlug);
  const city = getCity(citySlug);

  if (!occupation || !country || !city) {
    return { title: "Not Found | Am I Paid Fairly?" };
  }

  const citySalary = getCitySalaryEntry(occSlug, citySlug);
  const salaryText = citySalary
    ? `${formatCurrency(citySalary.estimatedSalary)} USD`
    : "salary data";

  const title = `${occupation.title} Salary in ${city.name}, ${country.name} (2026) | Am I Paid Fairly?`;
  const description = `Estimated ${occupation.title} salary in ${city.name}: ${salaryText}. See cost of living adjustment, purchasing power, and how ${city.name} compares to 86 global cities.`;

  const ogParams = new URLSearchParams();
  ogParams.set("title", `${occupation.title} Salary in ${city.name}`);
  ogParams.set("subtitle", `${country.name} (2026)`);
  if (citySalary) ogParams.set("salary", `${formatCurrency(citySalary.estimatedSalary)} USD`);
  const ogImage = `/api/og?${ogParams.toString()}`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: [ogImage] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
    alternates: {
      canonical: `https://amipaidfairly.com/salary/${occSlug}/${countrySlug}/${citySlug}`,
    },
  };
}

// --- Page Component ---

export default async function CityDetailPage({ params }: PageProps) {
  const { occupation: occSlug, country: countrySlug, city: citySlug } = await params;
  const occupation = getOccupation(occSlug);
  const country = getCountryBySlug(countrySlug);
  const city = getCity(citySlug);

  if (!occupation || !country || !city) {
    redirect("/");
  }

  const citySalary = getCitySalaryEntry(occSlug, citySlug);
  const countrySalary = getSalaryEntry(occSlug, country.code);

  if (!citySalary || !countrySalary) {
    redirect("/");
  }

  const bigMacCount = calculateCityBigMacCount(country.code, citySalary.estimatedSalary);
  const cityPercentile = calculateCityPercentile(occSlug, citySalary.estimatedSalary);
  const localSalary = convertFromUSD(citySalary.estimatedSalary, country.code);

  // 같은 나라의 다른 도시
  const sameCountryCities = getCitySalaryEntriesByCountry(occSlug, country.code);
  const sameCountryCitiesWithInfo = sameCountryCities
    .map((entry) => {
      const c = getCity(entry.citySlug);
      if (!c) return null;
      return { city: c, ...entry };
    })
    .filter(Boolean)
    .sort((a, b) => b!.estimatedSalary - a!.estimatedSalary) as (typeof sameCountryCities[0] & { city: NonNullable<ReturnType<typeof getCity>> })[];

  // 전 세계 비슷한 연봉 도시 (±15%)
  const allCityEntries = getCitySalaryEntries(occSlug);
  const lowerBound = citySalary.estimatedSalary * 0.85;
  const upperBound = citySalary.estimatedSalary * 1.15;
  const similarCities = allCityEntries
    .filter(
      (e) =>
        e.citySlug !== citySlug &&
        e.estimatedSalary >= lowerBound &&
        e.estimatedSalary <= upperBound
    )
    .map((entry) => {
      const c = getCity(entry.citySlug);
      const ctry = c ? getCountryBySlug(
        getCountries().find((co) => co.code === entry.countryCode)?.slug || ""
      ) : undefined;
      if (!c || !ctry) return null;
      return { city: c, country: ctry, ...entry };
    })
    .filter(Boolean)
    .sort((a, b) => b!.estimatedSalary - a!.estimatedSalary)
    .slice(0, 10) as { city: NonNullable<ReturnType<typeof getCity>>; country: NonNullable<ReturnType<typeof getCountryBySlug>>; estimatedSalary: number; colAdjusted: number }[];

  // 도시 vs 국가 평균 비교
  const vsCountryPercent = Math.round(
    ((citySalary.estimatedSalary - countrySalary.estimatedSalary) /
      countrySalary.estimatedSalary) *
      100
  );

  // Percentile 색상
  const percentileColor =
    cityPercentile >= 50
      ? "bg-emerald-500"
      : cityPercentile >= 30
        ? "bg-yellow-500"
        : "bg-red-500";

  const percentileTextColor =
    cityPercentile >= 50
      ? "text-emerald-400"
      : cityPercentile >= 30
        ? "text-yellow-400"
        : "text-red-400";

  // FAQ JSON-LD
  const faqItems = [
    {
      question: `How much does a ${occupation.title} earn in ${city.name}, ${country.name}?`,
      answer: `The estimated annual salary for a ${occupation.title} in ${city.name} is ${formatCurrency(citySalary.estimatedSalary)} USD (approximately ${formatCurrency(localSalary, country.currencySymbol)} ${country.currency}). This estimate accounts for the city's cost of living relative to the national average.`,
    },
    {
      question: `How does ${city.name} compare to the ${country.name} national average for ${occupation.title}s?`,
      answer: `A ${occupation.title} in ${city.name} earns ${Math.abs(vsCountryPercent)}% ${vsCountryPercent >= 0 ? "more" : "less"} than the ${country.name} national average of ${formatCurrency(countrySalary.estimatedSalary)} USD.`,
    },
    {
      question: `What is the cost of living adjusted salary for a ${occupation.title} in ${city.name}?`,
      answer: `After adjusting for cost of living, the real purchasing power of a ${occupation.title} salary in ${city.name} is equivalent to ${formatCurrency(citySalary.colAdjusted)} USD. The city has a cost of living multiplier of ${city.colMultiplier}x relative to the national average.`,
    },
    {
      question: `How does ${city.name} rank globally for ${occupation.title} salaries?`,
      answer: `A ${occupation.title} in ${city.name} earns more than ${cityPercentile}% of ${occupation.title}s across 86+ global cities.`,
    },
  ];

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

  // 바 비교용 최대값 계산
  const maxBarSalary = Math.max(citySalary.estimatedSalary, countrySalary.estimatedSalary);

  return (
    <>
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
              { "@type": "ListItem", position: 4, name: city.name, item: `https://amipaidfairly.com/salary/${occSlug}/${countrySlug}/${citySlug}` },
            ],
          }),
        }}
      />

      <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-8">
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-slate-500 text-sm flex-wrap">
            <Link href={`/salary/${occSlug}`} className="hover:text-slate-300 transition-colors">
              {occupation.title}
            </Link>
            <span>/</span>
            <Link href={`/salary/${occSlug}/${countrySlug}`} className="hover:text-slate-300 transition-colors">
              {country.flag} {country.name}
            </Link>
            <span>/</span>
            <span className="text-slate-300">{city.name}</span>
          </nav>

          {/* H1 & Subtitle */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 leading-tight">
              {occupation.title} Salary in {city.name} (2026)
            </h1>
            <p className="text-xs text-slate-500 mt-1">Data last updated: February 2026</p>
            <p className="text-slate-500 text-sm mt-3 flex items-center justify-center gap-2">
              <span className="text-xl">{country.flag}</span>
              {city.name}, {country.name}
              {city.isTechHub && (
                <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  Tech Hub
                </span>
              )}
              {city.isCapital && (
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  Capital
                </span>
              )}
            </p>
            <p className="text-slate-600 text-xs mt-2">
              Estimated based on OECD &amp; BLS data, adjusted for city cost of living
            </p>
          </div>

          {/* Salary Cards */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Salary Overview
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <p className="text-slate-500 text-xs mb-1">City Salary (USD)</p>
                <p className="text-2xl font-bold text-slate-50">
                  {formatCurrency(citySalary.estimatedSalary)}
                </p>
                <p className="text-slate-500 text-xs mt-1">per year</p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4">
                <p className="text-slate-500 text-xs mb-1">
                  Local ({country.currency})
                </p>
                <p className="text-2xl font-bold text-slate-50">
                  {formatCurrency(localSalary, country.currencySymbol)}
                </p>
                <p className="text-slate-500 text-xs mt-1">per year</p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4">
                <p className="text-slate-500 text-xs mb-1">COL-Adjusted</p>
                <p className="text-2xl font-bold text-slate-50">
                  {formatCurrency(citySalary.colAdjusted)}
                </p>
                <p className="text-slate-500 text-xs mt-1">real purchasing power</p>
              </div>

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

          {/* City vs Country Average */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              {city.name} vs {country.name} Average
            </h2>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-300 text-sm">{city.name}</span>
                  <span className="text-slate-300 text-sm font-semibold">
                    {formatUSDShort(citySalary.estimatedSalary)}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      vsCountryPercent >= 0 ? "bg-emerald-500" : "bg-slate-600"
                    }`}
                    style={{
                      width: `${maxBarSalary > 0 ? (citySalary.estimatedSalary / maxBarSalary) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-300 text-sm">{country.name} avg</span>
                  <span className="text-slate-300 text-sm font-semibold">
                    {formatUSDShort(countrySalary.estimatedSalary)}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      vsCountryPercent < 0 ? "bg-emerald-500" : "bg-slate-600"
                    }`}
                    style={{
                      width: `${maxBarSalary > 0 ? (countrySalary.estimatedSalary / maxBarSalary) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <p className="text-sm mt-2">
                {vsCountryPercent >= 0 ? (
                  <span className="text-emerald-400 font-semibold">
                    +{vsCountryPercent}% above national average
                  </span>
                ) : (
                  <span className="text-red-400 font-semibold">
                    {vsCountryPercent}% below national average
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Global City Percentile */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Global City Ranking
            </h2>

            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-300 text-sm">City Percentile</p>
              <p className={`text-sm font-bold ${percentileTextColor}`}>
                {formatPercentile(cityPercentile)}
              </p>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${percentileColor}`}
                style={{ width: `${cityPercentile}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>

            <p className="text-slate-500 text-xs mt-3">
              A {occupation.title} in {city.name} earns more than{" "}
              <span className="text-slate-300 font-medium">{cityPercentile}%</span>{" "}
              of {occupation.title}s across 86+ global cities.
            </p>
          </div>

          {/* Same Country Cities */}
          {sameCountryCitiesWithInfo.length > 1 && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                {occupation.title} Salary by City in {country.name}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-500 text-xs border-b border-dark-border">
                      <th className="text-left py-2">City</th>
                      <th className="text-right py-2">Salary</th>
                      <th className="text-right py-2">COL Adj.</th>
                      <th className="text-right py-2">vs Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sameCountryCitiesWithInfo.map((entry) => {
                      const isCurrentCity = entry.citySlug === citySlug;
                      const vsAvg = Math.round(
                        ((entry.estimatedSalary - countrySalary.estimatedSalary) /
                          countrySalary.estimatedSalary) *
                          100
                      );
                      return (
                        <tr
                          key={entry.citySlug}
                          className={`border-b border-slate-800/50 ${
                            isCurrentCity ? "bg-slate-800/30" : ""
                          }`}
                        >
                          <td className="py-2.5">
                            {isCurrentCity ? (
                              <span className="text-slate-50 font-medium">
                                {entry.city.name}
                              </span>
                            ) : (
                              <Link
                                href={`/salary/${occSlug}/${countrySlug}/${entry.citySlug}`}
                                className="text-accent-blue hover:text-blue-400 transition-colors"
                              >
                                {entry.city.name}
                              </Link>
                            )}
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
                                vsAvg >= 0 ? "text-emerald-400" : "text-red-400"
                              }
                            >
                              {vsAvg >= 0 ? "+" : ""}
                              {vsAvg}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Similar Salary Cities Worldwide */}
          {similarCities.length > 0 && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Cities with Similar {occupation.title} Salaries
              </h2>
              <p className="text-slate-600 text-xs mb-3">
                Global cities within ±15% of {city.name}&apos;s salary
              </p>
              <div className="flex flex-wrap gap-2">
                {similarCities.map((entry) => (
                  <Link
                    key={entry.city.slug}
                    href={`/salary/${occSlug}/${entry.country.slug}/${entry.city.slug}`}
                    className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
                  >
                    {entry.country.flag} {entry.city.name}{" "}
                    <span className="text-slate-600">
                      {formatUSDShort(entry.estimatedSalary)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Narrative SEO Content */}
          <article className="flex flex-col gap-6">
            <section>
              <h2 className="text-lg font-bold text-slate-100 mb-3">
                {occupation.title} Salary in {city.name}: What You Need to Know
              </h2>
              <div className="text-slate-400 text-sm leading-relaxed space-y-3">
                <p>
                  {occupation.title}s in {city.name}, {country.name} earn an estimated{" "}
                  <strong className="text-slate-200">
                    {formatCurrency(citySalary.estimatedSalary)} USD
                  </strong>{" "}
                  per year, which is approximately{" "}
                  <strong className="text-slate-200">
                    {formatCurrency(localSalary, country.currencySymbol)} {country.currency}
                  </strong>{" "}
                  at current exchange rates. This is{" "}
                  {vsCountryPercent >= 0 ? (
                    <strong className="text-emerald-400">
                      {vsCountryPercent}% above
                    </strong>
                  ) : (
                    <strong className="text-red-400">
                      {Math.abs(vsCountryPercent)}% below
                    </strong>
                  )}{" "}
                  the {country.name} national average for this role.
                </p>
                <p>
                  {city.name} has a cost of living multiplier of{" "}
                  <strong className="text-slate-200">{city.colMultiplier}x</strong> relative to the{" "}
                  {country.name} average.
                  {city.colMultiplier > 1.1
                    ? ` This means that while nominal salaries are higher, the real purchasing power may be somewhat reduced by the higher cost of living.`
                    : city.colMultiplier < 0.9
                      ? ` This means that even though nominal salaries may be lower, the lower cost of living can offer greater real purchasing power.`
                      : ` The cost of living is close to the national average, so nominal and real salaries are fairly aligned.`}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-100 mb-3">
                Purchasing Power and Cost of Living
              </h2>
              <div className="text-slate-400 text-sm leading-relaxed space-y-3">
                <p>
                  After adjusting for the city&apos;s cost of living, the real purchasing
                  power of a {occupation.title} salary in {city.name} is equivalent to{" "}
                  <strong className="text-slate-200">
                    {formatCurrency(citySalary.colAdjusted)} USD
                  </strong>
                  . This cost-of-living adjusted figure gives a better picture of what
                  your salary can actually buy in terms of housing, food, transportation,
                  and other daily expenses.
                </p>
                {bigMacCount > 0 && (
                  <p>
                    Using The Economist&apos;s Big Mac Index as an informal measure of
                    purchasing power, a {occupation.title}&apos;s salary in {city.name} could
                    buy approximately{" "}
                    <strong className="text-slate-200">
                      {formatNumber(bigMacCount)} Big Macs
                    </strong>{" "}
                    per year.
                  </p>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-100 mb-3">
                Career Prospects in {city.name}
              </h2>
              <div className="text-slate-400 text-sm leading-relaxed space-y-3">
                <p>
                  {city.name} is{" "}
                  {city.isTechHub
                    ? "recognized as a major tech hub, which typically means stronger demand and premium compensation for technology-related roles. "
                    : ""}
                  {city.isCapital
                    ? `As the capital of ${country.name}, the city offers opportunities in government, policy, and international organizations alongside the private sector. `
                    : ""}
                  With a population of approximately {formatNumber(city.population)},
                  the city offers a{" "}
                  {city.population > 5000000
                    ? "large and diverse"
                    : city.population > 1000000
                      ? "substantial"
                      : "compact but growing"}{" "}
                  job market for {occupation.title}s.
                </p>
                <p>
                  These estimates are derived from publicly available data from the
                  U.S. Bureau of Labor Statistics, OECD average wages, and Numbeo
                  cost of living indices. Actual salaries can vary significantly based
                  on experience, company, specific neighborhood, and negotiation.
                </p>
              </div>
            </section>
          </article>

          {/* CTA */}
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

          {/* Other Jobs in this City */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Other Jobs in {city.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {getOccupations()
                .filter((o) => o.slug !== occSlug)
                .sort((a, b) => {
                  if (a.category === occupation.category && b.category !== occupation.category) return -1;
                  if (a.category !== occupation.category && b.category === occupation.category) return 1;
                  return a.title.localeCompare(b.title);
                })
                .slice(0, 8)
                .map((o) => (
                  <Link
                    key={o.slug}
                    href={`/salary/${o.slug}/${countrySlug}/${citySlug}`}
                    className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
                  >
                    {o.title}
                  </Link>
                ))}
            </div>
            <div className="mt-3">
              <Link
                href={`/cities/${citySlug}`}
                className="text-accent-blue hover:text-blue-400 transition-colors text-xs"
              >
                View all jobs in {city.name} &rarr;
              </Link>
            </div>
          </div>

          {/* Related Links */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Explore More
            </h3>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/salary/${occSlug}/${countrySlug}`}
                className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
              >
                {country.flag} {occupation.title} in {country.name}
              </Link>
              <Link
                href={`/cities/${citySlug}`}
                className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
              >
                All salaries in {city.name}
              </Link>
              <Link
                href={`/rankings/${occSlug}`}
                className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
              >
                {occupation.title} Global Rankings
              </Link>
              <Link
                href="/cities"
                className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
              >
                Browse all cities
              </Link>
            </div>
          </div>

          {/* FAQ */}
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
              Estimated based on OECD &amp; BLS data, adjusted for city-level cost of
              living. Actual salaries vary by experience, company, and neighborhood.
            </p>
            <p className="text-slate-700 text-[10px] mt-1">
              Sources:{" "}
              <a href="https://www.bls.gov/oes/" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-500">BLS OEWS</a>
              {" "}&middot;{" "}
              <a href="https://stats.oecd.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-500">OECD</a>
              {" "}&middot;{" "}
              <a href="https://data.worldbank.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-500">World Bank</a>
              {" "}&middot;{" "}
              <a href="https://github.com/TheEconomist/big-mac-data" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-500">Big Mac Index</a>
              {" "}&middot;{" "}
              <a href="https://www.numbeo.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-500">Numbeo</a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
