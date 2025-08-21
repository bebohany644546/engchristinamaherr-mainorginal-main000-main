
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ArrowRight, UserPlus, Search, Trash2, Edit, X, Filter, Users } from "lucide-react";
import { Parent, Student } from "@/types";
import { toast } from "@/hooks/use-toast";
import { sanitizeSearchText } from "@/lib/utils";
import { PhoneContact } from "@/components/PhoneContact";

const ParentsManagement = () => {
  const navigate = useNavigate();
  const { getAllParents, createParent, getStudentByCode, getAllStudents, updateParent, deleteParent } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"all" | "name" | "phone" | "code" | "group">("all");
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showStudentsWithoutParents, setShowStudentsWithoutParents] = useState(false);
  
  // Form state
  const [phone, setPhone] = useState("");
  const [studentCode, setStudentCode] = useState("");
  
  // Edit state
  const [editId, setEditId] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStudentCode, setEditStudentCode] = useState("");
  const [editPassword, setEditPassword] = useState("");
  
  useEffect(() => {
    // Load parents and students when component mounts
    setParents(getAllParents());
    setStudents(getAllStudents());
  }, [getAllParents, getAllStudents]);
  
  const getStudentGroupByCode = (code: string): string => {
    const student = students.find(s => s.code === code);
    return student?.group || "";
  };
  
  // Function to get students without parent accounts
  const getStudentsWithoutParents = () => {
    // Get all student codes that have parent accounts
    const studentCodesWithParents = new Set(parents.map(parent => parent.studentCode));
    
    // Filter students that don't have parent accounts
    return students.filter(student => !studentCodesWithParents.has(student.code));
  };
  
  const filteredParents = showStudentsWithoutParents
    ? [] // When showing students without parents, we don't show parents
    : parents.filter(parent => {
        const query = sanitizeSearchText(searchQuery);
        if (!query) return true;
        
        const studentGroup = getStudentGroupByCode(parent.studentCode);
        
        switch (searchField) {
          case "name":
            return sanitizeSearchText(parent.studentName).includes(query);
          case "phone":
            return sanitizeSearchText(parent.phone).includes(query);
          case "code":
            return sanitizeSearchText(parent.studentCode).includes(query);
          case "group":
            return sanitizeSearchText(studentGroup).includes(query);
          case "all":
          default:
            return (
              sanitizeSearchText(parent.studentName).includes(query) ||
              sanitizeSearchText(parent.phone).includes(query) ||
              sanitizeSearchText(parent.studentCode).includes(query) ||
              sanitizeSearchText(studentGroup).includes(query)
            );
        }
      });
  
  // Filter students without parents
  const studentsWithoutParents = getStudentsWithoutParents().filter(student => {
    const query = sanitizeSearchText(searchQuery);
    if (!query) return true;
    
    switch (searchField) {
      case "name":
        return sanitizeSearchText(student.name).includes(query);
      case "phone":
        return sanitizeSearchText(student.phone || "").includes(query) || 
               sanitizeSearchText(student.parentPhone || "").includes(query);
      case "code":
        return sanitizeSearchText(student.code).includes(query);
      case "group":
        return sanitizeSearchText(student.group || "").includes(query);
      case "all":
      default:
        return (
          sanitizeSearchText(student.name).includes(query) ||
          sanitizeSearchText(student.phone || "").includes(query) ||
          sanitizeSearchText(student.parentPhone || "").includes(query) ||
          sanitizeSearchText(student.code).includes(query) ||
          sanitizeSearchText(student.group || "").includes(query)
        );
    }
  });

  // New function to handle student code change and auto-fill parent phone
  const handleStudentCodeChange = async (code: string) => {
    setStudentCode(code);
    
    if (code.trim().length > 0) {
      try {
        const student = await getStudentByCode(code);
        if (student && student.parentPhone) {
          setPhone(student.parentPhone);
        }
      } catch (error) {
        console.error("Error fetching student:", error);
      }
    }
  };

  // Similar function for edit form
  const handleEditStudentCodeChange = async (code: string) => {
    setEditStudentCode(code);
    
    if (code.trim().length > 0) {
      try {
        const student = await getStudentByCode(code);
        if (student && student.parentPhone) {
          setEditPhone(student.parentPhone);
        }
      } catch (error) {
        console.error("Error fetching student:", error);
      }
    }
  };
  
  const handleAddParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate student code exists
      const student = await getStudentByCode(studentCode);
      if (!student) {
        toast({
          title: "❌ كود غير صالح",
          description: "لم يتم العثور على طالب بهذا الكود",
          variant: "destructive",
        });
        return;
      }
      
      // Create parent
      const newParent = await createParent(phone, studentCode);
      
      // Update list
      setParents(getAllParents());
      
      // Reset form
      setPhone("");
      setStudentCode("");
      setShowAddForm(false);
      
    } catch (error) {
      console.error("Error creating parent:", error);
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ أثناء إنشاء حساب ولي الأمر",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const openEditForm = (parent: Parent) => {
    setEditId(parent.id);
    setEditPhone(parent.phone);
    setEditStudentCode(parent.studentCode);
    setEditPassword(parent.password);
    setShowEditForm(true);
  };
  
  const handleEditParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate student code exists
      const student = await getStudentByCode(editStudentCode);
      if (!student) {
        toast({
          title: "❌ كود غير صالح",
          description: "لم يتم العثور على طالب بهذا الكود",
          variant: "destructive",
        });
        return;
      }
      
      // Update parent
      await updateParent(editId, editPhone, editStudentCode, editPassword);
      
      // Update list
      setParents(getAllParents());
      
      // Reset form and close
      setShowEditForm(false);
      
      toast({
        title: "✅ تم التحديث",
        description: "تم تحديث بيانات ولي الأمر بنجاح",
      });
      
    } catch (error) {
      console.error("Error updating parent:", error);
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ أثناء تحديث حساب ولي الأمر",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteParent = async (parentId: string) => {
    if (window.confirm("هل أنت متأكد من حذف حساب ولي الأمر؟ لا يمكن التراجع عن هذه العملية.")) {
      setIsLoading(true);
      try {
        await deleteParent(parentId);
        setParents(getAllParents());
        toast({
          title: "✅ تم الحذف",
          description: "تم حذف حساب ولي الأمر بنجاح",
        });
      } catch (error) {
        console.error("Error deleting parent:", error);
        toast({
          title: "❌ خطأ",
          description: "حدث خطأ أثناء حذف حساب ولي الأمر",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Function to add a parent account for a student without one
  const handleAddParentForStudent = (student: Student) => {
    setStudentCode(student.code);
    if (student.parentPhone) {
      setPhone(student.parentPhone);
    } else {
      setPhone("");
    }
    setShowAddForm(true);
  };
  
  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <PhoneContact />
      
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
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-physics-gold">
                {showStudentsWithoutParents ? "الطلاب بدون أولياء أمور" : "إدارة أولياء الأمور"}
              </h1>
              <button
                onClick={() => setShowStudentsWithoutParents(!showStudentsWithoutParents)}
                className="flex items-center gap-1 px-3 py-1 bg-physics-navy rounded-lg text-sm text-white hover:bg-physics-navy/80"
                title={showStudentsWithoutParents ? "عرض أولياء الأمور" : "عرض الطلاب بدون أولياء أمور"}
              >
                {showStudentsWithoutParents ? (
                  <>
                    <Users size={16} />
                    <span>عرض أولياء الأمور</span>
                  </>
                ) : (
                  <>
                    <Filter size={16} />
                    <span>عرض الطلاب بدون أولياء أمور</span>
                  </>
                )}
              </button>
            </div>
            <button 
              onClick={() => setShowAddForm(true)}
              className="goldBtn flex items-center gap-2"
              disabled={isLoading}
            >
              <UserPlus size={18} />
              <span>إضافة ولي أمر</span>
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
                <option value="name">بحث باسم الطالب</option>
                <option value="phone">بحث برقم الهاتف</option>
                <option value="code">بحث بكود الطالب</option>
                <option value="group">بحث بالمجموعة</option>
              </select>
            </div>
            
            <div className="relative md:w-3/4">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={20} />
              <input
                type="text"
                className="inputField pr-12 w-full"
                placeholder={showStudentsWithoutParents ? "ابحث عن طالب..." : "ابحث عن ولي أمر..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Display Students Without Parents or Parents List */}
          <div className="bg-physics-dark/80 rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 border-4 border-physics-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg">جاري تحميل البيانات...</p>
              </div>
            ) : showStudentsWithoutParents ? (
              // Students without parents table
              studentsWithoutParents.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-white text-lg">جميع الطلاب لديهم حسابات أولياء أمور</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-physics-navy/50 text-physics-gold">
                        <th className="text-right py-3 px-4">اسم الطالب</th>
                        <th className="text-right py-3 px-4">كود الطالب</th>
                        <th className="text-right py-3 px-4">رقم الهاتف</th>
                        <th className="text-right py-3 px-4">المجموعة</th>
                        <th className="text-center py-3 px-4">خيارات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsWithoutParents.map((student) => (
                        <tr key={student.id} className="border-t border-physics-navy hover:bg-physics-navy/30">
                          <td className="py-3 px-4 text-white">{student.name}</td>
                          <td className="py-3 px-4 text-white">{student.code}</td>
                          <td className="py-3 px-4 text-white">{student.parentPhone || "—"}</td>
                          <td className="py-3 px-4 text-white">{student.group || "—"}</td>
                          <td className="py-3 px-4 text-white text-center">
                            <button 
                              className="goldBtn text-sm py-1 px-3"
                              onClick={() => handleAddParentForStudent(student)}
                            >
                              <span>إضافة ولي أمر</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : filteredParents.length === 0 ? (
              // No parents found
              <div className="p-8 text-center">
                <p className="text-white text-lg">لا يوجد أولياء أمور مسجلين</p>
              </div>
            ) : (
              // Parents list
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-physics-navy/50 text-physics-gold">
                      <th className="text-right py-3 px-4">الاسم</th>
                      <th className="text-right py-3 px-4">رقم الهاتف</th>
                      <th className="text-right py-3 px-4">كود الطالب</th>
                      <th className="text-right py-3 px-4">اسم الطالب</th>
                      <th className="text-right py-3 px-4">المجموعة</th>
                      <th className="text-right py-3 px-4">كلمة المرور</th>
                      <th className="text-center py-3 px-4">خيارات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParents.map((parent) => (
                      <tr key={parent.id} className="border-t border-physics-navy hover:bg-physics-navy/30">
                        <td className="py-3 px-4 text-white">ولي أمر {parent.studentName}</td>
                        <td className="py-3 px-4 text-white">{parent.phone}</td>
                        <td className="py-3 px-4 text-white">{parent.studentCode}</td>
                        <td className="py-3 px-4 text-white">{parent.studentName}</td>
                        <td className="py-3 px-4 text-white">{getStudentGroupByCode(parent.studentCode) || "—"}</td>
                        <td className="py-3 px-4 text-white">{parent.password}</td>
                        <td className="py-3 px-4 text-white text-center">
                          <div className="flex justify-center gap-2">
                            <button 
                              className="p-1 text-physics-gold hover:text-yellow-300"
                              onClick={() => openEditForm(parent)}
                              disabled={isLoading}
                              title="تعديل"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              className="p-1 text-red-400 hover:text-red-500"
                              onClick={() => handleDeleteParent(parent.id)}
                              disabled={isLoading}
                              title="حذف"
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
      
      {/* Add Parent Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-physics-gold">إضافة ولي أمر جديد</h2>
              <button 
                onClick={() => setShowAddForm(false)} 
                className="text-gray-400 hover:text-white"
                disabled={isLoading}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddParent} className="space-y-4">
              <div>
                <label className="block text-white mb-1">كود الطالب</label>
                <input
                  type="text"
                  className="inputField"
                  value={studentCode}
                  onChange={(e) => handleStudentCodeChange(e.target.value)}
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
                  placeholder="سيتم تعبئته تلقائيًا من بيانات الطالب"
                />
              </div>
              
              <div className="pt-2 flex gap-2">
                <button 
                  type="submit" 
                  className="goldBtn flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "جاري الإضافة..." : "إضافة ولي الأمر"}
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
      
      {/* Edit Parent Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-physics-gold">تعديل بيانات ولي الأمر</h2>
              <button 
                onClick={() => setShowEditForm(false)} 
                className="text-gray-400 hover:text-white"
                disabled={isLoading}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditParent} className="space-y-4">
              <div>
                <label className="block text-white mb-1">كود الطالب</label>
                <input
                  type="text"
                  className="inputField"
                  value={editStudentCode}
                  onChange={(e) => handleEditStudentCodeChange(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  className="inputField"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">كلمة المرور</label>
                <input
                  type="text"
                  className="inputField"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="pt-2 flex gap-2">
                <button 
                  type="submit" 
                  className="goldBtn flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "جاري التحديث..." : "تحديث البيانات"}
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

export default ParentsManagement;
