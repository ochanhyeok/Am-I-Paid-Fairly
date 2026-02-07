import type { Occupation, Country, SalaryEntry, BigMacEntry } from "@/types";

import occupationsData from "@/data/occupations.json";
import countriesData from "@/data/countries.json";
import salariesData from "@/data/salaries.json";
import bigmacData from "@/data/bigmac.json";

// 타입 캐스팅 (JSON 모듈은 타입 추론이 불완전)
const occupations = occupationsData as Occupation[];
const countries = countriesData as Country[];
const salaries = salariesData as SalaryEntry[];
const bigmacEntries = bigmacData as BigMacEntry[];

export function getOccupations(): Occupation[] {
  return occupations;
}

export function getCountries(): Country[] {
  return countries;
}

export function getOccupation(slug: string): Occupation | undefined {
  return occupations.find((o) => o.slug === slug);
}

export function getCountry(code: string): Country | undefined {
  return countries.find((c) => c.code === code);
}

export function getSalaryEntries(occupationSlug: string): SalaryEntry[] {
  return salaries.filter((s) => s.occupationSlug === occupationSlug);
}

export function getSalaryEntry(
  occupationSlug: string,
  countryCode: string
): SalaryEntry | undefined {
  return salaries.find(
    (s) => s.occupationSlug === occupationSlug && s.countryCode === countryCode
  );
}

export function getBigMacEntry(countryCode: string): BigMacEntry | undefined {
  return bigmacEntries.find((b) => b.countryCode === countryCode);
}
