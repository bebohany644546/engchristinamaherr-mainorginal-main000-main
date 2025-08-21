
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight, DollarSign, Filter, UserX } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { usePayments } from "@/hooks/use-payments";
import { usePaymentFilters } from "@/hooks/use-payment-filters";
import { PaymentsList } from "@/components/PaymentsList";
import { PaymentForm } from "@/components/PaymentForm";
import AdvancedDataFilter, { DataFilterCriteria } from "@/components/AdvancedDataFilter";
import NonPayingStudents from "@/components/NonPayingStudents";
import EditPaymentForm from "@/components/EditPaymentForm";
import ActionButton from "@/components/ActionButton";
import { Payment } from "@/types";

const PaymentsManagement = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { payments, debugPaymentsState, deletePayment, updatePayment, isLoading } = usePayments();
  const { filterPayments } = usePaymentFilters();
  const [showAddForm, setShowAddForm] = useState(false);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [recentPayment, setRecentPayment] = useState<Payment | null>(null);

  // حالات المكونات الجديدة
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [showNonPayingStudents, setShowNonPayingStudents] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedPaymentForEdit, setSelectedPaymentForEdit] = useState<Payment | null>(null);
  const [dataFilterCriteria, setDataFilterCriteria] = useState<DataFilterCriteria>({
    groupName: "",
    selectedMonth: ""
  });
  
  // فلترة المدفوعات حسب نوع المستخدم والفلاتر المطبقة
  useEffect(() => {
    if (!currentUser) {
      setFilteredPayments([]);
      return;
    }

    // تأكد من تحميل البيانات من المخزن المحلي
    const state = debugPaymentsState();
    console.log("Payments data:", state);

    let basePayments: Payment[] = [];

    if (currentUser.role === "admin") {
      // المدير يرى جميع المدفوعات
      basePayments = payments;
    } else if (currentUser.role === "student") {
      // الطالب يرى مدفوعاته فقط
      basePayments = payments.filter(payment => payment.studentId === currentUser.id);
    } else if (currentUser.role === "parent") {
      // ولي الأمر يرى مدفوعات الطالب التابع له
      const associatedStudent = currentUser.name.replace("ولي أمر ", "");
      basePayments = payments.filter(payment => payment.studentName === associatedStudent);
    }

    // تطبيق الفلاتر المتقدمة إذا كان المستخدم مدير
    if (currentUser.role === "admin" && (dataFilterCriteria.groupName || dataFilterCriteria.selectedMonth)) {
      const filteredByAdvancedFilter = filterPayments(dataFilterCriteria);
      setFilteredPayments(filteredByAdvancedFilter);
    } else {
      setFilteredPayments(basePayments);
    }
  }, [currentUser, payments, debugPaymentsState, dataFilterCriteria, filterPayments]);
  
  // التحقق من صلاحيات المستخدم
  useEffect(() => {
    if (!currentUser) {
      toast({
        title: "غير مصرح",
        description: "يجب تسجيل الدخول للوصول لهذه الصفحة",
        variant: "destructive",
      });
      navigate("/unauthorized");
    }
  }, [currentUser, navigate]);

  const handlePaymentAdded = (payment: Payment) => {
    // عند إضافة دفعة جديدة، نعرضها كأحدث دفعة
    setRecentPayment(payment);
    // إخفاء الإشعار بعد 10 ثوانٍ
    setTimeout(() => {
      setRecentPayment(null);
    }, 10000);
  };

  // معالج تطبيق الفلتر المتقدم
  const handleApplyAdvancedFilter = (filters: DataFilterCriteria) => {
    setDataFilterCriteria(filters);

    // إظهار رسالة تأكيد مع عدد النتائج
    if (filters.groupName || filters.selectedMonth) {
      // حساب عدد النتائج المفلترة
      const filteredResults = filterPayments(filters);

      toast({
        title: "✅ تم تطبيق الفلتر",
        description: `تم العثور على ${filteredResults.length} مدفوعة مطابقة للمعايير المحددة`,
      });
    } else {
      toast({
        title: "🔄 تم إزالة الفلاتر",
        description: "تم عرض جميع المدفوعات",
      });
    }
  };

  // معالج فتح نافذة الطلاب الغير دافعين
  const handleShowNonPayingStudents = () => {
    if (!dataFilterCriteria.groupName && !dataFilterCriteria.selectedMonth) {
      toast({
        title: "⚠️ تنبيه",
        description: "يرجى تطبيق فلتر متقدم أولاً لتحديد المجموعة والشهر",
        variant: "destructive",
      });
      return;
    }
    setShowNonPayingStudents(true);
  };

  // معالج تعديل الدفعة
  const handleEditPayment = (payment: Payment) => {
    setSelectedPaymentForEdit(payment);
    setShowEditForm(true);
  };

  // معالج حذف الدفعة
  const handleDeletePayment = async (paymentId: string) => {
    try {
      const result = await deletePayment(paymentId);
      if (result.success) {
        toast({
          title: "✅ تم الحذف",
          description: result.message,
        });
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
        description: "حدث خطأ أثناء حذف الدفعة",
        variant: "destructive",
      });
    }
  };

  // معالج تحديث الدفعة
  const handleUpdatePayment = async (paymentId: string, updatedData: Partial<Payment>) => {
    return await updatePayment(paymentId, updatedData);
  };

  return (
    <div className="min-h-screen bg-physics-navy flex flex-col">
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
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-physics-gold">إدارة المدفوعات</h1>
                {isLoading && (
                  <div className="w-5 h-5 border-2 border-physics-gold border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              {currentUser?.role === "admin" && (
                <p className="text-gray-400 text-sm mt-1">
                  {isLoading ? (
                    "جاري تحميل المدفوعات..."
                  ) : (
                    <>
                      عرض {filteredPayments.length} من أصل {payments.length} مدفوعة
                      {(dataFilterCriteria.groupName || dataFilterCriteria.selectedMonth) && " (مفلترة)"}
                    </>
                  )}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {/* إظهار الأزرار للمدير فقط */}
              {currentUser?.role === "admin" && (
                <div className="flex flex-wrap gap-3">
                  <ActionButton
                    onClick={() => setShowAddForm(true)}
                    icon={DollarSign}
                    label="دفع شهر جديد"
                    variant="primary"
                  />

                  <ActionButton
                    onClick={() => setShowAdvancedFilter(true)}
                    icon={Filter}
                    label="فلتر متقدم للبيانات"
                    variant="secondary"
                  />

                  <ActionButton
                    onClick={handleShowNonPayingStudents}
                    icon={UserX}
                    label="الطلاب الغير دافعين"
                    variant="danger"
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* نموذج إضافة دفعة (للمدير فقط) */}
          {showAddForm && currentUser?.role === "admin" && (
            <PaymentForm 
              onClose={() => setShowAddForm(false)} 
              onPaymentAdded={handlePaymentAdded}
            />
          )}
          
          {/* عرض أحدث دفعة تم إضافتها */}
          {recentPayment && (
            <div className="bg-physics-gold/10 border border-physics-gold rounded-lg p-4 mb-6">
              <h2 className="text-physics-gold font-bold mb-2">تم إضافة دفعة جديدة</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <span className="text-gray-400 block text-sm">الطالب:</span>
                  <span className="text-white">{recentPayment.studentName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-sm">كود الطالب:</span>
                  <span className="text-white">{recentPayment.studentCode}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-sm">المجموعة:</span>
                  <span className="text-white">{recentPayment.group}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-sm">الشهر المدفوع:</span>
                  <span className="text-white">{recentPayment.month}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-sm">الأشهر المدفوعة:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {recentPayment.paidMonths.map((month, index) => (
                      <span key={index} className="bg-physics-navy px-2 py-1 rounded-full text-xs text-white">
                        {month.month}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* مؤشر الفلاتر المطبقة */}
          {currentUser?.role === "admin" && (dataFilterCriteria.groupName || dataFilterCriteria.selectedMonth) && (
            <div className="bg-physics-gold/10 border border-physics-gold/30 rounded-lg p-4 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-physics-gold font-bold mb-2">الفلاتر المطبقة:</h3>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {dataFilterCriteria.groupName && (
                      <span className="bg-physics-navy px-3 py-1 rounded-full text-white">
                        المجموعة: {dataFilterCriteria.groupName}
                      </span>
                    )}
                    {dataFilterCriteria.selectedMonth && (
                      <span className="bg-physics-navy px-3 py-1 rounded-full text-white">
                        الشهر: {dataFilterCriteria.selectedMonth}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setDataFilterCriteria({ groupName: "", selectedMonth: "" })}
                  className="text-red-400 hover:text-red-300 text-sm underline"
                >
                  إزالة جميع الفلاتر
                </button>
              </div>
            </div>
          )}

          {/* قائمة المدفوعات */}
          <div className="bg-physics-dark rounded-lg overflow-hidden mt-6">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-physics-gold border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-white text-lg">جاري تحميل المدفوعات...</p>
                  <p className="text-physics-gold text-sm">يرجى الانتظار قليلاً</p>
                  {payments.length > 0 && (
                    <p className="text-gray-400 text-xs">تم تحميل {payments.length} مدفوعة مسبقاً</p>
                  )}
                </div>
              </div>
            ) : (
              <PaymentsList
                payments={filteredPayments}
                onEditPayment={currentUser?.role === "admin" ? handleEditPayment : undefined}
                onDeletePayment={currentUser?.role === "admin" ? handleDeletePayment : undefined}
              />
            )}
          </div>
        </div>
      </main>

      {/* المكونات الجديدة */}
      {/* نافذة الفلتر المتقدم */}
      <AdvancedDataFilter
        isOpen={showAdvancedFilter}
        onClose={() => setShowAdvancedFilter(false)}
        onApplyFilter={handleApplyAdvancedFilter}
        currentFilters={dataFilterCriteria}
      />

      {/* نافذة الطلاب الغير دافعين */}
      <NonPayingStudents
        isOpen={showNonPayingStudents}
        onClose={() => setShowNonPayingStudents(false)}
        filterCriteria={dataFilterCriteria}
      />

      {/* نافذة تعديل الدفعة */}
      <EditPaymentForm
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setSelectedPaymentForEdit(null);
        }}
        payment={selectedPaymentForEdit}
        onUpdatePayment={handleUpdatePayment}
      />
    </div>
  );
};

export default PaymentsManagement;
