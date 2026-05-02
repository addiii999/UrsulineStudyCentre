"use client";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

// ── Official YouTube SVG icon (white — for use on colored backgrounds) ───────
const YouTubeIcon = ({ size = 20, white = false }: { size?: number; white?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
      fill={white ? "#fff" : "#FF0000"}
    />
    <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill={white ? "#FF0000" : "#fff"} />
  </svg>
);

// ── Official Google Play icon ─────────────────────────────────────────────────
const PlayStoreIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 512 512">
    <path d="M48 59.49v393l.16.16 204-196.76L48 59.49z" fill="#32BBFF" />
    <path d="M400 256l-67.92-38.19L252.08 256l79.98 74.24L400 256z" fill="#32BBFF" />
    <path d="M48 59.49L252.08 256 332.08 180 103.64 48.84A56.27 56.27 0 0 0 48 59.49z" fill="#32BBFF" />
    <path d="M48 452.51a56.27 56.27 0 0 0 55.64 10.65L332.08 332 252.08 256z" fill="#32BBFF" />
    <path d="M332.08 332L400 256l-67.92-38.19-80.08 74.24z" fill="#00EE76" />
    <path d="M48 452.51a56.27 56.27 0 0 0 55.64 10.65L332.08 332l-80-75.76z" fill="#00EE76" />
    <path d="M103.64 48.84L332.08 180 252.08 256 48 59.49a56.27 56.27 0 0 1 55.64-10.65z" fill="#FFD500" />
    <path d="M400 256l-67.92 76L447.6 295a56 56 0 0 0 0-78z" fill="#FF3A44" />
    <path d="M332.08 180L400 256l47.6-37a56 56 0 0 0-115.52-39z" fill="#FF3A44" />
  </svg>
);

// ── Official WhatsApp SVG icon (white — for use on green background) ──────────
const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface Video {
  id: string;
  video_id: string;
  title: string | null;
  thumbnail: string;
  is_active: boolean;
  sort_order: number;
}

export default function YoutubeSection() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/videos?limit=4")
      .then((r) => r.json())
      .then((d) => setVideos(d.videos ?? []))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="youtube" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-10">
          <span className="section-tag">Video Resources</span>
          <h2 className="section-heading mt-4">
            Academic Origin{" "}
            <span className="text-[#800000]">Learning Videos</span>
          </h2>
          <div className="gold-divider mx-auto mt-4" />
          <p className="section-subheading mx-auto mt-4">
            Free educational content - JEE, NEET, Board prep and more.
            Click any video to watch on YouTube.
          </p>
        </div>

        {/* CHANNEL + APP STRIP */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap mb-10">

          {/* YouTube channel button — white icons on red bg */}
          <a
            href={SITE_CONFIG.youtubeChannel}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2.5 px-5 py-3 bg-[#FF0000] text-white font-semibold text-sm rounded-xl hover:bg-[#CC0000] transition-all duration-200 hover:-translate-y-0.5 shadow-md shadow-red-200"
          >
            {/* YouTube logo: white background + red play triangle (inverted for red button) */}
            <YouTubeIcon size={22} white={true} />
            Visit Academic Origin Channel
            <ExternalLink size={14} className="opacity-70" />
          </a>

          {/* Play Store button */}
          <a
            href={SITE_CONFIG.playstoreLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2.5 px-5 py-3 bg-white text-gray-800 font-semibold text-sm rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
          >
            <PlayStoreIcon size={22} />
            Download on Play Store
            <ExternalLink size={14} className="opacity-40" />
          </a>

          {/* WhatsApp — white icon on green bg */}
          <a
            href={`https://wa.me/${SITE_CONFIG.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2.5 px-5 py-3 bg-[#25D366] text-white font-semibold text-sm rounded-xl hover:bg-[#1ebe5a] transition-all duration-200 hover:-translate-y-0.5 shadow-md shadow-green-200"
          >
            <WhatsAppIcon size={20} />
            Chat on WhatsApp
          </a>

        </div>

        {/* VIDEO GRID */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <YouTubeIcon size={40} />
            <p className="mt-3 text-sm">No videos added yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {videos.map((video) => (
              <a
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.video_id}`}
                target="_blank"
                rel="noreferrer"
                className="group block rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:border-[#FF0000]/20 transition-all duration-300"
              >
                {/* THUMBNAIL */}
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title ?? "YouTube video"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`;
                    }}
                  />
                  {/* PLAY OVERLAY */}
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#FF0000] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white ml-0.5">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  {/* YouTube badge */}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1">
                    <YouTubeIcon size={10} />
                    YouTube
                  </div>
                </div>

                {/* CARD INFO */}
                <div className="p-3">
                  <p className="text-gray-800 text-sm font-medium leading-snug line-clamp-2 group-hover:text-[#CC0000] transition-colors min-h-[2.5rem]">
                    {video.title ?? "Watch on YouTube"}
                  </p>
                  <p className="text-gray-400 text-xs mt-1.5 flex items-center gap-1.5">
                    <YouTubeIcon size={12} />
                    Academic Origin
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* BOTTOM NOTE */}
        <p className="text-center text-gray-400 text-xs">
          Videos open directly on YouTube. No login required.
        </p>

      </div>
    </section>
  );
}
