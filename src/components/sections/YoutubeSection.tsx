"use client";
import { Play } from "lucide-react";
import { YOUTUBE_VIDEOS, SITE_CONFIG } from "@/lib/constants";

export default function YoutubeSection() {
  return (
    <section id="youtube" className="py-20 md:py-28 bg-[#FDF8F0]">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-12">
          <span className="section-tag">Video Resources</span>
          <h2 className="section-heading mt-4">
            Learn from Our <span className="text-[#800000]">YouTube Channel</span>
          </h2>
          <div className="gold-divider mx-auto mt-4" />
          <p className="section-subheading mx-auto mt-4">
            Free educational content on Academic Origin — JEE, NEET, Board prep and more.
          </p>
        </div>

        {/* VIDEO GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {YOUTUBE_VIDEOS.map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noreferrer"
              className="group block rounded-xl overflow-hidden border border-[#e8d9b8] bg-white shadow-sm hover:shadow-lg hover:border-[#C9A84C]/50 transition-all duration-300"
            >
              {/* THUMBNAIL */}
              <div className="relative aspect-video bg-gray-200 overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                  }}
                />
                {/* PLAY OVERLAY */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#FF0000] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white ml-0.5">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* TITLE */}
              <div className="p-3">
                <p className="text-gray-800 text-sm font-medium leading-snug line-clamp-2 group-hover:text-[#800000] transition-colors">
                  {video.title}
                </p>
                <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                  <Play size={11} className="text-[#FF0000]" fill="#FF0000" />
                  Academic Origin
                </p>
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href={SITE_CONFIG.youtubeChannel}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#FF0000] text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[#CC0000] transition-colors shadow-sm"
          >
            <Play size={18} fill="white" />
            Visit Our Full YouTube Channel
          </a>
        </div>
      </div>
    </section>
  );
}
