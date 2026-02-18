import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getOccupations,
  getOccupation,
  getCountryBySlug,
  getSalaryEntry,
} from "@/lib/data-loader";
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
import { getCountryInsight } from "@/data/country-insights";

// --- Static Params (SSG) ---

const US_VS_COUNTRIES = [
  "south-korea", "japan", "germany", "united-kingdom", "france",
  "switzerland", "australia", "canada", "india", "china",
  "singapore", "brazil", "netherlands",
  "mexico", "poland", "israel", "ireland", "italy",
];

// 인기 비미국 비교 쌍
const NON_US_PAIRS = [
  ["south-korea", "japan"],
  ["united-kingdom", "germany"],
  ["australia", "canada"],
  ["india", "china"],
  ["france", "germany"],
  ["japan", "germany"],
  ["south-korea", "india"],
  ["united-kingdom", "france"],
  ["australia", "united-kingdom"],
  ["canada", "united-kingdom"],
  ["switzerland", "germany"],
  ["japan", "australia"],
  ["germany", "netherlands"],
  ["india", "singapore"],
  ["poland", "germany"],
  ["turkey", "germany"],
  ["australia", "new-zealand"],
  ["spain", "italy"],
  ["united-kingdom", "ireland"],
  ["china", "japan"],
  ["brazil", "mexico"],
  ["india", "united-kingdom"],
];

// 상위 20 직업만 빌드 타임 생성, 나머지는 on-demand ISR (Vercel 75MB 제한 대응)
import { TOP_OCCUPATIONS_FOR_SSG } from "@/lib/ssg-config";

export function generateStaticParams() {
  const occupations = getOccupations().filter((o) =>
    TOP_OCCUPATIONS_FOR_SSG.includes(o.slug)
  );

  const params: { occupation: string; pair: string }[] = [];

  for (const occ of occupations) {
    // US vs X
    for (const countrySlug of US_VS_COUNTRIES) {
      params.push({
        occupation: occ.slug,
        pair: `united-states-vs-${countrySlug}`,
      });
    }
    // 비미국 쌍
    for (const [a, b] of NON_US_PAIRS) {
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

  // pair를 "-vs-"로 분리
  const vsSplit = pair.split("-vs-");
  if (vsSplit.length !== 2 || !occupation) {
    return { title: "Not Found | Am I Paid Fairly?" };
  }

  const countryA = getCountryBySlug(vsSplit[0]);
  const countryB = getCountryBySlug(vsSplit[1]);

  if (!countryA || !countryB) {
    return { title: "Not Found | Am I Paid Fairly?" };
  }

  const title = `${occupation.title}: ${countryA.name} vs ${countryB.name} | AIPF`;
  const description = `Compare ${occupation.title} salaries between ${countryA.name} and ${countryB.name}. See side-by-side salary in USD, local currency, purchasing power, Big Mac Index, and global percentile.`;

  const ogParams = new URLSearchParams();
  ogParams.set("title", `${occupation.title} Salary`);
  ogParams.set("subtitle", `${countryA.name} vs ${countryB.name} (2026)`);
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
      canonical: `https://amipaidfairly.com/compare/${occSlug}/${pair}`,
    },
  };
}

// --- Page Component ---

export default async function ComparePage({ params }: PageProps) {
  const { occupation: occSlug, pair } = await params;
  const occupation = getOccupation(occSlug);

  // pair를 "-vs-"로 분리
  const vsSplit = pair.split("-vs-");
  if (vsSplit.length !== 2 || !occupation) {
    redirect("/");
  }

  const countryA = getCountryBySlug(vsSplit[0]);
  const countryB = getCountryBySlug(vsSplit[1]);

  // 유효하지 않은 국가 → 홈으로 리다이렉트
  if (!countryA || !countryB) {
    redirect("/");
  }

  const salaryA = getSalaryEntry(occSlug, countryA.code);
  const salaryB = getSalaryEntry(occSlug, countryB.code);

  // 급여 데이터 없으면 홈으로
  if (!salaryA || !salaryB) {
    redirect("/");
  }

  // 각 국가별 데이터 계산
  const bigMacCountA = calculateBigMacCount(countryA.code, salaryA.estimatedSalary);
  const bigMacCountB = calculateBigMacCount(countryB.code, salaryB.estimatedSalary);
  const percentileA = calculateGlobalPercentile(occSlug, salaryA.estimatedSalary);
  const percentileB = calculateGlobalPercentile(occSlug, salaryB.estimatedSalary);
  const localSalaryA = convertFromUSD(salaryA.estimatedSalary, countryA.code);
  const localSalaryB = convertFromUSD(salaryB.estimatedSalary, countryB.code);

  // 국가별 인사이트 데이터 조회
  const insightA = getCountryInsight(countryA.code);
  const insightB = getCountryInsight(countryB.code);

  // 승자 판별
  const salaryDiff = salaryA.estimatedSalary - salaryB.estimatedSalary;
  const higherCountry = salaryDiff >= 0 ? "A" : "B";
  const salaryRatio =
    higherCountry === "A"
      ? salaryA.estimatedSalary / (salaryB.estimatedSalary || 1)
      : salaryB.estimatedSalary / (salaryA.estimatedSalary || 1);
  const percentageDiff = Math.round((salaryRatio - 1) * 100);

  // 바 비교용 최대값 계산
  const maxSalary = Math.max(salaryA.estimatedSalary, salaryB.estimatedSalary);
  const maxPPP = Math.max(salaryA.pppAdjusted, salaryB.pppAdjusted);
  const maxBigMac = Math.max(bigMacCountA, bigMacCountB);

  // Key Takeaways 자동 생성
  const takeaways: string[] = [];

  if (percentageDiff > 0) {
    const winnerName = higherCountry === "A" ? countryA.name : countryB.name;
    const loserName = higherCountry === "A" ? countryB.name : countryA.name;
    takeaways.push(
      `${occupation.title}s in ${winnerName} earn ${percentageDiff}% more than in ${loserName} (nominal USD).`
    );
  } else {
    takeaways.push(
      `${occupation.title}s in ${countryA.name} and ${countryB.name} earn similar salaries in nominal USD.`
    );
  }

  // PPP 비교
  const pppRatio = salaryA.pppAdjusted / (salaryB.pppAdjusted || 1);
  if (pppRatio > 1.1) {
    takeaways.push(
      `After adjusting for purchasing power, ${countryA.name} still leads by ${Math.round((pppRatio - 1) * 100)}%.`
    );
  } else if (pppRatio < 0.9) {
    takeaways.push(
      `After adjusting for purchasing power, ${countryB.name} actually leads by ${Math.round((1 / pppRatio - 1) * 100)}%.`
    );
  } else {
    takeaways.push(
      `After adjusting for purchasing power, both countries offer similar real value.`
    );
  }

  // Big Mac 비교
  if (bigMacCountA > 0 && bigMacCountB > 0) {
    const bigMacWinner = bigMacCountA > bigMacCountB ? countryA.name : countryB.name;
    const bigMacHigher = Math.max(bigMacCountA, bigMacCountB);
    const bigMacLower = Math.min(bigMacCountA, bigMacCountB);
    const bigMacRatio = (bigMacHigher / bigMacLower).toFixed(1);
    takeaways.push(
      `Using the Big Mac Index, a ${occupation.title}'s salary buys ${bigMacRatio}x more Big Macs in ${bigMacWinner}.`
    );
  }

  // FAQ JSON-LD 구조화 데이터 — 비교 페이지 고유 질문/답변
  const winnerName = higherCountry === "A" ? countryA.name : countryB.name;
  const loserName = higherCountry === "A" ? countryB.name : countryA.name;
  const winnerSalary = higherCountry === "A" ? salaryA.estimatedSalary : salaryB.estimatedSalary;
  const loserSalary = higherCountry === "A" ? salaryB.estimatedSalary : salaryA.estimatedSalary;
  const pppWinner = salaryA.pppAdjusted >= salaryB.pppAdjusted ? countryA.name : countryB.name;
  const pppLoser = salaryA.pppAdjusted >= salaryB.pppAdjusted ? countryB.name : countryA.name;
  const pppHigher = Math.max(salaryA.pppAdjusted, salaryB.pppAdjusted);
  const pppLower = Math.min(salaryA.pppAdjusted, salaryB.pppAdjusted);
  const pppDiffPct = pppLower > 0 ? Math.round(((pppHigher - pppLower) / pppLower) * 100) : 0;

  const faqItems = [
    {
      question: `Which country pays ${occupation.title}s more, ${countryA.name} or ${countryB.name}?`,
      answer: percentageDiff > 0
        ? `${winnerName} pays ${occupation.title}s ${percentageDiff}% more than ${loserName}. The estimated annual salary is ${formatCurrency(winnerSalary)} USD in ${winnerName} compared to ${formatCurrency(loserSalary)} USD in ${loserName}, based on OECD and BLS data.`
        : `${countryA.name} and ${countryB.name} offer very similar salaries for ${occupation.title}s, at ${formatCurrency(salaryA.estimatedSalary)} USD and ${formatCurrency(salaryB.estimatedSalary)} USD respectively.`,
    },
    {
      question: `How does cost of living compare between ${countryA.name} and ${countryB.name} for ${occupation.title}s?`,
      answer: `When adjusted for purchasing power, ${pppWinner} leads with a PPP-adjusted salary of ${formatCurrency(pppHigher)} USD compared to ${formatCurrency(pppLower)} USD in ${pppLoser}${pppDiffPct > 0 ? ` — a ${pppDiffPct}% difference` : ""}. ${bigMacCountA > 0 && bigMacCountB > 0 ? `Using the Big Mac Index, a ${occupation.title}'s salary buys ${formatNumber(bigMacCountA)} burgers per year in ${countryA.name} versus ${formatNumber(bigMacCountB)} in ${countryB.name}.` : "This PPP adjustment accounts for differences in the cost of goods and services between both countries."}`,
    },
    {
      question: `Should I relocate from ${countryA.name} to ${countryB.name} as a ${occupation.title}?`,
      answer: `Relocation decisions involve more than salary alone. ${countryB.name} offers an estimated ${formatCurrency(salaryB.estimatedSalary)} USD salary for ${occupation.title}s${salaryB.estimatedSalary > salaryA.estimatedSalary ? `, which is ${Math.round(((salaryB.estimatedSalary - salaryA.estimatedSalary) / salaryA.estimatedSalary) * 100)}% higher than ${countryA.name}` : `, compared to ${formatCurrency(salaryA.estimatedSalary)} USD in ${countryA.name}`}. However, you should also consider cost of living (PPP-adjusted: ${formatCurrency(salaryB.pppAdjusted)} vs ${formatCurrency(salaryA.pppAdjusted)}), tax structures, work culture, and visa requirements before deciding.`,
    },
    {
      question: `What are the tax differences for ${occupation.title}s between ${countryA.name} and ${countryB.name}?`,
      answer: `Tax systems differ significantly between ${countryA.name} and ${countryB.name}, impacting take-home pay for ${occupation.title}s. While nominal salaries show a ${percentageDiff > 0 ? `${percentageDiff}% gap favoring ${winnerName}` : "similar level"}, effective tax rates and social contributions can narrow or widen this difference. Countries with higher taxes often provide more public services such as healthcare and pensions that offset out-of-pocket costs.`,
    },
    {
      question: `Which country has better career growth for ${occupation.title}s, ${countryA.name} or ${countryB.name}?`,
      answer: `Career growth depends on industry demand, job market conditions, and economic development. ${countryA.name} offers a ${formatPercentile(percentileA)} global percentile for ${occupation.title} compensation, while ${countryB.name} sits at ${formatPercentile(percentileB)}. ${percentileA > percentileB ? `${countryA.name}'s stronger compensation ranking` : percentileB > percentileA ? `${countryB.name}'s stronger compensation ranking` : "Both countries' similar compensation levels"} may indicate ${percentileA > percentileB ? "higher" : percentileB > percentileA ? "higher" : "comparable"} demand for ${occupation.title}s in that market.`,
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

  // Percentile 색상 헬퍼
  const getPercentileColor = (p: number) =>
    p >= 50 ? "text-emerald-400" : p >= 30 ? "text-yellow-400" : "text-red-400";

  const getPercentileBarColor = (p: number) =>
    p >= 50 ? "bg-emerald-500" : p >= 30 ? "bg-yellow-500" : "bg-red-500";

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
              { "@type": "ListItem", position: 3, name: `${countryA.name} vs ${countryB.name}`, item: `https://amipaidfairly.com/compare/${occSlug}/${pair}` },
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

          {/* H1 & Subtitle */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 leading-tight">
              {occupation.title}: {countryA.name} vs {countryB.name}
            </h1>
            <p className="text-slate-500 text-sm mt-3">
              Side-by-side salary comparison &middot; Estimated based on OECD &amp; BLS data
            </p>
          </div>

          {/* Winner indicator */}
          {percentageDiff > 0 && (
            <div className="flex items-center justify-center">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-6 py-3 text-center">
                <p className="text-emerald-400 text-sm font-semibold">
                  {higherCountry === "A" ? countryA.flag : countryB.flag}{" "}
                  {higherCountry === "A" ? countryA.name : countryB.name} pays{" "}
                  <span className="text-emerald-300 text-lg font-bold">
                    {percentageDiff}%
                  </span>{" "}
                  more
                </p>
              </div>
            </div>
          )}

          {/* Side-by-side comparison cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Country A Card */}
            <div
              className={`bg-dark-card border rounded-2xl p-6 ${
                higherCountry === "A" && percentageDiff > 0
                  ? "border-emerald-500/50"
                  : "border-dark-border"
              }`}
            >
              {higherCountry === "A" && percentageDiff > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    Higher Pay
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-3xl">{countryA.flag}</span>
                <div>
                  <h2 className="text-lg font-bold text-slate-50">{countryA.name}</h2>
                  <p className="text-slate-500 text-xs">{countryA.currency}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Estimated Salary (USD) */}
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Estimated Salary (USD)</p>
                  <p className="text-2xl font-bold text-slate-50">
                    {formatCurrency(salaryA.estimatedSalary)}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">per year</p>
                </div>

                {/* Local Currency */}
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">
                    Local Currency ({countryA.currency})
                  </p>
                  <p className="text-xl font-bold text-slate-50">
                    {formatCurrency(localSalaryA, countryA.currencySymbol)}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">per year</p>
                </div>

                {/* Purchasing Power */}
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Purchasing Power</p>
                  <p className="text-xl font-bold text-slate-50">
                    {formatCurrency(salaryA.pppAdjusted)}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">purchasing power</p>
                </div>

                {/* Big Mac Count */}
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Big Mac Power</p>
                  <p className="text-xl font-bold text-slate-50">
                    {bigMacCountA > 0 ? formatNumber(bigMacCountA) : "N/A"}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">burgers / year</p>
                </div>

                {/* Global Percentile */}
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Global Percentile</p>
                  <p className={`text-xl font-bold ${getPercentileColor(percentileA)}`}>
                    {formatPercentile(percentileA)}
                  </p>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getPercentileBarColor(percentileA)}`}
                      style={{ width: `${percentileA}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Country B Card */}
            <div
              className={`bg-dark-card border rounded-2xl p-6 ${
                higherCountry === "B" && percentageDiff > 0
                  ? "border-emerald-500/50"
                  : "border-dark-border"
              }`}
            >
              {higherCountry === "B" && percentageDiff > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    Higher Pay
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-3xl">{countryB.flag}</span>
                <div>
                  <h2 className="text-lg font-bold text-slate-50">{countryB.name}</h2>
                  <p className="text-slate-500 text-xs">{countryB.currency}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Estimated Salary (USD) */}
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Estimated Salary (USD)</p>
                  <p className="text-2xl font-bold text-slate-50">
                    {formatCurrency(salaryB.estimatedSalary)}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">per year</p>
                </div>

                {/* Local Currency */}
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">
                    Local Currency ({countryB.currency})
                  </p>
                  <p className="text-xl font-bold text-slate-50">
                    {formatCurrency(localSalaryB, countryB.currencySymbol)}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">per year</p>
                </div>

                {/* Purchasing Power */}
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Purchasing Power</p>
                  <p className="text-xl font-bold text-slate-50">
                    {formatCurrency(salaryB.pppAdjusted)}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">purchasing power</p>
                </div>

                {/* Big Mac Count */}
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Big Mac Power</p>
                  <p className="text-xl font-bold text-slate-50">
                    {bigMacCountB > 0 ? formatNumber(bigMacCountB) : "N/A"}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">burgers / year</p>
                </div>

                {/* Global Percentile */}
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Global Percentile</p>
                  <p className={`text-xl font-bold ${getPercentileColor(percentileB)}`}>
                    {formatPercentile(percentileB)}
                  </p>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getPercentileBarColor(percentileB)}`}
                      style={{ width: `${percentileB}%` }}
                    />
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
              {/* Salary USD Bar */}
              <div>
                <p className="text-slate-400 text-xs mb-2 font-medium">Salary (USD)</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-300 w-24 sm:w-32 shrink-0 truncate">
                      {countryA.flag} {countryA.name}
                    </span>
                    <div className="flex-1 h-7 bg-slate-800 rounded-md overflow-hidden relative">
                      <div
                        className={`h-full rounded-md transition-all ${
                          salaryA.estimatedSalary >= salaryB.estimatedSalary
                            ? "bg-emerald-500"
                            : "bg-slate-600"
                        }`}
                        style={{
                          width: `${maxSalary > 0 ? (salaryA.estimatedSalary / maxSalary) * 100 : 0}%`,
                        }}
                      />
                      <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-slate-200">
                        {formatUSDShort(salaryA.estimatedSalary)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-300 w-24 sm:w-32 shrink-0 truncate">
                      {countryB.flag} {countryB.name}
                    </span>
                    <div className="flex-1 h-7 bg-slate-800 rounded-md overflow-hidden relative">
                      <div
                        className={`h-full rounded-md transition-all ${
                          salaryB.estimatedSalary >= salaryA.estimatedSalary
                            ? "bg-emerald-500"
                            : "bg-slate-600"
                        }`}
                        style={{
                          width: `${maxSalary > 0 ? (salaryB.estimatedSalary / maxSalary) * 100 : 0}%`,
                        }}
                      />
                      <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-slate-200">
                        {formatUSDShort(salaryB.estimatedSalary)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchasing Power Bar */}
              <div>
                <p className="text-slate-400 text-xs mb-2 font-medium">Purchasing Power (USD)</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-300 w-24 sm:w-32 shrink-0 truncate">
                      {countryA.flag} {countryA.name}
                    </span>
                    <div className="flex-1 h-7 bg-slate-800 rounded-md overflow-hidden relative">
                      <div
                        className={`h-full rounded-md transition-all ${
                          salaryA.pppAdjusted >= salaryB.pppAdjusted
                            ? "bg-blue-500"
                            : "bg-slate-600"
                        }`}
                        style={{
                          width: `${maxPPP > 0 ? (salaryA.pppAdjusted / maxPPP) * 100 : 0}%`,
                        }}
                      />
                      <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-slate-200">
                        {formatUSDShort(salaryA.pppAdjusted)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-300 w-24 sm:w-32 shrink-0 truncate">
                      {countryB.flag} {countryB.name}
                    </span>
                    <div className="flex-1 h-7 bg-slate-800 rounded-md overflow-hidden relative">
                      <div
                        className={`h-full rounded-md transition-all ${
                          salaryB.pppAdjusted >= salaryA.pppAdjusted
                            ? "bg-blue-500"
                            : "bg-slate-600"
                        }`}
                        style={{
                          width: `${maxPPP > 0 ? (salaryB.pppAdjusted / maxPPP) * 100 : 0}%`,
                        }}
                      />
                      <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-slate-200">
                        {formatUSDShort(salaryB.pppAdjusted)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Big Mac Bar */}
              {bigMacCountA > 0 && bigMacCountB > 0 && (
                <div>
                  <p className="text-slate-400 text-xs mb-2 font-medium">
                    Big Mac Power (burgers/year)
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-300 w-24 sm:w-32 shrink-0 truncate">
                        {countryA.flag} {countryA.name}
                      </span>
                      <div className="flex-1 h-7 bg-slate-800 rounded-md overflow-hidden relative">
                        <div
                          className={`h-full rounded-md transition-all ${
                            bigMacCountA >= bigMacCountB
                              ? "bg-amber-500"
                              : "bg-slate-600"
                          }`}
                          style={{
                            width: `${maxBigMac > 0 ? (bigMacCountA / maxBigMac) * 100 : 0}%`,
                          }}
                        />
                        <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-slate-200">
                          {formatNumber(bigMacCountA)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-300 w-24 sm:w-32 shrink-0 truncate">
                        {countryB.flag} {countryB.name}
                      </span>
                      <div className="flex-1 h-7 bg-slate-800 rounded-md overflow-hidden relative">
                        <div
                          className={`h-full rounded-md transition-all ${
                            bigMacCountB >= bigMacCountA
                              ? "bg-amber-500"
                              : "bg-slate-600"
                          }`}
                          style={{
                            width: `${maxBigMac > 0 ? (bigMacCountB / maxBigMac) * 100 : 0}%`,
                          }}
                        />
                        <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-slate-200">
                          {formatNumber(bigMacCountB)}
                        </span>
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

          {/* Internal Links */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Explore More
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/salary/${occSlug}/${countryA.slug}`}
                className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
              >
                {countryA.flag} {occupation.title} in {countryA.name}
              </Link>
              <Link
                href={`/salary/${occSlug}/${countryB.slug}`}
                className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
              >
                {countryB.flag} {occupation.title} in {countryB.name}
              </Link>
              <Link
                href={`/rankings/${occSlug}`}
                className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
              >
                {occupation.title} Global Rankings
              </Link>
              <Link
                href={`/salary/${occSlug}`}
                className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
              >
                {occupation.title} in All Countries
              </Link>
            </div>
          </div>

          {/* Editorial Content: Why Salaries Differ */}
          {insightA && insightB && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <h2 className="text-xl font-bold text-slate-100 mb-3">
                Why Salaries Differ Between {countryA.name} and {countryB.name}
              </h2>
              <div className="space-y-4">
                <p className="text-slate-300 text-sm leading-relaxed">
                  Salary differences between {countryA.name} and {countryB.name} stem from
                  fundamental economic structures, labor market dynamics, and cost of living
                  disparities. Understanding these factors is essential for professionals
                  considering relocation or evaluating international job offers for{" "}
                  {occupation.title} roles.
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  <strong className="text-slate-200">{countryA.name}:</strong>{" "}
                  {insightA.economy}
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  <strong className="text-slate-200">{countryB.name}:</strong>{" "}
                  {insightB.economy}
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  These economic fundamentals directly influence what employers can offer{" "}
                  {occupation.title}s in each country. A{" "}
                  {higherCountry === "A" ? countryA.name : countryB.name} employer operates
                  within a {higherCountry === "A" ? "larger or more profitable" : "stronger"}{" "}
                  economic context for this occupation, which partly explains the{" "}
                  {percentageDiff > 0 ? `${percentageDiff}% salary gap` : "similar salary levels"}{" "}
                  observed in the data.
                </p>
              </div>
            </div>
          )}

          {/* Editorial Content: Tax and Take-Home Pay */}
          {insightA && insightB && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <h2 className="text-xl font-bold text-slate-100 mb-3">
                Tax and Take-Home Pay Comparison
              </h2>
              <div className="space-y-4">
                <p className="text-slate-300 text-sm leading-relaxed">
                  Nominal salary figures only tell part of the story. The real question for any{" "}
                  {occupation.title} comparing offers between {countryA.name} and{" "}
                  {countryB.name} is: how much money actually reaches your bank account each
                  month? Tax systems, social contributions, and mandated benefits vary
                  significantly between these two countries.
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  <strong className="text-slate-200">{countryA.name}:</strong>{" "}
                  {insightA.taxSystem}
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  <strong className="text-slate-200">{countryB.name}:</strong>{" "}
                  {insightB.taxSystem}
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  When evaluating a {occupation.title} position in either country, consider
                  not just the gross salary but the effective take-home pay after all
                  deductions. Countries with higher taxes often provide more public services
                  (healthcare, education, pensions) that reduce out-of-pocket expenses
                  elsewhere.
                </p>
              </div>
            </div>
          )}

          {/* Editorial Content: Career Prospects and Job Market */}
          {insightA && insightB && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <h2 className="text-xl font-bold text-slate-100 mb-3">
                Career Prospects and Job Market
              </h2>
              <div className="space-y-4">
                <p className="text-slate-300 text-sm leading-relaxed">
                  Beyond immediate salary, long-term career prospects and job market
                  conditions matter greatly for {occupation.title}s deciding between{" "}
                  {countryA.name} and {countryB.name}. Demand for your skills, employment
                  stability, and growth opportunities differ between these markets.
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  <strong className="text-slate-200">{countryA.name}:</strong>{" "}
                  {insightA.jobMarket}
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  <strong className="text-slate-200">{countryB.name}:</strong>{" "}
                  {insightB.jobMarket}
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  The key industries in {countryA.name} include {insightA.topIndustries} In{" "}
                  {countryB.name}, the leading sectors are {insightB.topIndustries} These
                  industry profiles shape demand and compensation for {occupation.title}{" "}
                  professionals in each market.
                </p>
              </div>
            </div>
          )}

          {/* Editorial Content: Work Culture and Lifestyle */}
          {insightA && insightB && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <h2 className="text-xl font-bold text-slate-100 mb-3">
                Work Culture and Lifestyle
              </h2>
              <div className="space-y-4">
                <p className="text-slate-300 text-sm leading-relaxed">
                  Work culture significantly impacts day-to-day satisfaction and should be
                  weighed alongside salary when choosing where to work as a{" "}
                  {occupation.title}.
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  <strong className="text-slate-200">{countryA.name}:</strong>{" "}
                  {insightA.workCulture}
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  <strong className="text-slate-200">{countryB.name}:</strong>{" "}
                  {insightB.workCulture}
                </p>
              </div>
            </div>
          )}

          {/* Editorial Content: Cost of Living Context */}
          {insightA && insightB && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <h2 className="text-xl font-bold text-slate-100 mb-3">
                Cost of Living Context
              </h2>
              <div className="space-y-4">
                <p className="text-slate-300 text-sm leading-relaxed">
                  A higher salary does not always mean a better standard of living. Cost of
                  living differences between {countryA.name} and {countryB.name} can
                  significantly shift which country offers more real purchasing power for a{" "}
                  {occupation.title}.
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  <strong className="text-slate-200">{countryA.name}:</strong>{" "}
                  {insightA.costOfLiving}
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  <strong className="text-slate-200">{countryB.name}:</strong>{" "}
                  {insightB.costOfLiving}
                </p>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Frequently Asked Questions
            </h2>
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
              experience, company, and region. Data is for informational purposes
              only.
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
