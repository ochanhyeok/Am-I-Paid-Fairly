/**
 * SSG 최적화 설정
 *
 * Vercel 무료 플랜 배포 크기 제한(75MB)을 초과하지 않기 위해,
 * 고트래픽 직업만 빌드 타임에 정적 생성하고 나머지는 on-demand ISR로 처리.
 *
 * SSG 확장 제한: 페이지당 평균 108KB (비압축), 2,812 SSG = 297MB → 압축 51MB.
 * TOP 20 시 ~94MB로 75MB 초과 → TOP 10 유지 필수.
 *
 * ISR Write 절감: 사이트맵에 포함할 직업을 TOP 30으로 제한하여
 * Google 크롤러가 트리거하는 ISR 생성을 37,950 → 6,900으로 82% 절감.
 */

// SSG: 빌드 타임 정적 생성 (10개 — 75MB 제한으로 확장 불가)
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

// 사이트맵: ISR 페이지 URL 포함 대상 (30개)
// SSG TOP 10 + 고검색량/고고용 직업 20개
// 나머지 145개 직업은 /browse, /salary/[occ], 내부 링크로 자연 발견
export const TOP_OCCUPATIONS_FOR_SITEMAP: string[] = [
  // --- SSG TOP 10 (빌드 타임 생성, ISR 소비 0) ---
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
  // --- 추가 20개 (ISR on-demand, 사이트맵으로 크롤러 유도) ---
  "mechanical-engineer",
  "civil-engineer",
  "electrical-engineer",
  "pharmacist",
  "dentist",
  "lawyer",
  "teacher",
  "marketing-manager",
  "financial-analyst",
  "graphic-designer",
  "web-developer",
  "product-manager",
  "project-manager",
  "physical-therapist",
  "electrician",
  "plumber",
  "surgeon",
  "psychologist",
  "police-officer",
  "firefighter",
];
