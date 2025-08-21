
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ArrowRight, GraduationCap } from "lucide-react";
import { getGradeDisplay } from "@/lib/utils";
import PhysicsBackground from "@/components/PhysicsBackground";
import { PhoneContact } from "@/components/PhoneContact";

const GradesManagement = () => {
  const navigate = useNavigate();

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
      <main className="flex-1 p-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-physics-gold">سجلات الدرجات</h1>
            <p className="text-white mt-1">اختر الصف الدراسي</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <GradeButton 
              grade="first" 
              onClick={() => navigate("/grades-management/first")} 
            />
            <GradeButton 
              grade="second" 
              onClick={() => navigate("/grades-management/second")} 
            />
            <GradeButton 
              grade="third" 
              onClick={() => navigate("/grades-management/third")} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

interface GradeButtonProps {
  grade: "first" | "second" | "third";
  onClick: () => void;
}

const GradeButton = ({ grade, onClick }: GradeButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-physics-dark hover:bg-physics-dark/80 rounded-xl p-6 flex flex-col items-center justify-center transition-transform transform hover:scale-105"
    >
      <div className="bg-physics-gold/20 p-4 rounded-full mb-4 text-physics-gold">
        <GraduationCap className="h-10 w-10" />
      </div>
      <h2 className="text-xl font-bold text-white">{getGradeDisplay(grade)}</h2>
    </button>
  );
};

export default GradesManagement;
