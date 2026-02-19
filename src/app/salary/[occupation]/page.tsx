import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getOccupations,
  getOccupation,
  getCountries,
  getSalaryEntries,
  getCountry,
} from "@/lib/data-loader";
import QuickCompareForm from "@/components/QuickCompareForm";
import { formatCurrency, formatNumber, toMonthly, toHourly, formatHourly } from "@/lib/format";
import { calculateBigMacCount, calculatePercentileDistribution } from "@/lib/salary-calculator";
import SalaryPeriodToggle from "@/components/SalaryPeriodToggle";
import { blogPosts } from "@/data/blog-posts";
import type { SalaryEntry } from "@/types";

// ---------- SSG ----------
export function generateStaticParams() {
  const occupations = getOccupations();
  return occupations.map((o) => ({ occupation: o.slug }));
}

// ---------- Dynamic SEO meta ----------
interface PageParams {
  params: Promise<{ occupation: string }>;
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { occupation: slug } = await params;
  const occupation = getOccupation(slug);
  if (!occupation) {
    return { title: "Not Found | Am I Paid Fairly?" };
  }

  // 메타 설명에 실제 연봉 숫자 포함 (SERP CTR 향상)
  const entries = getSalaryEntries(slug);
  const salaries = entries.map((e) => e.estimatedSalary).sort((a, b) => a - b);
  const lowestSalary = salaries.length > 0 ? salaries[0] : 0;
  const highestSalary = salaries.length > 0 ? salaries[salaries.length - 1] : 0;

  const title = `${occupation.title} Salary Worldwide | AIPF`;
  const description = `${occupation.title} salaries range from $${Math.round(lowestSalary / 1000).toLocaleString("en-US")}k to $${Math.round(highestSalary / 1000).toLocaleString("en-US")}k across ${entries.length} countries. US average: ${formatCurrency(occupation.baseUSA)}. Compare globally with PPP and Big Mac Index.`;

  const ogParams = new URLSearchParams();
  ogParams.set("title", `${occupation.title} Salary Worldwide (2026)`);
  ogParams.set("subtitle", `Compare across 42 countries`);
  const ogImage = `/api/og?${ogParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://amipaidfairly.com/salary/${occupation.slug}`,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://amipaidfairly.com/salary/${occupation.slug}`,
    },
    other: {
      "tldr": `${occupation.title} salary worldwide: $${Math.round(lowestSalary / 1000)}k–$${Math.round(highestSalary / 1000)}k across ${entries.length} countries. US average: ${formatCurrency(occupation.baseUSA)}.`,
    },
  };
}

// ---------- 국가별 행 데이터 빌드 ----------
interface CountryRow {
  code: string;
  slug: string;
  name: string;
  flag: string;
  estimatedSalary: number;
  pppAdjusted: number;
  bigMacCount: number;
}

function buildCountryRows(occupationSlug: string): CountryRow[] {
  const entries: SalaryEntry[] = getSalaryEntries(occupationSlug);

  const rows: CountryRow[] = entries
    .map((entry) => {
      const country = getCountry(entry.countryCode);
      if (!country) return null;

      const bigMacCount = calculateBigMacCount(
        entry.countryCode,
        entry.estimatedSalary
      );

      return {
        code: country.code,
        slug: country.slug,
        name: country.name,
        flag: country.flag,
        estimatedSalary: entry.estimatedSalary,
        pppAdjusted: entry.pppAdjusted,
        bigMacCount,
      };
    })
    .filter((row): row is CountryRow => row !== null);

  // 연봉 높은 순 정렬
  rows.sort((a, b) => b.estimatedSalary - a.estimatedSalary);
  return rows;
}

// ---------- 슬러그 기반 해시 (결정적 선택용) ----------
function slugHash(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// ---------- FAQ 구조화 데이터 (카테고리별 다양화) ----------
function buildFaqJsonLd(
  occupationTitle: string,
  category: string,
  occupationSlug: string,
  rows: CountryRow[]
) {
  const highestCountry = rows[0];
  const lowestCountry = rows[rows.length - 1];
  const avgSalary =
    rows.length > 0
      ? Math.round(
          rows.reduce((sum, r) => sum + r.estimatedSalary, 0) / rows.length
        )
      : 0;

  // --- 공통 FAQ 풀 (모든 카테고리에서 사용) ---
  const genericPool: { question: string; answer: string }[] = [
    {
      question: `What is the average ${occupationTitle} salary worldwide?`,
      answer: `The estimated global average salary for a ${occupationTitle} across ${rows.length} countries is approximately ${formatCurrency(avgSalary)} USD per year. This is based on OECD and BLS data.`,
    },
    {
      question: `Which country pays ${occupationTitle}s the most?`,
      answer: highestCountry
        ? `${highestCountry.name} has the highest estimated salary for ${occupationTitle}s at ${formatCurrency(highestCountry.estimatedSalary)} USD per year.`
        : `Data is not available at this time.`,
    },
    {
      question: `How are these salary estimates calculated?`,
      answer: `Salary estimates are calculated using U.S. Bureau of Labor Statistics (BLS) occupational data as a baseline, adjusted per country using OECD average wage data, GDP per capita, and sector-specific multipliers. Purchasing power-adjusted values use the Big Mac Index from The Economist as a cost-of-living proxy.`,
    },
    {
      question: `What does PPP-adjusted salary mean?`,
      answer: `PPP (Purchasing Power Parity) adjusted salary reflects what a salary can actually buy in a given country, using the Big Mac Index as a cost-of-living proxy. A lower nominal salary in one country may go further than a higher salary in another due to differences in cost of living.`,
    },
    {
      question: `What factors influence ${occupationTitle} salary differences between countries?`,
      answer: `Key factors include the country's GDP per capita, cost of living, local demand for ${occupationTitle}s, labor supply, government regulations, industry maturity, and the relative strength of the local currency. Tax structures and social benefits also play a role in overall compensation packages.`,
    },
    {
      question: `How does experience level affect ${occupationTitle} pay globally?`,
      answer: `Experience significantly impacts ${occupationTitle} salaries worldwide. Entry-level positions typically earn 30-50% less than the average shown here, while senior professionals with 10+ years of experience can earn 50-100% more. The experience premium varies by country and local market conditions.`,
    },
    {
      question: `Are ${occupationTitle} salaries rising or falling worldwide?`,
      answer: `${occupationTitle} salaries have generally trended upward in most OECD countries, though growth rates vary. High-demand markets and economies with labor shortages tend to see faster salary growth. Our estimates are updated periodically to reflect the latest publicly available data from BLS and OECD sources.`,
    },
    {
      question: `Which regions offer the best work-life balance for ${occupationTitle}s?`,
      answer: `European countries, particularly the Nordics (Sweden, Norway, Denmark, Finland) and Western Europe (Germany, Netherlands, France), typically offer ${occupationTitle}s stronger work-life balance through generous vacation policies, shorter working hours, and robust labor protections — though salaries may be lower than in the United States.`,
    },
  ];

  // --- 카테고리별 특화 FAQ ---
  const categoryPools: Record<string, { question: string; answer: string }[]> = {
    Tech: [
      {
        question: `How does remote work affect ${occupationTitle} salaries?`,
        answer: `Remote work has significantly impacted ${occupationTitle} compensation. Many companies now offer location-adjusted salaries, meaning remote workers in lower-cost areas may earn less than those in tech hubs. However, remote-friendly policies have also expanded access to higher-paying opportunities regardless of location.`,
      },
      {
        question: `Which tech hubs pay the most for ${occupationTitle}s?`,
        answer: `The highest-paying tech hubs for ${occupationTitle}s include Silicon Valley, New York, Seattle, and Zurich. In Asia, Singapore and select cities in Australia also offer competitive tech salaries. European tech hubs like London, Berlin, and Amsterdam are growing but generally offer lower nominal pay than U.S. counterparts.`,
      },
      {
        question: `Is demand for ${occupationTitle}s expected to grow?`,
        answer: `Yes, demand for ${occupationTitle}s is projected to remain strong globally, driven by digital transformation, AI adoption, and increasing reliance on technology across all industries. Countries investing heavily in tech infrastructure tend to see the strongest salary growth for this role.`,
      },
    ],
    Healthcare: [
      {
        question: `Is there a global shortage of ${occupationTitle}s?`,
        answer: `Many countries face shortages of qualified ${occupationTitle}s, particularly in rural and underserved areas. This shortage tends to drive higher salaries in countries with acute demand. Aging populations in OECD countries are expected to increase demand for healthcare professionals further.`,
      },
      {
        question: `How do public vs private sector salaries compare for ${occupationTitle}s?`,
        answer: `In most countries, ${occupationTitle}s in the private sector earn 15-40% more than their public sector counterparts. However, public sector positions often offer better job security, pensions, and benefits. Countries with universal healthcare systems (e.g., UK, Canada) may have smaller public-private pay gaps.`,
      },
      {
        question: `Do ${occupationTitle}s need different certifications in different countries?`,
        answer: `Yes, healthcare certifications and licensing requirements vary significantly by country. Most countries require ${occupationTitle}s to hold local licenses or pass equivalency exams before practicing. This can affect salary timelines for professionals relocating internationally.`,
      },
    ],
    Finance: [
      {
        question: `How do bonus structures vary by country for ${occupationTitle}s?`,
        answer: `Bonus structures for ${occupationTitle}s differ widely. In the United States and United Kingdom, performance bonuses can add 20-100% on top of base salary, particularly in investment banking. Continental European countries tend to have more modest bonus structures, while Asian financial centers like Singapore and Hong Kong offer competitive variable pay.`,
      },
      {
        question: `Which financial centers pay the most for ${occupationTitle}s?`,
        answer: `The highest-paying financial centers for ${occupationTitle}s include New York, London, Hong Kong, Singapore, and Zurich. These cities serve as global or regional financial hubs where competition for talent drives premium compensation packages.`,
      },
      {
        question: `How do regulations affect ${occupationTitle} compensation globally?`,
        answer: `Financial regulations impact ${occupationTitle} pay in several ways. Stricter regulatory environments (like the EU's bonus caps for bankers) can limit variable compensation. However, increased regulatory complexity can also drive demand for compliance-skilled professionals, pushing base salaries higher.`,
      },
    ],
    Education: [
      {
        question: `How do ${occupationTitle} salaries compare between public and private institutions?`,
        answer: `Private institutions often pay ${occupationTitle}s 10-30% more than public schools, though this varies significantly by country. In some nations like Finland and South Korea, public sector education salaries are highly competitive and come with strong job security and benefits.`,
      },
      {
        question: `Do ${occupationTitle}s get paid more in countries with higher education spending?`,
        answer: `There is a strong correlation between national education spending as a percentage of GDP and ${occupationTitle} compensation. Countries like Luxembourg, Switzerland, and the Nordic nations invest heavily in education and tend to offer higher salaries and better working conditions for educators.`,
      },
    ],
    Engineering: [
      {
        question: `Which industries pay ${occupationTitle}s the most?`,
        answer: `For ${occupationTitle}s, the highest-paying industries typically include oil and gas, aerospace and defense, semiconductor manufacturing, and automotive. Industry demand and specialization significantly impact salary, with niche expertise often commanding a premium above the averages shown here.`,
      },
      {
        question: `How does infrastructure investment affect ${occupationTitle} demand?`,
        answer: `Countries with large infrastructure investment programs tend to have higher demand and salaries for ${occupationTitle}s. Rapidly developing economies and nations with aging infrastructure both create sustained demand for engineering talent, though at different salary levels.`,
      },
    ],
  };

  // 해당 카테고리의 특화 풀 가져오기 (없으면 빈 배열)
  const categorySpecific = categoryPools[category] || [];

  // 최종 FAQ 선택: 카테고리 특화 2개 + 일반 풀 3개 (총 5개)
  // 슬러그 해시로 결정적 선택
  const hash = slugHash(occupationSlug);

  let selectedFaqs: { question: string; answer: string }[];

  if (categorySpecific.length >= 2) {
    // 카테고리 특화 풀에서 2개 선택
    const catIdx1 = hash % categorySpecific.length;
    const catIdx2 = (hash + 1) % categorySpecific.length;
    const catFaqs = [categorySpecific[catIdx1]];
    if (catIdx2 !== catIdx1) catFaqs.push(categorySpecific[catIdx2]);

    // 일반 풀에서 나머지 채움 (5개 맞추기)
    const remaining = 5 - catFaqs.length;
    const genStart = hash % genericPool.length;
    const genFaqs: { question: string; answer: string }[] = [];
    for (let i = 0; i < remaining; i++) {
      genFaqs.push(genericPool[(genStart + i) % genericPool.length]);
    }
    selectedFaqs = [...catFaqs, ...genFaqs];
  } else {
    // 카테고리 특화 풀이 부족하면 일반 풀에서 5개 선택
    const start = hash % genericPool.length;
    selectedFaqs = [];
    for (let i = 0; i < 5; i++) {
      selectedFaqs.push(genericPool[(start + i) % genericPool.length]);
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: selectedFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// ---------- Page component ----------
export default async function OccupationSalaryPage({
  params,
}: PageParams) {
  const { occupation: slug } = await params;
  const occupation = getOccupation(slug);
  if (!occupation) {
    redirect("/");
  }

  const rows = buildCountryRows(occupation.slug);
  const allCountries = getCountries().map((c) => ({
    code: c.code,
    name: c.name,
    slug: c.slug,
    flag: c.flag,
  }));

  const totalCountries = rows.length;
  const globalAvg =
    totalCountries > 0
      ? Math.round(
          rows.reduce((sum, r) => sum + r.estimatedSalary, 0) / totalCountries
        )
      : 0;

  const faqJsonLd = buildFaqJsonLd(occupation.title, occupation.category, occupation.slug, rows);

  // Occupation JSON-LD (Google estimatedSalary rich result)
  const percentileDist = calculatePercentileDistribution(occupation.slug);
  const occupationJsonLd = percentileDist
    ? {
        "@context": "https://schema.org/",
        "@type": "Occupation",
        name: occupation.title,
        estimatedSalary: [
          {
            "@type": "MonetaryAmountDistribution",
            name: "base",
            currency: "USD",
            unitText: "YEAR",
            median: percentileDist.median,
            percentile10: percentileDist.percentile10,
            percentile25: percentileDist.percentile25,
            percentile75: percentileDist.percentile75,
            percentile90: percentileDist.percentile90,
          },
        ],
      }
    : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-10">
      {/* 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {occupationJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(occupationJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://amipaidfairly.com" },
              { "@type": "ListItem", position: 2, name: occupation.title, item: `https://amipaidfairly.com/salary/${slug}` },
            ],
          }),
        }}
      />

      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">{occupation.title}</span>
        </nav>

        {/* Header */}
        <header className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-50 leading-tight">
            {occupation.title} Salary Worldwide{" "}
            <span className="text-slate-500">(2026)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Data last updated: February 2026</p>
          <p className="text-slate-500 text-sm mt-2">
            Estimated based on OECD &amp; BLS data
          </p>
          {rows.length >= 2 && (
            <p className="text-slate-300 text-sm mt-2 max-w-xl mx-auto">
              The average {occupation.title} earns {formatCurrency(occupation.baseUSA)} in the United States, with salaries ranging from {formatCurrency(rows[rows.length - 1].estimatedSalary)} to {formatCurrency(rows[0].estimatedSalary)} across {totalCountries} countries.
            </p>
          )}
        </header>

        {/* Quick Compare Form */}
        <QuickCompareForm
          occupationSlug={occupation.slug}
          occupationTitle={occupation.title}
          countries={allCountries}
        />

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-dark-card rounded-2xl p-4 border border-dark-border text-center">
            <p className="text-slate-500 text-xs mb-1">US Salary (BLS)</p>
            <SalaryPeriodToggle
              yearly={formatCurrency(occupation.baseUSA)}
              monthly={formatCurrency(toMonthly(occupation.baseUSA))}
              hourly={formatHourly(toHourly(occupation.baseUSA))}
            />
          </div>
          <div className="bg-dark-card rounded-2xl p-4 border border-dark-border text-center">
            <p className="text-slate-500 text-xs mb-1">Countries</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-400">
              {totalCountries}
            </p>
          </div>
          <div className="bg-dark-card rounded-2xl p-4 border border-dark-border text-center">
            <p className="text-slate-500 text-xs mb-1">Global Average</p>
            <SalaryPeriodToggle
              yearly={formatCurrency(globalAvg)}
              monthly={formatCurrency(toMonthly(globalAvg))}
              hourly={formatHourly(toHourly(globalAvg))}
            />
          </div>
        </div>

        {/* Country comparison table */}
        <section>
          <h2 className="text-slate-200 font-bold text-lg mb-4">
            Salary by Country
          </h2>

          {/* Table header (desktop) */}
          <div className="hidden md:grid md:grid-cols-[2.5rem_1fr_8rem_8rem_6rem] gap-3 px-4 pb-2 text-xs text-slate-500 font-medium">
            <span>#</span>
            <span>Country</span>
            <span className="text-right">Salary (USD)</span>
            <span className="text-right">Purchasing Power</span>
            <span className="text-right">Big Macs</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {rows.map((row, index) => (
              <Link
                key={row.code}
                href={`/salary/${occupation.slug}/${row.slug}`}
                className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-card border border-dark-border hover:border-slate-600 transition-colors"
              >
                {/* Rank */}
                <span className="text-slate-600 text-xs font-mono w-6 shrink-0 text-right">
                  {index + 1}
                </span>

                {/* Flag + Name */}
                <span className="text-2xl shrink-0">{row.flag}</span>
                <span className="flex-1 min-w-0 text-slate-200 font-semibold text-sm truncate group-hover:text-white transition-colors">
                  {row.name}
                </span>

                {/* Salary (USD) */}
                <span className="text-slate-100 font-bold text-sm text-right w-20 md:w-[8rem] shrink-0">
                  {formatCurrency(row.estimatedSalary)}
                </span>

                {/* Purchasing Power - hidden on mobile */}
                <span className="hidden md:block text-slate-400 text-sm text-right w-[8rem] shrink-0">
                  {formatCurrency(row.pppAdjusted)}
                </span>

                {/* Big Mac count - hidden on mobile */}
                <span className="hidden md:block text-slate-400 text-sm text-right w-[6rem] shrink-0">
                  {formatNumber(row.bigMacCount)}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Compare Countries Section */}
        <section>
          <h2 className="text-slate-200 font-bold text-lg mb-4">
            Compare Countries
          </h2>
          <p className="text-slate-500 text-sm mb-4">
            See how {occupation.title} salaries compare between countries
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { pair: "united-states-vs-south-korea", label: "US vs South Korea" },
              { pair: "united-states-vs-japan", label: "US vs Japan" },
              { pair: "united-states-vs-germany", label: "US vs Germany" },
              { pair: "united-states-vs-united-kingdom", label: "US vs UK" },
              { pair: "south-korea-vs-japan", label: "Korea vs Japan" },
              { pair: "united-kingdom-vs-germany", label: "UK vs Germany" },
              { pair: "australia-vs-canada", label: "Australia vs Canada" },
              { pair: "india-vs-china", label: "India vs China" },
            ].map(({ pair, label }) => (
              <Link
                key={pair}
                href={`/compare/${occupation.slug}/${pair}`}
                className="text-sm bg-dark-card hover:bg-slate-800/50 border border-dark-border hover:border-slate-600 text-slate-300 hover:text-emerald-400 transition-colors px-4 py-2 rounded-lg"
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="mt-4">
            <Link
              href={`/rankings/${occupation.slug}`}
              className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm inline-flex items-center gap-1"
            >
              See full global rankings
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
        </section>

        {/* Narrative Content — SEO 본문 텍스트 */}
        <article className="flex flex-col gap-6">
          <section>
            <h2 className="text-slate-200 font-bold text-lg mb-3">
              {occupation.title} Salary Overview: A Global Perspective
            </h2>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3">
              <p>
                The average {occupation.title} salary varies dramatically across
                the globe. In the United States, {occupation.title}s earn an
                estimated{" "}
                <strong className="text-slate-200">
                  {formatCurrency(occupation.baseUSA)} USD
                </strong>{" "}
                per year, which serves as our baseline for international
                comparisons. Across all {totalCountries} countries we track, the
                global average salary for this occupation is approximately{" "}
                <strong className="text-slate-200">
                  {formatCurrency(globalAvg)} USD
                </strong>
                .
              </p>
              <p>
                {rows.length >= 2 && (
                  <>
                    The highest-paying country for {occupation.title}s is{" "}
                    <strong className="text-slate-200">{rows[0].name}</strong> at{" "}
                    {formatCurrency(rows[0].estimatedSalary)} USD per year,
                    while the lowest among tracked countries is{" "}
                    <strong className="text-slate-200">
                      {rows[rows.length - 1].name}
                    </strong>{" "}
                    at {formatCurrency(rows[rows.length - 1].estimatedSalary)}{" "}
                    USD. This{" "}
                    {rows[0].estimatedSalary > 0 && rows[rows.length - 1].estimatedSalary > 0
                      ? `${Math.round(rows[0].estimatedSalary / rows[rows.length - 1].estimatedSalary)}x`
                      : "significant"}{" "}
                    difference reflects the vast disparities in economic
                    development, labor market conditions, and industry demand
                    across different regions.
                  </>
                )}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-slate-200 font-bold text-lg mb-3">
              Understanding Salary Differences
            </h2>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3">
              <p>
                Nominal salary figures only tell part of the story. A higher
                salary in one country doesn&apos;t necessarily mean a better
                standard of living. That&apos;s why we include Purchasing Power
                adjusted salaries and the Big Mac Index in our
                comparisons. Purchasing power adjustments account for differences in the cost
                of goods and services between countries, giving you a more
                accurate picture of what your salary can actually buy.
              </p>
              <p>
                For example, a {occupation.title} earning{" "}
                {rows.length > 0 && formatCurrency(rows[0].estimatedSalary)} in{" "}
                {rows.length > 0 && rows[0].name} might have{" "}
                {rows.length > 0 &&
                rows[0].pppAdjusted < rows[0].estimatedSalary
                  ? "less purchasing power than the nominal figure suggests due to a higher cost of living"
                  : "more purchasing power than expected due to a lower cost of living"}
                . The Big Mac Index, developed by The Economist, offers an
                intuitive way to compare purchasing power using the price of a
                McDonald&apos;s Big Mac as a universal benchmark.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-slate-200 font-bold text-lg mb-3">
              Methodology and Data Sources
            </h2>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3">
              <p>
                Our salary estimates are calculated using data from the U.S.
                Bureau of Labor Statistics (BLS) as a baseline, adjusted per
                country using OECD average wage data and GDP per capita figures
                from the World Bank. Each occupation also has a sector-specific
                multiplier that accounts for how wages in that particular field
                differ from the national average.
              </p>
              <p>
                These figures should be used as approximate benchmarks rather
                than precise predictions. Actual salaries can vary significantly
                based on years of experience, education level, specific employer,
                city or region within a country, and current market conditions.
                For the most accurate salary information, we recommend combining
                these estimates with local job market data and salary surveys.
              </p>
            </div>
          </section>
        </article>

        {/* CTA */}
        <div className="text-center py-6">
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

        {/* Related Articles */}
        {(() => {
          const relatedPosts = blogPosts
            .filter(
              (post) =>
                post.occupationSlug === occupation.slug ||
                post.keywords.some((kw) =>
                  kw.toLowerCase().includes(occupation.title.toLowerCase())
                )
            )
            .slice(0, 3);
          return relatedPosts.length > 0 ? (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Related Articles
              </h3>
              <div className="flex flex-col gap-3">
                {relatedPosts.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                    <p className="text-slate-300 text-sm font-medium group-hover:text-emerald-400 transition-colors">
                      {post.title}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">{post.readTime} min read · {post.category}</p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null;
        })()}

        {/* FAQ Section */}
        <section>
          <h3 className="text-slate-200 font-bold text-lg mb-4">
            Frequently Asked Questions
          </h3>
          <div className="flex flex-col gap-3">
            {faqJsonLd.mainEntity.map(
              (item: { name: string; acceptedAnswer: { text: string } }, i: number) => (
                <details
                  key={i}
                  className="group bg-dark-card rounded-xl border border-dark-border overflow-hidden"
                >
                  <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-slate-200 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                    <span>{item.name}</span>
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
                      className="shrink-0 ml-2 text-slate-500 transition-transform group-open:rotate-180"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">
                    {item.acceptedAnswer.text}
                  </div>
                </details>
              )
            )}
          </div>
        </section>

        {/* Data source disclaimer */}
        <footer className="border-t border-dark-border pt-6 pb-8">
          <p className="text-slate-600 text-[11px] text-center leading-relaxed">
            All salary figures are estimates derived from publicly available
            data. Actual salaries vary by experience, company, location, and
            other factors.{" "}
            <span className="block mt-1">
              Sources:{" "}
              <a
                href="https://www.bls.gov/oes/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-400 transition-colors"
              >
                U.S. Bureau of Labor Statistics (BLS)
              </a>
              {" "}&middot;{" "}
              <a
                href="https://stats.oecd.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-400 transition-colors"
              >
                OECD Average Wages
              </a>
              {" "}&middot;{" "}
              <a
                href="https://data.worldbank.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-400 transition-colors"
              >
                World Bank
              </a>
              {" "}&middot;{" "}
              <a
                href="https://github.com/TheEconomist/big-mac-data"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-400 transition-colors"
              >
                The Economist Big Mac Index
              </a>
            </span>
          </p>
        </footer>
      </div>
    </main>
  );
}
