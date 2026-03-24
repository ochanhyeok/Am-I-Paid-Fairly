# 사이트 개선 체크리스트 (2026-03-01)

## Phase 1: 디자인 통일
- [x] 1-A: 포커스 링 & border 통일 — QuickCompareForm, CityQuickNav, CountryQuickNav, NewsletterSignup, ResultClient (emerald→accent-blue, slate-700→dark-border)
- [x] 1-B: 퍼센타일 임계값 통일 — ResultCard(50/30→70/40), salary/[country](50/30→70/40), salary/[city](50/30→70/40). CountryMiniCards, CountryComparison 이미 70/40 확인
- [x] 1-C: QuickCompare/QuickNav 배경색 통일 — bg-slate-800→bg-dark-card (1-A와 동시 처리)
- [x] 1-D: 임의 텍스트 크기 정리 — text-[9px]/[10px]/[11px]→text-xs: Footer, cities/page, ResultClient, salary/[country], salary/[city], salary/[occ], CountryComparison, CountryCombobox, CityCombobox, blog/[slug]

## Phase 2: UX 수정
- [x] 2-A: Combobox 포커스 동작 수정 — setQuery("")→inputRef.select(), isSelectedText로 popular 리스트 유지
- [x] 2-B: Header 모바일 Rankings 노출 — hidden sm:block 제거
- [x] 2-C: Salary 페이지 Breadcrumb — salary/[occ](기존 유지), salary/[country](back link→breadcrumb), salary/[city](Home 추가)

## Phase 3: 블로그 & 콘텐츠
- [x] 3-A: 블로그 공유 버튼 — BlogShareButtons.tsx (X/LinkedIn/Copy Link), blog/[slug]/page.tsx에 연동
- [x] 3-B: 도시 페이지 콘텐츠 보강 — Top 5 Jobs 바차트, COL Multiplier 시각화, Relocate CTA

## 최종 검증
- [x] tsc --noEmit 통과
- [x] npm run build 통과 (2823 pages)
- [x] 체크리스트 업데이트
