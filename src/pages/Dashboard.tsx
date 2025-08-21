
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { Users, UserPlus, QrCode, Video, Book, LogOut, CheckSquare, Award, DollarSign, UserCheck, RefreshCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import PhysicsBackground from "@/components/PhysicsBackground";

const DashboardItem = ({
  to,
  icon,
  title,
  description,
  stats = null
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  stats?: { present?: number; absent?: number; total?: number } | null;
}) => {
  return (
    <Link 
      to={to} 
      className="bg-physics-dark rounded-lg p-6 hover:bg-physics-dark/70 transition-all flex flex-col items-center"
    >
      <div className="h-16 w-16 rounded-full bg-physics-navy flex items-center justify-center text-physics-gold mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-physics-gold mb-2">{title}</h3>
      {stats && (
        <div className="mt-2 w-full">
          <div className="flex justify-between text-sm text-white">
            <div className="text-green-400">حضور: {stats.present || 0}</div>
            <div className="text-red-400">غياب: {stats.absent || 0}</div>
          </div>
          <div className="w-full bg-physics-navy h-2 rounded-full mt-1 overflow-hidden">
            <div 
              className="bg-green-500 h-full" 
              style={{ width: `${stats.total ? (stats.present || 0) / stats.total * 100 : 0}%` }}
            />
          </div>
        </div>
      )}
    </Link>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { getStudentAttendance, getStudentLessonCount } = useData();

  // إحصائيات الحضور للطالب
  const attendanceStats = currentUser?.role === "student" ? {
    present: getStudentAttendance(currentUser.id).filter(r => r.status === "present").length,
    absent: getStudentAttendance(currentUser.id).filter(r => r.status === "absent").length,
    total: getStudentLessonCount(currentUser.id)
  } : null;

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-physics-navy flex flex-col relative">
      <PhysicsBackground />
      <PhoneContact />
      
      {/* Header with User Info */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between relative z-10">
        <div className="flex items-center">
          <div className="text-physics-gold font-bold text-lg ml-2">
            {currentUser.name}
          </div>
          <div className="bg-physics-gold/20 rounded-full px-3 py-1 text-sm text-physics-gold">
            {currentUser.role === "admin" ? "مسؤول النظام" : currentUser.role === "student" ? "طالب" : "ولي أمر"}
          </div>
        </div>
        
        <Logo />
        
        <div className="flex items-center gap-2">
          <button onClick={handleLogout} className="flex items-center gap-2 text-physics-gold hover:opacity-80">
            <span>تسجيل الخروج</span>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content - Dashboard */}
      <main className="flex-1 p-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-physics-gold mb-8">لوحة التحكم</h1>
          
          {/* Admin Dashboard Items */}
          {currentUser.role === "admin" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <DashboardItem 
                  to="/students" 
                  icon={<Users size={32} />} 
                  title="إدارة الطلاب" 
                  description="إضافة وتعديل وحذف بيانات الطلاب" 
                />
                <DashboardItem 
                  to="/parents" 
                  icon={<UserPlus size={32} />} 
                  title="إدارة أولياء الأمور" 
                  description="إضافة حسابات لأولياء الأمور" 
                />
                <DashboardItem 
                  to="/scan-code" 
                  icon={<QrCode size={32} />} 
                  title="تسجيل الحضور" 
                  description="مسح كود الطلاب وتسجيل الحضور" 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <DashboardItem 
                  to="/attendance-list" 
                  icon={<UserCheck size={32} />} 
                  title="سجل الحضور" 
                  description="عرض وإدارة سجل حضور الطلاب" 
                />
                <DashboardItem 
                  to="/grades-management" 
                  icon={<Award size={32} />} 
                  title="سجل الدرجات" 
                  description="إدخال وعرض درجات الطلاب" 
                />
                <DashboardItem 
                  to="/payments" 
                  icon={<DollarSign size={32} />} 
                  title="إدارة المدفوعات" 
                  description="تسجيل ومتابعة مدفوعات الطلاب" 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <DashboardItem 
                  to="/videos" 
                  icon={<Video size={32} />} 
                  title="الفيديوهات" 
                  description="إدارة وعرض الدروس المرئية" 
                />
                <DashboardItem 
                  to="/books" 
                  icon={<Book size={32} />} 
                  title="الكتب والملفات" 
                  description="رفع وإدارة الملفات التعليمية" 
                />
                <DashboardItem 
                  to="/system-reset" 
                  icon={<RefreshCcw size={32} />} 
                  title="إعادة تعيين النظام" 
                  description="إعادة ضبط بيانات النظام حسب الصف" 
                />
              </div>
            </>
          )}
          
          {/* Student Dashboard Items */}
          {currentUser.role === "student" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DashboardItem 
                to="/student-code" 
                icon={<QrCode size={32} />} 
                title="كود الطالب" 
                description="عرض الكود الخاص بك لتسجيل الحضور" 
              />
              <DashboardItem 
                to="/student-grades" 
                icon={<Award size={32} />} 
                title="الدرجات" 
                description="عرض الدرجات والتقييمات" 
              />
              <DashboardItem 
                to="/attendance-record" 
                icon={<CheckSquare size={32} />} 
                title="سجل الحضور" 
                description="عرض سجل الحضور الخاص بك" 
                stats={attendanceStats}
              />
              <DashboardItem 
                to="/videos" 
                icon={<Video size={32} />} 
                title="الفيديوهات" 
                description="مشاهدة الفيديوهات التعليمية" 
              />
              <DashboardItem 
                to="/student-books" 
                icon={<Book size={32} />} 
                title="الكتب والملفات" 
                description="تحميل المذكرات والملفات التعليمية" 
              />
              <DashboardItem 
                to="/student-payments" 
                icon={<DollarSign size={32} />} 
                title="المدفوعات" 
                description="عرض سجل المدفوعات الخاص بك" 
              />
            </div>
          )}
          
          {/* Parent Dashboard Items */}
          {currentUser.role === "parent" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DashboardItem 
                to="/grades" 
                icon={<Award size={32} />} 
                title="الدرجات" 
                description="عرض درجات الطالب" 
              />
              <DashboardItem 
                to="/attendance-record" 
                icon={<CheckSquare size={32} />} 
                title="سجل الحضور" 
                description="عرض سجل حضور الطالب" 
              />
              <DashboardItem 
                to="/parent-payments" 
                icon={<DollarSign size={32} />} 
                title="المدفوعات" 
                description="عرض سجل مدفوعات الطالب" 
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
