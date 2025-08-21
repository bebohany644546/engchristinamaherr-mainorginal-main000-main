
import { createClient } from '@libsql/client';

const TURSO_URL = "libsql://engchristinamaher-bebohany.aws-ap-northeast-1.turso.io";
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDgyNjA3NzIsImlkIjoiMmU3MWI2MTUtODVmOS00MmY1LWFiMTItMGY1YjJjZDAyNWQxIiwicmlkIjoiMTUwODIwODQtN2NlMC00MWFkLWI4YmItMDE1NTQwMzZhMTQ3In0.c9y7UFbJZQPk_6XxrI7O0sRiSHu8j4Ts7G9Im3gtUJB1AAkOCJ5gSKgWaNakIV0pF5WSdxprxbPb6uCoPrYcBQ";

export const turso = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

// وظائف مساعدة لقاعدة البيانات
export const createTables = async () => {
  try {
    // إنشاء جدول الطلاب
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        group_name TEXT,
        grade TEXT NOT NULL,
        password TEXT NOT NULL,
        phone TEXT NOT NULL,
        parent_phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // إنشاء جدول الحضور
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        date TEXT,
        time TEXT,
        status TEXT NOT NULL,
        lesson_number INTEGER NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);

    // إنشاء جدول الدرجات
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS grades (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        exam_name TEXT NOT NULL,
        score INTEGER NOT NULL,
        total_score INTEGER NOT NULL,
        date TEXT,
        lesson_number INTEGER NOT NULL,
        group_name TEXT,
        performance_indicator TEXT NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);

    // إنشاء جدول الفيديوهات
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS videos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        grade TEXT NOT NULL,
        is_youtube BOOLEAN DEFAULT FALSE,
        video_password TEXT,
        upload_date TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // إنشاء جدول الكتب
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        grade TEXT NOT NULL,
        upload_date TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // إنشاء جدول المدفوعات
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        student_code TEXT NOT NULL,
        student_group TEXT NOT NULL,
        month TEXT NOT NULL,
        date TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);

    // إنشاء جدول الأشهر المدفوعة
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS paid_months (
        id TEXT PRIMARY KEY,
        payment_id TEXT,
        month TEXT NOT NULL,
        date TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (payment_id) REFERENCES payments(id)
      )
    `);

    // إنشاء جدول الآباء
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS parents (
        id TEXT PRIMARY KEY,
        phone TEXT NOT NULL,
        student_code TEXT NOT NULL,
        student_name TEXT NOT NULL,
        password TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_code) REFERENCES students(code)
      )
    `);

    console.log("تم إنشاء جميع الجداول بنجاح");
  } catch (error) {
    console.error("خطأ في إنشاء الجداول:", error);
    throw error;
  }
};

// وظيفة لحذف جميع بيانات المدفوعات
export const deleteAllPaymentsData = async () => {
  try {
    await turso.execute("DELETE FROM paid_months");
    await turso.execute("DELETE FROM payments");
    return { success: true };
  } catch (error) {
    console.error("خطأ في حذف بيانات المدفوعات:", error);
    return { success: false, error };
  }
};

// وظيفة لإضافة عمود كلمة مرور الفيديو إلى الجدول الحالي
export const addVideoPasswordColumn = async () => {
  try {
    console.log("🔍 فحص وجود جدول الفيديوهات...");

    // التحقق من وجود الجدول أولاً
    const tablesResult = await turso.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='videos'");
    if (!tablesResult.rows || tablesResult.rows.length === 0) {
      console.log("⚠️ جدول الفيديوهات غير موجود، سيتم إنشاؤه عند الحاجة");
      return { success: true, message: "الجدول غير موجود" };
    }

    console.log("✅ جدول الفيديوهات موجود");

    // التحقق من وجود العمود
    console.log("🔍 فحص أعمدة الجدول...");
    const tableInfo = await turso.execute("PRAGMA table_info(videos)");
    console.log("📋 أعمدة الجدول الحالية:", tableInfo.rows.map((row: any) => row.name));

    const hasPasswordColumn = tableInfo.rows.some((row: any) => row.name === 'video_password');

    if (!hasPasswordColumn) {
      console.log("🔧 إضافة عمود كلمة المرور...");
      await turso.execute("ALTER TABLE videos ADD COLUMN video_password TEXT");
      console.log("✅ تم إضافة عمود كلمة مرور الفيديو بنجاح");
      return { success: true, message: "تم إضافة العمود" };
    } else {
      console.log("✅ عمود كلمة مرور الفيديو موجود بالفعل");
      return { success: true, message: "العمود موجود" };
    }
  } catch (error: any) {
    console.error("❌ خطأ في إضافة عمود كلمة مرور الفيديو:", error);

    // تجاهل الخطأ إذا كان العمود موجود بالفعل
    if (error.message?.includes("duplicate column name") ||
        error.message?.includes("column name is not unique")) {
      console.log("✅ عمود كلمة مرور الفيديو موجود بالفعل (من الخطأ)");
      return { success: true, message: "العمود موجود (duplicate)" };
    }

    return { success: false, error, message: error.message };
  }
};

// وظيفة لإضافة عمود الطلاب المحظورين إلى جدول الفيديوهات
export const addBlockedStudentsColumn = async () => {
  try {
    console.log("🔍 فحص وجود جدول الفيديوهات...");

    // التحقق من وجود الجدول أولاً
    const tablesResult = await turso.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='videos'");
    if (!tablesResult.rows || tablesResult.rows.length === 0) {
      console.log("⚠️ جدول الفيديوهات غير موجود، سيتم إنشاؤه عند الحاجة");
      return { success: true, message: "الجدول غير موجود" };
    }

    console.log("✅ جدول الفيديوهات موجود");

    // التحقق من وجود العمود
    console.log("🔍 فحص أعمدة الجدول...");
    const tableInfo = await turso.execute("PRAGMA table_info(videos)");
    console.log("📋 أعمدة الجدول الحالية:", tableInfo.rows.map((row: any) => row.name));

    const hasBlockedStudentsColumn = tableInfo.rows.some((row: any) => row.name === 'blocked_students');

    if (!hasBlockedStudentsColumn) {
      console.log("🔧 إضافة عمود الطلاب المحظورين...");
      await turso.execute("ALTER TABLE videos ADD COLUMN blocked_students TEXT");
      console.log("✅ تم إضافة عمود الطلاب المحظورين بنجاح");
      return { success: true, message: "تم إضافة العمود" };
    } else {
      console.log("✅ عمود الطلاب المحظورين موجود بالفعل");
      return { success: true, message: "العمود موجود" };
    }
  } catch (error: any) {
    console.error("❌ خطأ في إضافة عمود الطلاب المحظورين:", error);

    // تجاهل الخطأ إذا كان العمود موجود بالفعل
    if (error.message?.includes("duplicate column name") ||
        error.message?.includes("column name is not unique")) {
      console.log("✅ عمود الطلاب المحظورين موجود بالفعل (من الخطأ)");
      return { success: true, message: "العمود موجود (duplicate)" };
    }

    return { success: false, error, message: error.message };
  }
};

// وظيفة لإعادة إنشاء جدول الفيديوهات مع العمود الجديد (للطوارئ فقط)
export const recreateVideosTable = async () => {
  try {
    // إنشاء جدول مؤقت بالبنية الجديدة
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS videos_new (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        grade TEXT NOT NULL,
        is_youtube BOOLEAN DEFAULT FALSE,
        video_password TEXT,
        upload_date TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // نسخ البيانات من الجدول القديم
    await turso.execute(`
      INSERT INTO videos_new (id, title, url, grade, is_youtube, upload_date)
      SELECT id, title, url, grade, is_youtube, upload_date FROM videos
    `);

    // حذف الجدول القديم
    await turso.execute("DROP TABLE videos");

    // إعادة تسمية الجدول الجديد
    await turso.execute("ALTER TABLE videos_new RENAME TO videos");

    console.log("تم إعادة إنشاء جدول الفيديوهات بنجاح");
    return { success: true };
  } catch (error) {
    console.error("خطأ في إعادة إنشاء جدول الفيديوهات:", error);
    return { success: false, error };
  }
};

// وظيفة للتحقق من حالة قاعدة البيانات
export const checkDatabaseStatus = async () => {
  try {
    // التحقق من وجود جدول الفيديوهات
    const tablesResult = await turso.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='videos'");
    const hasVideosTable = tablesResult.rows && tablesResult.rows.length > 0;

    if (!hasVideosTable) {
      return {
        success: false,
        message: "جدول الفيديوهات غير موجود",
        hasTable: false,
        hasPasswordColumn: false
      };
    }

    // التحقق من وجود عمود كلمة المرور
    const tableInfo = await turso.execute("PRAGMA table_info(videos)");
    const hasPasswordColumn = tableInfo.rows.some((row: any) => row.name === 'video_password');

    return {
      success: true,
      message: "قاعدة البيانات في حالة جيدة",
      hasTable: true,
      hasPasswordColumn,
      columns: tableInfo.rows.map((row: any) => row.name)
    };
  } catch (error) {
    console.error("خطأ في فحص قاعدة البيانات:", error);
    return {
      success: false,
      message: "خطأ في فحص قاعدة البيانات",
      error: error
    };
  }
};

// وظيفة لتوليد معرف فريد
export const generateId = () => {
  try {
    // استخدام crypto.randomUUID إذا كان متوفراً
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch (error) {
    console.log("crypto.randomUUID غير متوفر، استخدام طريقة احتياطية");
  }

  // طريقة احتياطية لتوليد UUID
  try {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  } catch (error) {
    // طريقة احتياطية أبسط
    console.warn("استخدام طريقة توليد ID احتياطية");
    return 'video_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
};

// اختبار دالة توليد المعرف
export const testGenerateId = () => {
  try {
    const id = generateId();
    console.log("✅ تم توليد معرف بنجاح:", id);
    return { success: true, id };
  } catch (error) {
    console.error("❌ خطأ في توليد المعرف:", error);
    return { success: false, error };
  }
};
