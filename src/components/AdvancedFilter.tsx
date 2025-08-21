import React, { useState } from "react";
import { X, Filter, Calendar, Users } from "lucide-react";

interface AdvancedFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (filters: FilterCriteria) => void;
  currentFilters: FilterCriteria;
}

export interface FilterCriteria {
  groupName: string;
  selectedDate: string;
  dateRange: {
    from: string;
    to: string;
  };
  useDateRange: boolean;
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  isOpen,
  onClose,
  onApplyFilter,
  currentFilters
}) => {
  const [filters, setFilters] = useState<FilterCriteria>(currentFilters);

  const handleApply = () => {
    onApplyFilter(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterCriteria = {
      groupName: "",
      selectedDate: "",
      dateRange: { from: "", to: "" },
      useDateRange: false
    };
    setFilters(resetFilters);
    onApplyFilter(resetFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="text-physics-gold" size={20} />
            <h2 className="text-xl font-bold text-physics-gold">فلتر متقدم</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-physics-gold transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Options */}
        <div className="space-y-4">
          {/* Group Name Filter */}
          <div>
            <label className="block text-white mb-2 flex items-center gap-2">
              <Users size={16} className="text-physics-gold" />
              البحث بالمجموعة
            </label>
            <input
              type="text"
              placeholder="اسم المجموعة..."
              value={filters.groupName}
              onChange={(e) => setFilters(prev => ({ ...prev, groupName: e.target.value }))}
              className="inputField w-full"
            />
          </div>

          {/* Date Filter Type Selection */}
          <div>
            <label className="block text-white mb-2 flex items-center gap-2">
              <Calendar size={16} className="text-physics-gold" />
              البحث بالتاريخ
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-white">
                <input
                  type="radio"
                  name="dateType"
                  checked={!filters.useDateRange}
                  onChange={() => setFilters(prev => ({ ...prev, useDateRange: false }))}
                  className="text-physics-gold"
                />
                يوم محدد
              </label>
              <label className="flex items-center gap-2 text-white">
                <input
                  type="radio"
                  name="dateType"
                  checked={filters.useDateRange}
                  onChange={() => setFilters(prev => ({ ...prev, useDateRange: true }))}
                  className="text-physics-gold"
                />
                فترة زمنية
              </label>
            </div>
          </div>

          {/* Single Date */}
          {!filters.useDateRange && (
            <div>
              <label className="block text-white mb-2">اختر التاريخ</label>
              <input
                type="date"
                value={filters.selectedDate}
                onChange={(e) => setFilters(prev => ({ ...prev, selectedDate: e.target.value }))}
                className="inputField w-full"
              />
            </div>
          )}

          {/* Date Range */}
          {filters.useDateRange && (
            <div className="space-y-3">
              <div>
                <label className="block text-white mb-2">من تاريخ</label>
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, from: e.target.value }
                  }))}
                  className="inputField w-full"
                />
              </div>
              <div>
                <label className="block text-white mb-2">إلى تاريخ</label>
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, to: e.target.value }
                  }))}
                  className="inputField w-full"
                />
              </div>
            </div>
          )}
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
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            إعادة تعيين
          </button>
          <button
            onClick={onClose}
            className="bg-physics-navy hover:bg-physics-navy/80 text-white px-4 py-2 rounded-lg transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilter;
