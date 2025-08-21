
export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  status: "present" | "absent";
  lessonNumber: number;
  // Supabase fields
  student_id?: string;
  student_name?: string;
  lesson_number?: number;
}

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  examName: string;
  score: number;
  totalScore: number;
  date: string;
  lessonNumber: number;
  group: string;
  performanceIndicator: "excellent" | "very-good" | "good" | "fair" | "needs-improvement";
  // Supabase fields
  student_id?: string;
  student_name?: string;
  exam_name?: string;
  total_score?: number;
  lesson_number?: number;
  group_name?: string;
  performance_indicator?: string;
}

export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  uploadDate: string;
  grade: "first" | "second" | "third";
  isYouTube?: boolean;
  password?: string;
  blockedStudents?: string[];
  // Supabase fields
  upload_date?: string;
  is_youtube?: boolean;
  video_password?: string;
  blocked_students?: string;
}

export interface Book {
  id: string;
  title: string;
  url: string;
  uploadDate: string;
  grade: "first" | "second" | "third";
  // Supabase fields
  upload_date?: string;
}

export interface Student {
  id: string;
  name: string;
  code: string;
  group: string;
  grade: "first" | "second" | "third";
  password?: string;
  phone?: string;
  parentPhone?: string;
  role?: string;
  // Supabase fields
  group_name?: string;
  parent_phone?: string;
}

export interface User {
  id: string;
  name: string;
  role: "admin" | "student" | "parent";
  email?: string;
  code?: string;
  group?: string;
  grade?: "first" | "second" | "third";
  phone?: string;
  password?: string;
  childrenIds?: string[];
}

export interface Parent {
  id: string;
  phone: string;
  studentCode: string;
  studentName: string;
  password: string;
  // Supabase fields
  student_code?: string;
  student_name?: string;
}

export interface PaidMonth {
  month: string;
  date: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  group: string;
  month: string;
  date: string;
  amount?: string; // قيمة المبلغ المدفوع
  paidMonths: PaidMonth[];
  // Supabase fields
  student_id?: string;
  student_name?: string;
  student_code?: string;
  student_group?: string;
}
