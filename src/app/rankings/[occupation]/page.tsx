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
import { getCountryInsight } from "@/data/country-insights";
import { calculateBigMacCount } from "@/lib/salary-calculator";
import { blogPosts } from "@/data/blog-posts";
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

  // 메타 설명에 실제 연봉 숫자 포함 (SERP CTR 향상)
  const entries = getSalaryEntries(slug);
  const ranked = entries
    .map((e) => {
      const c = getCountry(e.countryCode);
      return c ? { name: c.name, salary: e.estimatedSalary } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b!.salary - a!.salary) as { name: string; salary: number }[];
  const topCountryName = ranked.length > 0 ? ranked[0].name : "";
  const topSalary = ranked.length > 0 ? ranked[0].salary : 0;

  const title = `${occupation.title} Salary Rankings 2026 | AIPF`;
  const description = topCountryName
    ? `${occupation.title} salary rankings 2026: ${topCountryName} leads at ${formatCurrency(topSalary)}. Compare ${ranked.length} countries by nominal salary and purchasing power.`
    : `Global salary rankings for ${occupation.title}s. See which countries pay the highest salaries, PPP-adjusted wages, and Big Mac purchasing power.`;

  const ogParams = new URLSearchParams();
  ogParams.set("title", `Highest Paying Countries for ${occupation.title}s`);
  ogParams.set("subtitle", `Global salary rankings (2026)`);
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

  // 랭킹 FAQ용 통계 계산
  const globalAvgSalary = rankedCountries.length > 0
    ? Math.round(rankedCountries.reduce((sum, r) => sum + r.salaryEntry.estimatedSalary, 0) / rankedCountries.length)
    : 0;
  const aboveAvgCount = rankedCountries.filter((r) => r.salaryEntry.estimatedSalary > globalAvgSalary).length;
  const pppSorted = [...rankedCountries].sort(
    (a, b) => b.salaryEntry.pppAdjusted - a.salaryEntry.pppAdjusted
  );
  const pppTop = pppSorted.length > 0 ? pppSorted[0] : null;
  const topCountry = rankedCountries.length > 0 ? rankedCountries[0] : null;
  const bottomCountry = rankedCountries.length > 0 ? rankedCountries[rankedCountries.length - 1] : null;
  const salaryRatioTopBottom = topCountry && bottomCountry && bottomCountry.salaryEntry.estimatedSalary > 0
    ? Math.round(topCountry.salaryEntry.estimatedSalary / bottomCountry.salaryEntry.estimatedSalary)
    : 0;

  // JSON-LD FAQ 구조화 데이터 — 랭킹 페이지 고유 질문/답변
  const faqItems = [
    {
      question: `Which country pays ${occupation.title}s the most in 2026?`,
      answer: topCountry
        ? `${topCountry.country.name} pays the highest estimated salary for ${occupation.title}s in 2026 at ${formatCurrency(topCountry.salaryEntry.estimatedSalary)} USD per year. This is ${salaryRatioTopBottom > 0 ? `roughly ${salaryRatioTopBottom}x more than the lowest-paying country, ${bottomCountry!.country.name}, at ${formatCurrency(bottomCountry!.salaryEntry.estimatedSalary)} USD` : "significantly more than the lowest-paying country"}.`
        : `Data is not yet available for ${occupation.title}s.`,
    },
    {
      question: `Where do ${occupation.title}s have the highest purchasing power?`,
      answer: pppTop
        ? `${pppTop.country.name} offers the highest purchasing power for ${occupation.title}s with a PPP-adjusted salary of ${formatCurrency(pppTop.salaryEntry.pppAdjusted)} USD.${topCountry && pppTop.country.code !== topCountry.country.code ? ` This differs from the nominal ranking where ${topCountry.country.name} leads, highlighting how cost of living adjustments can change which country truly offers the most value.` : ` ${pppTop.country.name} leads both nominal and purchasing-power-adjusted rankings, indicating strong real earning potential.`}`
        : `Purchasing power data is being updated for ${occupation.title}s.`,
    },
    {
      question: `Why do ${occupation.title} salaries vary so much between countries?`,
      answer: `${occupation.title} salaries range from ${bottomCountry ? formatCurrency(bottomCountry.salaryEntry.estimatedSalary) : "N/A"} to ${topCountry ? formatCurrency(topCountry.salaryEntry.estimatedSalary) : "N/A"} USD across ${rankedCountries.length} countries${salaryRatioTopBottom > 0 ? `, a ${salaryRatioTopBottom}:1 ratio` : ""}. This variation is driven by differences in economic development, cost of living, labor supply and demand, industry maturity, and government wage policies. Countries with higher GDP per capita and greater demand for ${occupation.title}s tend to offer significantly higher compensation.`,
    },
    {
      question: `How many countries pay above-average ${occupation.title} salaries?`,
      answer: `Only ${aboveAvgCount} out of ${rankedCountries.length} countries pay above the global average ${occupation.title} salary of ${formatCurrency(globalAvgSalary)} USD. This means the majority of countries (${rankedCountries.length - aboveAvgCount}) fall below the global average, reflecting how salary distribution is heavily skewed toward a small number of high-income economies.`,
    },
    {
      question: `What is the global average ${occupation.title} salary?`,
      answer: `The global average ${occupation.title} salary across ${rankedCountries.length} countries is approximately ${formatCurrency(globalAvgSalary)} USD per year. However, this average can be misleading since salaries range from ${bottomCountry ? formatCurrency(bottomCountry.salaryEntry.estimatedSalary) : "N/A"} to ${topCountry ? formatCurrency(topCountry.salaryEntry.estimatedSalary) : "N/A"} USD. The median and purchasing-power-adjusted figures provide a more accurate picture of typical ${occupation.title} compensation worldwide.`,
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-12">
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
              { "@type": "ListItem", position: 2, name: "Rankings", item: "https://amipaidfairly.com/browse" },
              { "@type": "ListItem", position: 3, name: occupation.title, item: `https://amipaidfairly.com/rankings/${slug}` },
            ],
          }),
        }}
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

        {/* Regional Breakdown */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-200 mb-4">
            Regional Breakdown
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(() => {
              const regions: { name: string; codes: string[]; emoji: string }[] = [
                { name: "Americas", codes: ["US","CA","MX","BR","CL","CO","CR"], emoji: "🌎" },
                { name: "Europe", codes: ["DE","GB","FR","CH","SE","NO","DK","NL","BE","FI","IE","AT","IT","ES","PT","PL","CZ","HU","SK","GR","LT","LV","EE","SI","LU","IS","TR"], emoji: "🌍" },
                { name: "Asia-Pacific", codes: ["JP","KR","AU","NZ","IN","CN","SG","IL"], emoji: "🌏" },
              ];
              return regions.map((region) => {
                const regionCountries = rankedCountries.filter((rc) =>
                  region.codes.includes(rc.country.code)
                );
                if (regionCountries.length === 0) return null;
                const avgSalary = Math.round(
                  regionCountries.reduce((s, r) => s + r.salaryEntry.estimatedSalary, 0) / regionCountries.length
                );
                const best = regionCountries[0];
                const worst = regionCountries[regionCountries.length - 1];
                return (
                  <div key={region.name} className="bg-dark-card border border-dark-border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{region.emoji}</span>
                      <h3 className="text-sm font-bold text-slate-200">{region.name}</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Average</span>
                        <span className="text-slate-200 font-semibold">{formatCurrency(avgSalary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Highest</span>
                        <span className="text-emerald-400">{best.country.flag} {formatCurrency(best.salaryEntry.estimatedSalary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Lowest</span>
                        <span className="text-red-400">{worst.country.flag} {formatCurrency(worst.salaryEntry.estimatedSalary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Countries</span>
                        <span className="text-slate-300">{regionCountries.length}</span>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </section>

        {/* How Rankings Change with Purchasing Power */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-200 mb-4">
            How Rankings Change with Purchasing Power
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            Nominal salary rankings don&apos;t account for cost of living. Here&apos;s how the top 10 changes when adjusted for purchasing power using the Big Mac Index.
          </p>
          <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-[60px_1fr_120px_120px_80px] gap-2 px-6 py-3 bg-slate-800/50 border-b border-dark-border text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Rank</span>
              <span>Country</span>
              <span className="text-right">Nominal</span>
              <span className="text-right">Purch. Power</span>
              <span className="text-right">Change</span>
            </div>
            {(() => {
              const ppRanked = [...rankedCountries]
                .sort((a, b) => b.salaryEntry.pppAdjusted - a.salaryEntry.pppAdjusted)
                .slice(0, 10);
              return ppRanked.map((item, idx) => {
                const nominalRank = item.rank;
                const ppRank = idx + 1;
                const diff = nominalRank - ppRank;
                return (
                  <Link
                    key={item.country.code}
                    href={`/salary/${slug}/${item.country.slug}`}
                    className="grid grid-cols-[40px_1fr_auto_auto] sm:grid-cols-[60px_1fr_120px_120px_80px] gap-2 px-4 sm:px-6 py-3 border-b border-dark-border last:border-b-0 hover:bg-slate-800/40 transition-colors items-center group"
                  >
                    <span className="text-sm font-bold text-slate-500">#{ppRank}</span>
                    <span className="flex items-center gap-2 text-sm text-slate-200 group-hover:text-emerald-400 transition-colors">
                      <span>{item.country.flag}</span> {item.country.name}
                    </span>
                    <span className="text-sm text-slate-400 text-right">{formatCurrency(item.salaryEntry.estimatedSalary)}</span>
                    <span className="text-sm font-semibold text-slate-100 text-right">{formatCurrency(item.salaryEntry.pppAdjusted)}</span>
                    <span className={`hidden sm:block text-sm font-bold text-right ${diff > 0 ? "text-emerald-400" : diff < 0 ? "text-red-400" : "text-slate-500"}`}>
                      {diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : "—"}
                    </span>
                  </Link>
                );
              });
            })()}
          </div>
          <p className="text-slate-500 text-xs mt-2">
            &ldquo;Change&rdquo; shows how many positions each country moved compared to the nominal salary ranking. Positive means the country ranks higher after purchasing power adjustment.
          </p>
        </section>

        {/* Full Rankings Link */}
        <section className="mb-12 text-center">
          <Link
            href={`/salary/${slug}`}
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium"
          >
            View all {rankedCountries.length} countries with detailed salary data
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </Link>
        </section>

        {/* Country Comparisons Section */}
        <section className="mb-12">
          <h3 className="text-xl font-bold text-slate-200 mb-4">
            Country Comparisons
          </h3>
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

        {/* Related Rankings */}
        <section className="mb-12">
          <h3 className="text-xl font-bold text-slate-200 mb-4">
            Related Rankings
          </h3>
          <div className="flex flex-wrap gap-2">
            {getOccupations()
              .filter((o) => o.slug !== slug && o.category === occupation.category)
              .slice(0, 5)
              .map((o) => (
                <Link
                  key={o.slug}
                  href={`/rankings/${o.slug}`}
                  className="text-sm bg-dark-card hover:bg-slate-800/50 border border-dark-border hover:border-slate-600 text-slate-300 hover:text-emerald-400 transition-colors px-4 py-2 rounded-lg"
                >
                  {o.title} Rankings
                </Link>
              ))}
          </div>
        </section>

        {/* Explore Cities */}
        <section className="mb-12">
          <h3 className="text-xl font-bold text-slate-200 mb-4">
            Explore Top Cities
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/cities`}
              className="text-sm bg-dark-card hover:bg-slate-800/50 border border-dark-border hover:border-slate-600 text-slate-300 hover:text-emerald-400 transition-colors px-4 py-2 rounded-lg"
            >
              Browse All Cities
            </Link>
            {["new-york", "london", "tokyo"].map((citySlug) => (
              <Link
                key={citySlug}
                href={`/cities/${citySlug}`}
                className="text-sm bg-dark-card hover:bg-slate-800/50 border border-dark-border hover:border-slate-600 text-slate-300 hover:text-emerald-400 transition-colors px-4 py-2 rounded-lg"
              >
                All Salaries in {citySlug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
              </Link>
            ))}
          </div>
        </section>

        {/* Related Articles */}
        {(() => {
          const relatedPosts = blogPosts
            .filter(
              (post) =>
                post.occupationSlug === slug ||
                post.keywords.some((kw) =>
                  kw.toLowerCase().includes(occupation.title.toLowerCase())
                )
            )
            .slice(0, 2);
          return relatedPosts.length > 0 ? (
            <section className="mb-12">
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
                      <p className="text-slate-500 text-xs mt-1">{post.readTime} min read</p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          ) : null;
        })()}

        {/* Narrative Content — SEO 본문 텍스트 */}
        <article className="mb-12">
          <div className="flex flex-col gap-6">
            <section>
              <h3 className="text-xl font-bold text-slate-200 mb-3">
                {occupation.title} Salary Rankings: Key Insights
              </h3>
              <div className="text-slate-400 text-sm leading-relaxed space-y-3">
                <p>
                  Our global salary rankings for {occupation.title}s cover{" "}
                  {rankedCountries.length} countries, revealing significant
                  variations in compensation across different economies.
                  {rankedCountries.length >= 2 && (
                    <>
                      {" "}The highest-paying country,{" "}
                      <strong className="text-slate-200">
                        {rankedCountries[0].country.name}
                      </strong>
                      , offers an estimated salary of{" "}
                      {formatCurrency(rankedCountries[0].salaryEntry.estimatedSalary)}{" "}
                      USD per year — roughly{" "}
                      {rankedCountries[rankedCountries.length - 1].salaryEntry.estimatedSalary > 0
                        ? `${Math.round(
                            rankedCountries[0].salaryEntry.estimatedSalary /
                              rankedCountries[rankedCountries.length - 1].salaryEntry.estimatedSalary
                          )}x`
                        : "significantly"}{" "}
                      more than{" "}
                      <strong className="text-slate-200">
                        {rankedCountries[rankedCountries.length - 1].country.name}
                      </strong>
                      , the lowest-paying country at{" "}
                      {formatCurrency(
                        rankedCountries[rankedCountries.length - 1].salaryEntry.estimatedSalary
                      )}{" "}
                      USD.
                    </>
                  )}
                </p>
                <p>
                  These salary differences are driven by multiple factors
                  including local economic conditions, cost of living, labor
                  supply and demand, industry maturity, and government wage
                  policies. Countries with strong economies and high demand for{" "}
                  {occupation.title}s tend to offer higher compensation, though
                  this doesn&apos;t always translate to better purchasing power.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-200 mb-3">
                Beyond Nominal Salary: Purchasing Power Matters
              </h2>
              <div className="text-slate-400 text-sm leading-relaxed space-y-3">
                <p>
                  While nominal salary rankings provide a useful overview, they
                  don&apos;t account for differences in cost of living. Our
                  PPP-adjusted figures offer a more realistic picture of what{" "}
                  {occupation.title}s can actually afford in each country. In some
                  cases, countries with lower nominal salaries may rank higher
                  when adjusted for purchasing power.
                </p>
                <p>
                  The Big Mac Index column provides an intuitive, everyday measure
                  of purchasing power. Developed by The Economist, it uses the
                  price of a McDonald&apos;s Big Mac to compare the real value of
                  currencies and salaries across countries. A higher Big Mac count
                  means your salary stretches further in terms of everyday
                  purchases.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-200 mb-3">
                How We Calculate These Rankings
              </h2>
              <div className="text-slate-400 text-sm leading-relaxed space-y-3">
                <p>
                  These rankings are based on publicly available data from the
                  U.S. Bureau of Labor Statistics (BLS), OECD average wage
                  statistics, World Bank purchasing power parity data, and
                  The Economist&apos;s Big Mac Index. We use the U.S. salary for{" "}
                  {occupation.title}s as a baseline (
                  {formatCurrency(occupation.baseUSA)} USD) and adjust it for
                  each country using wage ratios derived from OECD and World Bank
                  data, along with occupation-specific sector multipliers.
                </p>
                <p>
                  These estimates are intended as approximate benchmarks for
                  international salary comparison. Actual compensation varies
                  based on experience level, specific employer, city or region,
                  education, certifications, and current market conditions. We
                  update our data periodically to reflect the latest available
                  statistics.
                </p>
              </div>
            </section>
          </div>
        </article>

        {/* Regional Analysis — 에디토리얼 콘텐츠 (AdSense 승인용) */}
        <section className="mt-12 space-y-8">
          {/* 1. Regional Salary Analysis */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <h3 className="text-xl font-bold text-slate-100 mb-3">
              Regional Salary Analysis
            </h3>
            {(() => {
              const topEntries = rankedCountries.slice(0, 3);
              return topEntries.map((item, idx) => {
                const insight = getCountryInsight(item.country.code);
                if (!insight) return null;
                return (
                  <div key={item.country.code} className="mb-4 last:mb-0">
                    <h3 className="text-base font-semibold text-emerald-400 mb-2">
                      #{idx + 1} {item.country.flag} {item.country.name} — {formatCurrency(item.salaryEntry.estimatedSalary)}/year
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-3">
                      {item.country.name} leads {idx === 0 ? "the global rankings" : `as the #${idx + 1} highest-paying country`} for {occupation.title}s,
                      with an estimated annual salary of {formatCurrency(item.salaryEntry.estimatedSalary)} USD.
                      This is closely tied to the nation&apos;s economic profile: {insight.economy}
                    </p>
                    <p className="text-slate-300 text-sm leading-relaxed mb-3">
                      The key industries driving demand for {occupation.title}s in {item.country.name} include {insight.topIndustries.toLowerCase()}.
                      These sectors create sustained demand for skilled professionals,
                      which pushes compensation above the global average.
                      {item.salaryEntry.pppAdjusted > 0 && (
                        <> When adjusted for purchasing power, the salary translates to approximately {formatCurrency(item.salaryEntry.pppAdjusted)} USD in real terms.</>
                      )}
                    </p>
                  </div>
                );
              });
            })()}
          </div>

          {/* 2. Factors That Drive Global Salaries */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <h3 className="text-xl font-bold text-slate-100 mb-3">
              Factors That Drive Global {occupation.title} Salaries
            </h3>
            {(() => {
              const highest = rankedCountries.length > 0 ? rankedCountries[0].salaryEntry.estimatedSalary : 0;
              const lowest = rankedCountries.length > 0 ? rankedCountries[rankedCountries.length - 1].salaryEntry.estimatedSalary : 1;
              const ratio = lowest > 0 ? Math.round(highest / lowest) : 0;
              const avgSalary = rankedCountries.length > 0
                ? Math.round(rankedCountries.reduce((sum, r) => sum + r.salaryEntry.estimatedSalary, 0) / rankedCountries.length)
                : 0;
              const aboveAvgCount = rankedCountries.filter((r) => r.salaryEntry.estimatedSalary > avgSalary).length;
              return (
                <>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    {occupation.title} salaries vary dramatically across the {rankedCountries.length} countries in our dataset.
                    The gap between the highest-paying country ({rankedCountries.length > 0 ? rankedCountries[0].country.name : "N/A"} at {formatCurrency(highest)}) and the lowest
                    ({rankedCountries.length > 0 ? rankedCountries[rankedCountries.length - 1].country.name : "N/A"} at {formatCurrency(lowest)}) represents
                    a {ratio}:1 ratio — meaning the top-paying market offers roughly {ratio} times the compensation of the lowest.
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    Several structural factors explain these disparities. <strong className="text-slate-100">Economic development</strong> is the most significant driver:
                    wealthier nations with higher GDP per capita tend to offer higher nominal salaries. <strong className="text-slate-100">Industry demand</strong> also
                    plays a critical role — countries with thriving sectors that employ {occupation.title}s naturally bid up wages through
                    competition for talent. Only {aboveAvgCount} out of {rankedCountries.length} countries pay above the global average of {formatCurrency(avgSalary)},
                    highlighting how salary distribution is skewed toward a handful of high-income economies.
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    <strong className="text-slate-100">Cost of living</strong> and <strong className="text-slate-100">labor supply</strong> further
                    shape compensation. Countries with a limited pool of qualified {occupation.title}s and high living costs (like Switzerland or Norway)
                    tend to offer premium salaries. Conversely, nations with large talent pools or lower living costs may offer lower nominal pay
                    even when the purchasing power remains competitive.
                  </p>
                </>
              );
            })()}
          </div>

          {/* 3. Where Your Salary Goes Furthest */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <h3 className="text-xl font-bold text-slate-100 mb-3">
              Where Your Salary Goes Furthest
            </h3>
            {(() => {
              const nominalTop = rankedCountries.length > 0 ? rankedCountries[0] : null;
              const pppRanked = [...rankedCountries].sort(
                (a, b) => b.salaryEntry.pppAdjusted - a.salaryEntry.pppAdjusted
              );
              const pppTop = pppRanked.length > 0 ? pppRanked[0] : null;
              const pppTopThree = pppRanked.slice(0, 3);
              return (
                <>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    A high nominal salary does not always mean greater purchasing power.
                    {nominalTop && pppTop && nominalTop.country.code !== pppTop.country.code ? (
                      <> While {nominalTop.country.flag} {nominalTop.country.name} ranks #1 in nominal salary at {formatCurrency(nominalTop.salaryEntry.estimatedSalary)},
                        {pppTop.country.flag} {pppTop.country.name} takes the top spot when adjusted for purchasing power
                        with a PPP-adjusted value of {formatCurrency(pppTop.salaryEntry.pppAdjusted)}.
                        This means that {occupation.title}s in {pppTop.country.name} can afford more goods and services
                        relative to their local cost of living.</>
                    ) : nominalTop ? (
                      <> {nominalTop.country.flag} {nominalTop.country.name} leads both nominal and PPP-adjusted rankings
                        for {occupation.title}s, with a PPP-adjusted salary of {formatCurrency(nominalTop.salaryEntry.pppAdjusted)}.
                        This indicates that the top nominal salary also translates into strong real purchasing power.</>
                    ) : null}
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    The top three countries by purchasing power for {occupation.title}s are{" "}
                    {pppTopThree.map((item, idx) => (
                      <span key={item.country.code}>
                        {idx > 0 && idx < pppTopThree.length - 1 && ", "}
                        {idx === pppTopThree.length - 1 && pppTopThree.length > 1 && ", and "}
                        <strong className="text-slate-100">{item.country.name}</strong> ({formatCurrency(item.salaryEntry.pppAdjusted)} PPP)
                      </span>
                    ))}.
                    When relocating or comparing job offers across borders, considering purchasing power alongside
                    nominal salary is essential for understanding the true value of your compensation.
                  </p>
                </>
              );
            })()}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
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
