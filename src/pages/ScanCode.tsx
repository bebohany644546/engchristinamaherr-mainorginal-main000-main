
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ArrowRight, QrCode, UserMinus } from "lucide-react";
import { QrScanner } from "@/components/QrScanner";
import { ManualAttendance } from "@/components/ManualAttendance";
import PhysicsBackground from "@/components/PhysicsBackground";
import { PhoneContact } from "@/components/PhoneContact";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";

const ScanCode = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"scan" | "absence">("scan");
  const isMobile = useIsMobile();
  
  // طلب الإذن بالإشعارات من أجل تجربة أفضل
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if ('Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          console.log("Notification permission:", permission);
        } catch (error) {
          console.error("Error requesting notification permission:", error);
        }
      }
    };
    
    requestNotificationPermission();
    
    // إضافة توست للترحيب وتوجيه المستخدم
    toast({
      title: "صفحة تسجيل الحضور",
      description: "اضغط على زر مسح الكود لفتح الكاميرا"
    });
  }, []);

  return (
    <div className="min-h-screen bg-physics-navy flex flex-col relative">
      <PhysicsBackground />
      <PhoneContact />
      
      {/* Header */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between relative z-10">
        <div className="flex items-center">
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-physics-gold hover:opacity-80"
          >
            <ArrowRight size={20} />
            <span>العودة للرئيسية</span>
          </button>
        </div>
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 relative z-10 flex flex-col">
        <div className={`mx-auto ${isMobile ? 'w-full' : 'max-w-md'}`}>
          <h1 className="text-2xl font-bold text-physics-gold text-center mb-6">تسجيل الحضور</h1>
          
          {/* Tabs */}
          <div className="flex bg-physics-dark rounded-lg p-1 mb-6">
            <button 
              className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${
                activeTab === "scan" 
                  ? "bg-physics-gold text-physics-navy" 
                  : "text-white hover:bg-white/5"
              }`}
              onClick={() => setActiveTab("scan")}
            >
              <QrCode size={20} />
              <span>مسح الكود</span>
            </button>
            <button 
              className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${
                activeTab === "absence" 
                  ? "bg-physics-gold text-physics-navy" 
                  : "text-white hover:bg-white/5"
              }`}
              onClick={() => setActiveTab("absence")}
            >
              <UserMinus size={20} />
              <span>تسجيل غياب</span>
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 flex flex-col">
            {activeTab === "scan" ? (
              <QrScanner />
            ) : (
              <ManualAttendance />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ScanCode;
