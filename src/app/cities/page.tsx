import { Metadata } from "next";
import Link from "next/link";
import { getCities, getCountry } from "@/lib/data-loader";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Salary by City — 86 Global Cities | Am I Paid Fairly?",
  description:
    "Browse salaries across 86 major cities in 42 countries. Compare cost of living, purchasing power, and estimated salaries for 175+ occupations worldwide.",
  openGraph: {
    title: "Salary by City — 86 Global Cities | Am I Paid Fairly?",
    description: "Browse salaries across 86 major cities in 42 countries.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Salary by City — 86 Global Cities",
    description: "Browse salaries across 86 major cities in 42 countries.",
  },
  alternates: {
    canonical: "https://amipaidfairly.com/cities",
  },
};

// 지역 그룹핑
const REGIONS: Record<string, string[]> = {
  "North America": ["US", "CA", "MX", "CR"],
  "South America": ["BR", "CL", "CO"],
  "Western Europe": ["GB", "DE", "FR", "CH", "NL", "BE", "IE", "AT", "LU"],
  "Southern Europe": ["ES", "IT", "PT", "GR"],
  "Northern Europe": ["SE", "NO", "DK", "FI", "IS", "EE", "LV", "LT"],
  "Eastern Europe": ["PL", "CZ", "HU", "SK", "SI"],
  "Middle East": ["IL", "TR"],
  "Asia Pacific": ["JP", "KR", "CN", "IN", "SG", "AU", "NZ"],
};

export default function CitiesBrowsePage() {
  const cities = getCities();

  // 지역별로 그룹핑
  const cityByRegion: Record<string, typeof cities> = {};
  for (const [region, codes] of Object.entries(REGIONS)) {
    const regionCities = cities.filter((c) => codes.includes(c.countryCode));
    if (regionCities.length > 0) {
      cityByRegion[region] = regionCities;
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 leading-tight">
            Salaries by City
          </h1>
          <p className="text-slate-500 text-sm mt-3">
            Browse 86 major cities across 42 countries &middot; 175+ occupations
          </p>
        </div>

        {/* Regions */}
        <div className="flex flex-col gap-10">
          {Object.entries(cityByRegion).map(([region, regionCities]) => (
            <section key={region}>
              <h2 className="text-lg font-bold text-slate-200 mb-4 border-b border-dark-border pb-2">
                {region}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {regionCities
                  .sort((a, b) => b.population - a.population)
                  .map((city) => {
                    const country = getCountry(city.countryCode);
                    return (
                      <Link
                        key={city.slug}
                        href={`/cities/${city.slug}`}
                        className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-slate-600 transition-colors group"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{country?.flag}</span>
                          <h3 className="text-slate-100 font-semibold text-sm group-hover:text-emerald-400 transition-colors">
                            {city.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-slate-500 text-xs">
                            {country?.name}
                          </span>
                          <span className="text-slate-700 text-xs">
                            &middot; Pop. {formatNumber(city.population)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          {city.isTechHub && (
                            <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-medium">
                              Tech Hub
                            </span>
                          )}
                          {city.isCapital && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-medium">
                              Capital
                            </span>
                          )}
                          <span className="text-[9px] bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded">
                            COL {city.colMultiplier}x
                          </span>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-block bg-accent-blue hover:bg-blue-600 transition-colors text-white font-semibold px-8 py-3 rounded-xl text-sm"
          >
            Compare your own salary
          </Link>
          <p className="text-slate-600 text-xs mt-2">
            Free &middot; No login required
          </p>
        </div>
      </div>
    </main>
  );
}
