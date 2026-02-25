# 기술 아키텍처 레퍼런스

최종 업데이트: 2026-02-23

---

## 기술 스택

| 레이어 | 기술 | 버전 | 비고 |
|--------|------|------|------|
| Framework | Next.js (App Router) | 14.2.35 | SSG + ISR |
| UI | React + TypeScript | 18.3.1 / 5.7.0 | Strict mode |
| Styling | Tailwind CSS | 3.4.17 | 다크 테마 기본 |
| 지도 | react-simple-maps | — | SVG Choropleth |
| 차트 | Recharts | 2.15.0 | 바차트, 라인차트 |
| 애니메이션 | Framer Motion | 11.15.0 | CountUp, 전환 |
| OG Image | @vercel/og | 0.8.6 | Edge route |
| 폰트 | DM Sans | Variable | 400-800 weight |
| 배포 | Vercel | Hobby | CDN + Edge |

### 주의사항

- Next.js 14.2는 `next.config.ts` **미지원** → `next.config.mjs` 사용
- `[...new Set()]` 사용 금지 → `Array.from(new Set())` (TS downlevelIteration)
- `.next` 캐시 손상 시 빌드 실패 → `rm -rf .next` 후 재빌드

---

## 데이터 레이어

### 데이터 파일

| 파일 | 크기 | 엔트리 | 구조 |
|------|------|--------|------|
| `occupations.json` | 22KB | 175개 | slug, title, category, baseUSA, sectorMultiplier |
| `countries.json` | 8.5KB | 42개 | code, name, slug, flag, currency, exchangeRate, oecdAvgWage, gdpPerCapita |
| `salaries.json` | 709KB | 7,350 | occupationSlug, countryCode, estimatedSalary, pppAdjusted |
| `bigmac.json` | 2.8KB | 42개 | countryCode, localPrice, dollarPrice |
| `cities.json` | 14KB | 98개 | slug, name, countryCode, population, isCapital, isTechHub, colMultiplier |
| `city-salaries.json` | 2.3MB | 17,150 | occupationSlug, countryCode, citySlug, estimatedSalary, pppAdjusted, colAdjusted |
| `blog-posts.ts` | 392KB | 50개 | slug, title, sections, keywords, category, occupationSlug? |
| `country-insights.ts` | 79KB | 42개 | code, economy, taxSystem, topIndustries, jobMarket, costOfLiving, workCulture |

### 데이터 소스

| 소스 | 데이터 | 비용 |
|------|--------|------|
| BLS OEWS | 직업별 미국 기준 연봉 (baseUSA) | 무료 |
| OECD SDMX API | 국가별 평균 임금 (countryRatio) | 무료 |
| World Bank | GDP per capita | 무료 |
| The Economist 빅맥 지수 | PPP 환산 | 무료 (GitHub CSV) |
| ExchangeRate API | 환율 | 무료 tier |
| Numbeo | 도시 생활비 지수 (colMultiplier 산출 참고) | 참고 |

---

## 연봉 계산 공식

### 국가 레벨

```
estimatedSalary = baseUSA × countryRatio × sectorMultiplier
pppAdjusted = estimatedSalary × (US_bigmac / country_bigmac)
```

### 도시 레벨

```
estimatedSalary = countryEstimatedSalary × colMultiplier × techHubBonus
  techHubBonus = (isTechHub && category == "Tech") ? 1.08 : 1.0
colAdjusted = estimatedSalary / colMultiplier  // 실질 구매력
```

### 퍼센타일

```
globalPercentile = (42개국 중 userSalary보다 낮은 수) / 42 × 100
cityPercentile = (98개 도시 중 userSalary보다 낮은 수) / 98 × 100
```

### Relocation Verdict

```
colAdjustedChange = (toCity.colAdjusted - fromCity.colAdjusted) / fromCity.colAdjusted × 100

≥ 20%  → "strong-yes" (이동 강력 추천)
≥  5%  → "yes" (이동 추천)
± 5%   → "neutral" (비슷)
≥ -20% → "no" (이동 비추천)
< -20% → "strong-no" (이동 강력 비추천)
```

---

## 페이지 인벤토리

### 전체 40,762 페이지

| 라우트 | 수량 | SSG | ISR | 컴포넌트 |
|--------|------|-----|-----|---------|
| `/` | 1 | ✅ | — | SalaryForm, Organization/WebSite JSON-LD |
| `/result` | 1 | — | 동적 | ResultClient, ChoroplethMap, CountryComparison |
| `/salary/[occ]` | 175 | ✅ 전부 | — | QuickCompareForm, SalaryPeriodToggle |
| `/salary/[occ]/[country]` | 7,350 | 420 | 6,930 | CountryQuickNav, FAQ, Editorial |
| `/salary/[occ]/[country]/[city]` | 17,150 | 980 | 16,170 | CityQuickNav |
| `/rankings/[occ]` | 175 | ✅ 전부 | — | 바차트, Editorial |
| `/compare/[occ]/[pair]` | 7,000 | 400 | 6,600 | Editorial 5섹션 |
| `/compare-cities/[occ]/[pair]` | 4,375 | 250 | 4,125 | 도시 비교 |
| `/relocate` | 1 | — | 동적 | RelocationClient, CityCombobox |
| `/relocate/[occ]/[pair]` | 4,375 | 250 | 4,125 | Verdict 카드 |
| `/cities` | 1 | ✅ | — | 지역별 그리드 |
| `/cities/[city]` | 98 | ✅ 전부 | — | 전직업 리스트 |
| `/browse` | 1 | ✅ | — | BrowseClient (카테고리 탭) |
| `/countries` | 1 | ✅ | — | ItemList JSON-LD |
| `/blog` | 1 | ✅ | — | BlogFilterClient |
| `/blog/[slug]` | 50 | ✅ 전부 | — | FAQ accordion, Related Posts |
| `/blog/category/[cat]` | 4 | ✅ 전부 | — | BreadcrumbList, Blog JSON-LD |
| `/about`, `/privacy`, `/terms` | 3 | ✅ | — | ContactModal |
| `/api/og` | 1 | — | Edge | OG 이미지 생성 |
| **합계** | **40,762** | **2,812** | **37,950** | — |

---

## 컴포넌트 인벤토리

### 서버 컴포넌트

| 컴포넌트 | 용도 |
|---------|------|
| Header.tsx | 네비게이션 (Jobs, Countries, Cities, Relocate, Rankings, Blog, About) |
| Footer.tsx | 4컬럼 푸터 (Top Salaries, Rankings, Data Sources, Explore) |
| ResultCard.tsx | 퍼센타일 표시 (Top X%, 색상 코딩) |
| CountryMiniCards.tsx | 대표 국가 3개 미니 카드 |

### 클라이언트 컴포넌트 ("use client")

| 컴포넌트 | 용도 | 인터랙션 |
|---------|------|---------|
| SalaryForm.tsx | 메인 입력 폼 | Job + Country + Salary → /result |
| AutocompleteInput.tsx | 직업 자동완성 | 175개 검색 |
| CountryCombobox.tsx | 국가 선택 | 인기 8개 바로가기 + 검색 |
| CityCombobox.tsx | 도시 선택 | 인기 8개 바로가기 + 검색 |
| QuickCompareForm.tsx | 인라인 재비교 | 직업 프리필 + 연봉 입력 |
| ChoroplethMap.tsx | 세계 지도 | 호버 툴팁, 터치 토글 |
| CountUpAnimation.tsx | 숫자 애니메이션 | Framer Motion |
| CountryQuickNav.tsx | "What if?" 국가 전환 | 드롭다운 |
| CityQuickNav.tsx | "What if?" 도시 전환 | 드롭다운 |
| SalaryPeriodToggle.tsx | 연/월/시급 토글 | 3버튼 토글 |
| BlogFilterClient.tsx | 블로그 필터 | 5탭 + 검색 + Show More |
| NewsletterSignup.tsx | 뉴스레터 | 이메일 입력 (백엔드 미연동) |
| ShareCard.tsx | 결과 공유 | Twitter/LinkedIn/Copy |
| ContactModal.tsx | 연락처 모달 | 이메일 난독화 |
| GoogleAnalytics.tsx | GA4 | afterInteractive, ID 검증 |
| AdSense.tsx / AdUnit.tsx | 광고 | 스크립트 주입, min-height CLS |
| RelocationClient.tsx | 이주 계산기 | 폼 + verdict 결과 |
| BrowseClient.tsx | 직업 브라우즈 | 카테고리 탭 + 검색 |

---

## 유틸리티 함수

### data-loader.ts (데이터 접근)

| 함수 | 반환 | 용도 |
|------|------|------|
| `getOccupations()` | Occupation[] | 전체 175개 |
| `getCountries()` | Country[] | 전체 42개 |
| `getOccupation(slug)` | Occupation? | slug으로 조회 |
| `getCountryBySlug(slug)` | Country? | URL slug으로 조회 |
| `getSalaryEntry(occ, country)` | SalaryEntry? | 직업+국가 연봉 |
| `getBigMacEntry(code)` | BigMacEntry? | 빅맥 가격 |
| `getCities()` | City[] | 전체 98개 |
| `getCitySalaryEntry(occ, city)` | CitySalaryEntry? | 직업+도시 연봉 |
| `getCitiesByCountry(code)` | City[] | 국가별 도시 |

### salary-calculator.ts (비즈니스 로직)

| 함수 | 반환 | 용도 |
|------|------|------|
| `calculateSalaryResult()` | SalaryResult | 전체 연봉 분석 |
| `calculateGlobalPercentile()` | number | 글로벌 퍼센타일 |
| `calculatePercentileDistribution()` | PercentileDistribution | p10/25/50/75/90 |
| `calculateRelocation()` | RelocationResult | 이주 verdict |
| `calculateCityPercentile()` | number | 도시 퍼센타일 |
| `getTopCitiesForOccupation()` | CityRanked[] | 도시 연봉 순위 |
| `pickRepresentativeCountries()` | CountryComparison[] | 대표 국가 3개 |

### format.ts (포맷)

| 함수 | 예시 |
|------|------|
| `formatCurrency(140000, "USD")` | "$140,000" |
| `formatPercentile(32)` | "Top 32%" |
| `toMonthly(140000)` | 11667 |
| `toHourly(140000)` | 67.31 |
| `formatUSDShort(140000)` | "$140K" |

---

## 타입 정의 (src/types/index.ts)

```typescript
interface Occupation {
  slug: string; title: string; category: string;
  baseUSA: number; sectorMultiplier: number;
}

interface Country {
  code: string; name: string; slug: string; flag: string;
  currency: string; currencySymbol: string;
  exchangeRate: number; oecdAvgWage: number; gdpPerCapita: number;
}

interface City {
  slug: string; name: string; countryCode: string;
  population: number; isCapital: boolean; isTechHub: boolean;
  colMultiplier: number;
}

interface SalaryEntry {
  occupationSlug: string; countryCode: string;
  estimatedSalary: number; pppAdjusted: number;
}

interface CitySalaryEntry extends SalaryEntry {
  citySlug: string; colAdjusted: number;
}

interface RelocationResult {
  verdict: "strong-yes" | "yes" | "neutral" | "no" | "strong-no";
  verdictReason: string;
  nominalChange: number; colAdjustedChange: number;
  // ... 기타 필드
}
```

---

## 비교 쌍 목록

### 국가 비교 40쌍

**US vs 18개국:**
KR, JP, DE, GB, FR, CH, AU, CA, IN, CN, SG, BR, NL, MX, PL, IL, IE, IT

**Non-US 22쌍:**
KR-JP, GB-DE, AU-CA, IN-CN, FR-DE, JP-DE, KR-IN, GB-FR, AU-GB, CA-GB, CH-DE, JP-AU, DE-NL, IN-SG, PL-DE, TR-DE, AU-NZ, ES-IT, GB-IE, CN-JP, BR-MX, IN-GB

### 도시 비교 25쌍

new-york-vs-london, new-york-vs-san-francisco, san-francisco-vs-seattle, new-york-vs-tokyo, london-vs-berlin, london-vs-paris, seoul-vs-tokyo, singapore-vs-tokyo, sydney-vs-melbourne, toronto-vs-vancouver, bangalore-vs-singapore, mumbai-vs-delhi, san-francisco-vs-london, zurich-vs-new-york, berlin-vs-amsterdam, new-york-vs-toronto, london-vs-sydney, san-francisco-vs-bangalore, tokyo-vs-shanghai, paris-vs-berlin, seoul-vs-singapore, munich-vs-berlin, boston-vs-new-york, toronto-vs-london, shanghai-vs-singapore

---

## 빌드 & 스크립트

```bash
npm run dev                              # 개발 서버 (localhost:3000)
npm run build                            # 프로덕션 빌드 (~22초, 2,812 SSG)
npm run start                            # 프로덕션 서버
npx tsc --noEmit                         # 타입 체크
node scripts/generate-city-salaries.mjs  # 도시 연봉 데이터 재생성
node scripts/generate-favicon.mjs        # 파비콘 재생성
```

---

## 파일 구조 요약

```
src/
├── app/                    # 34개 라우트 파일
│   ├── page.tsx            # 랜딩 (SalaryForm)
│   ├── result/             # 결과 (동적)
│   ├── salary/[occ]/       # 175 + 7,350 + 17,150 페이지
│   ├── compare/[occ]/      # 7,000 페이지 (40쌍)
│   ├── compare-cities/     # 4,375 페이지 (25쌍)
│   ├── rankings/           # 175 페이지
│   ├── relocate/           # 1 + 4,375 페이지
│   ├── cities/             # 1 + 98 페이지
│   ├── blog/               # 1 + 4 + 50 페이지
│   ├── browse/, countries/ # 브라우즈
│   ├── about/, privacy/    # 정적
│   └── api/og/             # Edge OG 이미지
├── components/             # 22개 컴포넌트
├── data/                   # 8개 데이터 파일 (JSON + TS)
├── lib/                    # 4개 유틸 (loader, calculator, format, ssg-config)
├── types/                  # 타입 정의
docs/                       # 운영 문서 (skill files)
scripts/                    # 데이터 생성 스크립트
public/data/                # TopoJSON (로컬)
```
