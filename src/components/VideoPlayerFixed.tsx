
import React, { useRef, useEffect, useState } from "react";
import { Play, Download } from "lucide-react";
import { VideoPasswordPrompt } from "./VideoPasswordPrompt";
import { useAuth } from "@/context/AuthContext";

interface VideoPlayerProps {
  src: string;
  title: string;
  password?: string;
}

export function VideoPlayerFixed({ src, title, password }: VideoPlayerProps) {
  const { currentUser } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  
  useEffect(() => {
    if (!videoRef.current) return;
    
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };
    
    const handleError = (e: any) => {
      setIsLoading(false);
      console.error("Video error:", e);
      setError("حدث خطأ في تحميل الفيديو، يرجى التحقق من الرابط أو الاتصال بالإنترنت");
    };
    
    const video = videoRef.current;
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
    
    // تحسين تشغيل الفيديو على الموبايل
    video.setAttribute("playsinline", "true");
    video.setAttribute("controls", "false");
    video.muted = false;
    video.preload = "auto";
    video.load();
    
    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [src]);

  const handlePasswordSubmit = (enteredPassword: string) => {
    if (enteredPassword === password) {
      setIsPasswordVerified(true);
      setShowPasswordPrompt(false);
    } else {
      throw new Error("كلمة المرور غير صحيحة");
    }
  };

  const handlePlayClick = () => {
    // إذا كان الفيديو محمي بكلمة مرور والمستخدم طالب
    if (password && currentUser?.role === "student" && !isPasswordVerified) {
      setShowPasswordPrompt(true);
    } else {
      handlePlayVideo();
    }
  };

  // إذا كان الفيديو محمي والمستخدم طالب ولم يتم التحقق من كلمة المرور
  const isLocked = password && currentUser?.role === "student" && !isPasswordVerified;

  // تحسين وظيفة تشغيل الفيديو للموبايل
  const handlePlayVideo = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      if (video.paused) {
        // محاولة تشغيل الفيديو
        video.play().then(() => {
          setIsPlaying(true);
          
          // محاولة طلب ملء الشاشة على الموبايل
          try {
            if (video.requestFullscreen) {
              video.requestFullscreen().catch(err => {
                console.log("Failed fullscreen:", err);
              });
            }
          } catch (e) {
            console.log("Fullscreen error:", e);
          }
        }).catch(e => {
          console.error("Failed to play video:", e);
          setError("فشل تشغيل الفيديو، يرجى النقر مرة أخرى أو التحقق من إعدادات المتصفح");
          
          // محاولة تشغيل الفيديو بدون صوت إذا فشل التشغيل العادي
          video.muted = true;
          video.play().then(() => {
            video.muted = false; // محاولة إعادة الصوت بعد التشغيل
            setIsPlaying(true);
          }).catch(err => {
            console.error("Failed to play even when muted:", err);
          });
        });
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };
  
  // تنزيل الفيديو
  const handleDownload = () => {
    if (src) {
      const link = document.createElement('a');
      link.href = src;
      link.download = `${title || 'video'}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // تشغيل مؤثر صوتي
      const audio = new Audio("/click-sound.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Sound play failed:", e));
    }
  };

  // إزالة هذا الجزء لأننا سنعرض شاشة القفل بدلاً من النافذة المنبثقة مباشرة

  return (
    <>
      <div className="relative w-full h-full bg-physics-dark rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-physics-dark z-20">
            <div className="w-12 h-12 border-4 border-physics-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-physics-dark z-20">
            <div className="text-white text-center px-4">
              <p className="text-red-400 mb-2">{error}</p>
              <p className="text-sm">تأكد من صحة الرابط وأنه يدعم التشغيل المباشر</p>
              <button
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  if (videoRef.current) {
                    videoRef.current.load();
                  }
                }}
                className="mt-2 goldBtn"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        )}

        {/* عرض الفيديو إذا لم يكن مقفل أو تم التحقق من كلمة المرور */}
        {!isLocked && (
          <video
            ref={videoRef}
            className="w-full h-full rounded-lg aspect-video bg-black"
            controls={isPlaying}
            title={title}
            controlsList="nodownload"
            playsInline
            preload="auto"
            onContextMenu={(e) => e.preventDefault()}
            style={{ display: isLoading || error || !isPlaying ? 'none' : 'block' }}
          >
            <source src={src} type="video/mp4" />
            <source src={src} type="video/webm" />
            <source src={src} type="video/x-matroska" />
            <source src={src} type="video/quicktime" />
            <source src={src} type="video/x-msvideo" />
            <source src={src} type="video/3gpp" />
            <source src={src} type="video/3gpp2" />
            <source src={src} type="application/x-mpegURL" />
            متصفحك لا يدعم تشغيل الفيديو
          </video>
        )}

        {/* عرض شاشة القفل للطلاب */}
        {isLocked && !isLoading && !error && (
          <div className="absolute inset-0 bg-physics-dark flex items-center justify-center">
            <div className="text-center text-white">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-physics-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-physics-gold mb-2">فيديو محمي</h3>
              <p className="text-gray-300 mb-4">هذا الفيديو محمي بكلمة مرور</p>
              <button
                onClick={handlePlayClick}
                className="goldBtn flex items-center gap-2 mx-auto"
              >
                <Play size={20} />
                إدخال كلمة المرور ومشاهدة الفيديو
              </button>
            </div>
          </div>
        )}
      
      {/* زر التشغيل للفيديوهات غير المحمية */}
      {!isLocked && !isPlaying && !isLoading && !error && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30 z-10"
          onClick={handlePlayVideo}
        >
          <div className="bg-primary bg-opacity-90 p-8 rounded-full hover:bg-primary transition-colors shadow-xl hover:scale-105 transform duration-200 flex items-center justify-center">
            <Play size={56} className="text-physics-navy ml-2" fill="#091138" />
          </div>

          <div className="absolute bottom-6 right-6 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="bg-physics-navy/90 hover:bg-physics-navy p-3 rounded-full text-physics-gold shadow-lg transition-all"
              title="تحميل الفيديو"
            >
              <Download size={24} />
            </button>
          </div>

          <div className="absolute bottom-6 left-6 text-lg text-white font-bold bg-physics-navy/90 hover:bg-physics-navy px-4 py-2 rounded-full shadow-lg transition-all">
            اضغط للتشغيل
          </div>
        </div>
      )}
      
      {/* زر التنزيل أثناء التشغيل */}
      {isPlaying && (
        <div 
          className="absolute top-4 right-4 z-20"
          style={{ display: isLoading ? 'none' : 'block' }}
        >
          <button
            onClick={handleDownload}
            className="bg-physics-navy/80 hover:bg-physics-navy p-2 rounded-full text-physics-gold shadow-lg transition-all"
            title="تحميل الفيديو"
          >
            <Download size={20} />
          </button>
        </div>
      )}
      </div>

      {/* نافذة إدخال كلمة المرور */}
      <VideoPasswordPrompt
        isOpen={showPasswordPrompt}
        onClose={() => setShowPasswordPrompt(false)}
        onPasswordSubmit={handlePasswordSubmit}
        videoTitle={title}
      />
    </>
  );
}
