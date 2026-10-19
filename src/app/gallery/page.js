"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMagic,
  FaVideo,
  FaLock,
  FaUnlock,
  FaGlobe,
  FaEyeSlash,
  FaCoins,
  FaShareAlt,
  FaUserCircle,
  FaShieldAlt,
  FaHeart,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { downloadMedia } from "@/lib/utils";
import { FiDownload } from "react-icons/fi";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "@/context/LanguageContext";
import toast from "react-hot-toast";

export default function GalleryPage() {
  const { data: session, status, update: updateSession } = useSession();
  const { t } = useTranslation();
  const router = useRouter();

  // Active Tab: "my" (我的视频仓库) vs "square" (创作者广场)
  const [activeTab, setActiveTab] = useState("square");
  const [myCreations, setMyCreations] = useState([]);
  const [squareCreations, setSquareCreations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Personal Vault ("all", "published", "private")
  const [vaultFilter, setVaultFilter] = useState("all");

  // Modals
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [unlockTarget, setUnlockTarget] = useState(null);
  const [publishTarget, setPublishTarget] = useState(null);
  const [customPrice, setCustomPrice] = useState(10);
  const [processing, setProcessing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Set default tab based on login status on initial mount
  useEffect(() => {
    if (status === "authenticated") {
      setActiveTab("my");
    } else if (status === "unauthenticated") {
      setActiveTab("square");
    }
  }, [status]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "my") {
        if (status === "authenticated") {
          const res = await fetch("/api/creations?tab=my");
          const data = await res.json();
          if (res.ok && Array.isArray(data)) {
            setMyCreations(data);
          }
        }
      } else {
        const res = await fetch("/api/creations?tab=square");
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setSquareCreations(data);
        }
      }
    } catch (err) {
      console.error("Error loading gallery data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, status]);

  // Fetch data whenever activeTab or status changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle publish / hide
  const handleTogglePublish = async (creation, shouldPublish, price = 10) => {
    setProcessing(true);
    try {
      const res = await fetch("/api/creations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: creation.id,
          isPublished: shouldPublish,
          price: Number(price) || 10,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to update status");
      }

      toast.success(
        shouldPublish
          ? t("gallery.statusPublished")
          : t("gallery.statusPrivate")
      );

      // Update local state in myCreations
      setMyCreations((prev) =>
        prev.map((item) =>
          item.id === creation.id
            ? { ...item, isPublished: shouldPublish, price: Number(price) || 10 }
            : item
        )
      );

      if (publishTarget?.id === creation.id) {
        setPublishTarget(null);
      }
      if (selectedVideo?.id === creation.id) {
        setSelectedVideo((prev) => ({
          ...prev,
          isPublished: shouldPublish,
          price: Number(price) || 10,
        }));
      }
    } catch (err) {
      toast.error(err.message || "Operation failed");
    } finally {
      setProcessing(false);
    }
  };

  // Unlock community video with revenue sharing
  const handleUnlockVideo = async (creation) => {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=/gallery`);
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch("/api/creations/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creationId: creation.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "insufficient_credits") {
          toast.error(
            `${t("gallery.insufficientTip")} (${data.current}/${data.needed})`
          );
          return;
        }
        throw new Error(data.error || "Failed to unlock video");
      }

      toast.success(t("gallery.unlockSuccess"));

      // Refresh session credits
      await updateSession();

      // Mark video as unlocked locally
      setSquareCreations((prev) =>
        prev.map((c) =>
          c.id === creation.id ? { ...c, isUnlocked: true } : c
        )
      );

      // Close unlock modal and directly open player
      setUnlockTarget(null);
      setSelectedVideo({
        ...creation,
        isUnlocked: true,
      });
    } catch (err) {
      toast.error(err.message || "Failed to unlock video");
    } finally {
      setProcessing(false);
    }
  };

  // Delete creation
  const handleDeleteCreation = async (id) => {
    if (!confirm(t("gallery.deleteConfirm"))) return;
    try {
      const res = await fetch(`/api/creations?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMyCreations((prev) => prev.filter((item) => item.id !== id));
        setSquareCreations((prev) => prev.filter((item) => item.id !== id));
        setSelectedVideo(null);
        toast.success(t("gallery.delete") + " OK");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Delete failed");
    }
  };

  // Filtered personal vault creations
  const filteredMyCreations = useMemo(() => {
    if (vaultFilter === "published") {
      return myCreations.filter((c) => c.isPublished);
    }
    if (vaultFilter === "private") {
      return myCreations.filter((c) => !c.isPublished);
    }
    return myCreations;
  }, [myCreations, vaultFilter]);

  const userCredits = session?.user?.credits ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-zinc-100 selection:bg-rose-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-8 space-y-3 pt-4">
          <div className="flex items-center gap-2 text-rose-500 mb-1">
            <FaVideo className="text-sm" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-400">
              {t("gallery.badge")}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            {t("gallery.title")}
          </h1>
          <p className="text-zinc-400 font-medium text-xs md:text-sm tracking-wide leading-relaxed max-w-2xl">
            {t("gallery.subtitle")}
          </p>
        </header>

        {/* Dual Tab Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-8">
          <div className="flex items-center bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800 backdrop-blur-xl">
            {/* Tab 1: My Video Vault */}
            <button
              onClick={() => setActiveTab("my")}
              className={`relative flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === "my"
                  ? "text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {activeTab === "my" && (
                <motion.div
                  layoutId="galleryTabIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl shadow-lg shadow-rose-600/30"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <FaLock className="text-xs" />
                <span>{t("gallery.tabMyVault")}</span>
                {status === "authenticated" && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/40 text-[10px] font-mono">
                    {myCreations.length}
                  </span>
                )}
              </span>
            </button>

            {/* Tab 2: Creator Square */}
            <button
              onClick={() => setActiveTab("square")}
              className={`relative flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === "square"
                  ? "text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {activeTab === "square" && (
                <motion.div
                  layoutId="galleryTabIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl shadow-lg shadow-rose-600/30"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <FaGlobe className="text-xs" />
                <span>{t("gallery.tabSquare")}</span>
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/40 text-[10px] font-mono">
                  {squareCreations.length}
                </span>
              </span>
            </button>
          </div>

          {/* Tab specific action / notice */}
          {activeTab === "my" && status === "authenticated" && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-zinc-500 mr-1 hidden sm:inline">
                Filter:
              </span>
              <button
                onClick={() => setVaultFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  vaultFilter === "all"
                    ? "bg-zinc-800 text-white border border-zinc-700"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                All ({myCreations.length})
              </button>
              <button
                onClick={() => setVaultFilter("published")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  vaultFilter === "published"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-zinc-400 hover:text-emerald-400"
                }`}
              >
                {t("gallery.statusPublished")}
              </button>
              <button
                onClick={() => setVaultFilter("private")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  vaultFilter === "private"
                    ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {t("gallery.statusPrivate")}
              </button>
            </div>
          )}

          {activeTab === "square" && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              <FaCoins className="text-rose-400 flex-shrink-0" />
              <span className="font-semibold">{t("gallery.splitNote")}</span>
            </div>
          )}
        </div>

        {/* Tab Description Banner */}
        <div className="mb-6 rounded-xl border border-zinc-800/80 bg-zinc-900/30 px-4 py-3 text-xs text-zinc-400 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>
              {activeTab === "my"
                ? t("gallery.tabMyVaultDesc")
                : t("gallery.tabSquareDesc")}
            </span>
          </p>
          {activeTab === "square" && (
            <span className="text-[11px] text-zinc-400 font-medium">
              💡 {t("gallery.creatorBonusNotice")}
            </span>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-500 font-mono tracking-wider">
              LOADING CREATIONS...
            </p>
          </div>
        ) : activeTab === "my" ? (
          /* ======================================================== */
          /* TAB 1: USER'S PERSONAL CREATIONS VAULT                  */
          /* ======================================================== */
          status !== "authenticated" ? (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 md:p-12 backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-3xl text-rose-400">
                <FaLock />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-bold text-white">
                  {t("gallery.loginToViewVaultTitle")}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {t("gallery.loginToViewVaultDesc")}
                </p>
              </div>
              <button
                onClick={() => router.push("/login?callbackUrl=/gallery")}
                className="px-8 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:brightness-110 shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                {t("gallery.loginBtn")}
              </button>
            </div>
          ) : filteredMyCreations.length === 0 ? (
            <div className="py-28 flex flex-col items-center justify-center text-center space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-12 backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center text-2xl text-zinc-400">
                <FaMagic />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-lg font-bold text-white">
                  {t("gallery.emptyMyTitle")}
                </h3>
                <p className="text-xs text-zinc-400">
                  {t("gallery.emptyMySubtitle")}
                </p>
              </div>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:brightness-110 shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                {t("gallery.goToStudio")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {filteredMyCreations.map((item) => {
                  const mediaUrl = item.videoFiles?.[0] || item.imageUrl;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3 shadow-xl transition-all duration-300 hover:border-zinc-700 hover:shadow-2xl hover:bg-zinc-900/90"
                    >
                      {/* Video Preview Area */}
                      <div
                        onClick={() => setSelectedVideo(item)}
                        className="relative aspect-video w-full overflow-hidden rounded-xl bg-black cursor-pointer"
                      >
                        {mediaUrl ? (
                          <video
                            src={mediaUrl}
                            muted
                            loop
                            playsInline
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onMouseEnter={(e) => e.target.play().catch(() => {})}
                            onMouseLeave={(e) => e.target.pause()}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-zinc-600">
                            <FaVideo size={28} />
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          {item.isPublished ? (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400 backdrop-blur-md">
                              <FaGlobe className="text-[9px]" />
                              <span>{item.price || 10} ⚡</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 rounded-full bg-zinc-900/80 border border-zinc-700 px-2 py-0.5 text-[10px] font-semibold text-zinc-400 backdrop-blur-md">
                              <FaEyeSlash className="text-[9px]" />
                              <span>{t("gallery.statusPrivate")}</span>
                            </span>
                          )}
                        </div>

                        <div className="absolute top-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-mono text-zinc-300 backdrop-blur-md">
                          {item.quality || "Wan 2.2"}
                        </div>

                        {/* Hover Overlay Play Icon */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-rose-600/90 flex items-center justify-center text-white shadow-lg">
                            <FaVideo className="text-sm" />
                          </div>
                        </div>
                      </div>

                      {/* Info & Stats */}
                      <div className="p-2 space-y-2">
                        <p
                          onClick={() => setSelectedVideo(item)}
                          className="line-clamp-2 text-xs text-zinc-200 font-medium hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          {item.prompt}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          {item.isPublished && (
                            <span className="text-emerald-400 font-medium">
                              {item.salesCount || 0} {t("gallery.salesCount")} (
                              +{item.earnedCredits || 0} ⚡)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                        {item.isPublished ? (
                          <button
                            onClick={() => handleTogglePublish(item, false)}
                            disabled={processing}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold transition-all cursor-pointer"
                          >
                            <FaEyeSlash className="text-[10px]" />
                            <span>{t("gallery.hideAction")}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setPublishTarget(item);
                              setCustomPrice(item.price || 10);
                            }}
                            disabled={processing}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all cursor-pointer"
                          >
                            <FaGlobe className="text-[10px]" />
                            <span>{t("gallery.publishAction")}</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedVideo(item)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
                        >
                          {t("gallery.playVideo")}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )
        ) : (
          /* ======================================================== */
          /* TAB 2: CREATOR SQUARE (COMMUNITY PAID SHOWCASE)         */
          /* ======================================================== */
          squareCreations.length === 0 ? (
            <div className="py-28 flex flex-col items-center justify-center text-center space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-12 backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center text-2xl text-zinc-400">
                <FaGlobe />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-lg font-bold text-white">
                  {t("gallery.emptySquareTitle")}
                </h3>
                <p className="text-xs text-zinc-400">
                  {t("gallery.emptySquareSubtitle")}
                </p>
              </div>
              <button
                onClick={() => setActiveTab("my")}
                className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:brightness-110 shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                {t("gallery.tabMyVault")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {squareCreations.map((item) => {
                  const mediaUrl = item.videoFiles?.[0] || item.imageUrl;
                  const isAccessible = item.isUnlocked || item.isOwner;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3 shadow-xl transition-all duration-300 hover:border-zinc-700 hover:shadow-2xl hover:bg-zinc-900/90"
                    >
                      {/* Thumbnail / Video Container */}
                      <div
                        onClick={() => {
                          if (isAccessible) {
                            setSelectedVideo(item);
                          } else {
                            setUnlockTarget(item);
                          }
                        }}
                        className="relative aspect-video w-full overflow-hidden rounded-xl bg-black cursor-pointer"
                      >
                        {mediaUrl ? (
                          <video
                            src={mediaUrl}
                            muted
                            loop
                            playsInline
                            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                              !isAccessible
                                ? "filter blur-[6px] brightness-75 scale-105"
                                : ""
                            }`}
                            onMouseEnter={(e) => {
                              if (isAccessible) e.target.play().catch(() => {});
                            }}
                            onMouseLeave={(e) => {
                              if (isAccessible) e.target.pause();
                            }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-zinc-600">
                            <FaVideo size={28} />
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                          {item.isOwner ? (
                            <span className="flex items-center gap-1 rounded-full bg-rose-950/80 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-300 backdrop-blur-md">
                              <FaUserCircle className="text-[9px]" />
                              <span>{t("gallery.myWorkBadge")}</span>
                            </span>
                          ) : item.isUnlocked ? (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400 backdrop-blur-md">
                              <FaUnlock className="text-[9px]" />
                              <span>{t("gallery.unlockedBadge")}</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 rounded-full bg-black/80 border border-rose-500/50 px-2.5 py-0.5 text-[10px] font-bold text-rose-400 backdrop-blur-md shadow-lg">
                              <FaLock className="text-[9px]" />
                              <span>{item.price || 10} Credits</span>
                            </span>
                          )}
                        </div>

                        <div className="absolute top-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-mono text-zinc-300 backdrop-blur-md z-10">
                          {item.quality || "Wan 2.2"}
                        </div>

                        {/* Locked Overlay Screen */}
                        {!isAccessible && (
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-4 transition-all group-hover:bg-black/40">
                            <div className="w-11 h-11 rounded-full bg-rose-600/90 flex items-center justify-center text-white shadow-xl shadow-rose-600/40 mb-2 transform group-hover:scale-110 transition-transform">
                              <FaLock className="text-base" />
                            </div>
                            <span className="text-xs font-bold text-white tracking-wide">
                              {t("gallery.lockedBadge")}
                            </span>
                            <span className="text-[10px] text-zinc-300 mt-0.5">
                              {item.price || 10} {t("gallery.priceUnit")}
                            </span>
                          </div>
                        )}

                        {/* Unlocked Hover Play Overlay */}
                        {isAccessible && (
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-rose-600/90 flex items-center justify-center text-white shadow-lg">
                              <FaVideo className="text-sm" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content details */}
                      <div className="p-2 space-y-2">
                        <p
                          onClick={() => {
                            if (isAccessible) setSelectedVideo(item);
                            else setUnlockTarget(item);
                          }}
                          className="line-clamp-2 text-xs text-zinc-200 font-medium hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          {item.prompt}
                        </p>

                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-800/60">
                          <div className="flex items-center gap-1.5 text-zinc-400">
                            <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-300">
                              <FaUserCircle />
                            </div>
                            <span className="font-medium truncate max-w-[100px]">
                              {item.creator?.name || "Creator"}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500">
                            {item.salesCount || 0} {t("gallery.salesCount")}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Action Bar */}
                      <div className="pt-2 border-t border-zinc-800/80">
                        {isAccessible ? (
                          <button
                            onClick={() => setSelectedVideo(item)}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-white text-xs font-bold transition-all cursor-pointer"
                          >
                            <FaVideo className="text-[11px] text-rose-400" />
                            <span>{t("gallery.playVideo")}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setUnlockTarget(item)}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold shadow-md shadow-rose-600/30 hover:brightness-110 transition-all cursor-pointer"
                          >
                            <FaLock className="text-[11px]" />
                            <span>
                              {t("gallery.actions.unlock")} ({item.price || 10}⚡)
                            </span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL 1: UNLOCK VIDEO WITH REVENUE SHARING               */}
      {/* ======================================================== */}
      {unlockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-rose-400">
                <FaLock className="text-base" />
                <h3 className="text-base font-bold text-white">
                  {t("gallery.unlockModalTitle")}
                </h3>
              </div>
              <button
                onClick={() => setUnlockTarget(null)}
                className="w-7 h-7 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Video Summary */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div className="w-24 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0 relative">
                {unlockTarget.videoFiles?.[0] ? (
                  <video
                    src={unlockTarget.videoFiles[0]}
                    className="w-full h-full object-cover filter blur-[3px]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <FaVideo />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-rose-400">
                  <FaLock className="text-xs" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="line-clamp-2 text-xs text-zinc-200 font-medium">
                  {unlockTarget.prompt}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-400">
                  <span>{t("gallery.creator")}: {unlockTarget.creator?.name || "Community Creator"}</span>
                  <span>•</span>
                  <span>{unlockTarget.quality || "Wan 2.2"}</span>
                </div>
              </div>
            </div>

            {/* Split Breakdown Details */}
            <div className="space-y-3 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs">
              <div className="flex items-center justify-between text-zinc-300 font-semibold">
                <span>{t("gallery.unlockCost")}</span>
                <span className="text-base font-black text-rose-400">
                  {unlockTarget.price || 10} {t("gallery.priceUnit")}
                </span>
              </div>

              {/* 60% Creator / 20% Maintenance / 20% Platform */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <FaHeart className="text-[10px]" />
                    <span>创作者收益 (60% 创作者将用于继续生成创作)</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    +{Math.floor((unlockTarget.price || 10) * 0.6)} ⚡
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <FaShieldAlt className="text-[10px]" />
                    <span>平台基础设施与维护成本 (20%)</span>
                  </span>
                  <span className="font-mono text-zinc-400">
                    {Math.floor((unlockTarget.price || 10) * 0.2)} ⚡
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <FaCoins className="text-[10px]" />
                    <span>平台运营服务 (20%)</span>
                  </span>
                  <span className="font-mono text-zinc-400">
                    {(unlockTarget.price || 10) -
                      Math.floor((unlockTarget.price || 10) * 0.6) -
                      Math.floor((unlockTarget.price || 10) * 0.2)}{" "}
                    ⚡
                  </span>
                </div>
              </div>

              {/* User Balance */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                <span className="text-zinc-400">{t("gallery.yourBalance")}</span>
                <span className="font-bold text-white font-mono">
                  {userCredits} ⚡
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            {status !== "authenticated" ? (
              <button
                onClick={() => router.push("/login?callbackUrl=/gallery")}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                {t("gallery.loginBtn")}
              </button>
            ) : userCredits < (unlockTarget.price || 10) ? (
              <div className="space-y-2">
                <p className="text-center text-xs text-rose-400 font-medium">
                  {t("gallery.insufficientTip")}
                </p>
                <button
                  onClick={() => router.push("/pricing")}
                  className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-rose-600/30 cursor-pointer"
                >
                  {t("gallery.topUpBtn")}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setUnlockTarget(null)}
                  className="flex-1 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl font-semibold text-xs cursor-pointer"
                >
                  {t("admin.cancel")}
                </button>
                <button
                  onClick={() => handleUnlockVideo(unlockTarget)}
                  disabled={processing}
                  className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50"
                >
                  {processing ? t("pricing.processing") : t("gallery.confirmUnlockBtn")}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: PUBLISH / EDIT PRICE MODAL                      */}
      {/* ======================================================== */}
      {publishTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <FaGlobe className="text-base" />
                <h3 className="text-base font-bold text-white">
                  {t("gallery.publishAction")}
                </h3>
              </div>
              <button
                onClick={() => setPublishTarget(null)}
                className="w-7 h-7 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {t("gallery.priceDefaultTip")}
            </p>

            {/* Price Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300">
                {t("gallery.priceLabel")} ({t("gallery.priceUnit")})
              </label>
              <div className="flex items-center gap-2">
                {[5, 10, 20, 50].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCustomPrice(val)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      customPrice === val
                        ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    {val} ⚡
                  </button>
                ))}
              </div>
            </div>

            {/* Split explanation */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <FaCoins />
                <span>创作者 60% 算力收益直达</span>
              </div>
              <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                其他用户每次以 {customPrice} 算力解锁，您将立即获得{" "}
                <span className="font-bold text-white">
                  {Math.floor(customPrice * 0.6)} ⚡
                </span>{" "}
                充入您的账户，随时可用于继续生成 AI 视频！
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setPublishTarget(null)}
                className="flex-1 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl font-semibold text-xs cursor-pointer"
              >
                {t("admin.cancel")}
              </button>
              <button
                onClick={() =>
                  handleTogglePublish(publishTarget, true, customPrice)
                }
                disabled={processing}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
              >
                {processing ? t("pricing.processing") : t("gallery.publishAction")}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: FULL HD VIDEO PLAYER & DETAIL MODAL             */}
      {/* ======================================================== */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4">
            {/* Top Close Button */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/70 text-zinc-300 hover:text-white flex items-center justify-center text-sm border border-zinc-800 cursor-pointer"
            >
              ✕
            </button>

            {/* Video Player */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
              <video
                src={selectedVideo.videoFiles?.[0] || selectedVideo.imageUrl}
                controls
                autoPlay
                className="h-full w-full object-contain"
              />
            </div>

            {/* Prompt & Details */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-500 font-bold uppercase tracking-wider">
                <span>{t("gallery.modalPrompt")}</span>
                <span className="font-mono text-rose-400 font-normal">
                  {selectedVideo.quality || "Wan 2.2"} •{" "}
                  {new Date(selectedVideo.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-zinc-200 mt-1 leading-relaxed">
                {selectedVideo.prompt}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={async () => {
                  setDownloading(true);
                  await downloadMedia(
                    selectedVideo.videoFiles?.[0] || selectedVideo.imageUrl,
                    `pornmake-${selectedVideo.id}.mp4`
                  );
                  setDownloading(false);
                }}
                disabled={downloading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/30 hover:brightness-110 cursor-pointer disabled:opacity-50"
              >
                <FiDownload />
                <span>
                  {downloading ? t("pricing.processing") : t("gallery.download")} MP4
                </span>
              </button>

              <div className="flex items-center gap-2">
                {/* Publish / Hide toggle if owned by current user */}
                {(selectedVideo.isOwner ||
                  (status === "authenticated" &&
                    selectedVideo.userId === session?.user?.id)) && (
                  <>
                    {selectedVideo.isPublished ? (
                      <button
                        onClick={() => handleTogglePublish(selectedVideo, false)}
                        disabled={processing}
                        className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 cursor-pointer transition-colors"
                      >
                        {t("gallery.hideAction")}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setPublishTarget(selectedVideo);
                          setCustomPrice(selectedVideo.price || 10);
                        }}
                        disabled={processing}
                        className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 cursor-pointer transition-colors"
                      >
                        {t("gallery.publishAction")}
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteCreation(selectedVideo.id)}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors"
                    >
                      {t("gallery.delete")}
                    </button>
                  </>
                )}

                <button
                  onClick={() => setSelectedVideo(null)}
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
