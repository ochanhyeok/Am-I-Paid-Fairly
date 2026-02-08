import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getOccupation,
  getOccupations,
  getSalaryEntries,
  getCountry,
  getCountries,
  getBigMacEntry,
} from "@/lib/data-loader";
import { formatCurrency, formatNumber } from "@/lib/format";
import { calculateBigMacCount } from "@/lib/salary-calculator";
import type { SalaryEntry, Country, BigMacEntry } from "@/types";

// --- 정적 파라미터 생성 (30개 직업 전부) ---
export function generateStaticParams() {
  const occupations = getOccupations();
  return occupations.map((o) => ({
    occupation: o.slug,
  }));
}

// --- 메타데이터 ---
interface MetadataProps {
  params: Promise<{ occupation: string }>;
}

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { occupation: slug } = await params;
  const occupation = getOccupation(slug);

  if (!occupation) {
    return { title: "Ranking Not Found | Am I Paid Fairly?" };
  }

  const title = `Highest Paying Countries for ${occupation.title}s (2026) | Am I Paid Fairly?`;
  const description = `Global salary rankings for ${occupation.title}s across 42 countries. See which countries pay the highest salaries, PPP-adjusted wages, and Big Mac purchasing power.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    alternates: {
      canonical: `https://amipaidfairly.com/rankings/${slug}`,
    },
  };
}

// --- 랭킹 행 데이터 타입 ---
interface RankedCountry {
  rank: number;
  country: Country;
  salaryEntry: SalaryEntry;
  bigMacCount: number;
}

// --- 페이지 컴포넌트 ---
interface PageProps {
  params: Promise<{ occupation: string }>;
}

export default async function RankingsPage({ params }: PageProps) {
  const { occupation: slug } = await params;
  const occupation = getOccupation(slug);

  // 직업이 유효하지 않으면 홈으로 리다이렉트
  if (!occupation) {
    redirect("/");
  }

  const salaryEntries = getSalaryEntries(slug);
  const countries = getCountries();

  // 급여 데이터를 높은 순으로 정렬하고 국가 정보 결합
  const rankedCountries: RankedCountry[] = salaryEntries
    .map((entry) => {
      const country = getCountry(entry.countryCode);
      if (!country) return null;
      const bigMacCount = calculateBigMacCount(
        entry.countryCode,
        entry.estimatedSalary
      );
      return {
        rank: 0,
        country,
        salaryEntry: entry,
        bigMacCount,
      };
    })
    .filter((item): item is RankedCountry => item !== null)
    .sort((a, b) => b.salaryEntry.estimatedSalary - a.salaryEntry.estimatedSalary)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  // 바 차트용 상위 10개국
  const top10 = rankedCountries.slice(0, 10);
  const maxSalary = top10.length > 0 ? top10[0].salaryEntry.estimatedSalary : 1;

  // JSON-LD FAQ 구조화 데이터
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Which country pays ${occupation.title}s the most?`,
        acceptedAnswer: {
          "@type": "Answer",
          text:
            rankedCountries.length > 0
              ? `${rankedCountries[0].country.name} pays the highest estimated salary for ${occupation.title}s at ${formatCurrency(rankedCountries[0].salaryEntry.estimatedSalary)} USD per year.`
              : `Data is not yet available for ${occupation.title}s.`,
        },
      },
      {
        "@type": "Question",
        name: `How much do ${occupation.title}s earn globally?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${occupation.title} salaries vary widely across ${rankedCountries.length} countries, ranging from ${rankedCountries.length > 0 ? formatCurrency(rankedCountries[rankedCountries.length - 1].salaryEntry.estimatedSalary) : "N/A"} to ${rankedCountries.length > 0 ? formatCurrency(rankedCountries[0].salaryEntry.estimatedSalary) : "N/A"} USD per year.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the purchasing power of a ${occupation.title}'s salary?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Purchasing power varies significantly by country. We use the Big Mac Index and PPP adjustments to compare real purchasing power across ${rankedCountries.length} countries.`,
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-12">
      {/* JSON-LD 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 leading-tight">
            Highest Paying Countries for {occupation.title}s (2026)
          </h1>
          <p className="text-slate-400 text-base mt-3">
            Ranked by estimated annual salary (USD)
          </p>
          <p className="text-slate-600 text-xs mt-2">
            Estimated based on OECD &amp; BLS data. Actual salaries vary by
            experience, company, and region.
          </p>
        </div>

        {/* 상위 10개국 바 차트 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-200 mb-4">
            Top 10 Countries
          </h2>
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-3">
            {top10.map((item) => {
              const widthPercent =
                (item.salaryEntry.estimatedSalary / maxSalary) * 100;
              return (
                <div key={item.country.code} className="flex items-center gap-3">
                  <span className="text-sm text-slate-500 w-6 text-right shrink-0">
                    #{item.rank}
                  </span>
                  <span className="text-lg shrink-0">{item.country.flag}</span>
                  <span className="text-sm text-slate-300 w-28 sm:w-36 shrink-0 truncate">
                    {item.country.name}
                  </span>
                  <div className="flex-1 h-7 bg-slate-800 rounded-md overflow-hidden relative">
                    <div
                      className="h-full bg-emerald-500 rounded-md transition-all duration-500"
                      style={{ width: `${widthPercent}%` }}
                    />
                    <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-slate-200">
                      {formatCurrency(item.salaryEntry.estimatedSalary)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 전체 국가 랭킹 테이블 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-200 mb-4">
            Full Country Rankings
          </h2>
          <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
            {/* 테이블 헤더 */}
            <div className="hidden sm:grid sm:grid-cols-[60px_1fr_140px_140px_120px] gap-2 px-6 py-3 bg-slate-800/50 border-b border-dark-border text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Rank</span>
              <span>Country</span>
              <span className="text-right">Salary (USD)</span>
              <span className="text-right">PPP Adjusted</span>
              <span className="text-right">Big Macs/yr</span>
            </div>

            {/* 테이블 행 */}
            {rankedCountries.map((item) => (
              <Link
                key={item.country.code}
                href={`/salary/${slug}/${item.country.slug}`}
                className="grid grid-cols-[40px_1fr_auto] sm:grid-cols-[60px_1fr_140px_140px_120px] gap-2 px-4 sm:px-6 py-3 border-b border-dark-border last:border-b-0 hover:bg-slate-800/40 transition-colors items-center group"
              >
                {/* Rank */}
                <span
                  className={`text-sm font-bold ${
                    item.rank <= 3
                      ? "text-emerald-400"
                      : "text-slate-500"
                  }`}
                >
                  #{item.rank}
                </span>

                {/* Country name + flag */}
                <span className="flex items-center gap-2">
                  <span className="text-lg">{item.country.flag}</span>
                  <span className="text-sm text-slate-200 group-hover:text-emerald-400 transition-colors">
                    {item.country.name}
                  </span>
                </span>

                {/* Salary USD */}
                <span className="text-sm font-semibold text-slate-100 text-right">
                  {formatCurrency(item.salaryEntry.estimatedSalary)}
                </span>

                {/* PPP Adjusted */}
                <span className="hidden sm:block text-sm text-slate-400 text-right">
                  {formatCurrency(item.salaryEntry.pppAdjusted)}
                </span>

                {/* Big Mac count */}
                <span className="hidden sm:block text-sm text-slate-400 text-right">
                  {item.bigMacCount > 0
                    ? formatNumber(item.bigMacCount)
                    : "N/A"}
                </span>
              </Link>
            ))}

            {rankedCountries.length === 0 && (
              <div className="px-6 py-8 text-center text-slate-500">
                No salary data available for this occupation.
              </div>
            )}
          </div>
        </section>

        {/* Country Comparisons Section */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-200 mb-4">
            Country Comparisons
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            Compare {occupation.title} salaries between the United States and other top-paying countries
          </p>
          <div className="flex flex-wrap gap-2">
            {["south-korea", "japan", "germany", "united-kingdom", "france"].map((countrySlug) => (
              <Link
                key={countrySlug}
                href={`/compare/${slug}/united-states-vs-${countrySlug}`}
                className="text-sm bg-dark-card hover:bg-slate-800/50 border border-dark-border hover:border-slate-600 text-slate-300 hover:text-emerald-400 transition-colors px-4 py-2 rounded-lg"
              >
                US vs {countrySlug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
              </Link>
            ))}
          </div>
        </section>

        {/* CTA + 네비게이션 */}
        <section className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            Compare your own salary
          </Link>
          <Link
            href={`/salary/${slug}`}
            className="inline-flex items-center justify-center px-6 py-3 border border-dark-border text-slate-300 hover:text-slate-100 hover:border-slate-500 font-medium rounded-lg transition-colors text-sm"
          >
            See salary details &rarr;
          </Link>
        </section>

        {/* 데이터 출처 */}
        <footer className="border-t border-dark-border pt-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">
            Data Sources
          </h3>
          <ul className="space-y-1 text-xs text-slate-500">
            <li>
              <a
                href="https://www.bls.gov/oes/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-300 underline"
              >
                U.S. Bureau of Labor Statistics (BLS) — Occupational Employment
                and Wage Statistics
              </a>
            </li>
            <li>
              <a
                href="https://stats.oecd.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-300 underline"
              >
                OECD — Average Annual Wages
              </a>
            </li>
            <li>
              <a
                href="https://data.worldbank.org/indicator/NY.GDP.PCAP.CD"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-300 underline"
              >
                World Bank — GDP per Capita
              </a>
            </li>
            <li>
              <a
                href="https://github.com/TheEconomist/big-mac-data"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-300 underline"
              >
                The Economist — Big Mac Index
              </a>
            </li>
            <li>
              <a
                href="https://www.exchangerate-api.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-300 underline"
              >
                ExchangeRate API — Currency Exchange Rates
              </a>
            </li>
          </ul>
          <p className="text-slate-700 text-[10px] mt-4">
            Estimated based on OECD &amp; BLS data. Actual salaries vary by
            experience, company, and region.
          </p>
        </footer>
      </div>
    </main>
  );
}
