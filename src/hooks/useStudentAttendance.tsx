
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { usePayments } from "@/hooks/use-payments";
import { toast } from "@/hooks/use-toast";

export function useStudentAttendance() {
  const [scannedCode, setScannedCode] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<{paid: boolean, studentName?: string} | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const { getStudentByCode } = useAuth();
  const { addAttendance, getNextLessonNumber, getDisplayLessonNumber } = useData();
  const { hasStudentPaidForCurrentLesson } = usePayments();

  const processScannedCode = async (code: string) => {
    setIsProcessing(true);
    
    try {
      const student = await getStudentByCode(code);
      if (student) {
        // الحصول على رقم الحصة التالية باستخدام الدالة الموحدة
        const rawLessonCount = getNextLessonNumber(student.id);

        // حساب رقم الحصة للعرض (دائري من 1 إلى 8)
        const displayLessonCount = getDisplayLessonNumber(rawLessonCount);
        
        // Check if student has paid for this lesson
        const hasPaid = hasStudentPaidForCurrentLesson(student.id, rawLessonCount);
        
        // Update payment status state
        setPaymentStatus({
          paid: hasPaid,
          studentName: student.name
        });
        
        // Record attendance regardless of payment status
        await addAttendance(student.id, student.name, "present", rawLessonCount);
        
        // Play sound effect
        const audio = new Audio("/attendance-present.mp3");
        audio.play().catch(e => console.error("Sound play failed:", e));
        
        toast({
          title: "✅ تم تسجيل الحضور",
          description: `تم تسجيل حضور الطالب ${student.name} (الحصة ${displayLessonCount})${!hasPaid ? ' (غير مدفوع)' : ''}`
        });
        
        // Clear code field after successful processing
        setScannedCode("");
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "❌ كود غير صالح",
          description: "لم يتم العثور على طالب بهذا الكود"
        });
        return false;
      }
    } catch (error) {
      console.error("Error processing scanned code:", error);
      toast({
        variant: "destructive",
        title: "❌ خطأ",
        description: "حدث خطأ أثناء معالجة الكود"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedCode || isProcessing) return;
    
    await processScannedCode(scannedCode);
  };

  return {
    scannedCode,
    setScannedCode,
    paymentStatus,
    isProcessing,
    setIsProcessing,
    processScannedCode,
    handleManualEntry
  };
}
