
import React, { useEffect, useState } from "react";
import { X, AlertCircle, Camera, ScanLine } from "lucide-react";

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  scanning: boolean;
  closeCamera: () => void;
  error?: string;
}

export function CameraPreview({ videoRef, canvasRef, scanning, closeCamera, error }: CameraPreviewProps) {
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [scanningAnimation, setScanningAnimation] = useState(false);

  // تحقق من حالة الفيديو بعد التحميل
  useEffect(() => {
    const checkVideoVisibility = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        console.log("تهيئة عرض الكاميرا في العرض الكامل");
        videoRef.current.style.width = "100%";
        videoRef.current.style.height = "100%";
        videoRef.current.style.objectFit = "cover";
        videoRef.current.style.display = "block";
        setIsVideoVisible(true);
        
        // تشغيل تأثير المسح بعد ظهور الفيديو
        setTimeout(() => setScanningAnimation(true), 500);
      } else {
        setIsVideoVisible(false);
        setScanningAnimation(false);
      }
    };
    
    // اختبار فوري
    checkVideoVisibility();
    
    // تحقق مرة أخرى بعد فترات متعددة للتأكد من تحميل الفيديو
    const timer1 = setTimeout(checkVideoVisibility, 500);
    const timer2 = setTimeout(checkVideoVisibility, 1500);
    const timer3 = setTimeout(checkVideoVisibility, 3000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [videoRef, videoRef.current?.srcObject]);

  return (
    <div className="relative w-full bg-physics-dark rounded-lg overflow-hidden camera-container" style={{ minHeight: '300px', maxHeight: '60vh' }}>
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/20 p-4 text-center z-20">
          <AlertCircle className="text-red-500 mb-2" size={32} />
          <p className="text-white text-sm">{error}</p>
        </div>
      ) : !isVideoVisible ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <Camera className="text-white/50 mb-2 animate-pulse" size={32} />
          <p className="text-white/70 text-sm">جاري تهيئة الكاميرا...</p>
        </div>
      ) : null}
      
      {/* عنصر الفيديو */}
      <video 
        ref={videoRef} 
        className="w-full h-full object-cover"
        style={{ display: isVideoVisible ? 'block' : 'none' }}
        playsInline
        muted
        autoPlay
      />
      
      <canvas ref={canvasRef} className="hidden absolute top-0 left-0 w-full h-full" />
      
      {/* زر الإغلاق */}
      <button 
        onClick={closeCamera}
        className="absolute top-2 right-2 p-2 bg-physics-navy rounded-full z-30 shadow-md"
        aria-label="إغلاق الكاميرا"
      >
        <X className="text-white" size={24} />
      </button>
      
      {/* مكون القراءة مع تحسين مرئي على شكل تطبيقات QR الشائعة */}
      {isVideoVisible && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute inset-0">
            {/* قناع شفاف أسود حول منطقة المسح */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            
            {/* منطقة المسح الشفافة */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-[280px] h-[70vw] max-h-[280px] bg-transparent"></div>
          </div>
          
          {/* إطار منطقة المسح المميز */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-[280px] h-[70vw] max-h-[280px] border-0">
            {/* الزوايا المميزة مثل تطبيقات QR الشهيرة */}
            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-physics-gold"></div>
            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-physics-gold"></div>
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-physics-gold"></div>
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-physics-gold"></div>
          </div>
          
          {/* خط المسح المتحرك مع تأثير توهج */}
          {scanningAnimation && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-[280px] h-[70vw] max-h-[280px] pointer-events-none">
              <div className="absolute inset-x-0 h-1 bg-physics-gold/70 shadow-[0_0_10px_2px_rgba(255,215,0,0.7)] animate-scan"></div>
            </div>
          )}
        </div>
      )}
      
      {/* نص توجيهي محسن */}
      {isVideoVisible && (
        <div className="absolute bottom-8 left-0 right-0 text-center z-20">
          <p className="text-white font-bold bg-physics-navy/90 py-3 px-6 rounded-full inline-block shadow-lg border border-physics-gold/50">
            ضع رمز QR داخل الإطار للمسح
          </p>
        </div>
      )}
    </div>
  );
}
