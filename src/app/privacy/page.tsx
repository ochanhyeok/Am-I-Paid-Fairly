import type { Metadata } from "next";
import Link from "next/link";
import ContactModal from "@/components/ContactModal";

export const metadata: Metadata = {
  title: "Privacy Policy | Am I Paid Fairly?",
  description:
    "Privacy Policy for Am I Paid Fairly? — Learn how we handle your data, cookies, and third-party services.",
  alternates: {
    canonical: "https://amipaidfairly.com/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">Privacy Policy</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-slate-500 text-sm mt-3">
            Last updated: January 2025
          </p>
        </header>

        {/* Content */}
        <div className="flex flex-col gap-8">
          {/* Introduction */}
          <section>
            <p className="text-slate-300 text-sm leading-relaxed">
              Welcome to Am I Paid Fairly? (&quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;). We are committed to protecting your privacy. This
              Privacy Policy explains how we collect, use, and safeguard
              information when you visit our website at amipaidfairly.com (the
              &quot;Service&quot;).
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">
              Information We Collect
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5">
              <p className="text-slate-300 text-sm leading-relaxed">
                We do not collect personal information. Our Service does not
                require registration, login, or any form of account creation.
                The salary information you enter (job title, country, and salary
                amount) is processed entirely in your browser and on our servers
                at request time. We do not store, log, or retain the salary
                data you input.
              </p>
            </div>
          </section>

          {/* Cookies & Analytics */}
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">
              Cookies &amp; Analytics
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5">
              <p className="text-slate-300 text-sm leading-relaxed mb-3">
                We use Google Analytics 4 (GA4) to understand how visitors use
                our Service. GA4 may use cookies and similar technologies to
                collect non-personally identifiable information, including:
              </p>
              <ul className="list-disc list-inside text-slate-400 text-sm space-y-1.5 ml-2">
                <li>Pages visited and time spent on each page</li>
                <li>Referring website or source</li>
                <li>Browser type and device information</li>
                <li>Approximate geographic location (country/city level)</li>
                <li>General usage patterns and interactions</li>
              </ul>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                This data is aggregated and anonymized. It does not identify
                individual users. You can opt out of Google Analytics by
                installing the{" "}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 underline hover:text-emerald-300 transition-colors"
                >
                  Google Analytics Opt-out Browser Add-on
                </a>
                .
              </p>
            </div>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">
              Third-Party Services
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 mb-1">
                  Google Analytics
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We use Google Analytics 4 to analyze traffic and usage
                  patterns. Google may collect and process data according to
                  their own privacy policy. For more information, see{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 underline hover:text-emerald-300 transition-colors"
                  >
                    Google&apos;s Privacy Policy
                  </a>
                  .
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200 mb-1">
                  Google AdSense
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We may display advertisements through Google AdSense. Google
                  AdSense may use cookies to serve ads based on your prior visits
                  to this or other websites. Google&apos;s use of advertising
                  cookies enables it and its partners to serve ads based on your
                  visit to our site and/or other sites on the internet. You may
                  opt out of personalized advertising by visiting{" "}
                  <a
                    href="https://www.google.com/settings/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 underline hover:text-emerald-300 transition-colors"
                  >
                    Google Ads Settings
                  </a>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* Data Sources */}
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">
              Data Sources
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5">
              <p className="text-slate-300 text-sm leading-relaxed mb-3">
                All salary data displayed on this Service is derived from
                publicly available sources. No private or personal salary
                information from any individual is used. Our data sources
                include:
              </p>
              <ul className="list-disc list-inside text-slate-400 text-sm space-y-1.5 ml-2">
                <li>
                  <a
                    href="https://www.bls.gov/oes/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 underline hover:text-emerald-300 transition-colors"
                  >
                    U.S. Bureau of Labor Statistics (BLS)
                  </a>{" "}
                  &mdash; Occupational employment and wage statistics
                </li>
                <li>
                  <a
                    href="https://stats.oecd.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 underline hover:text-emerald-300 transition-colors"
                  >
                    OECD
                  </a>{" "}
                  &mdash; Average annual wages across member countries
                </li>
                <li>
                  <a
                    href="https://data.worldbank.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 underline hover:text-emerald-300 transition-colors"
                  >
                    World Bank
                  </a>{" "}
                  &mdash; GDP per capita and purchasing power parity data
                </li>
                <li>
                  <a
                    href="https://github.com/TheEconomist/big-mac-data"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 underline hover:text-emerald-300 transition-colors"
                  >
                    The Economist Big Mac Index
                  </a>{" "}
                  &mdash; Purchasing power comparison
                </li>
              </ul>
            </div>
          </section>

          {/* No User Accounts */}
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">
              No User Accounts
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5">
              <p className="text-slate-300 text-sm leading-relaxed">
                Our Service does not offer user registration, login, or account
                creation of any kind. We do not collect or store personal data
                such as names, email addresses, passwords, or payment
                information. All features are available without creating an
                account.
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">
              Children&apos;s Privacy
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5">
              <p className="text-slate-300 text-sm leading-relaxed">
                Our Service is not directed at children under the age of 13. We
                do not knowingly collect personal information from children under
                13. If you are a parent or guardian and believe your child has
                provided us with personal information, please contact us so we
                can take appropriate action.
              </p>
            </div>
          </section>

          {/* Changes to This Policy */}
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">
              Changes to This Policy
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5">
              <p className="text-slate-300 text-sm leading-relaxed">
                We may update this Privacy Policy from time to time. Any changes
                will be posted on this page with an updated &quot;Last
                updated&quot; date. We encourage you to review this page
                periodically to stay informed about how we protect your
                information.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">
              Contact Information
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5">
              <p className="text-slate-300 text-sm leading-relaxed">
                If you have any questions or concerns about this Privacy Policy,
                please contact us at:
              </p>
              <ContactModal />
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="border-t border-dark-border mt-10 pt-6 pb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-xs">
              &copy; {new Date().getFullYear()} Am I Paid Fairly? All rights
              reserved.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-full text-sm transition-colors"
            >
              Compare your salary
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
        </footer>
      </div>
    </main>
  );
}
