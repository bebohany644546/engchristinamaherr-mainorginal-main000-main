import React, { useState } from "react";
import { X, UserX, Calendar, Users, AlertTriangle, CheckCircle } from "lucide-react";

interface AbsenceRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterAbsence: (criteria: AbsenceCriteria) => Promise<void>;
}

export interface AbsenceCriteria {
  groupName: string;
  selectedDate: string;
}

const AbsenceRegistration: React.FC<AbsenceRegistrationProps> = ({
  isOpen,
  onClose,
  onRegisterAbsence
}) => {
  const [criteria, setCriteria] = useState<AbsenceCriteria>({
    groupName: "",
    selectedDate: new Date().toISOString().split('T')[0] // Today's date
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = () => {
    if (!criteria.groupName.trim() || !criteria.selectedDate) {
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onRegisterAbsence(criteria);
      onClose();
      // Reset form
      setCriteria({
        groupName: "",
        selectedDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Error registering absence:", error);
    } finally {
      setIsProcessing(false);
      setShowConfirmation(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const handleClose = () => {
    setShowConfirmation(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md mx-4">
        {!showConfirmation ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <UserX className="text-red-500" size={20} />
                <h2 className="text-xl font-bold text-physics-gold">تسجيل الغياب التلقائي</h2>
              </div>
              <button
                onClick={handleClose}
                className="text-white hover:text-physics-gold transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Group Name */}
              <div>
                <label className="block text-white mb-2 flex items-center gap-2">
                  <Users size={16} className="text-physics-gold" />
                  اسم المجموعة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="أدخل اسم المجموعة..."
                  value={criteria.groupName}
                  onChange={(e) => setCriteria(prev => ({ ...prev, groupName: e.target.value }))}
                  className="inputField w-full"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-white mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-physics-gold" />
                  التاريخ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={criteria.selectedDate}
                  onChange={(e) => setCriteria(prev => ({ ...prev, selectedDate: e.target.value }))}
                  className="inputField w-full"
                  required
                />
              </div>

              {/* Info Message */}
              <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="text-yellow-500 mt-0.5" size={16} />
                  <div className="text-yellow-200 text-sm">
                    <p className="font-medium mb-1">تنبيه:</p>
                    <p>سيتم تسجيل غياب تلقائي لجميع الطلاب في المجموعة المحددة الذين لم يسجلوا حضورهم في التاريخ المحدد.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={!criteria.groupName.trim() || !criteria.selectedDate}
                className="goldBtn flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                متابعة
              </button>
              <button
                onClick={handleClose}
                className="bg-physics-navy hover:bg-physics-navy/80 text-white px-4 py-2 rounded-lg transition-colors"
              >
                إلغاء
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Confirmation Dialog */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-red-900/20 p-3 rounded-full">
                  <AlertTriangle className="text-red-500" size={32} />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-physics-gold mb-4">تأكيد تسجيل الغياب</h3>
              
              <div className="bg-physics-navy/50 rounded-lg p-4 mb-6 text-right">
                <p className="text-white mb-2">
                  <strong>المجموعة:</strong> {criteria.groupName}
                </p>
                <p className="text-white mb-2">
                  <strong>التاريخ:</strong> {new Date(criteria.selectedDate).toLocaleDateString('ar-EG')}
                </p>
              </div>
              
              <p className="text-white mb-6">
                هل أنت متأكد من تسجيل الغياب التلقائي لجميع الطلاب في هذه المجموعة الذين لم يسجلوا حضورهم؟
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors flex-1 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري التسجيل...
                    </div>
                  ) : (
                    "تأكيد تسجيل الغياب"
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="bg-physics-navy hover:bg-physics-navy/80 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AbsenceRegistration;
