
import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface PaymentStatusDisplayProps {
  paymentStatus: {
    paid: boolean;
    studentName?: string;
  } | null;
}

export function PaymentStatusDisplay({ paymentStatus }: PaymentStatusDisplayProps) {
  if (!paymentStatus) return null;
  
  return (
    <div className={`mt-4 p-3 rounded-lg text-center ${paymentStatus.paid ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
      <div className="flex items-center justify-center gap-2">
        {paymentStatus.paid ? (
          <CheckCircle2 className="text-green-400" size={20} />
        ) : (
          <AlertCircle className="text-red-400" size={20} />
        )}
        <p className="text-white font-bold">
          {paymentStatus.studentName}
        </p>
      </div>
      <p className="text-sm text-white mt-1">
        {paymentStatus.paid 
          ? 'الطالب مدفوع الاشتراك للدرس الحالي' 
          : 'الطالب غير مدفوع الاشتراك للدرس الحالي - يرجى التنبيه'}
      </p>
    </div>
  );
}
