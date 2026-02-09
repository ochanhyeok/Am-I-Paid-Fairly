import type { Metadata } from "next";
import Link from "next/link";
import ContactModal from "@/components/ContactModal";

export const metadata: Metadata = {
  title: "Contact Us | Am I Paid Fairly?",
  description:
    "Get in touch with the Am I Paid Fairly? team. Send us questions, feedback, or data correction requests.",
  alternates: {
    canonical: "https://amipaidfairly.com/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">Contact</span>
        </nav>

        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 leading-tight">
            Contact Us
          </h1>
          <p className="text-slate-400 text-sm mt-3 max-w-lg mx-auto">
            Have a question, feedback, or data correction request? We&apos;d
            love to hear from you.
          </p>
        </header>

        {/* Contact methods */}
        <div className="flex flex-col gap-6">
          {/* Email */}
          <section className="bg-dark-card rounded-xl border border-dark-border p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-2">
              Email Us
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">
              The fastest way to reach us is by email. We typically respond
              within 48 hours.
            </p>
            <ContactModal />
          </section>

          {/* What to contact about */}
          <section className="bg-dark-card rounded-xl border border-dark-border p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-4">
              What Can You Contact Us About?
            </h2>
            <ul className="space-y-3">
              {[
                {
                  label: "Data Corrections",
                  desc: "If you notice salary data that seems significantly off for a specific occupation or country, let us know with supporting sources.",
                },
                {
                  label: "Feature Requests",
                  desc: "Ideas for new occupations, countries, comparison tools, or other features you'd like to see.",
                },
                {
                  label: "Bug Reports",
                  desc: "Something broken or not displaying correctly? Tell us what browser and device you're using.",
                },
                {
                  label: "Partnership & Media",
                  desc: "Interested in collaborating, citing our data, or featuring Am I Paid Fairly? in your publication.",
                },
                {
                  label: "General Feedback",
                  desc: "Any other thoughts, suggestions, or questions about the platform.",
                },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-slate-200">
                      {item.label}
                    </span>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Response time */}
          <section className="bg-dark-card rounded-xl border border-dark-border p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-2">
              Response Time
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We aim to respond to all inquiries within 1&ndash;2 business days.
              For data correction requests, please include a link to a reliable
              source so we can verify and update our data quickly.
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="text-center py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full text-sm transition-colors"
          >
            Compare your salary
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
