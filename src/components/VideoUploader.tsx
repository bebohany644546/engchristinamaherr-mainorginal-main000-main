
import { useState, useRef } from "react";
import { Upload, Copy, Check, Film, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VideoUploaderProps {
  onVideoURLGenerated: (url: string) => void;
}

export function VideoUploader({ onVideoURLGenerated }: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // التحقق من أن الملف هو فيديو
    if (!file.type.startsWith("video/")) {
      toast({
        title: "خطأ في الملف",
        description: "يرجى اختيار ملف فيديو صالح",
        variant: "destructive"
      });
      return;
    }
    
    // التحقق من حجم الملف (بحد أقصى 10 جيجابايت)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB in bytes
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "حجم الملف كبير جداً",
        description: "الحد الأقصى لحجم الملف هو 10 جيجابايت",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setVideoPreview(null);
    setUploadSuccess(false);
    
    // محاكاة الرفع مع التقدم
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 300);
    
    try {
      // إنشاء رابط مؤقت محلي للفيديو مع إلغاء عند إلغاء التحميل
      const url = URL.createObjectURL(file);
      
      // إنشاء معاينة للفيديو
      const videoPreviewUrl = URL.createObjectURL(file);
      setVideoPreview(videoPreviewUrl);
      
      // في تطبيق حقيقي، سنرفع إلى خادم هنا
      // لأغراض العرض التوضيحي، سنستخدم عنوان URL محلي
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        setVideoURL(url);
        setUploadSuccess(true);
        onVideoURLGenerated(url);
        
        // تشغيل مؤثر صوتي
        const audio = new Audio("/upload-complete.mp3");
        audio.volume = 0.5;
        audio.play().catch(e => console.error("Sound play failed:", e));
        
        toast({
          title: "تم رفع الفيديو بنجاح",
          description: "يمكنك الآن نسخ الرابط أو إضافة المعلومات الإضافية"
        });
        
        setTimeout(() => {
          setIsUploading(false);
        }, 500);
      }, 2000);
    } catch (error) {
      clearInterval(interval);
      setIsUploading(false);
      
      toast({
        title: "فشل في رفع الفيديو",
        description: "حدث خطأ أثناء رفع الفيديو، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    }
  };
  
  const handleCopyLink = () => {
    if (!videoURL) return;
    
    navigator.clipboard.writeText(videoURL).then(() => {
      setIsCopied(true);
      
      // تشغيل مؤثر صوتي
      const audio = new Audio("/copy-sound.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Sound play failed:", e));
      
      toast({
        title: "تم نسخ الرابط",
        description: "تم نسخ رابط الفيديو إلى الحافظة"
      });
      
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  };
  
  const handleVideoPreviewClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };
  
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="bg-physics-dark p-6 rounded-lg">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-physics-gold">رفع فيديو جديد</h3>
        <p className="text-sm text-gray-300">اختر ملف فيديو لرفعه والحصول على رابط مباشر</p>
      </div>
      
      {!videoPreview ? (
        <div 
          className="border-2 border-dashed border-physics-gold/50 rounded-lg p-8 text-center cursor-pointer hover:border-physics-gold transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept="video/*"
            onChange={handleFileChange}
          />
          
          <Upload className="mx-auto text-physics-gold mb-2" size={36} />
          <p className="text-white">اضغط هنا لاختيار فيديو للرفع</p>
          <p className="text-sm text-gray-400 mt-2">بحد أقصى 10 جيجابايت</p>
        </div>
      ) : (
        <div className="border-2 border-physics-gold/50 rounded-lg overflow-hidden mb-4 bg-black">
          <div className="relative">
            <video 
              ref={videoRef}
              src={videoPreview} 
              className="w-full h-48 object-contain"
              controls
              playsInline
              onClick={handleVideoPreviewClick}
            />
            {uploadSuccess && (
              <div className="absolute top-2 right-2 bg-green-500 text-white p-1 px-3 rounded-full text-xs flex items-center">
                <Check size={14} className="mr-1" />
                تم التحميل بنجاح
              </div>
            )}
          </div>
          <div className="p-2 bg-physics-navy">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white mb-1">معاينة الفيديو</p>
                <Film className="text-physics-gold" size={16} />
              </div>
              <button
                onClick={() => {
                  // تنظيف عناوين URL للمعاينة
                  if (videoPreview) URL.revokeObjectURL(videoPreview);
                  if (videoURL) URL.revokeObjectURL(videoURL);
                  setVideoPreview(null);
                  setVideoURL(null);
                  setUploadSuccess(false);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-sm text-red-400 hover:text-red-300 flex items-center"
              >
                <X size={14} className="mr-1" />
                إزالة الفيديو
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-white mb-1">
            <span>جاري الرفع...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-physics-navy rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${uploadProgress === 100 ? 'bg-green-500' : 'bg-physics-gold'}`}
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {videoURL && !isUploading && (
        <div className="mt-4">
          <div className="flex items-center">
            <input 
              type="text" 
              value={videoURL} 
              readOnly 
              className="inputField flex-1 ml-2 text-xs"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={handleCopyLink}
              className="goldBtn p-2 flex items-center justify-center"
              title={isCopied ? "تم النسخ" : "نسخ الرابط"}
            >
              {isCopied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
