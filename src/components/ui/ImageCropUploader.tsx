"use client";
/**
 * ImageCropUploader — Reusable portrait photo upload with crop modal.
 *
 * Usage:
 *   <ImageCropUploader
 *     currentUrl={form.photo_url}
 *     onUpload={(url) => setForm(p => ({ ...p, photo_url: url }))}
 *     folder="faculty"           // Supabase storage folder
 *     aspectRatio={3 / 4}        // Fixed 3:4 portrait (default)
 *     label="Upload Photo"
 *   />
 */

import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { Upload, RotateCcw, ZoomIn, ZoomOut, Check, X, ImageIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropUploaderProps {
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  folder?: string;
  aspectRatio?: number; // default 3/4
  label?: string;
  maxSizeMB?: number;   // default 5
  targetQuality?: number; // 0-1, default 0.85
}

// ─── Canvas crop helper ────────────────────────────────────────────────────────
async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: Area,
  targetQuality: number
): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  // Use exact pixel crop dimensions for the canvas
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Canvas is empty"));
        else resolve(blob);
      },
      "image/jpeg",
      targetQuality
    );
  });
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ImageCropUploader({
  currentUrl,
  onUpload,
  folder = "faculty",
  aspectRatio = 3 / 4,
  label = "Upload Photo",
  maxSizeMB = 5,
  targetQuality = 0.85,
}: ImageCropUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Raw image src (from file reader, before crop)
  const [rawSrc, setRawSrc] = useState<string | null>(null);

  // Cropper state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // UI state
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ── File selected ────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File must be under ${maxSizeMB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRawSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setModalOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Crop complete callback ────────────────────────────────────────────────
  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  // ── Reset crop position ───────────────────────────────────────────────────
  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  // ── Save: crop → compress → upload ───────────────────────────────────────
  const handleSave = async () => {
    if (!rawSrc || !croppedAreaPixels) return;
    setUploading(true);

    try {
      // 1. Crop on canvas
      const blob = await getCroppedBlob(rawSrc, croppedAreaPixels, targetQuality);

      // 2. Build FormData
      const formData = new FormData();
      formData.append("file", blob, `crop_${Date.now()}.jpg`);
      formData.append("folder", folder);

      // 3. Upload
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      // 4. Done
      onUpload(data.url);
      setModalOpen(false);
      setRawSrc(null);
      toast.success("Photo saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save photo");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    setRawSrc(null);
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Thumbnail + upload button ────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3">
        {/* Preview box — always 3:4 ratio */}
        <div
          className="relative overflow-hidden rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 group cursor-pointer"
          style={{ width: 128, height: 171 }} // 128 × 171 ≈ 3:4
          onClick={() => fileInputRef.current?.click()}
        >
          {currentUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentUrl}
                alt="Preview"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-semibold px-3 py-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                  Change
                </span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-center p-3">
              <ImageIcon size={28} className="text-gray-300" />
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider leading-tight">
                Click to Upload
              </span>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 w-32 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition-colors"
        >
          <Upload size={13} />
          {currentUrl ? "Change Photo" : label}
        </button>
        <p className="text-[10px] text-gray-400 text-center leading-tight">
          JPG, PNG or WEBP<br />Max {maxSizeMB}MB · 3:4 crop
        </p>
      </div>

      {/* ── Crop Modal ───────────────────────────────────────────────────── */}
      {modalOpen && rawSrc && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-base" style={{ fontFamily: "var(--font-serif)" }}>
                  Adjust Photo
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">Drag to reposition · Scroll to zoom</p>
              </div>
              <button
                onClick={handleCancel}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            {/* Cropper area — fixed 3:4 container */}
            <div className="relative bg-gray-900" style={{ height: 380 }}>
              <Cropper
                image={rawSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid={false}
                cropShape="rect"
                style={{
                  containerStyle: { borderRadius: 0 },
                  cropAreaStyle: {
                    border: "2px solid #C9A84C",
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                  },
                }}
              />
            </div>

            {/* Controls */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 space-y-3">
              {/* Zoom slider */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200 hover:border-[#C9A84C] transition-colors flex-shrink-0"
                >
                  <ZoomOut size={14} className="text-gray-600" />
                </button>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-full appearance-none bg-gray-200 accent-[#800000] cursor-pointer"
                />
                <button
                  onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200 hover:border-[#C9A84C] transition-colors flex-shrink-0"
                >
                  <ZoomIn size={14} className="text-gray-600" />
                </button>
                <button
                  onClick={handleReset}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200 hover:border-gray-400 transition-colors flex-shrink-0"
                  title="Reset"
                >
                  <RotateCcw size={13} className="text-gray-500" />
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleCancel}
                  disabled={uploading}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={uploading}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold bg-[#800000] text-white hover:bg-[#6a0000] transition-colors shadow-md disabled:opacity-60"
                >
                  {uploading ? (
                    <><Loader2 size={14} className="animate-spin" /> Uploading…</>
                  ) : (
                    <><Check size={14} /> Save Photo</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
