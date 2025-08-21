import React, { useState, useEffect } from 'react';
import { Search, X, UserX, Check, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Student {
  id: string;
  name: string;
  phone: string;
  code: string;
  grade: string;
  group: string;
}

interface StudentBlockingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentsSelected: (studentIds: string[]) => void;
  currentBlockedStudents: string[];
  videoTitle?: string;
}

export const StudentBlockingModal: React.FC<StudentBlockingModalProps> = ({
  isOpen,
  onClose,
  onStudentsSelected,
  currentBlockedStudents,
  videoTitle
}) => {
  const { getAllStudents } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>(currentBlockedStudents);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStudents(getAllStudents());
      setSelectedStudents(currentBlockedStudents);
    }
  }, [isOpen, currentBlockedStudents, getAllStudents]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.phone.includes(searchQuery)
  );

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSave = () => {
    onStudentsSelected(selectedStudents);
    onClose();
  };

  const handleClose = () => {
    setSelectedStudents(currentBlockedStudents);
    setSearchQuery("");
    onClose();
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'طالب غير معروف';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-physics-dark rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden border border-physics-gold/30">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-physics-navy">
          <div>
            <h2 className="text-xl font-bold text-physics-gold flex items-center gap-2">
              <UserX size={24} />
              حظر طلاب محددين
            </h2>
            {videoTitle && (
              <p className="text-gray-400 text-sm mt-1">الفيديو: {videoTitle}</p>
            )}
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-physics-navy">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={20} />
            <input
              type="text"
              className="w-full bg-physics-navy border border-physics-gold/30 rounded-lg px-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-physics-gold transition-colors"
              placeholder="ابحث عن طالب (الاسم، الكود، أو رقم الهاتف)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Selected Students Summary */}
        {selectedStudents.length > 0 && (
          <div className="p-4 bg-physics-navy/50 border-b border-physics-navy">
            <div className="flex items-center gap-2 mb-2">
              <UserX size={16} className="text-red-500" />
              <span className="text-sm font-medium text-white">
                الطلاب المحظورين ({selectedStudents.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedStudents.map(studentId => (
                <div key={studentId} className="bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-1 flex items-center gap-2">
                  <span className="text-red-400 text-sm">{getStudentName(studentId)}</span>
                  <button
                    onClick={() => handleStudentToggle(studentId)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Students List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500 text-4xl mb-4">👥</div>
              <p className="text-gray-400">
                {searchQuery ? "لا توجد نتائج للبحث" : "لا يوجد طلاب"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-physics-navy">
              {filteredStudents.map(student => {
                const isSelected = selectedStudents.includes(student.id);
                return (
                  <div 
                    key={student.id} 
                    className={`p-4 hover:bg-physics-navy/30 cursor-pointer transition-colors ${
                      isSelected ? 'bg-red-500/10 border-r-4 border-red-500' : ''
                    }`}
                    onClick={() => handleStudentToggle(student.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'bg-red-500 border-red-500' 
                              : 'border-gray-400 hover:border-physics-gold'
                          }`}>
                            {isSelected && <Check size={12} className="text-white" />}
                          </div>
                          <div>
                            <h3 className="text-white font-medium">{student.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>كود: {student.code}</span>
                              <span>هاتف: {student.phone}</span>
                              <span>الصف: {student.grade === 'first' ? 'الأول' : student.grade === 'second' ? 'الثاني' : 'الثالث'}</span>
                              {student.group && <span>مجموعة: {student.group}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="text-red-500">
                          <UserX size={20} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-physics-navy">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              {selectedStudents.length > 0 
                ? `تم اختيار ${selectedStudents.length} طالب للحظر`
                : 'لم يتم اختيار أي طالب للحظر'
              }
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-physics-gold text-physics-dark rounded-lg font-medium hover:bg-physics-gold/90 transition-colors flex items-center gap-2"
              >
                <Check size={18} />
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentBlockingModal;
