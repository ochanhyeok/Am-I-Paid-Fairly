import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-dark-border bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-lg font-extrabold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            AIPF
          </span>
          <span className="text-slate-400 text-sm font-medium hidden sm:inline group-hover:text-slate-200 transition-colors">
            Am I Paid Fairly?
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/salary/software-engineer"
            className="px-3 py-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Salaries
          </Link>
          <Link
            href="/rankings/software-engineer"
            className="px-3 py-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Rankings
          </Link>
          <Link
            href="/about"
            className="px-3 py-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
