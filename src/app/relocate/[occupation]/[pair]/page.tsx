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
} from "@/lib/data-loader";
import {
  calculateRelocation,
  calculateCityBigMacCount,
  calculateCityPercentile,
} from "@/lib/salary-calculator";
import {
  formatCurrency,
  formatNumber,
  formatPercentile,
  formatUSDShort,
} from "@/lib/format";

// --- 인기 도시 쌍 (릴로케이션) ---

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

  const salaryA = getCitySalaryEntry(occSlug, cityA.slug);
  const salaryB = getCitySalaryEntry(occSlug, cityB.slug);

  const salaryAText = salaryA ? formatUSDShort(salaryA.estimatedSalary) : "N/A";
  const salaryBText = salaryB ? formatUSDShort(salaryB.estimatedSalary) : "N/A";

  const title = `${occupation.title}: ${cityA.name} to ${cityB.name} | AIPF`;
  const description = `Should a ${occupation.title} relocate from ${cityA.name} to ${cityB.name}? Salary changes from ${salaryAText} to ${salaryBText}, but purchasing power... Compare cost of living, Big Mac Index, and get our verdict.`;

  const ogParams = new URLSearchParams();
  ogParams.set("title", `${occupation.title} Relocation`);
  ogParams.set("subtitle", `${cityA.name} \u2192 ${cityB.name} (2026)`);
  const ogImage = `/api/og?${ogParams.toString()}`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: [ogImage] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
    alternates: {
      canonical: `https://amipaidfairly.com/relocate/${occSlug}/${pair}`,
    },
  };
}

// --- Page Component ---

export default async function RelocatePage({ params }: PageProps) {
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

  // Relocation 계산
  const relocation = calculateRelocation(occSlug, cityA.slug, cityB.slug);

  if (!relocation) {
    redirect("/");
  }

  // 추가 계산
  const bigMacCountA = calculateCityBigMacCount(countryA.code, salaryA.estimatedSalary);
  const bigMacCountB = calculateCityBigMacCount(countryB.code, salaryB.estimatedSalary);
  const percentileA = calculateCityPercentile(occSlug, salaryA.estimatedSalary);
  const percentileB = calculateCityPercentile(occSlug, salaryB.estimatedSalary);

  // 바 비교용
  const maxSalary = Math.max(salaryA.estimatedSalary, salaryB.estimatedSalary);
  const maxCOL = Math.max(salaryA.colAdjusted, salaryB.colAdjusted);
  const maxBigMac = Math.max(bigMacCountA, bigMacCountB);

  // Verdict 색상 매핑
  const verdictConfig: Record<
    string,
    { bg: string; border: string; text: string; label: string }
  > = {
    "strong-yes": {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      label: "Strongly Recommended",
    },
    yes: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      label: "Worth Considering",
    },
    neutral: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      text: "text-yellow-400",
      label: "Break Even",
    },
    no: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-400",
      label: "Think Twice",
    },
    "strong-no": {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-400",
      label: "Not Recommended",
    },
  };

  const vc = verdictConfig[relocation.verdict] || verdictConfig["neutral"];

  // Change Summary 색상 헬퍼
  const changeColor = (val: number) =>
    val > 0 ? "text-emerald-400" : val < 0 ? "text-red-400" : "text-slate-400";
  const changePrefix = (val: number) => (val > 0 ? "+" : "");

  // What Relocation Means — 4 narrative bullet points
  const narratives: string[] = [];

  // 1. Nominal salary change
  if (relocation.nominalChange > 0) {
    narratives.push(
      `Your nominal salary would increase by ${relocation.nominalChange}%, from ${formatCurrency(salaryA.estimatedSalary)} to ${formatCurrency(salaryB.estimatedSalary)} USD per year.`
    );
  } else if (relocation.nominalChange < 0) {
    narratives.push(
      `Your nominal salary would decrease by ${Math.abs(relocation.nominalChange)}%, from ${formatCurrency(salaryA.estimatedSalary)} to ${formatCurrency(salaryB.estimatedSalary)} USD per year.`
    );
  } else {
    narratives.push(
      `Your nominal salary would remain roughly the same at around ${formatCurrency(salaryA.estimatedSalary)} USD per year.`
    );
  }

  // 2. Real purchasing power change
  if (relocation.colAdjustedChange > 0) {
    narratives.push(
      `After adjusting for cost of living, your real purchasing power improves by ${relocation.colAdjustedChange}%. ${cityB.name} gives you more bang for your buck despite any nominal salary difference.`
    );
  } else if (relocation.colAdjustedChange < 0) {
    narratives.push(
      `After adjusting for cost of living, your real purchasing power drops by ${Math.abs(relocation.colAdjustedChange)}%. The higher expenses in ${cityB.name} eat into your earnings.`
    );
  } else {
    narratives.push(
      `After adjusting for cost of living, your real purchasing power stays about the same — the move is lifestyle-driven, not financially motivated.`
    );
  }

  // 3. Big Mac comparison
  if (bigMacCountA > 0 && bigMacCountB > 0) {
    if (bigMacCountB > bigMacCountA) {
      narratives.push(
        `Using the Big Mac Index, your salary buys ${formatNumber(bigMacCountB)} burgers per year in ${cityB.name} vs ${formatNumber(bigMacCountA)} in ${cityA.name} — a ${relocation.bigMacChange}% boost in everyday purchasing power.`
      );
    } else if (bigMacCountB < bigMacCountA) {
      narratives.push(
        `Using the Big Mac Index, your salary buys ${formatNumber(bigMacCountB)} burgers per year in ${cityB.name} vs ${formatNumber(bigMacCountA)} in ${cityA.name} — a ${Math.abs(relocation.bigMacChange)}% decrease in everyday purchasing power.`
      );
    } else {
      narratives.push(
        `Using the Big Mac Index, your salary buys roughly the same number of burgers in both cities (around ${formatNumber(bigMacCountA)} per year).`
      );
    }
  }

  // 4. COL multiplier comparison
  if (Math.abs(cityA.colMultiplier - cityB.colMultiplier) > 0.05) {
    const moreExpensive = cityA.colMultiplier > cityB.colMultiplier ? cityA : cityB;
    const lessExpensive = cityA.colMultiplier > cityB.colMultiplier ? cityB : cityA;
    const colDiffPercent = Math.round(
      ((moreExpensive.colMultiplier / lessExpensive.colMultiplier) - 1) * 100
    );
    narratives.push(
      `${moreExpensive.name} is ${colDiffPercent}% more expensive than ${lessExpensive.name} relative to their national averages (${moreExpensive.colMultiplier}x vs ${lessExpensive.colMultiplier}x).`
    );
  } else {
    narratives.push(
      `Both cities have a similar cost of living relative to their national averages (${cityA.colMultiplier}x vs ${cityB.colMultiplier}x).`
    );
  }

  // FAQ JSON-LD
  const faqItems = [
    {
      question: `Should a ${occupation.title} relocate from ${cityA.name} to ${cityB.name}?`,
      answer:
        relocation.verdict === "strong-yes" || relocation.verdict === "yes"
          ? `Based on our analysis, relocating from ${cityA.name} to ${cityB.name} as a ${occupation.title} is ${vc.label.toLowerCase()}. ${relocation.verdictReason}`
          : relocation.verdict === "neutral"
            ? `The move from ${cityA.name} to ${cityB.name} is roughly break-even financially for a ${occupation.title}. ${relocation.verdictReason}`
            : `Our analysis suggests a ${occupation.title} should think carefully before relocating from ${cityA.name} to ${cityB.name}. ${relocation.verdictReason}`,
    },
    {
      question: `How does cost of living compare between ${cityA.name} and ${cityB.name}?`,
      answer: `${cityA.name} has a cost of living multiplier of ${cityA.colMultiplier}x and ${cityB.name} has ${cityB.colMultiplier}x relative to their respective national averages. After adjusting for cost of living, a ${occupation.title} has ${formatCurrency(salaryA.colAdjusted)} USD in real purchasing power in ${cityA.name} vs ${formatCurrency(salaryB.colAdjusted)} USD in ${cityB.name}.`,
    },
    {
      question: `What salary can a ${occupation.title} expect in ${cityB.name}?`,
      answer: `A ${occupation.title} in ${cityB.name}${countryB ? `, ${countryB.name}` : ""} can expect an estimated salary of ${formatCurrency(salaryB.estimatedSalary)} USD per year. After adjusting for cost of living, the real purchasing power is ${formatCurrency(salaryB.colAdjusted)} USD.`,
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

  // 승자 (for side-by-side card highlight)
  const salaryDiff = salaryA.estimatedSalary - salaryB.estimatedSalary;
  const higherCity = salaryDiff >= 0 ? "A" : "B";
  const salaryRatio =
    higherCity === "A"
      ? salaryA.estimatedSalary / (salaryB.estimatedSalary || 1)
      : salaryB.estimatedSalary / (salaryA.estimatedSalary || 1);
  const percentageDiff = Math.round((salaryRatio - 1) * 100);

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
              { "@type": "ListItem", position: 2, name: "Relocate", item: "https://amipaidfairly.com/relocate" },
              { "@type": "ListItem", position: 3, name: occupation.title, item: `https://amipaidfairly.com/salary/${occSlug}` },
              { "@type": "ListItem", position: 4, name: `${cityA.name} \u2192 ${cityB.name}`, item: `https://amipaidfairly.com/relocate/${occSlug}/${pair}` },
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
              Relocating as a {occupation.title}: {cityA.name} &rarr; {cityB.name}
            </h1>
            <p className="text-slate-500 text-sm mt-3">
              {countryA.flag} {cityA.name}, {countryA.name} &rarr;{" "}
              {countryB.flag} {cityB.name}, {countryB.name}
              <span className="mx-2">&middot;</span>
              Relocation analysis
            </p>
          </div>

          {/* Verdict Banner */}
          <div className="flex items-center justify-center">
            <div className={`${vc.bg} border ${vc.border} rounded-xl px-6 py-4 text-center max-w-lg`}>
              <p className={`${vc.text} text-xs font-bold uppercase tracking-wider mb-1`}>
                Relocation Verdict
              </p>
              <p className={`${vc.text} text-xl font-bold mb-2`}>
                {vc.label}
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                {relocation.verdictReason}
              </p>
            </div>
          </div>

          {/* Change Summary — 3-column grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-dark-card border border-dark-border rounded-xl p-4 text-center">
              <p className="text-slate-500 text-xs mb-1">Salary Change</p>
              <p className={`text-xl font-bold ${changeColor(relocation.nominalChange)}`}>
                {changePrefix(relocation.nominalChange)}{relocation.nominalChange}%
              </p>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-xl p-4 text-center">
              <p className="text-slate-500 text-xs mb-1">Purchasing Power</p>
              <p className={`text-xl font-bold ${changeColor(relocation.colAdjustedChange)}`}>
                {changePrefix(relocation.colAdjustedChange)}{relocation.colAdjustedChange}%
              </p>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-xl p-4 text-center">
              <p className="text-slate-500 text-xs mb-1">Big Mac Power</p>
              <p className={`text-xl font-bold ${changeColor(relocation.bigMacChange)}`}>
                {changePrefix(relocation.bigMacChange)}{relocation.bigMacChange}%
              </p>
            </div>
          </div>

          {/* Side-by-side cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* From City Card */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-slate-700/50 text-slate-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  From
                </span>
              </div>
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

            {/* To City Card */}
            <div
              className={`bg-dark-card border rounded-2xl p-6 ${
                relocation.verdict === "strong-yes" || relocation.verdict === "yes"
                  ? "border-emerald-500/50"
                  : relocation.verdict === "neutral"
                    ? "border-yellow-500/50"
                    : "border-dark-border"
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    relocation.verdict === "strong-yes" || relocation.verdict === "yes"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : relocation.verdict === "neutral"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-slate-700/50 text-slate-400"
                  }`}
                >
                  To
                </span>
              </div>
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

          {/* What Relocation Means */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              What This Relocation Means
            </h2>
            <ul className="space-y-3">
              {narratives.map((narrative, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-0.5 shrink-0">&#9679;</span>
                  <p className="text-slate-300 text-sm leading-relaxed">{narrative}</p>
                </li>
              ))}
            </ul>
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

          {/* Explore More */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Explore More
            </h3>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/relocate"
                className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-colors px-3 py-1.5 rounded-lg border border-emerald-500/30"
              >
                Relocation Calculator
              </Link>
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
                href={`/compare-cities/${occSlug}/${pair}`}
                className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
              >
                {cityA.name} vs {cityB.name} comparison
              </Link>
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

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/relocate"
              className="inline-block bg-accent-blue hover:bg-blue-600 transition-colors text-white font-semibold px-8 py-3 rounded-xl text-sm"
            >
              Try the Relocation Calculator
            </Link>
            <p className="text-slate-600 text-xs mt-2">Free &middot; No login required</p>
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
