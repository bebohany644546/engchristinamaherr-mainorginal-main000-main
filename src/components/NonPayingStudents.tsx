import React, { useState, useEffect } from "react";
import { X, UserX, AlertTriangle, Users, Calendar, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePayments } from "@/hooks/use-payments";
import { Student, Payment } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataFilterCriteria } from "./AdvancedDataFilter";

interface NonPayingStudentsProps {
  isOpen: boolean;
  onClose: () => void;
  filterCriteria: DataFilterCriteria;
}

const NonPayingStudents: React.FC<NonPayingStudentsProps> = ({
  isOpen,
  onClose,
  filterCriteria
}) => {
  const [nonPayingStudents, setNonPayingStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  
  const { getAllStudents } = useAuth();
  const { payments } = usePayments();

  // البحث عن الطلاب الغير دافعين
  useEffect(() => {
    if (!isOpen || (!filterCriteria.groupName && !filterCriteria.selectedMonth)) {
      setNonPayingStudents([]);
      setStatistics(null);
      return;
    }

    setIsLoading(true);
    
    try {
      const allStudents = getAllStudents();
      
      // فلترة الطلاب حسب المجموعة إذا تم تحديدها (تطابق دقيق)
      let filteredStudents = allStudents;
      if (filterCriteria.groupName) {
        filteredStudents = allStudents.filter(student => 
          student.group && student.group.toLowerCase().trim() === filterCriteria.groupName.toLowerCase().trim()
        );
      }

      // البحث عن الطلاب الذين لم يدفعوا للشهر المحدد
      const nonPaying: Student[] = [];
      
      filteredStudents.forEach(student => {
        const studentPayments = payments.filter(payment => payment.studentId === student.id);
        
        if (filterCriteria.selectedMonth) {
          // التحقق من عدم دفع الشهر المحدد
          const hasPaidForMonth = studentPayments.some(payment => 
            payment.paidMonths.some(paidMonth => paidMonth.month === filterCriteria.selectedMonth)
          );
          
          if (!hasPaidForMonth) {
            nonPaying.push(student);
          }
        } else {
          // إذا لم يتم تحديد شهر، عرض الطلاب الذين لم يدفعوا أي شيء
          if (studentPayments.length === 0) {
            nonPaying.push(student);
          }
        }
      });

      // حساب الإحصائيات
      const stats = {
        totalStudents: filteredStudents.length,
        payingStudents: filteredStudents.length - nonPaying.length,
        nonPayingStudents: nonPaying.length,
        paymentPercentage: filteredStudents.length > 0 
          ? Math.round(((filteredStudents.length - nonPaying.length) / filteredStudents.length) * 100)
          : 0
      };

      setNonPayingStudents(nonPaying);
      setStatistics(stats);
    } catch (error) {
      console.error("Error finding non-paying students:", error);
      setNonPayingStudents([]);
      setStatistics(null);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, filterCriteria, getAllStudents, payments]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-physics-dark rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <UserX className="text-red-400" size={20} />
            <h2 className="text-xl font-bold text-physics-gold">الطلاب الغير دافعين</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-physics-gold transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Info & Statistics */}
        <div className="mb-4 space-y-4">
          {/* معايير البحث */}
          <div className="p-3 bg-physics-navy/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-physics-gold" size={16} />
              <span className="text-physics-gold font-bold text-sm">معايير البحث:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-white">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-physics-gold" />
                <span>المجموعة: {filterCriteria.groupName || "جميع المجموعات"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-physics-gold" />
                <span>الشهر: {filterCriteria.selectedMonth || "جميع الأشهر"}</span>
              </div>
            </div>
          </div>

          {/* الإحصائيات */}
          {statistics && (
            <div className="p-3 bg-physics-gold/10 border border-physics-gold/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="text-physics-gold" size={16} />
                <span className="text-physics-gold font-bold text-sm">إحصائيات المدفوعات:</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="text-center">
                  <div className="text-white text-lg font-bold">{statistics.totalStudents}</div>
                  <div className="text-gray-400">إجمالي الطلاب</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 text-lg font-bold">{statistics.payingStudents}</div>
                  <div className="text-gray-400">الطلاب الدافعين</div>
                </div>
                <div className="text-center">
                  <div className="text-red-400 text-lg font-bold">{statistics.nonPayingStudents}</div>
                  <div className="text-gray-400">الطلاب الغير دافعين</div>
                </div>
                <div className="text-center">
                  <div className="text-physics-gold text-lg font-bold">{statistics.paymentPercentage}%</div>
                  <div className="text-gray-400">نسبة الدفع</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-physics-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">جاري البحث عن الطلاب...</p>
          </div>
        ) : !filterCriteria.groupName && !filterCriteria.selectedMonth ? (
          <div className="p-8 text-center">
            <AlertTriangle className="text-yellow-400 mx-auto mb-4" size={48} />
            <p className="text-white text-lg mb-2">يرجى تطبيق فلتر متقدم أولاً</p>
            <p className="text-gray-400 text-sm">
              استخدم زر "فلتر متقدم للبيانات" لتحديد المجموعة والشهر المطلوب البحث عنهما
            </p>
          </div>
        ) : nonPayingStudents.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-green-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-white text-lg mb-2">ممتاز! جميع الطلاب دافعين</p>
            <p className="text-gray-400 text-sm">
              لا يوجد طلاب غير دافعين وفقاً للمعايير المحددة
            </p>
          </div>
        ) : (
          <div className="bg-physics-dark rounded-lg overflow-hidden">
            <div className="p-4 bg-red-500/10 border-b border-red-500/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-400" size={16} />
                <span className="text-red-400 font-bold">
                  تم العثور على {nonPayingStudents.length} طالب غير دافع
                </span>
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow className="bg-physics-navy/50 text-physics-gold hover:bg-physics-navy/50">
                  <TableHead className="text-right">اسم الطالب</TableHead>
                  <TableHead className="text-right">كود الطالب</TableHead>
                  <TableHead className="text-right">المجموعة</TableHead>
                  <TableHead className="text-right">الصف الدراسي</TableHead>
                  <TableHead className="text-right">هاتف الطالب</TableHead>
                  <TableHead className="text-right">هاتف ولي الأمر</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nonPayingStudents.map((student) => (
                  <TableRow key={student.id} className="border-t border-physics-navy hover:bg-physics-navy/30">
                    <TableCell className="text-white font-medium">{student.name}</TableCell>
                    <TableCell className="text-white">{student.code}</TableCell>
                    <TableCell className="text-white">{student.group || "غير محدد"}</TableCell>
                    <TableCell className="text-white">
                      {student.grade === "first" ? "الأول الثانوي" : 
                       student.grade === "second" ? "الثاني الثانوي" : 
                       "الثالث الثانوي"}
                    </TableCell>
                    <TableCell className="text-white">{student.phone || "غير متاح"}</TableCell>
                    <TableCell className="text-white">{student.parentPhone || "غير متاح"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-physics-navy text-white py-2 px-6 rounded-lg hover:bg-physics-navy/80 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default NonPayingStudents;
