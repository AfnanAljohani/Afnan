# EWA AI Club · نادي الذكاء الاصطناعي — v2

موقع نادي الذكاء الاصطناعي في أكاديمية الطاقة والمياه. هذه النسخة تحافظ على الموقع الحالي كما هو (الأقسام وترتيبها والمحتوى والروابط)، وتضيف:

| الإضافة | أين |
|---|---|
| هوية خضراء تقنية بدل الذهبي (الوضعان الداكن والفاتح) | `assets/club.css`, `assets/club-v2.css` |
| مساعد النادي (شات بوت) عربي/إنجليزي متصل بـ Ollama عبر الخادم | `assets/chat.js` ← `api/chat.js` |
| قسم فيديو «الذكاء الاصطناعي في المملكة» (مخفي حتى يُرفع فيديو من لوحة الإدارة) | `index.html#saudi-ai` |
| صفحة «المكتبة الرقمية» بتحديث يومي آلي | `library.html`, `assets/library.js`, `api/cron/library.js` |
| قسم «مشاريع النادي» ومعه بطاقة «الشاشة الرقمية لبرنامج الذكاء الاصطناعي» | `index.html#projects` |
| لوحة إدارة على `/admin` بتسجيل دخول وصلاحيات يتحقق منها الخادم وقاعدة البيانات | `admin.html`, `assets/admin.js` |
| قاعدة بيانات Supabase مع RLS وتخزين الملفات | `supabase/migrations/` |

سجل التغييرات التفصيلي: [`CHANGELOG.md`](CHANGELOG.md). النسخة الأولى من الموقع ما زالت في `v1/`، والنسخة قبل هذه التعديلات موجودة في تاريخ git (الالتزام `b2d4c1d`).

---

## البنية (Decoupled)

```
المتصفح ──► Frontend ثابت (index.html · library.html · admin.html · assets/)
   │            │ يقرأ المحتوى المنشور مباشرة من Supabase بالمفتاح العام (RLS تمنع غيره)
   │            ▼
   │        Supabase ── Postgres (المحتوى، المشاريع، المكتبة، السجلات) + Auth + Storage (media)
   │            ▲
   └──► /api (Vercel Functions) ── يستخدم المفتاح السري على الخادم فقط
            ├─ POST /api/chat                 ──► خدمة Ollama (عنوانها ومفتاحها في متغيرات البيئة)
            ├─ GET  /api/cron/library         ◄── Supabase Cron يوميًا 8:00 الرياض (Bearer CRON_SECRET)
            ├─ POST /api/admin/library-refresh  («تحديث الآن» — للمدير فقط)
            ├─ GET  /api/admin/status         (حالة الخدمات — للمدير فقط، بدون كشف أي مفتاح)
            └─ GET  /api/public-config        (رابط Supabase والمفتاح العام فقط)
```

**المصادقة:** المدير يسجّل الدخول في `/admin` بحساب Supabase Auth (بريد + كلمة مرور). كل كتابة تمر على قاعدة البيانات، وسياسات RLS تسمح بها فقط إذا كان المستخدم في جدول `private.admins` (دالة `private.is_admin()`). مسارات `/api/admin/*` تتحقق من الجلسة ثم تسأل قاعدة البيانات نفس السؤال. لذلك إخفاء رابط الإدارة ليس جزءًا من الحماية، ولا يستطيع زائر التعديل حتى لو استدعى الـ API مباشرة.

**الشات بوت:** الواجهة ← `/api/chat` ← Ollama. يُبنى سياق الإجابة من «المعلومات المعتمدة» (جدول `chatbot_knowledge`) والمشاريع والفعاليات المنشورة، ومن مواد المكتبة عند السؤال عن الأخبار والمقالات مع إرجاع روابط المصادر. رسائل الزوار والمقالات تُمرَّر كبيانات غير موثوقة بين وسوم، ولا يصل النموذج إلى أي بيانات إدارية. حدود: طول الرسالة، عدد الأدوار، عدد الطلبات لكل زائر (IP مُجزّأ بملح، لا يُحفظ الـ IP نفسه)، ومهلة الاتصال.

**المكتبة اليومية:** المهمة تجلب RSS/Atom من مصادر رسمية وبحثية، تزيل التكرار بتجزئة الرابط بعد تنظيفه، تصنّف المواد، تكتب ملخصًا عربيًا بالنموذج إن كان متاحًا (ويُعلَّم «ملخص آلي»)، وتسجل كل محاولة في `library_runs`. عند فشل مصدر لا يُحذف شيء، ويبقى المحتوى السابق. تُميَّز «تاريخ النشر» عن «أُضيف للمكتبة»، ولا تُستورد مواد أقدم من 120 يومًا كأنها جديدة.

---

## التشغيل المحلي

المتطلبات: Node.js 20+.

```bash
cd ai-club
npm install
cp .env.example .env.local     # ثم املئي القيم (لا ترفعي هذا الملف)
npm run dev                    # http://localhost:3000  ·  http://localhost:3000/admin
```

بدون Supabase يعمل الموقع بمحتواه الحالي المدمج، ويظهر الشات بوت رسالة واضحة بأنه غير متصل، وتظهر المكتبة أنها لم تُحدَّث بعد. لا توجد ردود وهمية.

`vercel dev` يعمل أيضًا، و`npm run dev` موجود حتى لا يلزم حساب Vercel محليًا.

### الاختبارات

```bash
npm test                                                   # منطق المكتبة (RSS، إزالة التكرار، التصنيف)
PGHOST=127.0.0.1 PGPORT=5432 PGUSER=postgres npm run test:db   # الـ migrations + اختبارات RLS على Postgres محلي
# اختبار المتصفح الكامل ببيانات تجريبية معزولة (Postgres + بدائل محلية لـ Supabase وOllama):
PGHOST=127.0.0.1 PGPORT=5432 PGUSER=postgres bash tests/e2e/start.sh
python3 tests/e2e/browser_test.py tests/e2e/.run/shots     # يحتاج Python Playwright
```

---

## 1) إعداد Supabase (قاعدة البيانات والمصادقة والتخزين)

1. أنشئي مشروعًا على [supabase.com](https://supabase.com) (الخطة المجانية تكفي)، ويُفضّل منطقة قريبة.
2. طبّقي الـ migrations بالترتيب، بإحدى الطريقتين:
   - **CLI:** `npx supabase login` ثم `npx supabase link --project-ref <REF>` ثم `npx supabase db push`
   - **أو يدويًا:** الصقي ملفات `supabase/migrations/*.sql` بالترتيب في Dashboard → SQL Editor.
3. من Project Settings → API Keys انسخي:
   - `SUPABASE_URL`
   - المفتاح العام `sb_publishable_…` ← `SUPABASE_PUBLISHABLE_KEY`
   - المفتاح السري `sb_secret_…` ← `SUPABASE_SECRET_KEY` (للخادم فقط، لا يوضع في HTML/JS أبدًا)
4. Authentication → Sign In / Providers: أبقي Email مفعّلًا، و**أوقفي «Allow new users to sign up»** حتى لا ينشئ أحد حسابًا بنفسه (لن يصبح مديرًا على أي حال، لكن هذا أنظف).
5. Authentication → URL Configuration: اجعلي Site URL `https://ewa-ai.vercel.app`.

الـ migrations تنشئ: `site_docs` (الإعدادات والأبطال والاستبيان)، `content_items` (الأخبار والفعاليات والإعلانات)، `projects`، `chatbot_knowledge`، `library_categories/sources/items/runs`، `chat_rate`، وحاوية التخزين `media` (صور WebP/PNG/JPEG/AVIF، فيديو MP4/WebM، ترجمة VTT، حتى 50MB). وتضيف محتوى البداية الحالي للموقع ومصادر المكتبة. **لا تضيف أي أخبار تجريبية للمكتبة**؛ المكتبة تمتلئ من أول تشغيل حقيقي.

## 2) حساب المدير

لا يوجد حساب افتراضي ولا كلمة مرور في الكود.

1. Dashboard → Authentication → Users → **Add user → Create new user**: البريد وكلمة مرور قوية، وفعّلي «Auto Confirm User».
2. افتحي `supabase/setup/create_admin.sql`، ضعي البريد مكان `REPLACE-WITH-ADMIN-EMAIL@example.com` داخل SQL Editor فقط (لا تحفظي التعديل في المستودع)، ثم شغّليه.
3. ادخلي إلى **`https://ewa-ai.vercel.app/admin`** (محليًا `http://localhost:3000/admin`).

لإضافة مشرف آخر كرري الخطوتين 1 و2. لإزالة مشرف: `delete from private.admins where email = '…';`

## 3) خدمة Ollama (للمساعد والملخصات العربية)

`localhost:11434` على جهازك **لن يصل إليه زوار الموقع ولا Vercel**. اختاري واحدًا:

- **Ollama Cloud:** `OLLAMA_URL=https://ollama.com` و`OLLAMA_API_KEY=<مفتاح من حسابك>` و`OLLAMA_MODEL=<نموذج متاح في حسابك>`.
- **خادمك الخاص:** شغّلي Ollama على خادم، ولا تفتحي المنفذ 11434 للعامة؛ ضعي أمامه Reverse Proxy (Caddy/Nginx) بـ HTTPS يطلب `Authorization: Bearer <مفتاح طويل>`، ثم `OLLAMA_URL=https://ollama.your-domain` و`OLLAMA_API_KEY=<نفس المفتاح>`.

اختاري نموذجًا يجيد العربية. يمكن التحقق من الاتصال في `/admin` ← «نظرة عامة» ← «خدمة Ollama».

## 4) متغيرات البيئة (Vercel → Settings → Environment Variables)

انظري `.env.example` للقائمة الكاملة مع الشرح. الأساسية:

| المتغير | مطلوب لـ |
|---|---|
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | المحتوى ولوحة الإدارة |
| `SUPABASE_SECRET_KEY` | المكتبة، حدود الشات، قراءة المعلومات المعتمدة (خادم فقط) |
| `CRON_SECRET` | التحديث اليومي (`openssl rand -hex 32`) |
| `OLLAMA_URL`, `OLLAMA_MODEL`, `OLLAMA_API_KEY` | الشات بوت والملخصات |
| `ALLOWED_ORIGINS`, `SITE_URL` | CORS (الموقع يستدعي `/api` من نفس النطاق فلا يحتاج CORS؛ أضيفي نطاقات أخرى فقط عند الحاجة) |

## 5) التحديث اليومي للمكتبة — 8:00 صباحًا بتوقيت الرياض

**الوسيلة المختارة: Supabase Cron (pg_cron + pg_net).** السبب: مجاني، يعمل في الوقت المحدد بالدقيقة، ولا يعتمد على فتح الموقع. (Vercel Cron في الخطة المجانية يعمل مرة يوميًا لكن في أي دقيقة خلال الساعة المحددة، وGitHub Actions قد يتأخر عن الموعد.)

1. بعد النشر وضبط `CRON_SECRET` في Vercel: Dashboard → Database → Extensions ← فعّلي `pg_cron` و`pg_net`.
2. افتحي `supabase/setup/schedule_library.sql` في SQL Editor، ضعي نفس قيمة `CRON_SECRET` مكان `REPLACE-WITH-THE-SAME-CRON_SECRET-AS-VERCEL` (تُحفظ في Vault، لا في المستودع)، وشغّليه. الجدول `0 5 * * *` = 05:00 UTC = 08:00 الرياض (لا توقيت صيفي في السعودية).
3. شغّلي أول تحديث يدويًا من `/admin` ← «المكتبة الرقمية» ← **«تحديث الآن»**، وتأكدي أن المواد ظهرت في `/library`.

**المراقبة:**
- `/admin` ← «المكتبة الرقمية» ← «سجل التشغيل»: وقت كل محاولة، النوع (مجدول/يدوي)، النتيجة، المصادر الناجحة، المواد الجديدة والمحدَّثة، الأخطاء.
- صفحة `/library` تعرض «آخر تحديث ناجح» من آخر تشغيل ناجح فعلي.
- في SQL Editor (الاستعلامات في آخر `schedule_library.sql`): `cron.job_run_details` و`net._http_response`.

تشغيل يدوي من الطرفية: `npm run library:run` (يقرأ `.env.local`).

## 6) النشر

**حفظ الكود** على GitHub شيء، و**استضافة الخدمات** شيء آخر:

- الكود: هذا المجلد `ai-club/` داخل المستودع `AfnanAljohani/Afnan`.
- الواجهة + `/api`: **Vercel** (المشروع الحالي `ewa-ai-club`، Root Directory = `ai-club`، Framework = Other، بدون أمر بناء؛ `npm install` يثبت مكتبات الـ API).
- قاعدة البيانات والملفات والمصادقة والجدولة: **Supabase**.
- النموذج: **Ollama Cloud** أو خادمك.

لماذا ليس GitHub Pages؟ Pages تستضيف ملفات ثابتة فقط، ولا تشغّل `/api` (الشات، المهمة اليومية، تحقق المدير). الموقع أصلًا على Vercel، فالأبسط إبقاء الواجهة والـ API معًا هناك. إن أردتِ الواجهة على Pages لاحقًا، يلزم أن يشير `assets/*.js` إلى نطاق الـ API على Vercel وإضافة نطاق Pages إلى `ALLOWED_ORIGINS`.

خطوات المراجعة قبل الإنتاج:
1. اضبطي متغيرات البيئة على Vercel لبيئة **Preview** أولًا.
2. `npx vercel deploy` (بدون `--prod`) من جذر المستودع ← رابط معاينة.
3. افحصي على رابط المعاينة: `/`، `/library`، `/library#saudi`، `/admin` (افتحيها مباشرة)، تسجيل الدخول، «تحديث الآن»، الشات.
4. عند الرضا: `npx vercel deploy --prod`، ثم شغّلي `schedule_library.sql` على رابط الإنتاج.

`.vercelignore` يستبعد `supabase/` و`tests/` و`scripts/` وREADME من النشر.

## إدارة المحتوى من `/admin`

- **الأخبار والفعاليات والإعلانات:** إضافة/تعديل/حذف، حالات مسودة/منشور/مخفي، معاينة قبل الحفظ، تأكيد قبل الحذف.
- **المشاريع:** عنوان، إعداد، وصف، رابط (https فقط)، غلاف (يُضغط إلى WebP)، مع تحديد إن كان الغلاف لقطة حقيقية من المشروع.
- **المكتبة الرقمية:** المصادر (تفعيل/إيقاف، التصنيف الافتراضي، كلمات الفلترة، السماح بالصور)، المواد (إخفاء/نشر)، التصنيفات، «تحديث الآن»، سجل التشغيل.
- **الفيديو:** رفع MP4/WebM مع صورة غلاف وترجمة VTT، أو رابط YouTube؛ القسم يبقى مخفيًا حتى يُنشر فيديو.
- **المساعد الذكي:** «المعلومات المعتمدة» التي يجيب منها الشات بوت.
- **الإعدادات والأبطال والاستبيان:** المحررات الموجودة سابقًا في الصفحة، أصبحت تحفظ في قاعدة البيانات بعد تسجيل دخول المدير.

الملفات تُفحص نوعًا وحجمًا في المتصفح، ثم تفرض Storage نفس القيود على الخادم.
