"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { FiGlobe, FiCheck, FiChevronDown } from "react-icons/fi";

export default function LanguageSelector({ variant = "default" }) {
  const { locale, setLocale, languages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (variant === "mobile-list") {
    return (
      <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
        <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <FiGlobe className="text-rose-400" />
          <span>Language / 语言</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLocale(lang.code);
              }}
              className={`flex items-center justify-between gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all ${
                locale === lang.code
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold"
                  : "bg-zinc-900/60 text-zinc-300 border border-zinc-800/80 hover:bg-zinc-800"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span>{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </span>
              {locale === lang.code && <FiCheck className="text-rose-400 text-xs shrink-0" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/70 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all backdrop-blur-md"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <FiGlobe className="text-rose-400 text-sm" />
        <span className="flex items-center gap-1">
          <span>{currentLang.flag}</span>
          <span className="hidden sm:inline">{currentLang.nativeName}</span>
        </span>
        <FiChevronDown
          className={`text-zinc-400 transition-transform duration-200 text-xs ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 origin-top-right rounded-2xl border border-zinc-800 bg-zinc-950/95 p-1.5 shadow-2xl backdrop-blur-xl z-[60] animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800/80 mb-1">
            Select Language
          </div>
          <div className="space-y-0.5">
            {languages.map((lang) => {
              const isSelected = locale === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLocale(lang.code);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-rose-500/15 text-rose-300 font-bold shadow-sm"
                      : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </span>
                  {isSelected && <FiCheck className="text-rose-400 text-xs shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
