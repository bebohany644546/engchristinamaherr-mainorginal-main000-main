// اختبار منطق ترقيم الحصص الدائري
// هذا الملف للاختبار فقط ويمكن حذفه بعد التأكد من صحة النظام

// محاكاة دالة getDisplayLessonNumber
function getDisplayLessonNumber(rawLessonNumber) {
  return ((rawLessonNumber - 1) % 8) + 1;
}

// محاكاة دالة getNextLessonNumber
function getNextLessonNumber(studentAttendance) {
  if (studentAttendance.length === 0) {
    return 1; // أول حصة
  }
  
  // الحصول على أعلى رقم حصة للطالب
  const maxLessonNumber = Math.max(...studentAttendance.map(record => record.lessonNumber));
  
  // حساب رقم الحصة التالية
  const nextRawNumber = maxLessonNumber + 1;
  return nextRawNumber;
}

// اختبار السيناريوهات المختلفة
console.log("=== اختبار ترقيم الحصص الدائري ===");

// سيناريو 1: طالب جديد (لا يوجد سجل حضور سابق)
console.log("\n1. طالب جديد:");
let studentAttendance = [];
let nextLesson = getNextLessonNumber(studentAttendance);
let displayLesson = getDisplayLessonNumber(nextLesson);
console.log(`   الحصة التالية: ${nextLesson}, العرض: ${displayLesson}`);

// سيناريو 2: طالب حضر 3 حصص
console.log("\n2. طالب حضر 3 حصص:");
studentAttendance = [
  { lessonNumber: 1 },
  { lessonNumber: 2 },
  { lessonNumber: 3 }
];
nextLesson = getNextLessonNumber(studentAttendance);
displayLesson = getDisplayLessonNumber(nextLesson);
console.log(`   الحصة التالية: ${nextLesson}, العرض: ${displayLesson}`);

// سيناريو 3: طالب حضر 7 حصص
console.log("\n3. طالب حضر 7 حصص:");
studentAttendance = [
  { lessonNumber: 1 },
  { lessonNumber: 2 },
  { lessonNumber: 3 },
  { lessonNumber: 4 },
  { lessonNumber: 5 },
  { lessonNumber: 6 },
  { lessonNumber: 7 }
];
nextLesson = getNextLessonNumber(studentAttendance);
displayLesson = getDisplayLessonNumber(nextLesson);
console.log(`   الحصة التالية: ${nextLesson}, العرض: ${displayLesson}`);

// سيناريو 4: طالب حضر 8 حصص (يجب أن يعود للحصة 1)
console.log("\n4. طالب حضر 8 حصص:");
studentAttendance = [
  { lessonNumber: 1 },
  { lessonNumber: 2 },
  { lessonNumber: 3 },
  { lessonNumber: 4 },
  { lessonNumber: 5 },
  { lessonNumber: 6 },
  { lessonNumber: 7 },
  { lessonNumber: 8 }
];
nextLesson = getNextLessonNumber(studentAttendance);
displayLesson = getDisplayLessonNumber(nextLesson);
console.log(`   الحصة التالية: ${nextLesson}, العرض: ${displayLesson}`);

// سيناريو 5: طالب حضر 16 حصة (دورتان كاملتان)
console.log("\n5. طالب حضر 16 حصة:");
studentAttendance = [];
for (let i = 1; i <= 16; i++) {
  studentAttendance.push({ lessonNumber: i });
}
nextLesson = getNextLessonNumber(studentAttendance);
displayLesson = getDisplayLessonNumber(nextLesson);
console.log(`   الحصة التالية: ${nextLesson}, العرض: ${displayLesson}`);

// اختبار عرض الحصص من 1 إلى 20
console.log("\n=== اختبار عرض الحصص من 1 إلى 20 ===");
for (let i = 1; i <= 20; i++) {
  const display = getDisplayLessonNumber(i);
  console.log(`الحصة ${i} → العرض: ${display}`);
}

console.log("\n=== انتهى الاختبار ===");
