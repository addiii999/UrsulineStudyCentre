// Shared TypeScript types for the USC app

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  class: string;
  stream: string;
  message?: string;
  status: "new" | "contacted" | "admitted" | "rejected";
  created_at: string;
}

export interface Course {
  id: string;
  name: string;
  category: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface Faculty {
  id: string;
  name: string;
  subject: string;
  qualification: string;
  experience: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface YoutubeVideo {
  id: string;
  video_id: string;
  title: string;
  thumbnail_url: string;
  is_active: boolean;
  created_at: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  stream: string;
  admission_status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface FeeRecord {
  id: string;
  student_id: string;
  amount: number;
  stream: string;
  payment_date: string;
  receipt_no: string;
  status: "paid" | "pending" | "overdue";
}

export interface AdminUser {
  id: string;
  email: string;
  role: "admin";
  name: string;
}
