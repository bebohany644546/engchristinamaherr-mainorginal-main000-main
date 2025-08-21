
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight, Search, FileText, Download, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const StudentBooks = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState<{id: string, title: string, url: string, grade: string, uploadDate: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentGrade, setStudentGrade] = useState<string>("");
  
  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    if (currentUser.role === "student") {
      // تعيين الصف الدراسي للطالب
      setStudentGrade(currentUser.grade || "first");
      
      fetchBooks(currentUser.grade || "first");
    }
  }, [currentUser, navigate]);
  
  const fetchBooks = async (grade: string) => {
    setIsLoading(true);
    try {
      let query = supabase.from('books')
        .select('*')
        .eq('grade', grade)
        .order('upload_date', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        const mappedBooks = data.map(book => ({
          id: book.id,
          title: book.title,
          url: book.url,
          grade: book.grade,
          uploadDate: book.upload_date || new Date().toISOString()
        }));
        setBooks(mappedBooks);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تحميل البيانات",
        description: "حدث خطأ أثناء محاولة تحميل الكتب والملفات"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // تصفية البيانات حسب البحث
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-physics-navy flex flex-col relative">
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
          <h1 className="text-2xl font-bold text-physics-gold mb-6">الكتب والملفات التعليمية - {studentGrade === "first" ? "الصف الأول الثانوي" : studentGrade === "second" ? "الصف الثاني الثانوي" : "الصف الثالث الثانوي"}</h1>
          
          {/* البحث */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={20} />
              <input 
                type="text" 
                className="inputField pr-12 w-full" 
                placeholder="ابحث عن كتاب أو ملف" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
              />
            </div>
          </div>
          
          {/* حالة التحميل */}
          {isLoading && (
            <div className="bg-physics-dark rounded-lg p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-physics-gold border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white mt-3">جاري تحميل البيانات...</p>
            </div>
          )}
          
          {/* قائمة الكتب والملفات */}
          {!isLoading && (
            <div className="bg-physics-dark rounded-lg overflow-hidden">
              {filteredBooks.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-white text-lg">لا توجد ملفات متاحة لصفك الدراسي</p>
                </div>
              ) : (
                <div className="divide-y divide-physics-navy">
                  {filteredBooks.map(book => (
                    <div key={book.id} className="p-4 hover:bg-physics-navy/30">
                      <div className="flex items-center">
                        <div className="mr-4 bg-physics-navy p-3 rounded-full">
                          <FileText size={24} className="text-physics-gold" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-white">{book.title}</h3>
                          </div>
                          <div className="flex items-center text-sm text-gray-300 mt-1">
                            <Calendar size={14} className="ml-1" />
                            <span>{formatDate(book.uploadDate)}</span>
                          </div>
                        </div>
                        
                        <a href={book.url} target="_blank" rel="noopener noreferrer" className="p-2 text-physics-gold hover:text-white">
                          <Download size={18} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentBooks;
