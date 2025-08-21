
import { useState, useEffect } from 'react';

// هذا الخطاف البسيط يمكن استخدامه لتحميل الخط المناسب وتطبيقه على التطبيق
export function useFont() {
  const [fontLoaded, setFontLoaded] = useState(false);
  
  useEffect(() => {
    // يمكننا التحقق مما إذا كان خط Tajawal متاحًا
    document.fonts.ready.then(() => {
      setFontLoaded(true);
    });
  }, []);
  
  return {
    loaded: fontLoaded,
    className: "font-tajawal" // اسم الخط في تكوين Tailwind
  };
}
