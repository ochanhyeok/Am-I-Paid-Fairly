import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Am I Paid Fairly?",
  description:
    "Terms of Service for Am I Paid Fairly? — the free global salary comparison platform.",
  alternates: {
    canonical: "https://amipaidfairly.com/terms",
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">Terms of Service</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 leading-tight">
            Terms of Service
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Last updated: February 7, 2026
          </p>
        </header>

        {/* Content */}
        <div className="flex flex-col gap-8 text-slate-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">
              1. Acceptance of Terms
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5 space-y-3">
              <p>
                By accessing and using Am I Paid Fairly? (&ldquo;the
                Service&rdquo;), you agree to be bound by these Terms of
                Service. If you do not agree to these terms, please do not use
                the Service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">
              2. Description of Service
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5 space-y-3">
              <p>
                Am I Paid Fairly? is a free global salary comparison tool that
                provides estimated salary data across occupations and countries.
                The Service allows users to compare their salary with estimated
                figures for the same occupation in other countries.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">
              3. Disclaimer of Accuracy
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5 space-y-3">
              <p>
                All salary figures displayed on this website are{" "}
                <strong className="text-slate-100">estimates</strong> derived
                from publicly available data sources, including the U.S. Bureau
                of Labor Statistics (BLS), OECD, World Bank, and The
                Economist&apos;s Big Mac Index.
              </p>
              <p>
                These estimates do not constitute financial advice, employment
                guarantees, or precise salary predictions. Actual salaries vary
                significantly based on experience, education, company, specific
                location, industry, and other factors. Users should not make
                employment or relocation decisions based solely on data presented
                by this Service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">
              4. Use of the Service
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5 space-y-3">
              <p>You agree to use the Service only for lawful purposes. You may not:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-slate-400">
                <li>
                  Use automated tools to scrape, crawl, or extract data from the
                  Service without prior written consent
                </li>
                <li>
                  Attempt to interfere with or disrupt the Service or its
                  infrastructure
                </li>
                <li>
                  Reproduce, redistribute, or commercially exploit the
                  Service&apos;s content without attribution
                </li>
                <li>
                  Misrepresent the data as precise salary figures rather than
                  estimates
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">
              5. Intellectual Property
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5 space-y-3">
              <p>
                The design, layout, and original content of Am I Paid Fairly?
                are the property of the Service operator. Underlying salary data
                is derived from publicly available government and institutional
                sources and is not claimed as proprietary.
              </p>
              <p>
                You may cite or reference data from this Service with proper
                attribution to &ldquo;Am I Paid Fairly?
                (amipaidfairly.com)&rdquo;.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">
              6. Third-Party Services
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5 space-y-3">
              <p>
                The Service may include third-party advertisements (Google
                AdSense) and analytics (Google Analytics). These services have
                their own terms and privacy policies. By using our Service, you
                also agree to the terms of these third-party providers.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">
              7. Limitation of Liability
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5 space-y-3">
              <p>
                The Service is provided &ldquo;as is&rdquo; without warranties
                of any kind, either express or implied. We do not guarantee the
                accuracy, completeness, or timeliness of any data. In no event
                shall the Service operator be liable for any direct, indirect,
                incidental, or consequential damages arising from your use of
                the Service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">
              8. Changes to Terms
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5 space-y-3">
              <p>
                We reserve the right to update these Terms of Service at any
                time. Changes will be posted on this page with an updated
                revision date. Continued use of the Service after changes
                constitutes acceptance of the revised terms.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">
              9. Contact
            </h2>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5 space-y-3">
              <p>
                If you have questions about these Terms, please contact us via
                our{" "}
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
        </div>
      </div>
    </main>
  );
}
