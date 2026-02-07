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
  const { job, country } = params;
  const occ = job ? getOccupation(job) : undefined;
  const cty = country ? getCountry(country) : undefined;

  const title = occ && cty
    ? `${occ.title} Salary in ${cty.name} | Am I Paid Fairly?`
    : "Salary Comparison Result | Am I Paid Fairly?";
  const description = occ && cty
    ? `See how ${occ.title} salary in ${cty.name} compares to 38+ countries worldwide.`
    : "Compare your salary with the same job in 38+ countries.";

  const ogParams = new URLSearchParams();
  if (occ) ogParams.set("occupation", occ.title);
  if (cty) ogParams.set("country", cty.name);

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

  return (
    <ResultClient
      result={result}
      miniCountries={miniCountries}
      userSalaryFormatted={userSalaryFormatted}
      userSalaryUSDFormatted={userSalaryUSDFormatted}
    />
  );
}
