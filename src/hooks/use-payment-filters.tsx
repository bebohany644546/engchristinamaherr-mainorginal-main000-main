import { useAuth } from "@/context/AuthContext";
import { usePayments } from "@/hooks/use-payments";
import { Student, Payment } from "@/types";
import { DataFilterCriteria } from "@/components/AdvancedDataFilter";

export function usePaymentFilters() {
  const { getAllStudents } = useAuth();
  const { payments } = usePayments();

  // البحث عن الطلاب الغير دافعين حسب المعايير المحددة
  const findNonPayingStudents = (filterCriteria: DataFilterCriteria): Student[] => {
    if (!filterCriteria.groupName && !filterCriteria.selectedMonth) {
      return [];
    }

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

    return nonPaying;
  };

  // فلترة المدفوعات حسب المعايير
  const filterPayments = (filterCriteria: DataFilterCriteria): Payment[] => {
    let filteredPayments = payments;

    // فلترة حسب المجموعة (تطابق دقيق)
    if (filterCriteria.groupName) {
      filteredPayments = filteredPayments.filter(payment =>
        payment.group && payment.group.toLowerCase().trim() === filterCriteria.groupName.toLowerCase().trim()
      );
    }

    // فلترة حسب الشهر
    if (filterCriteria.selectedMonth) {
      filteredPayments = filteredPayments.filter(payment =>
        payment.paidMonths.some(paidMonth => paidMonth.month === filterCriteria.selectedMonth)
      );
    }

    return filteredPayments;
  };

  // إحصائيات المدفوعات
  const getPaymentStatistics = (filterCriteria: DataFilterCriteria) => {
    const allStudents = getAllStudents();
    const nonPayingStudents = findNonPayingStudents(filterCriteria);
    const filteredPayments = filterPayments(filterCriteria);

    // فلترة الطلاب حسب المجموعة للحصول على العدد الإجمالي (تطابق دقيق)
    let totalStudentsInGroup = allStudents;
    if (filterCriteria.groupName) {
      totalStudentsInGroup = allStudents.filter(student =>
        student.group && student.group.toLowerCase().trim() === filterCriteria.groupName.toLowerCase().trim()
      );
    }

    return {
      totalStudents: totalStudentsInGroup.length,
      payingStudents: totalStudentsInGroup.length - nonPayingStudents.length,
      nonPayingStudents: nonPayingStudents.length,
      totalPayments: filteredPayments.length,
      paymentPercentage: totalStudentsInGroup.length > 0 
        ? Math.round(((totalStudentsInGroup.length - nonPayingStudents.length) / totalStudentsInGroup.length) * 100)
        : 0
    };
  };

  // البحث في الطلاب حسب معايير متعددة
  const searchStudents = (query: string, searchField: "name" | "code" | "group" = "name"): Student[] => {
    if (!query.trim()) return [];

    const allStudents = getAllStudents();
    const searchTerm = query.toLowerCase().trim();

    return allStudents.filter(student => {
      switch (searchField) {
        case "name":
          return student.name.toLowerCase().includes(searchTerm);
        case "code":
          return student.code.toLowerCase().includes(searchTerm);
        case "group":
          return student.group && student.group.toLowerCase().includes(searchTerm);
        default:
          return false;
      }
    });
  };

  // الحصول على قائمة المجموعات المتاحة
  const getAvailableGroups = (): string[] => {
    const allStudents = getAllStudents();
    const groups = new Set<string>();
    
    allStudents.forEach(student => {
      if (student.group && student.group.trim()) {
        groups.add(student.group.trim());
      }
    });

    return Array.from(groups).sort();
  };

  // التحقق من حالة دفع طالب معين لشهر معين
  const checkStudentPaymentStatus = (studentId: string, month: string): boolean => {
    const studentPayments = payments.filter(payment => payment.studentId === studentId);
    
    return studentPayments.some(payment =>
      payment.paidMonths.some(paidMonth => paidMonth.month === month)
    );
  };

  return {
    findNonPayingStudents,
    filterPayments,
    getPaymentStatistics,
    searchStudents,
    getAvailableGroups,
    checkStudentPaymentStatus
  };
}
