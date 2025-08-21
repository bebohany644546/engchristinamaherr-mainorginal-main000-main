import React, { useState } from "react";
import { X, Filter, Calendar, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export interface GradesFilterCriteria {
  groupName: string;
  selectedDate: string;
}

interface GradesAdvancedFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (criteria: GradesFilterCriteria) => void;
  currentCriteria: GradesFilterCriteria;
}

const GradesAdvancedFilter: React.FC<GradesAdvancedFilterProps> = ({
  isOpen,
  onClose,
  onApplyFilter,
  currentCriteria
}) => {
  const [groupName, setGroupName] = useState(currentCriteria.groupName);
  const [selectedDate, setSelectedDate] = useState(currentCriteria.selectedDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName.trim() && !selectedDate) {
      toast({
        title: "⚠️ تنبيه",
        description: "يرجى إدخال اسم المجموعة أو اختيار التاريخ على الأقل",
        variant: "destructive",
      });
      return;
    }

    const criteria: GradesFilterCriteria = {
      groupName: groupName.trim(),
      selectedDate
    };

    console.log("📝 Submitting filter criteria:", criteria);
    onApplyFilter(criteria);
    console.log("✅ Filter criteria submitted");
    
    toast({
      title: "✅ تم تطبيق الفلتر",
      description: `تم فلترة الدرجات حسب ${groupName ? `المجموعة: ${groupName}` : ''}${groupName && selectedDate ? ' و ' : ''}${selectedDate ? `التاريخ: ${selectedDate}` : ''}`,
    });
    
    onClose();
  };

  const handleReset = () => {
    setGroupName("");
    setSelectedDate("");
    onApplyFilter({ groupName: "", selectedDate: "" });
    toast({
      title: "🔄 تم إعادة تعيين الفلتر",
      description: "تم إزالة جميع المعايير وعرض كافة الدرجات",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="text-physics-gold" size={20} />
            <h2 className="text-xl font-bold text-physics-gold">فلتر متقدم للدرجات</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-physics-gold transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* حقل المجموعة */}
          <div>
            <label className="block text-white mb-2 text-sm font-medium">
              <Users size={16} className="inline mr-2" />
              اسم المجموعة
            </label>
            <input
              type="text"
              className="inputField"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="أدخل اسم المجموعة بدقة (مثال: حد واربع 4 ونص)"
            />
            <p className="text-xs text-gray-400 mt-1">
              يجب كتابة اسم المجموعة بدقة تامة كما هو مسجل في النظام
            </p>
          </div>

          {/* حقل التاريخ */}
          <div>
            <label className="block text-white mb-2 text-sm font-medium">
              <Calendar size={16} className="inline mr-2" />
              التاريخ
            </label>
            <input
              type="date"
              className="inputField"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              اختر تاريخ محدد لعرض درجات ذلك اليوم فقط
            </p>
          </div>

          {/* معلومات الفلتر الحالي */}
          {(currentCriteria.groupName || currentCriteria.selectedDate) && (
            <div className="p-3 bg-physics-navy/30 rounded-lg">
              <p className="text-physics-gold font-bold text-sm mb-1">الفلتر الحالي:</p>
              <div className="text-xs text-white space-y-1">
                {currentCriteria.groupName && (
                  <div>المجموعة: {currentCriteria.groupName}</div>
                )}
                {currentCriteria.selectedDate && (
                  <div>التاريخ: {currentCriteria.selectedDate}</div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="goldBtn flex-1"
            >
              تطبيق الفلتر
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-red-600 text-white py-2 px-4 rounded-lg flex-1 hover:bg-red-700 transition-colors"
            >
              إعادة تعيين
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-physics-navy text-white py-2 px-4 rounded-lg flex-1 hover:bg-physics-navy/80 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GradesAdvancedFilter;
