
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { ArrowRight, Award } from "lucide-react";
import { Student, Grade } from "@/types";
import { formatDate } from "@/lib/utils";
import PhysicsBackground from "@/components/PhysicsBackground";
import { PhoneContact } from "@/components/PhoneContact";

const Grades = () => {
  const navigate = useNavigate();
  const { currentUser, getAllStudents } = useAuth();
  const { getStudentGrades } = useData();
  const [studentId, setStudentId] = useState("");
  const [gradeRecords, setGradeRecords] = useState<Grade[]>([]);
  const [studentName, setStudentName] = useState("");
  const [studentGroup, setStudentGroup] = useState("");
  
  useEffect(() => {
    if (!currentUser) return;
    
    if (currentUser.role === "parent") {
      // Find the student ID associated with this parent
      const students = getAllStudents();
      const parentPhone = currentUser.phone;
      const studentData = students.find(s => s.parentPhone === parentPhone);
      
      if (studentData) {
        setStudentId(studentData.id);
        setStudentName(studentData.name);
        setStudentGroup(studentData.group || "");
        
        // Get and format grade records
        const records = getStudentGrades(studentData.id);
        setGradeRecords(records);
      }
    } else if (currentUser.role === "student") {
      setStudentId(currentUser.id);
      setStudentName(currentUser.name);
      setStudentGroup(currentUser.group || "");
      
      // Get and format grade records
      const records = getStudentGrades(currentUser.id);
      setGradeRecords(records);
    }
  }, [currentUser, getAllStudents, getStudentGrades]);
  
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
            <h1 className="text-2xl font-bold text-physics-gold">سجل الدرجات</h1>
            {studentName && (
              <div className="text-white mt-1">
                <p>الطالب: {studentName}</p>
                {studentGroup && <p className="mt-1">المجموعة: {studentGroup}</p>}
              </div>
            )}
          </div>
          
          {gradeRecords.length === 0 ? (
            <div className="bg-physics-dark rounded-lg p-6 text-center">
              <p className="text-white text-lg">لا توجد سجلات درجات متاحة</p>
            </div>
          ) : (
            <div className="bg-physics-dark rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-physics-navy/50 text-physics-gold">
                    <th className="text-right py-3 px-4">الاختبار</th>
                    <th className="text-center py-3 px-4">الدرجة</th>
                    <th className="text-center py-3 px-4">من</th>
                    <th className="text-right py-3 px-4">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {gradeRecords.map((record) => (
                    <tr key={record.id} className="border-t border-physics-navy hover:bg-physics-navy/30">
                      <td className="py-3 px-4 text-white">{record.examName}</td>
                      <td className="py-3 px-4 text-center text-white">
                        <div className="inline-flex items-center gap-1">
                          <Award className="text-physics-gold" size={18} />
                          <span>{record.score}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-white">{record.totalScore}</td>
                      <td className="py-3 px-4 text-white">{formatDate(record.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Grades;
