import SalaryForm from "@/components/SalaryForm";
import { getOccupations, getCountries } from "@/lib/data-loader";

export default function Home() {
  const occupations = getOccupations();
  const countries = getCountries();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-slate-500 text-sm mb-2">
          Based on data from 38+ countries
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 leading-tight">
          Are you paid fairly
          <br />
          compared to the world?
        </h1>
        <p className="text-slate-400 text-sm mt-3 max-w-xs mx-auto">
          Enter your job and salary to see how you compare globally
        </p>
      </div>

      {/* Form */}
      <div className="w-full max-w-md">
        <SalaryForm occupations={occupations} countries={countries} />
      </div>

      {/* Footer */}
      <p className="text-slate-600 text-xs mt-8 text-center">
        No login required · 100% free · Data from OECD &amp; BLS
      </p>

      {/* Disclaimer */}
      <p className="text-slate-700 text-[10px] mt-4 text-center max-w-sm">
        Estimated based on OECD &amp; BLS data. Actual salaries vary by
        experience, company, and region.
      </p>
    </main>
  );
}
