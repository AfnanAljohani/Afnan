-- EWA AI Club · initial content
-- Copies what the page already shows (news, events) into the database so the
-- admin panel can manage it, adds the first club project, the approved
-- chatbot knowledge, and the verified library sources.
-- Each block only runs on an empty table, so re-running is safe.

-- News -------------------------------------------------------------------
insert into public.content_items (kind, title, body, date_label, event_date, image_url, link_url, status, sort_order)
select * from (values
  ('news','رسائل القبول 🎉','تُرسَل رسائل القبول للمقبولين في نادي الذكاء الاصطناعي عبر البريد الإلكتروني. نرجو تفقّد بريدكم، بما في ذلك البريد غير المهم (Spam)، فقد تكون رسالتكم بانتظاركم 📩','',null::date,'img/news-accept.webp','#join','published'::public.publish_status,10),
  ('news','تدشين نادي الذكاء الاصطناعي 🚀','تدشين نادي الذكاء الاصطناعي في أكاديمية الطاقة والمياه. موعد التدشين وتفاصيله تُعلن قريبًا.','',null,'img/news-launch.webp','#events','published',20),
  ('news','التسجيل مفتوح الآن في نادي الذكاء الاصطناعي','المستقبل ما ينتظر… إحنا نصنعه. انضم إلى نادي الذكاء الاصطناعي في EWA: تعلّم، ابتكر، وشارك أفكارك مع مجتمع يصنع الفرق.','open',null,'img/join-promo.webp','https://forms.gle/6Uf4i9uQXL6TXCPNA','published',30),
  ('news','إطلاق برنامج الذكاء الاصطناعي','أعلنت أكاديمية الطاقة والمياه عن إطلاق برنامج الذكاء الاصطناعي، تجربة تعليمية متكاملة تجمع بين المعرفة والتطبيق لتمكين الكفاءات في قطاع الطاقة والمياه.','','2026-04-29','img/events/launch-poster.webp','#events','published',40),
  ('news','زيارة رئيس مجلس الإدارة لبرنامج الذكاء الاصطناعي','م. ثامر بن سعود الشرهان يزور متدربي برنامج الذكاء الاصطناعي لمتابعة تجربتهم التدريبية، تأكيدًا على اهتمام الأكاديمية بإعداد الكفاءات الوطنية.','','2026-07-26','img/events/chairman-poster.webp','#chairman','published',50),
  ('news','زيارة علمية إلى كاوست','زيارة متدربي تخصص الذكاء الاصطناعي إلى جامعة الملك عبدالله للعلوم والتقنية للاطلاع على منظومات الابتكار وأحدث الأبحاث.','','2026-07-18','img/events/kaust-1.webp','#events','published',60)
) as v(kind,title,body,date_label,event_date,image_url,link_url,status,sort_order)
where not exists (select 1 from public.content_items where kind = 'news');

-- Workshops, meetups & camps ---------------------------------------------
insert into public.content_items (kind, event_type, title, tags, event_date, place, duration, image_url, status, sort_order)
select * from (values
  ('event','ورشة','ورشة تهيئة: أساسيات Python للبيانات',array['Python','Pandas','أول «أربعاء الذكاء»'],'2026-10-28'::date,'الأكاديمية','','img/saudi-poster.webp','published'::public.publish_status,10),
  ('event','ورشة','المختبر التطبيقي 1: تحليل البيانات وتصويرها',array['Pandas','Power BI'],'2026-11-11','الأكاديمية','',null,'published',20),
  ('event','ورشة','المختبر التطبيقي 2: تعلّم الآلة',array['الانحدار','التصنيف'],'2026-11-25','الأكاديمية','',null,'published',30),
  ('event','ورشة','المختبر التطبيقي 3: الرؤية الحاسوبية',array['تصنيف الصور','تحدي ديسمبر'],'2026-12-09','الأكاديمية','',null,'published',40),
  ('event','لقاء','لقاء خبير: الذكاء الاصطناعي ومعالجة اللغة العربية',array['اليوم العالمي للغة العربية','NLP'],'2026-12-16','الأكاديمية','',null,'published',50),
  ('event','ورشة','المختبر التطبيقي 4: الذكاء التوليدي وهندسة الأوامر',array['GenAI','Prompt Engineering'],'2026-12-23','الأكاديمية','',null,'published',60),
  ('event','ورشة','المختبر التطبيقي 5: نشر النماذج وأساسيات MLOps',array['Deployment','MLOps'],'2027-01-06','الأكاديمية','',null,'published',70),
  ('event','لقاء','لقاء خبير من قطاع الطاقة والمياه',array['إعلان الهاكاثون','فتح التسجيل'],'2027-01-13','الأكاديمية','',null,'published',80),
  ('event','ورشة','ورشة الابتكار: التفكير التصميمي وعرض الأفكار',array['Design Thinking','Pitching'],'2027-01-20','الأكاديمية','',null,'published',90),
  ('event','معسكر','هاكاثون EWA AI المصغّر',array['تحدٍّ حقيقي','نموذج أولي','لجنة تحكيم'],'2027-01-27','الأكاديمية','يوم كامل',null,'published',100),
  ('event','ورشة','المختبر التطبيقي 6: أخلاقيات الذكاء الاصطناعي',array['الذكاء الاصطناعي المسؤول'],'2027-02-17','عن بُعد','',null,'published',110)
) as v(kind,event_type,title,tags,event_date,place,duration,image_url,status,sort_order)
where not exists (select 1 from public.content_items where kind = 'event');

-- Club projects ------------------------------------------------------------
-- Description written after running the project: rotating slides for the
-- current lecture with a countdown, breaks timetable, «لا تنسى» reminders,
-- weekly bonus challenges, club heroes, this week's sessions and a calendar
-- with the Hijri date; Arabic/English toggle; runs offline from a USB drive.
insert into public.projects (slug, title, author, description, url, cover_url, cover_is_screenshot, tags, status, sort_order)
values (
  'ai-club-screen',
  'الشاشة الرقمية لبرنامج الذكاء الاصطناعي',
  'أفنان الجهني',
  'شاشة عرض حيّة لقاعة التدريب تعرض المحاضرة الجارية مع عدّاد تنازلي لنهايتها، وجدول المحاضرات والبريكات، وتذكير «لا تنسى»، وتحديات البونس الأسبوعية، وأبطال النادي، وجلسات الأسبوع، وتقويمًا بالتاريخين الميلادي والهجري. تدعم العربية والإنجليزية، وتعمل بدون إنترنت من فلاشة USB.',
  'https://afnanaljohani.github.io/Afnan/ai-club-screen/',
  'img/projects/ai-club-screen.webp',
  true,
  array['HTML','JavaScript','عربي / English','بدون إنترنت'],
  'published',
  10
)
on conflict (slug) do nothing;

-- Video section: hidden until an admin adds a verified video ---------------
insert into public.site_docs (path, data)
values ('site/video', '{"status":"hidden"}'::jsonb)
on conflict (path) do nothing;

-- Approved chatbot knowledge (taken from the published site content) -------
insert into public.chatbot_knowledge (title, body, lang, tags, status, sort_order)
select * from (values
  ('عن النادي', 'نادي الذكاء الاصطناعي (EWA AI Club) نادٍ في أكاديمية الطاقة والمياه، ينقل الذكاء الاصطناعي من الشرائح إلى مشاريع تعمل. شعاره: نتعلّم / نطبّق / نبتكر / نصنع الأثر. انطلق في أكتوبر 2026، وفترة خطته التشغيلية من 14 أكتوبر 2026 إلى 31 مارس 2027. يبني مواهب وحلول ذكاء اصطناعي ذات أثر في قطاعي الطاقة والمياه.', 'ar', array['النادي','about'], 'published'::public.publish_status, 10),
  ('القيادة والإشراف', 'يشرف على النادي د. أنمار الحجيلي. رئيسة النادي أفنان الجهني، والمساعدة الإدارية لرئيسة النادي سارة الشمراني، ومستشار الأعمال فهد اليامي.', 'ar', array['الهيكل','القيادة'], 'published', 20),
  ('الأقسام', 'رؤساء الأقسام يرفعون تقاريرهم إلى رئيسة النادي. من الأقسام: العلاقات العامة، والخطابة والإلقاء (AI Speaker) ويرأسه مروان الجهني ومساعده عبدالرحمن قوتة، والفعاليات والتصوير. وتظهر الأسماء المعتمدة لكل قسم في قسم «الهيكل» بالموقع، وما لم يُحدَّد بعد يظهر هناك «لم يُحدَّد بعد».', 'ar', array['الهيكل','الأقسام'], 'published', 30),
  ('الإيقاع الثابت للأنشطة', 'كل أربعاء: «أربعاء الذكاء» و AI Byte (20 دقيقة تفاعلية يتبعها شرح مفهوم واحد يقدمه أحد الأعضاء). كل أسبوعين: المختبر التطبيقي، ورشة يبني فيها الأعضاء نموذجًا أو أداة صغيرة. شهريًا: تحدٍّ ببيانات حقيقية من الطاقة أو المياه ولقاء مع خبير، ولوحة شرف لأفضل 10 أعضاء. كل فصل: معرض EWA AI Showcase.', 'ar', array['الأنشطة','الخطة'], 'published', 40),
  ('مراحل الخطة التشغيلية', 'الخطة 2026–2027 خمس مراحل: (1) التأسيس والانطلاق 14 أكتوبر – 4 نوفمبر 2026. (2) التعلّم والإطلاق 11 نوفمبر – 30 ديسمبر 2026. (3) البناء والتحدي 6 يناير – 3 فبراير 2027 وتشمل هاكاثون EWA AI المصغّر. (4) رمضان: إيقاع خفيف، جلسات قصيرة عن بُعد. (5) إظهار الأثر بعد عيد الفطر حتى 31 مارس 2027 بمعرض EWA AI Showcase وتكريم الأعضاء.', 'ar', array['الخطة'], 'published', 50),
  ('الورش والفعاليات', 'الورش القادمة تظهر في قسم «الفعاليات» بالموقع مع الموعد والمكان، وتشمل مختبرات تطبيقية في تحليل البيانات وتعلّم الآلة والرؤية الحاسوبية والذكاء التوليدي ونشر النماذج وأخلاقيات الذكاء الاصطناعي، ولقاءات خبراء، وهاكاثون مصغّر. المواعيد قد تتغير، والمرجع هو قسم الفعاليات.', 'ar', array['الفعاليات'], 'published', 60),
  ('أبطال النادي', 'كل أسبوعين يكرّم النادي عشرة أبطال صنعوا الفرق، وتُعلن القائمة يوم الأربعاء في قسم «الأبطال». المعايير تشمل الحضور والمشاركة ونتائج التحديات ونقل المعرفة والعمل الجماعي.', 'ar', array['الأبطال'], 'published', 70),
  ('الانضمام للنادي', 'التسجيل في النادي عبر نموذج التسجيل: https://forms.gle/6Uf4i9uQXL6TXCPNA — وتُرسل رسائل القبول عبر البريد الإلكتروني (يُنصح بتفقّد البريد غير المهم).', 'ar', array['التسجيل','join'], 'published', 80),
  ('المكتبة الرقمية', 'صفحة «المكتبة الرقمية» في الموقع تجمع يوميًا أحدث أخبار ومقالات وأبحاث الذكاء الاصطناعي من مصادر موثوقة مع رابط المصدر الأصلي، وفيها قسم للذكاء الاصطناعي في السعودية. وفي الصفحة الرئيسية روابط لمنصات التعلّم: منصة التعلّم في الأكاديمية، وأكاديمية سدايا، والأكاديمية السعودية الرقمية، وأكاديمية طويق.', 'ar', array['المكتبة'], 'published', 90),
  ('About the club (English)', 'EWA AI Club is the artificial intelligence club at the Energy & Water Academy. Motto: Learn / Apply / Innovate / Make an impact. Supervisor: Dr. Anmar Alhujaili. President: Afnan Aljohani. The operating plan runs from 14 Oct 2026 to 31 Mar 2027 with weekly sessions, bi-weekly applied labs, monthly challenges, a mini hackathon and the EWA AI Showcase. Join via https://forms.gle/6Uf4i9uQXL6TXCPNA', 'en', array['about','english'], 'published', 100)
) as v(title, body, lang, tags, status, sort_order)
where not exists (select 1 from public.chatbot_knowledge);

-- Library sources (each feed was checked on 2026-11-04) ----------------------
insert into public.library_sources (name, feed_url, site_url, content_type, language, default_category, is_saudi, filter_keywords, use_images, max_items) values
  ('Google AI Blog',            'https://blog.google/technology/ai/rss/',               'https://blog.google/technology/ai/',  'news',     'en', null,     false, '{}', true,  12),
  ('Google Research Blog',      'https://research.google/blog/rss/',                    'https://research.google/blog/',       'research', 'en', null,     false, '{}', true,  10),
  ('OpenAI News',               'https://openai.com/news/rss.xml',                      'https://openai.com/news/',            'news',     'en', null,     false, '{}', true,  12),
  ('Hugging Face Blog',         'https://huggingface.co/blog/feed.xml',                 'https://huggingface.co/blog',         'learning', 'en', null,     false, '{}', true,  12),
  ('MIT News — AI',             'https://news.mit.edu/rss/topic/artificial-intelligence2', 'https://news.mit.edu/topic/artificial-intelligence2', 'article', 'en', null, false, '{}', true, 10),
  ('arXiv — Computation & Language', 'https://rss.arxiv.org/rss/cs.CL',                'https://arxiv.org/list/cs.CL/recent', 'research', 'en', 'llm',    false, '{}', false, 8),
  ('arXiv — Computer Vision',   'https://rss.arxiv.org/rss/cs.CV',                      'https://arxiv.org/list/cs.CV/recent', 'research', 'en', 'cv',     false, '{}', false, 8),
  ('Asharq Al-Awsat (English)', 'https://english.aawsat.com/feed',                      'https://english.aawsat.com/',         'news',     'en', null,     false,
     array['ai','artificial intelligence','humain','sdaia','machine learning','generative','chatbot','data center','openai','nvidia','الذكاء الاصطناعي'], true, 10)
on conflict (feed_url) do nothing;
