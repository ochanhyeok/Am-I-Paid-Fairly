import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import AdSenseScript from "@/components/AdSense";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Am I Paid Fairly? — Global Salary Comparison",
  description:
    "Compare your salary with the same job in 38+ countries. See your global percentile, world salary map, and Big Mac purchasing power — all free, no login required.",
  keywords: [
    "salary comparison",
    "global salary",
    "am i paid fairly",
    "salary percentile",
    "international salary",
  ],
  verification: {
    google: "MrECvrjpt3wmdi56cllNejohfsaWjgcWO-xS15ZWp00",
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
