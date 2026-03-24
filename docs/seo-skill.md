# SEO 운영 가이드

최종 업데이트: 2026-03-13

## 현재 SEO 점수

| 항목 | 점수 | 상태 |
|------|------|------|
| 기술 SEO | 9.2/10 | 메타/스키마/캐노니컬 완비 |
| 콘텐츠 SEO | 8.5/10 | 53개 블로그 + 에디토리얼 섹션 + E-E-A-T (실명 저자) |
| 성능 | 9.0/10 | SSG/ISR, Edge OG |
| 인덱싱 | 4/10 | 노출 28,922 / 쿼리 7,360개 (인덱싱 급속 확산 중) |

---

## 메타데이터 커버리지

### 완전 구현 (메타 + 캐노니컬 + OG)

| 페이지 | 수량 | 메타 타이틀 | 설명 | OG | 캐노니컬 |
|--------|------|------------|------|-----|---------|
| `/salary/[occ]` | 175 | ✅ 60자 | ✅ 연봉 수치 포함 | ✅ | ✅ |
| `/salary/[occ]/[country]` | 7,350 | ✅ | ✅ | ✅ | ✅ |
| `/salary/[occ]/[country]/[city]` | 17,150 | ✅ | ✅ | ✅ | ✅ |
| `/compare/[occ]/[pair]` | 7,000 | ✅ | ✅ | ✅ | ✅ |
| `/compare-cities/[occ]/[pair]` | 4,375 | ✅ | ✅ | ✅ | ✅ |
| `/rankings/[occ]` | 175 | ✅ | ✅ | ✅ | ✅ |
| `/relocate/[occ]/[pair]` | 4,375 | ✅ | ✅ | ✅ | ✅ |
| `/blog/[slug]` | 53 | ✅ | ✅ | ✅ | ✅ |
| `/blog/category/[cat]` | 4 | ✅ | ✅ | — | ✅ |
| `/cities/[city]` | 98 | ✅ | ✅ | — | ✅ |
| `/browse`, `/countries`, `/cities` | 3 | ✅ | ✅ | — | ✅ |
| `/about`, `/privacy`, `/terms` | 3 | ✅ | ✅ | — | — |
| `/result` | 1 | ✅ | ✅ (noindex) | ✅ | — |
| `/relocate` (인터랙티브) | 1 | ✅ | ✅ | ✅ | ✅ |

### OG 이미지 미설정 (갭)

- `/cities/[city]` — 98개 도시 페이지
- `/browse`, `/countries`, `/cities` — 브라우즈 페이지 3개
- `/blog/category/[cat]` — 카테고리 허브 4개

---

## JSON-LD 스키마 커버리지

### 구현 완료

| 스키마 | 적용 페이지 | 내용 |
|--------|-----------|------|
| **Organization** | `/` (홈) | name, logo, sameAs, url |
| **WebSite** | `/` (홈) | name, url |
| **WebApplication** | `/` (홈) | 앱 정보, offers: Free |
| **FAQPage** | salary/[occ], salary/[occ]/[country], compare, blog/[slug] | 직업별/국가별 고유 Q&A |
| **BlogPosting** | `/blog/[slug]` | headline, datePublished, author (Person) |
| **Blog** | `/blog`, `/blog/category/[cat]` | blogPost 목록 |
| **BreadcrumbList** | compare-cities, relocate, blog/category | 4단계 경로 |
| **SearchAction** | `/blog` | WebSite + urlTemplate |
| **MonetaryAmountDistribution** | salary/[occ], salary/[occ]/[country] | p10/25/median/75/90 |

### 미구현 스키마 (갭)

| 스키마 | 대상 페이지 | 효과 | 난이도 |
|--------|-----------|------|--------|
| **BreadcrumbList** | salary/[occ]/[country]/[city] | SERP 경로 표시 | 낮음 |
| **Place** | cities/[city] | 도시 리치 결과 | 중간 |
| **Article** | blog/[slug] (명시적 JSON-LD) | 뉴스 캐러셀 | 낮음 |
| **ItemList** | rankings/[occ] | 순위 리치 결과 | 중간 |

---

## 사이트맵 전략

### 현재 (2026-02-22 최적화 후)

```
전체 페이지: ~40,762
사이트맵 URL: 7,413 (TOP 30 직업만 ISR 라우트 포함)
SSG 페이지: 2,812 (TOP 10 직업 빌드타임 생성)
```

| 라우트 | 사이트맵 포함 | ISR 트리거 |
|--------|-------------|-----------|
| `/salary/[occ]` | 175개 전부 (SSG) | 없음 |
| `/rankings/[occ]` | 175개 전부 (SSG) | 없음 |
| `/salary/[occ]/[country]` | TOP 30 × 42 = 1,260 | 20개 직업 ISR |
| `/salary/[occ]/[country]/[city]` | TOP 30 × 98 = 2,940 | 20개 직업 ISR |
| `/compare/[occ]/[pair]` | TOP 30 × 40 = 1,200 | 20개 직업 ISR |
| 나머지 145개 직업 | 사이트맵 제외 | `/browse` 내부 링크 발견 |

### 사이트맵 확장 기준

ISR Write 예산에 여유가 있으면 (월 34,500 → 200K):
- TOP 50 확장: 7,413 → ~12,300 URL (예산의 18%)
- TOP 100 확장: ~24,600 URL (예산의 37%)
- 전체 175: ~40,762 URL (예산의 61%) — 월 3회 배포 기준

---

## 내부 링크 밀도

| 페이지 | 내부 링크 수 | 유형 |
|--------|------------|------|
| compare/[occ]/[pair] | 15+ | 관련 비교쌍 + 관련 직업 + 도시 비교 + 블로그 |
| rankings/[occ] | 15+ | 관련 랭킹 + 도시 탐색 + 관련 블로그 |
| compare-cities/[occ]/[pair] | 12+ | 도시 비교 + 관련 직업 + Relocate 링크 |
| salary/[occ] | 10+ | 국가 테이블 + 관련 블로그 + Popular Comparisons |
| blog/[slug] | 5+ | salary/rankings/relocate CTA + Related Posts |

---

## 에디토리얼 콘텐츠 현황

| 페이지 | 에디토리얼 섹션 | 데이터 소스 |
|--------|--------------|-----------|
| Compare (국가 비교) | 5개: 연봉 차이 이유, 세금, 커리어, 문화, 생활비 | country-insights.ts |
| Country (직업+국가) | 4개: 직업 환경, 세금, 생활비, 핵심 산업 | country-insights.ts |
| Rankings (글로벌 랭킹) | 3개: 지역 분석, 연봉 요인, 구매력 | country-insights.ts |
| Blog | 53개 포스트: 6~12분 읽기 (실명 저자 + 프로필 박스) | blog-posts.ts |

---

## Google Search Console 현황

### 지표 추이

| 지표 | 1월 (1/21~2/17) | 최신 (2/4~3/3) | 변화 | 목표 |
|------|----------------|----------------|------|------|
| 노출 | 3,465 | **28,922** | +735% | 50,000+ |
| 클릭 | 10 | **42** | +320% | 100+ |
| CTR | 0.29% | **0.15%** | -0.14%p | 2%+ |
| 평균 순위 | 22위 | **19.86위** | +2.1 | 15위 이하 |
| 고유 쿼리 | 1,462 | **7,360** | +403% | — |

### 상위 검색어 (클릭 기준, 2/4~3/3)

| 쿼리 | 클릭 | 노출 | CTR | 순위 |
|------|------|------|-----|------|
| am i paid fairly (브랜드) | 6 | 38 | 15.79% | **6.84** |
| ai engineering salary | 1 | 2 | 50% | **9.00** |
| air traffic controller salary | 1 | 25 | 4% | 20.84 |
| art director yearly salary | 1 | 1 | 100% | **5.00** |
| australia nurse salary vs uk | 1 | 13 | 7.69% | 11.15 |
| bartender salary in japan | 1 | 13 | 7.69% | **7.00** |
| costa rica doctor salary | 1 | 7 | 14.29% | **5.71** |
| costa rica salary for software engineer | 1 | 6 | 16.67% | **9.33** |

**1페이지 진입 쿼리 (순위 1~10)**: 6개+ — 도메인 에이징 진행 시 추가 상승 기대

### CTR 개선 과제

- 노출 8배 증가했지만 CTR은 0.29%→0.15%로 하락
- 원인: 순위 11~20위 페이지(2페이지)가 대량 노출 → 클릭 전환 낮음
- 대응: 순위 상승(도메인 에이징) + 메타 디스크립션에 연봉 숫자/USP 강조

---

## SEO 액션 아이템

### 즉시 (코드 변경)

- [ ] BreadcrumbList → salary/[occ]/[country]/[city] 추가
- [ ] OG 이미지 → cities/[city], browse 페이지 추가
- [ ] Article JSON-LD → blog/[slug] 명시적 추가

### 모니터링 (월간)

- [ ] Search Console: 노출/클릭/CTR 추적 (28,922노출/42클릭/0.15%)
- [ ] Search Console: 1페이지 진입 쿼리 수 추적 (현재 6개+)
- [ ] GA4: 랜딩 페이지별 이탈률 추적
- [ ] 사이트맵 확장 가능 여부 (ISR 예산 확인 후)

### 장기 (콘텐츠)

- [ ] 블로그 occupationSlug 커버리지 확대 (30/52 → 40+)
- [ ] 도시 페이지 에디토리얼 콘텐츠 추가 (현재 없음)
- [ ] FAQ 다양화 지속 (도시 페이지용 FAQ 추가)
