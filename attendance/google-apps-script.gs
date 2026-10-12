// نظام التحضير الذكي · أكاديمية الطاقة والمياه
// Made with Love by AFNAN aljohani
//
// الصقي هذا الملف كامل في script.google.com ← New project، وبعدين:
// Deploy ← New deployment ← Web app ← Execute as: Me ← Who has access: Anyone ← Deploy
// أول تسجيل بيسوي لك ملف Google Sheet اسمه "التحضير الذكي" في Drive حقك.

const CONFIG = {
  ACADEMY: { lat: 22.831133, lng: 39.028038 }, // موقع الأكاديمية
  RADIUS_M: 250,        // لازم يكون المتدرب داخل هالمسافة
  MAX_ACCURACY_M: 150,  // نرفض الموقع إذا دقة GPS أسوأ من كذا
  OPEN_BEFORE_MIN: 10,  // التحضير يفتح قبل المحاضرة بكم دقيقة
  CLOSE_AFTER_MIN: 20,  // ويقفل بعد بدايتها بكم دقيقة
  LATE_AFTER_MIN: 5,    // بعدها يعتبر متأخر
  ALWAYS_OPEN: false,   // خليها true للتجربة بس: التحضير يفتح أي وقت ويُحسب على المحاضرة الأولى
  LECTURES: [
    { num: 1, title: 'المحاضرة الأولى',  starts_at: '08:00' },
    { num: 2, title: 'المحاضرة الثانية', starts_at: '09:00' },
    { num: 3, title: 'المحاضرة الثالثة', starts_at: '10:00' },
    { num: 4, title: 'المحاضرة الرابعة', starts_at: '11:00' },
    { num: 5, title: 'المحاضرة الخامسة', starts_at: '12:00' },
    { num: 6, title: 'المحاضرة السادسة', starts_at: '13:00' },
  ],
};

const TZ = 'Asia/Riyadh';
const HEADERS = ['التاريخ', 'المحاضرة', 'الاسم', 'الرقم الأكاديمي', 'وقت التسجيل',
                 'الدقائق بعد البداية', 'الحالة', 'المسافة (م)', 'الجهاز'];

function doGet() {
  const today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
  const rows = getSheet_().getDataRange().getDisplayValues().slice(1)
    .filter((r) => r[0] === today)
    .map(toPublic_);
  return json_({ ok: true, rows: rows });
}

function doPost(e) {
  try {
    const b = JSON.parse(e.postData.contents);
    const name = String(b.name || '').trim().replace(/\s+/g, ' ');
    const aid = String(b.academic_id || '').trim().toUpperCase();
    const device = String(b.device || '').slice(0, 64);

    if (name.length < 2 || name.length > 80) return fail_('اكتب اسمك الكامل');
    if (!/^[0-9A-Z-]{3,20}$/.test(aid)) return fail_('الرقم الأكاديمي غير صحيح');
    if (typeof b.lat !== 'number' || typeof b.lng !== 'number') return fail_('لازم تسمح للموقع يوصل لمكانك');
    if (!(b.accuracy <= CONFIG.MAX_ACCURACY_M)) {
      return fail_('دقة الموقع ضعيفة (' + Math.round(b.accuracy || 9999) + ' م). شغّل GPS وحاول مرة ثانية');
    }
    const dist = distanceM_(b.lat, b.lng, CONFIG.ACADEMY.lat, CONFIG.ACADEMY.lng);
    if (dist > CONFIG.RADIUS_M) return fail_('أنت خارج موقع الأكاديمية (تبعد ' + Math.round(dist) + ' م)');

    const now = new Date();
    const today = Utilities.formatDate(now, TZ, 'yyyy-MM-dd');
    const nowMin = toMin_(Utilities.formatDate(now, TZ, 'HH:mm')) + now.getSeconds() / 60;
    const lec = currentLecture_(nowMin);
    if (!lec) {
      return fail_('التحضير مقفل الحين. يفتح قبل كل محاضرة بـ ' + CONFIG.OPEN_BEFORE_MIN +
                   ' دقائق ويقفل بعد بدايتها بـ ' + CONFIG.CLOSE_AFTER_MIN + ' دقيقة');
    }
    const mins = Math.max(0, Math.floor(nowMin - toMin_(lec.starts_at)));
    const status = mins > CONFIG.LATE_AFTER_MIN ? 'متأخر' : 'في الوقت';

    // قفل عشان تسجيلين بنفس اللحظة ما يتكررون
    const lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      const sh = getSheet_();
      const rows = sh.getDataRange().getDisplayValues().slice(1)
        .filter((r) => r[0] === today && Number(r[1]) === lec.num);
      const mine = rows.find((r) => r[3] === aid);
      if (mine) return json_(Object.assign({ ok: true, already: true, title: lec.title }, toPublic_(mine)));
      if (device && rows.some((r) => r[8] === device)) return fail_('هذا الجوال سجّل حضور شخص ثاني في هالمحاضرة');

      const row = [today, lec.num, name, aid, Utilities.formatDate(now, TZ, 'HH:mm:ss'),
                   mins, status, Math.round(dist), device];
      sh.appendRow(row);
      return json_(Object.assign({ ok: true, already: false, title: lec.title }, toPublic_(row.map(String))));
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return fail_('صار خطأ، حاول مرة ثانية');
  }
}

// ───────── أدوات ─────────

function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('SHEET_ID');
  if (id) {
    try { return SpreadsheetApp.openById(id).getSheets()[0]; } catch (e) {}
  }
  const ss = SpreadsheetApp.create('التحضير الذكي · AI Trainees');
  const sh = ss.getSheets()[0];
  sh.setName('الحضور');
  sh.setRightToLeft(true);
  sh.getRange('A:I').setNumberFormat('@'); // نص عشان التاريخ والوقت ما يتغيرون
  sh.appendRow(HEADERS);
  sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#d9f7ec');
  sh.setFrozenRows(1);
  props.setProperty('SHEET_ID', ss.getId());
  return sh;
}

function currentLecture_(nowMin) {
  const open = CONFIG.LECTURES.find((l) => nowMin >= toMin_(l.starts_at) - CONFIG.OPEN_BEFORE_MIN &&
                                           nowMin <= toMin_(l.starts_at) + CONFIG.CLOSE_AFTER_MIN);
  return open || (CONFIG.ALWAYS_OPEN ? CONFIG.LECTURES[0] : null);
}

// الشاشة تشوف الاسم والوقت بس، مو الرقم الأكاديمي
function toPublic_(r) {
  return {
    full_name: r[2],
    lecture: Number(r[1]),
    checked_in_at: r[0] + 'T' + r[4] + '+03:00',
    minutes_from_start: Number(r[5]),
    status: r[6] === 'متأخر' ? 'late' : 'on_time',
  };
}

function toMin_(hhmm) {
  const p = String(hhmm).split(':');
  return Number(p[0]) * 60 + Number(p[1]);
}

function distanceM_(lat1, lng1, lat2, lng2) {
  const rad = (d) => d * Math.PI / 180;
  const a = Math.pow(Math.sin(rad(lat2 - lat1) / 2), 2) +
            Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.pow(Math.sin(rad(lng2 - lng1) / 2), 2);
  return 2 * 6371000 * Math.asin(Math.sqrt(a));
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function fail_(message) {
  return json_({ ok: false, error: message });
}
