import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import PhysicsBackground from "@/components/PhysicsBackground";
const Index = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen flex flex-col relative">
      <PhysicsBackground />
      <PhoneContact />
      
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Logo />
            <h1 className="text-3xl font-bold text-physics-gold mb-2">فيزياء المرحلة الثانوية</h1>
            <p className="text-white opacity-80 mb-8">Eng : CHRISTINA MAHER</p>
          </div>

          <div className="space-y-4">
            <button className="goldBtn w-full py-3 rounded-lg text-physics-navy font-bold transition-colors" onClick={() => navigate("/login")}>
              تسجيل الدخول
            </button>
            
            <p className="text-center text-white mt-8">موقع خاص بطلاب المهندسة : كيرستينا ماهر</p>
          </div>
        </div>
      </div>
    </div>;
};
export default Index;