import { MetadataRoute } from "next";
import { getOccupations, getCountries, getCities } from "@/lib/data-loader";
import { blogPosts } from "@/data/blog-posts";

const BASE_URL = "https://amipaidfairly.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const occupations = getOccupations();
  const countries = getCountries();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
  ];

  // /salary/[occupation] 페이지 (30개)
  const occupationPages: MetadataRoute.Sitemap = occupations.map((occ) => ({
    url: `${BASE_URL}/salary/${occ.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  // /salary/[occupation]/[country] 페이지 (30×42 = 1,260개)
  const occupationCountryPages: MetadataRoute.Sitemap = occupations.flatMap(
    (occ) =>
      countries.map((country) => ({
        url: `${BASE_URL}/salary/${occ.slug}/${country.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      }))
  );

  // /rankings/[occupation] 페이지 (30개)
  const rankingPages: MetadataRoute.Sitemap = occupations.map((occ) => ({
    url: `${BASE_URL}/rankings/${occ.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // /compare/[occupation]/[pair] 페이지
  const usVsCountries = [
    "south-korea", "japan", "germany", "united-kingdom", "france",
    "switzerland", "australia", "canada", "india", "china",
  ];
  const nonUsPairs = [
    ["south-korea", "japan"], ["united-kingdom", "germany"],
    ["australia", "canada"], ["india", "china"],
    ["france", "germany"], ["japan", "germany"],
    ["south-korea", "india"], ["united-kingdom", "france"],
    ["australia", "united-kingdom"], ["canada", "united-kingdom"],
    ["switzerland", "germany"], ["japan", "australia"],
  ];
  const comparePages: MetadataRoute.Sitemap = occupations.flatMap((occ) => [
    ...usVsCountries.map((countrySlug) => ({
      url: `${BASE_URL}/compare/${occ.slug}/united-states-vs-${countrySlug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...nonUsPairs.map(([a, b]) => ({
      url: `${BASE_URL}/compare/${occ.slug}/${a}-vs-${b}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ]);

  // 정적 페이지 (browse, about, privacy)
  const infoPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/browse`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/top-paying-jobs`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/countries`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];

  // /blog 페이지
  const blogListPage: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ];

  const blogPostPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // --- 도시 관련 페이지 ---
  const cities = getCities();

  // /cities 브라우즈 페이지
  const citiesBrowsePage: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/cities`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
  ];

  // /cities/[city] 개별 도시 페이지 (86개)
  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${BASE_URL}/cities/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // /salary/[occupation]/[country]/[city] 도시 상세 페이지
  const cityDetailPages: MetadataRoute.Sitemap = occupations.flatMap((occ) =>
    cities.map((city) => {
      const country = countries.find((c) => c.code === city.countryCode);
      if (!country) return null;
      return {
        url: `${BASE_URL}/salary/${occ.slug}/${country.slug}/${city.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      };
    }).filter(Boolean)
  ) as MetadataRoute.Sitemap;

  // /compare-cities/[occupation]/[pair] 도시 비교 페이지
  const cityPairs: [string, string][] = [
    ["new-york", "london"], ["new-york", "san-francisco"],
    ["san-francisco", "seattle"], ["new-york", "tokyo"],
    ["london", "berlin"], ["london", "paris"],
    ["seoul", "tokyo"], ["singapore", "tokyo"],
    ["sydney", "melbourne"], ["toronto", "vancouver"],
    ["bangalore", "singapore"], ["mumbai", "delhi"],
    ["san-francisco", "london"], ["zurich", "new-york"],
    ["berlin", "amsterdam"],
  ];
  const compareCityPages: MetadataRoute.Sitemap = occupations.flatMap((occ) =>
    cityPairs.map(([a, b]) => ({
      url: `${BASE_URL}/compare-cities/${occ.slug}/${a}-vs-${b}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  );

  return [
    ...staticPages,
    ...occupationPages,
    ...occupationCountryPages,
    ...rankingPages,
    ...comparePages,
    ...infoPages,
    ...blogListPage,
    ...blogPostPages,
    ...citiesBrowsePage,
    ...cityPages,
    ...cityDetailPages,
    ...compareCityPages,
  ];
}
