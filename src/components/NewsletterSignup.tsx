"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    // 향후 Mailchimp/ConvertKit 연동 시 여기에 API 호출 추가
    setSubmitted(true);
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-dark-border rounded-2xl p-6 sm:p-8 text-center">
      <h3 className="text-lg font-bold text-slate-100 mb-2">
        Get Salary Insights in Your Inbox
      </h3>
      <p className="text-slate-400 text-sm mb-5">
        Data-driven articles about global salaries, compensation trends, and career advice. No spam.
      </p>

      {submitted ? (
        <p className="text-emerald-400 text-sm font-medium py-2">
          Thanks for subscribing! We&apos;ll be in touch.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-900/80 border border-dark-border rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-600 transition-colors"
          />
          <button
            type="submit"
            className="flex-shrink-0 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}
