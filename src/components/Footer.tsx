import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-dark-border bg-slate-950 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-sm mb-8">
          {/* Popular Occupations */}
          <div>
            <h4 className="text-slate-300 font-semibold mb-3">Top Salaries</h4>
            <ul className="space-y-1.5">
              {[
                ["Software Engineer", "/salary/software-engineer"],
                ["Data Scientist", "/salary/data-scientist"],
                ["Product Manager", "/salary/product-manager"],
                ["Doctor", "/salary/doctor"],
                ["Lawyer", "/salary/lawyer"],
                ["Nurse", "/salary/nurse"],
                ["Accountant", "/salary/accountant"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/browse"
                  className="text-emerald-500 hover:text-emerald-400 transition-colors text-xs font-medium"
                >
                  View all 175+ →
                </Link>
              </li>
            </ul>
          </div>

          {/* Rankings */}
          <div>
            <h4 className="text-slate-300 font-semibold mb-3">Rankings</h4>
            <ul className="space-y-1.5">
              {[
                ["Engineers", "/rankings/software-engineer"],
                ["Nurses", "/rankings/nurse"],
                ["Teachers", "/rankings/teacher"],
                ["Accountants", "/rankings/accountant"],
                ["Pilots", "/rankings/pilot"],
                ["Dentists", "/rankings/dentist"],
                ["Pharmacists", "/rankings/pharmacist"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Data Sources */}
          <div>
            <h4 className="text-slate-300 font-semibold mb-3">Data Sources</h4>
            <ul className="space-y-1.5">
              {[
                ["BLS OEWS", "https://www.bls.gov/oes/"],
                ["OECD Wages", "https://stats.oecd.org"],
                ["World Bank", "https://data.worldbank.org"],
                ["Big Mac Index", "https://github.com/TheEconomist/big-mac-data"],
              ].map(([label, href]) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore & Legal */}
          <div>
            <h4 className="text-slate-300 font-semibold mb-3">Explore</h4>
            <ul className="space-y-1.5">
              {[
                ["Browse All Jobs", "/browse"],
                ["Top Paying Jobs", "/top-paying-jobs"],
                ["Countries", "/countries"],
                ["Blog", "/blog"],
                ["About", "/about"],
                ["Contact", "/contact"],
                ["Privacy Policy", "/privacy"],
                ["Terms of Service", "/terms"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-dark-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} Am I Paid Fairly? All rights reserved.
          </p>
          <p className="text-slate-700 text-[10px] text-center">
            Estimated based on OECD &amp; BLS data. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
