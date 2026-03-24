import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAllBlogPosts } from "@/data/blog-posts";
import NewsletterSignup from "@/components/NewsletterSignup";

// 카테고리 허브 정의
const CATEGORY_HUBS: Record<
  string,
  { label: string; categories: string[]; description: string; keywords: string[] }
> = {
  rankings: {
    label: "Salary Rankings",
    categories: ["Salary Rankings"],
    description:
      "Data-driven salary rankings across 42 countries. See which countries pay the most for each profession with PPP and Big Mac Index adjustments.",
    keywords: ["salary rankings", "highest paying countries", "salary by country", "top paying jobs"],
  },
  guides: {
    label: "Guides",
    categories: ["Guides", "Country Guide", "Occupation Guide", "Cities", "Relocation"],
    description:
      "Comprehensive guides for working abroad, salary negotiation, relocation planning, and understanding global compensation data.",
    keywords: ["salary guide", "working abroad guide", "relocation guide", "expat salary"],
  },
  analysis: {
    label: "Analysis",
    categories: ["Analysis", "Trends", "Technology"],
    description:
      "In-depth analysis of global salary trends, technology impact on compensation, and purchasing power comparisons across countries.",
    keywords: ["salary analysis", "compensation trends", "salary data analysis", "global salary trends"],
  },
  "career-finance": {
    label: "Career & Finance",
    categories: ["Finance", "Career Advice", "Education", "Legal", "Remote Work", "Healthcare"],
    description:
      "Career advice, financial planning, tax guides, and professional development insights for global workers.",
    keywords: ["career advice salary", "salary negotiation", "tax guide expats", "career finance"],
  },
};

const VALID_SLUGS = Object.keys(CATEGORY_HUBS);

const categoryColors: Record<string, string> = {
  rankings: "bg-blue-500/20 text-blue-400",
  guides: "bg-emerald-500/20 text-emerald-400",
  analysis: "bg-purple-500/20 text-purple-400",
  "career-finance": "bg-amber-500/20 text-amber-400",
};

// --- SSG ---
export function generateStaticParams() {
  return VALID_SLUGS.map((category) => ({ category }));
}

export const revalidate = false;

// --- Metadata ---
interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const hub = CATEGORY_HUBS[category];

  if (!hub) {
    return { title: "Category Not Found | AIPF" };
  }

  const title = `${hub.label} Articles | AIPF`;
  return {
    title,
    description: hub.description,
    keywords: hub.keywords,
    openGraph: {
      title,
      description: hub.description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: hub.description,
    },
    alternates: {
      canonical: `https://amipaidfairly.com/blog/category/${category}`,
    },
  };
}

// --- Page ---
export default async function BlogCategoryPage({ params }: PageProps) {
  const { category } = await params;
  const hub = CATEGORY_HUBS[category];

  if (!hub) {
    redirect("/blog");
  }

  const allPosts = getAllBlogPosts();
  const posts = allPosts.filter((p) => hub.categories.includes(p.category));

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://amipaidfairly.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://amipaidfairly.com/blog" },
      {
        "@type": "ListItem",
        position: 3,
        name: hub.label,
        item: `https://amipaidfairly.com/blog/category/${category}`,
      },
    ],
  };

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${hub.label} — Am I Paid Fairly?`,
    description: hub.description,
    url: `https://amipaidfairly.com/blog/category/${category}`,
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      url: `https://amipaidfairly.com/blog/${post.slug}`,
      author: {
        "@type": "Person",
        name: "Chanhyeog Oh",
        url: "https://amipaidfairly.com/about",
      },
    })),
  };

  const colorClass = categoryColors[category] || "bg-slate-500/20 text-slate-400";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />

      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-slate-300 transition-colors">
            Blog
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">{hub.label}</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${colorClass}`}>
              {hub.label}
            </span>
            <span className="text-slate-500 text-sm">
              {posts.length} article{posts.length !== 1 ? "s" : ""}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 leading-tight">
            {hub.label}
          </h1>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">{hub.description}</p>
        </header>

        {/* Other categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          <Link
            href="/blog"
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300 transition-colors"
          >
            All
          </Link>
          {VALID_SLUGS.map((slug) => {
            const isActive = slug === category;
            return (
              <Link
                key={slug}
                href={`/blog/category/${slug}`}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300"
                }`}
              >
                {CATEGORY_HUBS[slug].label}
              </Link>
            );
          })}
        </div>

        {/* Post list */}
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-dark-card border border-dark-border hover:border-slate-600 rounded-xl p-6 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
                  {post.category}
                </span>
                <span className="text-slate-600 text-xs">{post.date}</span>
                <span className="text-slate-600 text-xs">{post.readTime} min read</span>
                <span className="text-slate-600 text-xs hidden sm:inline">by Chanhyeog Oh</span>
              </div>

              <h2 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors mb-2">
                {post.title}
              </h2>

              <p className="text-slate-400 text-sm leading-relaxed">{post.excerpt}</p>

              <span className="inline-block mt-3 text-emerald-400 text-sm font-medium group-hover:text-emerald-300 transition-colors">
                Read more &rarr;
              </span>
            </Link>
          ))}
        </div>

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
