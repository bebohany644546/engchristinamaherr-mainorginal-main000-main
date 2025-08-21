
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";
import { ArrowRight } from "lucide-react";
import PhysicsBackground from "@/components/PhysicsBackground";
import { PhoneContact } from "@/components/PhoneContact";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col relative">
      <PhysicsBackground />
      <PhoneContact />
      
      <div className="min-h-screen flex flex-col items-center justify-center relative z-10 p-6">
        <div className="text-center">
          <Logo />
          <h1 className="text-4xl font-bold mb-4 text-physics-gold">404</h1>
          <p className="text-xl text-white mb-8">عفواً، الصفحة المطلوبة غير موجودة</p>
          <button 
            onClick={() => navigate("/")}
            className="goldBtn flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowRight size={18} />
            <span>العودة للصفحة الرئيسية</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
