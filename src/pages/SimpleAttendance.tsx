import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ArrowRight, Camera, QrCode, UserCheck, Send } from "lucide-react";
import { Html5QrScanner } from "@/components/scanner/Html5QrScanner";
import PhysicsBackground from "@/components/PhysicsBackground";
import { PhoneContact } from "@/components/PhoneContact";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { usePayments } from "@/hooks/use-payments";

const SimpleAttendance = () => {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [scannedCode, setScannedCode] = useState<string>("");
  const [successfulScans, setSuccessfulScans] = useState<{ code: string, name: string, paid: boolean, lessonNumber: number }[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const { getStudentByCode } = useAuth();
  const { addAttendance, getNextLessonNumber, getDisplayLessonNumber } = useData();
  const { hasStudentPaidForCurrentLesson } = usePayments();
  
  // تحديث: فصل مسح الكود عن تسجيل الحضور
  const handleScanSuccess = (code: string) => {
    setScannedCode(code);
    setShowScanner(false);
  };
  
  const handleRegisterAttendance = async () => {
    if (!scannedCode) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى مسح الكود أو إدخاله أولاً"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const student = await getStudentByCode(scannedCode);
      
      if (student) {
        // الحصول على رقم الحصة التالية باستخدام الدالة الموحدة
        const rawLessonNumber = getNextLessonNumber(student.id);

        // حساب رقم الحصة للعرض (دائري من 1 إلى 8)
        const displayLessonNumber = getDisplayLessonNumber(rawLessonNumber);
        
        // التحقق من حالة الدفع
        const hasPaid = hasStudentPaidForCurrentLesson(student.id, rawLessonNumber);
        
        // تسجيل الحضور
        await addAttendance(student.id, student.name, "present", rawLessonNumber);
        
        // تشغيل صوت
        const audio = new Audio("/attendance-present.mp3");
        audio.play().catch(e => console.error("Sound play failed:", e));
        
        // إضافة إلى قائمة المسح الناجح
        setSuccessfulScans(prev => [
          ...prev, 
          { 
            code: scannedCode, 
            name: student.name,
            paid: hasPaid,
            lessonNumber: displayLessonNumber
          }
        ]);
        
        toast({
          title: "✅ تم تسجيل الحضور",
          description: `تم تسجيل حضور الطالب ${student.name} (الحصة ${displayLessonNumber})${!hasPaid ? ' (غير مدفوع)' : ''}`
        });
        
        // مسح الكود بعد التسجيل
        setScannedCode("");
      } else {
        toast({
          variant: "destructive",
          title: "❌ كود غير صالح",
          description: "لم يتم العثور على طالب بهذا الكود"
        });
      }
    } catch (error) {
      console.error("Error processing code:", error);
      toast({
        variant: "destructive",
        title: "❌ خطأ",
        description: "حدث خطأ أثناء معالجة الكود"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleStartScanning = () => {
    setShowScanner(true);
  };
  
  const handleCloseScanner = () => {
    setShowScanner(false);
  };

  return (
    <div className="min-h-screen bg-physics-navy flex flex-col relative">
      <PhysicsBackground />
      <PhoneContact />
      
      {/* Header */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between relative z-10">
        <div className="flex items-center">
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-physics-gold hover:opacity-80"
          >
            <ArrowRight size={20} />
            <span>العودة للرئيسية</span>
          </button>
        </div>
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 relative z-10">
        <div className="mx-auto max-w-lg">
          <h1 className="text-2xl font-bold text-physics-gold text-center mb-6">تسجيل الحضور بالباركود</h1>
          
          {showScanner ? (
            <div className="mb-6">
              {/* عرض ماسح باستخدام HTML5 QR Scanner */}
              <Html5QrScanner
                onScanSuccess={handleScanSuccess}
                onClose={handleCloseScanner}
              />
              <p className="text-white text-center mt-4">
                وجّه الكاميرا نحو باركود أو رمز QR للطالب
              </p>
            </div>
          ) : (
            <div className="flex flex-col bg-physics-dark p-4 rounded-lg mb-6">
              {/* زر تشغيل الكاميرا */}
              <button 
                onClick={handleStartScanning}
                className="flex items-center justify-center gap-2 bg-physics-gold text-physics-navy rounded-full py-4 px-6 font-bold shadow-lg hover:bg-physics-gold/90 transition-all transform active:scale-95 w-full md:w-3/4 mx-auto text-lg mb-4"
                disabled={isProcessing}
              >
                <Camera size={24} />
                <span>📷 مسح الكود بالكاميرا</span>
              </button>
              
              {/* حقل إدخال الكود يدويًا */}
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  placeholder="أو أدخل الكود يدويًا هنا"
                  className="bg-physics-navy border border-physics-gold/30 px-4 py-2 rounded flex-1 text-white"
                  disabled={isProcessing}
                />
              </div>
              
              {/* زر تسجيل الحضور */}
              <button
                onClick={handleRegisterAttendance}
                className="flex items-center justify-center gap-2 mt-4 bg-green-600 text-white py-3 px-6 rounded-lg w-full hover:bg-green-700 transition-all transform active:scale-95 disabled:opacity-50"
                disabled={!scannedCode || isProcessing}
              >
                {isProcessing ? (
                  <span className="animate-pulse">جاري التسجيل...</span>
                ) : (
                  <>
                    <Send size={20} />
                    <span>تسجيل الحضور</span>
                  </>
                )}
              </button>
            </div>
          )}
          
          {/* عرض الرموز التي تم مسحها بنجاح */}
          {successfulScans.length > 0 && (
            <div className="bg-physics-dark p-4 rounded-lg mt-6">
              <h2 className="text-xl font-bold text-physics-gold mb-4">تم تسجيل حضور</h2>
              <div className="space-y-2">
                {successfulScans.map((scan, index) => (
                  <div 
                    key={`${scan.code}-${index}`} 
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      scan.paid ? 'bg-physics-navy/50' : 'bg-red-900/20'
                    }`}
                  >
                    <UserCheck className={scan.paid ? "text-green-500" : "text-red-500"} size={20} />
                    <div>
                      <span className="text-white block">{scan.name}</span>
                      <span className="text-white/70 text-xs">كود: {scan.code}</span>
                      <span className="text-white/70 text-xs mr-2">الحصة: {scan.lessonNumber}</span>
                    </div>
                    {!scan.paid && (
                      <span className="mr-auto text-xs bg-red-500/20 px-2 py-1 rounded text-red-300">
                        غير مدفوع
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SimpleAttendance;
