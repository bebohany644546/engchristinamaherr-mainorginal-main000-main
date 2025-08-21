import React, { useState, useEffect } from "react";
import { X, UserX, Users, Calendar, AlertTriangle } from "lucide-react";
import { Student, Grade } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { GradesFilterCriteria } from "./GradesAdvancedFilter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface StudentsNotExaminedProps {
  isOpen: boolean;
  onClose: () => void;
  filterCriteria: GradesFilterCriteria;
  grades: Grade[];
  currentGrade: "first" | "second" | "third";
}

const StudentsNotExamined: React.FC<StudentsNotExaminedProps> = ({
  isOpen,
  onClose,
  filterCriteria,
  grades,
  currentGrade
}) => {
  const { getAllStudents } = useAuth();
  const [studentsNotExamined, setStudentsNotExamined] = useState<Student[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [examinedStudents, setExaminedStudents] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    // التحقق من وجود معايير الفلتر
    if (!filterCriteria.groupName && !filterCriteria.selectedDate) {
      setStudentsNotExamined([]);
      setTotalStudents(0);
      setExaminedStudents(0);
      return;
    }

    // الحصول على جميع الطلاب
    const allStudents = getAllStudents();
    
    // فلترة الطلاب حسب الصف والمجموعة
    let filteredStudents = allStudents.filter(student => student.grade === currentGrade);
    
    if (filterCriteria.groupName) {
      filteredStudents = filteredStudents.filter(student => 
        student.group === filterCriteria.groupName
      );
    }

    // فلترة الدرجات حسب المعايير
    let filteredGrades = grades;
    
    if (filterCriteria.groupName) {
      filteredGrades = filteredGrades.filter(grade =>
        grade.group === filterCriteria.groupName || grade.group_name === filterCriteria.groupName
      );
    }
    
    if (filterCriteria.selectedDate) {
      filteredGrades = filteredGrades.filter(grade => {
        const gradeDate = new Date(grade.date).toISOString().split('T')[0];
        return gradeDate === filterCriteria.selectedDate;
      });
    }

    // العثور على الطلاب الذين امتحنوا
    const examinedStudentIds = new Set(filteredGrades.map(grade => grade.studentId));
    
    // العثور على الطلاب الذين لم يمتحنوا
    const notExaminedStudents = filteredStudents.filter(student => 
      !examinedStudentIds.has(student.id)
    );

    setStudentsNotExamined(notExaminedStudents);
    setTotalStudents(filteredStudents.length);
    setExaminedStudents(examinedStudentIds.size);
  }, [isOpen, filterCriteria, grades, currentGrade, getAllStudents]);

  if (!isOpen) return null;

  // التحقق من تطبيق الفلتر
  if (!filterCriteria.groupName && !filterCriteria.selectedDate) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" size={20} />
              <h2 className="text-xl font-bold text-physics-gold">تنبيه</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-physics-gold transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-white mb-4">
              يجب تطبيق فلتر متقدم أولاً لعرض الطلاب الذين لم يمتحنوا
            </p>
            <button
              onClick={onClose}
              className="goldBtn"
            >
              موافق
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-physics-dark rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <UserX className="text-red-400" size={20} />
            <h2 className="text-xl font-bold text-physics-gold">الطلاب الذين لم يمتحنوا</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-physics-gold transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* معايير الفلتر */}
        <div className="mb-6 p-4 bg-physics-navy/30 rounded-lg">
          <h3 className="text-physics-gold font-bold mb-2">معايير البحث:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white">
            {filterCriteria.groupName && (
              <div className="flex items-center gap-2">
                <Users size={16} className="text-physics-gold" />
                <span>المجموعة: {filterCriteria.groupName}</span>
              </div>
            )}
            {filterCriteria.selectedDate && (
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-physics-gold" />
                <span>التاريخ: {filterCriteria.selectedDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-600/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-400">{totalStudents}</div>
            <div className="text-sm text-white">إجمالي الطلاب</div>
          </div>
          <div className="bg-green-600/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">{examinedStudents}</div>
            <div className="text-sm text-white">الطلاب الممتحنين</div>
          </div>
          <div className="bg-red-600/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-400">{studentsNotExamined.length}</div>
            <div className="text-sm text-white">الطلاب غير الممتحنين</div>
          </div>
        </div>

        {/* قائمة الطلاب */}
        {studentsNotExamined.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-green-400 text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-green-400 mb-2">ممتاز!</h3>
            <p className="text-white">جميع الطلاب في هذه المجموعة قد امتحنوا في التاريخ المحدد</p>
          </div>
        ) : (
          <div className="bg-physics-navy/20 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-physics-navy/50 text-physics-gold hover:bg-physics-navy/50">
                  <TableHead className="text-right">اسم الطالب</TableHead>
                  <TableHead className="text-right">كود الطالب</TableHead>
                  <TableHead className="text-right">المجموعة</TableHead>
                  <TableHead className="text-right">رقم الهاتف</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsNotExamined.map((student) => (
                  <TableRow key={student.id} className="border-t border-physics-navy hover:bg-physics-navy/30">
                    <TableCell className="text-white font-medium">{student.name}</TableCell>
                    <TableCell className="text-white">{student.code}</TableCell>
                    <TableCell className="text-white">{student.group || "غير محدد"}</TableCell>
                    <TableCell className="text-white">{student.phone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* زر الإغلاق */}
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="goldBtn"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentsNotExamined;
