"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-zinc-800/80 bg-[#090a0f] py-8 text-center text-xs text-zinc-500 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-300">PORNMAKE</span>
          <span className="text-[10px] text-zinc-600">WAN 2.2 STUDIO</span>
          <span className="text-zinc-600">•</span>
          <span>&copy; {currentYear} All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          <Link href="/gallery" className="hover:text-rose-400 transition-colors">
            Gallery
          </Link>
          <span className="text-zinc-700">•</span>
          <Link href="/pricing" className="hover:text-rose-400 transition-colors">
            Pricing
          </Link>
          <span className="text-zinc-700">•</span>
          <a href="https://www.pornmakes.com" className="hover:text-rose-400 transition-colors">
            pornmakes.com
          </a>
        </div>
      </div>
    </footer>
  );
}
