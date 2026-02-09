import type { Occupation, Country, SalaryEntry, BigMacEntry, City, CitySalaryEntry } from "@/types";

import occupationsData from "@/data/occupations.json";
import countriesData from "@/data/countries.json";
import salariesData from "@/data/salaries.json";
import bigmacData from "@/data/bigmac.json";
import citiesData from "@/data/cities.json";
import citySalariesData from "@/data/city-salaries.json";

// 타입 캐스팅 (JSON 모듈은 타입 추론이 불완전)
const occupations = occupationsData as Occupation[];
const countries = countriesData as Country[];
const salaries = salariesData as SalaryEntry[];
const bigmacEntries = bigmacData as BigMacEntry[];
const cities = citiesData as City[];
const citySalaries = citySalariesData as CitySalaryEntry[];

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

export function getCountryBySlug(slug: string): Country | undefined {
  return countries.find((c) => c.slug === slug);
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

// --- 도시 데이터 로더 ---

export function getCities(): City[] {
  return cities;
}

export function getCity(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}

export function getCitiesByCountry(countryCode: string): City[] {
  return cities.filter((c) => c.countryCode === countryCode);
}

export function getCitySalaryEntry(
  occupationSlug: string,
  citySlug: string
): CitySalaryEntry | undefined {
  return citySalaries.find(
    (s) => s.occupationSlug === occupationSlug && s.citySlug === citySlug
  );
}

export function getCitySalaryEntries(occupationSlug: string): CitySalaryEntry[] {
  return citySalaries.filter((s) => s.occupationSlug === occupationSlug);
}

export function getCitySalaryEntriesByCountry(
  occupationSlug: string,
  countryCode: string
): CitySalaryEntry[] {
  return citySalaries.filter(
    (s) => s.occupationSlug === occupationSlug && s.countryCode === countryCode
  );
}

export function getCitySalaryEntriesByCity(citySlug: string): CitySalaryEntry[] {
  return citySalaries.filter((s) => s.citySlug === citySlug);
}
