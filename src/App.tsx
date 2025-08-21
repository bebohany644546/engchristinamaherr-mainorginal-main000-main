import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import PhysicsBackground from "./components/PhysicsBackground";
import { PhysicsLoader } from "./components/PhysicsLoader";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentsManagement from "./pages/StudentsManagement";
import ParentsManagement from "./pages/ParentsManagement";
import ScanCode from "./pages/ScanCode";
import SimpleAttendance from "./pages/SimpleAttendance";
import Videos from "./pages/Videos";
import Books from "./pages/Books";
import StudentCode from "./pages/StudentCode";
import AttendanceRecord from "./pages/AttendanceRecord";
import Grades from "./pages/Grades";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import RequireAuth from "@/components/RequireAuth";
import AttendanceRecordList from "./pages/AttendanceRecordList";
import AttendanceListByGrade from "./pages/AttendanceListByGrade";
import GradesManagement from "./pages/GradesManagement";
import GradesByGrade from "./pages/GradesByGrade";
import StudentGrades from "./pages/StudentGrades";
import PaymentsManagement from "./pages/PaymentsManagement";
import SystemReset from "./pages/SystemReset";
import StudentPaymentsPage from "./pages/StudentPaymentsPage";
import ParentPaymentsPage from "./pages/ParentPaymentsPage";
import StudentBooks from "./pages/StudentBooks";
import { useEffect, useState } from "react";
import "./App.css";

// استيراد خط Tajawal للنص العربي
import "@fontsource/tajawal/400.css"; 
import "@fontsource/tajawal/500.css";
import "@fontsource/tajawal/700.css";

// إنشاء عنصر أنماط للخط
const tajawalFontStyles = document.createElement("style");
tajawalFontStyles.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
  
  * {
    font-family: 'Tajawal', sans-serif;
  }
  
  .font-tajawal {
    font-family: 'Tajawal', sans-serif;
  }
  
  /* تجاوز تصميم الإخطارات - جعلها غير شفافة */
  .toast-root {
    background-color: #171E31 !important;
    border: 1px solid #D4AF37 !important;
    color: white !important;
    opacity: 1 !important;
  }
  
  /* إشعارات غير شفافة */
  [data-sonner-toast] {
    opacity: 1 !important;
    background-color: #171E31 !important;
    border: 1px solid #D4AF37 !important;
  }
  
  /* أزرار مستديرة */
  .goldBtn {
    border-radius: 24px !important;
  }
  
  /* تحسين جودة الصورة */
  img {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
  
  /* مشغل فيديو أفضل */
  video {
    object-fit: contain;
  }
`;
document.head.appendChild(tajawalFontStyles);

const queryClient = new QueryClient();

const App = () => {
  const [showLoader, setShowLoader] = useState(true);

  // طلب الأذونات عند تحميل التطبيق
  useEffect(() => {
    const requestPermissions = async () => {
      // طلب إذن الإشعارات
      if ('Notification' in window && Notification.permission !== 'granted') {
        try {
          const permission = await Notification.requestPermission();
          console.log("Notification permission:", permission);
        } catch (error) {
          console.error("خطأ في طلب إذن الإشعارات:", error);
        }
      }
      
      // محاولة اكتشاف اتجاه الجهاز للحصول على الأذونات
      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          await (DeviceOrientationEvent as any).requestPermission();
        } catch (error) {
          console.log("خطأ في إذن توجيه الجهاز:", error);
        }
      }
      
      // طلب إذن الكاميرا إذا كان متاحًا
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          // طلب أذونات الصوت/الفيديو
          await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
              // إيقاف جميع المسارات لتحرير الكاميرا/الميكروفون
              stream.getTracks().forEach(track => track.stop());
            });
        } catch (error) {
          console.log("خطأ في أذونات الوسائط:", error);
        }
      }
    };
    
    // استدعاء وظيفة طلب الأذونات
    requestPermissions();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner
              toastOptions={{
                style: {
                  background: '#171E31',
                  color: 'white',
                  border: '1px solid #D4AF37',
                  borderRadius: '12px',
                  opacity: '1',
                },
                duration: 6000 // جعل الإشعارات تظهر لمدة 6 ثوانٍ
              }}
            />

            {/* صفحة التحميل */}
            {showLoader && (
              <PhysicsLoader onComplete={() => setShowLoader(false)} />
            )}

            <BrowserRouter>
              <div className="relative min-h-screen font-tajawal">
                <PhysicsBackground />
                <div className="relative z-10">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                    
                    {/* Admin Routes */}
                    <Route path="/students" element={<RequireAuth allowedRoles={["admin"]}><StudentsManagement /></RequireAuth>} />
                    <Route path="/parents" element={<RequireAuth allowedRoles={["admin"]}><ParentsManagement /></RequireAuth>} />
                    <Route path="/scan-code" element={<RequireAuth allowedRoles={["admin"]}><ScanCode /></RequireAuth>} />
                    <Route path="/simple-attendance" element={<RequireAuth allowedRoles={["admin"]}><SimpleAttendance /></RequireAuth>} />
                    <Route path="/attendance-list" element={<RequireAuth allowedRoles={["admin"]}><AttendanceRecordList /></RequireAuth>} />
                    <Route path="/attendance-list/:grade" element={<RequireAuth allowedRoles={["admin"]}><AttendanceListByGrade /></RequireAuth>} />
                    <Route path="/grades-management" element={<RequireAuth allowedRoles={["admin"]}><GradesManagement /></RequireAuth>} />
                    <Route path="/grades-management/:grade" element={<RequireAuth allowedRoles={["admin"]}><GradesByGrade /></RequireAuth>} />
                    <Route path="/payments" element={<RequireAuth allowedRoles={["admin"]}><PaymentsManagement /></RequireAuth>} />
                    <Route path="/system-reset" element={<RequireAuth allowedRoles={["admin"]}><SystemReset /></RequireAuth>} />
                    
                    {/* Student Routes */}
                    <Route path="/student-code" element={<RequireAuth allowedRoles={["student"]}><StudentCode /></RequireAuth>} />
                    <Route path="/student-grades" element={<RequireAuth allowedRoles={["student"]}><StudentGrades /></RequireAuth>} />
                    <Route path="/student-payments" element={<RequireAuth allowedRoles={["student"]}><StudentPaymentsPage /></RequireAuth>} />
                    <Route path="/student-books" element={<RequireAuth allowedRoles={["student"]}><StudentBooks /></RequireAuth>} />
                    
                    {/* Parent Routes */}
                    <Route path="/parent-payments" element={<RequireAuth allowedRoles={["parent"]}><ParentPaymentsPage /></RequireAuth>} />
                    
                    {/* All Users Routes */}
                    <Route path="/videos" element={<RequireAuth allowedRoles={["admin", "student"]}><Videos /></RequireAuth>} />
                    <Route path="/books" element={<RequireAuth allowedRoles={["admin", "student"]}><Books /></RequireAuth>} />
                    
                    {/* Parent & Student Routes */}
                    <Route path="/attendance-record" element={<RequireAuth allowedRoles={["parent", "student"]}><AttendanceRecord /></RequireAuth>} />
                    <Route path="/grades" element={<RequireAuth allowedRoles={["parent", "student"]}><Grades /></RequireAuth>} />
                    
                    {/* Auth error routes */}
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </DataProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
