"use client";
import Image from "next/image";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, Phone, MapPin, GraduationCap } from "lucide-react";
import { SITE_CONFIG, NAV_LINKS, MORE_LINKS } from "@/lib/constants";
import clsx from "clsx";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [settings, setSettings] = useState(SITE_CONFIG);
  const tickingRef = useRef(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.settings && Object.keys(data.settings).length > 0) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      })
      .catch(console.error);
  }, []);

  const handleScroll = useCallback(() => {
    if (!tickingRef.current) {
      window.requestAnimationFrame(() => {
        const isScrolled = window.scrollY > 40;
        setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));

        const sectionIds = [
          "hero", "about", "founder", "courses", "faculty",
          "why-us", "results", "testimonials", "youtube", "faq", "admission", "contact",
        ];
        let current = "hero";
        for (const id of sectionIds) {
          const el = document.getElementById(id);
          if (el) {
            const top = el.getBoundingClientRect().top;
            if (top <= 100) current = id;
          }
        }
        setActiveSection(current);
        tickingRef.current = false;
      });
      tickingRef.current = true;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    setMoreOpen(false);
    if (href.startsWith("/#")) {
      const id = href.replace("/#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <>
      {/* TOP BAR */}
      <div className="bg-[#800000] text-white text-xs py-2 px-4 hidden md:block gradient-anim">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 opacity-90">
              <MapPin size={11} className="icon-anim float-text" />
              {settings.address}
            </span>
            <span className="opacity-70 glow float-text">|</span>
            <span className="text-[#E5C97A] font-semibold">
              100% Girls-Only Premium Institution
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center gap-1.5 hover:text-[#E5C97A] transition-colors"
            >
              <Phone size={11} className="icon-anim" />
              {settings.phone}
            </a>
            <span className="opacity-40 glow hidden sm:inline">|</span>
            <a
              href={`tel:${settings.phone2}`}
              className="hidden sm:flex items-center gap-2 hover:text-white transition-colors"
            >
              <Phone size={14} className="text-[#E5C97A]" />
              {settings.phone2}
            </a>
            <span className="opacity-70 glow float-text">|</span>
            <span className="opacity-80 text-[10px] tracking-wider flex items-center gap-2">
              Powered by
              <span className="bg-white rounded px-1.5 py-0.5 inline-flex items-center">
                <img
                  src="/images/academic-origin.png"
                  alt="Academic Origin"
                  className="h-[13px] w-auto"
                />
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <nav
        className={clsx(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-sm shadow-[0_2px_20px_rgba(0,0,0,0.08)] border-b border-[#f0ebe0]"
            : "bg-white border-b border-[#f0ebe0]"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* LEFT: LOGO */}
            <button
              onClick={() => scrollTo("/#hero")}
              className="flex items-center gap-3 group flex-shrink-0 text-left"
            >
              <Image
                src="/logo.png"
                alt="Ursuline Study Centre"
                width={48}
                height={48}
                className="h-10 md:h-12 w-auto object-contain"
                priority
              />
              <div className="flex flex-col leading-tight">
                <span className="text-[16px] md:text-[19px] font-bold text-[#111] tracking-tight">
                  Ursuline Study Centre
                </span>
                <span className="hidden sm:block text-[11px] md:text-[12px] text-[#666] font-medium mt-[3px] opacity-90">
                  Under the Visionary Guidance of Sr. Dr. Mary Grace
                </span>
              </div>
            </button>

            {/* CENTER: NAV LINKS (Desktop) */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const sectionId = link.href.replace("/#", "");
                const isActive = activeSection === sectionId;
                return (
                  <button
                    key={link.label}
                    onClick={() => scrollTo(link.href)}
                    className={clsx(
                      "px-3.5 py-2 text-sm font-medium rounded-md transition-all duration-200",
                      isActive
                        ? "text-[#800000] bg-[#800000]/5"
                        : "text-gray-700 hover:text-[#800000] hover:bg-[#800000]/5"
                    )}
                  >
                    {link.label}
                  </button>
                );
              })}

              {/* MORE DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setMoreOpen((p) => !p)}
                  className="flex items-center gap-1 px-3.5 py-2 text-sm font-medium text-gray-700 hover:text-[#800000] hover:bg-[#800000]/5 rounded-md transition-all duration-200"
                >
                  More
                  <ChevronDown
                    size={14}
                    className={clsx("transition-transform duration-200", moreOpen && "rotate-180")}
                  />
                </button>
                {moreOpen && (
                  <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-[#f0ebe0] py-1.5 z-50">
                    {MORE_LINKS.map((link) => (
                      <button
                        key={link.label}
                        onClick={() => scrollTo(link.href)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:text-[#800000] hover:bg-[#800000]/5 transition-colors"
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: CTA BUTTONS */}
            <div className="hidden lg:flex items-center gap-2.5">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-[#800000] border-2 border-[#800000]/20 rounded-lg hover:border-[#800000] hover:bg-[#800000]/5 transition-all duration-200"
              >
                Student Login
              </Link>
              <button
                onClick={() => scrollTo("/#contact")}
                className="btn-primary text-sm py-2 px-4"
              >
                Book Free Counselling
              </button>
            </div>

            {/* MOBILE MENU TOGGLE */}
            <button
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen((p) => !p)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-[#f0ebe0] shadow-lg">
            <div className="px-4 py-4 space-y-1">
              {[...NAV_LINKS, ...MORE_LINKS].map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#800000] hover:bg-[#800000]/5 rounded-lg transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-center px-4 py-2.5 text-sm font-semibold text-[#800000] border-2 border-[#800000]/20 rounded-lg"
                >
                  Student Login
                </Link>
                <button
                  onClick={() => scrollTo("/#contact")}
                  className="btn-primary justify-center text-sm"
                >
                  Book Free Counselling
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
