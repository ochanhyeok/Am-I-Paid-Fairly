import { MetadataRoute } from "next";
import { getOccupations, getCountries } from "@/lib/data-loader";

const BASE_URL = "https://am-i-paid-fairly.vercel.app";

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

  return [
    ...staticPages,
    ...occupationPages,
    ...occupationCountryPages,
    ...rankingPages,
  ];
}
