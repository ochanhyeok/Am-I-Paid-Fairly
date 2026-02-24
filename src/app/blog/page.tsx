import type { Metadata } from "next";
import Link from "next/link";
import { getAllBlogPosts } from "@/data/blog-posts";
import BlogFilterClient from "@/components/BlogFilterClient";
import NewsletterSignup from "@/components/NewsletterSignup";

export const metadata: Metadata = {
  title: "Salary Insights Blog | Am I Paid Fairly?",
  description:
    "Expert guides and data-driven articles about global salaries, purchasing power parity, the Big Mac Index, and salary comparisons across 42 countries.",
  openGraph: {
    title: "Salary Insights Blog | Am I Paid Fairly?",
    description: "Data-driven articles about global salaries and purchasing power.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Salary Insights Blog | Am I Paid Fairly?",
    description: "Data-driven articles about global salaries and purchasing power.",
  },
  alternates: {
    canonical: "https://amipaidfairly.com/blog",
  },
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

  const searchActionJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://amipaidfairly.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://amipaidfairly.com/blog?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  // Serialize only the fields needed by the client component
  const clientPosts = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    category: post.category,
    readTime: post.readTime,
    keywords: post.keywords,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(searchActionJsonLd) }}
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

        {/* Filter + Post list */}
        <BlogFilterClient posts={clientPosts} />

        {/* Newsletter */}
        <div className="mt-10 mb-6">
          <NewsletterSignup />
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
