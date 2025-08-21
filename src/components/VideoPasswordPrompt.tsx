import React, { useState } from "react";
import { Lock, X, Eye, EyeOff } from "lucide-react";

interface VideoPasswordPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordSubmit: (password: string) => void;
  videoTitle: string;
}

export function VideoPasswordPrompt({ 
  isOpen, 
  onClose, 
  onPasswordSubmit, 
  videoTitle 
}: VideoPasswordPromptProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("يرجى إدخال كلمة المرور");
      return;
    }

    setIsSubmitting(true);
    setError("");
    
    try {
      await onPasswordSubmit(password);
      setPassword("");
      setError("");
    } catch (error) {
      setError("كلمة المرور غير صحيحة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-physics-dark rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md border border-physics-gold/30 mx-4">
        <div className="flex justify-between items-start mb-4 sm:mb-6">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-physics-gold flex items-center gap-2 mb-2">
              <Lock size={20} className="sm:w-6 sm:h-6" />
              <span className="text-sm sm:text-xl">فيديو محمي</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              يتطلب كلمة مرور للمشاهدة
            </p>
          </div>
          <button
            type="button"
            className="text-gray-400 hover:text-white transition-colors p-1 ml-2"
            onClick={handleClose}
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="mb-4 sm:mb-6">
          <div className="bg-physics-navy/50 rounded-lg p-3 sm:p-4 border border-physics-gold/20">
            <p className="text-white text-center text-sm sm:text-base mb-1">
              الفيديو:
            </p>
            <p className="text-physics-gold text-center font-medium text-sm sm:text-base break-words">
              "{videoTitle}"
            </p>
          </div>
          <p className="text-gray-300 text-center text-xs sm:text-sm mt-3">
            يرجى إدخال كلمة المرور المطلوبة للمتابعة
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="relative">
            <Lock className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              className="w-full bg-physics-navy border border-physics-gold/30 rounded-lg px-10 sm:px-12 py-3 sm:py-4 text-white placeholder-gray-400 focus:outline-none focus:border-physics-gold transition-colors text-sm sm:text-base"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              disabled={isSubmitting}
              autoFocus
              style={{
                WebkitTapHighlightColor: 'transparent',
                fontSize: window.innerWidth < 640 ? '16px' : '14px' // منع التكبير في iOS
              }}
            />
            <button
              type="button"
              className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-physics-gold transition-colors p-1"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-lg text-center text-xs sm:text-sm">
              <div className="flex items-center justify-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              className="order-2 sm:order-1 flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 sm:py-2 px-4 rounded-lg transition-colors text-sm sm:text-base font-medium"
              onClick={handleClose}
              disabled={isSubmitting}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="order-1 sm:order-2 flex-1 bg-physics-gold hover:bg-physics-gold/90 text-physics-dark py-3 sm:py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
              disabled={isSubmitting || !password.trim()}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-physics-dark border-t-transparent rounded-full animate-spin ml-2"></div>
                  <span>جاري التحقق...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>🔓</span>
                  <span>تشغيل الفيديو</span>
                </div>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <div className="bg-physics-navy/30 rounded-lg p-3 border border-physics-gold/20">
            <p className="text-xs sm:text-sm text-gray-400 flex items-center justify-center gap-2">
              <span>💡</span>
              <span>إذا كنت لا تعرف كلمة المرور، يرجى التواصل مع المعلم</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
