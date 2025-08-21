
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGradeDisplay(grade: "first" | "second" | "third"): string {
  switch (grade) {
    case "first":
      return "الصف الأول الثانوي";
    case "second":
      return "الصف الثاني الثانوي";
    case "third":
      return "الصف الثالث الثانوي";
    default:
      return "";
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function generateRandomCode(): string {
  // Random 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateRandomPassword(): string {
  // Generate a random password with 5 unique digits
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  // Shuffle the array using Fisher-Yates algorithm
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  // Take first 5 digits
  return digits.slice(0, 5).join('');
}

export function getPerformanceClass(performanceIndicator: string): string {
  switch (performanceIndicator) {
    case "excellent":
      return "text-green-400";
    case "good":
      return "text-blue-400";
    case "average":
      return "text-yellow-400";
    case "poor":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
}

// تحقق مما إذا كانت كلمة المرور مستخدمة من قبل
export function isPasswordUsed(password: string, students: any[], parents: any[]): boolean {
  // تحقق مما إذا كانت كلمة المرور موجودة بالفعل في حسابات الطلاب
  const studentPasswordExists = students.some(student => student.password === password);
  
  // تحقق مما إذا كانت كلمة المرور موجودة بالفعل في حسابات أولياء الأمور
  const parentPasswordExists = parents.some(parent => parent.password === password);
  
  return studentPasswordExists || parentPasswordExists;
}

// توليد كلمة مرور فريدة غير مستخدمة
export function generateUniquePassword(students: any[], parents: any[]): string {
  let password = generateRandomPassword();
  
  // استمر في توليد كلمات مرور جديدة حتى تجد واحدة غير مستخدمة
  while (isPasswordUsed(password, students, parents)) {
    password = generateRandomPassword();
  }
  
  return password;
}

// هذه الدالة تنقي النص وتزيل العلامات الخاصة للبحث
export function sanitizeSearchText(text: string): string {
  return text.trim().toLowerCase();
}
