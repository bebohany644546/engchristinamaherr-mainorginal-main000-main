
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { ArrowRight } from "lucide-react";
import StudentCodeDisplay from "@/components/StudentCodeDisplay";
import { Student } from "@/types";

const StudentCode = () => {
  const navigate = useNavigate();
  const { currentUser, getAllStudents } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  
  useEffect(() => {
    if (!currentUser || currentUser.role !== "student") {
      return;
    }
    
    const students = getAllStudents();
    const foundStudent = students.find(s => s.id === currentUser.id);
    if (foundStudent) {
      setStudent(foundStudent);
    }
  }, [currentUser, getAllStudents]);

  return (
    <div className="min-h-screen bg-physics-navy flex flex-col">
      {/* Header */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between">
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
      <main className="flex-1 p-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-physics-gold text-center mb-6">الكود الخاص بك</h1>
          
          {student ? (
            <div className="bg-white bg-opacity-10 p-6 rounded-lg">
              <StudentCodeDisplay student={student} />
              
              <div className="mt-6 text-center">
                <p className="text-white">استخدم هذا الكود لتسجيل الحضور</p>
              </div>
            </div>
          ) : (
            <div className="bg-physics-dark p-6 rounded-lg text-center">
              <p className="text-white">لم يتم العثور على الكود الخاص بك.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentCode;
