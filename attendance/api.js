// اتصال بـ Google Apps Script (الحضور ينحفظ في Google Sheet)
(function () {
  const cfg = window.ATTENDANCE_CONFIG || {};
  const ready = Boolean(cfg.SCRIPT_URL);

  async function request(options) {
    let res;
    try {
      res = await fetch(cfg.SCRIPT_URL + (options ? "" : "?t=" + Date.now()), options);
    } catch {
      throw new Error("ما قدرنا نوصل للسيرفر. تأكد من الإنترنت وحاول مرة ثانية");
    }
    const data = await res.json().catch(() => null);
    if (!data) throw new Error("صار خطأ في الاتصال، حاول مرة ثانية");
    if (!data.ok) throw new Error(data.error);
    return data;
  }

  // ساعة الرياض بغض النظر عن توقيت الجهاز
  function riyadhNow() {
    const p = Object.fromEntries(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Riyadh", hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit",
      }).formatToParts(new Date()).map((x) => [x.type, x.value])
    );
    return { minutes: (+p.hour % 24) * 60 + +p.minute + +p.second / 60 };
  }

  const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };

  // وش المحاضرة اللي التحضير لها مفتوح الحين (أو الجاية)
  function lectureState(lectures, s) {
    const now = riyadhNow().minutes;
    for (const l of lectures) {
      const start = toMin(l.starts_at);
      if (now >= start - s.open_before_min && now <= start + s.close_after_min) {
        return { kind: "open", lecture: l, closesIn: Math.ceil(start + s.close_after_min - now) };
      }
    }
    const next = lectures.find((l) => toMin(l.starts_at) - s.open_before_min > now);
    if (next) return { kind: "wait", lecture: next, opensIn: Math.ceil(toMin(next.starts_at) - s.open_before_min - now) };
    return { kind: "done" };
  }

  const fmtTime = (iso) =>
    new Date(iso).toLocaleTimeString("ar-SA-u-nu-latn", { timeZone: "Asia/Riyadh", hour: "numeric", minute: "2-digit" });

  window.Att = {
    ready, lectureState, fmtTime,
    loadSchedule: async () => ({
      lectures: cfg.LECTURES || [],
      settings: { open_before_min: cfg.OPEN_BEFORE_MIN ?? 10, close_after_min: cfg.CLOSE_AFTER_MIN ?? 20 },
    }),
    today: async () => (await request()).rows,
    // text/plain عشان المتصفح ما يرسل طلب CORS إضافي لـ Google
    checkIn: (body) => request({
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
    }),
  };
})();
