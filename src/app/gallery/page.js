"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMagic,
  FaCalendarAlt,
  FaVideo,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { downloadMedia } from "@/lib/utils";
import { FiDownload } from "react-icons/fi";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "@/context/LanguageContext";

export default function CreationsPage() {
  const { status } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const DEMO_SHOWCASE = [
    {
      id: "demo_1",
      prompt: "Cyberpunk protagonist on neon-lit rain rooftop, hyper-realistic motion, cinematic lighting, 8k",
      videoFiles: ["https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-41551-large.mp4"],
      quality: "Wan 2.2 14B",
      status: "completed",
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo_2",
      prompt: "Elegantly animated fashion portrait with dramatic rim lighting and dynamic particle motion",
      videoFiles: ["https://assets.mixkit.co/videos/preview/mixkit-top-aerial-shot-of-seashore-with-rocks-1090-large.mp4"],
      quality: "Wan 2.2 Turbo",
      status: "completed",
      createdAt: new Date().toISOString(),
    }
  ];

  useEffect(() => {
    if (status === "authenticated") {
      fetchCreations();
    } else if (status === "unauthenticated") {
      setCreations(DEMO_SHOWCASE);
      setLoading(false);
    }
  }, [status]);

  const fetchCreations = async () => {
    try {
      const res = await fetch("/api/creations");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setCreations(data.length > 0 ? data : DEMO_SHOWCASE);
      }
    } catch (error) {
      console.error("Error fetching creations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCreation = async (id) => {
    if (id.startsWith("demo_")) {
      setCreations((prev) => prev.filter((item) => item.id !== id));
      setSelectedImage(null);
      return;
    }
    if (!confirm(t("gallery.deleteConfirm"))) return;
    try {
      const res = await fetch(`/api/creations?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCreations((prev) => prev.filter((item) => item.id !== id));
        setSelectedImage(null);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-zinc-100 selection:bg-rose-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-10 space-y-3 pt-4">
          <div className="flex items-center gap-3 text-rose-500 mb-1">
            <FaCalendarAlt className="text-sm" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-rose-400">
              {t("gallery.badge")}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            {t("gallery.title")}
          </h1>
          <p className="text-zinc-400 font-medium text-xs tracking-wider leading-relaxed max-w-xl">
            {t("gallery.subtitle")}
          </p>
        </header>

        {loading ? (
          <div className="py-32 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : creations.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-12 backdrop-blur-xl">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center text-2xl text-zinc-400">
              <FaMagic />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">{t("gallery.emptyTitle")}</h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                {t("gallery.emptySubtitle")}
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:brightness-110 shadow-lg shadow-rose-600/30"
            >
              {t("gallery.goToStudio")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {creations.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedImage(item)}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 p-2 shadow-lg transition-all hover:border-rose-500/50"
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                    {item.videoFiles?.[0] || item.imageUrl ? (
                      <video
                        src={item.videoFiles?.[0] || item.imageUrl}
                        muted
                        loop
                        playsInline
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onMouseEnter={(e) => e.target.play().catch(() => {})}
                        onMouseLeave={(e) => e.target.pause()}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-600">
                        <FaVideo size={24} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                      {item.quality || "Wan 2.2"}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-xs text-zinc-300 font-medium">
                      {item.prompt}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      <span className="capitalize text-rose-400">{item.status}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Video Detail Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
              <video
                src={selectedImage.videoFiles?.[0] || selectedImage.imageUrl}
                controls
                autoPlay
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider text-zinc-500 font-bold">{t("gallery.modalPrompt")}</h4>
              <p className="text-sm text-zinc-200 mt-1">{selectedImage.prompt}</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={async () => {
                  setDownloading(true);
                  await downloadMedia(selectedImage.videoFiles?.[0] || selectedImage.imageUrl, `pornmake-${selectedImage.id}.mp4`);
                  setDownloading(false);
                }}
                disabled={downloading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/30 hover:brightness-110 cursor-pointer"
              >
                <FiDownload />
                <span>{downloading ? t("pricing.processing") : t("gallery.download")} MP4</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteCreation(selectedImage.id)}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors"
                >
                  {t("gallery.delete")}
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
                >
                  {t("admin.cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
