"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { IoClose, IoMenu } from "react-icons/io5";
import { FiLogOut, FiUser } from "react-icons/fi";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const credits = session?.user?.credits !== undefined ? session.user.credits : 30;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-[#090a0f]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-[1.01] active:scale-95">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-violet-600 shadow-lg shadow-rose-600/30 font-bold text-white text-lg">
            P
          </div>
          <div>
            <span className="text-xl font-black tracking-wider text-white">
              PORN<span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">MAKE</span>
            </span>
            <span className="ml-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
              WAN 2.2 STUDIO
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link
            href="/"
            className={`transition-colors ${
              pathname === "/" ? "text-white font-bold" : "hover:text-rose-400"
            }`}
          >
            Studio
          </Link>
          <Link
            href="/gallery"
            className={`transition-colors ${
              pathname === "/gallery" ? "text-white font-bold" : "hover:text-rose-400"
            }`}
          >
            Gallery
          </Link>
          <Link
            href="/pricing"
            className={`transition-colors flex items-center gap-1.5 ${
              pathname === "/pricing" ? "text-white font-bold" : "hover:text-rose-400"
            }`}
          >
            Pricing <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] text-rose-300 font-semibold">Credits</span>
          </Link>
        </nav>

        {/* User Balance & Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/pricing"
            className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs text-zinc-300 hover:border-zinc-700 transition-colors"
          >
            <span className="text-rose-400 font-bold">⚡</span>
            <span>Balance: <strong className="text-white">{credits} Credits</strong></span>
          </Link>

          {status === "authenticated" ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-zinc-700 transition-colors"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt="User"
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <FiUser className="text-rose-400" size={14} />
                )}
                <span className="max-w-[100px] truncate">{session.user.name || session.user.email}</span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-11 w-48 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl z-50">
                  <div className="px-3 py-2 text-xs text-zinc-400 border-b border-zinc-800/80 mb-1 truncate">
                    {session.user.email}
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <FiLogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition-all hover:brightness-110 active:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/pricing"
            className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-300"
          >
            <span className="text-rose-400 font-bold">⚡</span>
            <span>{credits}</span>
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-800/80 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <IoClose size={22} /> : <IoMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="border-b border-zinc-800 bg-[#090a0f]/95 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className={`py-2 text-sm font-semibold ${pathname === "/" ? "text-rose-400 font-bold" : "text-zinc-300"}`}
            >
              Studio
            </Link>
            <Link
              href="/gallery"
              onClick={() => setIsOpen(false)}
              className={`py-2 text-sm font-semibold ${pathname === "/gallery" ? "text-rose-400 font-bold" : "text-zinc-300"}`}
            >
              Gallery
            </Link>
            <Link
              href="/pricing"
              onClick={() => setIsOpen(false)}
              className={`py-2 text-sm font-semibold ${pathname === "/pricing" ? "text-rose-400 font-bold" : "text-zinc-300"}`}
            >
              Pricing & Credits
            </Link>
            {status === "authenticated" ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="flex items-center gap-2 py-2 text-sm font-semibold text-rose-400 text-left"
              >
                <FiLogOut size={16} />
                <span>Sign Out ({session.user.email})</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="mt-2 text-center rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-600/20"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
