# 성장 전략 가이드 (경쟁사 · 이탈률 · 콘텐츠)

최종 업데이트: 2026-02-23

---

## 경쟁사 포지셔닝

### 경쟁사 규모 비교

| 경쟁사 | DA | 월 트래픽 | 핵심 강점 | 우리와의 차이 |
|--------|-----|---------|----------|-------------|
| Indeed | 92 | 250M | 채용 + 연봉 | 채용 데이터 기반, 실제 구인 연동 |
| Glassdoor | 91 | 57M | 기업별 실제 연봉 | Give-to-Get 모델, 회사별 리뷰 |
| Numbeo | 82 | 4.2M | 생활비 비교 | COL 도시별 카테고리 분해 |
| Salary.com | 80 | 8.5M | 퍼센타일 분포 | 미국 중심, HR 타겟 |
| PayScale | 78 | 2.9M | 개인화 리포트 | Progressive Disclosure, 로그인 필수 |
| Levels.fyi | 72 | 3.5M | 테크 기업별 보상 | 주식/보너스 분해, TC 중심 |
| SalaryExpert | 65 | 800K | 글로벌 보고서 | 유료 리포트, B2B 타겟 |
| **AIPF (우리)** | **8** | **0.3K** | **글로벌 비교** | 아래 USP 참조 |

### 우리의 핵심 USP (경쟁사가 못하는 것)

1. **42개국 PPP + 빅맥 3중 비교** — 경쟁사 중 3가지 동시 제공하는 곳 없음
2. **무료 + 무로그인** — Glassdoor/PayScale는 로그인 강제
3. **40,000+ 페이지 SSG** — 경쟁사 대비 압도적 SEO 페이지 수
4. **Relocation Verdict** — "이 도시로 이사하면 이득인가?" 5단계 판정
5. **속도** — SSG/CDN으로 경쟁사(SPA) 대비 2-5배 빠름

### 경쟁사 대비 우리의 갭

| 기능 | 경쟁사 | 우리 | 상태 | 구현 난이도 |
|------|--------|------|------|-----------|
| 퍼센타일 분포 시각화 (바 차트) | Salary.com, PayScale | JSON-LD만 있음 | **미구현** | 중간 |
| PPP on/off 토글 | Numbeo | 없음 | **미구현** | 낮음 |
| 기간 변환기 (연/월/시급) | PayScale, Indeed | ✅ 구현 완료 | 완료 | — |
| Occupation JSON-LD | Salary.com | ✅ 구현 완료 | 완료 | — |
| 내부 링크 15+ | Glassdoor | ✅ 구현 완료 | 완료 | — |
| 경력별 연봉 (entry/mid/senior) | Glassdoor, Levels.fyi | 없음 | **미구현** | 높음 (데이터 필요) |
| 5년 전망 차트 | SalaryExpert | 없음 | **미구현** | 높음 (시계열 데이터 필요) |
| 세금 계산기 | SalaryExpert | 없음 | **미구현** | 높음 (42개국 세법) |
| 직업 설명/요구사항 | Indeed, Glassdoor | 없음 | **미구현** | 중간 (BLS 데이터) |
| COL 카테고리 분해 | Numbeo | colMultiplier만 | **미구현** | 중간 |

---

## 이탈률 분석 & 대응

### 현재 이탈률 (GA4, 2026-02-19)

| 페이지 타입 | 이탈률 | 상태 | 성공/실패 요인 |
|------------|--------|------|--------------|
| Rankings | 42.9% | 양호 | 바차트 시각화 + 다수 탐색 경로 |
| Blog | ~60% | 보통 | 콘텐츠 depth, 관련 포스트 |
| Landing | ~75% | 나쁨 | 폼 완료 전 이탈 |
| Salary/Country | 91.7% | 심각 | 정적 데이터만, 인터랙티브 없음 |
| City | 91.7% | 심각 | 같은 문제 |

**업계 평균**: 44% | **우리**: ~85% | **갭**: 41%p

### 구현 완료된 이탈률 대응

| 대응 | 적용 페이지 | 효과 |
|------|-----------|------|
| ✅ QuickCompareForm | salary 3페이지 | 인라인 비교 폼 (직업 프리필) |
| ✅ CSS 비교 바차트 | rankings, country, city | Rankings 성공 패턴 복제 |
| ✅ 메타에 연봉 숫자 | 5페이지 | CTR 개선 ($XX,XXX) |
| ✅ CityQuickNav/CountryQuickNav | country, city | "What if?" 드롭다운 |
| ✅ Similar Salary Countries | country 페이지 | 카드 3개 + 가로 스크롤 |
| ✅ AI 최적화 (tldr 메타) | 전체 | ChatGPT/Perplexity 대응 |
| ✅ Popular Comparisons | result, landing | 국가 6쌍 + 도시 3쌍 |
| ✅ Blog 크로스링크 | salary/[occ] ↔ blog | 양방향 연결 |

### 미구현 체류시간 전략 (Tier 2-3)

**Tier 2 (1-2주 소요)**

| 기능 | 효과 | 참고 경쟁사 |
|------|------|-----------|
| What-if 토글 (PPP on/off) | 인터랙티브 비교 | Numbeo |
| Salary Range 마커 (유저 위치 표시) | "Your Position" 시각화 | Glassdoor |
| Challenge a Friend (공유) | 소셜 바이럴 | — |

**Tier 3 (3-4주 소요)**

| 기능 | 효과 | 참고 경쟁사 |
|------|------|-----------|
| localStorage 재방문 | "이전 검색 결과" 표시 | PayScale |
| Career Path Explorer | 직업 간 연봉 비교 경로 | Levels.fyi |
| 피드백 위젯 | 유저 만족도 수집 | NerdWallet |

### 90일 KPI 목표

| 지표 | 현재 | 30일 | 60일 | 90일 |
|------|------|------|------|------|
| 이탈률 | 85% | 70% | 55% | 45% |
| 평균 체류시간 | 12초 | 25초 | 40초 | 55초 |
| 페이지/세션 | 1.1 | 1.5 | 2.0 | 2.5 |

---

## 콘텐츠 전략

### 블로그 현황 (50개)

| 카테고리 그룹 | 수 | 대표 토픽 |
|-------------|---|----------|
| Rankings | 9 | 국가별 Top 10, 직업별 글로벌 랭킹 |
| Guides | 16 | 독일/캐나다/일본 가이드, 이주, 원격근무 |
| Analysis | 13 | AI 영향, 환율, 트렌드, PPP 분석 |
| Career & Finance | 12 | 협상, 세금, 금융, 헬스케어, 교육 |

### 블로그 UX 기능

- ✅ 5탭 카테고리 필터 (All/Rankings/Guides/Analysis/Career&Finance)
- ✅ 검색 (제목/excerpt/keywords)
- ✅ Featured Post (Editor's Pick)
- ✅ Show More (12개 → 전체)
- ✅ CSS 시각 썸네일 (그룹별 gradient + SVG)
- ✅ 카테고리 허브 SEO 4페이지
- ✅ 작성자 표시 "by AIPF Research"
- ✅ SearchAction JSON-LD
- ✅ 뉴스레터 UI (Mailchimp 연동 미완)

### 콘텐츠 확장 후보

| 콘텐츠 | 예상 효과 | 난이도 |
|--------|----------|--------|
| 도시 가이드 10개 (NYC, London, Berlin, Seoul...) | 도시 SEO + 체류시간 | 중간 |
| "How Much Should You Earn?" 인터랙티브 퀴즈 | 바이럴 + 체류시간 | 높음 |
| 산업별 연봉 리포트 (Tech, Healthcare, Finance) | 롱테일 키워드 | 중간 |
| 뉴스레터 실제 연동 (Mailchimp/ConvertKit) | 리텐션 + 이메일 마케팅 | 낮음 |

---

## 트래픽 채널 분석

| 채널 | 비율 | 현황 | 전략 |
|------|------|------|------|
| Google 오가닉 | 24% | 순위 22위 평균 | 도메인 에이징 대기 + 콘텐츠 강화 |
| Direct | 60% | 봇 60%+ 포함 | 실질 10-15% |
| ChatGPT | 8% | 29명/28일 | AI 최적화 (tldr 메타, key answer) |
| Bing | 6% | 자연 유입 | 별도 대응 불필요 |
| 소셜 | 2% | 거의 없음 | 블로그 공유 유도 검토 |

### AI 검색 대응 (ChatGPT, Perplexity)

- ✅ key answer 요약문 (above-fold)
- ✅ tldr 메타 태그
- ✅ 구조화된 데이터 (JSON-LD)
- 향후: robots.txt에 AI 크롤러 정책 검토 (GPTBot, PerplexityBot)

---

## 미구현 기능 종합 로드맵

### 단기 (코드만으로 가능)

| 기능 | 파일 | 효과 |
|------|------|------|
| 퍼센타일 분포 바 차트 | salary/[occ], rankings | 시각화 + 체류시간 |
| PPP on/off 토글 | salary 페이지 | 인터랙티브 + Numbeo 갭 |
| 직업 설명 추가 | occupations.json + salary/[occ] | SEO 콘텐츠 |

### 중기 (데이터 확장 필요)

| 기능 | 필요한 데이터 | 효과 |
|------|-------------|------|
| 경력별 연봉 (entry/mid/senior) | BLS OEWS 경력 데이터 | 세분화 + 정확도 |
| COL 카테고리 분해 | Numbeo 카테고리별 데이터 | 도시 비교 심화 |
| 5년 전망 차트 | 시계열 연봉 데이터 | 미래 예측 컨텐츠 |

### 장기 (아키텍처 변경)

| 기능 | 변경 범위 | 효과 |
|------|----------|------|
| 실제 API 데이터 연동 | 데이터 파이프라인 전체 | 자동 업데이트 |
| 유저 연봉 제출 (크라우드소싱) | DB + 인증 필요 | 데이터 신뢰도 |
| 세금 계산기 | 42개국 세법 데이터 | 경쟁사 차별화 |
| Career Path Explorer | 직업 관계 그래프 데이터 | 체류시간 + 탐색 |
