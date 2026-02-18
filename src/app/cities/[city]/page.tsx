import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getCities,
  getCity,
  getCountry,
  getCountries,
  getCitySalaryEntriesByCity,
  getOccupation,
  getCitiesByCountry,
} from "@/lib/data-loader";
import { formatCurrency, formatNumber, formatUSDShort } from "@/lib/format";

// --- Static Params ---

export function generateStaticParams() {
  const cities = getCities();
  return cities.map((city) => ({ city: city.slug }));
}

// --- Metadata ---

interface PageProps {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCity(citySlug);

  if (!city) {
    return { title: "Not Found | Am I Paid Fairly?" };
  }

  const country = getCountry(city.countryCode);

  const title = `Salaries in ${city.name} (2026) | AIPF`;
  const description = `Browse estimated salaries for 175+ occupations in ${city.name}, ${country?.name || ""}. See city-adjusted salaries, cost of living data, and compare with other global cities.`;

  const ogParams = new URLSearchParams();
  ogParams.set("title", `All Salaries in ${city.name}`);
  ogParams.set("subtitle", `${country?.name || ""} — 175+ occupations (2026)`);
  const ogImage = `/api/og?${ogParams.toString()}`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: [ogImage] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
    alternates: {
      canonical: `https://amipaidfairly.com/cities/${citySlug}`,
    },
  };
}

// --- Page ---

export default async function CityAllSalariesPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const city = getCity(citySlug);

  if (!city) {
    redirect("/cities");
  }

  const country = getCountry(city.countryCode);
  const countries = getCountries();
  const countryObj = countries.find((c) => c.code === city.countryCode);

  if (!country || !countryObj) {
    redirect("/cities");
  }

  const entries = getCitySalaryEntriesByCity(citySlug);

  // 직업별 데이터
  const occupationSalaries = entries
    .map((entry) => {
      const occ = getOccupation(entry.occupationSlug);
      if (!occ) return null;
      return { occupation: occ, ...entry };
    })
    .filter(Boolean)
    .sort((a, b) => b!.estimatedSalary - a!.estimatedSalary) as {
    occupation: NonNullable<ReturnType<typeof getOccupation>>;
    occupationSlug: string;
    estimatedSalary: number;
    colAdjusted: number;
  }[];

  // 카테고리별 그룹핑
  const categories = Array.from(new Set(occupationSalaries.map((o) => o.occupation.category))).sort();

  // 같은 나라 다른 도시
  const sameCountryCities = getCitiesByCountry(city.countryCode).filter(
    (c) => c.slug !== citySlug
  );

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://amipaidfairly.com" },
      { "@type": "ListItem", position: 2, name: "Cities", item: "https://amipaidfairly.com/cities" },
      { "@type": "ListItem", position: 3, name: city.name, item: `https://amipaidfairly.com/cities/${citySlug}` },
    ],
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-slate-500 text-sm">
          <Link href="/cities" className="hover:text-slate-300 transition-colors">
            Cities
          </Link>
          <span>/</span>
          <span className="text-slate-300">{city.name}</span>
        </nav>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 leading-tight">
            All Salaries in {city.name} (2026)
          </h1>
          <p className="text-slate-500 text-sm mt-3 flex items-center justify-center gap-2">
            <span className="text-xl">{country.flag}</span>
            {city.name}, {country.name}
            {city.isTechHub && (
              <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                Tech Hub
              </span>
            )}
            {city.isCapital && (
              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                Capital
              </span>
            )}
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-600">
            <span>Population: {formatNumber(city.population)}</span>
            <span>&middot;</span>
            <span>COL Multiplier: {city.colMultiplier}x</span>
            <span>&middot;</span>
            <span>{occupationSalaries.length} occupations</span>
          </div>
        </div>

        {/* City stats summary */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Salary Range in {city.name}
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <p className="text-slate-500 text-xs mb-1">Highest</p>
              <p className="text-lg font-bold text-emerald-400">
                {occupationSalaries.length > 0
                  ? formatUSDShort(occupationSalaries[0].estimatedSalary)
                  : "N/A"}
              </p>
              <p className="text-slate-600 text-xs mt-1">
                {occupationSalaries.length > 0
                  ? occupationSalaries[0].occupation.title
                  : ""}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <p className="text-slate-500 text-xs mb-1">Median</p>
              <p className="text-lg font-bold text-slate-50">
                {occupationSalaries.length > 0
                  ? formatUSDShort(
                      occupationSalaries[Math.floor(occupationSalaries.length / 2)]
                        .estimatedSalary
                    )
                  : "N/A"}
              </p>
              <p className="text-slate-600 text-xs mt-1">across all jobs</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <p className="text-slate-500 text-xs mb-1">Lowest</p>
              <p className="text-lg font-bold text-red-400">
                {occupationSalaries.length > 0
                  ? formatUSDShort(
                      occupationSalaries[occupationSalaries.length - 1].estimatedSalary
                    )
                  : "N/A"}
              </p>
              <p className="text-slate-600 text-xs mt-1">
                {occupationSalaries.length > 0
                  ? occupationSalaries[occupationSalaries.length - 1].occupation.title
                  : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Full salary table */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            All Salaries ({occupationSalaries.length} occupations)
          </h2>

          {categories.map((category) => {
            const catOccs = occupationSalaries.filter(
              (o) => o.occupation.category === category
            );
            return (
              <div key={category} className="mb-6 last:mb-0">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2">
                  {category}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-600 text-xs border-b border-dark-border">
                        <th className="text-left py-1.5">Occupation</th>
                        <th className="text-right py-1.5">Salary (USD)</th>
                        <th className="text-right py-1.5">COL Adj.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catOccs.map((entry) => (
                        <tr
                          key={entry.occupationSlug}
                          className="border-b border-slate-800/30"
                        >
                          <td className="py-2">
                            <Link
                              href={`/salary/${entry.occupationSlug}/${countryObj.slug}/${citySlug}`}
                              className="text-accent-blue hover:text-blue-400 transition-colors"
                            >
                              {entry.occupation.title}
                            </Link>
                          </td>
                          <td className="py-2 text-right text-slate-300">
                            {formatUSDShort(entry.estimatedSalary)}
                          </td>
                          <td className="py-2 text-right text-slate-500">
                            {formatUSDShort(entry.colAdjusted)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* Same Country Cities */}
        {sameCountryCities.length > 0 && (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Other Cities in {country.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              {sameCountryCities.map((otherCity) => (
                <Link
                  key={otherCity.slug}
                  href={`/cities/${otherCity.slug}`}
                  className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
                >
                  {otherCity.name}
                  {otherCity.isTechHub && (
                    <span className="ml-1 text-[9px] bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded">
                      Tech
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
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

        {/* Disclaimer */}
        <div className="text-center pb-6">
          <p className="text-slate-600 text-[10px]">
            Estimated based on OECD &amp; BLS data, adjusted for city-level cost of
            living. Actual salaries vary by experience, company, and neighborhood.
          </p>
        </div>
      </div>
    </main>
  );
}
