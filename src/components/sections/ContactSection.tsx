"use client";
import { useState } from "react";
import { Send, Phone, MapPin, Mail, MessageCircle, Loader2 } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";
import toast from "react-hot-toast";

const CLASSES = ["Class 9", "Class 10", "Class 11", "Class 12", "Other"];
const STREAMS = ["Science (PCM)", "Science (PCB)", "Commerce", "Humanities", "Not Sure Yet"];

export default function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    class: "",
    stream: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.class) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Enquiry submitted! We'll contact you within 24 hours.");
        setForm({ name: "", phone: "", class: "", stream: "", message: "" });
      } else {
        toast.error("Failed to submit. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-28 bg-[#FDF8F0]">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-14">
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Phone Number *</label>
                <div className="flex">
                  <span className="flex items-center px-3 bg-gray-50 border border-r-0 border-[#e8e0d0] rounded-l-lg text-gray-500 text-sm font-medium">
                    +91
                  </span>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="95075 89503"
                    className="input-field rounded-l-none"
                    maxLength={10}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Class *</label>
                  <select
                    name="class"
                    value={form.class}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select Class</option>
                    {CLASSES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Stream</label>
                  <select
                    name="stream"
                    value={form.stream}
                    onChange={handleChange}
                    className="input-field"
                  >
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
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Any specific queries or information you'd like to share..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center mt-2"
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
            </form>
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
                  <p className="text-gray-700 text-sm mt-0.5">{SITE_CONFIG.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#800000]/8 flex items-center justify-center flex-shrink-0">
                  <Phone size={16} className="text-[#800000]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Phone</p>
                  <a href={`tel:${SITE_CONFIG.phone}`} className="text-gray-700 text-sm hover:text-[#800000] transition-colors">
                    {SITE_CONFIG.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#800000]/8 flex items-center justify-center flex-shrink-0">
                  <Mail size={16} className="text-[#800000]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Email</p>
                  <a href={`mailto:${SITE_CONFIG.email}`} className="text-gray-700 text-sm hover:text-[#800000] transition-colors">
                    {SITE_CONFIG.email}
                  </a>
                </div>
              </div>
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1ebe5a] transition-colors w-full justify-center"
              >
                <MessageCircle size={16} />
                Chat on WhatsApp
              </a>
            </div>

            {/* MAP */}
            <div className="rounded-2xl overflow-hidden border border-[#f0ebe0] shadow-sm h-56">
              <iframe
                src={SITE_CONFIG.mapEmbed}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ursuline Study Centre Location"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
