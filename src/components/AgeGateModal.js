"use client";

import { useEffect, useState } from "react";

export default function AgeGateModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const verified = localStorage.getItem("pornmake_age_verified");
      if (!verified) {
        setIsOpen(true);
      }
    } catch (e) {
      // In case localStorage is blocked
    }
  }, []);

  const handleConfirm = () => {
    try {
      localStorage.setItem("pornmake_age_verified", "true");
    } catch (e) {}
    setIsOpen(false);
  };

  const handleExit = () => {
    window.location.href = "https://www.google.com";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-rose-500/40 bg-zinc-950 p-6 sm:p-8 text-center shadow-2xl shadow-rose-950/50">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 text-2xl font-black text-white shadow-lg shadow-rose-600/40 mb-4">
          18+
        </div>

        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
          Age Verification Required
        </h2>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-rose-400">
          Adults Only (18+ or Legal Age)
        </p>

        <p className="mt-4 text-xs leading-relaxed text-zinc-400">
          This website contains adult-themed AI generative tools and content powered by the Wan 2.2 engine. By entering, you certify that you are at least 18 years of age (or the age of legal majority in your jurisdiction) and agree to our Terms of Service.
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <button
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 py-3 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:brightness-110 active:scale-95 transition-all"
          >
            I am 18+ — Enter
          </button>
          <button
            onClick={handleExit}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-xs font-medium text-zinc-400 hover:text-white transition-all"
          >
            Exit
          </button>
        </div>

        <p className="mt-4 text-[10px] text-zinc-600">
          PornMake Studio strictly adheres to 18 U.S.C. § 2257 compliance and zero-tolerance policies.
        </p>
      </div>
    </div>
  );
}
