import { redirect } from "next/navigation";
import { calculateSalaryResult, pickRepresentativeCountries } from "@/lib/salary-calculator";
import { formatCurrency } from "@/lib/format";
import ResultClient from "./ResultClient";

interface Props {
  searchParams: Promise<{ job?: string; country?: string; salary?: string }>;
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
