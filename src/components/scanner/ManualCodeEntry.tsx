
import React from "react";

interface ManualCodeEntryProps {
  scannedCode: string;
  setScannedCode: (code: string) => void;
  handleManualEntry: (e: React.FormEvent) => void;
  isProcessing: boolean;
}

export function ManualCodeEntry({ 
  scannedCode, 
  setScannedCode, 
  handleManualEntry,
  isProcessing 
}: ManualCodeEntryProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Play confirmation sound when submitting the form
    const audio = new Audio("/scan-success.mp3");
    audio.play().catch(e => console.error("Sound play failed:", e));
    
    // Call the original handler
    handleManualEntry(e);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-4">
        <input
          type="text"
          value={scannedCode}
          onChange={(e) => setScannedCode(e.target.value)}
          placeholder="أدخل كود الطالب يدوياً"
          className="inputField bg-physics-navy/60 border-physics-gold/50 text-white"
          disabled={isProcessing}
        />
      </div>
      <button 
        type="submit" 
        className="goldBtn w-full rounded-full shadow-lg"
        disabled={!scannedCode || isProcessing}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-physics-navy border-t-transparent rounded-full animate-spin mr-2"></div>
            <span>جاري المعالجة...</span>
          </div>
        ) : (
          "تسجيل الحضور"
        )}
      </button>
    </form>
  );
}
