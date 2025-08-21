import { useState, useEffect } from "react";
import { Grade } from "@/types";
import { GradesFilterCriteria } from "@/components/GradesAdvancedFilter";

export function useGradesFilters() {
  const [filterCriteria, setFilterCriteria] = useState<GradesFilterCriteria>({
    groupName: "",
    selectedDate: ""
  });

  // فلترة الدرجات حسب المعايير
  const filterGrades = (grades: Grade[], criteria: GradesFilterCriteria = filterCriteria): Grade[] => {
    console.log("🔍 Filter criteria:", criteria, "| Input grades:", grades.length);

    let filteredGrades = [...grades];

    // فلترة حسب المجموعة
    if (criteria.groupName) {
      console.log("🏷️ Filtering by group:", criteria.groupName);

      filteredGrades = filteredGrades.filter(grade => {
        const matches = grade.group === criteria.groupName || grade.group_name === criteria.groupName;
        return matches;
      });
      console.log(`📈 After group filter: ${filteredGrades.length} grades`);
    }

    // فلترة حسب التاريخ
    if (criteria.selectedDate) {
      console.log("📅 Filtering by date:", criteria.selectedDate);

      filteredGrades = filteredGrades.filter(grade => {
        const gradeDate = new Date(grade.date).toISOString().split('T')[0];
        return gradeDate === criteria.selectedDate;
      });
      console.log(`📈 After date filter: ${filteredGrades.length} grades`);
    }

    console.log("🎯 Final result:", filteredGrades.length, "grades");
    return filteredGrades;
  };

  // تطبيق معايير الفلتر
  const applyFilter = (criteria: GradesFilterCriteria) => {
    console.log("🎯 Applying new filter criteria:", criteria);
    setFilterCriteria(criteria);
    console.log("✅ Filter criteria updated");
  };

  // إزالة الفلاتر
  const clearFilters = () => {
    setFilterCriteria({
      groupName: "",
      selectedDate: ""
    });
  };

  // التحقق من وجود فلاتر مطبقة
  const hasActiveFilters = () => {
    return !!(filterCriteria.groupName || filterCriteria.selectedDate);
  };

  // الحصول على وصف الفلاتر المطبقة
  const getFilterDescription = () => {
    const parts = [];
    
    if (filterCriteria.groupName) {
      parts.push(`المجموعة: ${filterCriteria.groupName}`);
    }
    
    if (filterCriteria.selectedDate) {
      parts.push(`التاريخ: ${filterCriteria.selectedDate}`);
    }
    
    return parts.join(" • ");
  };

  return {
    filterCriteria,
    filterGrades,
    applyFilter,
    clearFilters,
    hasActiveFilters,
    getFilterDescription
  };
}
