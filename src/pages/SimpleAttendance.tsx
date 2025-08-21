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

// دالة لتشغيل مؤثر صوتي بسيط
const playConfirmationSound = async () => {
  try {
    // طريقة 1: استخدام Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // التأكد من أن AudioContext في حالة running
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // نغمة تأكيد مميزة
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.4);

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.8);

    console.log("🔊 تم تشغيل المؤثر الصوتي");
  } catch (error) {
    console.log("⚠️ فشل Web Audio API، جاري المحاولة بطريقة بديلة:", error);

    // طريقة 2: استخدام HTML Audio كبديل
    try {
      // إنشاء نغمة بسيطة باستخدام data URL
      const audioData = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT";
      const audio = new Audio(audioData);
      audio.volume = 0.3;
      await audio.play();
      console.log("🔊 تم تشغيل الصوت البديل");
    } catch (audioError) {
      console.log("⚠️ فشل تشغيل الصوت:", audioError);

      // طريقة 3: اهتزاز كبديل أخير (للهواتف)
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
        console.log("📳 تم تشغيل الاهتزاز كبديل");
      }
    }
  }
};

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
        
        // التحقق من حالة الدفع من صفحة المدفوعات
        const hasPaid = hasStudentPaidForCurrentLesson(student.id, rawLessonNumber);
        console.log(`💰 Payment check for ${student.name}: ${hasPaid ? 'PAID' : 'NOT PAID'} for lesson ${rawLessonNumber}`);

        // تسجيل الحضور
        await addAttendance(student.id, student.name, "present", rawLessonNumber);

        // تشغيل المؤثر الصوتي للتأكيد (1 ثانية)
        await playConfirmationSound();

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

        // رسالة تأكيد محسنة مع حالة الدفع الصحيحة
        const paymentStatus = hasPaid ? "✅ دافع" : "❌ غير دافع";
        toast({
          title: "✅ تم تسجيل الحضور",
          description: `${student.name} - الحصة ${displayLessonNumber} - ${paymentStatus}`,
          duration: 3000,
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
              <div className="flex flex-col gap-3 mb-4">
                <button
                  onClick={handleStartScanning}
                  className="flex items-center justify-center gap-2 bg-physics-gold text-physics-navy rounded-full py-4 px-6 font-bold shadow-lg hover:bg-physics-gold/90 transition-all transform active:scale-95 w-full md:w-3/4 mx-auto text-lg"
                  disabled={isProcessing}
                >
                  <Camera size={24} />
                  <span>📷 مسح الكود بالكاميرا</span>
                </button>

                {/* زر اختبار الصوت */}
                <button
                  onClick={playConfirmationSound}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-2 px-4 font-medium shadow hover:bg-blue-700 transition-all transform active:scale-95 w-full md:w-1/2 mx-auto text-sm"
                >
                  <span>🔊</span>
                  <span>اختبار الصوت</span>
                </button>
              </div>
              
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
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      scan.paid
                        ? 'bg-green-900/20 border-green-500/30'
                        : 'bg-red-900/20 border-red-500/30'
                    }`}
                  >
                    <UserCheck className={scan.paid ? "text-green-400" : "text-red-400"} size={20} />
                    <div className="flex-1">
                      <span className="text-white block font-medium">{scan.name}</span>
                      <div className="flex gap-4 text-xs text-white/70 mt-1">
                        <span>كود: {scan.code}</span>
                        <span>الحصة: {scan.lessonNumber}</span>
                      </div>
                    </div>
                    <div className={`text-xs px-3 py-1 rounded-full font-medium ${
                      scan.paid
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {scan.paid ? '✅ دافع' : '❌ غير دافع'}
                    </div>
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
