
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // تحديد ما إذا كانت رسالة نجاح أو خطأ
        const isSuccess = String(title).includes("✓") || String(title).includes("✅") || 
                         String(title).toLowerCase().includes("تم") || String(title).toLowerCase().includes("نجاح");
        const isError = props.variant === "destructive" || String(title).includes("❌") || 
                       String(title).toLowerCase().includes("خطأ") || String(title).toLowerCase().includes("فشل");
        
        // تطبيق التنسيق المخصص بناءً على نوع الرسالة
        const customClasses = isSuccess 
          ? "bg-green-900/95 border-green-500 text-white" 
          : isError
            ? "bg-red-900/95 border-red-500 text-white"
            : "bg-physics-dark border-physics-gold text-white";
            
        return (
          <Toast 
            key={id} 
            {...props}
            className={`${customClasses} shadow-lg border-2 backdrop-blur-sm`}
          >
            <div className="grid gap-1">
              {title && <ToastTitle className="text-lg font-bold">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-sm opacity-90">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
