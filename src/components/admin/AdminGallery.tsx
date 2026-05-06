"use client";
import Image from "next/image";
import { useState, useCallback } from "react";
import { X, Eye, EyeOff, Trash2, Upload, ImagePlus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────
interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  storage_path: string;
  is_active: boolean;
  created_at: string;
}

// ─── CLIENT-SIDE IMAGE COMPRESSOR ─────────────────────────────
// Uses Canvas API — no external library needed
async function compressImage(
  file: File,
  opts: { maxWidthPx: number; maxKB: number; quality?: number }
): Promise<File> {
  return new Promise((resolve, reject) => {
    const { maxWidthPx, maxKB, quality = 0.82 } = opts;
    const img = document.createElement("img");
    img.onload = () => {
      const scale = Math.min(1, maxWidthPx / img.width);
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const tryQuality = (q: number) => {
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("Canvas toBlob failed"));
          if (blob.size > maxKB * 1024 && q > 0.3) {
            tryQuality(Math.round((q - 0.08) * 100) / 100);
          } else {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" }));
          }
        }, "image/webp", q);
      };
      tryQuality(quality);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// ─── TOAST ───────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: "ok" | "err" }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-[0_8px_24px_rgb(0,0,0,0.14)] text-sm font-medium ${type === "ok" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
      {type === "ok" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  );
}

// ─── UPLOAD CARD ─────────────────────────────────────────────
function UploadCard({ onUploaded }: { onUploaded: (item: GalleryItem) => void }) {
  const [title,       setTitle]       = useState("");
  const [preview,     setPreview]     = useState<string | null>(null);
  const [rawFile,     setRawFile]     = useState<File | null>(null);
  const [compressKB,  setCompressKB]  = useState<number | null>(null);
  const [originalKB,  setOriginalKB]  = useState<number | null>(null);
  const [uploading,   setUploading]   = useState(false);
  const [toast,       setToast]       = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOriginalKB(Math.round(file.size / 1024));
    try {
      const compressed = await compressImage(file, { maxWidthPx: 1200, maxKB: 100 });
      setCompressKB(Math.round(compressed.size / 1024));
      setRawFile(compressed);
      setPreview(URL.createObjectURL(compressed));
    } catch {
      showToast("Could not compress image. Try another file.", "err");
    }
  }, []);

  const handleUpload = async () => {
    if (!rawFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file",  rawFile);
      fd.append("title", title.trim());
      const res  = await fetch("/api/gallery", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      onUploaded(json.item);
      showToast("Image uploaded successfully!", "ok");
      setTitle(""); setPreview(null); setRawFile(null); setCompressKB(null); setOriginalKB(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Upload failed", "err");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2 text-gray-700 font-semibold text-[13px]">
        <ImagePlus size={16} className="text-[#800000]" />
        Upload New Image
      </div>

      {/* Preview */}
      {preview ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
          <Image src={preview} alt="preview" fill className="object-cover" />
          <button onClick={() => { setPreview(null); setRawFile(null); setCompressKB(null); setOriginalKB(null); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors">
            <X size={13} />
          </button>
          {originalKB && compressKB && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="line-through text-gray-400">{originalKB} KB</span>
              <span>→</span>
              <span className="text-emerald-400">{compressKB} KB</span>
              <span className="text-gray-400">· WebP</span>
            </div>
          )}
        </div>
      ) : (
        <label className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#C9A84C]/60 hover:bg-[#C9A84C]/[0.03] transition-all group">
          <Upload size={24} className="text-gray-300 group-hover:text-[#C9A84C] transition-colors" />
          <span className="text-[12px] text-gray-400 group-hover:text-[#C9A84C] transition-colors font-medium">Click to select image</span>
          <span className="text-[10px] text-gray-300">Auto-compressed to ≤100 KB WebP</span>
          <input type="file" accept="image/*" className="sr-only" onChange={handleFile} />
        </label>
      )}

      {/* Title */}
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Image title (optional)"
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 placeholder:text-gray-400"
      />

      <button
        onClick={handleUpload}
        disabled={!rawFile || uploading}
        className="w-full py-3 rounded-xl bg-[#800000] text-white text-[13px] font-semibold hover:bg-[#600000] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : <><Upload size={14} /> Upload to Gallery</>}
      </button>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

// ─── GALLERY ITEM CARD ────────────────────────────────────────
function GalleryCard({
  item, onToggle, onDelete
}: {
  item: GalleryItem;
  onToggle: (id: string, val: boolean) => void;
  onDelete: (id: string, path: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this image permanently?")) return;
    setDeleting(true);
    await onDelete(item.id, item.storage_path);
    setDeleting(false);
  };

  return (
    <div className={`rounded-2xl overflow-hidden border transition-all duration-200 group ${item.is_active ? "border-gray-100 bg-white shadow-sm hover:shadow-md" : "border-dashed border-gray-200 bg-gray-50 opacity-60"}`}>
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <Image src={item.image_url} alt={item.title || "Gallery image"} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        {!item.is_active && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-black/50 px-3 py-1 rounded-full">Hidden</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 flex items-center justify-between gap-2">
        <p className="text-[12px] font-medium text-gray-700 truncate flex-1">{item.title || <span className="text-gray-400 italic">No title</span>}</p>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={() => onToggle(item.id, !item.is_active)}
            title={item.is_active ? "Hide" : "Show"}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            {item.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
          <button onClick={handleDelete} disabled={deleting}
            title="Delete"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function AdminGallery() {
  const [items,   setItems]   = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch ALL items (including hidden) for admin
      const res  = await fetch("/api/gallery/admin");
      const json = await res.json();
      setItems(json.items ?? []);
    } catch {
      // fallback to public route
      const res  = await fetch("/api/gallery");
      const json = await res.json();
      setItems(json.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useState(() => { fetchItems(); });

  const handleUploaded = (item: GalleryItem) => setItems(prev => [item, ...prev]);

  const handleToggle = async (id: string, val: boolean) => {
    const res = await fetch("/api/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: val }),
    });
    if (res.ok) setItems(prev => prev.map(i => i.id === id ? { ...i, is_active: val } : i));
  };

  const handleDelete = async (id: string, path: string) => {
    const res = await fetch("/api/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, storage_path: path }),
    });
    if (res.ok) setItems(prev => prev.filter(i => i.id !== id));
  };

  const active  = items.filter(i =>  i.is_active).length;
  const hidden  = items.filter(i => !i.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-400 text-[13px] mt-0.5">Manage campus photos — images auto-compressed to ≤100 KB WebP</p>
        </div>
        <div className="flex items-center gap-3 text-[12px] font-semibold">
          <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg">{active} Visible</span>
          <span className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg">{hidden} Hidden</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Upload Panel */}
        <div className="lg:col-span-4">
          <UploadCard onUploaded={handleUploaded} />
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-[11px] text-amber-700 space-y-1">
            <p className="font-bold">📦 Storage Optimization Rules</p>
            <p>• Gallery images → max 100 KB WebP</p>
            <p>• Auto-resized to 1200px max width</p>
            <p>• Quality iteratively reduced until limit met</p>
            <p>• Original file never stored on server</p>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-video rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <ImagePlus size={40} className="mb-3 opacity-30" />
              <p className="font-semibold text-[14px]">No images yet</p>
              <p className="text-[12px]">Upload your first gallery photo using the panel on the left.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {items.map(item => (
                <GalleryCard key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
