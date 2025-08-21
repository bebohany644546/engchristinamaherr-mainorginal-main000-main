import React from 'react';

interface YouTubePlayerSimpleProps {
  videoUrl: string;
  title?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  width?: string;
  height?: string;
}

export const YouTubePlayerSimple: React.FC<YouTubePlayerSimpleProps> = ({
  videoUrl,
  title = "فيديو تعليمي",
  autoplay = false,
  muted = false,
  loop = false,
  className = "",
  width = "100%",
  height = "400px"
}) => {
  // استخراج معرف الفيديو من رابط يوتيوب
  const getVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = getVideoId(videoUrl);

  if (!videoId) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} 
           style={{ width, height }}>
        <p className="text-gray-500">رابط فيديو يوتيوب غير صحيح</p>
      </div>
    );
  }

  // بناء رابط iframe يوتيوب مع المعاملات
  const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
  
  // إضافة المعاملات الأساسية
  const params = new URLSearchParams();
  params.set('rel', '0'); // عدم إظهار فيديوهات مقترحة
  params.set('modestbranding', '1'); // تقليل علامة يوتيوب التجارية
  params.set('controls', '1'); // إظهار أزرار التحكم الأصلية
  params.set('showinfo', '0'); // إخفاء معلومات الفيديو
  params.set('fs', '1'); // السماح بملء الشاشة
  params.set('cc_load_policy', '0'); // عدم إظهار الترجمة افتراضياً
  params.set('iv_load_policy', '3'); // إخفاء التعليقات التوضيحية
  params.set('autohide', '1'); // إخفاء أزرار التحكم تلقائياً
  
  if (autoplay) {
    params.set('autoplay', '1');
  }
  
  if (muted) {
    params.set('mute', '1');
  }
  
  if (loop) {
    params.set('loop', '1');
    params.set('playlist', videoId); // مطلوب للتكرار
  }

  embedUrl.search = params.toString();

  return (
    <div className={`relative w-full ${className}`} style={{ width }}>
      {title && (
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          {title}
        </h3>
      )}
      
      <div className="relative w-full" style={{ height }}>
        <iframe
          src={embedUrl.toString()}
          title={title}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="rounded-lg shadow-lg"
          style={{
            border: 'none',
            outline: 'none'
          }}
        />
      </div>
    </div>
  );
};

export default YouTubePlayerSimple;
