/**
 * validation.ts — Input validation schemas using Zod
 * Prevents injection attacks and ensures data integrity
 */
import { z } from "zod";

// Phone number validation (10 digits)
export const phoneSchema = z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits");

// Email validation
export const emailSchema = z.string().email("Invalid email format");

// Aadhaar validation (12 digits)
export const aadhaarSchema = z.string().regex(/^\d{12}$/, "Aadhaar must be exactly 12 digits");

// UUID validation
export const uuidSchema = z.string().uuid("Invalid ID format");

// Student update schema (whitelist allowed fields)
export const studentUpdateSchema = z.object({
  id: uuidSchema,
  full_name: z.string().min(2).max(100).optional(),
  dob: z.string().optional(),
  mother_name: z.string().min(2).max(100).optional(),
  father_name: z.string().min(2).max(100).optional(),
  present_class: z.string().optional(),
  present_board: z.string().optional(),
  present_school: z.string().max(200).optional(),
  present_year: z.string().max(4).optional(),
  course: z.string().optional(),
  vocational: z.string().optional(),
  present_village: z.string().max(100).optional(),
  present_district: z.string().max(100).optional(),
  present_ps: z.string().max(100).optional(),
  present_phone: phoneSchema.optional(),
  permanent_village: z.string().max(100).optional(),
  permanent_district: z.string().max(100).optional(),
  permanent_ps: z.string().max(100).optional(),
  permanent_phone: phoneSchema.optional(),
  admission_status: z.enum(["applied", "under_review", "approved", "rejected", "enrolled"]).optional(),
  admin_notes: z.string().max(1000).optional(),
  session: z.string().max(20).optional(),
});

// Student self-update schema (only safe fields)
export const studentSelfUpdateSchema = z.object({
  present_phone: phoneSchema.optional(),
  emergency_contact: phoneSchema.optional(),
});

// Enquiry schema
export const enquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  phone: phoneSchema,
  class: z.string().min(1, "Class is required").max(50),
  stream: z.string().max(100).optional(),
  message: z.string().max(1000, "Message too long").optional(),
});

// Course schema
export const courseSchema = z.object({
  name: z.string().min(2).max(200),
  category: z.enum(["board", "competitive", "vocational"]),
  description: z.string().max(1000).optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
});

// Faculty schema
export const facultySchema = z.object({
  name: z.string().min(2).max(100),
  subject: z.string().max(100).optional(),
  qualification: z.string().max(200).optional(),
  experience: z.string().max(50).optional(),
  role: z.string().min(2).max(100),
  photo_url: z.string().url().optional(),
  storage_path: z.string().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
});

// Testimonial schema
export const testimonialSchema = z.object({
  name: z.string().min(2).max(100),
  student_class: z.string().max(50).optional(),
  quote: z.string().min(10).max(500),
  rating: z.number().int().min(1).max(5).optional(),
  is_visible: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
});

// Video schema
export const videoSchema = z.object({
  video_id: z.string().min(5).max(50),
  title: z.string().max(200).optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
});

// FAQ schema
export const faqSchema = z.object({
  question: z.string().min(5).max(500),
  answer: z.string().min(5).max(2000),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
});

// Announcement schema
export const announcementSchema = z.object({
  title: z.string().min(3).max(200),
  message: z.string().min(5).max(1000),
  type: z.enum(["info", "success", "warning"]).optional(),
  expires_at: z.string().optional(),
  is_active: z.boolean().optional(),
});

// Result schema
export const resultSchema = z.object({
  label: z.string().min(2).max(200),
  value: z.string().min(1).max(100),
  source: z.string().min(2).max(200),
  is_visible: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
});

// Settings update schema
export const settingsUpdateSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().max(1000),
});

// Sanitize HTML content to prevent XSS
export function sanitizeHtml(html: string): string {
  if (typeof window !== "undefined") {
    // Client-side
    const DOMPurify = require("dompurify");
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br"],
      ALLOWED_ATTR: ["href"],
    });
  } else {
    // Server-side
    const { JSDOM } = require("jsdom");
    const DOMPurify = require("dompurify")(new JSDOM("").window);
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br"],
      ALLOWED_ATTR: ["href"],
    });
  }
}

// Validate and sanitize text input
export function sanitizeText(text: string, maxLength: number = 1000): string {
  if (!text) return "";
  // Remove any HTML tags
  const stripped = text.replace(/<[^>]*>/g, "");
  // Trim and limit length
  return stripped.trim().slice(0, maxLength);
}
