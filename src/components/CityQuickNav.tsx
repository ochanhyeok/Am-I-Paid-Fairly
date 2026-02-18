"use client";

import { useRouter } from "next/navigation";

interface Props {
  occupationSlug: string;
  countrySlug: string;
  currentCitySlug: string;
  cities: { slug: string; name: string }[];
}

export default function CityQuickNav({ occupationSlug, countrySlug, currentCitySlug, cities }: Props) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-slate-500 text-xs">What if you lived in</span>
      <select
        className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:ring-emerald-500 focus:border-emerald-500"
        value={currentCitySlug}
        onChange={(e) => router.push(`/salary/${occupationSlug}/${countrySlug}/${e.target.value}`)}
      >
        {cities.map((c) => (
          <option key={c.slug} value={c.slug}>{c.name}</option>
        ))}
      </select>
      <span className="text-slate-500 text-xs">instead?</span>
    </div>
  );
}
