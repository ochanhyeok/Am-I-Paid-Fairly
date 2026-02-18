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
        className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:ring-emerald-500 focus:border-emerald-500"
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
