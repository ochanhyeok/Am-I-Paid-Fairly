// 도시별 연봉 데이터 생성 스크립트
// 실행: node scripts/generate-city-salaries.mjs

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "src", "data");

const occupations = JSON.parse(readFileSync(join(dataDir, "occupations.json"), "utf-8"));
const countries = JSON.parse(readFileSync(join(dataDir, "countries.json"), "utf-8"));
const salaries = JSON.parse(readFileSync(join(dataDir, "salaries.json"), "utf-8"));
const cities = JSON.parse(readFileSync(join(dataDir, "cities.json"), "utf-8"));
const bigmac = JSON.parse(readFileSync(join(dataDir, "bigmac.json"), "utf-8"));

// US Big Mac price (빅맥 지수 기준)
const usBigMac = bigmac.find((b) => b.countryCode === "US");
const usBigMacPrice = usBigMac ? usBigMac.dollarPrice : 5.58;

// Tech 카테고리 목록
const TECH_CATEGORIES = ["Tech"];

const citySalaries = [];

for (const occ of occupations) {
  for (const city of cities) {
    // 해당 국가의 country-level salary 찾기
    const countrySalary = salaries.find(
      (s) => s.occupationSlug === occ.slug && s.countryCode === city.countryCode
    );

    if (!countrySalary) continue;

    // 도시 연봉 계산: countryEstimatedSalary × colMultiplier × techHubBonus
    const techHubBonus =
      city.isTechHub && TECH_CATEGORIES.includes(occ.category) ? 1.08 : 1.0;
    const estimatedSalary = Math.round(
      countrySalary.estimatedSalary * city.colMultiplier * techHubBonus
    );

    // PPP 조정: 국가 빅맥 가격 기준
    const countryBigMac = bigmac.find((b) => b.countryCode === city.countryCode);
    const countryBigMacPrice = countryBigMac ? countryBigMac.dollarPrice : 0;
    const pppAdjusted =
      countryBigMacPrice > 0
        ? Math.round(estimatedSalary * (usBigMacPrice / countryBigMacPrice))
        : estimatedSalary;

    // COL 보정 실질 구매력: 도시 연봉 / colMultiplier
    const colAdjusted = Math.round(estimatedSalary / city.colMultiplier);

    citySalaries.push({
      occupationSlug: occ.slug,
      countryCode: city.countryCode,
      citySlug: city.slug,
      estimatedSalary,
      pppAdjusted,
      colAdjusted,
    });
  }
}

writeFileSync(
  join(dataDir, "city-salaries.json"),
  JSON.stringify(citySalaries),
  "utf-8"
);

console.log(`Generated ${citySalaries.length} city salary entries`);
console.log(`File size: ${(JSON.stringify(citySalaries).length / 1024 / 1024).toFixed(2)} MB`);
