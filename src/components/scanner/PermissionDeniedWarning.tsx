
import React from "react";
import { Camera } from "lucide-react";

export function PermissionDeniedWarning() {
  return (
    <div className="mt-4 p-4 bg-red-500/20 text-white rounded-lg text-sm flex flex-col items-center">
      <Camera className="mb-2 text-red-400" size={24} />
      <p className="text-center">
        تم رفض الوصول للكاميرا. يرجى تفعيل الكاميرا من إعدادات الجهاز ثم المحاولة مرة أخرى.
      </p>
    </div>
  );
}
