# Am I Paid Fairly — 유저 체류시간 & 이탈률 전략 (2026-02-19)

## 경쟁사 실제 전략 분석 + 전체 페이지 진단

---

## 1. 경쟁사가 실제로 하고 있는 것

### Glassdoor: "Know Your Worth" 개인화 앵커
- 유저가 직업/회사/위치/경력 입력 → ML로 개인 시장가치 산출
- **핵심**: "당신의 연봉은 X달러 가치" → 매주 재계산 → 재방문 이유 생성
- Know Your Worth 사용자가 평균 **$1,315/년 더 높은 연봉** (마케팅으로 활용)
- 연봉 범위를 **25th-75th 퍼센타일 수평 바**로 표시, 유저 위치 마커

### Levels.fyi: 탐색 루프 설계
- 회사별 레벨 매핑 (Google L5 = Facebook E5) → "Amazon은?" → "L6이면?" → 끝없는 탐색
- 박스플롯 + 산점도 시각화 → 테이블/차트 토글 → USD/INR 통화 전환 → 연간/월간 전환
- 모든 인터랙션 포인트가 새로운 질문을 생성

### Numbeo: 개인화된 비교
- "당신의 월급"을 입력 → "이 도시에서 같은 생활수준 유지하려면 $X,XXX 필요"
- 추상적 지수가 아닌 **개인 재정 답변**으로 변환
- 874,711명이 9.7M+ 가격 데이터 기여 (크라우드소싱 참여)

### Zillow: Similar Homes 캐러셀
- 딥러닝 임베딩 모델로 "비슷한 집" 추천 → 검색 없이 브라우징 루프
- Showcase 리스팅: **+79% 페이지뷰, +76% 저장, +91% 공유**
- "Offer Insights" 슬라이더 → 가격 조정 시 실시간 반응 (토글 패턴)

### PayScale: Progressive Disclosure
- 직업 → 교육 → 경력 → 위치 → 성과 순서로 한 단계씩 공개
- 각 토글이 새로운 연봉 데이터 공개 → 드립 정보 효과
- Career Path Explorer: "당신 같은 사람이 다음에 간 직업" → 경력 탐색 루프

### NerdWallet: Nudge 전략
- "더 많은 유저가 아닌, 더 참여하는 유저"에 집중
- 프로액티브 넛지: 관련 도구/계산기/콘텐츠로 안내
- 앱 로드 시간 12초→5초 → 리텐션 개선 (Amplitude 퍼널 최적화)

---

## 2. 업계 벤치마크 (데이터 기반)

| 지표 | 업계 평균 | 우리 현재 | 갭 |
|------|----------|----------|-----|
| 이탈률 (전 산업) | 44.04% | 85% | **-41%p** |
| 인터랙티브 콘텐츠 이탈률 감소 | -10~15%p | - | 적용 가능 |
| 내부 링크 이탈률 감소 | -20% | - | 일부 적용됨 |
| 게이미피케이션 체류시간 증가 | +100-150% | - | 미적용 |
| 게이미피케이션 소셜 공유 | +22% | - | 미적용 |
| 스크롤 깊이 (양호) | 60-80% | 추정 20-30% | **심각** |
| 유저 이탈 시점 | 10-20초 | 12초 | 일치 (유저가 1스크롤 만에 이탈) |

---

## 3. 전체 페이지 타입별 이탈률 진단

### 현재 측정된 페이지
| 페이지 | 이탈률 | 진단 |
|--------|--------|------|
| Rankings/Social Workers | **42.9%** | 양호 (바차트+PPP 역전 발견) |
| City/Bus Driver/Wellington | 77.8% | 높음 |
| Landing | 83.1% | 심각 |
| Rankings/SW Engineer | 83.3% | 심각 (같은 구조인데 왜?) |
| Rankings/Nurses | 81.8% | 높음 |
| Salary/Truck Driver | **91.7%** | 최악 |
| City/Vet Tech/Tokyo | **91.7%** | 최악 |

### 아직 측정 안 된 페이지 (구조 기반 추정)
| 페이지 | 추정 이탈률 | 근거 |
|--------|-----------|------|
| Result (폼 제출 후) | **20-35%** | 개인화 데이터, 높은 투자 심리 |
| Compare Countries | **15-25%** | 즉각적 승패 판정, 에디토리얼 심층 |
| Compare Cities | **20-30%** | 구체적 유스케이스, COL 비교 |
| Relocate | **25-35%** | 명확한 Verdict, 의사결정 도구 |
| Blog | **40-50%** | 긴 텍스트, TL;DR 없음 |
| Countries | **35-45%** | 참조 페이지, Top 10 비주얼 |
| Browse | **30-40%** | 카테고리 분류, 검색 기능 |

### 핵심 패턴: 이탈률이 낮은 페이지의 공통점

1. **즉각적 인사이트** (승패 판정, 퍼센타일, Verdict)
2. **다수의 탐색 경로** (8개+ 내부 링크)
3. **시각적 비교** (바차트, 컬러 코딩, 비교 바)
4. **내러티브 콘텐츠** (왜 그런지 설명)
5. **개인화** (유저가 입력한 데이터 기반)

### 핵심 패턴: 이탈률이 높은 페이지의 공통점

1. **정적 데이터 전시** (숫자만 보여주고 끝)
2. **탐색 경로 부재** (2-3개 링크)
3. **Above-fold에 인터랙션 없음** (보기만 하고 할 게 없음)
4. **개인화 없음** ("이 나라 평균" ≠ "당신의 위치")
5. **"그래서?" 답변 없음** (데이터는 보여주는데 의미는 안 알려줌)

---

## 4. 우리가 놓치고 있는 것 (경쟁사 대비)

### 4-1. "Your Position" 마커 (Glassdoor 핵심 패턴)
- **현재**: 국가 페이지에서 퍼센타일 숫자만 표시
- **경쟁사**: 연봉 범위 바 위에 유저 위치를 마커로 표시
- **효과**: 유저가 자신의 위치를 **시각적으로** 즉시 파악 → 체류시간 +20-30초

### 4-2. "What if" 토글 패턴 (PayScale/Zillow 핵심 패턴)
- **현재**: 하나의 시나리오만 보여줌
- **경쟁사**: PPP on/off 토글, 경력 슬라이더, 도시 전환 등 실시간 변경
- **효과**: 매 토글 = 새로운 인사이트 = 추가 체류시간

### 4-3. localStorage 기반 재방문 개인화 (NerdWallet 패턴)
- **현재**: 모든 방문이 처음부터 시작
- **경쟁사**: 이전 검색 기억 → "Welcome back! Your SW Eng salary in KR is still top 28%"
- **효과**: 재방문율 0.8% → 5%+ 가능

### 4-4. "Challenge a Friend" 게이미피케이션 (소셜 공유)
- **현재**: ShareCard 있지만 단순 링크 공유
- **경쟁사**: "I'm in the top 28%. Can you beat me?" + 브랜드 OG 이미지
- **효과**: 게이미피케이션 공유 콘텐츠 = 일반 대비 **12배 공유율**

### 4-5. "People Like You" 탐색 루프 (Levels.fyi/PayScale 패턴)
- **현재**: "Other Jobs" 링크만 있음
- **경쟁사**: "이 직업의 사람들이 다음으로 많이 본 직업: Data Scientist (45%)"
- **효과**: 세션당 페이지뷰 +0.5~1.0

---

## 5. 실행 가능한 개선 계획

### Tier 1: 즉시 구현 (High Impact, Low-Medium Effort)

#### T1-1. Result 페이지 Popular Comparisons 위치 상향
- 현재: 맵 아래에 위치 → 유저가 맵 로딩 중 이탈
- 변경: "Popular Comparisons"을 맵 위로 이동
- 예상 효과: Result 페이지 이탈률 -5%p

#### T1-2. Landing 페이지 Above-fold 사회적 증거
- 현재: H1 + 폼만 있음
- 추가: "Software Engineer in US: Top 8% globally" 같은 예시 결과 3개 표시
- 예상 효과: 폼 완성률 +15%, 이탈률 -10%p

#### T1-3. 블로그 TL;DR 박스
- 현재: 바로 본문 시작
- 추가: 페이지 상단에 핵심 발견 3줄 요약 박스
- 예상 효과: 블로그 이탈률 50% → 40%

#### T1-4. 모든 SEO 페이지 "People Also Compare" 섹션
- 현재: "Other Jobs" 텍스트 링크
- 변경: 카드 그리드로 "이 직업을 본 사람들이 비교한 국가" 3개 표시
- 예상 효과: 내부 링크 클릭률 +20%, 이탈률 -5%p

### Tier 2: 1-2주 내 구현 (High Impact, Medium Effort)

#### T2-1. Result 페이지 "What if" 토글 패널
- 토글: PPP 조정 on/off, "만약 [다른 나라]에서 일한다면?"
- PayScale 스타일 progressive disclosure
- 예상 효과: Result 이탈률 -10%p, 참여시간 +30초

#### T2-2. Salary Range 인터랙티브 바 + 유저 포지션 마커
- Glassdoor "Most Likely Range" 패턴 복제
- Country 페이지에 min-max 범위 바 + 유저 마커(localStorage에서 이전 입력값 사용)
- 예상 효과: 체류시간 +20초

#### T2-3. "Challenge a Friend" 공유 메커니즘
- Result 페이지: "I'm in the top 28%. Can you beat me?" + 프리필 URL
- OG 이미지에 퍼센타일 크게 표시
- 예상 효과: 소셜 유입 +50%

### Tier 3: 3-4주 내 구현 (Medium-High Impact, High Effort)

#### T3-1. localStorage 재방문 개인화
- 마지막 검색 기억 → 재방문 시 "Since you last checked: SW Eng salary in KR unchanged"
- 폼 프리필 + 개인화 대시보드
- 예상 효과: 재방문율 0.8% → 5%

#### T3-2. Career Path Explorer
- "SW Engineer가 다음으로 전환하는 직업: Sr. Engineer (45%), Engineering Manager (15%)"
- 각 경로에 연봉 데이터 링크
- 예상 효과: 세션당 페이지뷰 +0.5

#### T3-3. 크라우드소스 피드백 위젯
- "Does this match your experience?" 👍👎
- 실제 데이터로 쓰지 않아도 심리적 투자 효과 (이탈률 감소)
- 예상 효과: 참여시간 +10초, 이탈률 -5%p

---

## 6. 목표 KPI 로드맵

### 30일 후 (Tier 1 완료)
| 지표 | 현재 | 목표 |
|------|------|------|
| 평균 이탈률 | 85% | **70%** |
| 평균 참여시간 | 12초 | **25초** |
| 검색 CTR | 0.29% | **1.0%** |
| 세션당 페이지뷰 | ~1.1 | **1.5** |

### 60일 후 (Tier 1+2 완료)
| 지표 | 30일 후 | 목표 |
|------|---------|------|
| 평균 이탈률 | 70% | **55%** |
| 평균 참여시간 | 25초 | **40초** |
| 재방문율 | 0.8% | **3%** |
| 세션당 페이지뷰 | 1.5 | **2.0** |

### 90일 후 (Tier 1+2+3 완료)
| 지표 | 60일 후 | 목표 |
|------|---------|------|
| 평균 이탈률 | 55% | **45%** |
| 평균 참여시간 | 40초 | **55초** |
| 재방문율 | 3% | **5%** |
| 세션당 페이지뷰 | 2.0 | **2.5** |

---

## 7. 참고 소스

- Glassdoor Know Your Worth: glassdoor.com/blog/introducing-know-worth-glassdoor
- PayScale Harvard Case Study: d3.harvard.edu/platform-digit/submission/payscale-bringing-data-to-compensation
- Levels.fyi Algorithm: sidshome.wordpress.com/2019/12/13/decoding-the-algorithm-behind-levels-fyi-2
- Zillow Similar Homes: zillow.com/tech/embedding-similar-home-recommendation
- Zillow Showcase (+79% views): zillowgroup.com/news/zillow-showcase-brings-listings-to-life
- Numbeo Methodology: numbeo.com/common/motivation_and_methodology.jsp
- NerdWallet Amplitude Case Study: amplitude.com/case-studies/nerdwallet
- Internal Linking -20% Bounce Rate: jemsu.com/the-role-of-internal-linking-in-reducing-bounce-rate-a-2023-case-study
- Gamification +100-150% Engagement: amplifai.com/blog/gamification-statistics
- Progressive Disclosure: conversion-rate-experts.com/progressive-disclosure
- Bounce Rate Benchmarks 2025: causalfunnel.com/blog/average-bounce-rate-by-industry-2025-benchmarks
