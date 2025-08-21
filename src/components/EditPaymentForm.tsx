import React, { useState, useEffect } from "react";
import { X, Save, Calendar, DollarSign } from "lucide-react";
import { Payment } from "@/types";
import { toast } from "@/hooks/use-toast";

interface EditPaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  onUpdatePayment: (paymentId: string, updatedData: Partial<Payment>) => Promise<any>;
}

const EditPaymentForm: React.FC<EditPaymentFormProps> = ({
  isOpen,
  onClose,
  payment,
  onUpdatePayment
}) => {
  const [formData, setFormData] = useState({
    studentName: "",
    studentCode: "",
    group: "",
    month: "",
    amount: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // تحديث البيانات عند تغيير الدفعة
  useEffect(() => {
    if (payment) {
      setFormData({
        studentName: payment.studentName,
        studentCode: payment.studentCode,
        group: payment.group,
        month: payment.month,
        amount: payment.amount || ""
      });
    }
  }, [payment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!payment) return;

    setIsSubmitting(true);
    
    try {
      const result = await onUpdatePayment(payment.id, {
        studentName: formData.studentName,
        studentCode: formData.studentCode,
        group: formData.group,
        month: formData.month,
        amount: formData.amount
      });

      if (result.success) {
        toast({
          title: "✅ تم التحديث",
          description: result.message,
        });
        onClose();
      } else {
        toast({
          title: "❌ خطأ",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ أثناء تحديث الدفعة",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Save className="text-physics-gold" size={20} />
            <h2 className="text-xl font-bold text-physics-gold">تعديل بيانات الدفعة</h2>
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
          {/* اسم الطالب */}
          <div>
            <label className="block text-white mb-1 text-sm">اسم الطالب</label>
            <input
              type="text"
              className="inputField"
              value={formData.studentName}
              onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
              required
            />
          </div>

          {/* كود الطالب */}
          <div>
            <label className="block text-white mb-1 text-sm">كود الطالب</label>
            <input
              type="text"
              className="inputField"
              value={formData.studentCode}
              onChange={(e) => setFormData(prev => ({ ...prev, studentCode: e.target.value }))}
              required
            />
          </div>

          {/* المجموعة */}
          <div>
            <label className="block text-white mb-1 text-sm">المجموعة</label>
            <input
              type="text"
              className="inputField"
              value={formData.group}
              onChange={(e) => setFormData(prev => ({ ...prev, group: e.target.value }))}
              required
            />
          </div>

          {/* الشهر */}
          <div>
            <label className="block text-white mb-1 text-sm">الشهر</label>
            <select
              className="inputField"
              value={formData.month}
              onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
              required
            >
              <option value="">اختر الشهر</option>
              {monthOptions.map((monthOption, index) => (
                <option key={index} value={monthOption}>
                  {monthOption}
                </option>
              ))}
            </select>
          </div>

          {/* قيمة المبلغ */}
          <div>
            <label className="block text-white mb-1 text-sm">قيمة المبلغ (جنيه)</label>
            <input
              type="number"
              className="inputField"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="أدخل قيمة المبلغ..."
              min="0"
              step="0.01"
            />
          </div>

          {/* معلومات إضافية */}
          <div className="p-3 bg-physics-navy/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-physics-gold" size={16} />
              <span className="text-physics-gold font-bold text-sm">معلومات الدفعة:</span>
            </div>
            <div className="text-xs text-white space-y-1">
              <div>تاريخ الدفع: {new Date(payment.date).toLocaleDateString('ar-EG')}</div>
              <div>عدد الأشهر المدفوعة: {payment.paidMonths.length}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="goldBtn flex-1 flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save size={16} />
                  <span>حفظ التعديلات</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-physics-navy text-white py-2 px-4 rounded-lg flex-1 hover:bg-physics-navy/80 transition-colors"
              disabled={isSubmitting}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPaymentForm;
