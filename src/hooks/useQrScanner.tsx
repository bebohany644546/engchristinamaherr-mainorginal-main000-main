
import { useRef, useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import jsQR from "jsqr";

export function useQrScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [permissionState, setPermissionState] = useState<string>("prompt");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  // تحقق من حالة إذن الكاميرا عند تحميل المكون
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // تحقق مما إذا كانت واجهة برمجة التطبيقات للأذونات متاحة
        if (navigator.permissions && navigator.permissions.query) {
          try {
            const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
            console.log("حالة إذن الكاميرا:", result.state);
            setPermissionState(result.state);
            
            if (result.state === 'denied') {
              setPermissionDenied(true);
            } else {
              setPermissionDenied(false);
            }
            
            // الاستماع لتغييرات حالة الإذن
            result.addEventListener('change', () => {
              console.log("تغيرت حالة الإذن إلى:", result.state);
              setPermissionState(result.state);
              if (result.state === 'granted') {
                setPermissionDenied(false);
              } else if (result.state === 'denied') {
                setPermissionDenied(true);
                stopScanner();
              }
            });
          } catch (error) {
            console.error("خطأ في استعلام أذونات الكاميرا:", error);
          }
        }
      } catch (error) {
        console.error("خطأ في طلب الأذونات:", error);
      }
    };
    
    checkPermissions();
    
    // تنظيف
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => {
          track.stop();
          console.log("تم إيقاف مسار الكاميرا:", track.label);
        });
      }
    };
  }, []);
  
  // تحسين طلب إذن الكاميرا والحصول على دفق الكاميرا
  const requestCameraPermission = async () => {
    try {
      console.log("طلب إذن الكاميرا...");
      
      // تحقق من دعم getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("getUserMedia غير مدعوم في هذا المتصفح");
        throw new Error("الكاميرا غير مدعومة في هذا المتصفح");
      }
      
      // الحصول على قائمة أجهزة الفيديو المتاحة
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log("أجهزة الفيديو المتاحة:", videoDevices.length);
      
      // محاولات متسلسلة للحصول على أفضل كاميرا للاستخدام
      
      // المحاولة 1: استخدام الكاميرا الخلفية (المفضلة لمسح QR)
      try {
        console.log("المحاولة 1: استخدام facingMode: environment");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: "environment" } },
          audio: false
        });
        console.log("نجحت المحاولة 1: استخدام الكاميرا الخلفية");
        return stream;
      } catch (err) {
        console.log("فشلت المحاولة 1:", err);
      }
      
      // المحاولة 2: استخدام الكاميرا الخلفية بدون exact
      try {
        console.log("المحاولة 2: استخدام facingMode: environment بدون exact");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false
        });
        console.log("نجحت المحاولة 2: استخدام الكاميرا الخلفية بدون exact");
        return stream;
      } catch (err) {
        console.log("فشلت المحاولة 2:", err);
      }
      
      // المحاولة 3: استخدام أي كاميرا متاحة
      console.log("المحاولة 3: استخدام أي كاميرا");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        console.log("نجحت المحاولة 3: استخدام أي كاميرا متاحة");
        return stream;
      } catch (err) {
        console.error("فشلت جميع المحاولات للوصول إلى الكاميرا:", err);
        setPermissionDenied(true);
        throw err;
      }
    } catch (err) {
      console.error("خطأ في أذونات الوسائط:", err);
      setPermissionDenied(true);
      throw err;
    }
  };
  
  // بدء المسح الضوئي مع تحسينات للأداء
  const startScanner = async () => {
    try {
      setIsProcessing(true);
      console.log("بدء تشغيل الماسح الضوئي...");
      
      // طلب الإذن والحصول على تدفق الكاميرا
      let stream;
      try {
        stream = await requestCameraPermission();
        
        toast({
          title: "✅ جاري تشغيل الكاميرا",
          description: "يرجى توجيه الكاميرا إلى رمز QR"
        });
        
      } catch (err) {
        console.error("خطأ في الوصول إلى الكاميرا:", err);
        toast({
          variant: "destructive",
          title: "❌ لا يمكن الوصول إلى الكاميرا",
          description: "تأكد من أن لديك كاميرا متاحة وأنك منحتها الأذونات المناسبة"
        });
        setIsProcessing(false);
        throw err;
      }
      
      // تخزين تدفق الكاميرا
      setCameraStream(stream);
      
      // ربط تدفق الكاميرا بعنصر الفيديو - مع تحسينات التوقيت
      if (videoRef.current) {
        console.log("ربط تدفق الكاميرا بعنصر الفيديو");
        
        // تعيين حجم وأنماط الفيديو مباشرة
        videoRef.current.style.width = "100%";
        videoRef.current.style.height = "100%";
        videoRef.current.style.objectFit = "cover";
        videoRef.current.style.display = "block";
        
        // ربط التدفق
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        
        // التأكد من أن الفيديو يعمل
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            console.log("تم تحميل بيانات الفيديو، جاري التشغيل...");
            videoRef.current.play()
              .then(() => {
                console.log("تم تشغيل الفيديو بنجاح");
                // تأخير قصير للتأكد من تشغيل الفيديو بشكل صحيح
                setTimeout(() => {
                  setIsProcessing(false);
                  setScanning(true);
                }, 500);
              })
              .catch(playError => {
                console.error("خطأ في تشغيل الفيديو:", playError);
                setIsProcessing(false);
                toast({
                  variant: "destructive",
                  title: "❌ تعذر تشغيل الكاميرا",
                  description: "حاول مرة أخرى أو استخدم الإدخال اليدوي"
                });
              });
          }
        };
        
        // معالجة أخطاء عنصر الفيديو
        videoRef.current.onerror = (errorEvent) => {
          console.error("خطأ في عنصر الفيديو:", errorEvent);
          setIsProcessing(false);
          toast({
            variant: "destructive",
            title: "❌ خطأ في الكاميرا",
            description: "حدث خطأ أثناء محاولة تشغيل الكاميرا"
          });
        };
      }
    } catch (err) {
      console.error("خطأ في الوصول إلى الكاميرا:", err);
      setIsProcessing(false);
      throw err;
    }
  };

  // إيقاف المسح الضوئي
  const stopScanner = useCallback(() => {
    if (scanning) {
      console.log("إيقاف الماسح الضوئي");
      setScanning(false);
    }
  }, [scanning]);
  
  // إغلاق الكاميرا وتحرير الموارد
  const closeCamera = useCallback(() => {
    console.log("إغلاق الكاميرا");
    setScanning(false);
    setIsCameraActive(false);
    
    // إيقاف جميع مسارات الكاميرا
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        track.stop();
      });
      setCameraStream(null);
    }
    
    // تنظيف عنصر الفيديو
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [cameraStream]);

  // مسح رمز QR في الإطار الحالي مع تحسينات للدقة
  const scanCode = useCallback(() => {
    if (!scanning) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // ضبط أبعاد Canvas لتتناسب مع الفيديو
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // رسم إطار الفيديو الحالي على Canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        try {
          // الحصول على بيانات الصورة من Canvas
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // تحليل بيانات الصورة للعثور على رمز QR
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth",
          });
          
          // إذا تم العثور على رمز QR، أرجع البيانات
          if (code) {
            console.log("تم العثور على رمز QR:", code.data);
            return code.data;
          }
        } catch (error) {
          console.error("خطأ في تحليل رمز QR:", error);
        }
      }
    }
    
    return null;
  }, [scanning, videoRef, canvasRef]);

  return {
    videoRef,
    canvasRef,
    scanning,
    permissionDenied,
    isProcessing,
    setIsProcessing,
    isCameraActive,
    startScanner,
    stopScanner,
    closeCamera,
    scanCode
  };
}
