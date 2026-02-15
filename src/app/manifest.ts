import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Am I Paid Fairly? — Global Salary Comparison",
    short_name: "Am I Paid Fairly?",
    description:
      "Compare your salary with the same job in 42 countries. See your global percentile, world salary map, and Big Mac purchasing power.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    icons: [
      { src: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { src: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
