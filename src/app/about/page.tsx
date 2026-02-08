import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | Am I Paid Fairly?",
  description:
    "Learn about Am I Paid Fairly? — a free global salary comparison tool that lets you see how your pay compares to the same job in 42 countries.",
  alternates: {
    canonical: "https://amipaidfairly.com/about",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-12">
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
            A free, open tool to compare your salary with the same job across
            42 countries worldwide.
          </p>
        </header>

        {/* Content */}
        <div className="flex flex-col gap-10">
          {/* What is Am I Paid Fairly? */}
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">
              What is Am I Paid Fairly?
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5">
              <p className="text-slate-300 text-sm leading-relaxed">
                Am I Paid Fairly? is a global salary comparison platform. Enter
                your job title, country, and annual salary, and we instantly show
                you where you stand compared to professionals doing the same work
                around the world. You can see your global percentile ranking,
                explore an interactive world salary map, and compare what your
                job pays in 42 countries &mdash; all without creating an
                account or paying a fee.
              </p>
            </div>
          </section>

          {/* How It Works */}
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-4">
              How It Works
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Step 1 */}
              <div className="bg-dark-card rounded-xl border border-dark-border p-5 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                  <span className="text-emerald-400 font-bold text-sm">1</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-200 mb-1.5">
                  Enter Your Info
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Select your occupation, choose your country, and enter your
                  annual salary.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-dark-card rounded-xl border border-dark-border p-5 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                  <span className="text-emerald-400 font-bold text-sm">2</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-200 mb-1.5">
                  See Your Global Ranking
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Find out your global percentile &mdash; are you in the top 10%
                  or bottom 50% worldwide?
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-dark-card rounded-xl border border-dark-border p-5 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                  <span className="text-emerald-400 font-bold text-sm">3</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-200 mb-1.5">
                  Compare with 42 Countries
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Explore a world map and detailed country list showing estimated
                  salaries, PPP values, and Big Mac purchasing power.
                </p>
              </div>
            </div>
          </section>

          {/* Our Data */}
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">
              Our Data
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5">
              <p className="text-slate-300 text-sm leading-relaxed mb-3">
                We estimate global salaries using a transparent, multi-step
                methodology:
              </p>
              <ol className="list-decimal list-inside text-slate-400 text-sm space-y-2 ml-2">
                <li>
                  <span className="text-slate-300 font-medium">
                    BLS Baseline
                  </span>{" "}
                  &mdash; Start with the U.S. Bureau of Labor Statistics median
                  salary for each of 830+ occupations.
                </li>
                <li>
                  <span className="text-slate-300 font-medium">
                    OECD Country Ratio
                  </span>{" "}
                  &mdash; Adjust the baseline using each OECD country&apos;s
                  average wage relative to the U.S. average wage, reflecting
                  national wage levels.
                </li>
                <li>
                  <span className="text-slate-300 font-medium">
                    Sector Multiplier
                  </span>{" "}
                  &mdash; Apply sector-specific adjustments to account for how
                  different industries pay differently across countries.
                </li>
                <li>
                  <span className="text-slate-300 font-medium">
                    PPP Adjustment
                  </span>{" "}
                  &mdash; Convert to purchasing power parity using World Bank
                  PPP factors so you can compare real buying power.
                </li>
                <li>
                  <span className="text-slate-300 font-medium">
                    Big Mac Index
                  </span>{" "}
                  &mdash; Show how many Big Macs your annual salary can buy,
                  providing an intuitive cost-of-living comparison.
                </li>
              </ol>
            </div>
          </section>

          {/* Data Sources */}
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">
              Data Sources
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5">
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
                      Occupational Employment and Wage Statistics for 830+
                      occupations
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
                      Average annual wages for 42 countries
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
                      Informal exchange rate and cost-of-living comparison
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <a
                      href="https://www.exchangerate-api.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-emerald-400 underline hover:text-emerald-300 transition-colors"
                    >
                      ExchangeRate API
                    </a>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Currency exchange rates for local salary conversion
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Accuracy Disclaimer */}
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">
              Accuracy Disclaimer
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5">
              <p className="text-slate-300 text-sm leading-relaxed">
                All salary figures displayed on this site are{" "}
                <span className="text-slate-100 font-semibold">estimates</span>{" "}
                based on publicly available data. Actual salaries vary
                significantly depending on experience level, company size,
                specific location within a country, industry sector, education,
                and many other factors. The data should be used as a general
                reference point, not as a guarantee of compensation for any
                specific role.
              </p>
            </div>
          </section>

          {/* Open & Free */}
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">
              Open &amp; Free
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5">
              <p className="text-slate-300 text-sm leading-relaxed">
                Am I Paid Fairly? is completely free to use. There is no login,
                no registration, and no paywall. We believe salary transparency
                should be accessible to everyone. All data sources we use are
                publicly available, and our methodology is openly described
                above.
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
