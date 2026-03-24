"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface BlogPostData {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: number;
  keywords: string[];
}

const FEATURED_SLUG = "top-10-highest-paying-countries-for-software-engineers-2026";
const INITIAL_SHOW = 12;

const CATEGORY_GROUPS: { label: string; categories: string[] | null }[] = [
  { label: "All", categories: null },
  { label: "Rankings", categories: ["Salary Rankings"] },
  {
    label: "Guides",
    categories: ["Guides", "Country Guide", "Occupation Guide", "Cities", "Relocation"],
  },
  { label: "Analysis", categories: ["Analysis", "Trends", "Technology"] },
  {
    label: "Career & Finance",
    categories: ["Finance", "Career Advice", "Education", "Legal", "Remote Work", "Healthcare"],
  },
];

const GROUP_COLORS: Record<string, string> = {
  Rankings: "bg-blue-500/20 text-blue-400",
  Guides: "bg-emerald-500/20 text-emerald-400",
  Analysis: "bg-purple-500/20 text-purple-400",
  "Career & Finance": "bg-amber-500/20 text-amber-400",
};

const THUMB_GRADIENTS: Record<string, string> = {
  Rankings: "from-blue-600/30 to-blue-900/40",
  Guides: "from-emerald-600/30 to-emerald-900/40",
  Analysis: "from-purple-600/30 to-purple-900/40",
  "Career & Finance": "from-amber-600/30 to-amber-900/40",
};

const THUMB_ICONS: Record<string, string> = {
  Rankings: "M3 3v18h18",         // bar chart
  Guides: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5", // layers
  Analysis: "M21 21H3V3",         // trending
  "Career & Finance": "M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6", // dollar
};

function getGroupLabel(category: string): string {
  for (const group of CATEGORY_GROUPS) {
    if (group.categories && group.categories.includes(category)) {
      return group.label;
    }
  }
  return "Analysis";
}

function getCategoryColor(category: string): string {
  const group = getGroupLabel(category);
  return GROUP_COLORS[group] || "bg-slate-500/20 text-slate-400";
}

export default function BlogFilterClient({ posts }: { posts: BlogPostData[] }) {
  const [activeGroup, setActiveGroup] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const featuredPost = posts.find((p) => p.slug === FEATURED_SLUG);

  const filteredPosts = useMemo(() => {
    let result = posts;

    // Category filter
    if (activeGroup !== "All") {
      const group = CATEGORY_GROUPS.find((g) => g.label === activeGroup);
      result = result.filter((post) => group?.categories?.includes(post.category));
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(q) ||
          post.excerpt.toLowerCase().includes(q) ||
          post.keywords.some((k) => k.toLowerCase().includes(q))
      );
    }

    return result;
  }, [posts, activeGroup, searchQuery]);

  // Remove featured post from the main list when showing "All" with no search
  const listPosts = useMemo(() => {
    if (activeGroup === "All" && !searchQuery.trim() && featuredPost) {
      return filteredPosts.filter((p) => p.slug !== FEATURED_SLUG);
    }
    return filteredPosts;
  }, [filteredPosts, activeGroup, searchQuery, featuredPost]);

  const displayPosts = showAll || searchQuery.trim() ? listPosts : listPosts.slice(0, INITIAL_SHOW);
  const hasMore = listPosts.length > INITIAL_SHOW && !showAll && !searchQuery.trim();

  return (
    <>
      {/* Featured Post — only on "All" tab with no search */}
      {activeGroup === "All" && !searchQuery.trim() && featuredPost && (
        <Link
          href={`/blog/${featuredPost.slug}`}
          className="group block mb-8 bg-gradient-to-br from-emerald-900/30 to-slate-800/50 border border-emerald-700/30 hover:border-emerald-500/50 rounded-2xl p-8 transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 uppercase tracking-wider">
              Editor&apos;s Pick
            </span>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getCategoryColor(featuredPost.category)}`}
            >
              {featuredPost.category}
            </span>
            <span className="text-slate-500 text-xs">{featuredPost.readTime} min read</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 group-hover:text-white transition-colors mb-3 leading-snug">
            {featuredPost.title}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            {featuredPost.excerpt}
          </p>
          <span className="text-emerald-400 text-sm font-semibold group-hover:text-emerald-300 transition-colors">
            Read full article &rarr;
          </span>
        </Link>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowAll(false);
          }}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-dark-border rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-600 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CATEGORY_GROUPS.map((group) => {
          const count =
            group.categories === null
              ? posts.length
              : posts.filter((p) => group.categories!.includes(p.category)).length;
          const isActive = activeGroup === group.label;

          return (
            <button
              key={group.label}
              onClick={() => {
                setActiveGroup(group.label);
                setShowAll(false);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300"
              }`}
            >
              {group.label}
              <span
                className={`ml-1.5 text-xs ${isActive ? "text-emerald-200" : "text-slate-500"}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Count */}
      <p className="text-slate-500 text-xs mb-4">
        {searchQuery.trim()
          ? `Found ${filteredPosts.length} result${filteredPosts.length !== 1 ? "s" : ""}`
          : `Showing ${displayPosts.length} of ${listPosts.length} article${listPosts.length !== 1 ? "s" : ""}`}
      </p>

      {/* Post list */}
      <div className="flex flex-col gap-4">
        {displayPosts.map((post) => {
          const groupLabel = getGroupLabel(post.category);
          const gradient = THUMB_GRADIENTS[groupLabel] || "from-slate-600/30 to-slate-900/40";
          const iconPath = THUMB_ICONS[groupLabel] || THUMB_ICONS["Analysis"];

          return (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-dark-card border border-dark-border hover:border-slate-600 rounded-xl p-5 transition-colors flex gap-4"
            >
              {/* Thumbnail */}
              <div
                className={`hidden sm:flex flex-shrink-0 w-20 h-20 rounded-lg bg-gradient-to-br ${gradient} items-center justify-center`}
              >
                <svg
                  className="w-8 h-8 text-slate-400/60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={iconPath} />
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getCategoryColor(post.category)}`}
                  >
                    {post.category}
                  </span>
                  <span className="text-slate-600 text-xs">{post.date}</span>
                  <span className="text-slate-600 text-xs">{post.readTime} min read</span>
                  <span className="text-slate-600 text-xs hidden sm:inline">by Chanhyeog Oh</span>
                </div>

                <h2 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors mb-1.5 leading-snug">
                  {post.title}
                </h2>

                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>

                <span className="inline-block mt-2 text-emerald-400 text-sm font-medium group-hover:text-emerald-300 transition-colors">
                  Read more &rarr;
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* No results */}
      {displayPosts.length === 0 && (
        <p className="text-center text-slate-500 text-sm py-8">
          No articles found. Try a different search or category.
        </p>
      )}

      {/* Show More */}
      {hasMore && (
        <div className="text-center pt-6">
          <button
            onClick={() => setShowAll(true)}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-dark-border hover:border-slate-600 text-slate-300 text-sm font-medium rounded-full transition-colors"
          >
            Show all {listPosts.length} articles
          </button>
        </div>
      )}
    </>
  );
}
