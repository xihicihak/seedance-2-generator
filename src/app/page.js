"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Video, 
  Image as ImageIcon, 
  Play, 
  Download, 
  Flame, 
  Zap, 
  ShieldCheck, 
  Layers
} from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("t2v");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [modelQuality, setModelQuality] = useState("wan2.2-14b");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState(null);

  const handleGenerate = () => {
    if (!prompt) return;
    setIsGenerating(true);
    setProgress(15);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 15;
      });
    }, 1500);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setIsGenerating(false);
      setGeneratedVideo("https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-41551-large.mp4");
    }, 8000);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 selection:bg-rose-500 selection:text-white">
      {/* 顶部高端导航栏 */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-[#090a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-violet-600 shadow-lg shadow-rose-600/30">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-wider text-white">
                PORN<span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">MAKE</span>
              </span>
              <span className="ml-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
                WAN 2.2 STUDIO
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="/" className="text-white hover:text-rose-400 transition-colors">
              Studio
            </Link>
            <Link href="/gallery" className="hover:text-rose-400 transition-colors">
              Explore Gallery
            </Link>
            <Link href="/pricing" className="hover:text-rose-400 transition-colors flex items-center gap-1.5">
              Pricing <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] text-rose-300">Credits</span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400">
              <Zap className="h-3.5 w-3.5 text-rose-400" />
              <span>Balance: <strong className="text-white">30 Credits</strong></span>
            </div>
            <Link
              href="/login"
              className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition-all hover:brightness-110"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* 主工作区 */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Next-Gen AI Video Generator
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Powered by Wan 2.2 Engine. Transform text & photos into hyper-realistic, dynamic 4K videos.
          </p>
        </div>

        {/* 核心双栏操作区 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 左侧控制台 */}
          <div className="lg:col-span-7 space-y-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl shadow-2xl">
            {/* 模式切换 */}
            <div className="flex rounded-xl bg-zinc-950/80 p-1 border border-zinc-800/60">
              <button
                onClick={() => setActiveTab("t2v")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  activeTab === "t2v"
                    ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-600/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Video className="h-4 w-4" />
                Text to Video
              </button>
              <button
                onClick={() => setActiveTab("i2v")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  activeTab === "i2v"
                    ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-600/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                Image to Video
              </button>
            </div>

            {/* 图生视频上传区 */}
            {activeTab === "i2v" && (
              <div className="rounded-xl border-2 border-dashed border-zinc-800 hover:border-rose-500/50 bg-zinc-950/40 p-6 text-center transition-all cursor-pointer">
                <ImageIcon className="mx-auto h-8 w-8 text-rose-400/80" />
                <p className="mt-2 text-sm font-medium text-zinc-300">Click to upload reference image</p>
                <p className="text-xs text-zinc-500 mt-1">Supports PNG, JPG, WEBP (Max 20MB)</p>
              </div>
            )}

            {/* Prompt 输入框 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Prompt Description
                </label>
                <button 
                  onClick={() => setPrompt("A stunning cybernetic female model walking through neon-lit streets in rain, cinematic lighting, 8k")}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="h-3 w-3" /> Try Sample Prompt
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder={
                  activeTab === "t2v"
                    ? "Describe the visual details, lighting, action and atmosphere in detail..."
                    : "Describe how you want the uploaded photo to animate or transform..."
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition-all resize-none"
              />
            </div>

            {/* Negative Prompt */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Negative Prompt (Optional)
              </label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="blurry, distorted faces, extra limbs, low resolution, artifacts"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/50"
              />
            </div>

            {/* 画面比例与模型设置 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["16:9", "9:16", "1:1"].map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`rounded-lg py-2 text-xs font-bold transition-all border ${
                        aspectRatio === ratio
                          ? "border-rose-500 bg-rose-500/20 text-rose-300"
                          : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Engine Quality
                </label>
                <select
                  value={modelQuality}
                  onChange={(e) => setModelQuality(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-medium text-zinc-200 focus:border-rose-500 focus:outline-none"
                >
                  <option value="wan2.2-14b">Wan 2.2 Ultra (14B High-Def)</option>
                  <option value="wan2.2-fast">Wan 2.2 Fast Turbo (8B)</option>
                </select>
              </div>
            </div>

            {/* 提交生成按钮 */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-xl transition-all ${
                isGenerating || !prompt
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 text-white hover:brightness-110 shadow-rose-600/30"
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating Video ({progress}%)...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Video (Cost: 10 Credits)
                </>
              )}
            </button>
          </div>

          {/* 右侧展示视窗 */}
          <div className="lg:col-span-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center min-h-[460px]">
            {isGenerating ? (
              <div className="w-full text-center space-y-4 py-16">
                <div className="relative mx-auto h-20 w-20 flex items-center justify-center">
                  <div className="absolute inset-0 animate-ping rounded-full bg-rose-600/30" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-rose-600 to-pink-600 shadow-lg shadow-rose-600/50">
                    <Sparkles className="h-8 w-8 text-white animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Rendering with Wan 2.2...</h3>
                  <p className="text-xs text-zinc-400 mt-1">Synthesizing frames & motion interpolation</p>
                </div>
                <div className="w-3/4 mx-auto bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-rose-500 to-pink-500 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : generatedVideo ? (
              <div className="w-full space-y-4">
                <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-black aspect-video flex items-center justify-center">
                  <video
                    src={generatedVideo}
                    controls
                    autoPlay
                    loop
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <a
                    href={generatedVideo}
                    download
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 text-xs font-semibold text-white hover:bg-zinc-700 transition-all"
                  >
                    <Download className="h-3.5 w-3.5" /> Download MP4
                  </a>
                  <button
                    onClick={() => setGeneratedVideo(null)}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-medium text-zinc-400 hover:text-white"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-zinc-500 space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950">
                  <Play className="h-6 w-6 text-zinc-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-300">Ready to Create</p>
                  <p className="text-xs text-zinc-500">Your generated video will appear here in HD</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部保障与特色 */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-zinc-800/80 pt-10 text-zinc-400">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-rose-500 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">Full Privacy & Encryption</h4>
              <p className="text-xs text-zinc-500 mt-1">All generation prompts and uploads are encrypted and private to your account.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-pink-500 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">Instant GPU Rendering</h4>
              <p className="text-xs text-zinc-500 mt-1">Powered by clustered Wan 2.2 nodes with high-speed rendering pipelines.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Layers className="h-5 w-5 text-violet-500 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">Commercial Rights Included</h4>
              <p className="text-xs text-zinc-500 mt-1">100% royalty-free ownership for all videos generated on PornMake.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
