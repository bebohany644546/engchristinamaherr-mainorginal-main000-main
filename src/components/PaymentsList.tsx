
import { useState } from "react";
import { Calendar, Search, DollarSign, Edit, Trash2 } from "lucide-react";
import { Payment } from "@/types";
import { sanitizeSearchText } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

interface PaymentsListProps {
  payments: Payment[];
  onEditPayment?: (payment: Payment) => void;
  onDeletePayment?: (paymentId: string) => void;
}

export function PaymentsList({ payments, onEditPayment, onDeletePayment }: PaymentsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"name" | "code" | "group">("name");



  // معالج تعديل الدفعة
  const handleEdit = (payment: Payment) => {
    if (onEditPayment) {
      onEditPayment(payment);
    }
  };

  // معالج حذف الدفعة
  const handleDelete = (paymentId: string) => {
    if (onDeletePayment) {
      if (window.confirm("هل أنت متأكد من حذف هذه الدفعة نهائياً؟")) {
        onDeletePayment(paymentId);
        toast({
          title: "✅ تم الحذف",
          description: "تم حذف الدفعة بنجاح",
        });
      }
    }
  };
  
  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // تصفية المدفوعات حسب البحث
  const filteredPayments = payments.filter(payment => {
    const query = sanitizeSearchText(searchQuery);
    if (!query) return true;
    
    switch (searchField) {
      case "name":
        return sanitizeSearchText(payment.studentName).includes(query);
      case "code":
        return sanitizeSearchText(payment.studentCode).includes(query);
      case "group":
        return sanitizeSearchText(payment.group).includes(query);
      default:
        return true;
    }
  });

  return (
    <div>
      {/* حقل البحث مع اختيار نوع البحث */}
      <div className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/4">
            <select
              className="inputField w-full"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value as "name" | "code" | "group")}
            >
              <option value="name">بحث بالاسم</option>
              <option value="code">بحث بالكود</option>
              <option value="group">بحث بالمجموعة</option>
            </select>
          </div>
          
          <div className="relative w-full md:w-3/4">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              className="inputField pr-10 w-full"
              placeholder={
                searchField === "name" ? "بحث عن طالب بالاسم..." : 
                searchField === "code" ? "بحث عن طالب بالكود..." :
                "بحث عن مجموعة..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* عرض المدفوعات */}
      {filteredPayments.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-white text-lg">لا توجد مدفوعات مسجلة</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-physics-navy/50 text-physics-gold hover:bg-physics-navy/50">
              <TableHead className="text-right">اسم الطالب</TableHead>
              <TableHead className="text-right">كود الطالب</TableHead>
              <TableHead className="text-right">المجموعة</TableHead>
              <TableHead className="text-right">آخر دفعة</TableHead>
              <TableHead className="text-right">قيمة المبلغ</TableHead>
              <TableHead className="text-right">الأشهر المدفوعة</TableHead>
              <TableHead className="text-center">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id} className="border-t border-physics-navy hover:bg-physics-navy/30">
                <TableCell className="text-white font-medium">{payment.studentName}</TableCell>
                <TableCell className="text-white">{payment.studentCode}</TableCell>
                <TableCell className="text-white">{payment.group}</TableCell>
                <TableCell className="text-white">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-physics-gold" />
                    <span>{formatDate(payment.date)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-white">
                  <div className="flex items-center gap-1">
                    <DollarSign size={14} className="text-physics-gold" />
                    <span className="text-physics-gold font-bold">
                      {payment.amount || "غير محدد"} جنيه
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-white">
                  <div className="flex flex-wrap gap-1">
                    {payment.paidMonths.map((paidMonth, index) => (
                      <span
                        key={index}
                        className="bg-physics-navy px-2 py-1 rounded-full text-xs text-white border border-physics-gold/30"
                        title={`تاريخ الدفع: ${formatDate(paidMonth.date)}`}
                      >
                        {paidMonth.month}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    {onEditPayment && (
                      <button
                        onClick={() => handleEdit(payment)}
                        className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
                        title="تعديل الدفعة"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    {onDeletePayment && (
                      <button
                        onClick={() => handleDelete(payment.id)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                        title="حذف الدفعة"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
