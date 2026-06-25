"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ImagePlus, ZoomIn } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  is_active: boolean;
}

// ─── LIGHTBOX ────────────────────────────────────────────────
function Lightbox({
  items, index, onClose
}: {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index);
  const item = items[current];

  const prev = useCallback(() => setCurrent(i => (i - 1 + items.length) % items.length), [items.length]);
  const next = useCallback(() => setCurrent(i => (i + 1) % items.length), [items.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowLeft")   prev();
      if (e.key === "ArrowRight")  next();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, prev, next]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
      >
        <X size={18} />
      </button>

      {/* Prev */}
      {items.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); prev(); }}
          className="absolute left-4 md:left-8 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Image */}
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[80vh] mx-16 rounded-2xl overflow-hidden shadow-2xl"
        style={{ aspectRatio: "16/10" }}
      >
        <Image
          src={item.image_url}
          alt={item.title || "Gallery image"}
          fill
          className="object-contain"
          quality={90}
          priority
        />
        {item.title && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-6 py-4">
            <p className="text-white font-semibold text-[14px]">{item.title}</p>
          </div>
        )}
      </div>

      {/* Next */}
      {items.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); next(); }}
          className="absolute right-4 md:right-8 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
        >
          <ChevronRight size={22} />
        </button>
      )}

      {/* Dots */}
      {items.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setCurrent(i); }}
              className={`rounded-full transition-all ${i === current ? "w-5 h-1.5 bg-[#C9A84C]" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SKELETON ─────────────────────────────────────────────────
function GallerySkeleton() {
  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="break-inside-avoid rounded-2xl bg-gray-100 animate-pulse"
          style={{ aspectRatio: i % 3 === 0 ? "1/1" : i % 3 === 1 ? "4/3" : "3/4" }}
        />
      ))}
    </div>
  );
}

// ─── MAIN SECTION ─────────────────────────────────────────────
export default function GallerySection({ isPreview = false }: { isPreview?: boolean }) {
  const [items,      setItems]      = useState<GalleryItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then(r => r.json())
      .then(d => setItems(d.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Empty state is handled inside the render now

  return (
    <section id="gallery" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#C9A84C] uppercase mb-3 block">
            Visual Tour
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#800000] mb-4" style={{ fontFamily: "var(--font-serif)" }}>
            Life at USC
          </h2>
          <p className="text-gray-500 text-[15px] max-w-lg mx-auto leading-relaxed">
            A glimpse into our classrooms, campus, events, and the vibrant academic community at Ursuline Study Centre.
          </p>
          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto mt-5 opacity-70" />
        </div>

        {/* Grid */}
        {loading ? (
          <GallerySkeleton />
        ) : (
          <>
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {(isPreview ? items.slice(0, 8) : items).map((item, idx) => (
                <div
                  key={item.id}
                  className="break-inside-avoid group relative cursor-pointer rounded-2xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300"
                  onClick={() => setLightboxIdx(idx)}
                >
                  <div className="relative w-full" style={{ aspectRatio: idx % 4 === 0 ? "1/1" : idx % 4 === 1 ? "4/3" : idx % 4 === 2 ? "3/4" : "16/9" }}>
                    <Image
                      src={item.image_url}
                      alt={item.title || "USC Campus"}
                      fill
                      loading="lazy"
                      quality={75}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                    {item.title && (
                      <p className="text-white text-[12px] font-semibold leading-tight drop-shadow">{item.title}</p>
                    )}
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ml-auto flex-shrink-0">
                      <ZoomIn size={14} className="text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isPreview && (
              <div className="text-center mt-10">
                <Link
                  href="/gallery"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  View All Gallery
                </Link>
              </div>
            )}
          </>
        )}

        {/* Empty state (for logged-in admin visit) */}
        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300">
            <ImagePlus size={48} className="mb-4 opacity-40" />
            <p className="text-[15px] font-semibold text-gray-400">No gallery photos yet</p>
            <p className="text-[13px] text-gray-300 mt-1">Upload photos from the Admin Panel → Gallery</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          items={items}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </section>
  );
}
