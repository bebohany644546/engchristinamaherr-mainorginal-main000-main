
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ArrowRight, UserPlus, Search, Edit, Trash2, Filter } from "lucide-react";
import { Student } from "@/types";
import { getGradeDisplay, sanitizeSearchText } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const StudentsManagement = () => {
  const { getAllStudents, createStudent, deleteStudent, updateStudent } = useAuth();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"all" | "name" | "phone" | "code" | "group">("all");
  const [students, setStudents] = useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [group, setGroup] = useState("");
  const [grade, setGrade] = useState<"first" | "second" | "third">("first");
  
  useEffect(() => {
    // Load students when component mounts
    setStudents(getAllStudents());
  }, [getAllStudents]);
  
  const filteredStudents = students.filter(student => {
    const query = sanitizeSearchText(searchQuery);
    if (!query) return true;
    
    switch (searchField) {
      case "name":
        return sanitizeSearchText(student.name).includes(query);
      case "phone":
        return student.phone ? sanitizeSearchText(student.phone).includes(query) : false;
      case "code":
        return sanitizeSearchText(student.code).includes(query);
      case "group":
        return student.group ? sanitizeSearchText(student.group).includes(query) : false;
      case "all":
      default:
        return (
          sanitizeSearchText(student.name).includes(query) ||
          (student.phone ? sanitizeSearchText(student.phone).includes(query) : false) ||
          sanitizeSearchText(student.code).includes(query) ||
          (student.group ? sanitizeSearchText(student.group).includes(query) : false)
        );
    }
  });
  
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const newStudent = await createStudent(name, phone, parentPhone, group, grade);
      setStudents(getAllStudents()); // Refresh list
      setName("");
      setPhone("");
      setParentPhone("");
      setGroup("");
      setGrade("first");
      setShowAddForm(false);
    } catch (error) {
      console.error("Error creating student:", error);
      toast({
        variant: "destructive",
        title: "❌ خطأ",
        description: "حدث خطأ أثناء إنشاء حساب الطالب",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setName(student.name);
    setPhone(student.phone || "");
    setPassword(student.password || "");
    setParentPhone(student.parentPhone || "");
    setGroup(student.group || "");
    setGrade(student.grade);
    setShowEditForm(true);
  };
  
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    
    setIsLoading(true);
    
    try {
      await updateStudent(
        editingStudent.id,
        name,
        phone,
        password,
        parentPhone,
        group,
        grade
      );
      
      setStudents(getAllStudents()); // Refresh list
      setShowEditForm(false);
      setEditingStudent(null);
      
      toast({
        title: "تم تحديث بيانات الطالب",
        description: `تم تحديث بيانات الطالب ${name} بنجاح`,
      });
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        variant: "destructive",
        title: "❌ خطأ",
        description: "حدث خطأ أثناء تحديث بيانات الطالب",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الطالب ${studentName}؟`)) {
      setIsLoading(true);
      
      try {
        await deleteStudent(studentId);
        setStudents(getAllStudents()); // Refresh list
        
        toast({
          title: "تم حذف الطالب",
          description: `تم حذف الطالب ${studentName} بنجاح`,
          variant: "destructive",
        });
      } catch (error) {
        console.error("Error deleting student:", error);
        toast({
          variant: "destructive",
          title: "❌ خطأ",
          description: "حدث خطأ أثناء حذف الطالب",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* Header */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-physics-gold hover:opacity-80"
          >
            <ArrowRight size={20} />
            <span>العودة للرئيسية</span>
          </button>
        </div>
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-physics-gold">إدارة الطلاب</h1>
            <button 
              onClick={() => setShowAddForm(true)}
              className="goldBtn flex items-center gap-2"
              disabled={isLoading}
            >
              <UserPlus size={18} />
              <span>إضافة طالب</span>
            </button>
          </div>
          
          {/* Search with filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="md:w-1/4">
              <select
                className="inputField w-full"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value as any)}
              >
                <option value="all">بحث في كل الحقول</option>
                <option value="name">بحث بالاسم</option>
                <option value="phone">بحث برقم الهاتف</option>
                <option value="code">بحث بالكود</option>
                <option value="group">بحث بالمجموعة</option>
              </select>
            </div>
            
            <div className="relative md:w-3/4">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={20} />
              <input
                type="text"
                className="inputField pr-12 w-full"
                placeholder="ابحث عن طالب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Students List */}
          <div className="bg-physics-dark/80 rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 border-4 border-physics-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg">جاري تحميل البيانات...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-white text-lg">لا يوجد طلاب مسجلين</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-physics-navy/50 text-physics-gold">
                      <th className="text-right py-3 px-4">الاسم</th>
                      <th className="text-right py-3 px-4">الهاتف</th>
                      <th className="text-right py-3 px-4">الكود</th>
                      <th className="text-right py-3 px-4">كلمة المرور</th>
                      <th className="text-right py-3 px-4">المجموعة</th>
                      <th className="text-right py-3 px-4">الصف</th>
                      <th className="text-right py-3 px-4">هاتف ولي الأمر</th>
                      <th className="text-center py-3 px-4">خيارات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-t border-physics-navy hover:bg-physics-navy/30">
                        <td className="py-3 px-4 text-white">{student.name}</td>
                        <td className="py-3 px-4 text-white">{student.phone}</td>
                        <td className="py-3 px-4 text-white">{student.code}</td>
                        <td className="py-3 px-4 text-white">{student.password}</td>
                        <td className="py-3 px-4 text-white">{student.group || "—"}</td>
                        <td className="py-3 px-4 text-white">{getGradeDisplay(student.grade)}</td>
                        <td className="py-3 px-4 text-white">{student.parentPhone}</td>
                        <td className="py-3 px-4 text-white text-center">
                          <div className="flex justify-center gap-2">
                            <button 
                              className="p-1 text-physics-gold hover:text-physics-lightgold"
                              onClick={() => handleEditClick(student)}
                              disabled={isLoading}
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              className="p-1 text-red-400 hover:text-red-500"
                              onClick={() => handleDeleteStudent(student.id, student.name)}
                              disabled={isLoading}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Add Student Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-physics-gold mb-6">إضافة طالب جديد</h2>
            
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-white mb-1">اسم الطالب</label>
                <input
                  type="text"
                  className="inputField"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  className="inputField"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">رقم هاتف ولي الأمر</label>
                <input
                  type="text"
                  className="inputField"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">المجموعة</label>
                <input
                  type="text"
                  className="inputField"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  required
                  placeholder="أدخل اسم المجموعة"
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">الصف الدراسي</label>
                <select
                  className="inputField"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as any)}
                  required
                >
                  <option value="first">الصف الأول الثانوي</option>
                  <option value="second">الصف الثاني الثانوي</option>
                  <option value="third">الصف الثالث الثانوي</option>
                </select>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit" 
                  className="goldBtn flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "جاري الإضافة..." : "إضافة الطالب"}
                </button>
                <button 
                  type="button" 
                  className="bg-physics-navy text-white py-2 px-4 rounded-lg flex-1"
                  onClick={() => setShowAddForm(false)}
                  disabled={isLoading}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Student Modal */}
      {showEditForm && editingStudent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-physics-gold mb-6">تعديل بيانات الطالب</h2>
            
            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div>
                <label className="block text-white mb-1">اسم الطالب</label>
                <input
                  type="text"
                  className="inputField"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  className="inputField"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">رقم هاتف ولي الأمر</label>
                <input
                  type="text"
                  className="inputField"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">المجموعة</label>
                <input
                  type="text"
                  className="inputField"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  required
                  placeholder="أدخل اسم المجموعة"
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">الصف الدراسي</label>
                <select
                  className="inputField"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as any)}
                  required
                >
                  <option value="first">الصف الأول الثانوي</option>
                  <option value="second">الصف الثاني الثانوي</option>
                  <option value="third">الصف الثالث الثانوي</option>
                </select>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit" 
                  className="goldBtn flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
                <button 
                  type="button" 
                  className="bg-physics-navy text-white py-2 px-4 rounded-lg flex-1"
                  onClick={() => setShowEditForm(false)}
                  disabled={isLoading}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;
