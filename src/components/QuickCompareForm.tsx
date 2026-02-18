"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface CountryOption {
  code: string;
  name: string;
  slug: string;
  flag: string;
}

interface QuickCompareFormProps {
  occupationSlug: string;
  occupationTitle: string;
  countrySlug?: string;
  countryName?: string;
  countries: CountryOption[];
}

export default function QuickCompareForm({
  occupationSlug,
  occupationTitle,
  countrySlug,
  countryName,
  countries,
}: QuickCompareFormProps) {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState(countrySlug || "");
  const [salary, setSalary] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const country = countries.find((c) => c.slug === selectedCountry);
    if (!country || !salary) return;

    const params = new URLSearchParams();
    params.set("job", occupationSlug);
    params.set("country", country.code);
    params.set("salary", salary);

    router.push(`/result?${params.toString()}`);
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
      <p className="text-slate-400 text-xs font-medium mb-3">
        How do you compare as a {occupationTitle}?
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        {/* Country selector */}
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="flex-1 min-w-0 bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 appearance-none cursor-pointer"
          required
        >
          <option value="" disabled>
            Select country
          </option>
          {countries.map((c) => (
            <option key={c.code} value={c.slug}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>

        {/* Salary input */}
        <input
          type="number"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          placeholder="Your salary (USD)"
          min={1}
          className="flex-1 min-w-0 bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          required
        />

        {/* Submit button */}
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors shrink-0"
        >
          Compare
        </button>
      </form>
    </div>
  );
}
