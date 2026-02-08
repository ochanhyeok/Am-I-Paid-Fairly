import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getOccupations,
  getOccupation,
  getSalaryEntries,
  getCountry,
} from "@/lib/data-loader";
import { formatCurrency, formatNumber } from "@/lib/format";
import { calculateBigMacCount } from "@/lib/salary-calculator";
import type { SalaryEntry } from "@/types";

// ---------- SSG ----------
export function generateStaticParams() {
  const occupations = getOccupations();
  return occupations.map((o) => ({ occupation: o.slug }));
}

// ---------- Dynamic SEO meta ----------
export function generateMetadata({
  params,
}: {
  params: { occupation: string };
}): Metadata {
  const occupation = getOccupation(params.occupation);
  if (!occupation) {
    return { title: "Not Found | Am I Paid Fairly?" };
  }

  const title = `${occupation.title} Salary Worldwide (2026) | Am I Paid Fairly?`;
  const description = `Compare ${occupation.title} salaries across 42 countries. See estimated earnings in USD, PPP-adjusted values, and Big Mac purchasing power for every country.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://amipaidfairly.com/salary/${occupation.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://amipaidfairly.com/salary/${occupation.slug}`,
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

// ---------- FAQ 구조화 데이터 ----------
function buildFaqJsonLd(occupationTitle: string, rows: CountryRow[]) {
  const highestCountry = rows[0];
  const lowestCountry = rows[rows.length - 1];
  const avgSalary =
    rows.length > 0
      ? Math.round(
          rows.reduce((sum, r) => sum + r.estimatedSalary, 0) / rows.length
        )
      : 0;

  const faqs = [
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
      question: `Which country pays ${occupationTitle}s the least?`,
      answer: lowestCountry
        ? `${lowestCountry.name} has the lowest estimated salary for ${occupationTitle}s at ${formatCurrency(lowestCountry.estimatedSalary)} USD per year among the countries we track.`
        : `Data is not available at this time.`,
    },
    {
      question: `How are these salary estimates calculated?`,
      answer: `Salary estimates are calculated using U.S. Bureau of Labor Statistics (BLS) occupational data as a baseline, adjusted per country using OECD average wage data, GDP per capita, and sector-specific multipliers. PPP-adjusted values use World Bank purchasing power parity factors. Big Mac counts use The Economist's Big Mac Index.`,
    },
    {
      question: `What does PPP-adjusted salary mean?`,
      answer: `PPP (Purchasing Power Parity) adjusted salary reflects what a salary can actually buy in a given country. A lower nominal salary in one country may go further than a higher salary in another due to differences in cost of living.`,
    },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
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
export default function OccupationSalaryPage({
  params,
}: {
  params: { occupation: string };
}) {
  const occupation = getOccupation(params.occupation);
  if (!occupation) {
    redirect("/");
  }

  const rows = buildCountryRows(occupation.slug);

  const totalCountries = rows.length;
  const globalAvg =
    totalCountries > 0
      ? Math.round(
          rows.reduce((sum, r) => sum + r.estimatedSalary, 0) / totalCountries
        )
      : 0;

  const faqJsonLd = buildFaqJsonLd(occupation.title, rows);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-10">
      {/* FAQ 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
          <p className="text-slate-500 text-sm mt-2">
            Estimated based on OECD &amp; BLS data
          </p>
        </header>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-dark-card rounded-2xl p-4 border border-dark-border text-center">
            <p className="text-slate-500 text-xs mb-1">US Base Salary</p>
            <p className="text-xl md:text-2xl font-bold text-slate-50">
              {formatCurrency(occupation.baseUSA)}
            </p>
          </div>
          <div className="bg-dark-card rounded-2xl p-4 border border-dark-border text-center">
            <p className="text-slate-500 text-xs mb-1">Countries</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-400">
              {totalCountries}
            </p>
          </div>
          <div className="bg-dark-card rounded-2xl p-4 border border-dark-border text-center">
            <p className="text-slate-500 text-xs mb-1">Global Average</p>
            <p className="text-xl md:text-2xl font-bold text-slate-50">
              {formatCurrency(globalAvg)}
            </p>
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
            <span className="text-right">PPP Adjusted</span>
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

                {/* PPP Adjusted - hidden on mobile */}
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
            See how {occupation.title} salaries compare between the United States and other countries
          </p>
          <div className="flex flex-wrap gap-2">
            {["south-korea", "japan", "germany", "united-kingdom", "france"].map((countrySlug) => (
              <Link
                key={countrySlug}
                href={`/compare/${occupation.slug}/united-states-vs-${countrySlug}`}
                className="text-sm bg-dark-card hover:bg-slate-800/50 border border-dark-border hover:border-slate-600 text-slate-300 hover:text-emerald-400 transition-colors px-4 py-2 rounded-lg"
              >
                US vs {countrySlug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
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

        {/* FAQ Section */}
        <section>
          <h2 className="text-slate-200 font-bold text-lg mb-4">
            Frequently Asked Questions
          </h2>
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
