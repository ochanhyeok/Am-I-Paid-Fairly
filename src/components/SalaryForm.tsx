"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Occupation, Country } from "@/types";
import AutocompleteInput from "./AutocompleteInput";

interface Props {
  occupations: Occupation[];
  countries: Country[];
}

export default function SalaryForm({ occupations, countries }: Props) {
  const router = useRouter();
  const [selectedOccupation, setSelectedOccupation] = useState<Occupation | null>(null);
  const [jobQuery, setJobQuery] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [salary, setSalary] = useState("");

  const selectedCountry = useMemo(
    () => countries.find((c) => c.code === countryCode) ?? null,
    [countries, countryCode]
  );

  // 숫자 입력 포맷 (콤마 추가)
  function handleSalaryChange(raw: string) {
    const digits = raw.replace(/[^0-9]/g, "");
    if (digits === "") {
      setSalary("");
      return;
    }
    const num = parseInt(digits, 10);
    setSalary(num.toLocaleString("en-US"));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOccupation || !countryCode || !salary) return;

    const numericSalary = salary.replace(/,/g, "");
    router.push(
      `/result?job=${selectedOccupation.slug}&country=${countryCode}&salary=${numericSalary}`
    );
  }

  const isValid = selectedOccupation && countryCode && salary;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm mx-auto">
      {/* Job Title */}
      <div>
        <label className="block text-xs text-slate-500 mb-1 ml-1">Job Title</label>
        <AutocompleteInput
          occupations={occupations}
          value={jobQuery}
          onChange={(occ, display) => {
            setSelectedOccupation(occ);
            setJobQuery(display);
          }}
          placeholder="e.g. Software Engineer"
        />
      </div>

      {/* Country */}
      <div>
        <label className="block text-xs text-slate-500 mb-1 ml-1">Country</label>
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors appearance-none"
        >
          <option value="" disabled>
            Select your country
          </option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Annual Salary */}
      <div>
        <label className="block text-xs text-slate-500 mb-1 ml-1">
          Annual Salary{" "}
          {selectedCountry && (
            <span className="text-slate-400">({selectedCountry.currency})</span>
          )}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            {selectedCountry?.currencySymbol ?? "$"}
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={salary}
            onChange={(e) => handleSalaryChange(e.target.value)}
            placeholder="e.g. 55,000,000"
            className="w-full bg-dark-card border border-dark-border rounded-lg pl-10 pr-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid}
        className={`w-full py-3 rounded-lg font-bold text-white transition-all mt-1 ${
          isValid
            ? "bg-accent-blue hover:bg-blue-600 active:scale-[0.98]"
            : "bg-slate-700 cursor-not-allowed text-slate-400"
        }`}
      >
        Compare My Salary →
      </button>
    </form>
  );
}
