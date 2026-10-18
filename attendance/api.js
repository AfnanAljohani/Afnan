// اتصال التحضير: ntfy.sh (بدون حساب)، أو Google Apps Script إذا انحط SCRIPT_URL
(function () {
  const cfg = window.ATTENDANCE_CONFIG || {};
  const useScript = Boolean(cfg.SCRIPT_URL);
  const ready = useScript || Boolean(cfg.NTFY_TOPIC);
  const NTFY = "https://ntfy.sh/" + cfg.NTFY_TOPIC;
  const lectures = cfg.LECTURES || [];
  const roster = window.ATT_ROSTER || [];
  const groups = window.ATT_GROUPS || {};
  const AID_RE = /^WP\d{6,8}$/; // الرقم الأكاديمي: WP وبعده أرقام
  const T = (k, v) => (window.I18N ? I18N.t(k, v) : k);
  const fail = (k, v) => new Error(T(k, v));

  // توحيد الكتابة العربية للبحث والمطابقة (أ إ آ ← ا، ة ← ه، ى ← ي)
  const norm = (s) => String(s || "").replace(/[\u064B-\u0652\u0640]/g, "").replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/\s+/g, " ").trim().toLowerCase();
  const byName = new Map(roster.map((r) => [norm(r.ar), r]));
  const byEn = new Map(roster.filter((r) => r.en).map((r) => [norm(r.en), r]));
  const findStudent = (name) => byName.get(norm(name)) || byEn.get(norm(name)) || null;
  const isEn = () => window.I18N && I18N.lang === "en";
  // الاسم حسب اللغة: بالإنجليزي من السجل إذا موجود
  const displayName = (name) => { const st = isEn() && findStudent(name); return (st && st.en) || name; };
  const studentName = (st) => (isEn() && st.en) || st.ar;
  const lecTitle = (l) => (l ? T("lecture", { n: l.num, ar: l.title }) : "");
  // بحث بالعربي أو الإنجليزي، كل كلمة لازم تكون موجودة
  function searchRoster(q) {
    const words = norm(q).split(" ").filter(Boolean);
    if (!words.length) return [];
    return roster.filter((r) => { const n = norm(r.ar) + " " + norm(r.en); return words.every((w) => n.includes(w)); });
  }

  // صفحة المتدرب ما تعرض قائمة أسماء: يكتب اسمه (الأول + اسم ثاني على الأقل) ونطابقه بكلمات كاملة،
  // فما يقدر أحد يدوّر بحرفين ويشوف أسماء غيره
  function matchName(q) {
    const words = norm(q).split(" ").filter(Boolean);
    if (words.length < 2) return { kind: "short" };
    const exact = findStudent(q);
    if (exact) return { kind: "one", student: exact };
    const hits = roster.filter((r) => {
      const ws = new Set((norm(r.ar) + " " + norm(r.en)).split(" "));
      return words.every((w) => ws.has(w));
    });
    return hits.length === 1 ? { kind: "one", student: hits[0] } : { kind: hits.length ? "many" : "none" };
  }

  // ───────── الوقت ─────────

  // تاريخ ودقائق الرياض لأي لحظة (افتراضيًا الحين)
  function riyadh(ms = Date.now()) {
    const p = Object.fromEntries(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Riyadh", hour12: false,
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      }).formatToParts(new Date(ms)).map((x) => [x.type, x.value])
    );
    return { date: `${p.year}-${p.month}-${p.day}`, minutes: (+p.hour % 24) * 60 + +p.minute + +p.second / 60 };
  }

  const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  const testing = (ms = Date.now()) => Boolean(cfg.TEST_UNTIL) && ms < new Date(cfg.TEST_UNTIL).getTime();
  const openLecture = (min) => lectures.find((l) =>
    min >= toMin(l.starts_at) - cfg.OPEN_BEFORE_MIN && min <= toMin(l.starts_at) + cfg.CLOSE_AFTER_MIN);

  // وش المحاضرة اللي التحضير لها مفتوح الحين (أو الجاية)
  function lectureState() {
    const now = riyadh().minutes;
    const open = openLecture(now);
    if (testing() && lectures.length) return { kind: "open", lecture: open || lectures[0], test: true };
    if (open) return { kind: "open", lecture: open, closesIn: Math.ceil(toMin(open.starts_at) + cfg.CLOSE_AFTER_MIN - now) };
    const next = lectures.find((l) => toMin(l.starts_at) - cfg.OPEN_BEFORE_MIN > now);
    if (next) return { kind: "wait", lecture: next, opensIn: Math.ceil(toMin(next.starts_at) - cfg.OPEN_BEFORE_MIN - now) };
    return { kind: "done" };
  }

  function distanceM(lat, lng) {
    const rad = (d) => d * Math.PI / 180, a0 = cfg.ACADEMY;
    const a = Math.sin(rad(lat - a0.lat) / 2) ** 2 +
              Math.cos(rad(a0.lat)) * Math.cos(rad(lat)) * Math.sin(rad(lng - a0.lng) / 2) ** 2;
    return 2 * 6371000 * Math.asin(Math.sqrt(a));
  }

  const locale = () => (window.I18N ? I18N.locale() : "ar-SA-u-ca-gregory-nu-latn");
  const fmtTime = (iso) =>
    new Date(iso).toLocaleTimeString(locale(), { timeZone: "Asia/Riyadh", hour: "numeric", minute: "2-digit" });

  // ───────── الشبكة ─────────

  async function http(url, options) {
    let res;
    try { res = await fetch(url, options); } catch {
      throw fail("err.network");
    }
    if (res.status === 429) throw fail("err.busy");
    if (!res.ok && !useScript) throw fail("err.generic");
    return res;
  }

  // يحوّل رسائل ntfy لسجلات حضور. وقت الرسالة من سيرفر ntfy، فتغيير ساعة الجوال ما يفيد.
  function toRecords(messages) {
    const today = riyadh().date, nowTesting = testing();
    const seenId = new Set(), seenDevice = new Set(), out = [];
    messages.sort((a, b) => a.time - b.time);
    for (const m of messages) {
      let b;
      try { b = JSON.parse(m.message); } catch { continue; }
      if (!b || b.v !== 1) continue;
      const ms = m.time * 1000, t = riyadh(ms), test = testing(ms);
      if (t.date !== today || test !== nowTesting) continue;
      const name = String(b.name || "").trim().replace(/\s+/g, " ");
      const aid = String(b.academic_id || "").trim().toUpperCase();
      if (name.length < 2 || name.length > 80 || !AID_RE.test(aid)) continue;
      const lec = openLecture(t.minutes) || (test ? lectures[0] : null);
      if (!lec) continue;
      if (!test && !(b.distance <= cfg.RADIUS_M && b.accuracy <= cfg.MAX_ACCURACY_M)) continue;
      const key = lec.num + "|" + aid, dkey = lec.num + "|" + b.device;
      if (seenId.has(key) || (b.device && seenDevice.has(dkey))) continue; // أول تسجيل بس
      seenId.add(key); if (b.device) seenDevice.add(dkey);
      const mins = Math.max(0, Math.floor(t.minutes - toMin(lec.starts_at)));
      out.push({
        full_name: name, academic_id: aid, lecture: lec.num, title: lec.title,
        checked_in_at: new Date(ms).toISOString(), minutes_from_start: mins,
        status: !test && mins > cfg.LATE_AFTER_MIN ? "late" : "on_time",
        distance: Math.round(b.distance), test, device: b.device || "",
      });
    }
    return out;
  }

  async function ntfyToday() {
    const now = Date.now(), since = Math.floor((now - riyadh(now).minutes * 60000) / 1000) - 60;
    const text = await (await http(`${NTFY}/json?poll=1&since=${since}`)).text();
    const msgs = text.split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } })
      .filter((m) => m && m.event === "message");
    return toRecords(msgs);
  }

  let lastRows = null;

  async function ntfyCheckIn(body) {
    const test = testing();
    const dist = distanceM(body.lat, body.lng);
    if (!test && !(body.accuracy <= cfg.MAX_ACCURACY_M)) {
      throw fail("err.accuracy", { m: Math.round(body.accuracy || 9999) });
    }
    if (!test && dist > cfg.RADIUS_M) throw fail("err.outside", { m: Math.round(dist) });
    const now = riyadh();
    const lec = openLecture(now.minutes) || (test ? lectures[0] : null);
    if (!lec) throw fail("err.closed", { o: cfg.OPEN_BEFORE_MIN, c: cfg.CLOSE_AFTER_MIN });

    const aid = String(body.academic_id || "").trim().toUpperCase();
    const name = String(body.name || "").trim().replace(/\s+/g, " ");
    if (name.length < 2 || name.length > 80) throw fail("err.fullName");
    if (!AID_RE.test(aid)) throw fail("err.aid");
    if (roster.length && !findStudent(name)) throw fail("err.roster");

    const rows = lastRows || await ntfyToday();
    const mine = rows.find((r) => r.lecture === lec.num && r.academic_id === aid);
    if (mine) return { ok: true, already: true, ...mine };
    if (rows.some((r) => r.lecture === lec.num && body.device && r.device === body.device)) {
      throw fail("err.device");
    }

    const res = await http(NTFY, {
      method: "POST",
      body: JSON.stringify({ v: 1, name, academic_id: aid, distance: Math.round(dist), accuracy: Math.round(body.accuracy || 0), device: body.device }),
    });
    const [rec] = toRecords([await res.json()]);
    if (!rec) throw fail("err.tooLate");
    lastRows = rows.concat(rec);
    return { ok: true, already: false, ...rec };
  }

  // ───────── Google Apps Script (اختياري) ─────────

  async function script(options) {
    const res = await http(cfg.SCRIPT_URL + (options ? "" : "?t=" + Date.now()), options);
    const data = await res.json().catch(() => null);
    if (!data) throw fail("err.generic");
    if (!data.ok) throw new Error(data.error);
    return data;
  }

  window.Att = {
    ready, fmtTime, testing, lectures, lectureState, roster, groups, norm, findStudent, AID_RE, toMin,
    displayName, studentName, lecTitle, searchRoster, locale, distanceM, matchName,
    today: async () => {
      lastRows = useScript ? (await script()).rows : await ntfyToday();
      return lastRows;
    },
    checkIn: async (body) => {
      if (!useScript) return ntfyCheckIn(body);
      // text/plain عشان المتصفح ما يرسل طلب CORS إضافي لـ Google
      return script({ method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) });
    },
  };
})();
