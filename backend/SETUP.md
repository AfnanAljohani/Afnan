# تشغيل «بنان» بـ Claude: خطوة بخطوة من المتصفح

كل الخطوات من المتصفح، بدون أوامر ولا برامج. تاخذ قرابة 20 دقيقة.

## 1. مفتاح Claude (console.anthropic.com)
1. ادخلي [console.anthropic.com](https://console.anthropic.com) وسوّي حساب.
2. من **Billing**، أضيفي بطاقة واشحني رصيد بسيط للتجربة، مثل 5 دولار.
3. من **Limits**، حطي حد صرف شهري يريّحك، عشان ما تزيد التكلفة.
4. من **API Keys** اضغطي **Create Key**، وسمّيه `bnan-website`.
5. انسخي المفتاح (يبدأ بـ `sk-ant-`) واحفظيه في مكان آمن، لأنه ما يظهر لك مرة ثانية.
   **لا ترسلينه لأحد، ولا تحطينه في الموقع ولا في GitHub.**

## 2. مشروع Supabase (supabase.com)
1. ادخلي [supabase.com](https://supabase.com)، وسوّي حساب، وبعدها **New project**.
   - **الاسم:** `bnan`
   - **المنطقة:** أقرب منطقة لك.
   - **كلمة سر قاعدة البيانات:** احفظيها عندك.
2. افتحي **SQL Editor**، والصقي محتوى الملف `backend/supabase/setup_all.sql` كامل، واضغطي **Run**.
   يسوي الجداول والحماية، ويعبّي مشاريعك وتصاميمك.

## 3. الوكيل (Edge Function)
1. من القائمة الجانبية افتحي **Edge Functions**، واضغطي **Deploy a new function**، واختاري **Via Editor**.
2. **اسم الوظيفة:** `ask-banan`، بالضبط كذا.
3. امسحي الكود الموجود، والصقي محتوى `backend/supabase/functions/ask-banan/index.ts` كامل، واضغطي **Deploy**.
4. افتحي إعدادات الوظيفة، وطفّي خيار **Verify JWT**.
   الموقع يرسل المفتاح العام، والحماية تجي من قائمة المواقع المسموحة وحد الرسائل.
5. من **Edge Functions**، افتحي **Secrets** وأضيفي هذي الأسرار:

| الاسم | القيمة |
|---|---|
| `ANTHROPIC_API_KEY` | مفتاح Claude من الخطوة 1 |
| `ALLOWED_ORIGINS` | `https://afnanaljohani.github.io,https://raw.githack.com` |
| `RATE_SALT` | أي نص طويل عشوائي، مثل كلمة سر قوية |
| `CHAT_HOURLY_LIMIT` | `30` |

## 4. ربط الموقع
1. من **Project Settings**، افتحي **API Keys**، وانسخي:
   - **Project URL**، مثل `https://abcd.supabase.co`.
   - **المفتاح العام:** `anon public` أو `publishable`.
   **لا تنسخين `service_role` أو `secret`.**
2. أرسليهم لي وأحطهم في `bnan/js/config.js`. المفتاح العام آمن ينكتب في الموقع.

## 5. تجربة
افتحي الموقع، واسألي «بنان» سؤال عام مثل «وش الفرق بين الذكاء الاصطناعي وتعلّم الآلة؟». لو جاوبت بتفصيل، يعني Claude اشتغل ✅

**وين تلقين طلبات الاستشارة:** في **Table Editor**، جدول `contact_requests`.

**لو صار خطأ:** افتحي **Edge Functions**، ثم `ask-banan`، ثم **Logs**، وصوّري لي الرسالة.
