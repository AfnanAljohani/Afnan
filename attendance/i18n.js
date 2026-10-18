// اللغة (عربي / English) والوضع (ليلي / فاتح) · Made with Love by AFNAN aljohani
(function () {
  const D = {
    ar: {
      "nav.home": "الرئيسية", "nav.lectures": "المحاضرات", "nav.checkin": "سجّل حضورك", "nav.admin": "الأدمن",
      "nav.lang": "English", "nav.langShort": "EN", "nav.theme": "تبديل الوضع الليلي والفاتح",
      "loading": "جاري التحميل…",
      "setup": "الموقع يحتاج إعداد. شوفي attendance/config.js (الخطوات في attendance/README.md).",
      "academy": "أكاديمية الطاقة والمياه",

      "home.doc": "AI Trainees Hub · منصة متدربي الذكاء الاصطناعي",
      "home.h1a": "مكان واحد.", "home.h1b": "لننمو بالذكاء.",
      "home.lead": "منصة المتدربين في أكاديمية الطاقة والمياه: الحضور الذكي بالموقع، والروابط الرسمية، في تجربة وحدة آمنة وسريعة.",
      "home.check": "سجّل حضورك الآن", "home.lectures": "المحاضرات", "home.admin": "لوحة الأدمن",
      "feat1.t": "تحقق آمن", "feat1.d": "كل متدرب يشوف اسمه بس، والأسماء كاملة للأدمن فقط",
      "feat2.t": "حضور ذكي", "feat2.d": "تحدد موقعك، والتحضير بس من داخل الحرم الأكاديمي",
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
      "ci.lead": "اكتب اسمك ورقمك الأكاديمي وحدد موقعك. التحضير بس من داخل مقر الحرم الأكاديمي.",
      "ci.sched": "محاضرات اليوم",
      "ci.schedSub": "التحضير يفتح قبل كل محاضرة بـ {o} دقائق ويقفل بعد بدايتها بـ {c} دقيقة",
      "lec.test": "مفتوح (تجربة)", "lec.opensAt": "يفتح {t}", "lec.open": "التحضير مفتوح", "lec.closed": "انتهى التحضير",
      "lec.window": "التحضير", "lec.count": "{n} حاضر",
      "ci.form": "بيانات الحضور",
      "ci.hint": "اكتب اسمك مثل ما هو في كشف الدبلوم (الاسم الأول واسم ثاني على الأقل)، وأرقام رقمك الأكاديمي بعد WP.",
      "ci.name": "الاسم", "ci.namePh": "مثال: أفنان فهد الجهني",
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
      "err.outside": "لا يمكنك التحضير لأنك خارج مقر الحرم الأكاديمي (تبعد {m} م)",
      "err.nameShort": "اكتب اسمك الأول واسم ثاني على الأقل، مثل: أفنان فهد",
      "err.nameMany": "فيه أكثر من متدرب بهالاسم، اكتب اسمك الثلاثي",
      "err.nameNone": "ما لقينا الاسم في كشف المتدربين. اكتبه مثل ما هو في كشف الدبلوم",
      "err.needLoc": "حدد موقعك أول من زر «حدد موقعي»",

      "loc.t": "موقعك", "loc.btn": "📍 حدد موقعي", "loc.again": "📍 حدّث موقعي",
      "loc.idle": "لازم تحدد موقعك عشان نتأكد إنك داخل الحرم الأكاديمي. ما نحفظ موقعك، بس المسافة.",
      "loc.busy": "نحدد موقعك…",
      "loc.in": "✅ أنت داخل الحرم الأكاديمي (تبعد {m} م). تقدر تحضّر الحين",
      "loc.out": "⛔ لا يمكنك التحضير لأنك خارج مقر الحرم الأكاديمي (تبعد {m} م)",
      "loc.test": "🧪 وضع التجربة: الموقع ما ينفحص (تبعد {m} م)",

      "me.t": "حضوري اليوم", "me.sub": "حالتك في كل محاضرة · اسمك بس يطلع لك",
      "me.anon": "سجّل حضورك أول مرة من هالجوال وبيطلع لك سجلك هنا.",
      "me.change": "مو أنت؟", "me.present": "حاضر", "me.absent": "غائب", "me.notYet": "ما سجّلت للحين", "me.soon": "ما بدأ",
      "sum.t": "أعداد {title}", "sum.sub": "أعداد بس، بدون أسماء لحفظ الخصوصية",
      "sum.present": "حاضرين", "sum.onTime": "في الوقت", "sum.late": "متأخرين", "sum.absent": "غائبين", "sum.notOpen": "التحضير ما فتح للحين",
      "err.closed": "التحضير مقفل الحين. يفتح قبل كل محاضرة بـ {o} دقائق ويقفل بعد بدايتها بـ {c} دقيقة",
      "err.fullName": "اكتب اسمك الكامل",
      "err.aid": "الرقم الأكاديمي لازم يبدأ بـ WP وبعده أرقام، مثل WP2630069",
      "err.roster": "اختر اسمك من قائمة الأسماء",
      "err.device": "هذا الجوال سجّل حضور شخص ثاني في هالمحاضرة",
      "err.tooLate": "التحضير انقفل قبل ما يوصل تسجيلك",

      "w.doc": "لوحة الأدمن · الحضور",
      "a.h1": "لوحة الأدمن", "a.lockD": "أسماء المتدربين كاملة تظهر للأدمن بس. اكتبي كلمة السر.",
      "a.pass": "كلمة السر", "a.enter": "دخول", "a.wrong": "كلمة السر غلط", "a.logout": "خروج",
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
      "nav.home": "Home", "nav.lectures": "Lectures", "nav.checkin": "Check in", "nav.admin": "Admin",
      "nav.lang": "العربية", "nav.langShort": "ع", "nav.theme": "Toggle dark and light mode",
      "loading": "Loading…",
      "setup": "The site needs setup. See attendance/config.js (steps in attendance/README.md).",
      "academy": "Energy & Water Academy",

      "home.doc": "AI Trainees Hub · Energy & Water Academy",
      "home.h1a": "One place.", "home.h1b": "Growing with AI.",
      "home.lead": "The trainees' platform at the Energy & Water Academy: location-based smart attendance and official links, in one safe and fast experience.",
      "home.check": "Check in now", "home.lectures": "Lectures", "home.admin": "Admin board",
      "feat1.t": "Secure check-in", "feat1.d": "Each trainee sees only their own name; the full list is admin-only",
      "feat2.t": "Smart attendance", "feat2.d": "Share your location; check-in works only on the academy campus",
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
      "ci.lead": "Enter your name and academic ID, then share your location. Check-in works only on the academy campus.",
      "ci.sched": "Today's lectures",
      "ci.schedSub": "Check-in opens {o} min before each lecture and closes {c} min after it starts",
      "lec.test": "Open (test)", "lec.opensAt": "Opens {t}", "lec.open": "Check-in open", "lec.closed": "Closed",
      "lec.window": "Check-in", "lec.count": "{n} present",
      "ci.form": "Your details",
      "ci.hint": "Type your name as it appears in the diploma list (first name plus at least one more), and the digits of your academic ID after WP.",
      "ci.name": "Name", "ci.namePh": "e.g. Afnan Fahad Al Johani",
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
      "err.outside": "You can't check in because you're outside the academy campus ({m} m away)",
      "err.nameShort": "Type your first name and at least one more name",
      "err.nameMany": "More than one trainee has this name. Type your full name",
      "err.nameNone": "Name not found in the trainee list. Type it as it appears in the diploma list",
      "err.needLoc": "Share your location first with the “Locate me” button",

      "loc.t": "Your location", "loc.btn": "📍 Locate me", "loc.again": "📍 Update location",
      "loc.idle": "Share your location so we can confirm you're on the academy campus. We keep only the distance, not your location.",
      "loc.busy": "Getting your location…",
      "loc.in": "✅ You're on the academy campus ({m} m away). You can check in now",
      "loc.out": "⛔ You can't check in because you're outside the academy campus ({m} m away)",
      "loc.test": "🧪 Test mode: location isn't checked ({m} m away)",

      "me.t": "My attendance today", "me.sub": "Your status in each lecture · only your name is shown",
      "me.anon": "Check in once from this phone and your record shows up here.",
      "me.change": "Not you?", "me.present": "Present", "me.absent": "Absent", "me.notYet": "Not checked in yet", "me.soon": "Not started",
      "sum.t": "{title} numbers", "sum.sub": "Counts only, no names, to protect privacy",
      "sum.present": "Present", "sum.onTime": "On time", "sum.late": "Late", "sum.absent": "Absent", "sum.notOpen": "Check-in hasn't opened yet",
      "err.closed": "Check-in is closed now. It opens {o} min before each lecture and closes {c} min after it starts",
      "err.fullName": "Enter your full name",
      "err.aid": "Academic ID must start with WP followed by digits, e.g. WP2630069",
      "err.roster": "Pick your name from the list",
      "err.device": "This phone already checked in someone else for this lecture",
      "err.tooLate": "Check-in closed before your check-in arrived",

      "w.doc": "Admin board · Attendance",
      "a.h1": "Admin board", "a.lockD": "Full trainee names are visible to the admin only. Enter the password.",
      "a.pass": "Password", "a.enter": "Enter", "a.wrong": "Wrong password", "a.logout": "Log out",
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
