import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { calculateSalaryResult, pickRepresentativeCountries } from "@/lib/salary-calculator";
import { formatCurrency } from "@/lib/format";
import { getOccupation, getCountry } from "@/lib/data-loader";
import ResultClient from "./ResultClient";

interface Props {
  searchParams: Promise<{ job?: string; country?: string; salary?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const { job, country, salary } = params;
  const occ = job ? getOccupation(job) : undefined;
  const cty = country ? getCountry(country) : undefined;

  // 퍼센타일 계산 (OG 이미지에 표시)
  let percentile: number | undefined;
  if (occ && cty && salary) {
    const salaryNum = parseInt(salary, 10);
    if (!isNaN(salaryNum) && salaryNum > 0) {
      const result = calculateSalaryResult(job!, country!, salaryNum);
      if (result) percentile = result.globalPercentile;
    }
  }

  const title = occ && cty
    ? `${occ.title} Salary in ${cty.name} | Am I Paid Fairly?`
    : "Salary Comparison Result | Am I Paid Fairly?";
  const description = occ && cty && percentile !== undefined
    ? `As a ${occ.title} in ${cty.name}, I earn more than ${percentile}% of professionals worldwide. See how your salary compares across 42 countries.`
    : "Compare your salary with the same job in 42 countries.";

  const ogParams = new URLSearchParams();
  if (occ) ogParams.set("occupation", occ.title);
  if (cty) ogParams.set("country", cty.name);
  if (percentile !== undefined) ogParams.set("percentile", String(percentile));

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og?${ogParams.toString()}`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?${ogParams.toString()}`],
    },
  };
}

export default async function ResultPage({ searchParams }: Props) {
  const params = await searchParams;
  const { job, country, salary } = params;

  if (!job || !country || !salary) {
    redirect("/");
  }

  const salaryNum = parseInt(salary, 10);
  if (isNaN(salaryNum) || salaryNum <= 0) {
    redirect("/");
  }

  const result = calculateSalaryResult(job, country, salaryNum);
  if (!result) {
    redirect("/");
  }

  const miniCountries = pickRepresentativeCountries(
    result.countryComparisons,
    country
  );

  const userSalaryFormatted = formatCurrency(
    result.userSalaryLocal,
    result.userCountry.currencySymbol
  );
  const userSalaryUSDFormatted = formatCurrency(result.userSalaryUSD);

  // JSON-LD 구조화 데이터
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${result.occupation.title} Salary in ${result.userCountry.name}`,
    description: `${result.occupation.title} salary comparison across 42 countries. Global percentile: top ${100 - result.globalPercentile}%.`,
    url: `https://amipaidfairly.com/result?job=${job}&country=${country}&salary=${salary}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ResultClient
        result={result}
        miniCountries={miniCountries}
        userSalaryFormatted={userSalaryFormatted}
        userSalaryUSDFormatted={userSalaryUSDFormatted}
      />
    </>
  );
}
