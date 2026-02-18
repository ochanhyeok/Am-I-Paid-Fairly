# Am I Paid Fairly? - 글로벌 연봉 비교 플랫폼

> 당신의 연봉은 전 세계 같은 직업 대비 상위 몇 %일까?

**[amipaidfairly.com](https://amipaidfairly.com)**

42개국 175개 직업의 연봉을 비교하고, 글로벌 백분위를 확인하고, 다른 나라에서 같은 직업으로 얼마를 받을 수 있는지 알아보세요. 로그인 없이, 완전 무료.

---

## 주요 기능

### 연봉 비교
- 직업 + 국가 + 연봉 입력 → 글로벌 상위 몇 % 인지 즉시 확인
- 42개국 동일 직업 연봉을 세계 지도와 함께 비교
- PPP(구매력평가) 보정 + 빅맥 지수로 실질 구매력 비교

### 국가 비교 (40쌍 × 175직업 = 7,000페이지)
- US vs India, UK vs Germany, Korea vs Japan 등 40개 인기 비교 쌍
- 명목 연봉, PPP 보정, 빅맥 구매력 3중 비교

### 도시별 연봉 (98도시 × 175직업 = 17,150페이지)
- 뉴욕, 런던, 도쿄, 서울, 방갈로르 등 98개 글로벌 도시
- 생활비 보정(COL) 기반 실질 연봉 비교

### 도시 비교 (25쌍 × 175직업 = 4,375페이지)
- NYC vs London, SF vs Tokyo, Seoul vs Singapore 등

### Relocation Calculator
- 이직 시 연봉 변화 시뮬레이션 (25개 도시 쌍)
- 5단계 판정: Strong Yes / Yes / Neutral / No / Strong No
- COL 보정, PPP, 빅맥 지수 종합 분석

### 블로그 (50개)
- 국가별 연봉 가이드 (인도, 중국, 독일, 캐나다, 일본, 유럽 테크)
- 직종별 분석 (간호사, 의사, 교사, 변호사, 회계사, 파일럿, AI 엔지니어)
- 재정 가이드 (연봉 협상, 세금, PPP, 환율, 해외이직 재정 계획)
- 트렌드 (원격근무 연봉 조정, AI 영향, 성별 임금격차, 도시 추천)

### 에디토리얼 콘텐츠
- 42개국 country-insights 데이터 기반 국가별 고유 콘텐츠
- Compare 페이지: 연봉 차이 이유, 세금, 커리어, 문화, 생활비 (5섹션)
- Country 페이지: 직업 환경, 세금, 생활비, 핵심 산업 (4섹션)
- Rankings 페이지: 지역 분석, 연봉 요인, 구매력 (3섹션)

### 랭킹
- 175개 직업별 42개국 연봉 순위

---

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| Framework | Next.js 14 (App Router, SSG) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| 지도 | react-simple-maps (SVG Choropleth) |
| 차트 | Recharts |
| 애니메이션 | Framer Motion |
| 배포 | Vercel |
| 데이터 | JSON 정적 파일 (DB 없음) |
| Analytics | Google Analytics 4 |
| 광고 | Google AdSense (승인 대기 중) |

---

## 아키텍처

순수 SSG(정적 사이트 생성) 기반. 데이터베이스 없음.

```
데이터 소스 (BLS, OECD, BigMac Index, World Bank)
  ↓ 수동 큐레이션 + Node.js 스크립트
정적 JSON 데이터 (occupations, countries, salaries, cities, bigmac)
  ↓ Next.js generateStaticParams()
~2,802 SSG pre-built + ~37,950 on-demand ISR
  ↓ Vercel CDN
전 세계 Edge에서 서빙 (ISR: 첫 방문 시 자동 생성 + 캐싱)
```

---

## 페이지 구성 (~40,752 페이지)

| 페이지 타입 | 수량 |
|------------|------|
| 직업별 글로벌 (`/salary/[occ]`) | 175 |
| 직업+국가 (`/salary/[occ]/[country]`) | 7,350 |
| 직업+국가+도시 (`/salary/[occ]/[country]/[city]`) | 17,150 |
| 국가 비교 (`/compare/[occ]/[pair]`) | 7,000 |
| 도시 비교 (`/compare-cities/[occ]/[pair]`) | 4,375 |
| Relocation (`/relocate/[occ]/[pair]`) | 4,375 |
| 랭킹 (`/rankings/[occ]`) | 175 |
| 도시 브라우즈 (`/cities/[city]`) | 98 |
| 블로그 (`/blog/[slug]`) | 50 |
| 기타 (홈, browse, about 등) | ~21 |

> SSG 최적화: Vercel 75MB 배포 크기 제한으로 상위 10개 직업만 빌드타임 생성 (~2,802 SSG).
> 나머지는 on-demand ISR로 첫 방문 시 자동 생성. 사이트맵은 전체 40,752 URL 포함.

---

## 데이터 소스

| 소스 | 데이터 |
|------|--------|
| U.S. Bureau of Labor Statistics (BLS) | 직업별 기준 연봉 (미국) |
| OECD | 국가별 평균 임금 |
| World Bank | GDP per capita |
| The Economist 빅맥 지수 | PPP + 물가 비교 |
| Numbeo | 도시별 생활비 지수 (COL Multiplier) |

> 모든 연봉 데이터는 공식 데이터 기반 추정치입니다. 실제 연봉은 경력, 회사, 지역에 따라 다릅니다.

---

## 개발 환경

```bash
# 의존성 설치
npm install

# 개발 서버 (localhost:3000)
npm run dev

# 프로덕션 빌드 (~2,802 SSG + ~37,950 on-demand ISR, 총 ~40,752 페이지)
npm run build

# 도시 연봉 데이터 재생성
node scripts/generate-city-salaries.mjs

# 파비콘 재생성
node scripts/generate-favicon.mjs
```

---

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                          # 랜딩 페이지
│   ├── result/                           # 연봉 비교 결과
│   ├── salary/[occ]/                     # 직업별 글로벌 연봉
│   │   ├── [country]/                    # 직업+국가 상세
│   │   └── [country]/[city]/             # 직업+국가+도시 상세
│   ├── compare/[occ]/[pair]/             # 국가 비교 (US vs India 등)
│   ├── compare-cities/[occ]/[pair]/      # 도시 비교 (NYC vs London 등)
│   ├── relocate/                         # Relocation Calculator
│   ├── rankings/[occ]/                   # 직업별 글로벌 랭킹
│   ├── cities/                           # 도시 브라우즈
│   ├── blog/                             # 블로그
│   └── api/og/                           # OG Image 생성 (Edge)
├── components/                           # 공통 컴포넌트
├── data/                                 # 정적 JSON 데이터 + 블로그 + country-insights
├── lib/                                  # 데이터 로더 + 계산 로직 + SSG 설정
└── types/                                # TypeScript 타입 정의
```

---

## 보안

- CSP (Content Security Policy) — AdSense 호환
- HSTS, X-Frame-Options, X-Content-Type-Options 등 7개 보안 헤더
- TopoJSON: CDN → 로컬 호스팅 (XSS 방지)
- 모든 파라미터 URLSearchParams 새니타이징
- JSON-LD 구조화 데이터 새니타이징
- 이메일 난독화, noopener/noreferrer 외부 링크

---

## SEO

- 40,752 정적 페이지 전부 `generateMetadata` + canonical URL
- JSON-LD 구조화 데이터 (Organization, WebSite, WebApplication, FAQPage)
- OG Image 동적 생성 (`/api/og` Edge route)
- sitemap.xml 자동 생성
- robots.txt
- PWA manifest

---

## 라이선스

MIT

---

## 연락처

**Am I Paid Fairly?** — [amipaidfairly.com](https://amipaidfairly.com)
