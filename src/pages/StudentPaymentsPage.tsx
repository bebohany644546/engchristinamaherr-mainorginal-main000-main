
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight, DollarSign, RefreshCw } from "lucide-react";
import { usePayments } from "@/hooks/use-payments";
import { Payment } from "@/types";
import { toast } from "@/hooks/use-toast";

const StudentPaymentsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { payments, refreshPayments } = usePayments();
  const [studentPayments, setStudentPayments] = useState<Payment[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Filter payments relevant to the student
    if (currentUser.role === "student") {
      const filteredPayments = payments.filter(payment => payment.studentId === currentUser.id);
      setStudentPayments(filteredPayments);
    }
  }, [currentUser, payments, navigate]);
  
  // وظيفة تحديث البيانات
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshPayments();
      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات المدفوعات بنجاح"
      });
    } catch (error) {
      console.error("Error refreshing payments:", error);
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث البيانات",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!currentUser) return null;

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
            <h1 className="text-2xl font-bold text-physics-gold">سجل المدفوعات الخاص بي</h1>
            
            {/* زر تحديث البيانات */}
            <button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="flex items-center gap-2 text-white bg-physics-navy hover:bg-physics-navy/80 px-4 py-2 rounded disabled:opacity-50"
            >
              <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
              <span>{isRefreshing ? "جاري التحديث..." : "تحديث البيانات"}</span>
            </button>
          </div>
          
          {studentPayments.length === 0 ? (
            <div className="bg-physics-dark rounded-lg p-8 text-center">
              <DollarSign size={48} className="mx-auto mb-4 text-physics-gold opacity-50" />
              <p className="text-white text-lg">لا توجد مدفوعات مسجلة</p>
            </div>
          ) : (
            <div className="bg-physics-dark rounded-lg overflow-hidden">
              {studentPayments.map(payment => (
                <div key={payment.id} className="p-6 border-b border-physics-navy last:border-0">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-white">{payment.studentName}</h3>
                      <div className="text-sm text-gray-300">
                        كود الطالب: {payment.studentCode} | المجموعة: {payment.group}
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className="text-physics-gold">
                        آخر دفعة: {new Date(payment.date).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-2">الأشهر المدفوعة:</p>
                    <div className="flex flex-wrap gap-2">
                      {payment.paidMonths.map((month, index) => (
                        <span 
                          key={index} 
                          className="bg-physics-navy px-3 py-1 rounded-full text-sm text-white"
                          title={`تاريخ الدفع: ${new Date(month.date).toLocaleDateString('ar-EG')}`}
                        >
                          {month.month}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentPaymentsPage;
