
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { turso, generateId, createTables, addVideoPasswordColumn, addBlockedStudentsColumn, recreateVideosTable, checkDatabaseStatus, testGenerateId } from "@/integrations/turso/client";
import { toast } from "@/hooks/use-toast";
import {
  Grade,
  Video,
  Book,
  Attendance,
} from "@/types";

export interface DataContextType {
  grades: Grade[];
  videos: Video[];
  books: Book[];
  attendance: Attendance[];
  fetchGrades: () => Promise<void>;
  fetchVideos: () => Promise<void>;
  fetchBooks: () => Promise<void>;
  fetchAttendance: () => Promise<void>;
  getStudentGrades: (studentId: string) => Grade[];
  getVideosByGrade: (grade: "first" | "second" | "third") => Video[];
  getAllVideos: () => Video[];
  getStudentAttendance: (studentId: string) => Attendance[];
  getStudentLessonCount: (studentId: string) => number;
  getNextLessonNumber: (studentId: string) => number;
  getDisplayLessonNumber: (rawLessonNumber: number) => number;
  registerBulkAbsence: (groupName: string, selectedDate: string, getAllStudents: () => any[]) => Promise<{ success: boolean; count: number; message: string }>;
  deleteAttendanceRecord: (recordId: string) => Promise<void>;
  deleteGrade: (gradeId: string) => Promise<void>;
  deleteVideo: (videoId: string) => Promise<void>;
  addGrade: (
    studentId: string,
    studentName: string,
    examName: string,
    score: number,
    totalScore?: number,
    lessonNumber?: number,
    group?: string
  ) => Promise<Grade | null>;
  updateGrade: (
    gradeId: string,
    examName: string,
    score: number,
    totalScore: number,
    lessonNumber?: number,
    group?: string
  ) => Promise<boolean>;
  addVideo: (
    title: string,
    url: string,
    grade: "first" | "second" | "third",
    isYouTube?: boolean,
    password?: string,
    blockedStudents?: string[]
  ) => Promise<Video | null>;
  updateVideo: (
    videoId: string,
    title: string,
    url: string,
    grade: "first" | "second" | "third",
    isYouTube?: boolean,
    password?: string,
    blockedStudents?: string[]
  ) => Promise<boolean>;
  addAttendance: (
    studentId: string,
    studentName: string,
    status?: "present" | "absent",
    lessonNumber?: number
  ) => Promise<Attendance | null>;
  addBook: (
    title: string,
    url: string,
    grade: "first" | "second" | "third"
  ) => Promise<Book | null>;
  updateBook: (
    bookId: string,
    title: string,
    url: string,
    grade: "first" | "second" | "third"
  ) => Promise<boolean>;
  deleteBook: (bookId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function calculatePerformanceIndicator(score: number, totalScore: number): "excellent" | "very-good" | "good" | "fair" | "needs-improvement" {
  const percentage = (score / totalScore) * 100;

  if (percentage >= 90) {
    return "excellent";
  } else if (percentage >= 80) {
    return "very-good";
  } else if (percentage >= 70) {
    return "good";
  } else if (percentage >= 60) {
    return "fair";
  } else {
    return "needs-improvement";
  }
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // إنشاء الجداول أولاً إذا لم تكن موجودة
        await createTables();

        // فحص حالة قاعدة البيانات
        const dbStatus = await checkDatabaseStatus();
        console.log("حالة قاعدة البيانات:", dbStatus);

        // إضافة عمود كلمة مرور الفيديو إذا لم يكن موجوداً
        await addVideoPasswordColumn();

        // إضافة عمود الطلاب المحظورين إذا لم يكن موجوداً
        await addBlockedStudentsColumn();
        
        // Load all data from Turso on initial mount
        fetchGrades();
        fetchVideos();
        fetchBooks();
        fetchAttendance();
      } catch (error) {
        console.error("Error initializing data:", error);
        toast({
          title: "خطأ في تهيئة البيانات",
          description: "تعذر تهيئة قاعدة البيانات",
          variant: "destructive"
        });
      }
    };

    initializeData();
  }, []);

  const getStudentGrades = useCallback(
    (studentId: string): Grade[] => {
      return grades.filter((grade) => grade.studentId === studentId);
    },
    [grades]
  );

  const getVideosByGrade = useCallback(
    (grade: "first" | "second" | "third"): Video[] => {
      return videos.filter((video) => video.grade === grade);
    },
    [videos]
  );
  
  const getAllVideos = useCallback(
    (): Video[] => {
      return videos;
    },
    [videos]
  );

  const getStudentAttendance = useCallback(
    (studentId: string): Attendance[] => {
      return attendance.filter((record) => record.studentId === studentId);
    },
    [attendance]
  );

  const getStudentLessonCount = useCallback(
    (studentId: string): number => {
      return attendance.filter((record) => record.studentId === studentId).length;
    },
    [attendance]
  );

  // دالة لحساب رقم الحصة التالية للطالب
  const getNextLessonNumber = useCallback(
    (studentId: string): number => {
      const studentAttendance = attendance.filter((record) => record.studentId === studentId);

      if (studentAttendance.length === 0) {
        return 1; // أول حصة
      }

      // الحصول على أعلى رقم حصة للطالب
      const maxLessonNumber = Math.max(...studentAttendance.map(record => record.lessonNumber));

      // حساب رقم الحصة التالية مع النظام الدائري (1-8)
      const nextRawNumber = maxLessonNumber + 1;
      return nextRawNumber;
    },
    [attendance]
  );

  // دالة لتحويل رقم الحصة الخام إلى رقم العرض الدائري (1-8)
  const getDisplayLessonNumber = useCallback(
    (rawLessonNumber: number): number => {
      return ((rawLessonNumber - 1) % 8) + 1;
    },
    []
  );

  // دالة لتسجيل الغياب التلقائي للطلاب الذين لم يسجلوا حضورهم
  const registerBulkAbsence = useCallback(
    async (groupName: string, selectedDate: string, getAllStudents: () => any[]): Promise<{ success: boolean; count: number; message: string }> => {
      try {
        // الحصول على جميع الطلاب في المجموعة المحددة
        const allStudents = getAllStudents();
        const studentsInGroup = allStudents.filter(student =>
          student.group?.toLowerCase().includes(groupName.toLowerCase())
        );

        if (studentsInGroup.length === 0) {
          return {
            success: false,
            count: 0,
            message: "لم يتم العثور على طلاب في هذه المجموعة"
          };
        }

        // تحويل التاريخ المحدد إلى تنسيق للمقارنة
        const targetDate = new Date(selectedDate);
        const targetDateString = targetDate.toISOString().split('T')[0];

        // العثور على الطلاب الذين لم يسجلوا حضورهم في التاريخ المحدد
        const studentsWithoutAttendance = studentsInGroup.filter(student => {
          const studentAttendanceOnDate = attendance.filter(record => {
            const recordDate = new Date(record.date).toISOString().split('T')[0];
            return record.studentId === student.id && recordDate === targetDateString;
          });
          return studentAttendanceOnDate.length === 0;
        });

        if (studentsWithoutAttendance.length === 0) {
          return {
            success: true,
            count: 0,
            message: "جميع الطلاب في هذه المجموعة مسجلين بالفعل في التاريخ المحدد"
          };
        }

        // تسجيل الغياب لكل طالب لم يسجل حضوره
        let successCount = 0;
        for (const student of studentsWithoutAttendance) {
          try {
            const nextLessonNumber = getNextLessonNumber(student.id);

            const id = generateId();
            const currentTime = new Date();
            const time = currentTime.toLocaleTimeString();
            const date = new Date(selectedDate + 'T12:00:00').toISOString(); // Set to noon of selected date

            await turso.execute({
              sql: `
                INSERT INTO attendance (id, student_id, student_name, status, lesson_number, time, date)
                VALUES (?, ?, ?, ?, ?, ?, ?)
              `,
              args: [id, student.id, student.name, "absent", nextLessonNumber, time, date]
            });

            // إضافة السجل إلى البيانات المحلية
            const newAttendance: Attendance = {
              id,
              studentId: student.id,
              studentName: student.name,
              status: "absent",
              lessonNumber: nextLessonNumber,
              time,
              date
            };
            setAttendance(prev => [...prev, newAttendance]);

            successCount++;
          } catch (error) {
            console.error(`Error registering absence for student ${student.name}:`, error);
          }
        }

        // تحديث البيانات المحلية
        // سيتم تحديث البيانات تلقائياً عند إعادة تحميل الصفحة

        return {
          success: true,
          count: successCount,
          message: `تم تسجيل غياب ${successCount} طالب بنجاح`
        };

      } catch (error) {
        console.error("Error in registerBulkAbsence:", error);
        return {
          success: false,
          count: 0,
          message: "حدث خطأ أثناء تسجيل الغياب"
        };
      }
    },
    [attendance, getNextLessonNumber]
  );

  const deleteAttendanceRecord = async (recordId: string) => {
    try {
      await turso.execute({
        sql: "DELETE FROM attendance WHERE id = ?",
        args: [recordId]
      });

      setAttendance((prevAttendance) =>
        prevAttendance.filter((record) => record.id !== recordId)
      );

      toast({
        title: "✅ تم حذف سجل الحضور بنجاح",
        description: "تم حذف سجل الحضور من النظام"
      });
    } catch (error: any) {
      console.error("Error deleting attendance record:", error);
      toast({
        title: "❌ خطأ في حذف سجل الحضور",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
    }
  };

  const deleteGrade = async (gradeId: string) => {
    try {
      await turso.execute({
        sql: "DELETE FROM grades WHERE id = ?",
        args: [gradeId]
      });

      setGrades((prevGrades) => prevGrades.filter((grade) => grade.id !== gradeId));

      toast({
        title: "✅ تم حذف الدرجة بنجاح",
        description: "تم حذف الدرجة من النظام"
      });
    } catch (error: any) {
      console.error("Error deleting grade:", error);
      toast({
        title: "❌ خطأ في حذف الدرجة",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
    }
  };

  const deleteVideo = async (videoId: string) => {
    try {
      await turso.execute({
        sql: "DELETE FROM videos WHERE id = ?",
        args: [videoId]
      });

      setVideos((prevVideos) => prevVideos.filter((video) => video.id !== videoId));

      toast({
        title: "✅ تم حذف الفيديو بنجاح",
        description: "تم حذف الفيديو من النظام"
      });
    } catch (error: any) {
      console.error("Error deleting video:", error);
      toast({
        title: "❌ خطأ في حذف الفيديو",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
    }
  };

  // Fetch grades from Turso
  const fetchGrades = async () => {
    try {
      const result = await turso.execute("SELECT * FROM grades");
      const formattedGrades = result.rows.map((row: any) => ({
        id: row.id,
        studentId: row.student_id,
        studentName: row.student_name,
        examName: row.exam_name,
        score: Number(row.score),
        totalScore: Number(row.total_score),
        date: row.date,
        lessonNumber: row.lesson_number || 1,
        group: row.group_name || "",
        performanceIndicator: row.performance_indicator || "good",
      }));
      setGrades(formattedGrades);
    } catch (error) {
      console.error('Error fetching grades from Turso:', error);
      toast({
        title: "خطأ في تحميل الدرجات",
        description: "تعذر تحميل الدرجات من قاعدة البيانات",
        variant: "destructive"
      });
    }
  };

  // Fetch attendance from Turso
  const fetchAttendance = async () => {
    try {
      const result = await turso.execute("SELECT * FROM attendance");
      const formattedAttendance = result.rows.map((row: any) => ({
        id: row.id,
        studentId: row.student_id,
        studentName: row.student_name,
        date: row.date,
        time: row.time || "",
        status: row.status,
        lessonNumber: row.lesson_number || 1,
      }));
      setAttendance(formattedAttendance);
    } catch (error) {
      console.error('Error fetching attendance from Turso:', error);
      toast({
        title: "خطأ في تحميل الحضور",
        description: "تعذر تحميل بيانات الحضور من قاعدة البيانات",
        variant: "destructive"
      });
    }
  };

  // Fetch videos from Turso
  const fetchVideos = async () => {
    try {
      const result = await turso.execute("SELECT * FROM videos");
      const formattedVideos = result.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        url: row.url,
        uploadDate: row.upload_date,
        grade: row.grade,
        isYouTube: row.is_youtube || false,
        password: row.video_password,
        blockedStudents: row.blocked_students ? JSON.parse(row.blocked_students) : [],
      }));
      setVideos(formattedVideos);
    } catch (error) {
      console.error('Error fetching videos from Turso:', error);
      toast({
        title: "خطأ في تحميل الفيديوهات",
        description: "تعذر تحميل الفيديوهات من قاعدة البيانات",
        variant: "destructive"
      });
    }
  };

  // Fetch books from Turso
  const fetchBooks = async () => {
    try {
      const result = await turso.execute("SELECT * FROM books");
      const formattedBooks = result.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        url: row.url,
        uploadDate: row.upload_date,
        grade: row.grade,
      }));
      setBooks(formattedBooks);
    } catch (error) {
      console.error('Error fetching books from Turso:', error);
      toast({
        title: "خطأ في تحميل الكتب",
        description: "تعذر تحميل الكتب من قاعدة البيانات",
        variant: "destructive"
      });
    }
  };

  // Add grade function
  const addGrade = async (
    studentId: string,
    studentName: string,
    examName: string,
    score: number,
    totalScore: number = 100,
    lessonNumber: number = 1,
    group: string = ""
  ) => {
    try {
      const id = generateId();
      const date = new Date().toISOString();
      const performanceIndicator = calculatePerformanceIndicator(score, totalScore);

      await turso.execute({
        sql: `INSERT INTO grades (id, student_id, student_name, exam_name, score, total_score, 
              lesson_number, group_name, performance_indicator, date) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [id, studentId, studentName, examName, score, totalScore, lessonNumber, group, performanceIndicator, date]
      });

      const newGrade: Grade = {
        id,
        studentId,
        studentName,
        examName,
        score,
        totalScore,
        lessonNumber,
        group,
        performanceIndicator,
        date
      };

      setGrades(prevGrades => [...prevGrades, newGrade]);
      
      toast({
        title: "✅ تم إضافة الدرجة بنجاح",
        description: `تم إضافة درجة ${examName} للطالب ${studentName}`
      });
      
      return newGrade;
    } catch (error: any) {
      console.error('Error adding grade:', error);
      toast({
        title: "❌ خطأ في إضافة الدرجة",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
      return null;
    }
  };

  // Update grade function
  const updateGrade = async (
    gradeId: string,
    examName: string,
    score: number,
    totalScore: number,
    lessonNumber: number = 1,
    group: string = ""
  ) => {
    try {
      const performanceIndicator = calculatePerformanceIndicator(score, totalScore);
      
      await turso.execute({
        sql: `
          UPDATE grades 
          SET exam_name = ?, score = ?, total_score = ?, lesson_number = ?, group_name = ?, performance_indicator = ?
          WHERE id = ?
        `,
        args: [examName, score, totalScore, lessonNumber, group, performanceIndicator, gradeId]
      });
      
      setGrades(prevGrades => prevGrades.map(grade => 
        grade.id === gradeId ? {
          ...grade,
          examName,
          score,
          totalScore,
          lessonNumber,
          group,
          performanceIndicator
        } : grade
      ));
      
      toast({
        title: "✅ تم تحديث الدرجة بنجاح",
        description: `تم تحديث درجة ${examName}`
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating grade:', error);
      toast({
        title: "❌ خطأ في تحديث الدرجة",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
      return false;
    }
  };

  // Add video function
  const addVideo = async (title: string, url: string, grade: "first" | "second" | "third", isYouTube: boolean = false, password?: string, blockedStudents: string[] = []) => {
    console.log("🎬 بدء إضافة فيديو جديد:", { title, url, grade, isYouTube, hasPassword: !!password, blockedStudentsCount: blockedStudents.length });

    // اختبار دالة توليد المعرف أولاً
    const idTest = testGenerateId();
    if (!idTest.success) {
      throw new Error("فشل في توليد معرف الفيديو: " + idTest.error?.message);
    }
    console.log("✅ اختبار توليد المعرف نجح");

    try {
      // فحص حالة قاعدة البيانات أولاً
      console.log("🔍 فحص حالة قاعدة البيانات...");
      const dbStatus = await checkDatabaseStatus();
      console.log("📊 حالة قاعدة البيانات:", dbStatus);

      if (!dbStatus.success) {
        throw new Error(`خطأ في قاعدة البيانات: ${dbStatus.message}`);
      }

      // التأكد من وجود الأعمدة المطلوبة قبل الإدراج
      console.log("🔧 التحقق من عمود كلمة المرور...");
      const columnResult = await addVideoPasswordColumn();
      console.log("📝 نتيجة إضافة عمود كلمة المرور:", columnResult);

      console.log("🔧 التحقق من عمود الطلاب المحظورين...");
      const blockedStudentsColumnResult = await addBlockedStudentsColumn();
      console.log("📝 نتيجة إضافة عمود الطلاب المحظورين:", blockedStudentsColumnResult);

      console.log("🆔 توليد معرف الفيديو...");
      const id = generateId();
      console.log("✅ تم توليد المعرف:", id);

      const uploadDate = new Date().toISOString();

      console.log("💾 إدراج الفيديو في قاعدة البيانات...");
      const blockedStudentsJson = JSON.stringify(blockedStudents);
      console.log("📋 بيانات الإدراج:", { id, title, url, grade, isYouTube, password: password ? '[محمي]' : null, blockedStudentsCount: blockedStudents.length, uploadDate });

      let insertResult;
      try {
        // محاولة الإدراج مع جميع الأعمدة
        insertResult = await turso.execute({
          sql: `
            INSERT INTO videos (id, title, url, grade, is_youtube, video_password, blocked_students, upload_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [id, title, url, grade, isYouTube, password || null, blockedStudentsJson, uploadDate]
        });
        console.log("✅ نجح الإدراج مع جميع الأعمدة");
      } catch (insertError: any) {
        if (insertError.message?.includes("no such column: video_password")) {
          console.log("⚠️ عمود كلمة المرور غير موجود - محاولة الإدراج بدونه...");
          // محاولة الإدراج بدون عمود كلمة المرور
          insertResult = await turso.execute({
            sql: `
              INSERT INTO videos (id, title, url, grade, is_youtube, upload_date)
              VALUES (?, ?, ?, ?, ?, ?)
            `,
            args: [id, title, url, grade, isYouTube, uploadDate]
          });
          console.log("✅ نجح الإدراج بدون عمود كلمة المرور");

          // محاولة إضافة العمود للمرة القادمة
          setTimeout(async () => {
            try {
              await addVideoPasswordColumn();
              console.log("🔧 تم إضافة عمود كلمة المرور للمرة القادمة");
            } catch (e) {
              console.log("⚠️ لم يتم إضافة عمود كلمة المرور:", e);
            }
          }, 1000);
        } else {
          throw insertError;
        }
      }

      console.log("✅ نتيجة الإدراج:", insertResult);

      const newVideo: Video = {
        id,
        title,
        url,
        grade,
        isYouTube,
        password,
        blockedStudents,
        uploadDate
      };

      setVideos(prevVideos => [...prevVideos, newVideo]);

      toast({
        title: "✅ تم إضافة الفيديو بنجاح",
        description: `تم إضافة الفيديو: ${title}`
      });
      
      return newVideo;
    } catch (error: any) {
      console.error('Error adding video:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        videoData: { title, url, grade, isYouTube, password: password ? '[PROTECTED]' : 'none' }
      });

      // معالجة أخطاء قاعدة البيانات المختلفة
      let errorMessage = "حدث خطأ غير متوقع";
      let shouldRetry = false;

      if (error.message?.includes("no such column: video_password")) {
        console.log("🔧 خطأ في العمود - محاولة إعادة إنشاء الجدول...");
        try {
          const recreateResult = await recreateVideosTable();
          console.log("🔄 نتيجة إعادة الإنشاء:", recreateResult);

          if (recreateResult.success) {
            errorMessage = "تم إصلاح قاعدة البيانات. يرجى المحاولة مرة أخرى.";
            shouldRetry = true;
          } else {
            errorMessage = "فشل في إصلاح قاعدة البيانات.";
          }
        } catch (recreateError) {
          console.error("❌ خطأ في إعادة الإنشاء:", recreateError);
          errorMessage = "خطأ في بنية قاعدة البيانات. يرجى الاتصال بالدعم الفني.";
        }
      } else if (error.message?.includes("no such table: videos")) {
        console.log("🏗️ الجدول غير موجود - إنشاء الجداول...");
        try {
          await createTables();
          errorMessage = "تم إنشاء الجداول. يرجى المحاولة مرة أخرى.";
          shouldRetry = true;
        } catch (createError) {
          console.error("❌ خطأ في إنشاء الجداول:", createError);
          errorMessage = "فشل في إنشاء الجداول.";
        }
      } else if (error.message?.includes("UNIQUE constraint failed")) {
        errorMessage = "هذا الفيديو موجود بالفعل";
      } else if (error.message?.includes("database is locked")) {
        errorMessage = "قاعدة البيانات مشغولة. يرجى المحاولة مرة أخرى.";
        shouldRetry = true;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // إضافة معلومات إضافية للمطور
      if (shouldRetry) {
        errorMessage += "\n\n💡 نصيحة: انقر على 'إضافة الفيديو' مرة أخرى.";
      }

      toast({
        title: "❌ خطأ في إضافة الفيديو",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  };

  // Update video function
  const updateVideo = async (
    videoId: string,
    title: string,
    url: string,
    grade: "first" | "second" | "third",
    isYouTube: boolean = false,
    password?: string,
    blockedStudents: string[] = []
  ) => {
    try {
      // التأكد من وجود الأعمدة المطلوبة قبل التحديث
      await addVideoPasswordColumn();
      await addBlockedStudentsColumn();

      const blockedStudentsJson = JSON.stringify(blockedStudents);

      await turso.execute({
        sql: `
          UPDATE videos
          SET title = ?, url = ?, grade = ?, is_youtube = ?, video_password = ?, blocked_students = ?
          WHERE id = ?
        `,
        args: [title, url, grade, isYouTube, password || null, blockedStudentsJson, videoId]
      });

      setVideos(prevVideos => prevVideos.map(video =>
        video.id === videoId ? {
          ...video,
          title,
          url,
          grade,
          isYouTube,
          password,
          blockedStudents
        } : video
      ));

      toast({
        title: "✅ تم تحديث الفيديو بنجاح",
        description: `تم تحديث الفيديو: ${title}`
      });

      return true;
    } catch (error: any) {
      console.error('Error updating video:', error);
      toast({
        title: "❌ خطأ في تحديث الفيديو",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
      return false;
    }
  };

  // Add attendance function
  const addAttendance = async (
    studentId: string,
    studentName: string,
    status: "present" | "absent" = "present",
    lessonNumber: number = 1
  ) => {
    try {
      const id = generateId();
      const currentTime = new Date();
      const time = currentTime.toLocaleTimeString();
      const date = currentTime.toISOString();

      await turso.execute({
        sql: `
          INSERT INTO attendance (id, student_id, student_name, status, lesson_number, time, date)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [id, studentId, studentName, status, lessonNumber, time, date]
      });

      const newAttendance: Attendance = {
        id,
        studentId,
        studentName,
        status,
        lessonNumber,
        time,
        date
      };
      
      setAttendance(prevAttendance => [...prevAttendance, newAttendance]);
      
      return newAttendance;
    } catch (error: any) {
      console.error('Error adding attendance:', error);
      toast({
        title: "❌ خطأ في تسجيل الحضور",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
      return null;
    }
  };

  // Add book function
  const addBook = async (
    title: string,
    url: string,
    grade: "first" | "second" | "third"
  ) => {
    try {
      const id = generateId();
      const uploadDate = new Date().toISOString();

      await turso.execute({
        sql: `INSERT INTO books (id, title, url, grade, upload_date) VALUES (?, ?, ?, ?, ?)`,
        args: [id, title, url, grade, uploadDate]
      });

      const newBook: Book = {
        id,
        title,
        url,
        grade,
        uploadDate
      };
      
      setBooks(prevBooks => [...prevBooks, newBook]);
      
      toast({
        title: "✅ تم إضافة الكتاب بنجاح",
        description: `تم إضافة الكتاب: ${title}`
      });
      
      return newBook;
    } catch (error: any) {
      console.error('Error adding book:', error);
      toast({
        title: "❌ خطأ في إضافة الكتاب",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
      return null;
    }
  };

  // Update book function
  const updateBook = async (
    bookId: string, 
    title: string, 
    url: string, 
    grade: "first" | "second" | "third"
  ) => {
    try {
      await turso.execute({
        sql: `UPDATE books SET title = ?, url = ?, grade = ? WHERE id = ?`,
        args: [title, url, grade, bookId]
      });
      
      setBooks(prevBooks => prevBooks.map(book => 
        book.id === bookId ? {
          ...book,
          title,
          url,
          grade
        } : book
      ));
      
      toast({
        title: "✅ تم تحديث الكتاب بنجاح",
        description: `تم تحديث الكتاب: ${title}`
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating book:', error);
      toast({
        title: "❌ خطأ في تحديث الكتاب",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
      return false;
    }
  };

  // Delete book function
  const deleteBook = async (bookId: string) => {
    try {
      await turso.execute({
        sql: "DELETE FROM books WHERE id = ?",
        args: [bookId]
      });

      setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));

      toast({
        title: "✅ تم حذف الكتاب بنجاح",
        description: "تم حذف الكتاب من النظام"
      });
    } catch (error: any) {
      console.error("Error deleting book:", error);
      toast({
        title: "❌ خطأ في حذف الكتاب",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
    }
  };

  return (
    <DataContext.Provider value={{
      grades,
      videos,
      books,
      attendance,
      fetchGrades,
      fetchVideos,
      fetchBooks,
      fetchAttendance,
      getStudentGrades,
      getVideosByGrade,
      getAllVideos,
      getStudentAttendance,
      getStudentLessonCount,
      getNextLessonNumber,
      getDisplayLessonNumber,
      registerBulkAbsence,
      deleteAttendanceRecord,
      deleteGrade,
      deleteVideo,
      addGrade,
      updateGrade,
      addVideo,
      updateVideo,
      addAttendance,
      addBook,
      updateBook,
      deleteBook,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
