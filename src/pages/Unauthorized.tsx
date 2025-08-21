
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";
import PhysicsBackground from "@/components/PhysicsBackground";
import { PhoneContact } from "@/components/PhoneContact";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-physics-navy relative">
      <PhysicsBackground />
      <PhoneContact />
      
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md text-center">
          <Logo />
          <h1 className="text-2xl font-bold text-physics-gold mb-4">غير مصرح بالوصول</h1>
          <p className="text-white mb-8">لا تملك صلاحيات كافية للوصول إلى هذه الصفحة.</p>
          
          <div className="space-y-4">
            <button
              className="goldBtn w-full"
              onClick={() => navigate("/dashboard")}
            >
              العودة للصفحة الرئيسية
            </button>
            
            <button
              className="w-full bg-physics-dark text-white py-3 px-6 rounded-full hover:bg-physics-navy/70 flex items-center justify-center gap-2"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
