import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight, AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import PhysicsBackground from "@/components/PhysicsBackground";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const SystemReset = () => {
  const navigate = useNavigate();
  const {
    currentUser
  } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<"first" | "second" | "third">("first");
  const [confirmText, setConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showMainDataDeleteConfirm, setShowMainDataDeleteConfirm] = useState(false);
  const [mainDataDeleteConfirmText, setMainDataDeleteConfirmText] = useState("");
  const [isDeletingMainData, setIsDeletingMainData] = useState(false);
  
  const handleReset = async () => {
    if (confirmText !== `reset-${selectedGrade}`) {
      toast({
        title: "خطأ في التأكيد",
        description: "الرجاء كتابة نص التأكيد بشكل صحيح",
        variant: "destructive"
      });
      return;
    }
    setIsResetting(true);
    try {
      toast({
        title: "جاري إعادة تعيين النظام",
        description: "يرجى الانتظار..."
      });

      // 1. حذف الدرجات للصف المحدد
      const {
        error: gradesError
      } = await supabase.from('grades').delete().eq('group_name', `${selectedGrade}-group`);
      if (gradesError) throw gradesError;

      // 2. حذف الفيديوهات للصف المحدد
      const {
        error: videosError
      } = await supabase.from('videos').delete().eq('grade', selectedGrade);
      if (videosError) throw videosError;

      // 3. حذف الكتب للصف المحدد
      const {
        error: booksError
      } = await supabase.from('books').delete().eq('grade', selectedGrade);
      if (booksError) throw booksError;

      // 4. ملاحظة: لا يمكننا حذف سجلات الحضور لصف محدد لأنها لا تحتوي على حقل "grade"
      // يمكن تعديل الجدول لاحقًا ليشمل هذه المعلومات

      // الانتهاء
      toast({
        title: "تم إعادة تعيين النظام",
        description: `تم حذف بيانات ${getGradeName(selectedGrade)} بنجاح`
      });
      setConfirmText("");
    } catch (error) {
      console.error("Error resetting system:", error);
      toast({
        variant: "destructive",
        title: "خطأ في إعادة التعيين",
        description: "حدث خطأ أثناء محاولة حذف البيانات"
      });
    } finally {
      setIsResetting(false);
    }
  };
  
  const deleteAllData = async () => {
    if (deleteConfirmText !== "delete-all-data") {
      toast({
        title: "خطأ في التأكيد",
        description: "الرجاء كتابة نص التأكيد بشكل صحيح",
        variant: "destructive"
      });
      return;
    }
    setIsDeleting(true);
    try {
      toast({
        title: "جاري حذف جميع البيانات",
        description: "يرجى الانتظار..."
      });

      // حذف جميع البيانات من كافة الجداول بطريقة تجنب مشاكل TypeScript
      // نحدد كل جدول على حدة بدلاً من استخدام حلقة للمرور عبر مصفوفة أسماء الجداول

      // حذف البيانات من جدول attendance
      const {
        error: attendanceError
      } = await supabase.from('attendance').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (attendanceError) console.error("Error deleting from attendance:", attendanceError);

      // حذف البيانات من جدول books
      const {
        error: booksError
      } = await supabase.from('books').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (booksError) console.error("Error deleting from books:", booksError);

      // حذف البيانات من جدول grades
      const {
        error: gradesError
      } = await supabase.from('grades').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (gradesError) console.error("Error deleting from grades:", gradesError);

      // حذف البيانات من جدول paid_months
      const {
        error: paidMonthsError
      } = await supabase.from('paid_months').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (paidMonthsError) console.error("Error deleting from paid_months:", paidMonthsError);

      // حذف البيانات من جدول parents
      const {
        error: parentsError
      } = await supabase.from('parents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (parentsError) console.error("Error deleting from parents:", parentsError);

      // حذف البيانات من جدول payments
      const {
        error: paymentsError
      } = await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (paymentsError) console.error("Error deleting from payments:", paymentsError);

      // حذف البيانات من جدول students
      const {
        error: studentsError
      } = await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (studentsError) console.error("Error deleting from students:", studentsError);

      // حذف البيانات من جدول videos
      const {
        error: videosError
      } = await supabase.from('videos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (videosError) console.error("Error deleting from videos:", videosError);
      toast({
        title: "✅ تم حذف جميع البيانات",
        description: "تم حذف جميع البيانات من قاعدة البيانات بنجاح"
      });
      setShowDeleteConfirm(false);
      setDeleteConfirmText("");
    } catch (error) {
      console.error("Error deleting all data:", error);
      toast({
        variant: "destructive",
        title: "❌ خطأ في حذف البيانات",
        description: "حدث خطأ أثناء محاولة حذف جميع البيانات"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const deleteMainData = async () => {
    if (mainDataDeleteConfirmText !== "delete-main-data") {
      toast({
        title: "خطأ في التأكيد",
        description: "الرجاء كتابة نص التأكيد بشكل صحيح",
        variant: "destructive"
      });
      return;
    }
    
    setIsDeletingMainData(true);
    try {
      toast({
        title: "جاري حذف البيانات الرئيسية",
        description: "يرجى الانتظار..."
      });

      // حذف البيانات من جدول students
      const {
        error: studentsError
      } = await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (studentsError) console.error("Error deleting from students:", studentsError);

      // حذف البيانات من جدول parents
      const {
        error: parentsError
      } = await supabase.from('parents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (parentsError) console.error("Error deleting from parents:", parentsError);

      // حذف البيانات من جدول attendance
      const {
        error: attendanceError
      } = await supabase.from('attendance').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (attendanceError) console.error("Error deleting from attendance:", attendanceError);

      // حذف البيانات من جدول grades
      const {
        error: gradesError
      } = await supabase.from('grades').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (gradesError) console.error("Error deleting from grades:", gradesError);

      // حذف البيانات من جدول paid_months
      const {
        error: paidMonthsError
      } = await supabase.from('paid_months').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (paidMonthsError) console.error("Error deleting from paid_months:", paidMonthsError);

      // حذف البيانات من جدول payments
      const {
        error: paymentsError
      } = await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (paymentsError) console.error("Error deleting from payments:", paymentsError);

      toast({
        title: "✅ تم حذف البيانات الرئيسية",
        description: "تم حذف بيانات الطلاب وأولياء الأمور وسجلات الحضور والدرجات والمدفوعات بنجاح"
      });
      setShowMainDataDeleteConfirm(false);
      setMainDataDeleteConfirmText("");
    } catch (error) {
      console.error("Error deleting main data:", error);
      toast({
        variant: "destructive",
        title: "❌ خطأ في حذف البيانات",
        description: "حدث خطأ أثناء محاولة حذف البيانات الرئيسية"
      });
    } finally {
      setIsDeletingMainData(false);
    }
  };
  
  const getGradeName = (grade: string) => {
    switch (grade) {
      case "first":
        return "الصف الأول الثانوي";
      case "second":
        return "الصف الثاني الثانوي";
      case "third":
        return "الصف الثالث الثانوي";
      default:
        return "";
    }
  };

  // توجيه المستخدمين غير المسؤولين
  if (currentUser?.role !== "admin") {
    navigate("/unauthorized");
    return null;
  }
  return <div className="min-h-screen bg-physics-navy flex flex-col relative">
      <PhysicsBackground />
      <PhoneContact />
      
      {/* Header */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between relative z-10">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-physics-gold hover:opacity-80">
          <ArrowRight size={20} />
          <span>العودة للرئيسية</span>
        </button>
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-physics-dark rounded-lg p-6 shadow-lg mb-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle size={28} className="text-red-500" />
              <h1 className="text-2xl font-bold text-physics-gold">إعادة تعيين النظام</h1>
            </div>
            
            {/* قسم حذف البيانات الرئيسية */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <Trash2 size={20} className="text-red-500" />
                <p className="text-white text-lg font-semibold">حذف البيانات الرئيسية</p>
              </div>
              <p className="text-gray-300 mt-2">
                هذا الخيار سيقوم بحذف:
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-1 space-y-1">
                <li>جميع الطلاب</li>
                <li>جميع أولياء الأمور</li>
                <li>سجلات الحضور</li>
                <li>سجلات الدرجات</li>
                <li>سجلات المدفوعات</li>
              </ul>
              <p className="text-red-400 font-semibold mt-2">
                لن يتم حذف الفيديوهات والكتب بهذا الخيار!
              </p>
              
              <button 
                onClick={() => setShowMainDataDeleteConfirm(true)}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Trash2 size={16} />
                <span>حذف البيانات الرئيسية</span>
              </button>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-white text-lg font-semibold mb-2">تحذير!</p>
              <p className="text-gray-300">
                ستقوم هذه العملية بحذف كافة البيانات المتعلقة بالصف الدراسي المحدد بما في ذلك:
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                <li>درجات الطلاب</li>
                <li>الفيديوهات التعليمية</li>
                <li>الكتب والملفات</li>
              </ul>
              <p className="text-red-400 font-semibold mt-2">
                هذه العملية لا يمكن التراجع عنها!
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="grade" className="block text-white mb-2">
                  اختر الصف الدراسي
                </label>
                <select id="grade" className="inputField" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value as "first" | "second" | "third")}>
                  <option value="first">الصف الأول الثانوي</option>
                  <option value="second">الصف الثاني الثانوي</option>
                  <option value="third">الصف الثالث الثانوي</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="confirm" className="block text-white mb-2">
                  اكتب "<span className="text-red-400">reset-{selectedGrade}</span>" للتأكيد
                </label>
                <input id="confirm" type="text" className="inputField" value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder={`reset-${selectedGrade}`} />
              </div>
              
              <div className="pt-4">
                <button onClick={handleReset} disabled={confirmText !== `reset-${selectedGrade}` || isResetting} className={`w-full py-3 px-4 rounded-lg font-bold flex items-center justify-center ${confirmText === `reset-${selectedGrade}` && !isResetting ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-600 text-gray-300 cursor-not-allowed'}`}>
                  {isResetting ? <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري إعادة التعيين...
                    </> : `إعادة تعيين بيانات ${getGradeName(selectedGrade)}`}
                </button>
              </div>
            </div>
          </div>
          
          {/* قسم حذف جميع البيانات */}
          <div className="bg-physics-dark rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={28} className="text-red-500" />
              <h2 className="text-xl font-bold text-physics-gold">حذف جميع البيانات</h2>
            </div>
            
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4">
              <p className="text-white">
                هذا الخيار سيقوم بحذف <strong>جميع البيانات</strong> من قاعدة البيانات بما في ذلك:
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-2 mb-2">
                <li>الطلاب</li>
                <li>أولياء الأمور</li>
                <li>سجلات الحضور</li>
                <li>الدرجات</li>
                <li>الكتب</li>
                <li>الفيديوهات</li>
                <li>المدفوعات</li>
              </ul>
              <p className="text-red-400 font-bold">هذه العملية لا يمكن التراجع عنها نهائياً!</p>
            </div>
            
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-red-700 hover:bg-red-800 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
              حذف جميع البيانات نهائياً
            </button>
          </div>
        </div>
      </main>
      
      {/* مربع حوار تأكيد حذف البيانات الرئيسية */}
      <Dialog open={showMainDataDeleteConfirm} onOpenChange={setShowMainDataDeleteConfirm}>
        <DialogContent className="bg-physics-dark border-red-500">
          <DialogHeader>
            <DialogTitle className="text-red-500 text-xl font-bold">تأكيد حذف البيانات الرئيسية</DialogTitle>
            <DialogDescription className="text-gray-300">
              هذا الإجراء سيحذف <span className="text-red-400 font-bold">البيانات الرئيسية</span> فقط (الطلاب، أولياء الأمور، سجلات الحضور والدرجات والمدفوعات) ولا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-500/10 p-4 rounded-md">
            <p className="text-white mb-4">
              للتأكيد، يرجى كتابة "<span className="text-red-400 font-bold">delete-main-data</span>" أدناه:
            </p>
            <input type="text" value={mainDataDeleteConfirmText} onChange={e => setMainDataDeleteConfirmText(e.target.value)} placeholder="delete-main-data" className="inputField w-full" />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMainDataDeleteConfirm(false)} className="bg-transparent border-gray-500 text-gray-300 hover:bg-gray-800">
              إلغاء
            </Button>
            <Button variant="destructive" onClick={deleteMainData} disabled={mainDataDeleteConfirmText !== "delete-main-data" || isDeletingMainData} className="bg-red-700 hover:bg-red-800">
              {isDeletingMainData ? <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الحذف...
                </> : "تأكيد الحذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* مربع حوار تأكيد حذف جميع البيانات */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-physics-dark border-red-500">
          <DialogHeader>
            <DialogTitle className="text-red-500 text-xl font-bold">تأكيد حذف جميع البيانات</DialogTitle>
            <DialogDescription className="text-gray-300">
              هذا الإجراء سيحذف <span className="text-red-400 font-bold">جميع البيانات</span> من قاعدة ��لبيانات نهائيًا ولا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-500/10 p-4 rounded-md">
            <p className="text-white mb-4">
              للتأكيد، يرجى كتابة "<span className="text-red-400 font-bold">delete-all-data</span>" أدناه:
            </p>
            <input type="text" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} placeholder="delete-all-data" className="inputField w-full" />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="bg-transparent border-gray-500 text-gray-300 hover:bg-gray-800">
              إلغاء
            </Button>
            <Button variant="destructive" onClick={deleteAllData} disabled={deleteConfirmText !== "delete-all-data" || isDeleting} className="bg-red-700 hover:bg-red-800">
              {isDeleting ? <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الحذف...
                </> : "تأكيد الحذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};
export default SystemReset;
