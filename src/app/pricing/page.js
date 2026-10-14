"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FaCheck, FaInfoCircle } from "react-icons/fa";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const PLANS = [
  { id: "basic", name: "Starter Pack", price: "$5", credits: 100, description: "Great for testing Wan 2.2 prompts and quick short generations." },
  { id: "standard", name: "Creator Pack", price: "$10", credits: 250, description: "Ideal for regular creators generating high definition videos." },
  { id: "pro", name: "Studio Pack", price: "$20", credits: 600, description: "Designed for power users demanding batch exports and high speed.", popular: true },
  { id: "business", name: "Agency Pack", price: "$50", credits: 2000, description: "Maximum value pack for high-volume commercial production." }
];

export default function Pricing() {
  const { status } = useSession();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleCheckout = async (planId) => {
    if (status !== "authenticated") {
      toast.error("Please sign in first to purchase credits.");
      return;
    }

    setLoadingPlan(planId);
    try {
      const { data } = await axios.post("/api/checkout", { planId });
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No redirection URL returned");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to trigger Stripe checkout session.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#090a0f] text-zinc-100 selection:bg-rose-500 selection:text-white">
      <Toaster position="top-right" />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8 flex flex-col gap-10 items-center">
        <div className="text-center space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full mb-1">
            <span className="text-rose-400 text-xs">⚡</span>
            <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">Pricing & Credits</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Wan 2.2 GPU Compute Credits
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Flexible pay-as-you-go credit packages for Wan 2.2 14B High-Definition video rendering. No monthly lock-in, credits never expire.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 backdrop-blur-xl ${
                plan.popular
                  ? "border-rose-500/80 bg-zinc-900/80 shadow-2xl shadow-rose-600/20 ring-1 ring-rose-500/50"
                  : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md shadow-rose-600/30">
                  Most Popular
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="mt-1 text-xs text-zinc-400 min-h-[32px]">{plan.description}</p>
              </div>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                <span className="text-xs text-zinc-500">/ one-time</span>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 mb-6 text-center">
                <div className="text-2xl font-black text-rose-400">{plan.credits}</div>
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">GPU Credits</div>
              </div>

              <ul className="mb-8 space-y-2.5 text-xs text-zinc-300 flex-1">
                <li className="flex items-center gap-2">
                  <FaCheck className="text-rose-400 shrink-0 text-[10px]" />
                  <span>Wan 2.2 (14B) & Fast Turbo</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheck className="text-rose-400 shrink-0 text-[10px]" />
                  <span>Text to Video & Image to Video</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheck className="text-rose-400 shrink-0 text-[10px]" />
                  <span>Commercial usage rights</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheck className="text-rose-400 shrink-0 text-[10px]" />
                  <span>Credits never expire</span>
                </li>
              </ul>

              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={loadingPlan === plan.id}
                className={`w-full rounded-xl py-3 text-xs font-bold transition-all shadow-md active:scale-[0.98] ${
                  plan.popular
                    ? "bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 text-white hover:brightness-110 shadow-rose-600/30"
                    : "bg-zinc-800 hover:bg-zinc-700 text-white"
                } ${loadingPlan === plan.id ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loadingPlan === plan.id ? "Redirecting..." : `Buy for ${plan.price}`}
              </button>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
