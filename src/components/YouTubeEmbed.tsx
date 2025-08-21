import React, { useState, useEffect } from "react";
import { VideoPasswordPrompt } from "./VideoPasswordPrompt";
import { YouTubePlayerClean } from "./YouTubePlayerClean";
import { useAuth } from "@/context/AuthContext";

interface YouTubeEmbedProps {
  videoUrl: string;
  title: string;
  password?: string;
}
export function YouTubeEmbed({
  videoUrl,
  title,
  password
}: YouTubeEmbedProps) {
  const { currentUser } = useAuth();
  // تم إزالة المتغيرات غير المطلوبة لأننا نستخدم YouTubePlayerClean الآن
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  // تم إزالة useEffect لأن YouTubePlayerClean يتعامل مع استخراج معرف الفيديو

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
    }
    // لا نحتاج setIsInteractive لأن YouTubePlayerClean يتعامل مع التشغيل
  };

  // إذا كان الفيديو محمي والمستخدم طالب ولم يتم التحقق من كلمة المرور
  const isLocked = password && currentUser?.role === "student" && !isPasswordVerified;

  // تم إزالة حالات التحميل والأخطاء لأن YouTubePlayerClean يتعامل معها

  return (
    <>
      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
        {/* عرض الفيديو المحسن إذا لم يكن مقفل أو تم التحقق من كلمة المرور */}
        {!isLocked && (
          <YouTubePlayerClean
            videoUrl={videoUrl}
            title={title}
            autoplay={false}
            muted={true}
            loop={false}
            className="absolute inset-0"
          />
        )}

        {/* عرض شاشة القفل للطلاب */}
        {isLocked && (
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
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                إدخال كلمة المرور ومشاهدة الفيديو
              </button>
            </div>
          </div>
        )}

        {/* تم إزالة طبقة التفاعل لأن YouTubePlayerClean يتعامل مع التحكم */}
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