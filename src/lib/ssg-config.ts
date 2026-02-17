/**
 * SSG 최적화 설정
 *
 * Vercel 무료 플랜 배포 크기 제한(75MB)을 초과하지 않기 위해,
 * 고트래픽 직업만 빌드 타임에 정적 생성하고 나머지는 on-demand ISR로 처리.
 * 사이트맵은 여전히 모든 페이지 URL을 포함 → 검색엔진이 크롤링 시 자동 생성됨.
 */

// Search Console 고노출 + 인기 직업 상위 10개
// (Vercel 압축 후 75MB 미만 유지를 위해 10개로 제한)
export const TOP_OCCUPATIONS_FOR_SSG: string[] = [
  "software-engineer",
  "data-scientist",
  "nurse",
  "doctor",
  "accountant",
  "pilot",
  "chef",
  "veterinarian",
  "hvac-technician",
  "architect",
];
