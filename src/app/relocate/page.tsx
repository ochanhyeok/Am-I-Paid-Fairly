import type { Metadata } from "next";
import { getOccupations, getCountries, getCities } from "@/lib/data-loader";
import { calculateRelocation } from "@/lib/salary-calculator";
import RelocationClient from "./RelocationClient";

export const metadata: Metadata = {
  title: "Relocation Salary Calculator (2026) | Am I Paid Fairly?",
  description:
    "Should you relocate? Compare your salary, cost of living, and purchasing power between 98 global cities. See if moving abroad is worth it financially.",
  alternates: {
    canonical: "https://amipaidfairly.com/relocate",
  },
  openGraph: {
    title: "Relocation Salary Calculator (2026) | Am I Paid Fairly?",
    description:
      "Should you relocate? Compare your salary, cost of living, and purchasing power between 98 global cities.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Relocation Salary Calculator (2026) | Am I Paid Fairly?",
    description:
      "Should you relocate? Compare your salary, cost of living, and purchasing power between 98 global cities.",
  },
};

interface PageProps {
  searchParams: Promise<{ job?: string; from?: string; to?: string }>;
}

export default async function RelocatePage({ searchParams }: PageProps) {
  const occupations = getOccupations();
  const countries = getCountries();
  const cities = getCities();

  const params = await searchParams;

  // 서버에서 결과 계산 (URL에 파라미터가 있는 경우)
  let result = null;
  if (params.job && params.from && params.to) {
    result = calculateRelocation(params.job, params.from, params.to);
  }

  // JSON-LD: WebApplication + FAQPage
  const faqItems = [
    {
      question: "How does the Relocation Salary Calculator work?",
      answer:
        "We compare estimated salaries for your job title in both cities, then adjust for cost of living using OECD data, the Big Mac Index, and city-level COL multipliers. The result shows whether you'd gain or lose purchasing power by moving.",
    },
    {
      question: "Is the salary data accurate?",
      answer:
        "Our estimates are based on BLS OEWS data (USA baseline), OECD average wages, and World Bank GDP per capita, adjusted for city-level cost of living. These are statistical estimates — actual salaries vary by experience, company, and industry.",
    },
    {
      question: "What does 'COL-Adjusted' mean?",
      answer:
        "COL-Adjusted (Cost of Living Adjusted) represents your real purchasing power — how much your salary is actually worth after accounting for the local cost of living. A higher nominal salary in an expensive city may actually buy less than a lower salary in an affordable one.",
    },
    {
      question: "How is the Big Mac Index used?",
      answer:
        "The Big Mac Index, published by The Economist, measures purchasing power parity between countries using the price of a Big Mac. We calculate how many Big Macs your annual salary could buy in each city as an intuitive measure of purchasing power.",
    },
    {
      question: "Does this account for taxes?",
      answer:
        "No, all salary figures are gross (before tax). Tax rates vary significantly by country, state/province, and personal circumstances. We recommend consulting a tax advisor for relocation decisions.",
    },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Relocation Salary Calculator",
      description:
        "Compare salary, cost of living, and purchasing power between global cities to decide if relocating is worth it financially.",
      url: "https://amipaidfairly.com/relocate",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-8">
      {/* JSON-LD */}
      {jsonLd.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}

      <div className="max-w-2xl mx-auto">
        <RelocationClient
          occupations={occupations}
          countries={countries}
          cities={cities}
          initialResult={result}
        />

        {/* FAQ Section (always visible for SEO) */}
        <div className="mt-8 bg-dark-card border border-dark-border rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Frequently Asked Questions
          </h2>
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
      </div>
    </main>
  );
}
