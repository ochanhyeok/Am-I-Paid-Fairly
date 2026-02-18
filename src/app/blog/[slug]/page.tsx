import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { blogPosts, getBlogPost, getAllBlogPosts } from "@/data/blog-posts";
import {
  getOccupation,
  getSalaryEntries,
  getCountry,
  getCountries,
} from "@/lib/data-loader";
import { calculateBigMacCount } from "@/lib/salary-calculator";
import { formatCurrency, formatNumber } from "@/lib/format";

// --- SSG ---
export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

// --- Metadata ---
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return { title: "Post Not Found | Am I Paid Fairly?" };
  }

  const ogParams = new URLSearchParams();
  ogParams.set("title", post.title);
  ogParams.set("subtitle", post.description.slice(0, 100));
  const ogImage = `/api/og?${ogParams.toString()}`;

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.date,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://amipaidfairly.com/blog/${slug}`,
    },
  };
}

// --- 데이터 기반 포스트의 국가별 랭킹 데이터 ---
interface RankedRow {
  rank: number;
  name: string;
  flag: string;
  slug: string;
  salary: number;
  ppp: number;
  bigMacs: number;
}

function buildRankedRows(occupationSlug: string): RankedRow[] {
  const entries = getSalaryEntries(occupationSlug);
  const rows: RankedRow[] = entries
    .map((entry) => {
      const country = getCountry(entry.countryCode);
      if (!country) return null;
      return {
        rank: 0,
        name: country.name,
        flag: country.flag,
        slug: country.slug,
        salary: entry.estimatedSalary,
        ppp: entry.pppAdjusted,
        bigMacs: calculateBigMacCount(entry.countryCode, entry.estimatedSalary),
      };
    })
    .filter((r): r is RankedRow => r !== null)
    .sort((a, b) => b.salary - a.salary)
    .map((r, i) => ({ ...r, rank: i + 1 }));
  return rows;
}

// --- Page Component ---
export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    redirect("/blog");
  }

  const allPosts = getAllBlogPosts();
  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "Am I Paid Fairly?",
      url: "https://amipaidfairly.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Am I Paid Fairly?",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://amipaidfairly.com/blog/${slug}`,
    },
  };

  // --- FAQ 자동 생성 (섹션 헤딩 기반) ---
  const faqItems = (post.sections ?? []).slice(0, 3).map((section) => ({
    question: section.heading.endsWith("?")
      ? section.heading
      : `What about ${section.heading.toLowerCase()}?`,
    answer:
      section.paragraphs[0].substring(0, 300) +
      (section.paragraphs[0].length > 300 ? "..." : ""),
  }));

  const faqJsonLd =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://amipaidfairly.com" },
              { "@type": "ListItem", position: 2, name: "Blog", item: "https://amipaidfairly.com/blog" },
              { "@type": "ListItem", position: 3, name: post.title, item: `https://amipaidfairly.com/blog/${slug}` },
            ],
          }),
        }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd),
          }}
        />
      )}

      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            href="/blog"
            className="hover:text-slate-300 transition-colors"
          >
            Blog
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300 truncate">{post.title}</span>
        </nav>

        {/* Article header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
              {post.category}
            </span>
            <time className="text-slate-500 text-xs" dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span className="text-slate-600 text-xs">
              {post.readTime} min read
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 leading-tight">
            {post.title}
          </h1>
          <p className="text-slate-400 text-base mt-4 leading-relaxed">
            {post.excerpt}
          </p>
        </header>

        {/* Article body */}
        <article className="prose-dark">
          {post.occupationSlug ? (
            <>
              <DataDrivenContent
                occupationSlug={post.occupationSlug}
                postSlug={post.slug}
              />
              {post.sections && post.sections.length > 0 && (
                <div className="mt-8">
                  <EditorialContent sections={post.sections} />
                </div>
              )}
            </>
          ) : post.sections ? (
            <EditorialContent sections={post.sections} />
          ) : null}
        </article>

        {/* Explore the Data */}
        <div className="mt-10 bg-dark-card border border-dark-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Explore the Data
          </h3>
          <div className="flex flex-col gap-2">
            {post.occupationSlug && (() => {
              const occupation = getOccupation(post.occupationSlug);
              return (
                <>
                  <Link href={`/salary/${post.occupationSlug}`} className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                    See {occupation?.title ?? post.occupationSlug} salaries in 42 countries &rarr;
                  </Link>
                  <Link href={`/rankings/${post.occupationSlug}`} className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                    View global salary rankings &rarr;
                  </Link>
                </>
              );
            })()}
            <Link href="/relocate" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
              Try the Relocation Calculator &rarr;
            </Link>
            <Link href="/browse" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
              Browse all 175+ occupations &rarr;
            </Link>
          </div>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-12 border-t border-dark-border pt-8">
            <h3 className="text-lg font-bold text-slate-200 mb-4">
              More Articles
            </h3>
            <div className="flex flex-col gap-3">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/blog/${rp.slug}`}
                  className="group flex items-center gap-4 bg-dark-card border border-dark-border hover:border-slate-600 rounded-xl p-4 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                      {rp.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {rp.category} &middot; {rp.readTime} min read
                    </p>
                  </div>
                  <span className="text-emerald-400 text-sm shrink-0">
                    &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {faqItems.length > 0 && (
          <section className="mt-12">
            <h3 className="text-xl font-bold text-slate-100 mb-4">
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              {faqItems.map((faq, i) => (
                <details
                  key={i}
                  className="bg-dark-card rounded-lg p-4 border border-dark-border"
                >
                  <summary className="text-slate-200 font-medium cursor-pointer">
                    {faq.question}
                  </summary>
                  <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="text-center py-10">
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

        {/* Disclaimer */}
        <footer className="border-t border-dark-border pt-6 pb-4">
          <p className="text-slate-600 text-[11px] text-center leading-relaxed">
            All salary figures are estimates based on OECD &amp; BLS data.
            Actual salaries vary by experience, company, and region. Data is
            for informational purposes only.
          </p>
        </footer>
      </div>
    </main>
  );
}

// --- 에디토리얼 콘텐츠 (sections 기반) ---
function EditorialContent({
  sections,
}: {
  sections: { heading: string; paragraphs: string[] }[];
}) {
  return (
    <div className="flex flex-col gap-8">
      {sections.map((section, i) => (
        <section key={i}>
          <h2 className="text-xl font-bold text-slate-100 mb-3">
            {section.heading}
          </h2>
          <div className="text-slate-400 text-sm leading-relaxed space-y-3">
            {section.paragraphs.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// --- 데이터 기반 콘텐츠 (occupation 데이터로 자동 생성) ---
function DataDrivenContent({
  occupationSlug,
  postSlug,
}: {
  occupationSlug: string;
  postSlug: string;
}) {
  const occupation = getOccupation(occupationSlug);
  if (!occupation) return null;

  const rows = buildRankedRows(occupationSlug);
  if (rows.length === 0) return null;

  const top10 = rows.slice(0, 10);
  const bottom5 = rows.slice(-5);
  const maxSalary = top10[0]?.salary ?? 1;
  const globalAvg = Math.round(
    rows.reduce((s, r) => s + r.salary, 0) / rows.length
  );
  const medianRow = rows[Math.floor(rows.length / 2)];

  return (
    <div className="flex flex-col gap-8">
      {/* Intro */}
      <section>
        <h2 className="text-xl font-bold text-slate-100 mb-3">
          Global {occupation.title} Salary Landscape in 2026
        </h2>
        <div className="text-slate-400 text-sm leading-relaxed space-y-3">
          <p>
            {occupation.title} is one of the most sought-after professions
            globally, but compensation varies dramatically depending on where
            you work. We analyzed salary data across {rows.length} countries
            to bring you a comprehensive comparison of {occupation.title}{" "}
            earnings worldwide in 2026.
          </p>
          <p>
            The global average salary for a {occupation.title} across all
            tracked countries is approximately{" "}
            <strong className="text-slate-200">
              {formatCurrency(globalAvg)} USD
            </strong>{" "}
            per year. However, this average masks enormous variation — the
            highest-paying country offers{" "}
            <strong className="text-slate-200">
              {formatCurrency(top10[0].salary)} USD
            </strong>
            , while the lowest-paying comes in at just{" "}
            <strong className="text-slate-200">
              {formatCurrency(rows[rows.length - 1].salary)} USD
            </strong>
            . That&apos;s a{" "}
            {rows[rows.length - 1].salary > 0
              ? `${Math.round(top10[0].salary / rows[rows.length - 1].salary)}x`
              : "significant"}{" "}
            difference.
          </p>
        </div>
      </section>

      {/* Top 10 Bar Chart */}
      <section>
        <h2 className="text-xl font-bold text-slate-100 mb-4">
          Top 10 Highest Paying Countries
        </h2>
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 space-y-3 mb-4">
          {top10.map((row) => {
            const widthPercent = (row.salary / maxSalary) * 100;
            return (
              <Link
                key={row.slug}
                href={`/salary/${occupationSlug}/${row.slug}`}
                className="flex items-center gap-3 group"
              >
                <span className="text-sm text-slate-500 w-6 text-right shrink-0">
                  #{row.rank}
                </span>
                <span className="text-lg shrink-0">{row.flag}</span>
                <span className="text-sm text-slate-300 w-28 sm:w-36 shrink-0 truncate group-hover:text-white transition-colors">
                  {row.name}
                </span>
                <div className="flex-1 h-7 bg-slate-800 rounded-md overflow-hidden relative">
                  <div
                    className="h-full bg-emerald-500 rounded-md"
                    style={{ width: `${widthPercent}%` }}
                  />
                  <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-slate-200">
                    {formatCurrency(row.salary)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="text-slate-400 text-sm leading-relaxed space-y-3">
          <p>
            {top10[0].flag}{" "}
            <strong className="text-slate-200">{top10[0].name}</strong> leads
            the global ranking for {occupation.title} salaries at{" "}
            {formatCurrency(top10[0].salary)} USD per year.{" "}
            {top10.length >= 3 && (
              <>
                {top10[1].flag} {top10[1].name} follows closely at{" "}
                {formatCurrency(top10[1].salary)} USD, while{" "}
                {top10[2].flag} {top10[2].name} comes in third at{" "}
                {formatCurrency(top10[2].salary)} USD.
              </>
            )}
          </p>
          <p>
            These top-paying countries tend to share common characteristics:
            strong economies, high demand for {occupation.title}s, well-developed
            industries, and higher overall cost of living. However, a high
            nominal salary doesn&apos;t always mean better purchasing power, as
            we&apos;ll explore below.
          </p>
        </div>
      </section>

      {/* Purchasing Power Analysis */}
      <section>
        <h2 className="text-xl font-bold text-slate-100 mb-3">
          Beyond Nominal Salary: Purchasing Power Analysis
        </h2>
        <div className="text-slate-400 text-sm leading-relaxed space-y-3">
          <p>
            Nominal salaries only tell part of the story. When adjusted for
            purchasing power parity (PPP), the rankings can shift significantly.
            A {occupation.title} in a country with a lower nominal salary might
            actually enjoy a higher standard of living due to lower costs of
            goods and services.
          </p>
          {top10.length >= 3 && (
            <p>
              For example,{" "}
              {top10[0].ppp < top10[0].salary ? (
                <>
                  the top-paying country {top10[0].name} has a purchasing power-adjusted
                  salary of {formatCurrency(top10[0].ppp)} USD — actually{" "}
                  <strong className="text-red-400">lower</strong> than the
                  nominal figure, indicating a relatively high cost of living
                </>
              ) : (
                <>
                  the top-paying country {top10[0].name} has a purchasing power-adjusted
                  salary of {formatCurrency(top10[0].ppp)} USD —{" "}
                  <strong className="text-emerald-400">higher</strong> than
                  the nominal figure, indicating relatively affordable living
                  costs
                </>
              )}
              . Meanwhile, countries like {medianRow.name} with a nominal
              salary of {formatCurrency(medianRow.salary)} have a
              purchasing power-adjusted value of {formatCurrency(medianRow.ppp)} USD.
            </p>
          )}
        </div>

        {/* Purchasing Power vs Nominal table for top 10 */}
        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden mt-4">
          <div className="hidden sm:grid sm:grid-cols-[3rem_1fr_7rem_7rem_6rem] gap-2 px-4 py-2 bg-slate-800/50 border-b border-dark-border text-xs font-medium text-slate-500 uppercase">
            <span>#</span>
            <span>Country</span>
            <span className="text-right">Nominal</span>
            <span className="text-right">Purch. Power</span>
            <span className="text-right">Big Macs</span>
          </div>
          {top10.map((row) => (
            <Link
              key={row.slug}
              href={`/salary/${occupationSlug}/${row.slug}`}
              className="grid grid-cols-[2.5rem_1fr_auto] sm:grid-cols-[3rem_1fr_7rem_7rem_6rem] gap-2 px-4 py-3 border-b border-dark-border last:border-b-0 hover:bg-slate-800/40 transition-colors items-center group"
            >
              <span className="text-xs text-slate-500">#{row.rank}</span>
              <span className="text-sm text-slate-200 group-hover:text-white transition-colors flex items-center gap-2">
                <span>{row.flag}</span> {row.name}
              </span>
              <span className="text-sm font-semibold text-slate-100 text-right">
                {formatCurrency(row.salary)}
              </span>
              <span className="hidden sm:block text-sm text-slate-400 text-right">
                {formatCurrency(row.ppp)}
              </span>
              <span className="hidden sm:block text-sm text-slate-400 text-right">
                {row.bigMacs > 0 ? formatNumber(row.bigMacs) : "N/A"}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Big Mac Analysis */}
      <section>
        <h2 className="text-xl font-bold text-slate-100 mb-3">
          The Big Mac Test: Where Your Salary Goes Furthest
        </h2>
        <div className="text-slate-400 text-sm leading-relaxed space-y-3">
          <p>
            Using The Economist&apos;s Big Mac Index, we can compare how many
            Big Macs a {occupation.title}&apos;s annual salary could buy in
            each country. This provides an intuitive measure of purchasing
            power that goes beyond abstract PPP numbers.
          </p>
          {(() => {
            const sortedByBigMacs = [...rows]
              .filter((r) => r.bigMacs > 0)
              .sort((a, b) => b.bigMacs - a.bigMacs);
            const topBM = sortedByBigMacs[0];
            const bottomBM = sortedByBigMacs[sortedByBigMacs.length - 1];
            if (!topBM || !bottomBM) return null;
            return (
              <p>
                Interestingly, the country where a {occupation.title}&apos;s
                salary buys the most Big Macs is{" "}
                <strong className="text-slate-200">
                  {topBM.flag} {topBM.name}
                </strong>{" "}
                with approximately{" "}
                <strong className="text-slate-200">
                  {formatNumber(topBM.bigMacs)} Big Macs
                </strong>{" "}
                per year. The lowest is{" "}
                <strong className="text-slate-200">
                  {bottomBM.flag} {bottomBM.name}
                </strong>{" "}
                at {formatNumber(bottomBM.bigMacs)} Big Macs. This shows that
                the country with the highest nominal salary isn&apos;t
                necessarily the one where your money goes the furthest.
              </p>
            );
          })()}
        </div>
      </section>

      {/* Lowest Paying */}
      <section>
        <h2 className="text-xl font-bold text-slate-100 mb-3">
          Lowest Paying Countries for {occupation.title}s
        </h2>
        <div className="text-slate-400 text-sm leading-relaxed space-y-3">
          <p>
            At the other end of the spectrum, {occupation.title}s in
            developing economies earn significantly less in nominal terms.
            {bottom5.length >= 3 && (
              <>
                {" "}{bottom5[bottom5.length - 1].flag}{" "}
                {bottom5[bottom5.length - 1].name} has the lowest estimated
                salary at{" "}
                {formatCurrency(bottom5[bottom5.length - 1].salary)} USD,
                followed by {bottom5[bottom5.length - 2].flag}{" "}
                {bottom5[bottom5.length - 2].name} at{" "}
                {formatCurrency(bottom5[bottom5.length - 2].salary)} USD.
              </>
            )}
          </p>
          <p>
            However, it&apos;s important to remember that these lower nominal
            salaries often come with significantly lower living costs.
            purchasing power-adjusted figures provide a more balanced view of actual living
            standards. In many developing countries, a {occupation.title} is
            still a well-respected, middle-to-upper-class profession with a
            comfortable lifestyle.
          </p>
        </div>
      </section>

      {/* Key Takeaways */}
      <section>
        <h2 className="text-xl font-bold text-slate-100 mb-3">
          Key Takeaways
        </h2>
        <div className="text-slate-400 text-sm leading-relaxed">
          <ul className="space-y-2 list-disc list-inside">
            <li>
              <strong className="text-slate-200">{top10[0].name}</strong>{" "}
              pays the highest nominal salary for {occupation.title}s at{" "}
              {formatCurrency(top10[0].salary)} USD/year
            </li>
            <li>
              The global average is {formatCurrency(globalAvg)} USD, with a
              median of {formatCurrency(medianRow.salary)} USD
            </li>
            <li>
              There is a{" "}
              {rows[rows.length - 1].salary > 0
                ? `${Math.round(top10[0].salary / rows[rows.length - 1].salary)}x`
                : "large"}{" "}
              gap between the highest and lowest paying countries
            </li>
            <li>
              PPP adjustments reveal that the highest nominal salary
              doesn&apos;t always mean the best purchasing power
            </li>
            <li>
              The Big Mac Index provides an intuitive, everyday measure of
              salary purchasing power across borders
            </li>
          </ul>
        </div>
      </section>

      {/* Methodology */}
      <section>
        <h2 className="text-xl font-bold text-slate-100 mb-3">
          Methodology
        </h2>
        <div className="text-slate-400 text-sm leading-relaxed space-y-3">
          <p>
            These salary estimates are calculated using U.S. Bureau of Labor
            Statistics (BLS) occupational data as a baseline, adjusted per
            country using OECD average wage data and World Bank GDP per capita
            figures. purchasing power-adjusted values use World Bank purchasing power parity
            factors. Big Mac counts are based on The Economist&apos;s Big Mac
            Index data.
          </p>
          <p>
            These figures are estimates intended for comparison purposes. Actual
            salaries vary based on experience, education, specific employer,
            city, and current market conditions. For detailed country-specific
            data, click on any country above to see the full breakdown.
          </p>
        </div>
      </section>

      {/* Explore links */}
      <section>
        <h2 className="text-xl font-bold text-slate-100 mb-4">
          Explore {occupation.title} Salaries
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/salary/${occupationSlug}`}
            className="text-sm bg-dark-card hover:bg-slate-800/50 border border-dark-border hover:border-slate-600 text-slate-300 hover:text-emerald-400 transition-colors px-4 py-2 rounded-lg"
          >
            All countries
          </Link>
          <Link
            href={`/rankings/${occupationSlug}`}
            className="text-sm bg-dark-card hover:bg-slate-800/50 border border-dark-border hover:border-slate-600 text-slate-300 hover:text-emerald-400 transition-colors px-4 py-2 rounded-lg"
          >
            Full rankings
          </Link>
          {["united-states", "united-kingdom", "germany", "japan", "india"].map(
            (cs) => (
              <Link
                key={cs}
                href={`/salary/${occupationSlug}/${cs}`}
                className="text-sm bg-dark-card hover:bg-slate-800/50 border border-dark-border hover:border-slate-600 text-slate-300 hover:text-emerald-400 transition-colors px-4 py-2 rounded-lg"
              >
                {cs
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </Link>
            )
          )}
        </div>
      </section>
    </div>
  );
}
