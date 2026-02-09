/**
 * 파비콘 생성 스크립트
 * 브랜드 아이덴티티: 저울(Balance) 아이콘 — "Am I Paid Fairly?" 의 공정성 상징
 * Blue→Emerald 그라디언트 배경 + 하얀 저울 심볼
 * 출력: src/app/favicon.ico, public/apple-touch-icon.png, etc.
 */
import sharp from "sharp";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

/**
 * 브랜드 파비콘 SVG 생성
 * 디자인: 그라디언트 라운디드 스퀘어 + 하얀 저울 아이콘
 * 저울 한쪽이 올라가고 한쪽이 내려감 → "Am I Paid Fairly?" 시각 표현
 */
function createFaviconSVG(size) {
  const r = Math.round(size * 0.22); // 둥근 모서리

  // 저울 좌표 계산 (size 기준 비율)
  const cx = size / 2;               // 중앙 X
  const cy = size / 2;               // 중앙 Y

  // 받침대 (삼각형 + 기둥)
  const baseY = size * 0.82;         // 받침대 바닥
  const baseWidth = size * 0.22;
  const pillarTop = size * 0.25;     // 기둥 꼭대기
  const pillarWidth = size * 0.06;

  // 수평 빔 (기울어진) — 왼쪽이 높고 오른쪽이 낮음
  const beamY = pillarTop;
  const tilt = size * 0.06;          // 기울기
  const beamLeft = size * 0.14;
  const beamRight = size - size * 0.14;
  const beamThickness = Math.max(1.5, size * 0.04);

  // 접시 (원호)
  const panWidth = size * 0.22;
  const panDepth = size * 0.08;
  const stringLength = size * 0.18;

  // 왼쪽 접시 (높은 쪽 — 적게 받는 사람)
  const leftPanCx = beamLeft + size * 0.02;
  const leftPanTop = beamY - tilt + stringLength;

  // 오른쪽 접시 (낮은 쪽 — 많이 받는 사람)
  const rightPanCx = beamRight - size * 0.02;
  const rightPanTop = beamY + tilt + stringLength;

  // 접시 라인 두께
  const lineW = Math.max(1, size * 0.035);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>
  </defs>

  <!-- 배경 -->
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#grad)"/>

  <!-- 기둥 (중앙 수직선) -->
  <line x1="${cx}" y1="${pillarTop}" x2="${cx}" y2="${baseY}"
        stroke="white" stroke-width="${pillarWidth}" stroke-linecap="round" opacity="0.95"/>

  <!-- 받침대 (아래 가로선) -->
  <line x1="${cx - baseWidth}" y1="${baseY}" x2="${cx + baseWidth}" y2="${baseY}"
        stroke="white" stroke-width="${pillarWidth}" stroke-linecap="round" opacity="0.95"/>

  <!-- 빔 (기울어진 수평선) -->
  <line x1="${beamLeft}" y1="${beamY - tilt}" x2="${beamRight}" y2="${beamY + tilt}"
        stroke="white" stroke-width="${beamThickness}" stroke-linecap="round"/>

  <!-- 피벗 포인트 (중앙 원) -->
  <circle cx="${cx}" cy="${pillarTop}" r="${Math.max(1.5, size * 0.04)}" fill="white"/>

  <!-- 왼쪽 줄 -->
  <line x1="${leftPanCx}" y1="${beamY - tilt}" x2="${leftPanCx}" y2="${leftPanTop}"
        stroke="white" stroke-width="${lineW}" opacity="0.9"/>

  <!-- 왼쪽 접시 (위쪽 — 가벼운 쪽) -->
  <path d="M ${leftPanCx - panWidth} ${leftPanTop}
           Q ${leftPanCx} ${leftPanTop + panDepth * 2} ${leftPanCx + panWidth} ${leftPanTop}"
        stroke="white" stroke-width="${lineW}" fill="none" stroke-linecap="round" opacity="0.9"/>

  <!-- 오른쪽 줄 -->
  <line x1="${rightPanCx}" y1="${beamY + tilt}" x2="${rightPanCx}" y2="${rightPanTop}"
        stroke="white" stroke-width="${lineW}" opacity="0.9"/>

  <!-- 오른쪽 접시 (아래쪽 — 무거운 쪽) -->
  <path d="M ${rightPanCx - panWidth} ${rightPanTop}
           Q ${rightPanCx} ${rightPanTop + panDepth * 2} ${rightPanCx + panWidth} ${rightPanTop}"
        stroke="white" stroke-width="${lineW}" fill="none" stroke-linecap="round" opacity="0.9"/>
</svg>`;
}

// PNG를 ICO로 변환
function pngToIco(pngBuffer) {
  const headerSize = 6;
  const dirEntrySize = 16;
  const dataOffset = headerSize + dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const dirEntry = Buffer.alloc(dirEntrySize);
  dirEntry.writeUInt8(32, 0);
  dirEntry.writeUInt8(32, 1);
  dirEntry.writeUInt8(0, 2);
  dirEntry.writeUInt8(0, 3);
  dirEntry.writeUInt16LE(1, 4);
  dirEntry.writeUInt16LE(32, 6);
  dirEntry.writeUInt32LE(pngBuffer.length, 8);
  dirEntry.writeUInt32LE(dataOffset, 12);

  return Buffer.concat([header, dirEntry, pngBuffer]);
}

async function main() {
  console.log("Generating brand favicons...");

  const sizes = [
    { size: 16, file: "public/favicon-16x16.png" },
    { size: 32, file: "public/favicon-32x32.png" },
    { size: 180, file: "public/apple-touch-icon.png" },
    { size: 192, file: "public/icon-192x192.png" },
    { size: 512, file: "public/icon-512x512.png" },
  ];

  for (const { size, file } of sizes) {
    const svg = createFaviconSVG(size);
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    writeFileSync(join(ROOT, file), png);
    console.log(`  ${file} (${size}x${size})`);
  }

  // ICO (32x32)
  const svg32 = createFaviconSVG(32);
  const png32 = await sharp(Buffer.from(svg32)).png().toBuffer();
  writeFileSync(join(ROOT, "src/app/favicon.ico"), pngToIco(png32));
  console.log("  src/app/favicon.ico (32x32 ICO)");

  console.log("\nDone! Brand favicon with balance scale icon generated.");
}

main().catch(console.error);
