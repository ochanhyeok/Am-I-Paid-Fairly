# 운영 가이드 (배포 · ISR · AdSense · 모니터링)

최종 업데이트: 2026-03-13

---

## Vercel Hobby 플랜 한도

### 빌링 주기

- **빌링 주기는 계정 생성일 기준** (매월 1일 아님!)
- 현재 빌링 주기: **1월 30일 ~ 3월 1일** (약 30일)
- 다음 빌링 주기: **3월 1일 ~ 3월 31일** (예상)

### 2026-02 사용량 실적 (1/30~3/1 빌링 주기)

| 리소스 | 한도 | 실제 사용량 | 초과율 | 비고 |
|--------|------|-----------|--------|------|
| ISR Writes | 200K | **881K** | 440% | 가장 심각 |
| ISR Reads | 1M | **2.5M** | 250% | |
| Edge Requests | 1M | **1.8M** | 180% | |
| Fast Origin Transfer | 10GB | **30.03GB** | 300% | |
| Fluid Compute Active CPU | 4h | **4h 47m** | 120% | |
| Deploy Size | 75MB (압축) | 51MB | 68% | 여유 있음 |
| Bandwidth | 100GB | ~2GB | 2% | 여유 있음 |
| Build Time | 45분/빌드 | ~22초 | — | 여유 있음 |

### Fair Use 블록 & 복구 이력

- **2026-02 중순**: Fair use 한도 초과로 **사이트 블록** (배포 불가)
- **2026-03-01**: Vercel 지원팀에 상황 설명 + 사이트맵 최적화(82% 절감) 공유
- **2026-03-01**: Vercel **30일 courtesy unblock** 승인 (한도 3x 임시 증가)
- **만료 예정**: ~2026-03-30 (30일 후 원래 한도 복귀)
- ⚠️ **Action Required**: Vercel Dashboard에 billing address 입력 필요

### 3x 임시 한도 (courtesy unblock 기간)

| 리소스 | 기본 한도 | 임시 한도 (3x) |
|--------|----------|---------------|
| ISR Writes | 200K | 600K |
| ISR Reads | 1M | 3M |
| Edge Requests | 1M | 3M |
| Fast Origin Transfer | 10GB | 30GB |

---

## 배포 규칙

### 필수 규칙

1. **월 1-2회 이내 배포** (6,900 ISR × 2 = 13,800 writes, 한도 대비 7%)
2. **변경사항 최대한 모아서 배치 배포** (기능 여러 개를 한 번에)
3. **긴급 배포는 보안 패치만 허용**
4. **배포 전 반드시 Vercel Usage 확인** (3x 한도 초과 시 재차 블록 위험)
5. **2026-03-30 이후**: 3x 한도 종료 → 기본 한도 복귀, 더욱 보수적 운영 필요

### 배포 전 체크리스트

```
□ 이번 빌링 주기 배포 횟수 확인 (1-2회 미만?)
□ Vercel Dashboard → Usage → 전체 리소스 사용률 확인
□ 로컬에서 npm run build 성공 확인
□ npx tsc --noEmit 에러 없음 확인
□ Deploy Size ~51MB 범위 확인
□ 다음 배포까지 추가 변경 없을 것 확인
```

### 배포 후 체크리스트

```
□ Vercel Dashboard → Deployments → 성공 확인
□ amipaidfairly.com 접속 확인
□ 주요 페이지 3개 이상 정상 로딩 확인
□ Search Console → 사이트맵 재제출 (변경 시에만)
```

---

## ISR 최적화 현황

### ISR revalidate 최적화 (2026-03-05 적용)

- 10개 ISR 라우트에 `export const revalidate = false` 추가 → 영구 캐시
- OG 이미지 `Cache-Control: public, max-age=31536000, immutable` 추가
- 데이터가 정적 JSON이므로 재검증 불필요 → CPU + ISR Writes 절감

### 사이트맵 필터링 (2026-02-22 적용)

```
변경 전: 40,762 URL → 37,950 ISR → 배포당 ~4.1GB Origin Transfer
변경 후:  7,413 URL →  6,900 ISR → 배포당 ~0.75GB Origin Transfer
절감: 82%
```

### 파일 구조

| 파일 | 역할 |
|------|------|
| `src/lib/ssg-config.ts` | TOP 10 SSG + TOP 30 사이트맵 목록 |
| `src/app/sitemap.ts` | ISR 라우트에 `sitemapOccupations` 필터 적용 |

### SSG 확장 제한

```
페이지당 평균: 108KB (비압축)
현재 SSG: 2,812 pages → 297MB → 압축 51MB
TOP 15: +1,150 pages → 압축 ~72MB → 위험 (96%)
TOP 20: +2,300 pages → 압축 ~94MB → 초과!

결론: TOP 10 SSG 유지 필수. 확장 불가.
```

---

## Google AdSense

### 현재 상태

| 항목 | 상태 |
|------|------|
| 계정 | `ca-pub-2403565022366483` |
| ads.txt | 설정 완료 |
| CSP 호환 | 완료 (adtrafficquality 포함) |
| 1차 신청 | **거절** (2026-02: "가치가 별로 없는 콘텐츠") |
| 대응 조치 (1차) | 에디토리얼 12개 섹션 + 블로그 50개 + country-insights |
| 2차 신청 | **거절** (2026-03-01: 동일 사유) |
| 대응 조치 (2차) | About 전면 개편 (E-E-A-T) + 저자 실명화 + 케이스스터디 3개 |
| 3차 신청 | **대기** (2026-03-13 대응 완료, 재신청 예정) |

### AdSense 승인을 위한 요건

- ✅ 40,000+ 고유 페이지 (programmatic이지만 에디토리얼 포함)
- ✅ 53개 블로그 (수동 작성 콘텐츠, 케이스스터디 3개 포함)
- ✅ 42개국 country-insights (고유 경제/세금/문화 데이터)
- ✅ 보안 완비 (CSP, HSTS 등)
- ✅ Privacy Policy, Terms of Service
- ⚠️ 도메인 나이 < 6개월 (리스크)
- ⚠️ 트래픽 ~690명/월 (여전히 적은 편)

### AdUnit 구현

| 컴포넌트 | 위치 | CLS 대응 |
|---------|------|---------|
| `AdSense.tsx` | layout.tsx 스크립트 주입 | — |
| `AdUnit.tsx` | salary, compare 페이지 | 포맷별 min-height |

---

## Google Analytics (GA4)

| 항목 | 값 |
|------|---|
| 측정 ID | `G-Y9Q9SEW7T6` |
| env 변수 | `NEXT_PUBLIC_GA_ID` |
| 컴포넌트 | `GoogleAnalytics.tsx` |
| ID 검증 | `/^G-[A-Z0-9]{6,12}$/` |
| 로드 전략 | `afterInteractive` |

### GA4 주요 지표 추이

| 지표 | 1월 (1/21~2/17) | 2월 (2/1~2/28) | 최신 (2/4~3/3) | 추세 |
|------|----------------|----------------|----------------|------|
| 활성 사용자 | 360 | 690 | **837** | 우상향 |
| 새 사용자 | ~350 | 680 | **828** | 우상향 |
| 참여시간 | 12초 | 17초 | **16초** | 유지 |
| 재방문자 | ~10 | ~10 | **22** | 소폭 개선 |
| 이벤트 수 | — | 2,700 | **3,256** | 우상향 |

### 채널별 품질 비교 (2/4~3/3)

| 채널 | 사용자 | 비율 | 참여시간 | 재방문 | 세션/유저 |
|------|--------|------|---------|--------|----------|
| Direct | 493 | 58.9% | **8초** | 2명 | 0.07 |
| Organic Search | 272 | 32.5% | **30초** | 17명 | 0.53 |
| Unassigned | 51 | 6.1% | 12초 | 0명 | 0.22 |
| Referral (ChatGPT 등) | 25 | 3.0% | **41초** | 3명 | 0.44 |
| Organic Social | 2 | 0.2% | 4초 | 0명 | 0.50 |

**핵심**: Organic Search(30초) + Referral(41초)이 고품질, Direct(8초)는 대부분 봇

### 봇 트래픽 대응 (2026-03-13)

**문제**: Direct 트래픽 58%(493명) 중 대부분 봇 (참여시간 8초, 재방문 2명)
→ Vercel ISR Write/Edge Request 한도 소진 가속

**대응**: `src/app/robots.ts` 강화
- **Googlebot, Bingbot**: 명시적 허용 (검색 엔진 우선)
- **악성 봇 26개 UA 차단**: AhrefsBot, SemrushBot, MJ12bot, DotBot, BLEXBot, Bytespider, PetalBot, Scrapy, CCBot, GPTBot, ClaudeBot, Amazonbot 등
- **기타 UA**: `Crawl-delay: 10` (10초 간격 제한)
- **참고**: robots.txt는 권고 사항이므로 악성 봇이 무시할 수 있음. Vercel WAF(유료) 필요 시 별도 검토

### 재방문율

- 재방문 22명 중 17명(77%)이 Organic Search — 검색 유입 유저가 재방문 핵심
- 2/22~3/1 Vercel 블록으로 트래픽 급감, 3/1 이후 회복 중

---

## 도메인 & DNS

| 항목 | 값 |
|------|---|
| Primary 도메인 | `amipaidfairly.com` |
| www 리다이렉트 | 308 → `amipaidfairly.com` |
| Vercel URL | `am-i-paid-fairly.vercel.app` |
| DNS | Vercel Nameservers |
| SSL | Vercel 자동 (Let's Encrypt) |
| HSTS | max-age=63072000, preload |

---

## 보안 헤더 현황

| 헤더 | 값 | 설정 파일 |
|------|---|---------|
| Content-Security-Policy | script-src 'self' 'unsafe-inline' 'unsafe-eval' + Google | next.config.mjs |
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload | next.config.mjs |
| X-Frame-Options | DENY | next.config.mjs |
| X-Content-Type-Options | nosniff | next.config.mjs |
| Referrer-Policy | strict-origin-when-cross-origin | next.config.mjs |
| Permissions-Policy | camera=(), microphone=(), geolocation=() | next.config.mjs |
| X-DNS-Prefetch-Control | on | next.config.mjs |

### CSP 허용 도메인

```
script-src: 'self', 'unsafe-inline', 'unsafe-eval',
  googletagmanager.com, google-analytics.com, googlesyndication.com,
  adtrafficquality.google, googleads.g.doubleclick.net
img-src: 'self', data:, blob:, *.google.com, *.gstatic.com
font-src: 'self', fonts.gstatic.com
connect-src: 'self', *.google-analytics.com, *.analytics.google.com,
  *.googlesyndication.com, adtrafficquality.google
frame-src: googlesyndication.com, googleads.g.doubleclick.net, tpc.googlesyndication.com
```

---

## 월간 모니터링 체크리스트

### 매주

```
□ Vercel Dashboard → Usage (Fast Origin Transfer, ISR Writes)
□ amipaidfairly.com 정상 접속 확인
```

### 빌링 주기 시작 시 (현재: 매월 ~30일)

```
□ Vercel Usage 리셋 확인 (0으로 초기화)
□ 첫 배포 실행 (누적 변경사항)
□ GA4 월간 리포트 확인 (유저, 체류시간, 이탈률)
□ Search Console 월간 리포트 (인덱싱, 노출, 클릭)
□ 3x 한도 만료 여부 확인 (~2026-03-30)
```

### 분기별

```
□ npm audit (의존성 보안 점검)
□ Next.js 버전 확인 (보안 패치)
□ AdSense 재신청 검토 (트래픽/도메인 나이 충족 시)
□ 경쟁사 변화 모니터링
```

---

## 비상 대응

### 사이트 다운 시

1. Vercel Dashboard → Deployments 확인
2. Usage 한도 초과 여부 확인
3. 한도 초과면 → 빌링 주기 리셋 대기 또는 Pro 업그레이드 ($20/월)
4. Fair use 블록 재발 시 → Vercel 지원팀 연락 (이전 사례: courtesy unblock 성공)
5. 빌드 실패면 → `rm -rf .next` 후 `npm run build` 재시도

### 빌드 실패 시

```bash
rm -rf .next        # 캐시 삭제
npm run build       # 재빌드 (~22초)
```
- `.next` 캐시 손상 시 500.html rename ENOENT 에러 발생
- 정상 빌드: ~22초, 캐시 손상: 2분+ 후 실패

### Pro 업그레이드 기준

| 조건 | 기준 |
|------|------|
| AdSense 수익 > $20/월 | 수익으로 충당 가능 |
| 트래픽 > 10K/월 | Free tier 한도 근접 |
| 배포 빈도 > 10회/월 | ISR 예산 부족 |
