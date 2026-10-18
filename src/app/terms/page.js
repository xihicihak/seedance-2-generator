"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "@/context/LanguageContext";

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-[#090a0f] text-zinc-100 selection:bg-rose-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-4 border-b border-zinc-800 pb-8">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
            {t("terms.badge")}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            {t("terms.title")}
          </h1>
          <p className="text-xs text-zinc-400">
            {t("terms.lastUpdated")}
          </p>
        </div>

        <div className="mt-8 space-y-8 text-xs leading-relaxed text-zinc-300">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">{t("terms.sec1Title")}</h2>
            <p>{t("terms.sec1Content")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">{t("terms.sec2Title")}</h2>
            <p>{t("terms.sec2Content")}</p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>{t("terms.sec2Item1")}</li>
              <li>{t("terms.sec2Item2")}</li>
              <li>{t("terms.sec2Item3")}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">{t("terms.sec3Title")}</h2>
            <p>{t("terms.sec3Content")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">{t("terms.sec4Title")}</h2>
            <p>{t("terms.sec4Content")}</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
