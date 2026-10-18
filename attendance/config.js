// إعدادات التحضير · Made with Love by AFNAN aljohani
window.ATTENDANCE_CONFIG = {
  // الحضور يمر عبر ntfy.sh (مجاني وبدون حساب). الرسائل تنحذف بعد 12 ساعة،
  // فنزّلي ملف Excel من شاشة العرض آخر اليوم.
  NTFY_TOPIC: "ewa-ai-att-3fn8tnl3mge9",

  // اختياري: إذا سويتي Google Apps Script، حطي رابط /exec هنا وبيصير هو المستخدم بدل ntfy
  SCRIPT_URL: "",

  // وضع التجربة: التحضير مفتوح أي وقت ومن أي مكان لين هالوقت (توقيت الرياض)، وبعدها يطفي لحاله
  TEST_UNTIL: "2026-10-12T07:45:00+03:00",

  // كلمة سر لوحة الأدمن (admin.html) محفوظة كـ SHA-256. الحالية: ewa2026
  // لتغييرها: اكتبي في Terminal:  printf '%s' 'كلمتك' | shasum -a 256  وحطي الناتج هنا
  ADMIN_PASS_SHA256: "ac40449ad25fc2769b3299a43faeac42568822e19d64fd4e59c90a907b6e1ca5",

  ACADEMY: { lat: 22.831133, lng: 39.028038 }, // موقع الحرم الأكاديمي (أكاديمية الطاقة والمياه)
  RADIUS_M: 250,        // لازم يكون المتدرب داخل هالمسافة
  MAX_ACCURACY_M: 150,  // نرفض الموقع إذا دقة GPS أسوأ من كذا

  OPEN_BEFORE_MIN: 10,  // التحضير يفتح قبل المحاضرة بكم دقيقة
  CLOSE_AFTER_MIN: 20,  // ويقفل بعد بدايتها بكم دقيقة
  LATE_AFTER_MIN: 5,    // بعدها يعتبر متأخر

  LECTURES: [
    { num: 1, title: "المحاضرة الأولى",  starts_at: "08:00", ends_at: "08:50" },
    { num: 2, title: "المحاضرة الثانية", starts_at: "09:00", ends_at: "09:50" },
    { num: 3, title: "المحاضرة الثالثة", starts_at: "10:00", ends_at: "10:50" },
    { num: 4, title: "المحاضرة الرابعة", starts_at: "11:00", ends_at: "11:50" },
    { num: 5, title: "المحاضرة الخامسة", starts_at: "12:00", ends_at: "12:50" },
    { num: 6, title: "المحاضرة السادسة", starts_at: "13:00", ends_at: "13:50" },
  ],
};
