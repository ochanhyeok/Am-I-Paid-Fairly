"use client";

import { useRouter } from "next/navigation";

interface Props {
  occupationSlug: string;
  currentCountrySlug: string;
  countries: { slug: string; name: string; flag: string }[];
}

export default function CountryQuickNav({ occupationSlug, currentCountrySlug, countries }: Props) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-slate-500 text-xs">Compare with</span>
      <select
        className="bg-dark-card border border-dark-border text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-accent-blue"
        value={currentCountrySlug}
        onChange={(e) => router.push(`/salary/${occupationSlug}/${e.target.value}`)}
      >
        {countries.map((c) => (
          <option key={c.slug} value={c.slug}>{c.flag} {c.name}</option>
        ))}
      </select>
    </div>
  );
}
