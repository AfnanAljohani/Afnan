# بنان · الواجهة الخلفية (Supabase)

الموقع مقسوم لطبقتين مستقلتين:

```
bnan/                 الواجهة الأمامية (موقع ثابت ينفع على GitHub Pages أو أي استضافة)
  index.html          الهيكل فقط
  css/styles.css      التصميم
  js/config.js        إعدادات الاتصال بالـ Backend (فاضية = وضع بدون إنترنت)
  js/api.js           طبقة البيانات: الملف الوحيد اللي يكلّم الـ Backend
  js/render.js        يرسم بطاقات المشاريع والعروض والتصاميم من البيانات
  js/app.js           الواجهة: اللغة، المحادثة، الروبوت بنان، العارض…
  js/main.js          يشغّل كل شي بالترتيب
  data/content.json   مصدر المحتوى الوحيد
  js/content-data.js  نسخة محلية من المحتوى (تتولّد تلقائيًا)

backend/supabase/
  migrations/         الجداول والفهارس وصلاحيات الأمان (RLS)، وحد رسائل المحادثة
  functions/ask-banan/  وكيل «اسأل بنان»: Claude مع أدوات (Edge Function)
  seed.sql            بيانات المحتوى (تتولّد تلقائيًا)

tools/build_content.py  يولّد content-data.js و seed.sql من content.json
```

## الجداول

| الجدول | وش فيه | مين يقدر يوصله |
|---|---|---|
| `projects` | المشاريع | الزوار يقرون المنشور بس |
| `decks` | تصاميم العروض | الزوار يقرون المنشور بس |
| `graphics` | تصاميم الجرافيك | الزوار يقرون المنشور بس |
| `contact_requests` | رسائل نموذج التواصل | الزوار يرسلون بس، ما يقدرون يقرون. أنتِ تقرينها من لوحة Supabase |

**تحسينات قاعدة البيانات:**
- **الفهارس:** فهارس جزئية على المحتوى المنشور بترتيب العرض، لأن هذا بالضبط اللي يطلبه الموقع. وفهرس للرسائل الجديدة بس.
- **الأمان (RLS):** الصلاحيات بأقل حد ممكن. الزائر يقدر يضيف أعمدة الرسالة بس، ويقرأ الصفوف المنشورة بس.
- **صحة البيانات:** قيود CHECK على كل الحقول، مثل صيغة الإيميل وطول النص والحالات المسموحة.
- **الطلبات:** الموقع يطلب الأعمدة اللي يعرضها بس، ويرسل الرسائل بدون ما يرجع البيانات (`return=minimal`).

## التشغيل (مرة وحدة)

1. سوّي مشروع جديد في [supabase.com](https://supabase.com).
2. من **SQL Editor** شغّل محتوى `supabase/migrations/20261022000000_init.sql`.
3. بعدها شغّل محتوى `supabase/seed.sql`.
4. من **Project Settings → API** انسخ `Project URL` و `anon public key`.
5. حطهم في `bnan/js/config.js`:
   ```js
   supabaseUrl: 'https://xxxx.supabase.co',
   supabaseAnonKey: 'eyJ...',
   ```
6. ارفع التعديل. الموقع صار يقرأ من قاعدة البيانات، والرسائل توصل جدول `contact_requests`.

مفتاح `anon` آمن ينكتب في الموقع، لأن صلاحيات RLS تحدّه. **لا تحطين مفتاح `service_role` في الموقع أبدًا.**

لو قاعدة البيانات ما ردّت، الموقع يرجع تلقائيًا للمحتوى المحلي، ونموذج التواصل يفتح الإيميل.

## إضافة مشروع أو تصميم

1. عدّل `bnan/data/content.json`.
2. شغّل `python3 tools/build_content.py`.
3. إذا Supabase مفعّل: شغّل `backend/supabase/seed.sql` من جديد. ما يكرر الصفوف، يحدّثها.

أو أضف الصف مباشرة من لوحة Supabase (**Table Editor**)، ويظهر في الموقع على طول.

## وكيل «اسأل بنان» (Claude)

المحادثة في الموقع تشتغل بطريقتين:
- **بدون Supabase:** تجاوب من أجوبة جاهزة حسب الكلمات.
- **مع Supabase والوكيل:** كل سؤال مكتوب يروح لـ Claude عن طريق `functions/ask-banan`.

**وش يقدر الوكيل يسوي:**
- يجاوب على أي سؤال، ويقترح كيف بنان تقدر تساعد لما الزائر يوصف مشكلة أو فكرة.
- **`get_projects`:** يقرأ مشاريع بنان المنشورة من قاعدة البيانات، فما يخترع مشاريع.
- **`save_consultation_request`:** يحفظ طلب استشارة في `contact_requests`، بعد ما يعطيه الزائر اسمه وإيميله ويوافق.
- **بحث الويب:** للأسئلة اللي تحتاج معلومات حديثة، وحده أقصى 3 بحوث لكل رد.

**الحماية:**
- مفتاح Claude يبقى في السيرفر، وما يوصل للمتصفح أبدًا.
- يقبل الطلبات من موقعك بس (`ALLOWED_ORIGINS`).
- حد رسائل لكل زائر في الساعة (`CHAT_HOURLY_LIMIT`، الافتراضي 30). يُحسب بعنوان IP مشفّر، وما يُحفظ العنوان نفسه.
- آخر 16 رسالة بس تروح للنموذج، وكل رسالة حدها 2000 حرف.

**النموذج:** `claude-opus-5-5` بجهد منخفض (`effort: low`) لأنها محادثة. ومفعّل فيه التحويل التلقائي لنموذج ثاني لو رفض الطلب (`fallbacks: "default"`). لو تبين تكلفة أقل، غيّري `model` في `index.ts` إلى `claude-sonnet-5-5` أو `claude-haiku-5-5`.

### التشغيل

بعد خطوات Supabase اللي فوق:

1. ثبّتي [Supabase CLI](https://supabase.com/docs/guides/cli)، وسجّلي الدخول، واربطي المشروع:
   ```bash
   supabase login
   supabase link --project-ref <معرّف مشروعك>
   ```
2. شغّلي محتوى `supabase/migrations/20261031000000_chat_rate_limits.sql` من **SQL Editor**.
3. حطي الأسرار. مفتاح Claude تاخذينه من [console.anthropic.com](https://console.anthropic.com):
   ```bash
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-... \
     ALLOWED_ORIGINS=https://afnanaljohani.github.io \
     RATE_SALT=<نص عشوائي طويل> \
     CHAT_HOURLY_LIMIT=30
   ```
4. انشري الوكيل من داخل مجلد `backend`:
   ```bash
   supabase functions deploy ask-banan --no-verify-jwt
   ```
   الموقع يرسل مفتاح `anon` مع كل طلب. `--no-verify-jwt` تسمح للزوار بدون تسجيل دخول، والحماية تجي من `ALLOWED_ORIGINS` وحد الرسائل.
5. تأكدي إن `supabaseUrl` و `supabaseAnonKey` معبّية في `bnan/js/config.js`. المحادثة تشتغل بالوكيل تلقائيًا.

**طلبات الاستشارة** اللي يحفظها الوكيل تظهر في جدول `contact_requests` في لوحة Supabase.

**تنظيف سجل حد الرسائل** (اختياري، مرة بالأسبوع):
```sql
delete from public.chat_rate_limits where window_start < now() - interval '2 days';
```
