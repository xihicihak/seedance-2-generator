"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/context/LanguageContext";

export default function AgeGateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    try {
      const verified = localStorage.getItem("pornmake_age_verified");
      if (!verified) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 0);
        return () => clearTimeout(timer);
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
          {t("ageGate.title")}
        </h2>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-rose-400">
          {t("ageGate.badge")}
        </p>

        <p className="mt-4 text-xs leading-relaxed text-zinc-400">
          {t("ageGate.description")}
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <button
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 py-3 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:brightness-110 active:scale-95 transition-all"
          >
            {t("ageGate.enterBtn")}
          </button>
          <button
            onClick={handleExit}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-xs font-medium text-zinc-400 hover:text-white transition-all"
          >
            {t("ageGate.exitBtn")}
          </button>
        </div>

        <p className="mt-4 text-[10px] text-zinc-600">
          {t("ageGate.compliance")}
        </p>
      </div>
    </div>
  );
}
