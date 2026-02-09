import SalaryForm from "@/components/SalaryForm";
import { getOccupations, getCountries } from "@/lib/data-loader";

// JSON-LD 구조화 데이터
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Am I Paid Fairly?",
  url: "https://amipaidfairly.com",
  description:
    "Free global salary comparison platform covering 42 countries and 175+ occupations.",
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  url: "https://amipaidfairly.com",
  name: "Am I Paid Fairly?",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://amipaidfairly.com/browse?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Am I Paid Fairly?",
  url: "https://amipaidfairly.com",
  description:
    "Compare your salary with the same job in 42 countries. See your global percentile, world salary map, and Big Mac purchasing power.",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does Am I Paid Fairly work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Enter your job title, country, and annual salary. We instantly calculate your global percentile ranking by comparing your salary against estimated wages for the same occupation in 42 countries, using data from the U.S. Bureau of Labor Statistics (BLS) and OECD.",
      },
    },
    {
      "@type": "Question",
      name: "Where does the salary data come from?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We use publicly available data from the U.S. Bureau of Labor Statistics (BLS) for occupation-specific salaries, OECD average wage data for country adjustments, World Bank PPP factors for purchasing power comparison, and The Economist's Big Mac Index for cost-of-living context.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate are the salary estimates?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "All figures are estimates based on publicly available data. Actual salaries vary significantly by experience level, company size, specific location, industry sector, and other factors. Use the data as a general reference point, not as a guarantee of compensation.",
      },
    },
    {
      "@type": "Question",
      name: "What is PPP-adjusted salary?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PPP (Purchasing Power Parity) adjusted salary reflects what your salary can actually buy in a given country. A $50,000 salary in the U.S. buys a different standard of living than $50,000 worth of local currency in India or Switzerland. PPP adjustment accounts for these cost-of-living differences.",
      },
    },
    {
      "@type": "Question",
      name: "What does the Big Mac Index mean?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Big Mac Index, created by The Economist, is an informal way to compare purchasing power between countries. We show how many Big Macs your annual salary could buy, giving you an intuitive sense of your salary's real-world purchasing power in each country.",
      },
    },
    {
      "@type": "Question",
      name: "Is this service free? Do I need to create an account?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Am I Paid Fairly? is completely free to use. No login, no registration, and no paywall. We believe salary transparency should be accessible to everyone.",
      },
    },
  ],
};

export default function Home() {
  const occupations = getOccupations();
  const countries = getCountries();

  return (
    <main className="bg-gradient-to-br from-slate-950 to-slate-900 px-4">
      {/* JSON-LD 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero + Form */}
      <section className="min-h-[calc(100dvh-3.5rem)] flex flex-col items-center justify-center py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-slate-500 text-sm mb-2">
            Based on data from 42 countries
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 leading-tight">
            Are you paid fairly
            <br />
            compared to the world?
          </h1>
          <p className="text-slate-400 text-sm mt-3 max-w-xs mx-auto">
            Enter your job and salary to see how you compare globally
          </p>
        </div>

        {/* Form */}
        <div className="w-full max-w-md">
          <SalaryForm occupations={occupations} countries={countries} />
        </div>

        {/* Footer */}
        <p className="text-slate-600 text-xs mt-8 text-center">
          No login required · 100% free · Data from OECD &amp; BLS
        </p>

        {/* Disclaimer */}
        <p className="text-slate-700 text-[10px] mt-4 text-center max-w-sm">
          Estimated based on OECD &amp; BLS data. Actual salaries vary by
          experience, company, and region.
        </p>
      </section>

      {/* FAQ Section */}
      <section className="max-w-2xl mx-auto pb-16">
        <h2 className="text-xl font-bold text-slate-100 mb-6 text-center">
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
    </main>
  );
}
