import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getGlobalSettings } from "@/lib/settings";

export const revalidate = 0;

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

export default async function YoutubeSection() {
  const settings = await getGlobalSettings();
  
  const { data: videosData } = await supabase
    .from("videos")
    .select("*")
    .eq("is_deleted", false)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(4);

  const videos = videosData ?? [];

  return (
    <section id="youtube" className="py-14 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER & MAIN CTA */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10">
          <div className="text-left">
            <span className="section-tag">Video Resources</span>
            <h2 className="section-heading mt-4">
              Academic Origin{" "}
              <span className="text-[#800000]">Learning Videos</span>
            </h2>
            <div className="gold-divider mt-4" />
            <p className="section-subheading mt-4">
              Free educational content - JEE, NEET, Board prep and more. Click any video to watch on YouTube.
            </p>
          </div>
          <a
            href={settings.youtubeChannel}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#FF0000] text-white font-bold text-sm rounded-lg hover:bg-[#CC0000] transition-all duration-300 shadow-[0_4px_14px_rgba(255,0,0,0.3)] hover:-translate-y-1"
          >
            <YouTubeIcon size={20} white={true} />
            Visit Channel
            <ExternalLink size={16} className="opacity-70 ml-1" />
          </a>
        </div>

        {/* VIDEO GRID */}
        {videos.length === 0 ? (
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
                  <div className="relative w-full h-full">
                    <Image
                      src={video.thumbnail || `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`}
                      alt={video.title ?? "YouTube video"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      quality={70}
                    />
                  </div>
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
