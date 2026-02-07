export interface Occupation {
  slug: string;
  title: string;
  category: string;
  baseUSA: number; // BLS 미국 평균 연봉 (USD)
  sectorMultiplier: number; // 직업군 보정계수 (0.60~1.20)
}

export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  slug: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  exchangeRate: number; // 1 USD = X 현지통화
  oecdAvgWage: number; // OECD 평균임금 (USD)
  gdpPerCapita: number; // GDP per capita (USD)
}

export interface SalaryEntry {
  occupationSlug: string;
  countryCode: string;
  estimatedSalary: number; // USD
  pppAdjusted: number; // PPP 조정 USD
}

export interface BigMacEntry {
  countryCode: string;
  localPrice: number;
  dollarPrice: number;
}

export interface SalaryResult {
  occupation: Occupation;
  userCountry: Country;
  userSalaryUSD: number;
  userSalaryLocal: number;
  globalPercentile: number; // 0~100
  countryComparisons: CountryComparison[];
}

export interface CountryComparison {
  country: Country;
  estimatedSalary: number; // USD
  pppAdjusted: number;
  bigMacCount: number;
  percentile: number; // 해당 직업 글로벌 분포에서의 상위%
  relativeToUser: "higher" | "similar" | "lower";
}
