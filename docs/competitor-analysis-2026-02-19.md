# Am I Paid Fairly — 경쟁사 종합 비교 분석 (2026-02-19)

## 분석 대상

| 경쟁사 | 월 트래픽 | DA | 강점 | 약점 |
|--------|----------|-----|------|------|
| **Glassdoor** | 57M | 91 | Give-to-Get 크라우드소싱, 회사별 데이터, Know Your Worth ML | 글로벌 비교 약함, 로그인 필수 |
| **PayScale** | 2.9M | 78 | Progressive Disclosure, Career Path, 250+ 변수 개인화 | US 중심, 무료 데이터 제한 |
| **Levels.fyi** | 3.5M | 72 | 레벨 매핑, 탐색 루프, Tech 특화, 커뮤니티 | Tech 직종만, 제한된 글로벌 |
| **Numbeo** | 4.2M | 82 | 생활비 세분화, 개인 급여 등가 계산, 150+ 통화 | 연봉 데이터 없음, UI 구식 |
| **SalaryExpert** | 800K | 65 | 70+ 국가, 5년 전망, 현지 통화, 보너스 데이터 | 사용자 데이터 없음 |
| **Salary.com** | 8.5M | 80 | 퍼센타일 분포표, 직급별 세분화(I~V), COL 계산기 | US 전용 |
| **Indeed** | 250M | 92 | 실제 채용공고 데이터, 만족도 평점, 회사별 데이터 | US 중심, 연봉 비교 목적이 아님 |
| **AIPF (우리)** | 0.3K | 8 | 42개국 글로벌 비교, 빅맥지수/PPP, 무료/무로그인 | 신생 도메인, 제한된 데이터 깊이 |

---

## 1. 기능별 상세 비교 매트릭스

### 1-1. 데이터 범위 & 깊이

| 기능 | AIPF | Glassdoor | PayScale | Levels.fyi | SalaryExpert | Salary.com | Indeed |
|------|------|-----------|----------|------------|-------------|------------|-------|
| 직업 수 | 175 | 16,000+ | 15,000+ | 1,500+ (Tech) | 5,000+ | 3,400+ | 15,000+ |
| 국가 수 | 42 | 20+ | 8+ | 10+ | 70+ | US만 | US만 |
| 도시 수 | 98 | 500+ | 500+ (US) | 1,500+ | 1,000+ | 300+ | 500+ |
| 경력별 세분화 | 없음 | 3단계 | 5단계 | 8~10레벨 | 2단계 | 5단계(I~V) | 3단계 |
| 회사별 데이터 | 없음 | 2.8M 회사 | 200+ | 1,500+ | 없음 | 없음 | 600M+ 데이터포인트 |
| 보너스/스톡 분리 | 없음 | 분리 (base+additional) | 분리 (base+bonus+commission) | 분리 (base+stock+bonus) | 분리 (base+bonus) | 분리 (base+TCC) | 분리 (salary+bonus) |
| PPP/구매력 비교 | **3중 (USD+PPP+BigMac)** | 없음 | 없음 | COL 토글(히트맵만) | 부분 | 없음 | 없음 |
| 세금 계산 | 없음 | 없음 | 없음 | 없음 | 없음 | 없음 | 없음 |
| 현지 통화 표시 | 있음 | 없음 | 있음 (US 도시만) | 있음 (INR 등) | 있음 | 없음 | 없음 |

### 1-2. 인터랙티브 기능 & UX

| 기능 | AIPF | Glassdoor | PayScale | Levels.fyi | Numbeo | SalaryExpert |
|------|------|-----------|----------|------------|--------|-------------|
| 연봉 입력 폼 | Landing+QuickCompare | Know Your Worth | Survey 10단계 | 없음 (열람만) | COL Calculator | Compensation Hub |
| What-if 시나리오 | CountryQuickNav/CityQuickNav | Salary Explorer (직업/위치/경력 변경) | 회사/학위/성별/위치 변경 | 레벨/회사 변경 | 도시+금액 개인화 | Relocation Assessor |
| 시각화 | 세계지도+바차트+퍼센타일바 | 벨커브+범위바+파이 | 퍼센타일 그래디언트+캐리어트리 | 박스플롯+산점도+히트맵 | 컬럼차트+테이블 | 라인차트(5년전망)+파이 |
| 기간 변환 | 없음 | 연간/월간/시급 | 없음 | 연간 | 없음 | 연간/시급 |
| 정렬/필터 | 없음 (정적) | 위치/경력/산업 | 도시/경력/스킬/고용주 | 회사/레벨/위치/경력 | 없음 | 없음 |
| 공유 기능 | **ShareCard+OG이미지** | 없음 | 없음 | 공유링크 | 없음 | PDF 내보내기 |
| 재방문 개인화 | 없음 | 주간 시장가치 재계산 | 완료 프로필 기반 | 알림 구독 | 없음 | 없음 |

### 1-3. SEO & 구조화 데이터

| 기능 | AIPF | Glassdoor | PayScale | Levels.fyi | Numbeo | SalaryExpert |
|------|------|-----------|----------|------------|--------|-------------|
| 총 페이지 수 | ~40K | 수백만 | 수백만 | ~50만 | ~5만 | ~20만 |
| JSON-LD 스키마 | FAQPage+BreadcrumbList+Organization+WebSite | Occupation+MonetaryAmountDistribution | OccupationAggregation+FAQ | Occupation+FAQ+Breadcrumb | 없음 | 미확인 |
| 프로그래매틱 SEO | 직업×국가×도시×비교 | 직업×도시×회사 | 직업×도시×경력×스킬×회사 | 직업×회사×레벨×위치 | 도시×카테고리 | 직업×국가×도시 |
| 내부 링크 밀도 | 중 (5-10개/페이지) | 높 (10+개/페이지) | 높 (50+개/페이지) | 높 (10+개/페이지) | 중 (5-10개) | 높 (20+개) |
| 블로그/콘텐츠 | 50개 | 수천 개 | 수백 개 | 수십 개 | 없음 | 수십 개 |

---

## 2. 경쟁사별 핵심 전략 분석

### 2-1. Glassdoor: "Give-to-Get" 크라우드소싱

**핵심 전략**: 유저가 자신의 연봉을 제출해야 다른 데이터를 볼 수 있음 → 데이터 플라이휠

- **Know Your Worth**: ML 알고리즘으로 개인 시장가치 산출, **주간 재계산** → 재방문 이유 생성
- **Most Likely Range**: 25~75 퍼센타일 범위를 수평 바로 표시, 유저 위치 마커
- **연봉 분해**: Base Pay + Additional Pay (보너스, 스톡, 커미션, 이익분배, 팁) 명확히 분리
- **산업별/회사별 비교**: Top Paying Industries, Top Paying Companies 섹션
- **도시별 페이지**: `/Salaries/{city-slug}-{job-slug}-salary-SRCH_...` → 수백만 페이지
- **Salary Explorer**: 직업/위치/경력/산업/회사규모 변경 시 실시간 급여 변화 표시
- **DA 91 + 520M 백링크**: 데이터 기반 콘텐츠로 백링크 대량 획득

**우리에게 적용 가능한 것**:
- ~~Give-to-Get~~ (불가: 유저 데이터 없음)
- 퍼센타일 범위 바 시각화 (적용 가능: 각 국가별 25th/75th 추정)
- 산업별/경력별 분해 (적용 가능: 데이터 확장 시)

### 2-2. PayScale: Progressive Disclosure + Career Path

**핵심 전략**: 단계적 정보 공개로 참여시간 극대화

- **Survey 플로우**: 직업→교육→스킬→위치→경력→보상→책임 순서로 한 단계씩 질문 → 각 단계마다 새 데이터 공개
- **MarketMatch 알고리즘**: 250+ 보상 변수 사용 (개발자는 프로그래밍 언어, 영업은 매출 수치 등 직업별 다른 변수)
- **Career Path Planner**: "당신 같은 사람이 5년 후 가는 직업" 트리 시각화 → 끊임없는 탐색 루프
- **3개 페이지 템플릿**: 직업+국가, 직업+도시, 고용주 → 수백만 페이지 (월 2.9M 오가닉)
- **내부 링크 전략**: 각 페이지에서 도시 50+, 경력 5단계, 스킬 100+, 고용주 200+, 관련 직업 10+ 링크
- **인도 8,000 페이지**: 국가별 프로그래매틱 SEO 확장

**우리에게 적용 가능한 것**:
- Career Path 시각화 (향후: 직업 전환 데이터 추가 시)
- 내부 링크 밀도 강화 (즉시: 각 페이지에 관련 페이지 링크 20+개)
- Progressive Disclosure 패턴 (즉시: 접는 섹션으로 정보 단계적 공개)

### 2-3. Levels.fyi: 탐색 루프 + 레벨 매핑

**핵심 전략**: 한 질문이 다음 질문을 생성하는 무한 탐색 루프

- **레벨 매핑**: Google L5 = Meta E5 = Amazon L6 → "다른 회사에서는?" 끝없는 탐색
- **Contribution Gating**: "5개 더 제출하면 이 데이터 공개됩니다" 진행 표시기
- **Swag 보상**: 데이터 기여자에게 굿즈 제공 → 게이미피케이션
- **Blurred Rows**: 테이블 데이터가 흐릿하게 보임 → 로그인/기여 유도
- **히트맵**: 미국 지도에 연봉을 컬러코딩, COL 토글로 보정 가능
- **채용 코칭**: 무료 데이터 → 호기심 → 협상 코칭 유료 서비스 ($15K+)

**우리에게 적용 가능한 것**:
- 탐색 루프 강화 (즉시: 직업→국가→비교→관련직업→처음으로)
- COL 토글 (적용 가능: PPP on/off 토글)
- 히트맵 시각화 (이미 ChoroplethMap 있음, 활용 강화)

### 2-4. Numbeo: 개인화된 생활비 등가 계산

**핵심 전략**: 추상적 지수를 개인적 금액으로 번역

- **Salary Equivalency**: "SF에서 $10,000이면 런던에서 $9,170.5 필요" → 가장 강력한 개인화
- **항목별 비교**: 달걀 $6.60 vs $2.30, 피트니스 $115.57/월 등 842개 항목
- **커뮤니티 기여**: "Do you live in San Francisco? Add data!" + 항목별 편집 버튼
- **30+ 스팸 필터**: 수동 데이터 3배 가중치, 거의 실시간 환율 업데이트
- **150+ 통화**: 모든 가격 즉시 통화 변환
- **다차원 품질**: 생활비 외에 범죄, 의료, 오염, 교통 지수 → 종합 도시 평가

**우리에게 적용 가능한 것**:
- 개인 급여 등가 계산 (이미 Relocate에서 부분 구현)
- 통화 변환 토글 (적용 가능: 현재 USD+현지 통화 표시 중)
- 데이터 신선도 표시 (이미 "Data last updated: February 2026" 구현)

### 2-5. SalaryExpert: 글로벌 + 미래 전망

**핵심 전략**: 70+ 국가 현지 통화 데이터 + 5년 전망

- **5년 급여 전망 그래프**: 라인 차트로 미래 연봉 성장률 표시 (경쟁사 중 유일)
- **교육 분포 파이차트**: "68%가 학사, 11%가 준학사"
- **보너스 분리**: 국가별 기본급 + 보너스 따로 표시 (한국: KRW 88M + 3.9M 보너스)
- **인근 도시 비교**: "서울은 국가 평균 대비 +4%"
- **PDF/Excel 내보내기**: 개인화 급여 보고서 다운로드 → 차별화 기능

**우리에게 적용 가능한 것**:
- 5년 급여 전망 (적용 가능: OECD 임금 성장률 데이터 활용)
- 보너스 분리 표시 (향후: 국가별 보너스 추정 데이터 추가)
- PDF 내보내기 (향후: 개인 급여 보고서 PDF 생성)

### 2-6. Salary.com: 퍼센타일 분포표

**핵심 전략**: 10th/25th/50th/75th/90th 퍼센타일 세분화

- **퍼센타일 분포표**: Base Salary와 Total Cash Compensation 각각 10th~90th 표시
- **직급 세분화**: Engineer I → II → III → IV → V 각각 별도 페이지 → 5배 페이지 수
- **기간 변환기**: 연간/월간/격주/주간/시급 전환 버튼
- **직업 설명**: "What Does a Software Engineer Do?" 장문 SEO 콘텐츠
- **주별 비교**: 50개 주 각각 급여 표시
- **COL 계산기**: 5개 카테고리(주거, 식품, 의료, 교통, 에너지)

**우리에게 적용 가능한 것**:
- 기간 변환기 (즉시: 연간→월간→시급 변환 버튼)
- 직업 설명 콘텐츠 (적용 가능: BLS 직업 설명 데이터 활용)
- 퍼센타일 분포 시각화 (적용 가능: 국가별 추정 분포)

---

## 3. 우리만의 차별점 (경쟁사에 없는 것)

| 차별점 | 설명 | 경쟁사 중 보유 |
|--------|------|--------------|
| **빅맥 지수 + PPP 3중 비교** | 명목 USD + PPP + Big Mac 동시 표시 | 0/7 |
| **인터랙티브 세계지도** | SVG Choropleth 컬러코딩 맵 | 0/7 (Levels.fyi 미국맵만) |
| **42개국 한 페이지 비교** | 동일 직업 42개국 나란히 비교 | 0/7 (경쟁사는 1개국씩) |
| **Relocation Verdict** | 5단계 이직 판정 (strong-yes ~ strong-no) | 0/7 |
| **완전 무료, 무로그인** | 모든 기능 로그인 없이 이용 | 0/7 (모두 일부 gating) |
| **동적 OG 이미지 + 공유카드** | 퍼센타일 포함 브랜드 이미지 | 0/7 |
| **국가별 에디토리얼 콘텐츠** | 42개국 경제/세금/문화 고유 텍스트 | SalaryExpert 부분 |
| **SSG 극한 속도** | CDN 정적 배포, 0초 서버 응답 | 0/7 (모두 동적 서버) |

---

## 4. 기능 갭 분석: 우리에게 없는 것

### 즉시 구현 가능 (Low Effort, High Impact)

| 기능 | 경쟁사 출처 | 구현 난이도 | 예상 효과 |
|------|-----------|-----------|----------|
| **기간 변환기** (연간/월간/시급) | Salary.com, Glassdoor | 낮음 | 참여시간 +5초, 인터랙션 +1 |
| **Occupation 스키마** (MonetaryAmountDistribution) | PayScale, Levels.fyi | 낮음 | SERP 리치 결과 가능 |
| **데이터 소스 강조** ("Based on OECD+BLS data") | Indeed | 낮음 | 신뢰도 향상 |
| **내부 링크 밀도 강화** (페이지당 20+개) | PayScale | 중간 | 이탈률 -5%p |

### 중기 구현 (Medium Effort, High Impact)

| 기능 | 경쟁사 출처 | 구현 난이도 | 예상 효과 |
|------|-----------|-----------|----------|
| **퍼센타일 분포 시각화** (10th/25th/50th/75th/90th) | Salary.com, Glassdoor | 중간 | 참여시간 +15초 |
| **PPP on/off 토글** | Levels.fyi heatmap | 중간 | 인터랙션 +2, 이탈률 -5%p |
| **직업 설명 콘텐츠** ("What does a SW Eng do?") | Salary.com, Indeed | 중간 | SEO 텍스트 +500단어/페이지 |
| **5년 급여 전망 차트** | SalaryExpert | 중간 | 차별화 콘텐츠 |
| **경력별 급여 추정** (entry/mid/senior) | Glassdoor, PayScale, Indeed | 높음 | 페이지 수 3× |

### 장기 구현 (High Effort, High Impact)

| 기능 | 경쟁사 출처 | 구현 난이도 | 예상 효과 |
|------|-----------|-----------|----------|
| **개인화 연봉 계산기** (경력+스킬+학력) | PayScale, Glassdoor | 높음 | 재방문률 +10%p |
| **Career Path 시각화** | PayScale, Levels.fyi | 높음 | 세션당 +0.5 페이지뷰 |
| **COL 카테고리 분해** (주거/식품/의료/교통) | Numbeo, Salary.com | 높음 | 새 SEO 랜딩 |
| **세금 계산기** (42개국 net salary) | Numbeo salary-calculator | 높음 | 강력한 차별화 |
| **유저 데이터 수집** (크라우드소싱) | Glassdoor, Numbeo | 매우 높음 | 데이터 플라이휠 |

---

## 5. 우선순위 실행 계획

### Phase 1: 즉시 (1주 이내)

1. **Occupation 스키마 추가**: `MonetaryAmountDistribution` + `estimatedSalary` JSON-LD
2. **기간 변환 버튼**: 연간/월간/시급 토글 (salary 3페이지)
3. **데이터 소스 배너 강화**: "Based on OECD, BLS, World Bank & Big Mac Index data"
4. **내부 링크 20+ 목표**: 각 salary 페이지에 관련 링크 추가

### Phase 2: 2~4주

5. **퍼센타일 분포 바**: 10th/25th/50th/75th/90th 수평 바 시각화
6. **PPP 토글**: 명목 급여 ↔ PPP 보정 토글 스위치
7. **"What does a [Job] do?" 섹션**: BLS 직업 설명 기반 SEO 콘텐츠 블록
8. **5년 급여 전망**: OECD 임금 성장률 × 현재 급여 라인 차트

### Phase 3: 1~2개월

9. **경력별 급여 추정**: entry(0.75×), mid(1.0×), senior(1.25×) 3단계
10. **Career Path 링크**: "이 직업에서 다음으로 많이 가는 직업 3개" (수동 매핑)
11. **COL 카테고리**: 국가별 주거/식품/교통/의료 비율 시각화
12. **세금 개요**: 42개국 소득세율 표시 (실효세율 추정)

---

## 6. 핵심 인사이트

### 경쟁사들의 공통 성공 패턴

1. **Hero Number**: 모든 경쟁사가 Above-the-fold에 큰 숫자 하나를 배치 (우리도 이미 함)
2. **프로그래매틱 SEO**: 직업×위치×차원 조합으로 수백만 페이지 생성 (우리 40K, 확장 필요)
3. **내부 링크 밀도**: 페이지당 10~50개 관련 링크 → 이탈률 감소 (우리 5~10개, 부족)
4. **데이터 투명성**: 샘플 수, 업데이트 날짜, 방법론 → 신뢰 구축 (우리 부분적)
5. **점진적 공개**: 기본 데이터 무료 → 심화 개인화 → 유료 전환 (우리는 전부 무료)

### 우리만의 승리 전략

우리는 경쟁사가 못하는 것에 집중해야 함:

1. **"글로벌 비교"가 핵심 USP**: Glassdoor/PayScale/Salary.com/Indeed는 모두 1개국 중심. 42개국을 한 페이지에서 비교하는 것은 우리만의 것
2. **PPP + Big Mac = 유일한 구매력 비교**: 경쟁사 누구도 하지 않음
3. **속도**: SSG + CDN = 서버 응답 0초. 경쟁사는 동적 서버로 2~5초
4. **무료/무로그인**: Glassdoor Give-to-Get, PayScale Survey, Levels.fyi Blur → 모두 게이팅. 우리는 완전 무료
5. **Relocation Verdict**: 5단계 이직 판정은 Numbeo보다 액셔너블

### 우리의 약점과 대응

| 약점 | 현실 | 대응 방안 |
|------|------|---------|
| DA 8 (경쟁사 65~92) | 도메인 에이징 필요, 단기 해결 불가 | 롱테일 키워드 집중 ("SW eng salary korea vs japan") |
| 직업 175개 (경쟁사 5K~16K) | 데이터 수동 큐레이션 한계 | 핵심 직업 심화, 나머지는 점진 확장 |
| 경력별 데이터 없음 | BLS 평균값만 사용 중 | 계수 기반 추정 (entry 0.75×, senior 1.25×) |
| 유저 데이터 없음 | 크라우드소싱 인프라 없음 | 장기 과제, 현재는 공식 데이터 신뢰도 강조 |
| 트래픽 300명/월 | 도메인 에이징 + SEO 시간 필요 | AI 검색(ChatGPT) 채널 적극 활용 (이미 8%) |

---

## 7. 참고 소스

### 경쟁사 직접 분석
- Glassdoor: glassdoor.com/Salaries/software-engineer-salary-SRCH_KO0,17.htm
- PayScale: payscale.com/research/US/Job=Software_Engineer/Salary
- Levels.fyi: levels.fyi/t/software-engineer, levels.fyi/companies/google/salaries/software-engineer
- Numbeo: numbeo.com/cost-of-living/in/San-Francisco, numbeo.com/cost-of-living/calculator.jsp
- SalaryExpert: salaryexpert.com/salary/job/software-engineer/united-states
- Salary.com: salary.com/research/salary/benchmark/software-engineer-i-salary
- Indeed: indeed.com/career/software-engineer/salaries

### SEO 분석
- Glassdoor SEO: buildd.co/marketing/glassdoor-seo-strategy (520M 백링크 분석)
- PayScale pSEO: practicalprogrammatic.com/examples/payscale (2.9M 트래픽 분석)
- PayScale upGrowth: insights.upgrowth.in/how-payscale-programmatic-seo-drives-over-1m-monthly-organic-traffic
- Google Occupation Schema: developers.google.com/search/docs/appearance/structured-data/estimated-salary

### 방법론
- Glassdoor Know Your Worth: media.glassdoor.com/knowyourworth/know-your-worth-employee-guide.pdf
- Glassdoor Give-to-Get: help.glassdoor.com/s/article/Give-to-get-policy
- PayScale MarketMatch: payscale.com/why-payscale/data-methodology
- Numbeo Methodology: numbeo.com/common/motivation_and_methodology.jsp
- PayScale Harvard Case Study: d3.harvard.edu/platform-digit/submission/payscale-bringing-data-to-compensation
