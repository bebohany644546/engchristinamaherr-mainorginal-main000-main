
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight, Calendar, User, Clock, CheckCircle, XCircle } from "lucide-react";

const AttendanceRecord = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getStudentAttendance, getStudentLessonCount, getDisplayLessonNumber } = useData();
  
  const [studentId, setStudentId] = useState(currentUser?.id || "");
  const [totalLessons, setTotalLessons] = useState(0);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0 });
  
  // Effect to set the student ID and update attendance stats
  useEffect(() => {
    // If we're a student, set the student ID to our own ID
    if (currentUser?.role === "student") {
      setStudentId(currentUser.id);
    } 
    // If we're a parent, set the student ID to the child's ID
    else if (currentUser?.role === "parent" && currentUser.childrenIds && currentUser.childrenIds.length > 0) {
      setStudentId(currentUser.childrenIds[0]);
    }
  }, [currentUser]);
  
  // Effect to calculate total number of lessons and stats
  useEffect(() => {
    if (studentId) {
      const records = getStudentAttendance(studentId);
      
      // Get the total lesson count for this student
      const lessonCount = getStudentLessonCount(studentId);
      setTotalLessons(lessonCount);
      
      // Calculate attendance statistics
      const present = records.filter(r => r.status === "present").length;
      const absent = records.filter(r => r.status === "absent").length;
      
      setAttendanceStats({
        present,
        absent
      });
    }
  }, [studentId, getStudentAttendance, getStudentLessonCount]);

  // ملاحظة: تم استبدال الدالة المحلية بالدالة الموحدة من DataContext

  return (
    <div className="min-h-screen bg-physics-navy flex flex-col relative">
      <PhoneContact />
      
      {/* Header */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-physics-gold hover:opacity-80">
            <ArrowRight size={20} />
            <span>العودة للرئيسية</span>
          </button>
        </div>
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-physics-gold mb-6">سجل الحضور</h1>
          
          {/* Student ID Input (for admin only) */}
          {currentUser?.role === "admin" && (
            <div className="mb-4">
              <label htmlFor="studentId" className="block text-white mb-2">
                أدخل كود الطالب
              </label>
              <input
                type="text"
                id="studentId"
                className="inputField"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>
          )}
          
          {/* Attendance Statistics */}
          <div className="bg-physics-dark rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-physics-gold mb-4">
              إحصائيات الحضور
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle size={24} className="text-green-500" />
                <span className="text-white">
                  حاضر: {attendanceStats.present}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <XCircle size={24} className="text-red-500" />
                <span className="text-white">
                  غائب: {attendanceStats.absent}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-white">
                  إجمالي الدروس: {totalLessons}
                </span>
              </div>
            </div>
          </div>
          
          {/* Attendance Records */}
          <div className="bg-physics-dark rounded-lg overflow-hidden">
            <div className="divide-y divide-physics-navy">
              {getStudentAttendance(studentId).map((record) => (
                <div key={record.id} className="p-4 flex items-center gap-4">
                  <Calendar size={20} className="text-physics-gold" />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white">
                      الدرس رقم {getDisplayLessonNumber(record.lessonNumber)} {/* Use display lesson number */}
                    </h3>
                    <div className="flex items-center text-sm text-gray-300 mt-1">
                      <Calendar size={14} className="ml-1" />
                      <span>
                        {new Date(record.date).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <span className="mx-2">•</span>
                      <User size={14} className="ml-1" />
                      <span>{record.studentName}</span>
                      <span className="mx-2">•</span>
                      <Clock size={14} className="ml-1" />
                      <span>{record.time}</span>
                    </div>
                  </div>
                  {record.status === "present" ? (
                    <CheckCircle size={24} className="text-green-500" />
                  ) : (
                    <XCircle size={24} className="text-red-500" />
                  )}
                </div>
              ))}
            </div>
            {getStudentAttendance(studentId).length === 0 && (
              <div className="p-4 text-center text-white">
                لا يوجد سجل حضور لهذا الطالب.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AttendanceRecord;
