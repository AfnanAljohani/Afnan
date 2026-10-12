// اتصال بسيط بـ Supabase عن طريق REST، بدون مكتبات
(function () {
  const cfg = window.ATTENDANCE_CONFIG || {};
  const ready = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);

  async function call(path, { method = "GET", body } = {}) {
    const res = await fetch(cfg.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/" + path, {
      method,
      headers: {
        apikey: cfg.SUPABASE_ANON_KEY,
        Authorization: "Bearer " + cfg.SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error((data && data.message) || "صار خطأ في الاتصال، حاول مرة ثانية");
    return data;
  }

  // ساعة الرياض بغض النظر عن توقيت الجهاز
  function riyadhNow() {
    const p = Object.fromEntries(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Riyadh", hour12: false,
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      }).formatToParts(new Date()).map((x) => [x.type, x.value])
    );
    return {
      date: `${p.year}-${p.month}-${p.day}`,
      minutes: (+p.hour % 24) * 60 + +p.minute + +p.second / 60,
    };
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
    ready, call, riyadhNow, toMin, lectureState, fmtTime,
    loadSchedule: async () => {
      const [lectures, settings] = await Promise.all([
        call("lectures?select=*&order=starts_at"),
        call("settings?select=*&id=eq.1"),
      ]);
      lectures.forEach((l) => { l.starts_at = l.starts_at.slice(0, 5); l.ends_at = l.ends_at.slice(0, 5); });
      return { lectures, settings: settings[0] };
    },
  };
})();
