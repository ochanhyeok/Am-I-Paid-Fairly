import type { SalaryResult, CountryComparison } from "@/types";
import {
  getOccupation,
  getCountry,
  getCountries,
  getSalaryEntries,
  getSalaryEntry,
  getBigMacEntry,
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
