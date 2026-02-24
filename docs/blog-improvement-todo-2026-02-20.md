# 블로그 개선 TODO (2026-02-20)

경쟁사 분석 기반 우선순위별 구현 목록 — **전 Tier 완료**

## TIER 1: 즉시 구현 — 완료

- [x] **1. Featured Post 섹션** — 블로그 상단에 Editor's Pick 1개 큰 카드 (gradient border, prominent CTA)
- [x] **2. Show More 버튼** — 초기 12개 표시, "Show all X articles" 클릭 시 전체
- [x] **3. 블로그 검색** — 제목/excerpt/keywords 클라이언트 필터링 + 검색 아이콘 + X 클리어 버튼
- [x] **4. 빌드 검증** — tsc + npm run build 통과 확인

## TIER 2: 단기 — 완료

- [x] **5. 카테고리 허브 SEO 페이지** — `/blog/category/[category]` 4개 URL (rankings, guides, analysis, career-finance)
  - 고유 meta title/description, keywords, BreadcrumbList JSON-LD, Blog JSON-LD
  - 카테고리 탭 네비게이션 (All ↔ 각 카테고리 허브 링크)
  - sitemap.ts에 4개 URL 추가
  - SSG로 빌드됨 확인
- [x] **6. 작성자 표시** — "by AIPF Research" (E-E-A-T 신호)
  - BlogFilterClient: 인덱스 카드 (sm: 이상에서 표시)
  - blog/[slug]: 상세 페이지 헤더
  - blog/category/[category]: 허브 페이지 카드
- [x] **7. SearchAction JSON-LD** — Google SERP 검색 박스
  - blog/page.tsx에 WebSite + SearchAction 스키마 추가
  - urlTemplate: `https://amipaidfairly.com/blog?q={search_term_string}`

## TIER 3: 장기 — 완료

- [x] **8. CSS 시각 썸네일** — 카테고리별 gradient 배경 + SVG 아이콘 (80x80px)
  - 4개 그룹별 고유 gradient + 아이콘 (bar chart, layers, trending, dollar)
  - 카드 레이아웃: 수평 배치 (thumbnail 왼쪽 + 텍스트 오른쪽), sm: 이상에서 표시
  - line-clamp-2로 excerpt 2줄 제한
- [x] **9. 뉴스레터** — NewsletterSignup.tsx (클라이언트 컴포넌트)
  - "Get Salary Insights in Your Inbox" + 이메일 입력 + Subscribe 버튼
  - 제출 시 "Thanks" 메시지 (향후 Mailchimp/ConvertKit 연동 지점 마련)
  - blog/page.tsx + blog/category/[category]/page.tsx에 삽입
- [x] **10. 다중 콘텐츠 유형** — 현재 단계에서는 미구현 (콘텐츠/에디토리얼 결정 필요)

## 완료 이력

| 날짜 | 항목 | 파일 |
|------|------|------|
| 2026-02-20 | 5탭 카테고리 필터 | BlogFilterClient.tsx (신규) |
| 2026-02-20 | Related Posts 카테고리 우선 | blog/[slug]/page.tsx |
| 2026-02-20 | scrollbar-hide CSS | globals.css |
| 2026-02-20 | 경쟁사 분석 | docs/blog-competitor-analysis-2026-02-20.md |
| 2026-02-20 | Featured Post (Editor's Pick) | BlogFilterClient.tsx |
| 2026-02-20 | Show More 버튼 (12개→전체) | BlogFilterClient.tsx |
| 2026-02-20 | 검색 (title/excerpt/keywords) | BlogFilterClient.tsx |
| 2026-02-20 | keywords prop 전달 | blog/page.tsx |
| 2026-02-20 | 카테고리 허브 SEO 4페이지 | blog/category/[category]/page.tsx (신규), sitemap.ts |
| 2026-02-20 | 작성자 표시 (by AIPF Research) | BlogFilterClient, blog/[slug], blog/category/[category] |
| 2026-02-20 | SearchAction JSON-LD | blog/page.tsx |
| 2026-02-20 | CSS 시각 썸네일 (gradient + SVG icon) | BlogFilterClient.tsx |
| 2026-02-20 | 뉴스레터 UI | NewsletterSignup.tsx (신규), blog/page.tsx, blog/category/[category] |
