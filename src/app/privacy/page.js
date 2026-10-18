"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "@/context/LanguageContext";

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-[#090a0f] text-zinc-100 selection:bg-rose-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-4 border-b border-zinc-800 pb-8">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
            {t("privacy.badge")}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            {t("privacy.title")}
          </h1>
          <p className="text-xs text-zinc-400">
            {t("privacy.lastUpdated")}
          </p>
        </div>

        <div className="mt-8 space-y-8 text-xs leading-relaxed text-zinc-300">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">{t("privacy.sec1Title")}</h2>
            <p>{t("privacy.sec1Content")}</p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>{t("privacy.sec1Item1")}</li>
              <li>{t("privacy.sec1Item2")}</li>
              <li>{t("privacy.sec1Item3")}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">{t("privacy.sec2Title")}</h2>
            <p>{t("privacy.sec2Content")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">{t("privacy.sec3Title")}</h2>
            <p>{t("privacy.sec3Content")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">{t("privacy.sec4Title")}</h2>
            <p>{t("privacy.sec4Content")}</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
