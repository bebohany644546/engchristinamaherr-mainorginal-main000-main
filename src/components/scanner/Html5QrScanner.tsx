
import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface Html5QrScannerProps {
  onScanSuccess: (code: string) => void;
  onClose: () => void;
}

export function Html5QrScanner({ onScanSuccess, onClose }: Html5QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // تهيئة الماسح الضوئي
    if (containerRef.current) {
      const scannerId = "html5-qr-scanner";
      
      // إنشاء عنصر div للماسح الضوئي إذا لم يكن موجودًا
      let scannerElement = document.getElementById(scannerId);
      if (!scannerElement) {
        scannerElement = document.createElement("div");
        scannerElement.id = scannerId;
        containerRef.current.appendChild(scannerElement);
      }

      // إنشاء كائن الماسح الضوئي
      scannerRef.current = new Html5Qrcode(scannerId);
      
      // بدء المسح الضوئي
      startScanner();
    }

    // تنظيف عند إزالة المكون
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    if (!scannerRef.current) return;

    try {
      setIsScanning(true);
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };
      
      await scannerRef.current.start(
        { facingMode: "environment" }, // تفضيل الكاميرا الخلفية
        config,
        handleQrCodeSuccess,
        handleQrCodeError
      );
      
      toast({
        title: "✅ تم تشغيل الكاميرا",
        description: "وجه الكاميرا إلى رمز QR أو Barcode"
      });
      
    } catch (err) {
      console.error("خطأ في بدء الماسح الضوئي:", err);
      toast({
        variant: "destructive",
        title: "تعذر تشغيل الكاميرا",
        description: "تأكد من أن لديك كاميرا متاحة وأنك منحتها الأذونات المناسبة"
      });
      setIsScanning(false);
      onClose();
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
        console.log("تم إيقاف الماسح الضوئي");
      } catch (error) {
        console.error("خطأ في إيقاف الماسح الضوئي:", error);
      }
    }
  };

  const handleQrCodeSuccess = async (decodedText: string) => {
    console.log("تم مسح الكود بنجاح:", decodedText);
    
    // إيقاف الماسح الضوئي بعد النجاح
    await stopScanner();
    
    // نُرجع الكود المقروء دون تسجيل الحضور تلقائيًا
    toast({
      title: "✅ تم قراءة الكود",
      description: "تم ملء الحقل بكود الطالب"
    });
    
    // استدعاء الدالة المخصصة للنجاح مع الكود المقروء
    onScanSuccess(decodedText);
  };

  const handleQrCodeError = (error: any) => {
    // نتجاهل أخطاء المسح العادية (عندما لا يوجد رمز QR في الإطار)
    // ولكن نسجل الأخطاء الأخرى
    if (error?.message?.includes("No barcode or QR code detected")) {
      return;
    }
    console.error("خطأ في مسح الكود:", error);
  };

  // تحسين CSS للاستخدام على الأجهزة المحمولة
  const scannerStyle = {
    width: '100%',
    maxWidth: '100%'
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-physics-dark">
      {/* حاوية لعنصر الماسح الضوئي */}
      <div 
        ref={containerRef} 
        className="w-full aspect-video max-h-[60vh] relative"
        style={scannerStyle}
      >
        {/* غطاء زاوي للإطار */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-physics-gold"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-physics-gold"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-physics-gold"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-physics-gold"></div>
        </div>

        {/* زر الإغلاق */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-2 bg-physics-navy/90 hover:bg-physics-navy rounded-full z-30 shadow-lg border border-physics-gold/30 transition-all transform hover:scale-110"
          aria-label="إغلاق الكاميرا"
        >
          <X className="text-white" size={20} />
        </button>
        
        {/* نص توجيهي */}
        <div className="absolute bottom-4 left-0 right-0 text-center z-20">
          <p className="text-white text-sm bg-physics-navy/90 py-2 px-4 rounded-full inline-block shadow-lg border border-physics-gold/30">
            ضع رمز QR أو Barcode داخل المربع للمسح
          </p>
        </div>
      </div>
    </div>
  );
}
