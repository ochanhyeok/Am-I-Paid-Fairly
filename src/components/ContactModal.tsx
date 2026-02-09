"use client";

import { useState, useEffect, useRef } from "react";

// 이메일 난독화 (봇 스크래핑 방지)
const _u = "pon07084";
const _d = "gmail.com";
function getEmail() {
  return `${_u}@${_d}`;
}

export default function ContactModal() {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // 모달 열릴 때 스크롤 잠금
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleSend() {
    const mailto = `mailto:${getEmail()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, "_self");
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setSubject("");
      setBody("");
      setOpen(false);
    }, 2000);
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) {
      setOpen(false);
    }
  }

  return (
    <>
      {/* 이메일 트리거 버튼 */}
      <button
        onClick={() => setOpen(true)}
        className="text-emerald-400 text-sm font-semibold mt-2 hover:text-emerald-300 transition-colors cursor-pointer underline underline-offset-2"
      >
        {getEmail()}
      </button>

      {/* 모달 */}
      {open && (
        <div
          ref={backdropRef}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        >
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-100">Send Email</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors text-xl leading-none p-1"
              >
                &times;
              </button>
            </div>

            {/* To 필드 (읽기 전용) */}
            <div className="mb-3">
              <label className="block text-xs text-slate-500 mb-1">To</label>
              <div className="w-full bg-slate-800/50 border border-dark-border rounded-lg px-4 py-2.5 text-slate-300 text-sm">
                {getEmail()}
              </div>
            </div>

            {/* Subject */}
            <div className="mb-3">
              <label className="block text-xs text-slate-500 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Question about salary data"
                className="w-full bg-slate-800/50 border border-dark-border rounded-lg px-4 py-2.5 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
              />
            </div>

            {/* Message */}
            <div className="mb-5">
              <label className="block text-xs text-slate-500 mb-1">
                Message
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                placeholder="Write your message here..."
                className="w-full bg-slate-800/50 border border-dark-border rounded-lg px-4 py-2.5 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors resize-none"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!subject.trim() || !body.trim()}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all ${
                  subject.trim() && body.trim()
                    ? "bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]"
                    : "bg-slate-700 cursor-not-allowed text-slate-400"
                }`}
              >
                {sent ? "Opening email app..." : "Send Email"}
              </button>
            </div>

            <p className="text-slate-600 text-[10px] text-center mt-3">
              This will open your default email app with the message pre-filled.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
