"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Occupation, Country, City, RelocationResult } from "@/types";
import AutocompleteInput from "@/components/AutocompleteInput";
import CityCombobox from "@/components/CityCombobox";
import { formatCurrency, formatNumber, formatPercentile } from "@/lib/format";

interface Props {
  occupations: Occupation[];
  countries: Country[];
  cities: City[];
  initialResult: RelocationResult | null;
}

export default function RelocationClient({
  occupations,
  countries,
  cities,
  initialResult,
}: Props) {
  const router = useRouter();

  const [selectedOccupation, setSelectedOccupation] = useState<Occupation | null>(
    initialResult?.occupation ?? null
  );
  const [jobQuery, setJobQuery] = useState(initialResult?.occupation?.title ?? "");
  const [fromCity, setFromCity] = useState(initialResult?.fromCity?.slug ?? "");
  const [toCity, setToCity] = useState(initialResult?.toCity?.slug ?? "");
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);

  const result = initialResult;

  const isValid = selectedOccupation && fromCity && toCity && fromCity !== toCity;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      setShowErrors(true);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams();
    params.set("job", selectedOccupation!.slug);
    params.set("from", fromCity);
    params.set("to", toCity);
    router.push(`/relocate?${params.toString()}`);
  }

  // 판정 배너 설정
  function getVerdictConfig(verdict: RelocationResult["verdict"]) {
    switch (verdict) {
      case "strong-yes":
        return {
          icon: "\uD83C\uDFAF",
          label: "Strongly Recommended",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/30",
          text: "text-emerald-400",
        };
      case "yes":
        return {
          icon: "\uD83D\uDC4D",
          label: "Worth Considering",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/30",
          text: "text-emerald-400",
        };
      case "neutral":
        return {
          icon: "\uD83E\uDD14",
          label: "Break Even",
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/30",
          text: "text-yellow-400",
        };
      case "no":
        return {
          icon: "\u26A0\uFE0F",
          label: "Think Twice",
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          text: "text-amber-400",
        };
      case "strong-no":
        return {
          icon: "\uD83D\uDEAB",
          label: "Not Recommended",
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          text: "text-red-400",
        };
    }
  }

  function getChangeColor(value: number) {
    if (value > 0) return "text-emerald-400";
    if (value < 0) return "text-red-400";
    return "text-slate-400";
  }

  function formatChange(value: number) {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value}%`;
  }

  function getPercentileColor(p: number) {
    if (p >= 50) return "text-emerald-400";
    if (p >= 30) return "text-yellow-400";
    return "text-red-400";
  }

  // 국가 코드 → Country 객체 룩업
  function getCountryByCode(code: string) {
    return countries.find((c) => c.code === code);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page Title */}
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 leading-tight">
          Relocation Salary Calculator
        </h1>
        <p className="text-slate-500 text-sm mt-3 max-w-lg mx-auto">
          Should you relocate? Compare salary, cost of living, and purchasing
          power between 98 global cities.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-dark-card border border-dark-border rounded-2xl p-6 flex flex-col gap-4"
      >
        {/* Job Title */}
        <div>
          <label className="block text-xs text-slate-500 mb-1 ml-1">
            Job Title
          </label>
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

        {/* Current City */}
        <div>
          <label className="block text-xs text-slate-500 mb-1 ml-1">
            Current City
          </label>
          <CityCombobox
            cities={cities}
            countries={countries}
            value={fromCity}
            onChange={(slug) => setFromCity(slug)}
            placeholder="Where you work now"
          />
        </div>

        {/* Target City */}
        <div>
          <label className="block text-xs text-slate-500 mb-1 ml-1">
            Target City
          </label>
          <CityCombobox
            cities={cities}
            countries={countries}
            value={toCity}
            onChange={(slug) => setToCity(slug)}
            placeholder="Where you want to move"
          />
        </div>

        {/* Error messages */}
        {showErrors && !isValid && (
          <p className="text-red-400 text-xs ml-1">
            {!selectedOccupation
              ? "Please select a job title."
              : !fromCity
              ? "Please select your current city."
              : !toCity
              ? "Please select a target city."
              : fromCity === toCity
              ? "Please select two different cities."
              : "Please fill in all fields."}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid || loading}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all mt-1 ${
            isValid && !loading
              ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-[0.98]"
              : "bg-slate-700 cursor-not-allowed text-slate-400"
          }`}
        >
          {loading ? "Calculating..." : "Calculate Relocation"}
        </button>
      </form>

      {/* Result Section */}
      {result && (
        <>
          {/* Verdict Banner */}
          {(() => {
            const config = getVerdictConfig(result.verdict);
            const fromCountry = getCountryByCode(result.fromCity.countryCode);
            const toCountry = getCountryByCode(result.toCity.countryCode);
            return (
              <div className="flex flex-col gap-8">
                <div
                  className={`${config.bg} border ${config.border} rounded-2xl p-6 text-center`}
                >
                  <span className="text-4xl block mb-3">{config.icon}</span>
                  <p className={`text-xl font-bold ${config.text}`}>
                    {config.label}
                  </p>
                  <p className="text-slate-400 text-sm mt-2 leading-relaxed max-w-md mx-auto">
                    {result.verdictReason}
                  </p>
                </div>

                {/* Side-by-side Comparison Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* From City Card */}
                  <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-slate-700/50 text-slate-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        Current
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-3xl">
                        {fromCountry?.flag ?? ""}
                      </span>
                      <div>
                        <h2 className="text-lg font-bold text-slate-50">
                          {result.fromCity.name}
                        </h2>
                        <p className="text-slate-500 text-xs">
                          {fromCountry?.name ?? result.fromCity.countryCode}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <p className="text-slate-500 text-xs mb-1">
                          Salary (USD)
                        </p>
                        <p className="text-2xl font-bold text-slate-50">
                          {formatCurrency(result.fromSalary.estimatedSalary)}
                        </p>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <p className="text-slate-500 text-xs mb-1">
                          COL-Adjusted
                        </p>
                        <p className="text-xl font-bold text-slate-50">
                          {formatCurrency(result.fromSalary.colAdjusted)}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          real purchasing power
                        </p>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <p className="text-slate-500 text-xs mb-1">
                          Big Mac Power
                        </p>
                        <p className="text-xl font-bold text-slate-50">
                          {result.bigMacFrom > 0
                            ? formatNumber(result.bigMacFrom)
                            : "N/A"}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          burgers / year
                        </p>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <p className="text-slate-500 text-xs mb-1">
                          Global Percentile
                        </p>
                        <p
                          className={`text-xl font-bold ${getPercentileColor(
                            result.percentileFrom
                          )}`}
                        >
                          {formatPercentile(result.percentileFrom)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* To City Card */}
                  <div
                    className={`bg-dark-card border rounded-2xl p-6 ${
                      result.colAdjustedChange > 0
                        ? "border-emerald-500/50"
                        : "border-dark-border"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          result.colAdjustedChange > 0
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        Target
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-3xl">
                        {toCountry?.flag ?? ""}
                      </span>
                      <div>
                        <h2 className="text-lg font-bold text-slate-50">
                          {result.toCity.name}
                        </h2>
                        <p className="text-slate-500 text-xs">
                          {toCountry?.name ?? result.toCity.countryCode}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <p className="text-slate-500 text-xs mb-1">
                          Salary (USD)
                        </p>
                        <p className="text-2xl font-bold text-slate-50">
                          {formatCurrency(result.toSalary.estimatedSalary)}
                        </p>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <p className="text-slate-500 text-xs mb-1">
                          COL-Adjusted
                        </p>
                        <p className="text-xl font-bold text-slate-50">
                          {formatCurrency(result.toSalary.colAdjusted)}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          real purchasing power
                        </p>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <p className="text-slate-500 text-xs mb-1">
                          Big Mac Power
                        </p>
                        <p className="text-xl font-bold text-slate-50">
                          {result.bigMacTo > 0
                            ? formatNumber(result.bigMacTo)
                            : "N/A"}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          burgers / year
                        </p>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <p className="text-slate-500 text-xs mb-1">
                          Global Percentile
                        </p>
                        <p
                          className={`text-xl font-bold ${getPercentileColor(
                            result.percentileTo
                          )}`}
                        >
                          {formatPercentile(result.percentileTo)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Change Summary */}
                <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    Change Summary
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-slate-500 text-xs mb-2">
                        Salary Change
                      </p>
                      <p
                        className={`text-2xl font-bold ${getChangeColor(
                          result.nominalChange
                        )}`}
                      >
                        {formatChange(result.nominalChange)}
                      </p>
                      <p className="text-slate-600 text-[10px] mt-1">
                        nominal USD
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-500 text-xs mb-2">
                        Purchasing Power
                      </p>
                      <p
                        className={`text-2xl font-bold ${getChangeColor(
                          result.colAdjustedChange
                        )}`}
                      >
                        {formatChange(result.colAdjustedChange)}
                      </p>
                      <p className="text-slate-600 text-[10px] mt-1">
                        COL-adjusted
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-500 text-xs mb-2">
                        Big Mac Index
                      </p>
                      <p
                        className={`text-2xl font-bold ${getChangeColor(
                          result.bigMacChange
                        )}`}
                      >
                        {result.bigMacFrom > 0 && result.bigMacTo > 0
                          ? formatChange(result.bigMacChange)
                          : "N/A"}
                      </p>
                      <p className="text-slate-600 text-[10px] mt-1">
                        burger power
                      </p>
                    </div>
                  </div>
                </div>

                {/* What This Means */}
                <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    What This Means
                  </h2>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-400 mt-0.5 shrink-0">
                        &#9679;
                      </span>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Your nominal salary would{" "}
                        {result.nominalChange >= 0 ? "increase" : "decrease"} by{" "}
                        <span className={getChangeColor(result.nominalChange)}>
                          {Math.abs(result.nominalChange)}%
                        </span>{" "}
                        moving from {result.fromCity.name} to{" "}
                        {result.toCity.name}.
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-400 mt-0.5 shrink-0">
                        &#9679;
                      </span>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        After adjusting for cost of living, your real purchasing
                        power{" "}
                        {result.colAdjustedChange >= 0
                          ? "increases"
                          : "decreases"}{" "}
                        by{" "}
                        <span
                          className={getChangeColor(result.colAdjustedChange)}
                        >
                          {Math.abs(result.colAdjustedChange)}%
                        </span>
                        .
                      </p>
                    </li>
                    {result.bigMacFrom > 0 && result.bigMacTo > 0 && (
                      <li className="flex items-start gap-3">
                        <span className="text-emerald-400 mt-0.5 shrink-0">
                          &#9679;
                        </span>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          In Big Mac terms, you&apos;d go from{" "}
                          <span className="text-slate-100 font-semibold">
                            {formatNumber(result.bigMacFrom)}
                          </span>{" "}
                          to{" "}
                          <span className="text-slate-100 font-semibold">
                            {formatNumber(result.bigMacTo)}
                          </span>{" "}
                          burgers per year.
                        </p>
                      </li>
                    )}
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-400 mt-0.5 shrink-0">
                        &#9679;
                      </span>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Your global percentile would move from{" "}
                        <span
                          className={`font-semibold ${getPercentileColor(
                            result.percentileFrom
                          )}`}
                        >
                          {formatPercentile(result.percentileFrom)}
                        </span>{" "}
                        to{" "}
                        <span
                          className={`font-semibold ${getPercentileColor(
                            result.percentileTo
                          )}`}
                        >
                          {formatPercentile(result.percentileTo)}
                        </span>{" "}
                        among {result.occupation.title}s worldwide.
                      </p>
                    </li>
                  </ul>
                </div>

                {/* Explore More */}
                <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    Explore More
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/compare-cities/${result.occupation.slug}/${result.fromCity.slug}-vs-${result.toCity.slug}`}
                      className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
                    >
                      {result.fromCity.name} vs {result.toCity.name} detailed
                      comparison
                    </Link>
                    <Link
                      href={`/cities/${result.fromCity.slug}`}
                      className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
                    >
                      All salaries in {result.fromCity.name}
                    </Link>
                    <Link
                      href={`/cities/${result.toCity.slug}`}
                      className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
                    >
                      All salaries in {result.toCity.name}
                    </Link>
                    <Link
                      href={`/salary/${result.occupation.slug}`}
                      className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
                    >
                      {result.occupation.title} Global Overview
                    </Link>
                    <Link
                      href={`/rankings/${result.occupation.slug}`}
                      className="text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50"
                    >
                      {result.occupation.title} Global Rankings
                    </Link>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="text-center pb-4">
                  <p className="text-slate-600 text-[10px]">
                    Estimated based on OECD &amp; BLS data, adjusted for
                    city-level cost of living. Actual salaries vary by
                    experience, company, and neighborhood.
                  </p>
                  <p className="text-slate-700 text-[10px] mt-1">
                    Sources:{" "}
                    <a
                      href="https://www.bls.gov/oes/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-slate-500"
                    >
                      BLS OEWS
                    </a>
                    {" "}&middot;{" "}
                    <a
                      href="https://stats.oecd.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-slate-500"
                    >
                      OECD
                    </a>
                    {" "}&middot;{" "}
                    <a
                      href="https://data.worldbank.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-slate-500"
                    >
                      World Bank
                    </a>
                    {" "}&middot;{" "}
                    <a
                      href="https://github.com/TheEconomist/big-mac-data"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-slate-500"
                    >
                      Big Mac Index
                    </a>
                    {" "}&middot;{" "}
                    <a
                      href="https://www.numbeo.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-slate-500"
                    >
                      Numbeo
                    </a>
                  </p>
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
