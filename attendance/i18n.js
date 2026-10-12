// اللغة (عربي / English) والوضع (ليلي / فاتح) · Made with Love by AFNAN aljohani
(function () {
  const D = {
    ar: {
      "nav.home": "الرئيسية", "nav.lectures": "المحاضرات", "nav.checkin": "سجّل حضورك",
      "nav.lang": "English", "nav.langShort": "EN", "nav.theme": "تبديل الوضع الليلي والفاتح",
      "loading": "جاري التحميل…",
      "setup": "الموقع يحتاج إعداد. شوفي attendance/config.js (الخطوات في attendance/README.md).",
      "academy": "أكاديمية الطاقة والمياه",

      "home.doc": "AI Trainees Hub · منصة متدربي الذكاء الاصطناعي",
      "home.h1a": "مكان واحد.", "home.h1b": "لننمو بالذكاء.",
      "home.lead": "منصة المتدربين في أكاديمية الطاقة والمياه: الحضور الذكي بالموقع، والروابط الرسمية، في تجربة وحدة آمنة وسريعة.",
      "home.check": "سجّل حضورك الآن", "home.lectures": "المحاضرات",
      "feat1.t": "تحقق آمن", "feat1.d": "مرة وحدة لكل محاضرة، والرقم الأكاديمي ما يطلع لأحد",
      "feat2.t": "حضور ذكي", "feat2.d": "بس من داخل الأكاديمية، ويفتح ويقفل لحاله مع كل محاضرة",
      "feat3.t": "6 محاضرات يوميًا", "feat3.d": "من 8 الصبح، بتوقيت الرياض",
      "quick": "QUICK ACCESS · روابط رسمية",
      "portal.d": "بوابة المتدرب · تسجيل الدخول", "lms.d": "منصة التعلم · المحاضرات والمواد",

      "state.test": "🧪 وضع التجربة · التحضير مفتوح من أي مكان",
      "state.openFor": "{title} · التحضير مفتوح (يقفل بعد {m} د)",
      "state.open": "{title} · التحضير مفتوح",
      "state.wait": "{title} · يفتح بعد {t}",
      "state.done": "خلصت محاضرات اليوم",
      "dur.hm": "{h} س {m} د", "dur.m": "{m} د",
      "lecture": "{ar}",
      "st.ontime": "في الوقت", "st.late": "متأخر {m} د", "st.after": "+{m} د", "st.afterLong": "بعد البداية بـ {m} د",
      "group": "المجموعة {g}", "group.short": "م {g}",

      "ci.doc": "سجّل حضورك · AI Trainees",
      "ci.h1": "سجّل حضورك الآن",
      "ci.lead": "اكتب اسمك ورقمك الأكاديمي بس. لازم تكون داخل أكاديمية الطاقة والمياه.",
      "ci.sched": "محاضرات اليوم",
      "ci.schedSub": "التحضير يفتح قبل كل محاضرة بـ {o} دقائق ويقفل بعد بدايتها بـ {c} دقيقة",
      "lec.test": "مفتوح (تجربة)", "lec.opensAt": "يفتح {t}", "lec.open": "التحضير مفتوح", "lec.closed": "انتهى التحضير",
      "lec.window": "التحضير", "lec.count": "{n} حاضر",
      "ci.form": "بيانات الحضور",
      "ci.hint": "اختر اسمك من القائمة واكتب أرقام رقمك الأكاديمي بعد WP. الرقم ما يطلع في لوحة الحضور.",
      "ci.name": "الاسم", "ci.namePh": "ابحث عن اسمك واختره من القائمة",
      "ci.aid": "الرقم الأكاديمي",
      "ci.info": "📍 بنطلب موقعك مرة وحدة عشان نتأكد إنك داخل الأكاديمية. ما نحفظ موقعك، بس المسافة. ووقت الحضور ينحسب بتوقيت الرياض.",
      "ci.submit": "تسجيل الحضور", "ci.locating": "نحدد موقعك…", "ci.sending": "نسجّل…",
      "ci.notReady": "التسجيل يفتح بعد ربط قاعدة البيانات",
      "ci.done": "تم تسجيل حضورك", "ci.already": "حضورك مسجل من قبل",
      "ci.listOf": "حضور {title}", "ci.listToday": "حضور اليوم",
      "ci.listSub": "الأسماء ووقت التسجيل · التحديث المباشر في صفحة المحاضرات",
      "ci.emptyT": "ما أحد سجّل حضوره للحين", "ci.emptyD": "أول اسم بيطلع هنا مباشرة بعد التسجيل.",
      "ci.noMatch": "ما لقينا الاسم. جرّب اسمك الأول بس",

      "err.pickName": "اختر اسمك من القائمة اللي تطلع تحت خانة الاسم",
      "err.aidDigits": "اكتب أرقام رقمك الأكاديمي بعد WP، مثل 2630069",
      "err.noGeo": "جهازك ما يدعم تحديد الموقع",
      "err.geoDenied": "لازم تسمح للموقع يوصل لمكانك. من إعدادات المتصفح فعّل الموقع وحاول مرة ثانية",
      "err.geoFail": "ما قدرنا نحدد موقعك. شغّل GPS وحاول مرة ثانية",
      "err.network": "ما قدرنا نوصل للسيرفر. تأكد من الإنترنت وحاول مرة ثانية",
      "err.busy": "الشبكة مزدحمة. طفّ الواي فاي واستخدم بيانات الجوال، وحاول بعد دقيقة",
      "err.generic": "صار خطأ في الاتصال، حاول مرة ثانية",
      "err.accuracy": "دقة الموقع ضعيفة ({m} م). شغّل GPS وحاول مرة ثانية",
      "err.outside": "أنت خارج موقع الأكاديمية (تبعد {m} م)",
      "err.closed": "التحضير مقفل الحين. يفتح قبل كل محاضرة بـ {o} دقائق ويقفل بعد بدايتها بـ {c} دقيقة",
      "err.fullName": "اكتب اسمك الكامل",
      "err.aid": "الرقم الأكاديمي لازم يبدأ بـ WP وبعده أرقام، مثل WP2630069",
      "err.roster": "اختر اسمك من قائمة الأسماء",
      "err.device": "هذا الجوال سجّل حضور شخص ثاني في هالمحاضرة",
      "err.tooLate": "التحضير انقفل قبل ما يوصل تسجيلك",

      "w.doc": "المحاضرات · شاشة الحضور",
      "w.h1": "الحاضرين اليوم",
      "w.onTime": "في الوقت", "w.late": "متأخرين", "w.absent": "غائبين", "w.riyadh": "توقيت الرياض", "w.excel": "تنزيل Excel",
      "w.view": "العرض", "w.present": "الحاضرين", "w.absentTab": "الغائبين",
      "w.group": "المجموعة", "w.allGroups": "كل المجموعات",
      "w.rate": "نسبة الحضور {p}%",
      "w.noAbsent": "ما فيه غياب في هالمحاضرة 🎉",
      "w.empty": "ما أحد سجّل حضوره في هالمحاضرة للحين",
      "w.hello": "👋 أهلًا {name}", "w.more": " و{n} غيره",
      "csv.head": "التاريخ|المحاضرة|وقت المحاضرة|المجموعة|الاسم|الرقم الأكاديمي|الحالة|وقت التسجيل|الدقائق بعد البداية",
      "csv.absent": "غائب", "csv.test": "تجربة", "csv.late": "متأخر", "csv.present": "حاضر",
    },
    en: {
      "nav.home": "Home", "nav.lectures": "Lectures", "nav.checkin": "Check in",
      "nav.lang": "العربية", "nav.langShort": "ع", "nav.theme": "Toggle dark and light mode",
      "loading": "Loading…",
      "setup": "The site needs setup. See attendance/config.js (steps in attendance/README.md).",
      "academy": "Energy & Water Academy",

      "home.doc": "AI Trainees Hub · Energy & Water Academy",
      "home.h1a": "One place.", "home.h1b": "Growing with AI.",
      "home.lead": "The trainees' platform at the Energy & Water Academy: location-based smart attendance and official links, in one safe and fast experience.",
      "home.check": "Check in now", "home.lectures": "Lectures",
      "feat1.t": "Secure check-in", "feat1.d": "Once per lecture, and your academic ID stays private",
      "feat2.t": "Smart attendance", "feat2.d": "Only inside the academy, opening and closing on its own for each lecture",
      "feat3.t": "6 lectures a day", "feat3.d": "From 8 AM, Riyadh time",
      "quick": "QUICK ACCESS · Official links",
      "portal.d": "Trainee portal · Log in", "lms.d": "Learning platform · Lectures & materials",

      "state.test": "🧪 Test mode · check-in open from anywhere",
      "state.openFor": "{title} · Check-in open (closes in {m} min)",
      "state.open": "{title} · Check-in open",
      "state.wait": "{title} · Opens in {t}",
      "state.done": "Today's lectures are over",
      "dur.hm": "{h}h {m}m", "dur.m": "{m} min",
      "lecture": "Lecture {n}",
      "st.ontime": "On time", "st.late": "Late {m} min", "st.after": "+{m} min", "st.afterLong": "{m} min after start",
      "group": "Group {g}", "group.short": "G{g}",

      "ci.doc": "Check in · AI Trainees",
      "ci.h1": "Check in now",
      "ci.lead": "Just your name and academic ID. You need to be inside the Energy & Water Academy.",
      "ci.sched": "Today's lectures",
      "ci.schedSub": "Check-in opens {o} min before each lecture and closes {c} min after it starts",
      "lec.test": "Open (test)", "lec.opensAt": "Opens {t}", "lec.open": "Check-in open", "lec.closed": "Closed",
      "lec.window": "Check-in", "lec.count": "{n} present",
      "ci.form": "Your details",
      "ci.hint": "Pick your name from the list and type the digits of your academic ID after WP. Your ID never shows on the board.",
      "ci.name": "Name", "ci.namePh": "Search for your name and pick it",
      "ci.aid": "Academic ID",
      "ci.info": "📍 We ask for your location once to make sure you're inside the academy. We don't keep your location, only the distance. Times are in Riyadh time.",
      "ci.submit": "Check in", "ci.locating": "Getting your location…", "ci.sending": "Checking in…",
      "ci.notReady": "Check-in opens once the site is set up",
      "ci.done": "You're checked in", "ci.already": "You're already checked in",
      "ci.listOf": "{title} attendance", "ci.listToday": "Today's attendance",
      "ci.listSub": "Names and check-in times · live updates on the Lectures page",
      "ci.emptyT": "No one has checked in yet", "ci.emptyD": "The first name shows up here right after check-in.",
      "ci.noMatch": "Name not found. Try just your first name",

      "err.pickName": "Pick your name from the list under the name field",
      "err.aidDigits": "Type the digits of your academic ID after WP, e.g. 2630069",
      "err.noGeo": "Your device doesn't support location",
      "err.geoDenied": "Please allow location access in your browser settings and try again",
      "err.geoFail": "We couldn't get your location. Turn on GPS and try again",
      "err.network": "Couldn't reach the server. Check your internet and try again",
      "err.busy": "The network is busy. Turn off Wi-Fi, use mobile data and try again in a minute",
      "err.generic": "Connection error, please try again",
      "err.accuracy": "Location accuracy is too low ({m} m). Turn on GPS and try again",
      "err.outside": "You're outside the academy ({m} m away)",
      "err.closed": "Check-in is closed now. It opens {o} min before each lecture and closes {c} min after it starts",
      "err.fullName": "Enter your full name",
      "err.aid": "Academic ID must start with WP followed by digits, e.g. WP2630069",
      "err.roster": "Pick your name from the list",
      "err.device": "This phone already checked in someone else for this lecture",
      "err.tooLate": "Check-in closed before your check-in arrived",

      "w.doc": "Lectures · Attendance board",
      "w.h1": "Today's attendance",
      "w.onTime": "On time", "w.late": "Late", "w.absent": "Absent", "w.riyadh": "Riyadh time", "w.excel": "Download Excel",
      "w.view": "View", "w.present": "Present", "w.absentTab": "Absent",
      "w.group": "Group", "w.allGroups": "All groups",
      "w.rate": "Attendance {p}%",
      "w.noAbsent": "No absences in this lecture 🎉",
      "w.empty": "No one has checked in for this lecture yet",
      "w.hello": "👋 Welcome {name}", "w.more": " and {n} more",
      "csv.head": "Date|Lecture|Lecture time|Group|Name|Academic ID|Status|Check-in time|Minutes after start",
      "csv.absent": "Absent", "csv.test": "Test", "csv.late": "Late", "csv.present": "Present",
    },
  };

  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} },
  };
  const root = document.documentElement;
  let lang = store.get("att-lang") === "en" ? "en" : "ar";
  const media = window.matchMedia ? matchMedia("(prefers-color-scheme: dark)") : null;

  function t(key, vars) {
    const s = (D[lang] && D[lang][key]) ?? D.ar[key] ?? key;
    return s.replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] != null ? vars[k] : ""));
  }

  function resolveMode() {
    const th = root.dataset.theme;
    const dark = th ? th === "dark" : (media ? media.matches : true);
    root.dataset.mode = dark ? "dark" : "light";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? "#061214" : "#f3f8f8";
  }

  function apply() {
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
    if (root.dataset.doc) document.title = t(root.dataset.doc);
    const lb = document.getElementById("langBtn");
    if (lb) { lb.textContent = t("nav.langShort"); lb.setAttribute("aria-label", t("nav.lang")); lb.title = t("nav.lang"); }
    const tb = document.getElementById("themeBtn");
    if (tb) { tb.setAttribute("aria-label", t("nav.theme")); tb.title = t("nav.theme"); }
  }

  function setLang(l) {
    lang = l === "en" ? "en" : "ar";
    store.set("att-lang", lang);
    apply();
    document.dispatchEvent(new CustomEvent("langchange"));
  }

  function toggleTheme() {
    const next = root.dataset.mode === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    store.set("att-theme", next);
    resolveMode();
  }

  // قبل ما تنرسم الصفحة: اللغة والاتجاه والوضع، عشان ما يصير وميض
  const savedTheme = store.get("att-theme");
  if (savedTheme === "dark" || savedTheme === "light") root.dataset.theme = savedTheme;
  root.lang = lang;
  root.dir = lang === "ar" ? "rtl" : "ltr";
  resolveMode();
  if (media && media.addEventListener) media.addEventListener("change", resolveMode);

  document.addEventListener("DOMContentLoaded", () => {
    apply();
    const lb = document.getElementById("langBtn");
    if (lb) lb.addEventListener("click", () => setLang(lang === "ar" ? "en" : "ar"));
    const tb = document.getElementById("themeBtn");
    if (tb) tb.addEventListener("click", toggleTheme);
  });

  window.I18N = {
    t, setLang, toggleTheme, apply,
    get lang() { return lang; },
    // تنسيق الأوقات والتواريخ حسب اللغة (أرقام إنجليزية في العربي، وتقويم ميلادي)
    locale: () => (lang === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-US"),
  };
})();
