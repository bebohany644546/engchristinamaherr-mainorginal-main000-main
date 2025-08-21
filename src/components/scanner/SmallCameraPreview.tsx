
import React, { useEffect, useState, useRef } from "react";
import { X, AlertCircle, Camera, ScanLine } from "lucide-react";

interface SmallCameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  closeCamera: () => void;
  error?: string;
}

export function SmallCameraPreview({ videoRef, closeCamera, error }: SmallCameraPreviewProps) {
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // تحسين تحقق حالة الفيديو بعد التحميل
  useEffect(() => {
    const checkVideoVisibility = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        console.log("تهيئة عرض الكاميرا في العرض الصغير");
        
        // تحسين أداء الفيديو وعرضه
        videoRef.current.style.display = "block";
        videoRef.current.style.width = "100%";
        videoRef.current.style.height = "100%";
        videoRef.current.style.objectFit = "cover";
        
        // إضافة تحسينات لتعزيز الأداء
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        
        // تشغيل الفيديو مرة أخرى إذا توقف
        if (videoRef.current.paused) {
          videoRef.current.play().catch(e => 
            console.error("فشل تشغيل الفيديو:", e)
          );
        }
        
        setIsVideoVisible(true);
      } else {
        setIsVideoVisible(false);
      }
    };
    
    // تحقق فوري
    checkVideoVisibility();
    
    // تحسين آلية التحقق باستخدام متغيرات زمنية متعددة
    const timers = [
      setTimeout(checkVideoVisibility, 300),
      setTimeout(checkVideoVisibility, 600),
      setTimeout(checkVideoVisibility, 1500),
      setTimeout(checkVideoVisibility, 3000)
    ];
    
    // التحقق عند تغير حجم النافذة
    const handleResize = () => {
      if (containerRef.current && videoRef.current) {
        // ضبط الأبعاد بما يتناسب مع الحاوية
        const containerWidth = containerRef.current.clientWidth;
        videoRef.current.style.maxWidth = `${containerWidth}px`;
      }
      checkVideoVisibility();
    };
    
    window.addEventListener('resize', handleResize);
    
    // استدعاء handleResize مرة واحدة للضبط المبدئي
    setTimeout(handleResize, 300);
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
      window.removeEventListener('resize', handleResize);
    };
  }, [videoRef, videoRef.current?.srcObject]);

  return (
    <div 
      ref={containerRef}
      className="relative mt-4 w-full aspect-video bg-physics-dark rounded-lg overflow-hidden flex items-center justify-center border-2 border-physics-gold/50 shadow-lg camera-container"
    >
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/20 p-4 text-center z-20">
          <AlertCircle className="text-red-500 mb-2" size={32} />
          <p className="text-white text-sm">{error}</p>
        </div>
      ) : !isVideoVisible ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <ScanLine className="text-physics-gold mb-2 animate-pulse" size={32} />
          <p className="text-white/70 text-sm">جاري تنشيط الكاميرا...</p>
        </div>
      ) : null}
      
      <video 
        ref={videoRef} 
        className="w-full h-full object-cover"
        style={{ display: isVideoVisible ? 'block' : 'none' }}
        playsInline 
        muted 
        autoPlay
      />
      
      {/* إطار مسح QR مع تأثيرات محسنة */}
      {isVideoVisible && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute inset-0 border-2 border-physics-gold/60 animate-pulse-border rounded-lg shadow-[0_0_15px_rgba(255,215,0,0.3)]"></div>
          
          {/* مؤثر خطوط الزوايا المثل تطبيقات QR الشهيرة */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border-0 rounded-md">
            {/* الزوايا المميزة مع تحسينات مرئية */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-physics-gold animate-glow"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-physics-gold animate-glow"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-physics-gold animate-glow"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-physics-gold animate-glow"></div>
          </div>
          
          {/* خط المسح المتحرك محسن */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4">
            <div className="absolute inset-x-0 h-1.5 bg-physics-gold/80 animate-scan shadow-[0_0_15px_5px_rgba(255,215,0,0.7)]"></div>
          </div>
        </div>
      )}
      
      {/* زر الإغلاق محسن */}
      <button 
        onClick={closeCamera}
        className="absolute top-2 right-2 p-2 bg-physics-navy/90 hover:bg-physics-navy rounded-full z-30 shadow-lg border border-physics-gold/30 transition-all transform hover:scale-110"
        aria-label="إغلاق الكاميرا"
      >
        <X className="text-white" size={20} />
      </button>
      
      {/* نص توجيهي للمستخدم محسن */}
      {isVideoVisible && (
        <div className="absolute bottom-2 left-0 right-0 text-center z-20">
          <p className="text-white text-xs bg-physics-navy/90 py-2 px-4 rounded-full inline-block shadow-lg border border-physics-gold/30 animate-pulse">
            ضع رمز QR داخل المربع للمسح
          </p>
        </div>
      )}
    </div>
  );
}
