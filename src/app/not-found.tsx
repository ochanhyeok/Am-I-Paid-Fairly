import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[calc(100dvh-3.5rem)] bg-gradient-to-br from-slate-950 to-slate-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        {/* 404 숫자 */}
        <p className="text-8xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent leading-none">
          404
        </p>

        {/* 메시지 */}
        <h1 className="text-2xl font-bold text-slate-100 mt-4">
          Page not found
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* CTA */}
        <Link
          href="/"
          className="inline-block mt-6 bg-accent-blue hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors"
        >
          Compare My Salary
        </Link>

        {/* 인기 링크 */}
        <div className="mt-10">
          <p className="text-slate-600 text-xs uppercase tracking-wider font-semibold mb-3">
            Popular Salaries
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              ["Software Engineer", "/salary/software-engineer"],
              ["Data Scientist", "/salary/data-scientist"],
              ["Product Manager", "/salary/product-manager"],
              ["Doctor", "/salary/doctor"],
              ["Nurse", "/salary/nurse"],
              ["Teacher", "/salary/teacher"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="text-xs bg-dark-card hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-dark-border px-3 py-1.5 rounded-lg transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
