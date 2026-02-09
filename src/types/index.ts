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

export interface City {
  slug: string;           // "new-york"
  name: string;           // "New York"
  countryCode: string;    // "US"
  population: number;
  isCapital: boolean;
  isTechHub: boolean;
  colMultiplier: number;  // 생활비 배수 (국가 평균 대비)
}

export interface CitySalaryEntry {
  occupationSlug: string;
  countryCode: string;
  citySlug: string;
  estimatedSalary: number;  // USD (도시 조정 후)
  pppAdjusted: number;      // PPP 조정
  colAdjusted: number;      // 생활비 보정 실질 구매력
}

// Relocation Calculator 결과
export interface RelocationResult {
  occupation: Occupation;
  fromCity: City;
  toCity: City;
  fromCountry: Country;
  toCountry: Country;
  fromSalary: CitySalaryEntry;
  toSalary: CitySalaryEntry;
  // 변화율 (양수 = 증가)
  nominalChange: number;        // 명목 연봉 변화율 (%)
  colAdjustedChange: number;    // COL 보정 구매력 변화율 (%)
  bigMacFrom: number;           // 출발 도시 빅맥 수
  bigMacTo: number;             // 도착 도시 빅맥 수
  bigMacChange: number;         // 빅맥 구매력 변화율 (%)
  percentileFrom: number;       // 출발 도시 글로벌 백분위
  percentileTo: number;         // 도착 도시 글로벌 백분위
  // 종합 판정
  verdict: "strong-yes" | "yes" | "neutral" | "no" | "strong-no";
  verdictReason: string;
}
