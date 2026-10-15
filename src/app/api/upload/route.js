import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import config from "@/lib/config";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No valid image file provided" }, { status: 400 });
    }

    const comfyApiUrl = process.env.COMFYUI_API_URL || config.ai.comfyui.apiUrl;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. If ComfyUI is configured, attempt uploading directly to ComfyUI /upload/image
    if (comfyApiUrl && !comfyApiUrl.includes("127.0.0.1")) {
      try {
        const comfyFormData = new FormData();
        const blob = new Blob([buffer], { type: file.type || "image/png" });
        comfyFormData.append("image", blob, file.name || "reference.png");
        comfyFormData.append("overwrite", "true");

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const comfyRes = await fetch(`${comfyApiUrl}/upload/image`, {
          method: "POST",
          body: comfyFormData,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (comfyRes.ok) {
          const comfyData = await comfyRes.json();
          return NextResponse.json({
            success: true,
            url: comfyData.name,
            filename: comfyData.name,
            source: "comfyui",
          });
        }
      } catch (comfyErr) {
        console.warn("[UPLOAD] Could not upload directly to ComfyUI:", comfyErr.message);
      }
    }

    // 2. Fallback: Base64 Data URL (self-contained, works with Wan 2.2 pipelines & previews)
    const mimeType = file.type || "image/png";
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      filename: file.name || "reference.png",
      source: "data_url",
    });
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
