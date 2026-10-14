"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaGoogle, FaInfoCircle } from "react-icons/fa";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("callbackUrl") || searchParams.get("next") || "/";
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push(next);
    }
  }, [status, router, next]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: next });
    } catch (err) {
      console.error(err);
      toast.error("Failed to initiate Google sign in.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090a0f] px-6 text-zinc-100 select-none">
      <Toaster position="top-right" />
      <div className="relative bg-zinc-900/60 border border-zinc-800/80 w-full max-w-md rounded-2xl p-8 space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center text-center space-y-3">
          <Link href="/" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-violet-600 shadow-xl shadow-rose-600/30 text-2xl font-black text-white">
            P
          </Link>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Sign In to PornMake
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed px-2">
            Access Wan 2.2 Studio to generate hyper-realistic, cinematic AI videos.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3.5 bg-white text-neutral-900 hover:bg-zinc-100 rounded-xl text-xs font-bold flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-60"
          >
            <FaGoogle className="text-sm text-red-500" />
            <span>{isLoading ? "Connecting..." : "Continue with Google"}</span>
          </button>
          
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-400 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-semibold">
              <span>⚡</span>
              <span>New Account Bonus</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Sign up today and receive initial credits to test out Wan 2.2 text-to-video & image-to-video rendering.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-zinc-950/40 border border-zinc-800/80 p-3.5 rounded-xl text-[11px] leading-relaxed text-zinc-400">
          <FaInfoCircle className="text-rose-400 text-xs shrink-0 mt-0.5" />
          <span>
            By signing in, you agree to our Terms of Service. All generated videos and prompt histories remain private to your account.
          </span>
        </div>

        <div className="text-center pt-2">
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            ← Back to Studio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#090a0f] text-zinc-100">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
