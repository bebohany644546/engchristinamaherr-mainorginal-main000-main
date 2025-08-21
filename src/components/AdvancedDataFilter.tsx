import React, { useState } from "react";
import { X, Filter, Users, Calendar } from "lucide-react";

interface AdvancedDataFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (filters: DataFilterCriteria) => void;
  currentFilters: DataFilterCriteria;
}

export interface DataFilterCriteria {
  groupName: string;
  selectedMonth: string;
}

const AdvancedDataFilter: React.FC<AdvancedDataFilterProps> = ({
  isOpen,
  onClose,
  onApplyFilter,
  currentFilters
}) => {
  const [filters, setFilters] = useState<DataFilterCriteria>(currentFilters);

  // قائمة الأشهر الـ12
  const monthOptions = [
    "الشهر الأول",
    "الشهر الثاني", 
    "الشهر الثالث",
    "الشهر الرابع",
    "الشهر الخامس",
    "الشهر السادس",
    "الشهر السابع",
    "الشهر الثامن",
    "الشهر التاسع",
    "الشهر العاشر",
    "الشهر الحادي عشر",
    "الشهر الثاني عشر"
  ];

  const handleApply = () => {
    onApplyFilter(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: DataFilterCriteria = {
      groupName: "",
      selectedMonth: ""
    };
    setFilters(resetFilters);
    onApplyFilter(resetFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="text-physics-gold" size={20} />
            <h2 className="text-xl font-bold text-physics-gold">فلتر متقدم للبيانات</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-physics-gold transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Form */}
        <div className="space-y-4">
          {/* حقل إدخال اسم المجموعة */}
          <div>
            <label className="flex items-center gap-2 text-white mb-2">
              <Users size={16} className="text-physics-gold" />
              اسم المجموعة
            </label>
            <input
              type="text"
              className="inputField w-full"
              placeholder="أدخل اسم المجموعة بدقة..."
              value={filters.groupName}
              onChange={(e) => setFilters(prev => ({ ...prev, groupName: e.target.value }))}
            />
            <p className="text-xs text-gray-400 mt-1">
              يجب كتابة اسم المجموعة بدقة تامة (مثال: حد واربع 4 ونص)
            </p>
          </div>

          {/* حقل اختيار الشهر */}
          <div>
            <label className="flex items-center gap-2 text-white mb-2">
              <Calendar size={16} className="text-physics-gold" />
              الشهر
            </label>
            <select
              className="inputField w-full"
              value={filters.selectedMonth}
              onChange={(e) => setFilters(prev => ({ ...prev, selectedMonth: e.target.value }))}
            >
              <option value="">جميع الأشهر</option>
              {monthOptions.map((month, index) => (
                <option key={index} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleApply}
            className="goldBtn flex-1"
          >
            تطبيق الفلتر
          </button>
          <button
            onClick={handleReset}
            className="bg-physics-navy text-white py-2 px-4 rounded-lg flex-1 hover:bg-physics-navy/80 transition-colors"
          >
            إعادة تعيين
          </button>
        </div>

        {/* Current Filters Display */}
        {(filters.groupName || filters.selectedMonth) && (
          <div className="mt-4 p-3 bg-physics-navy/30 rounded-lg">
            <h3 className="text-physics-gold text-sm font-bold mb-2">الفلاتر المطبقة:</h3>
            <div className="space-y-1 text-xs text-white">
              {filters.groupName && (
                <div>المجموعة: <span className="text-physics-gold">{filters.groupName}</span></div>
              )}
              {filters.selectedMonth && (
                <div>الشهر: <span className="text-physics-gold">{filters.selectedMonth}</span></div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedDataFilter;
