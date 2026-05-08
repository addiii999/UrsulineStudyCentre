"use client";
import { useState, useEffect, useRef } from "react";
import { Send, Phone, MapPin, Mail, MessageCircle, Loader2, CheckCircle2 } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

const CLASSES = ["Class 9", "Class 10", "Class 11", "Class 12", "Other"];
const STREAMS = ["Science (PCM)", "Science (PCB)", "Commerce", "Humanities", "Not Sure Yet"];

export default function ContactSection() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [settings, setSettings] = useState(SITE_CONFIG);
  const formRef = useRef<HTMLFormElement>(null);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Basic client-side validation
    const name = (form.elements.namedItem("name") as HTMLInputElement)?.value?.trim();
    const phone = (form.elements.namedItem("phone") as HTMLInputElement)?.value?.trim();
    const cls = (form.elements.namedItem("class") as HTMLSelectElement)?.value;

    if (!name || !phone || !cls) {
      alert("Please fill all required fields.");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData(form);
      const res = await fetch("https://formsubmit.co/ursulinestudycentre@gmail.com", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        setSubmitted(true);
        formRef.current?.reset();
      } else {
        alert("Something went wrong. Please try again or contact us on WhatsApp.");
      }
    } catch {
      alert("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-14 md:py-20 bg-[#FDF8F0]">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-10">
          <span className="section-tag">Contact Us</span>
          <h2 className="section-heading mt-4">
            Get in <span className="text-[#800000]">Touch</span>
          </h2>
          <div className="gold-divider mx-auto mt-4" />
          <p className="section-subheading mx-auto mt-4">
            Reach out for admissions, counselling, or any queries.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* LEFT: FORM */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#f0ebe0] p-8">
            <h3
              className="text-lg font-bold text-gray-900 mb-6"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Send an Enquiry
            </h3>

            {/* SUCCESS STATE */}
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">Enquiry Submitted!</h4>
                  <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
                    Thank you! Our team will contact you within 24 hours. Check your email for confirmation.
                  </p>
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-secondary text-sm py-2"
                >
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* ── FormSubmit hidden config ── */}
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_subject" value="New Enquiry - Ursuline Study Centre" />
                <input type="hidden" name="_template" value="table" />
                <input
                  type="hidden"
                  name="_autoresponse"
                  value={`Thank you for contacting Ursuline Study Centre. Our team will reach out to you within 24 hours. For urgent queries, WhatsApp us at ${settings.phone} or ${settings.phone2}.`}
                />
                {/* Honeypot anti-spam */}
                <input type="text" name="_honey" style={{ display: "none" }} />

                {/* FIELDS */}
                <div>
                  <label className="label">Full Name *</label>
                  <input
                    name="name"
                    placeholder="Enter your full name"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label">Phone Number *</label>
                  <div className="flex">
                    <span className="flex items-center px-3 bg-gray-50 border border-r-0 border-[#e8e0d0] rounded-l-lg text-gray-500 text-sm font-medium min-h-[48px]">
                      +91
                    </span>
                    <input
                      name="phone"
                      placeholder="10-digit mobile number"
                      className="input-field rounded-l-none min-h-[48px] text-base"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Class *</label>
                    <select name="class" className="input-field min-h-[48px] text-base" required defaultValue="">
                      <option value="" disabled>Select Class</option>
                      {CLASSES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Stream</label>
                    <select name="stream" className="input-field min-h-[48px] text-base" defaultValue="">
                      <option value="">Select Stream</option>
                      {STREAMS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Message (Optional)</label>
                  <textarea
                    name="message"
                    placeholder="Any specific queries or information..."
                    rows={3}
                    className="input-field resize-none text-base"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center mt-2 min-h-[52px] text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Submit Enquiry
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 mt-1">
                  Your data is safe. We'll never share your information.
                </p>
              </form>
            )}
          </div>

          {/* RIGHT: INFO + MAP */}
          <div className="space-y-6">
            {/* CONTACT INFO */}
            <div className="bg-white rounded-2xl border border-[#f0ebe0] p-6 space-y-4">
              <h3
                className="text-lg font-bold text-gray-900 mb-1"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Contact Information
              </h3>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#800000]/8 flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-[#800000]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Address</p>
                  <p className="text-gray-700 text-sm mt-0.5">{settings.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#800000]/8 flex items-center justify-center flex-shrink-0">
                  <Phone size={16} className="text-[#800000]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Phone</p>
                  <a href={`tel:${settings.phone}`} className="text-gray-700 text-sm hover:text-[#800000] transition-colors">
                    {settings.phone}
                  </a>
                  <span className="text-gray-300">|</span>
                  <a href={`tel:${settings.phone2}`} className="text-gray-700 text-sm hover:text-[#800000] transition-colors">
                    {settings.phone2}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#800000]/8 flex items-center justify-center flex-shrink-0">
                  <Mail size={16} className="text-[#800000]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Email</p>
                  <a href={`mailto:${settings.email}`} className="text-gray-700 text-sm hover:text-[#800000] transition-colors">
                    {settings.email}
                  </a>
                </div>
              </div>
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1ebe5a] transition-colors w-full justify-center"
              >
                <MessageCircle size={16} />
                Chat on WhatsApp
              </a>
            </div>

            {/* MAP SECTION */}
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-[#f0ebe0] shadow-sm h-64 bg-gray-50 flex items-center justify-center">
                {/* FALLBACK UI (Behind iframe) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[#FDF8F0]/50">
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
                    <MapPin size={20} className="text-[#800000]" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">Ursuline Study Centre</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-[200px] leading-relaxed">
                    Ursuline Convent Campus, Dr. Camil Bulcke Path, Ranchi, Jharkhand, India
                  </p>
                </div>

                {/* IFRAME */}
                <iframe
                  src={settings.mapEmbed}
                  className="absolute inset-0 w-full h-full border-0 z-10"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ursuline Study Centre Location"
                />
              </div>

              {/* MAP ACTIONS */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Ursuline+Convent+Campus,+Dr.+Camil+Bulcke+Path,+Ranchi,+Jharkhand,+India"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 bg-white border border-[#e8d9b8] text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:text-[#800000] hover:border-[#C9A84C] transition-all"
                >
                  <MapPin size={16} className="text-[#C9A84C]" />
                  Open in Maps
                </a>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Ursuline+Convent+Campus,+Dr.+Camil+Bulcke+Path,+Ranchi,+Jharkhand,+India"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#800000] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5C0000] shadow-sm hover:shadow transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                  </svg>
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
