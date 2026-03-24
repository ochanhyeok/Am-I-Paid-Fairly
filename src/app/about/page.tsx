import type { Metadata } from "next";
import Link from "next/link";
import ContactModal from "@/components/ContactModal";

export const metadata: Metadata = {
  title: "About Us | Am I Paid Fairly?",
  description:
    "Meet the team behind Am I Paid Fairly — a free global salary comparison platform covering 42 countries and 175+ occupations. Learn our story, methodology, and mission.",
  alternates: {
    canonical: "https://amipaidfairly.com/about",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-12">
      {/* JSON-LD: AboutPage + Person */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "About Am I Paid Fairly?",
            description: "Free global salary comparison platform covering 42 countries and 175+ occupations.",
            mainEntity: {
              "@type": "Organization",
              name: "Am I Paid Fairly?",
              url: "https://amipaidfairly.com",
              logo: "https://amipaidfairly.com/icon-512.png",
              founder: {
                "@type": "Person",
                name: "Chanhyeog Oh",
                jobTitle: "Founder & Data Engineer",
                url: "https://amipaidfairly.com/about",
              },
              foundingDate: "2025",
              description: "A free, transparent salary comparison tool powered by OECD, BLS, and Big Mac Index data.",
            },
          }),
        }}
      />

      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">About</span>
        </nav>

        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 leading-tight">
            About Am I Paid Fairly?
          </h1>
          <p className="text-slate-400 text-sm mt-3 max-w-lg mx-auto">
            A free, transparent tool to compare your salary across 42 countries
            &mdash; built by a data engineer who wanted to answer one simple question.
          </p>
        </header>

        <div className="flex flex-col gap-10">
          {/* Founder Story */}
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-4">
              Why I Built This
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-6">
              {/* Founder profile card */}
              <div className="flex items-start gap-4 mb-5 pb-5 border-b border-dark-border">
                {/* Placeholder profile image — 교체 필요: public/images/founder.jpg */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
                  CO
                </div>
                <div>
                  <p className="text-slate-100 font-bold text-lg">Chanhyeog Oh</p>
                  <p className="text-slate-400 text-sm">Founder &amp; Data Engineer</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Building data-driven tools for salary transparency since 2025
                  </p>
                </div>
              </div>

              <div className="text-slate-300 text-sm leading-relaxed space-y-4">
                <p>
                  In 2025, I was exploring career opportunities across different countries and
                  hit a frustrating wall: there was no single tool that could tell me what the
                  same job pays in different countries, adjusted for purchasing power. Glassdoor
                  focuses on individual companies. PayScale requires sign-up. Numbeo covers
                  cost of living but not occupation-specific salaries.
                </p>
                <p>
                  So I built <strong className="text-slate-100">Am I Paid Fairly?</strong> &mdash;
                  a free tool that combines data from the U.S. Bureau of Labor Statistics (BLS),
                  OECD average wages, World Bank GDP figures, and The Economist&apos;s Big Mac
                  Index to estimate what any job pays across 42 countries and 98 cities. No
                  login, no paywall, no hidden data.
                </p>
                <p>
                  The goal was simple: <em>help people make more informed career and relocation
                  decisions by making salary data transparent and globally comparable.</em> Whether
                  you&apos;re a software engineer in Seoul weighing a move to Berlin, or a nurse in
                  Manila considering opportunities in Australia, this tool gives you a data-backed
                  starting point.
                </p>
                <p>
                  As a data engineer, I care deeply about methodology. Every salary estimate on this
                  site is calculated using a transparent, documented formula &mdash; not scraped from
                  job postings or user-submitted data. You can read exactly how we compute each figure
                  in the methodology section below.
                </p>
              </div>
            </div>
          </section>

          {/* Mission */}
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-4">
              Our Mission
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-6">
              <div className="text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  <strong className="text-slate-100">Salary transparency should be free and global.</strong>{" "}
                  Most salary tools focus on a single country (usually the United States) or require
                  you to share your own salary data before showing you anything. We believe
                  that knowing how your pay compares internationally is a basic right, not a
                  premium feature.
                </p>
                <p>
                  Am I Paid Fairly? is built on three principles:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">1.</span>
                    <span><strong className="text-slate-200">Transparent methodology</strong> &mdash; Every
                    number can be traced back to its source (BLS, OECD, World Bank, Big Mac Index).
                    No black boxes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">2.</span>
                    <span><strong className="text-slate-200">Free and open access</strong> &mdash; No
                    login walls, no &quot;give us your salary to see data&quot; tricks, no premium tiers.
                    Everything is available to everyone.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">3.</span>
                    <span><strong className="text-slate-200">Global perspective</strong> &mdash; Covering
                    42 countries (38 OECD members + India, China, Singapore, and Brazil) with
                    purchasing power adjustments that go beyond simple currency conversion.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* What We Cover */}
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-4">
              What We Cover
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-dark-card rounded-xl border border-dark-border p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">42</p>
                <p className="text-slate-500 text-xs mt-1">Countries</p>
              </div>
              <div className="bg-dark-card rounded-xl border border-dark-border p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">175</p>
                <p className="text-slate-500 text-xs mt-1">Occupations</p>
              </div>
              <div className="bg-dark-card rounded-xl border border-dark-border p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">98</p>
                <p className="text-slate-500 text-xs mt-1">Cities</p>
              </div>
              <div className="bg-dark-card rounded-xl border border-dark-border p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">40K+</p>
                <p className="text-slate-500 text-xs mt-1">Data Pages</p>
              </div>
            </div>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5 mt-3">
              <p className="text-slate-300 text-sm leading-relaxed">
                Every occupation page shows salary estimates in nominal USD, purchasing power
                parity (PPP), and the Big Mac Index &mdash; giving you three different ways to
                understand what a salary actually means in each country. We also offer country
                comparisons, city-level data, relocation calculators, and global rankings for
                every tracked occupation.
              </p>
            </div>
          </section>

          {/* Methodology */}
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-4">
              Our Methodology
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-6">
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                We estimate global salaries using a transparent, reproducible formula
                based on publicly available data from trusted institutions:
              </p>
              <ol className="list-decimal list-inside text-slate-400 text-sm space-y-3 ml-2">
                <li>
                  <span className="text-slate-300 font-medium">BLS Baseline</span>{" "}
                  &mdash; Start with the U.S. Bureau of Labor Statistics Occupational
                  Employment and Wage Statistics (OEWS) median salary for each occupation.
                  This provides a well-documented, annually updated baseline for 830+
                  occupations in the U.S. labor market.
                </li>
                <li>
                  <span className="text-slate-300 font-medium">OECD Country Ratio</span>{" "}
                  &mdash; Adjust the U.S. baseline using each country&apos;s average wage
                  relative to the U.S. average wage, as reported by OECD. This captures
                  the overall wage level of each economy.
                </li>
                <li>
                  <span className="text-slate-300 font-medium">Sector Multiplier</span>{" "}
                  &mdash; Apply an occupation-specific sector multiplier that accounts for
                  how different industries (tech, healthcare, finance, etc.) pay differently
                  relative to the national average. These multipliers are derived from
                  cross-country industry wage data.
                </li>
                <li>
                  <span className="text-slate-300 font-medium">PPP Adjustment</span>{" "}
                  &mdash; Convert to purchasing power parity using the Big Mac Index from
                  The Economist, which provides an intuitive real-world benchmark for what
                  your salary can actually buy in each country.
                </li>
                <li>
                  <span className="text-slate-300 font-medium">City-Level Refinement</span>{" "}
                  &mdash; For 98 cities, we further adjust using cost-of-living multipliers
                  derived from Numbeo data and apply a tech hub bonus (1.08x) for technology
                  occupations in major tech centers.
                </li>
              </ol>
              <p className="text-slate-500 text-xs mt-4 leading-relaxed">
                <strong className="text-slate-400">Formula:</strong>{" "}
                Country salary = BLS base salary &times; OECD country ratio &times; sector multiplier.{" "}
                City salary = Country salary &times; COL multiplier &times; tech hub bonus.{" "}
                PPP salary = Nominal salary &times; (US Big Mac price / Local Big Mac price).
              </p>
            </div>
          </section>

          {/* Data Sources */}
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-4">
              Data Sources
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5">
              <p className="text-slate-400 text-sm mb-4">
                All data used on this site comes from publicly available, trusted institutions.
                We do not scrape job postings or rely on user-submitted salary data.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <a
                      href="https://www.bls.gov/oes/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-emerald-400 underline hover:text-emerald-300 transition-colors"
                    >
                      U.S. Bureau of Labor Statistics (BLS)
                    </a>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Occupational Employment and Wage Statistics for 830+ occupations
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <a
                      href="https://stats.oecd.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-emerald-400 underline hover:text-emerald-300 transition-colors"
                    >
                      OECD Average Wages
                    </a>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Average annual wages for 42 OECD and partner countries
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <a
                      href="https://data.worldbank.org/indicator/NY.GDP.PCAP.CD"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-emerald-400 underline hover:text-emerald-300 transition-colors"
                    >
                      World Bank
                    </a>
                    <p className="text-slate-400 text-xs mt-0.5">
                      GDP per capita and purchasing power parity (PPP) data
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <a
                      href="https://github.com/TheEconomist/big-mac-data"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-emerald-400 underline hover:text-emerald-300 transition-colors"
                    >
                      The Economist Big Mac Index
                    </a>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Informal exchange rate and cost-of-living comparison used since 1986
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <a
                      href="https://www.numbeo.com/cost-of-living/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-emerald-400 underline hover:text-emerald-300 transition-colors"
                    >
                      Numbeo Cost of Living
                    </a>
                    <p className="text-slate-400 text-xs mt-0.5">
                      City-level cost of living indices used to derive our COL multipliers
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Limitations & Honesty */}
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-4">
              Limitations &amp; What We Don&apos;t Cover
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-6">
              <div className="text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  We believe in being upfront about what this tool can and cannot do:
                </p>
                <ul className="space-y-2 ml-4 text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500 mt-0.5">&bull;</span>
                    <span><strong className="text-slate-300">Estimates, not exact figures.</strong>{" "}
                    Our numbers are statistical estimates based on national averages. Your actual
                    salary depends on experience, company, specific city, education, and negotiation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500 mt-0.5">&bull;</span>
                    <span><strong className="text-slate-300">No experience-level breakdown.</strong>{" "}
                    We currently show median/average figures. Entry-level positions typically earn
                    30-50% less, while senior roles may earn 50-100% more.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500 mt-0.5">&bull;</span>
                    <span><strong className="text-slate-300">No tax calculations.</strong>{" "}
                    All figures are gross (before tax). Take-home pay varies significantly by country
                    due to different tax structures and social contributions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500 mt-0.5">&bull;</span>
                    <span><strong className="text-slate-300">Not real-time data.</strong>{" "}
                    Our data is updated periodically based on the latest available releases from
                    BLS, OECD, and other sources. Salary markets can shift faster than official
                    statistics.</span>
                  </li>
                </ul>
                <p>
                  We recommend using Am I Paid Fairly? as a <em>starting point</em> for your
                  research, combined with local job market data, employer reviews, and professional
                  salary surveys for the most complete picture.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-4">
              Get in Touch
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-6">
              <p className="text-slate-300 text-sm leading-relaxed mb-3">
                Have questions about our methodology? Found a data error? Want to suggest
                a feature? I read every message and respond as quickly as I can.
              </p>
              <ContactModal />
              <p className="text-slate-500 text-xs mt-3">
                You can also reach me through the{" "}
                <Link
                  href="/contact"
                  className="text-emerald-400 hover:text-emerald-300 underline transition-colors"
                >
                  Contact page
                </Link>
                .
              </p>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center py-4">
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
        </div>

        {/* Footer */}
        <footer className="border-t border-dark-border mt-6 pt-6 pb-8">
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
