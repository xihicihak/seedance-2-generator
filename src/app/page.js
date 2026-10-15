"use client";

import React, { useState, useRef } from "react";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("t2v");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [modelQuality, setModelQuality] = useState("wan2.2-14b");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [referenceImage, setReferenceImage] = useState(null);
  const [referenceImageUrl, setReferenceImageUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setReferenceImageUrl(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setErrorMsg("");
    setIsGenerating(true);
    setProgress(10);
    setStatusMessage("Submitting task to Wan 2.2 GPU cluster...");

    try {
      let finalImageUrl = referenceImageUrl;

      // If in I2V mode with a file, attempt uploading to get a clean server/ComfyUI reference
      if (activeTab === "i2v" && referenceImage) {
        setStatusMessage("Uploading reference image...");
        try {
          const uploadData = new FormData();
          uploadData.append("file", referenceImage);
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: uploadData,
          });
          if (uploadRes.ok) {
            const upResult = await uploadRes.json();
            if (upResult.url) {
              finalImageUrl = upResult.url;
            }
          }
        } catch (uploadErr) {
          console.warn("[UPLOAD_WARNING] Fallback to client base64:", uploadErr);
        }
      }

      setStatusMessage("Submitting task to Wan 2.2 GPU cluster...");

      // Send task to /api/generate
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          negativePrompt,
          aspectRatio,
          quality: modelQuality,
          mode: activeTab,
          imageUrl: finalImageUrl || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start generation task");
      }

      const taskId = data.taskId;
      setStatusMessage("Synthesizing latent frames with Wan 2.2...");
      setProgress(25);

      // Poll task status
      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/generate?taskId=${encodeURIComponent(taskId)}`);
          if (!pollRes.ok) return;

          const pollData = await pollRes.json();
          if (pollData.status === "completed" && pollData.videoUrl) {
            clearInterval(pollInterval);
            setProgress(100);
            setIsGenerating(false);
            setGeneratedVideo(pollData.videoUrl);
            setStatusMessage("Rendering complete!");
          } else if (pollData.status === "failed") {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setErrorMsg(pollData.error || "Video generation failed on GPU worker.");
          } else {
            if (pollData.progress) {
              setProgress(pollData.progress);
            } else {
              setProgress((prev) => Math.min(95, prev + 5));
            }
          }
        } catch (pollErr) {
          console.warn("[POLL_WARNING]", pollErr);
        }
      }, 1500);

    } catch (err) {
      console.error("[GENERATE_ERROR]", err);
      setIsGenerating(false);
      setErrorMsg(err.message || "Failed to initiate video generation");
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 selection:bg-rose-500 selection:text-white">
      {/* 唯一全站统一顶栏 */}
      <Navbar />

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
                🎬 Text to Video
              </button>
              <button
                onClick={() => setActiveTab("i2v")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  activeTab === "i2v"
                    ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-600/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                🖼️ Image to Video
              </button>
            </div>

            {/* 图生视频上传区 */}
            {activeTab === "i2v" && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-zinc-800 hover:border-rose-500/50 bg-zinc-950/40 p-6 text-center transition-all cursor-pointer relative overflow-hidden"
                >
                  {referenceImageUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={referenceImageUrl}
                        alt="Reference"
                        className="max-h-36 rounded-lg object-contain border border-zinc-800"
                      />
                      <span className="text-xs text-rose-400 font-medium">Click to change reference image</span>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto text-2xl">📷</div>
                      <p className="mt-2 text-sm font-medium text-zinc-300">Click to upload reference image</p>
                      <p className="text-xs text-zinc-500 mt-1">Supports PNG, JPG, WEBP (Max 20MB)</p>
                    </>
                  )}
                </div>
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
                  ✨ Try Sample Prompt
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

            {errorMsg && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* 提交生成按钮 */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-xl transition-all ${
                isGenerating || !prompt.trim()
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
                  ✨ Generate Video (Cost: 10 Credits)
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
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-rose-600 to-pink-600 shadow-lg shadow-rose-600/50 text-2xl">
                    ✨
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Rendering with Wan 2.2...</h3>
                  <p className="text-xs text-zinc-400 mt-1">{statusMessage || "Synthesizing frames & motion interpolation"}</p>
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
                    download="wan2.2-video.mp4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 text-xs font-semibold text-white hover:bg-zinc-700 transition-all"
                  >
                    ⬇️ Download MP4
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
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-2xl">
                  ▶️
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
            <span className="text-rose-500 text-lg">🛡️</span>
            <div>
              <h4 className="text-sm font-semibold text-white">Full Privacy & Encryption</h4>
              <p className="text-xs text-zinc-500 mt-1">All generation prompts and uploads are encrypted and private to your account.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-pink-500 text-lg">⚡</span>
            <div>
              <h4 className="text-sm font-semibold text-white">Instant GPU Rendering</h4>
              <p className="text-xs text-zinc-500 mt-1">Powered by clustered Wan 2.2 nodes with high-speed rendering pipelines.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-violet-500 text-lg">⚖️</span>
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
