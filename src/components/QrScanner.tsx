
import React, { useState } from "react";
import { useStudentAttendance } from "@/hooks/useStudentAttendance";
import { Html5QrScanner } from "@/components/scanner/Html5QrScanner";
import { ManualCodeEntry } from "@/components/scanner/ManualCodeEntry";
import { PaymentStatusDisplay } from "@/components/scanner/PaymentStatusDisplay";
import { PermissionDeniedWarning } from "@/components/scanner/PermissionDeniedWarning";
import { toast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";

export function QrScanner() {
  const [showScanner, setShowScanner] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  const {
    scannedCode,
    setScannedCode,
    paymentStatus,
    isProcessing,
    setIsProcessing,
    processScannedCode,
    handleManualEntry
  } = useStudentAttendance();

  // معالجة بدء الكاميرا
  const handleStartCamera = async () => {
    try {
      setIsProcessing(true);
      setShowScanner(true);
      
      toast({
        title: "جاري تشغيل الكاميرا",
        description: "يرجى الانتظار لحظة..."
      });
      
    } catch (error) {
      console.error("Error starting camera:", error);
      setPermissionDenied(true);
      
      toast({
        variant: "destructive",
        title: "❌ تعذر تشغيل الكاميرا",
        description: "يرجى التأكد من أن الكاميرا متصلة وأن لديك الأذونات المناسبة"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // تم تعديل هذه الدالة لتُعبئ حقل الإدخال فقط بدلاً من تسجيل الحضور مباشرة
  const handleScanSuccess = (code: string) => {
    setShowScanner(false);
    setScannedCode(code); // ملء حقل الإدخال بالكود المقروء
    
    // تشغيل صوت
    const audio = new Audio("/scan-success.mp3");
    audio.play().catch(e => console.error("Sound play failed:", e));
    
    toast({
      title: "تم مسح الكود",
      description: "تم إدخال الكود، اضغط على زر تسجيل الحضور للتأكيد"
    });
  };
  
  const handleCloseScanner = () => {
    setShowScanner(false);
    setIsProcessing(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="relative bg-physics-dark p-4 rounded-lg">
        {showScanner ? (
          <div className="mb-4">
            <h2 className="text-lg font-bold text-physics-gold text-center mb-2">قم بتوجيه الكاميرا إلى كود QR</h2>
            <Html5QrScanner 
              onScanSuccess={handleScanSuccess}
              onClose={handleCloseScanner}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center p-6">
            <button 
              onClick={handleStartCamera}
              className="flex items-center justify-center gap-2 bg-physics-gold text-physics-navy rounded-full py-4 px-6 font-bold shadow-lg hover:bg-physics-gold/90 transition-all transform active:scale-95 w-full md:w-3/4 text-lg mb-4"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="animate-pulse">جاري التحميل...</span>
              ) : (
                <>
                  <Camera size={24} />
                  <span>📷 مسح الكود بالكاميرا</span>
                </>
              )}
            </button>
            
            {permissionDenied && <PermissionDeniedWarning />}
            
            <div className="my-4 text-center w-full">
              <p className="text-white mb-2">أو</p>
              <div className="w-full h-px bg-physics-gold/30"></div>
            </div>
            
            <ManualCodeEntry
              scannedCode={scannedCode}
              setScannedCode={setScannedCode}
              handleManualEntry={handleManualEntry}
              isProcessing={isProcessing}
            />
          </div>
        )}
        
        <PaymentStatusDisplay paymentStatus={paymentStatus} />
      </div>
    </div>
  );
}
