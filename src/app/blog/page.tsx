import type { Metadata } from "next";
import Link from "next/link";
import { getAllBlogPosts } from "@/data/blog-posts";

export const metadata: Metadata = {
  title: "Salary Insights Blog | Am I Paid Fairly?",
  description:
    "Expert guides and data-driven articles about global salaries, purchasing power parity, the Big Mac Index, and salary comparisons across 42 countries.",
  alternates: {
    canonical: "https://amipaidfairly.com/blog",
  },
};

const categoryColors: Record<string, string> = {
  "Salary Rankings": "bg-blue-500/20 text-blue-400",
  Guides: "bg-emerald-500/20 text-emerald-400",
  Analysis: "bg-purple-500/20 text-purple-400",
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Am I Paid Fairly? — Salary Insights Blog",
    description:
      "Data-driven articles about global salaries, purchasing power, and compensation trends.",
    url: "https://amipaidfairly.com/blog",
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      url: `https://amipaidfairly.com/blog/${post.slug}`,
    })),
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">Blog</span>
        </nav>

        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 leading-tight">
            Salary Insights Blog
          </h1>
          <p className="text-slate-400 text-sm mt-3">
            Data-driven articles about global salaries, purchasing power, and
            compensation trends
          </p>
        </header>

        {/* Post list */}
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-dark-card border border-dark-border hover:border-slate-600 rounded-xl p-6 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    categoryColors[post.category] ||
                    "bg-slate-500/20 text-slate-400"
                  }`}
                >
                  {post.category}
                </span>
                <span className="text-slate-600 text-xs">{post.date}</span>
                <span className="text-slate-600 text-xs">
                  {post.readTime} min read
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors mb-2">
                {post.title}
              </h2>

              <p className="text-slate-400 text-sm leading-relaxed">
                {post.excerpt}
              </p>

              <span className="inline-block mt-3 text-emerald-400 text-sm font-medium group-hover:text-emerald-300 transition-colors">
                Read more &rarr;
              </span>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full text-sm transition-colors"
          >
            Compare your own salary
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
