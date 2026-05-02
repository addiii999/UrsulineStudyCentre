"use client";
import { useState } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, X, ExternalLink } from "lucide-react";
import { YOUTUBE_VIDEOS } from "@/lib/constants";

interface Video {
  id: string;
  video_id: string;
  title: string;
  is_active: boolean;
}

export default function AdminVideos() {
  const [videos, setVideos] = useState<Video[]>(
    YOUTUBE_VIDEOS.map((v, i) => ({ id: String(i + 1), video_id: v.id, title: v.title, is_active: true }))
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ video_id: "", title: "" });

  const extractVideoId = (input: string) => {
    const match = input.match(/(?:v=|youtu\.be\/)([^&\?\/]+)/);
    return match ? match[1] : input.trim();
  };

  const handleAdd = () => {
    if (!form.video_id || !form.title) return;
    const vid = extractVideoId(form.video_id);
    setVideos((prev) => [...prev, { id: Date.now().toString(), video_id: vid, title: form.title, is_active: true }]);
    setForm({ video_id: "", title: "" });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Remove this video?")) setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const toggleActive = (id: string) => {
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, is_active: !v.is_active } : v)));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-lg" style={{ fontFamily: "var(--font-serif)" }}>YouTube Videos</h2>
          <p className="text-gray-400 text-xs">Manage featured video content</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm py-2">
          <Plus size={15} /> Add Video
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-[#C9A84C]/30 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Add YouTube Video</h3>
            <button onClick={() => setShowForm(false)}><X size={16} className="text-gray-400" /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="label">YouTube URL or Video ID</label>
              <input value={form.video_id} onChange={(e) => setForm((p) => ({ ...p, video_id: e.target.value }))} className="input-field" placeholder="https://www.youtube.com/watch?v=... or video ID" />
            </div>
            <div>
              <label className="label">Video Title</label>
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="input-field" placeholder="Enter video title" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAdd} className="btn-primary text-sm py-1.5">Add Video</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm py-1.5">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((v) => (
          <div key={v.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${v.is_active ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
            <div className="relative aspect-video bg-gray-100">
              <img
                src={`https://img.youtube.com/vi/${v.video_id}/hqdefault.jpg`}
                alt={v.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-[#FF0000] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white ml-0.5"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">{v.title}</p>
              <p className="text-xs text-gray-400 font-mono mb-3">{v.video_id}</p>
              <div className="flex items-center justify-between">
                <button onClick={() => toggleActive(v.id)}>
                  {v.is_active
                    ? <span className="text-xs text-green-600 flex items-center gap-1"><ToggleRight size={14} />Active</span>
                    : <span className="text-xs text-gray-400 flex items-center gap-1"><ToggleLeft size={14} />Inactive</span>}
                </button>
                <div className="flex gap-1.5">
                  <a href={`https://youtu.be/${v.video_id}`} target="_blank" rel="noreferrer" className="p-1.5 rounded text-gray-400 hover:text-[#FF0000] hover:bg-gray-100 transition-colors">
                    <ExternalLink size={13} />
                  </a>
                  <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
