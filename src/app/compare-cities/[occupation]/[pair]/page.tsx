import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getOccupations,
  getOccupation,
  getCity,
  getCitySalaryEntry,
  getCountry,
  getCountries,
  getCountryBySlug,
} from "@/lib/data-loader";
import {
  calculateCityBigMacCount,
  calculateCityPercentile,
} from "@/lib/salary-calculator";
import {
  formatCurrency,
  formatNumber,
  formatPercentile,
  formatUSDShort,
} from "@/lib/format";

// --- 인기 도시 쌍 ---

const CITY_PAIRS: [string, string][] = [
  ["new-york", "london"],
  ["new-york", "san-francisco"],
  ["san-francisco", "seattle"],
  ["new-york", "tokyo"],
  ["london", "berlin"],
  ["london", "paris"],
  ["seoul", "tokyo"],
  ["singapore", "tokyo"],
  ["sydney", "melbourne"],
  ["toronto", "vancouver"],
  ["bangalore", "singapore"],
  ["mumbai", "delhi"],
  ["san-francisco", "london"],
  ["zurich", "new-york"],
  ["berlin", "amsterdam"],
  ["new-york", "toronto"],
  ["london", "sydney"],
  ["san-francisco", "bangalore"],
  ["tokyo", "shanghai"],
  ["paris", "berlin"],
  ["seoul", "singapore"],
  ["munich", "berlin"],
  ["boston", "new-york"],
  ["toronto", "london"],
  ["shanghai", "singapore"],
];

// --- Static Params (SSG) ---
// 상위 20 직업만 빌드 타임 생성, 나머지는 on-demand ISR (Vercel 75MB 제한 대응)

import { TOP_OCCUPATIONS_FOR_SSG } from "@/lib/ssg-config";

export function generateStaticParams() {
  const occupations = getOccupations().filter((o) =>
    TOP_OCCUPATIONS_FOR_SSG.includes(o.slug)
  );

  const params: { occupation: string; pair: string }[] = [];

  for (const occ of occupations) {
    for (const [a, b] of CITY_PAIRS) {
      params.push({
        occupation: occ.slug,
        pair: `${a}-vs-${b}`,
      });
    }
  }

  return params;
}

// --- SEO Metadata ---

interface PageProps {
  params: Promise<{ occupation: string; pair: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { occupation: occSlug, pair } = await params;
  const occupation = getOccupation(occSlug);

  const vsSplit = pair.split("-vs-");
  if (vsSplit.length !== 2 || !occupation) {
    return { title: "Not Found | Am I Paid Fairly?" };
  }

  const cityA = getCity(vsSplit[0]);
  const cityB = getCity(vsSplit[1]);

  if (!cityA || !cityB) {
    return { title: "Not Found | Am I Paid Fairly?" };
  }

  const countryA = getCountry(cityA.countryCode);
  const countryB = getCountry(cityB.countryCode);

  const title = `${occupation.title}: ${cityA.name} vs ${cityB.name} | AIPF`;
  const description = `Compare ${occupation.title} salaries between ${cityA.name}${countryA ? `, ${countryA.name}` : ""} and ${cityB.name}${countryB ? `, ${countryB.name}` : ""}. Side-by-side comparison of salary, cost of living, purchasing power, and Big Mac Index.`;

  const ogParams = new URLSearchParams();
  ogParams.set("title", `${occupation.title} Salary`);
  ogParams.set("subtitle", `${cityA.name} vs ${cityB.name} (2026)`);
  const ogImage = `/api/og?${ogParams.toString()}`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: [ogImage] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
    alternates: {
      canonical: `https://amipaidfairly.com/compare-cities/${occSlug}/${pair}`,
    },
  };
}

// --- Page Component ---

export default async function CompareCitiesPage({ params }: PageProps) {
  const { occupation: occSlug, pair } = await params;
  const occupation = getOccupation(occSlug);

  const vsSplit = pair.split("-vs-");
  if (vsSplit.length !== 2 || !occupation) {
    redirect("/");
  }

  const cityA = getCity(vsSplit[0]);
  const cityB = getCity(vsSplit[1]);

  if (!cityA || !cityB) {
    redirect("/");
  }

  const countryA = getCountry(cityA.countryCode);
  const countryB = getCountry(cityB.countryCode);
  const countries = getCountries();
  const countryABySlug = countryA ? countries.find((c) => c.code === countryA.code) : undefined;
  const countryBBySlug = countryB ? countries.find((c) => c.code === countryB.code) : undefined;

  if (!countryA || !countryB) {
    redirect("/");
  }

  const salaryA = getCitySalaryEntry(occSlug, cityA.slug);
  const salaryB = getCitySalaryEntry(occSlug, cityB.slug);

  if (!salaryA || !salaryB) {
    redirect("/");
  }

  // 계산
  const bigMacCountA = calculateCityBigMacCount(countryA.code, salaryA.estimatedSalary);
  const bigMacCountB = calculateCityBigMacCount(countryB.code, salaryB.estimatedSalary);
  const percentileA = calculateCityPercentile(occSlug, salaryA.estimatedSalary);
  const percentileB = calculateCityPercentile(occSlug, salaryB.estimatedSalary);

  // 승자
  const salaryDiff = salaryA.estimatedSalary - salaryB.estimatedSalary;
  const higherCity = salaryDiff >= 0 ? "A" : "B";
  const salaryRatio =
    higherCity === "A"
      ? salaryA.estimatedSalary / (salaryB.estimatedSalary || 1)
      : salaryB.estimatedSalary / (salaryA.estimatedSalary || 1);
  const percentageDiff = Math.round((salaryRatio - 1) * 100);

  // COL 비교 - 누가 더 좋은 real value를 주나
  const colDiff = salaryA.colAdjusted - salaryB.colAdjusted;
  const higherCOL = colDiff >= 0 ? "A" : "B";
  const colPercentageDiff = Math.round(
    (Math.abs(colDiff) / Math.min(salaryA.colAdjusted, salaryB.colAdjusted)) * 100
  );

  // 바 비교용
  const maxSalary = Math.max(salaryA.estimatedSalary, salaryB.estimatedSalary);
  const maxCOL = Math.max(salaryA.colAdjusted, salaryB.colAdjusted);
  const maxBigMac = Math.max(bigMacCountA, bigMacCountB);

  // Key Takeaways
  const takeaways: string[] = [];

  if (percentageDiff > 0) {
    const winnerName = higherCity === "A" ? cityA.name : cityB.name;
    const loserName = higherCity === "A" ? cityB.name : cityA.name;
    takeaways.push(
      `${occupation.title}s in ${winnerName} earn ${percentageDiff}% more than in ${loserName} (nominal USD).`
    );
  } else {
    takeaways.push(
      `${occupation.title}s in ${cityA.name} and ${cityB.name} earn similar salaries in nominal USD.`
    );
  }

  // COL comparison
  if (colPercentageDiff > 5) {
    const colWinnerName = higherCOL === "A" ? cityA.name : cityB.name;
    takeaways.push(
      `After adjusting for cost of living, ${colWinnerName} offers ${colPercentageDiff}% better purchasing power.`
    );
  } else {
    takeaways.push(
      `After adjusting for cost of living, both cities offer similar real purchasing power.`
    );
  }

  if (bigMacCountA > 0 && bigMacCountB > 0) {
    const bigMacWinner = bigMacCountA > bigMacCountB ? cityA.name : cityB.name;
    const bigMacHigher = Math.max(bigMacCountA, bigMacCountB);
    const bigMacLower = Math.min(bigMacCountA, bigMacCountB);
    takeaways.push(
      `Using the Big Mac Index, a ${occupation.title}'s salary buys ${(bigMacHigher / bigMacLower).toFixed(1)}x more Big Macs in ${bigMacWinner}.`
    );
  }

  // COL multiplier 비교
  const colMultiplierHigher = cityA.colMultiplier > cityB.colMultiplier ? cityA : cityB;
  const colMultiplierLower = cityA.colMultiplier > cityB.colMultiplier ? cityB : cityA;
  if (Math.abs(cityA.colMultiplier - cityB.colMultiplier) > 0.05) {
    takeaways.push(
      `${colMultiplierHigher.name} has a ${Math.round(((colMultiplierHigher.colMultiplier / colMultiplierLower.colMultiplier) - 1) * 100)}% higher cost of living than ${colMultiplierLower.name}.`
    );
  }

  // FAQ JSON-LD
  const faqItems = [
    {
      question: `Who pays ${occupation.title}s more: ${cityA.name} or ${cityB.name}?`,
      answer:
        higherCity === "A"
          ? `${cityA.name} pays ${occupation.title}s an estimated ${formatCurrency(salaryA.estimatedSalary)} USD per year, which is ${percentageDiff}% more than ${cityB.name}'s estimated ${formatCurrency(salaryB.estimatedSalary)} USD.`
          : `${cityB.name} pays ${occupation.title}s an estimated ${formatCurrency(salaryB.estimatedSalary)} USD per year, which is ${percentageDiff}% more than ${cityA.name}'s estimated ${formatCurrency(salaryA.estimatedSalary)} USD.`,
    },
    {
      question: `Which city has better purchasing power for ${occupation.title}s?`,
      answer: `After adjusting for cost of living, ${cityA.name} offers ${formatCurrency(salaryA.colAdjusted)} USD in real purchasing power, while ${cityB.name} offers ${formatCurrency(salaryB.colAdjusted)} USD. ${higherCOL === "A" ? cityA.name : cityB.name} provides better real value.`,
    },
    {
      question: `How does the cost of living compare between ${cityA.name} and ${cityB.name}?`,
      answer: `${cityA.name} has a cost of living multiplier of ${cityA.colMultiplier}x and ${cityB.name} has ${cityB.colMultiplier}x relative to their respective national averages. ${colMultiplierHigher.name} is the more expensive city.`,
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const getPercentileColor = (p: number) =>
    p >= 50 ? "text-emerald-400" : p >= 30 ? "text-yellow-400" : "text-red-400";
  const getPercentileBarColor = (p: number) =>
    p >= 50 ? "bg-emerald-500" : p >= 30 ? "bg-yellow-500" : "bg-red-500";

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
              { "@type": "ListItem", position: 2, name: "City Comparison", item: "https://amipaidfairly.com/cities" },
              { "@type": "ListItem", position: 3, name: occupation.title, item: `https://amipaidfairly.com/salary/${occSlug}` },
              { "@type": "ListItem", position: 4, name: `${cityA.name} vs ${cityB.name}`, item: `https://amipaidfairly.com/compare-cities/${occSlug}/${pair}` },
            ],
          }),
        }}
      />

      <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          {/* Back link */}
          <Link
            href={`/salary/${occSlug}`}
            className="text-slate-500 text-sm hover:text-slate-300 transition-colors"
          >
            &larr; {occupation.title} in all countries
          </Link>

          {/* H1 */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 leading-tight">
              {occupation.title}: {cityA.name} vs {cityB.name}
            </h1>
            <p className="text-slate-500 text-sm mt-3">
              {countryA.flag} {cityA.name}, {countryA.name} vs{" "}
              {countryB.flag} {cityB.name}, {countryB.name}
              <span className="mx-2">&middot;</span>
              City salary comparison
            </p>
          </div>

          {/* Winner */}
          {percentageDiff > 0 && (
            <div className="flex items-center justify-center">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-6 py-3 text-center">
                <p className="text-emerald-400 text-sm font-semibold">
                  {higherCity === "A" ? cityA.name : cityB.name} pays{" "}
                  <span className="text-emerald-300 text-lg font-bold">
                    {percentageDiff}%
                  </span>{" "}
                  more
                </p>
              </div>
            </div>
          )}

          {/* Side-by-side cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* City A Card */}
            <div
              className={`bg-dark-card border rounded-2xl p-6 ${
                higherCity === "A" && percentageDiff > 0
                  ? "border-emerald-500/50"
                  : "border-dark-border"
              }`}
            >
              {higherCity === "A" && percentageDiff > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    Higher Pay
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-3xl">{countryA.flag}</span>
                <div>
                  <h2 className="text-lg font-bold text-slate-50">{cityA.name}</h2>
                  <p className="text-slate-500 text-xs">{countryA.name}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">City Salary (USD)</p>
                  <p className="text-2xl font-bold text-slate-50">{formatCurrency(salaryA.estimatedSalary)}</p>
                  <p className="text-slate-500 text-xs mt-1">per year</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">COL-Adjusted</p>
                  <p className="text-xl font-bold text-slate-50">{formatCurrency(salaryA.colAdjusted)}</p>
                  <p className="text-slate-500 text-xs mt-1">real purchasing power</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Big Mac Power</p>
                  <p className="text-xl font-bold text-slate-50">{bigMacCountA > 0 ? formatNumber(bigMacCountA) : "N/A"}</p>
                  <p className="text-slate-500 text-xs mt-1">burgers / year</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">COL Multiplier</p>
                  <p className="text-xl font-bold text-slate-50">{cityA.colMultiplier}x</p>
                  <p className="text-slate-500 text-xs mt-1">vs national avg</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">City Percentile</p>
                  <p className={`text-xl font-bold ${getPercentileColor(percentileA)}`}>{formatPercentile(percentileA)}</p>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2 overflow-hidden">
                    <div className={`h-full rounded-full ${getPercentileBarColor(percentileA)}`} style={{ width: `${percentileA}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* City B Card */}
            <div
              className={`bg-dark-card border rounded-2xl p-6 ${
                higherCity === "B" && percentageDiff > 0
                  ? "border-emerald-500/50"
                  : "border-dark-border"
              }`}
            >
              {higherCity === "B" && percentageDiff > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    Higher Pay
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-3xl">{countryB.flag}</span>
                <div>
                  <h2 className="text-lg font-bold text-slate-50">{cityB.name}</h2>
                  <p className="text-slate-500 text-xs">{countryB.name}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">City Salary (USD)</p>
                  <p className="text-2xl font-bold text-slate-50">{formatCurrency(salaryB.estimatedSalary)}</p>
                  <p className="text-slate-500 text-xs mt-1">per year</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">COL-Adjusted</p>
                  <p className="text-xl font-bold text-slate-50">{formatCurrency(salaryB.colAdjusted)}</p>
                  <p className="text-slate-500 text-xs mt-1">real purchasing power</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Big Mac Power</p>
                  <p className="text-xl font-bold text-slate-50">{bigMacCountB > 0 ? formatNumber(bigMacCountB) : "N/A"}</p>
                  <p className="text-slate-500 text-xs mt-1">burgers / year</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">COL Multiplier</p>
                  <p className="text-xl font-bold text-slate-50">{cityB.colMultiplier}x</p>
                  <p className="text-slate-500 text-xs mt-1">vs national avg</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">City Percentile</p>
                  <p className={`text-xl font-bold ${getPercentileColor(percentileB)}`}>{formatPercentile(percentileB)}</p>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2 overflow-hidden">
                    <div className={`h-full rounded-full ${getPercentileBarColor(percentileB)}`} style={{ width: `${percentileB}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Bar Comparison */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">
              Visual Comparison
            </h2>
            <div className="space-y-6">
              {/* Salary Bar */}
              <div>
                <p className="text-slate-400 text-xs mb-2 font-medium">City Salary (USD)</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-300 w-24 sm:w-32 shrink-0 truncate">{cityA.name}</span>
                    <div className="flex-1 h-7 bg-slate-800 rounded-md overflow-hidden relative">
                      <div className={`h-full rounded-md ${salaryA.estimatedSalary >= salaryB.estimatedSalary ? "bg-emerald-500" : "bg-slate-600"}`} style={{ width: `${maxSalary > 0 ? (salaryA.estimatedSalary / maxSalary) * 100 : 0}%` }} />
                      <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-slate-200">{formatUSDShort(salaryA.estimatedSalary)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-300 w-24 sm:w-32 shrink-0 truncate">{cityB.name}</span>
                    <div className="flex-1 h-7 bg-slate-800 rounded-md overflow-hidden relative">
                      <div className={`h-full rounded-md ${salaryB.estimatedSalary >= salaryA.estimatedSalary ? "bg-emerald-500" : "bg-slate-600"}`} style={{ width: `${maxSalary > 0 ? (salaryB.estimatedSalary / maxSalary) * 100 : 0}%` }} />
                      <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-slate-200">{formatUSDShort(salaryB.estimatedSalary)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* COL-Adjusted Bar */}
              <div>
                <p className="text-slate-400 text-xs mb-2 font-medium">COL-Adjusted (USD)</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-300 w-24 sm:w-32 shrink-0 truncate">{cityA.name}</span>
                    <div className="flex-1 h-7 bg-slate-800 rounded-md overflow-hidden relative">
                      <div className={`h-full rounded-md ${salaryA.colAdjusted >= salaryB.colAdjusted ? "bg-blue-500" : "bg-slate-600"}`} style={{ width: `${maxCOL > 0 ? (salaryA.colAdjusted / maxCOL) * 100 : 0}%` }} />
                      <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-slate-200">{formatUSDShort(salaryA.colAdjusted)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-300 w-24 sm:w-32 shrink-0 truncate">{cityB.name}</span>
                    <div className="flex-1 h-7 bg-slate-800 rounded-md overflow-hidden relative">
                      <div className={`h-full rounded-md ${salaryB.colAdjusted >= salaryA.colAdjusted ? "bg-blue-500" : "bg-slate-600"}`} style={{ width: `${maxCOL > 0 ? (salaryB.colAdjusted / maxCOL) * 100 : 0}%` }} />
                      <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-slate-200">{formatUSDShort(salaryB.colAdjusted)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Big Mac Bar */}
              {bigMacCountA > 0 && bigMacCountB > 0 && (
                <div>
                  <p className="text-slate-400 text-xs mb-2 font-medium">Big Mac Power (burgers/year)</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-300 w-24 sm:w-32 shrink-0 truncate">{cityA.name}</span>
                      <div className="flex-1 h-7 bg-slate-800 rounded-md overflow-hidden relative">
                        <div className={`h-full rounded-md ${bigMacCountA >= bigMacCountB ? "bg-amber-500" : "bg-slate-600"}`} style={{ width: `${maxBigMac > 0 ? (bigMacCountA / maxBigMac) * 100 : 0}%` }} />
                        <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-slate-200">{formatNumber(bigMacCountA)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-300 w-24 sm:w-32 shrink-0 truncate">{cityB.name}</span>
                      <div className="flex-1 h-7 bg-slate-800 rounded-md overflow-hidden relative">
                        <div className={`h-full rounded-md ${bigMacCountB >= bigMacCountA ? "bg-amber-500" : "bg-slate-600"}`} style={{ width: `${maxBigMac > 0 ? (bigMacCountB / maxBigMac) * 100 : 0}%` }} />
                        <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-slate-200">{formatNumber(bigMacCountB)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Key Takeaways
            </h2>
            <ul className="space-y-3">
              {takeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-0.5 shrink-0">&#9679;</span>
                  <p className="text-slate-300 text-sm leading-relaxed">{takeaway}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-block bg-accent-blue hover:bg-blue-600 transition-colors text-white font-semibold px-8 py-3 rounded-xl text-sm"
            >
              Compare your own salary
            </Link>
            <p className="text-slate-600 text-xs mt-2">Free &middot; No login required</p>
          </div>

          {/* Internal Links — Explore More */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Explore More
            </h3>
            <div className="flex flex-wrap gap-2">
              {countryABySlug && (
                <Link
                  href={`/salary/${occSlug}/${countryABySlug.slug}/${cityA.slug}`}
                  className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
                >
                  {countryA.flag} {occupation.title} in {cityA.name}
                </Link>
              )}
              {countryBBySlug && (
                <Link
                  href={`/salary/${occSlug}/${countryBBySlug.slug}/${cityB.slug}`}
                  className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
                >
                  {countryB.flag} {occupation.title} in {cityB.name}
                </Link>
              )}
              <Link
                href={`/cities/${cityA.slug}`}
                className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
              >
                All salaries in {cityA.name}
              </Link>
              <Link
                href={`/cities/${cityB.slug}`}
                className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
              >
                All salaries in {cityB.name}
              </Link>
              <Link
                href={`/rankings/${occSlug}`}
                className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
              >
                {occupation.title} Global Rankings
              </Link>
            </div>
          </div>

          {/* Other City Comparisons */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Other City Comparisons
            </h3>
            <div className="flex flex-wrap gap-2">
              {CITY_PAIRS
                .filter(([a, b]) => {
                  const key = `${a}-vs-${b}`;
                  return key !== pair && (a === cityA.slug || b === cityA.slug || a === cityB.slug || b === cityB.slug);
                })
                .slice(0, 3)
                .map(([a, b]) => (
                  <Link
                    key={`${a}-vs-${b}`}
                    href={`/compare-cities/${occSlug}/${a}-vs-${b}`}
                    className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-emerald-400 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
                  >
                    {a.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} vs{" "}
                    {b.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  </Link>
                ))}
            </div>
          </div>

          {/* Related Occupations */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Related Occupations
            </h3>
            <div className="flex flex-wrap gap-2">
              {getOccupations()
                .filter((o) => o.slug !== occSlug && o.category === occupation.category)
                .slice(0, 3)
                .map((o) => (
                  <Link
                    key={o.slug}
                    href={`/compare-cities/${o.slug}/${pair}`}
                    className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
                  >
                    {o.title}: {cityA.name} vs {cityB.name}
                  </Link>
                ))}
            </div>
          </div>

          {/* Relocate Link */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Thinking About Relocating?
            </h3>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/relocate/${occSlug}/${cityA.slug}-to-${cityB.slug}`}
                className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors px-3 py-1.5 rounded-lg border border-emerald-500/30"
              >
                Relocate: {cityA.name} → {cityB.name}
              </Link>
              <Link
                href={`/relocate/${occSlug}/${cityB.slug}-to-${cityA.slug}`}
                className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors px-3 py-1.5 rounded-lg border border-emerald-500/30"
              >
                Relocate: {cityB.name} → {cityA.name}
              </Link>
              <Link
                href="/relocate"
                className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
              >
                Relocation Calculator
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
                    <span className="text-slate-600 group-open:rotate-180 transition-transform ml-2">&#9662;</span>
                  </summary>
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-center pb-6">
            <p className="text-slate-600 text-[10px]">
              Estimated based on OECD &amp; BLS data, adjusted for city-level cost of living. Actual salaries vary by experience, company, and neighborhood.
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
