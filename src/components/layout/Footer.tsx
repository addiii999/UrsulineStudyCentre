"use client";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap, MapPin, Phone, Mail, Play, MessageCircle } from "lucide-react";
import { SITE_CONFIG, NAV_LINKS, MORE_LINKS } from "@/lib/constants";
import { useState, useEffect } from "react";

export default function Footer() {
  const [settings, setSettings] = useState(SITE_CONFIG);

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
  const scrollTo = (href: string) => {
    if (href.startsWith("/#")) {
      const id = href.replace("/#", "");
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = href;
    }
  };

  return (
    <footer className="bg-[#0D0505] text-white">
      {/* MOTTO BANNER */}
      <div className="border-b border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p
            className="text-2xl font-bold text-[#C9A84C]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {settings.motto}
          </p>
          <a
            href={`https://wa.me/${settings.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1ebe5a] transition-colors"
          >
            <MessageCircle size={16} />
            WhatsApp Us
          </a>
        </div>
      </div>

      {/* MAIN FOOTER CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* BRAND */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Ursuline Study Centre"
                width={30}
                height={30}
                className="h-8 md:h-[30px] w-auto object-contain bg-white/95 rounded px-1.5 py-0.5"
              />
              <div>
                <div
                  className="font-bold text-white text-base"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  Ursuline Study Centre
                </div>
                <div className="text-[10px] text-white/50">Premium Girls Institution</div>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Empowering girls with world-class education. Premium education for Classes 9–12 with
              JEE, NEET and Board preparation under expert guidance.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={settings.youtubeChannel}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C9A84C]/20 transition-colors"
                aria-label="YouTube"
              >
                <Play size={15} className="text-[#C9A84C]" />
              </a>
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C9A84C]/20 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={15} className="text-[#C9A84C]" />
              </a>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="text-[#C9A84C] font-semibold text-sm uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-white/60 text-sm hover:text-[#C9A84C] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              {MORE_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-white/60 text-sm hover:text-[#C9A84C] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* COURSES */}
          <div>
            <h4 className="text-[#C9A84C] font-semibold text-sm uppercase tracking-wider mb-4">
              Our Courses
            </h4>
            <ul className="space-y-2.5">
              {[
                "Science (PCM)",
                "Science (PCB)",
                "Commerce",
                "Humanities",
                "JEE Preparation",
                "NEET Preparation",
                "CLAT",
                "DCA",
                "Tally & Accounts",
              ].map((c) => (
                <li key={c}>
                  <span className="text-white/60 text-sm">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h4 className="text-[#C9A84C] font-semibold text-sm uppercase tracking-wider mb-4">
              Contact Us
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={15} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
                <span className="text-white/60 text-sm">{settings.address}</span>
              </div>
              <a
                href={`tel:${settings.phone}`}
                className="flex items-center gap-3 text-white/60 text-sm hover:text-[#C9A84C] transition-colors"
              >
                <Phone size={14} className="text-[#C9A84C] flex-shrink-0" />
                {settings.phone}
              </a>
              <a
                href={`tel:${settings.phone2}`}
                className="flex items-center gap-3 text-white/60 text-sm hover:text-[#C9A84C] transition-colors"
              >
                <Phone size={14} className="text-[#C9A84C] flex-shrink-0" />
                {settings.phone2}
              </a>
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-3 text-white/60 text-sm hover:text-[#C9A84C] transition-colors"
              >
                <Mail size={14} className="text-[#C9A84C] flex-shrink-0" />
                {settings.email}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <p>
            © {new Date().getFullYear()} Ursuline Study Centre. All rights reserved. |{" "}
            <Link href="/admin/login" className="hover:text-[#C9A84C] transition-colors">
              Admin
            </Link>
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>Powered by</span>
            <span className="bg-white rounded px-2 py-1 inline-flex items-center hover:opacity-80 transition-opacity">
              <img
                src="/images/academic-origin.png"
                alt="Academic Origin"
                className="h-[16px] w-auto"
              />
            </span>
            <span className="mx-1 opacity-50">|</span>
            <span>Designed by {settings.designer} ({settings.designerPhone})</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
