import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import AdSenseScript from "@/components/AdSense";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  title: "Am I Paid Fairly? — Global Salary Comparison",
  description:
    "Compare your salary with the same job in 42 countries. See your global percentile, world salary map, and Big Mac purchasing power — all free, no login required.",
  keywords: [
    "salary comparison",
    "global salary",
    "am i paid fairly",
    "salary percentile",
    "international salary",
  ],
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  verification: {
    google: [
      "MrECvrjpt3wmdi56cllNejohfsaWjgcWO-xS15ZWp00",
      "KOmBTqyLAC9drkNnmkacfOREc89-kvZ-cY2HWFAdRpM",
    ],
  },
  openGraph: {
    title: "Am I Paid Fairly? — Global Salary Comparison",
    description:
      "Compare your salary with the same job in 42 countries. See your global percentile, world salary map, and Big Mac purchasing power.",
    url: "https://amipaidfairly.com",
    siteName: "Am I Paid Fairly?",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Am I Paid Fairly? — Global Salary Comparison",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Am I Paid Fairly? — Global Salary Comparison",
    description:
      "Compare your salary with the same job in 42 countries. Free, no login required.",
    images: ["/api/og"],
  },
  alternates: {
    canonical: "https://amipaidfairly.com",
  },
  other: {
    "google-adsense-account": "ca-pub-2403565022366483",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${dmSans.variable} font-sans min-h-screen flex flex-col`}>
        <GoogleAnalytics />
        <AdSenseScript />
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
