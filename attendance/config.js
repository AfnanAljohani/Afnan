// بعد ما تسوين Deploy في Google Apps Script، الصقي رابط الـ Web app هنا
// (شكله: https://script.google.com/macros/s/.../exec)
window.ATTENDANCE_CONFIG = {
  SCRIPT_URL: "",

  // وضع التجربة (نفس الوقت اللي في google-apps-script.gs): يطلع شريط "وضع التجربة" لين هالوقت
  TEST_UNTIL: "2026-10-12T07:45:00+03:00",

  // للعرض في الصفحات بس. إذا غيرتي الأوقات، غيريها بعد في google-apps-script.gs
  OPEN_BEFORE_MIN: 10,
  CLOSE_AFTER_MIN: 20,
  LECTURES: [
    { num: 1, title: "المحاضرة الأولى",  starts_at: "08:00", ends_at: "08:50" },
    { num: 2, title: "المحاضرة الثانية", starts_at: "09:00", ends_at: "09:50" },
    { num: 3, title: "المحاضرة الثالثة", starts_at: "10:00", ends_at: "10:50" },
    { num: 4, title: "المحاضرة الرابعة", starts_at: "11:00", ends_at: "11:50" },
    { num: 5, title: "المحاضرة الخامسة", starts_at: "12:00", ends_at: "12:50" },
    { num: 6, title: "المحاضرة السادسة", starts_at: "13:00", ends_at: "13:50" },
  ],
};
