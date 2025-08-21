
import React from "react";
import { Camera, ScanLine } from "lucide-react";

interface CameraScanButtonProps {
  onClick: () => void;
  isProcessing: boolean;
}

export function CameraScanButton({ onClick, isProcessing }: CameraScanButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-center gap-2 bg-physics-gold text-physics-navy rounded-full py-4 px-6 font-bold shadow-lg hover:bg-physics-gold/90 transition-all transform active:scale-95 w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
      disabled={isProcessing}
    >
      {!isProcessing && (
        <span className="absolute inset-0 bg-white/20 animate-pulse rounded-full opacity-0"></span>
      )}
      
      {isProcessing ? (
        <ScanLine 
          size={24} 
          className="animate-pulse"
          strokeWidth={2.5}
        />
      ) : (
        <Camera 
          size={24} 
          strokeWidth={2.5}
        />
      )}
      <span>{isProcessing ? "جاري تفعيل الكاميرا..." : "مسح الكود بالكاميرا"}</span>
    </button>
  );
}
