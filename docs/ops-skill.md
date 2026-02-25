# 운영 가이드 (배포 · ISR · AdSense · 모니터링)

최종 업데이트: 2026-02-23

---

## Vercel Hobby 플랜 한도

| 리소스 | 한도 | 현재 상태 | 리셋 |
|--------|------|-----------|------|
| Fast Origin Transfer | 10GB/월 | **300% 초과 (30GB)** → 일시 중지 | 매월 1일 |
| ISR Writes | 200K/월 | 초과 추정 | 매월 1일 |
| Deploy Size | 75MB (압축) | 51MB (여유 24MB) | — |
| Bandwidth | 100GB/월 | ~2GB | 매월 1일 |
| Build Time | 45분/빌드 | ~22초 | — |
| Serverless Execution | 100GB-Hrs | 미측정 | 매월 1일 |

**모든 한도는 매월 1일 0으로 완전 리셋 (이월 없음)**

---

## 배포 규칙

### 필수 규칙

1. **월 3-5회 이내 배포** (6,900 ISR × 5 = 34,500 writes, 예산의 17%)
2. **3월 1일 리셋 후 첫 배포** (현재 일시 중지 상태)
3. **변경사항 모아서 배치 배포** (기능 여러 개를 한 번에)
4. **긴급 배포는 보안 패치만 허용**

### 배포 전 체크리스트

```
□ 이번 달 배포 횟수 확인 (3-5회 미만?)
□ Vercel Dashboard → Usage → Fast Origin Transfer 잔여량 확인
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
| 대응 조치 | 에디토리얼 12개 섹션 + 블로그 50개 + country-insights |
| 2차 신청 | **대기 중** (사이트 복구 후 재신청) |

### AdSense 승인을 위한 요건

- ✅ 40,000+ 고유 페이지 (programmatic이지만 에디토리얼 포함)
- ✅ 50개 블로그 (수동 작성 콘텐츠)
- ✅ 42개국 country-insights (고유 경제/세금/문화 데이터)
- ✅ 보안 완비 (CSP, HSTS 등)
- ✅ Privacy Policy, Terms of Service
- ⚠️ 도메인 나이 < 6개월 (리스크)
- ⚠️ 트래픽 ~300명/월 (리스크)

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

### GA4 주요 지표 (2026-02-19 기준)

| 지표 | 28일 값 |
|------|--------|
| 유저 | 360 (실질 ~297, 봇 63) |
| 참여시간 | 12초 |
| 이탈률 | 83-92% |
| 페이지/세션 | 1.1 |

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

### 매월 1일

```
□ Vercel Usage 리셋 확인 (0으로 초기화)
□ 첫 배포 실행 (누적 변경사항)
□ GA4 월간 리포트 확인 (유저, 체류시간, 이탈률)
□ Search Console 월간 리포트 (인덱싱, 노출, 클릭)
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
3. 한도 초과면 → 다음 달 1일 리셋 대기 또는 Pro 업그레이드 ($20/월)
4. 빌드 실패면 → `rm -rf .next` 후 `npm run build` 재시도

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
