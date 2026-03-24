# AdSense 3차 재심사 대응 계획 (2026-03-13)

## 거절 사유: "가치가 별로 없는 콘텐츠" (Low-Value Content)
## 핵심 진단: E-E-A-T 부재 + 프로그래매틱 콘텐츠 인식

---

## Task 1: About 페이지 전면 개편 ✅
- [x] 1-1. 창립자 스토리 섹션 ("Why I Built This")
- [x] 1-2. 창립자 프로필 (이름, 배경, 프로필 이미지 placeholder)
- [x] 1-3. Mission Statement 섹션
- [x] 1-4. Methodology + Limitations 섹션
- [x] 1-5. 소셜 증거 (사이트 통계: 42 countries, 175+ occupations, 98 cities)
- [x] 1-6. Organization JSON-LD에 founder 정보 추가 (Person 타입)

## Task 2: 블로그 저자 실명화 ✅
- [x] 2-1. BlogPost interface에 authorKey 필드 추가
- [x] 2-2. blog-posts.ts에 BlogAuthor interface + AUTHORS 데이터 추가
- [x] 2-3. blog/[slug]/page.tsx 저자 프로필 박스 구현 (이니셜 아바타 + bio + About 링크)
- [x] 2-4. BlogFilterClient 저자 표시 업데이트 ("by Chanhyeog Oh")
- [x] 2-5. JSON-LD author를 Person 타입으로 변경 (blog/[slug] + blog/category)
- [x] 2-6. blog/category/[category] 저자 표시 업데이트

## Task 3: 케이스 스터디 블로그 3개 추가 ✅
- [x] 3-1. "My Journey Building a Global Salary Comparison Tool" (창립 스토리, 10분)
- [x] 3-2. "What I Learned Analyzing Salaries in 42 Countries" (데이터 인사이트, 9분)
- [x] 3-3. "5 Salary Negotiation Lessons from Our Data" (실전 조언, 8분)

## Task 4: 빌드 검증 ✅
- [x] 4-1. npx tsc --noEmit — 에러 없음
- [x] 4-2. npm run build — 2,826 SSG 페이지 성공
- [x] 4-3. docs 업데이트 (ops, growth, seo 3개 파일)

---

## 변경 파일 목록

### 수정
1. `src/app/about/page.tsx` — 전면 재작성 (1,500+ 단어, 창립 스토리, 방법론, 한계, JSON-LD)
2. `src/data/blog-posts.ts` — BlogAuthor + AUTHORS + authorKey 필드 + 블로그 3개 추가 (총 53개)
3. `src/app/blog/[slug]/page.tsx` — 저자 프로필 박스, Person JSON-LD, import AUTHORS
4. `src/components/BlogFilterClient.tsx` — "by Chanhyeog Oh"
5. `src/app/blog/category/[category]/page.tsx` — "by Chanhyeog Oh" + BlogPosting author Person

### 신규
- 없음 (기존 파일 수정만)

### 주의사항
- blog-posts.ts는 3,000줄+ 대형 파일 → interface만 수정, 기존 50 posts는 기본값 사용 (authorKey 생략 → "chanhyeog")
- About 페이지 프로필: 이니셜 아바타 (CO), 실제 사진은 사용자가 교체 가능
