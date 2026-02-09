"use client";

import { useState } from "react";
import type { CountryComparison } from "@/types";
import { formatPercentile, formatNumber } from "@/lib/format";

interface Props {
  percentile: number;
  occupationTitle: string;
  miniCountries: CountryComparison[];
  userCountryCode: string;
  bigMacCount: number;
}

export default function ShareCard({
  percentile,
  occupationTitle,
  miniCountries,
  userCountryCode,
  bigMacCount,
}: Props) {
  const [copied, setCopied] = useState(false);

  const pctText = formatPercentile(percentile);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareText = `I'm in the ${pctText} of ${occupationTitle}s worldwide! Check yours:`;

  function shareTwitter() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=550,height=420");
  }

  function shareReddit() {
    const url = `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 API 실패 시 무시
    }
  }

  return (
    <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
      <h3 className="text-slate-200 font-bold text-sm mb-4">
        Share Your Result
      </h3>

      {/* Preview card */}
      <div className="bg-slate-950 rounded-xl p-5 text-center border border-dark-border">
        <p className="text-slate-600 text-[11px]">amipaidfairly.com</p>
        <p className="text-xl font-extrabold text-slate-50 mt-2">
          I&apos;m in the {pctText}
        </p>
        <p className="text-slate-400 text-xs mt-1">
          of {occupationTitle}s worldwide
        </p>

        {/* Mini country tags */}
        <div className="flex justify-center gap-4 mt-4 text-xs">
          {miniCountries.map((comp) => {
            const text = formatPercentile(comp.percentile);
            const color =
              comp.percentile >= 70
                ? "text-emerald-400"
                : comp.percentile >= 40
                  ? "text-yellow-400"
                  : "text-red-400";
            return (
              <span key={comp.country.code} className={color}>
                {comp.country.flag} {text}
              </span>
            );
          })}
        </div>

        {/* Big Mac */}
        {bigMacCount > 0 && (
          <div className="mt-4 mx-auto max-w-xs bg-dark-card rounded-lg py-2.5 px-4 text-xs text-yellow-400">
            🍔 My salary = {formatNumber(bigMacCount)} Big Macs/year
          </div>
        )}
      </div>

      {/* Share buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={shareTwitter}
          className="flex-1 bg-dark-border hover:bg-slate-600 active:bg-slate-500 text-slate-300 text-xs sm:text-sm py-2.5 rounded-lg transition-colors font-medium"
        >
          𝕏 Share
        </button>
        <button
          onClick={shareReddit}
          className="flex-1 bg-dark-border hover:bg-slate-600 active:bg-slate-500 text-slate-300 text-xs sm:text-sm py-2.5 rounded-lg transition-colors font-medium"
        >
          Reddit
        </button>
        <button
          onClick={copyLink}
          className="flex-1 bg-dark-border hover:bg-slate-600 active:bg-slate-500 text-slate-300 text-xs sm:text-sm py-2.5 rounded-lg transition-colors font-medium"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}
