
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { ArrowRight, Award } from "lucide-react";
import { Student, Grade } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const StudentGrades = () => {
  const navigate = useNavigate();
  const { currentUser, getAllStudents } = useAuth();
  const { getStudentGrades } = useData();
  const [studentId, setStudentId] = useState("");
  const [gradeRecords, setGradeRecords] = useState<Grade[]>([]);
  const [studentName, setStudentName] = useState("");
  const [studentCode, setStudentCode] = useState("");
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
        setStudentCode(studentData.code);
        setStudentGroup(studentData.group || "");
        const records = getStudentGrades(studentData.id);
        setGradeRecords(records);
      }
    } else if (currentUser.role === "student") {
      setStudentId(currentUser.id);
      setStudentName(currentUser.name);
      setStudentCode(currentUser.code || "");
      setStudentGroup(currentUser.group || "");
      const records = getStudentGrades(currentUser.id);
      setGradeRecords(records);
    }
  }, [currentUser, getAllStudents, getStudentGrades]);

  // Calculate the display lesson number (cycles of 8)
  const getDisplayLessonNumber = (rawLessonNumber: number) => {
    return rawLessonNumber ? (rawLessonNumber - 1) % 8 + 1 : 1;
  };
  
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
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-physics-gold">سجل الدرجات</h1>
            
            <div className="bg-physics-dark p-4 rounded-lg mt-4 mb-6">
              <div className="flex flex-wrap gap-4 text-white">
                <div className="flex-1">
                  <p className="text-physics-gold text-sm">الطالب</p>
                  <p>{studentName}</p>
                </div>
                <div>
                  <p className="text-physics-gold text-sm">الكود</p>
                  <p>{studentCode}</p>
                </div>
                <div>
                  <p className="text-physics-gold text-sm">المجموعة</p>
                  <p>{studentGroup || "—"}</p>
                </div>
              </div>
            </div>
          </div>
          
          {gradeRecords.length === 0 ? (
            <div className="bg-physics-dark rounded-lg p-6 text-center">
              <p className="text-white text-lg">لا توجد سجلات درجات متاحة</p>
            </div>
          ) : (
            <div className="bg-physics-dark rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-physics-navy/50 text-physics-gold hover:bg-physics-navy/50">
                    <TableHead className="text-right">الاختبار</TableHead>
                    <TableHead className="text-center">الدرجة</TableHead>
                    <TableHead className="text-center">من</TableHead>
                    <TableHead className="text-right">رقم الحصة</TableHead>
                    <TableHead className="text-right">المجموعة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gradeRecords.map((record) => (
                    <TableRow key={record.id} className="border-t border-physics-navy hover:bg-physics-navy/30">
                      <TableCell className="text-white">{record.examName}</TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center gap-1 text-white">
                          <Award className="text-physics-gold" size={18} />
                          <span>{record.score}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-white">{record.totalScore}</TableCell>
                      <TableCell className="text-white">الحصة {getDisplayLessonNumber(record.lessonNumber)}</TableCell>
                      <TableCell className="text-white">{record.group || "—"}</TableCell>
                      <TableCell className="text-white">{formatDate(record.date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentGrades;
