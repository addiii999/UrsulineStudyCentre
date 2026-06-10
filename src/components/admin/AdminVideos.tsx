"use client";
import { useEffect, useState, useRef } from "react";
import {
  Plus, Trash2, ToggleLeft, ToggleRight, X, ExternalLink,
  Loader2, ArrowUp, ArrowDown, AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface Video {
  id: string;
  video_id: string;
  title: string | null;
  thumbnail_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export default function AdminVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ url: "", title: "" });
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  // ── Load videos ─────────────────────────────────────────────────────────────
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/videos?admin=true&limit=50");
      const data = await res.json();
      setVideos(data.videos ?? []);
    } catch {
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVideos(); }, []);

  // ── Extract video ID from URL for preview ────────────────────────────────────
  const getPreviewId = (input: string): string | null => {
    const patterns = [
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const re of patterns) {
      const m = input.match(re);
      if (m) return m[1];
    }
    return null;
  };

  const handleUrlChange = (val: string) => {
    setForm((p) => ({ ...p, url: val }));
    const id = getPreviewId(val.trim());
    setUrlPreview(id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null);
  };

  // ── Add video ────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!form.url.trim()) {
      toast.error("Please paste a YouTube link");
      urlRef.current?.focus();
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.url.trim(), title: form.title.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add video");
      toast.success("Video added successfully");
      setForm({ url: "", title: "" });
      setUrlPreview(null);
      setShowForm(false);
      fetchVideos();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add video");
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active ────────────────────────────────────────────────────────────
  const handleToggle = async (video: Video) => {
    const newState = !video.is_active;
    // Optimistic UI
    setVideos((prev) =>
      prev.map((v) => (v.id === video.id ? { ...v, is_active: newState } : v))
    );
    try {
      const res = await fetch("/api/videos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: video.id, is_active: newState }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success(newState ? "Video activated" : "Video hidden");
    } catch {
      // Revert on failure
      setVideos((prev) =>
        prev.map((v) => (v.id === video.id ? { ...v, is_active: !newState } : v))
      );
      toast.error("Failed to update video");
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Remove this video permanently?")) return;
    setVideos((prev) => prev.filter((v) => v.id !== id));
    try {
      const res = await fetch(`/api/videos?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Video removed");
    } catch {
      toast.error("Failed to delete. Refreshing...");
      fetchVideos();
    }
  };

  // ── Reorder ──────────────────────────────────────────────────────────────────
  const handleReorder = async (id: string, direction: "up" | "down") => {
    const idx = videos.findIndex((v) => v.id === id);
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === videos.length - 1)) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const newVideos = [...videos];
    [newVideos[idx], newVideos[swapIdx]] = [newVideos[swapIdx], newVideos[idx]];
    setVideos(newVideos);

    // Persist both swap positions
    try {
      await Promise.all([
        fetch("/api/videos", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: newVideos[idx].id, sort_order: idx }),
        }),
        fetch("/api/videos", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: newVideos[swapIdx].id, sort_order: swapIdx }),
        }),
      ]);
    } catch {
      toast.error("Reorder failed");
      fetchVideos();
    }
  };

  const activeCount = videos.filter((v) => v.is_active).length;

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">YouTube Videos</h2>
          <p className="text-gray-400 text-xs mt-0.5">
            {videos.length} video{videos.length !== 1 ? "s" : ""} total - {activeCount} active on site
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setTimeout(() => urlRef.current?.focus(), 100); }}
          className="btn-primary text-sm py-2"
        >
          <Plus size={15} />
          Add Video
        </button>
      </div>

      {/* ADD FORM */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[#C9A84C]/30 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-gray-900">Add YouTube Video</h3>
            <button onClick={() => { setShowForm(false); setUrlPreview(null); setForm({ url: "", title: "" }); }}>
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          <div className="grid md:grid-cols-[1fr_auto] gap-4">
            <div className="space-y-3">
              <div>
                <label className="label">YouTube URL (paste any link)</label>
                <input
                  ref={urlRef}
                  value={form.url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="input-field font-mono text-sm"
                  placeholder="https://youtu.be/vR58BY1Ai0s  or  youtube.com/watch?v=..."
                />
                <p className="text-gray-400 text-xs mt-1">
                  Paste any YouTube link - ID is auto-extracted
                </p>
              </div>
              <div>
                <label className="label">Video Title (optional)</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="input-field"
                  placeholder="Leave blank to show 'Watch on YouTube'"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="btn-primary text-sm py-2"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {saving ? "Adding..." : "Add Video"}
                </button>
                <button
                  onClick={() => { setShowForm(false); setUrlPreview(null); setForm({ url: "", title: "" }); }}
                  className="btn-secondary text-sm py-2"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* LIVE THUMBNAIL PREVIEW */}
            {urlPreview ? (
              <div className="w-full md:w-52 flex-shrink-0">
                <p className="text-xs text-gray-400 mb-1.5 font-medium">Preview</p>
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    src={urlPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-[#FF0000] flex items-center justify-center shadow">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white ml-0.5">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full md:w-52 flex-shrink-0 flex items-center justify-center border border-dashed border-gray-200 rounded-lg aspect-video text-gray-300 text-xs text-center">
                <div>
                  <AlertCircle size={22} className="mx-auto mb-1 opacity-50" />
                  Thumbnail preview appears here
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIDEO LIST */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-100" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border border-dashed border-gray-200 rounded-xl">
          <p className="font-medium text-sm">No videos yet</p>
          <p className="text-xs mt-1">Click "Add Video" and paste a YouTube link to get started.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v, idx) => (
            <div
              key={v.id}
              className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                v.is_active ? "border-gray-200" : "border-gray-100 opacity-55"
              }`}
            >
              {/* THUMBNAIL */}
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={v.thumbnail_url}
                  alt={v.title ?? "Video thumbnail"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://img.youtube.com/vi/${v.video_id}/hqdefault.jpg`;
                  }}
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-[#FF0000] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white ml-0.5">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                {!v.is_active && (
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                    Hidden
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  #{idx + 1}
                </div>
              </div>

              {/* CARD INFO */}
              <div className="p-3">
                <p className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 min-h-[2.5rem]">
                  {v.title ?? <span className="text-gray-400 italic">No title</span>}
                </p>
                <p className="text-xs text-gray-400 font-mono truncate mb-3">{v.video_id}</p>

                <div className="flex items-center justify-between">
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(v)}
                    className="flex items-center gap-1 text-xs font-medium transition-colors"
                  >
                    {v.is_active ? (
                      <><ToggleRight size={16} className="text-green-500" /><span className="text-green-600">Active</span></>
                    ) : (
                      <><ToggleLeft size={16} className="text-gray-400" /><span className="text-gray-400">Hidden</span></>
                    )}
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleReorder(v.id, "up")}
                      disabled={idx === 0}
                      className="p-1.5 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-20 transition-colors"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      onClick={() => handleReorder(v.id, "down")}
                      disabled={idx === videos.length - 1}
                      className="p-1.5 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-20 transition-colors"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <a
                      href={`https://youtu.be/${v.video_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded text-gray-400 hover:text-[#FF0000] hover:bg-gray-100 transition-colors"
                      title="Open on YouTube"
                    >
                      <ExternalLink size={13} />
                    </a>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete video"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
