
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { ArrowRight, CheckCircle, XCircle, Filter, Search, Trash2, Users, UserX } from "lucide-react";
import { formatDate, getGradeDisplay } from "@/lib/utils";
import PhysicsBackground from "@/components/PhysicsBackground";
import { PhoneContact } from "@/components/PhoneContact";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Student, Attendance } from "@/types";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import AdvancedFilter, { FilterCriteria } from "@/components/AdvancedFilter";
import AbsenceRegistration, { AbsenceCriteria } from "@/components/AbsenceRegistration";

const AttendanceListByGrade = () => {
  const navigate = useNavigate();
  const { grade = "first" } = useParams<{ grade: "first" | "second" | "third" }>();
  const { currentUser, getAllStudents } = useAuth();
  const { getStudentAttendance, deleteAttendanceRecord, getDisplayLessonNumber, registerBulkAbsence } = useData();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [filter, setFilter] = useState<"all" | "present" | "absent" | "unregistered">("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [groupSearchTerm, setGroupSearchTerm] = useState<string>("");
  const [showAdvancedFilter, setShowAdvancedFilter] = useState<boolean>(false);
  const [showAbsenceRegistration, setShowAbsenceRegistration] = useState<boolean>(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterCriteria>({
    groupName: "",
    selectedDate: "",
    dateRange: { from: "", to: "" },
    useDateRange: false
  });
  
  useEffect(() => {
    if (!currentUser) return;
    
    // Get all students for this grade
    const allStudents = getAllStudents();
    const gradeStudents = allStudents.filter(student => student.grade === grade);
    setStudents(gradeStudents);
    
    // Get attendance records for all students
    const records: Attendance[] = [];
    gradeStudents.forEach(student => {
      const studentRecords = getStudentAttendance(student.id);
      records.push(...studentRecords);
    });
    
    setAttendanceRecords(records);
  }, [currentUser, getAllStudents, getStudentAttendance, grade]);
  
  // Check for unregistered students (students without attendance records)
  const studentsWithoutAttendance = students.filter(student => {
    return !attendanceRecords.some(record => record.studentId === student.id);
  });
  
  const handleDeleteRecord = (recordId: string, studentName: string) => {
    if (window.confirm(`هل أنت متأكد من حذف سجل الحضور للطالب ${studentName}؟`)) {
      deleteAttendanceRecord(recordId);
      
      // تحديث القائمة بعد الحذف
      setAttendanceRecords(prev => prev.filter(record => record.id !== recordId));
      
      toast({
        title: "تم الحذف",
        description: `تم حذف سجل الحضور للطالب ${studentName} بنجاح`,
        variant: "destructive",
      });
    }
  };
  
  const filteredRecords = filter === "unregistered" 
    ? [] // If filter is unregistered, we'll display a different view
    : attendanceRecords.filter(record => {
        // Apply status filter
        if (filter !== "all" && record.status !== filter) {
          return false;
        }
        
        // Find the corresponding student for additional filtering
        const student = students.find(s => s.id === record.studentId);
        
        // Apply comprehensive search filter if provided
        if (searchTerm.trim() !== "") {
          const searchLower = searchTerm.toLowerCase();

          // Search in multiple fields: name, code, group, date, time, lesson number
          const searchableFields = [
            record.studentName.toLowerCase(),
            student?.code?.toLowerCase() || "",
            student?.group?.toLowerCase() || "",
            formatDate(record.date).toLowerCase(),
            record.time?.toLowerCase() || "",
            `الحصة ${getDisplayLessonNumber(record.lessonNumber)}`.toLowerCase(),
            `حصة ${getDisplayLessonNumber(record.lessonNumber)}`.toLowerCase(),
            getDisplayLessonNumber(record.lessonNumber).toString()
          ];

          const matchesSearch = searchableFields.some(field =>
            field.includes(searchLower)
          );

          if (!matchesSearch) {
            return false;
          }
        }
        
        // Apply group search filter if provided
        if (groupSearchTerm.trim() !== "") {
          const groupLower = groupSearchTerm.toLowerCase();

          // Filter by student group
          if (!student?.group || !student.group.toLowerCase().includes(groupLower)) {
            return false;
          }
        }

        // Apply advanced filters
        if (advancedFilters.groupName.trim() !== "") {
          const advancedGroupLower = advancedFilters.groupName.toLowerCase();
          if (!student?.group || !student.group.toLowerCase().includes(advancedGroupLower)) {
            return false;
          }
        }

        // Apply date filters
        if (advancedFilters.useDateRange) {
          if (advancedFilters.dateRange.from && advancedFilters.dateRange.to) {
            const recordDate = new Date(record.date).toISOString().split('T')[0];
            if (recordDate < advancedFilters.dateRange.from || recordDate > advancedFilters.dateRange.to) {
              return false;
            }
          }
        } else if (advancedFilters.selectedDate) {
          const recordDate = new Date(record.date).toISOString().split('T')[0];
          if (recordDate !== advancedFilters.selectedDate) {
            return false;
          }
        }
        
        return true;
      });
  
  // Similarly filter unregistered students by group if group search is provided
  const filteredStudentsWithoutAttendance = studentsWithoutAttendance.filter(student => {
    if (groupSearchTerm.trim() === "") return true;
    
    return student.group?.toLowerCase().includes(groupSearchTerm.toLowerCase()) ?? false;
  });

  const getGradeTitle = () => {
    switch (grade) {
      case "first": return "الصف الأول الثانوي";
      case "second": return "الصف الثاني الثانوي";
      case "third": return "الصف الثالث الثانوي";
      default: return "";
    }
  };

  // ملاحظة: تم استبدال الدالة المحلية بالدالة الموحدة من DataContext

  // دالة تطبيق الفلتر المتقدم
  const handleApplyAdvancedFilter = (filters: FilterCriteria) => {
    setAdvancedFilters(filters);
  };

  // دالة تسجيل الغياب التلقائي
  const handleRegisterAbsence = async (criteria: AbsenceCriteria) => {
    try {
      const result = await registerBulkAbsence(criteria.groupName, criteria.selectedDate, getAllStudents);

      if (result.success) {
        toast({
          title: "✅ تم تسجيل الغياب بنجاح",
          description: result.message
        });
      } else {
        toast({
          variant: "destructive",
          title: "❌ خطأ",
          description: result.message
        });
      }
    } catch (error) {
      console.error("Error registering absence:", error);
      toast({
        variant: "destructive",
        title: "❌ خطأ",
        description: "حدث خطأ أثناء تسجيل الغياب"
      });
    }
  };

  return (
    <div className="min-h-screen bg-physics-navy flex flex-col relative">
      <PhysicsBackground />
      <PhoneContact />
      
      {/* Header */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between relative z-10">
        <div className="flex items-center">
          <button 
            onClick={() => navigate("/attendance-list")}
            className="flex items-center gap-2 text-physics-gold hover:opacity-80"
          >
            <ArrowRight size={20} />
            <span>العودة لقائمة الصفوف</span>
          </button>
        </div>
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-physics-gold">سجل الحضور</h1>
              <p className="text-white mt-1">{getGradeTitle()}</p>
            </div>
            
            {/* Filter and Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Main Filter */}
              <div className="flex items-center gap-2 bg-physics-dark rounded-lg p-2">
                <Filter className="text-physics-gold" size={20} />
                <select
                  className="bg-physics-dark text-white border-none outline-none"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as "all" | "present" | "absent" | "unregistered")}
                >
                  <option value="all">الكل</option>
                  <option value="present">الحاضرين</option>
                  <option value="absent">الغائبين</option>
                  <option value="unregistered">الطلاب الغير مسجلين</option>
                </select>
              </div>

              {/* Advanced Filter Button */}
              <button
                onClick={() => setShowAdvancedFilter(true)}
                className="flex items-center gap-2 bg-physics-navy hover:bg-physics-navy/80 text-white px-4 py-2 rounded-lg transition-colors"
                title="فلتر متقدم"
              >
                <Filter size={18} />
                <span className="hidden sm:inline">فلتر متقدم</span>
              </button>

              {/* Absence Registration Button */}
              {currentUser?.role === "admin" && (
                <button
                  onClick={() => setShowAbsenceRegistration(true)}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  title="تسجيل الغياب التلقائي"
                >
                  <UserX size={18} />
                  <span className="hidden sm:inline">تسجيل الغياب</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Search Filters */}
          {filter !== "unregistered" ? (
            <div className="mb-6 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="بحث شامل (الاسم، الكود، المجموعة، التاريخ، الوقت، رقم الحصة)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="inputField pl-10"
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={18} />
              </div>
              
              {/* Group Search - New Addition */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="بحث بالمجموعة..."
                  value={groupSearchTerm}
                  onChange={(e) => setGroupSearchTerm(e.target.value)}
                  className="inputField pl-10"
                />
                <Users className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={18} />
              </div>
            </div>
          ) : (
            // Also add group search for unregistered students view
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="بحث بالمجموعة..."
                  value={groupSearchTerm}
                  onChange={(e) => setGroupSearchTerm(e.target.value)}
                  className="inputField pl-10"
                />
                <Users className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={18} />
              </div>
            </div>
          )}
          
          {filter === "unregistered" ? (
            // عرض الطلاب الغير مسجلين
            <div className="bg-physics-dark rounded-lg overflow-hidden">
              <div className="p-4 bg-physics-navy/50 border-b border-physics-navy flex items-center">
                <Users className="text-physics-gold mr-2" size={20} />
                <h2 className="text-physics-gold">الطلاب الغير مسجلين</h2>
              </div>
              
              {filteredStudentsWithoutAttendance.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-white text-lg">جميع الطلاب مسجلين في سجل الحضور</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-physics-navy/50">
                      <TableHead className="text-right text-physics-gold">اسم الطالب</TableHead>
                      <TableHead className="text-right text-physics-gold">الكود</TableHead>
                      <TableHead className="text-right text-physics-gold">المجموعة</TableHead>
                      <TableHead className="text-right text-physics-gold">الصف الدراسي</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudentsWithoutAttendance.map(student => (
                      <TableRow key={student.id} className="border-t border-physics-navy hover:bg-physics-navy/30">
                        <TableCell className="text-white">{student.name}</TableCell>
                        <TableCell className="text-white">{student.code}</TableCell>
                        <TableCell className="text-white">{student.group || "غير محدد"}</TableCell>
                        <TableCell className="text-white">{getGradeDisplay(student.grade)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="bg-physics-dark rounded-lg p-6 text-center">
              <p className="text-white text-lg">لا توجد سجلات حضور متاحة</p>
            </div>
          ) : (
            <div className="bg-physics-dark rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-physics-navy/50 text-physics-gold hover:bg-physics-navy/50">
                    <TableHead className="text-right">الطالب</TableHead>
                    <TableHead className="text-right">الكود</TableHead>
                    <TableHead className="text-right">الصف الدراسي</TableHead>
                    <TableHead className="text-right">المجموعة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الوقت</TableHead>
                    <TableHead className="text-right">رقم الحصة</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-center">خيارات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => {
                    const student = students.find(s => s.id === record.studentId);
                    
                    return (
                      <TableRow key={record.id} className="border-t border-physics-navy hover:bg-physics-navy/30">
                        <TableCell className="text-white">{record.studentName}</TableCell>
                        <TableCell className="text-white">{student?.code || ""}</TableCell>
                        <TableCell className="text-white">{student ? getGradeDisplay(student.grade) : ""}</TableCell>
                        <TableCell className="text-white">{student?.group || "غير محدد"}</TableCell>
                        <TableCell className="text-white">{formatDate(record.date)}</TableCell>
                        <TableCell className="text-white">{record.time || "غير متاح"}</TableCell>
                        <TableCell className="text-white">الحصة {getDisplayLessonNumber(record.lessonNumber)}</TableCell>
                        <TableCell className="text-center">
                          {record.status === "present" ? (
                            <div className="inline-flex items-center text-green-400 gap-1">
                              <CheckCircle size={18} />
                              <span>حاضر</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center text-red-400 gap-1">
                              <XCircle size={18} />
                              <span>غائب</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <button 
                            onClick={() => handleDeleteRecord(record.id, record.studentName)}
                            className="p-1 text-red-400 hover:text-red-500"
                            title="حذف السجل"
                          >
                            <Trash2 size={18} />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      {/* Advanced Filter Modal */}
      <AdvancedFilter
        isOpen={showAdvancedFilter}
        onClose={() => setShowAdvancedFilter(false)}
        onApplyFilter={handleApplyAdvancedFilter}
        currentFilters={advancedFilters}
      />

      {/* Absence Registration Modal */}
      <AbsenceRegistration
        isOpen={showAbsenceRegistration}
        onClose={() => setShowAbsenceRegistration(false)}
        onRegisterAbsence={handleRegisterAbsence}
      />
    </div>
  );
};

export default AttendanceListByGrade;
