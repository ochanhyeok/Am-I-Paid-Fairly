import { MetadataRoute } from "next";

// 악성/불필요 크롤러 UA 목록 (서버 리소스 낭비 + Vercel ISR 한도 소진)
const BAD_BOTS = [
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "BLEXBot",
  "SearchmetricsBot",
  "serpstatbot",
  "Bytespider",
  "PetalBot",
  "MegaIndex",
  "SEOkicks",
  "Seekport",
  "BomboraBot",
  "Linguee",
  "DataForSeoBot",
  "Sogou",
  "YandexBot",
  "zoominfobot",
  "Scrapy",
  "CCBot",
  "ClaudeBot",
  "GPTBot",
  "anthropic-ai",
  "FacebookBot",
  "Amazonbot",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  // 악성 봇: 전체 차단
  const badBotRules = BAD_BOTS.map((ua) => ({
    userAgent: ua,
    disallow: ["/"],
  }));

  return {
    rules: [
      // 검색엔진 허용 (Google, Bing)
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/"],
      },
      // 악성 봇 차단
      ...badBotRules,
      // 기타 모든 봇: 허용하되 크롤링 속도 제한
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
        crawlDelay: 10,
      },
    ],
    sitemap: "https://amipaidfairly.com/sitemap.xml",
  };
}
