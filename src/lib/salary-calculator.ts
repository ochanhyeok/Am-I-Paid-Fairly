import type { SalaryResult, CountryComparison, City, CitySalaryEntry, RelocationResult } from "@/types";
import {
  getOccupation,
  getCountry,
  getCountries,
  getSalaryEntries,
  getSalaryEntry,
  getBigMacEntry,
  getCitySalaryEntries,
  getCitySalaryEntry,
  getCity,
} from "./data-loader";

// 현지 통화 → USD 변환
export function convertToUSD(amount: number, countryCode: string): number {
  const country = getCountry(countryCode);
  if (!country) return amount;
  return amount / country.exchangeRate;
}

// USD → 현지 통화 변환
export function convertFromUSD(amount: number, countryCode: string): number {
  const country = getCountry(countryCode);
  if (!country) return amount;
  return amount * country.exchangeRate;
}

// 빅맥 환산 (연봉 USD → 연간 빅맥 수)
export function calculateBigMacCount(
  countryCode: string,
  salaryUSD: number
): number {
  const bigmac = getBigMacEntry(countryCode);
  if (!bigmac) return 0;
  return Math.round(salaryUSD / bigmac.dollarPrice);
}

// 글로벌 상위 % 계산
// 해당 직업의 모든 국가 급여 분포에서 유저가 상위 몇 %인지
export function calculateGlobalPercentile(
  occupationSlug: string,
  userSalaryUSD: number
): number {
  const entries = getSalaryEntries(occupationSlug);
  if (entries.length === 0) return 50;

  const salaries = entries.map((e) => e.estimatedSalary).sort((a, b) => a - b);
  const belowCount = salaries.filter((s) => s <= userSalaryUSD).length;

  // 0~100 범위 (높을수록 상위)
  return Math.round((belowCount / salaries.length) * 100);
}

// 유저 입력 → 글로벌 비교 결과
export function calculateSalaryResult(
  occupationSlug: string,
  countryCode: string,
  salaryLocal: number
): SalaryResult | null {
  const occupation = getOccupation(occupationSlug);
  const userCountry = getCountry(countryCode);
  if (!occupation || !userCountry) return null;

  const userSalaryUSD = salaryLocal / userCountry.exchangeRate;
  const globalPercentile = calculateGlobalPercentile(
    occupationSlug,
    userSalaryUSD
  );

  const countries = getCountries();
  const comparisons: CountryComparison[] = countries.map((country) => {
    const entry = getSalaryEntry(occupationSlug, country.code);
    const estimatedSalary = entry?.estimatedSalary ?? 0;
    const pppAdjusted = entry?.pppAdjusted ?? 0;
    const bigMacCount = calculateBigMacCount(country.code, estimatedSalary);

    // 해당 국가의 추정 연봉이 유저 대비 어떤지
    const ratio = estimatedSalary / (userSalaryUSD || 1);
    let relativeToUser: "higher" | "similar" | "lower";
    if (ratio > 1.15) relativeToUser = "higher";
    else if (ratio < 0.85) relativeToUser = "lower";
    else relativeToUser = "similar";

    // 이 국가의 추정 연봉이 글로벌 분포에서 상위 몇%인지
    const percentile = calculateGlobalPercentile(
      occupationSlug,
      estimatedSalary
    );

    return {
      country,
      estimatedSalary,
      pppAdjusted,
      bigMacCount,
      percentile,
      relativeToUser,
    };
  });

  // 연봉 높은 순 정렬
  comparisons.sort((a, b) => b.estimatedSalary - a.estimatedSalary);

  return {
    occupation,
    userCountry,
    userSalaryUSD,
    userSalaryLocal: salaryLocal,
    globalPercentile,
    countryComparisons: comparisons,
  };
}

// 유저 국가 대비 "훨씬 높은, 비슷한, 훨씬 낮은" 대표 국가 3개 선택
export function pickRepresentativeCountries(
  comparisons: CountryComparison[],
  userCountryCode: string
): CountryComparison[] {
  const higher = comparisons.find(
    (c) =>
      c.relativeToUser === "higher" && c.country.code !== userCountryCode
  );
  const similar = comparisons.find(
    (c) =>
      c.relativeToUser === "similar" && c.country.code !== userCountryCode
  );
  const lower = [...comparisons]
    .reverse()
    .find(
      (c) =>
        c.relativeToUser === "lower" && c.country.code !== userCountryCode
    );

  const picks: CountryComparison[] = [];
  if (higher) picks.push(higher);
  if (similar) picks.push(similar);
  if (lower) picks.push(lower);

  // 3개 못 채우면 유저 국가 제외 상위/중간/하위에서 보충
  if (picks.length < 3) {
    const others = comparisons.filter(
      (c) =>
        c.country.code !== userCountryCode &&
        !picks.includes(c)
    );
    while (picks.length < 3 && others.length > 0) {
      const idx = Math.floor(
        (others.length / (4 - picks.length)) * picks.length
      );
      picks.push(others[idx]);
      others.splice(idx, 1);
    }
  }

  return picks;
}

// --- Occupation JSON-LD용 퍼센타일 분포 계산 ---

export interface PercentileDistribution {
  percentile10: number;
  percentile25: number;
  median: number;
  percentile75: number;
  percentile90: number;
}

export function calculatePercentileDistribution(
  occupationSlug: string
): PercentileDistribution | null {
  const entries = getSalaryEntries(occupationSlug);
  const salaries = entries.map((e) => e.estimatedSalary).sort((a, b) => a - b);
  const n = salaries.length;
  if (n === 0) return null;
  return {
    percentile10: salaries[Math.floor(n * 0.1)],
    percentile25: salaries[Math.floor(n * 0.25)],
    median: salaries[Math.floor(n * 0.5)],
    percentile75: salaries[Math.floor(n * 0.75)],
    percentile90: salaries[Math.min(Math.floor(n * 0.9), n - 1)],
  };
}

// --- 도시 관련 계산 함수 ---

// 도시 연봉의 빅맥 환산
export function calculateCityBigMacCount(
  countryCode: string,
  citySalaryUSD: number
): number {
  return calculateBigMacCount(countryCode, citySalaryUSD);
}

// 도시 연봉의 글로벌 도시 분포에서의 백분위
export function calculateCityPercentile(
  occupationSlug: string,
  citySalaryUSD: number
): number {
  const entries = getCitySalaryEntries(occupationSlug);
  if (entries.length === 0) return 50;

  const salaries = entries.map((e) => e.estimatedSalary).sort((a, b) => a - b);
  const belowCount = salaries.filter((s) => s <= citySalaryUSD).length;

  return Math.round((belowCount / salaries.length) * 100);
}

export interface CityRanked {
  city: City;
  estimatedSalary: number;
  pppAdjusted: number;
  colAdjusted: number;
}

// 특정 직업에서 연봉이 높은 상위 N개 도시
export function getTopCitiesForOccupation(
  occupationSlug: string,
  limit: number
): CityRanked[] {
  const entries = getCitySalaryEntries(occupationSlug);

  return entries
    .map((entry) => {
      const city = getCity(entry.citySlug);
      if (!city) return null;
      return {
        city,
        estimatedSalary: entry.estimatedSalary,
        pppAdjusted: entry.pppAdjusted,
        colAdjusted: entry.colAdjusted,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.estimatedSalary - a!.estimatedSalary)
    .slice(0, limit) as CityRanked[];
}

// --- Relocation Calculator ---

export function calculateRelocation(
  occupationSlug: string,
  fromCitySlug: string,
  toCitySlug: string
): RelocationResult | null {
  const occupation = getOccupation(occupationSlug);
  const fromCity = getCity(fromCitySlug);
  const toCity = getCity(toCitySlug);
  if (!occupation || !fromCity || !toCity) return null;

  const fromCountry = getCountry(fromCity.countryCode);
  const toCountry = getCountry(toCity.countryCode);
  if (!fromCountry || !toCountry) return null;

  const fromSalary = getCitySalaryEntry(occupationSlug, fromCitySlug);
  const toSalary = getCitySalaryEntry(occupationSlug, toCitySlug);
  if (!fromSalary || !toSalary) return null;

  // 변화율 계산
  const nominalChange = fromSalary.estimatedSalary > 0
    ? ((toSalary.estimatedSalary - fromSalary.estimatedSalary) / fromSalary.estimatedSalary) * 100
    : 0;

  const colAdjustedChange = fromSalary.colAdjusted > 0
    ? ((toSalary.colAdjusted - fromSalary.colAdjusted) / fromSalary.colAdjusted) * 100
    : 0;

  // 빅맥 구매력
  const bigMacFrom = calculateCityBigMacCount(fromCity.countryCode, fromSalary.estimatedSalary);
  const bigMacTo = calculateCityBigMacCount(toCity.countryCode, toSalary.estimatedSalary);
  const bigMacChange = bigMacFrom > 0
    ? ((bigMacTo - bigMacFrom) / bigMacFrom) * 100
    : 0;

  // 글로벌 백분위
  const percentileFrom = calculateCityPercentile(occupationSlug, fromSalary.estimatedSalary);
  const percentileTo = calculateCityPercentile(occupationSlug, toSalary.estimatedSalary);

  // 종합 판정 (COL-adjusted 기준이 핵심)
  let verdict: RelocationResult["verdict"];
  let verdictReason: string;

  if (colAdjustedChange >= 20) {
    verdict = "strong-yes";
    verdictReason = `Moving to ${toCity.name} significantly boosts your real purchasing power by ${Math.round(colAdjustedChange)}%.`;
  } else if (colAdjustedChange >= 5) {
    verdict = "yes";
    verdictReason = `${toCity.name} offers a meaningful improvement in cost-of-living-adjusted income.`;
  } else if (colAdjustedChange >= -5) {
    verdict = "neutral";
    verdictReason = `Your real purchasing power stays roughly the same — the move is lifestyle-driven, not financially driven.`;
  } else if (colAdjustedChange >= -20) {
    verdict = "no";
    verdictReason = `You'd lose about ${Math.round(Math.abs(colAdjustedChange))}% in real purchasing power. Consider carefully.`;
  } else {
    verdict = "strong-no";
    verdictReason = `Significant drop in purchasing power (${Math.round(Math.abs(colAdjustedChange))}%). Only worth it for non-financial reasons.`;
  }

  return {
    occupation,
    fromCity,
    toCity,
    fromCountry,
    toCountry,
    fromSalary,
    toSalary,
    nominalChange: Math.round(nominalChange),
    colAdjustedChange: Math.round(colAdjustedChange),
    bigMacFrom,
    bigMacTo,
    bigMacChange: Math.round(bigMacChange),
    percentileFrom,
    percentileTo,
    verdict,
    verdictReason,
  };
}
