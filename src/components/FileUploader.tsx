
import { useState, useRef } from "react";
import { Upload, Copy, Check, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FileUploaderProps {
  onFileURLGenerated: (url: string) => void;
}

export function FileUploader({ onFileURLGenerated }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileURL, setFileURL] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type (PDF, DOCX, etc.)
    const acceptedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!acceptedTypes.includes(file.type)) {
      toast({
        title: "خطأ في الملف",
        description: "يرجى اختيار ملف PDF أو DOCX",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (max 10GB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB
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
    
    // Simulate upload with progress
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
      // Create a temporary local URL for the file
      // In a real app, this would be replaced with an actual upload to a server/CDN
      const url = URL.createObjectURL(file);
      
      // In a production app, we'd upload to a server here
      // For demo purposes, we'll use the local URL
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        setFileURL(url);
        onFileURLGenerated(url);
        
        toast({
          title: "تم رفع الملف بنجاح",
          description: "يمكنك الآن نسخ الرابط"
        });
        
        setTimeout(() => {
          setIsUploading(false);
        }, 500);
      }, 2000);
    } catch (error) {
      clearInterval(interval);
      setIsUploading(false);
      
      toast({
        title: "فشل في رفع الملف",
        description: "حدث خطأ أثناء رفع الملف، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    }
  };
  
  const handleCopyLink = () => {
    if (!fileURL) return;
    
    navigator.clipboard.writeText(fileURL).then(() => {
      setIsCopied(true);
      
      toast({
        title: "تم نسخ الرابط",
        description: "تم نسخ رابط الملف إلى الحافظة"
      });
      
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  };

  return (
    <div className="bg-physics-dark p-6 rounded-lg">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-physics-gold">رفع ملف جديد</h3>
        <p className="text-sm text-gray-300">اختر ملف PDF أو DOCX لرفعه والحصول على رابط مباشر</p>
      </div>
      
      <div 
        className="border-2 border-dashed border-physics-gold/50 rounded-lg p-8 text-center cursor-pointer hover:border-physics-gold transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
        />
        
        <FileText className="mx-auto text-physics-gold mb-2" size={36} />
        <p className="text-white">اضغط هنا لاختيار ملف للرفع</p>
        <p className="text-sm text-gray-400 mt-2">الحد الأقصى: 10 جيجابايت</p>
      </div>
      
      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-white mb-1">
            <span>جاري الرفع...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-physics-navy rounded-full h-2">
            <div 
              className="bg-physics-gold h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {fileURL && !isUploading && (
        <div className="mt-4">
          <div className="flex items-center">
            <input 
              type="text" 
              value={fileURL} 
              readOnly 
              className="inputField flex-1 ml-2"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={handleCopyLink}
              className="goldBtn p-2 flex items-center justify-center"
            >
              {isCopied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
