"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Occupation, Country } from "@/types";
import AutocompleteInput from "./AutocompleteInput";
import CountryCombobox from "./CountryCombobox";

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
  const [showErrors, setShowErrors] = useState(false);

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
    if (!selectedOccupation || !countryCode || !salary) {
      setShowErrors(true);
      return;
    }

    const numericSalary = salary.replace(/,/g, "");
    const params = new URLSearchParams();
    params.set("job", selectedOccupation.slug);
    params.set("country", countryCode);
    params.set("salary", numericSalary);
    router.push(`/result?${params.toString()}`);
  }

  const isValid = selectedOccupation && countryCode && salary;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm mx-auto">
      {/* Job Title */}
      <div>
        <label htmlFor="job-title" className="block text-xs text-slate-500 mb-1 ml-1">Job Title</label>
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
        <label htmlFor="country" className="block text-xs text-slate-500 mb-1 ml-1">Country</label>
        <CountryCombobox
          countries={countries}
          value={countryCode}
          onChange={(code) => setCountryCode(code)}
        />
      </div>

      {/* Annual Salary */}
      <div>
        <label htmlFor="salary" className="block text-xs text-slate-500 mb-1 ml-1">
          Annual Gross Salary (before tax){" "}
          {selectedCountry && (
            <span className="text-slate-400">({selectedCountry.currency})</span>
          )}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" aria-hidden="true">
            {selectedCountry?.currencySymbol ?? "$"}
          </span>
          <input
            id="salary"
            type="text"
            inputMode="numeric"
            value={salary}
            onChange={(e) => handleSalaryChange(e.target.value)}
            placeholder="e.g. 55,000,000"
            aria-invalid={showErrors && !salary ? true : undefined}
            aria-describedby={showErrors && !isValid ? "form-error" : undefined}
            className="w-full bg-dark-card border border-dark-border rounded-lg pl-10 pr-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
          />
        </div>
      </div>

      {/* Error messages */}
      {showErrors && !isValid && (
        <p id="form-error" role="alert" className="text-red-400 text-xs ml-1">
          {!selectedOccupation
            ? "Please select a job title."
            : !countryCode
            ? "Please select a country."
            : "Please enter your salary."}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid}
        aria-label={isValid ? "Compare my salary globally" : "Fill in all fields to compare"}
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
