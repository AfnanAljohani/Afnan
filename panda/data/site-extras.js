/* Editable settings for the Phase 1–4 additions.
   Safe to edit by hand: texts, award names, number of award-day photos, video and Khalid's links.
   Phase 4 numbers are NOT here: they come from data/phases.js. */
window.PANDA_EXTRAS = {
  video: {
    src: 'assets/video/panda-problem.mp4',
    poster: 'assets/video/panda-problem-poster.jpg',
    ar: { eyebrow: 'فيديو المشكلة', title: 'المشكلة في 80 ثانية', text: 'ليش الأغذية الطازجة صعبة؟ فيديو قصير يشرح التحدي اللي يحاول مشروعنا يحله: توقع الطلب، ونفاد الرفوف، والهدر قبل ما يصير.' },
    en: { eyebrow: 'THE PROBLEM VIDEO', title: 'The problem in 80 seconds', text: 'Why is fresh food hard? A short film on the challenge our project tackles: forecasting demand, empty shelves, and waste before it happens.' }
  },
  awards: {
    ar: { eyebrow: 'المراحل 1–2–3 · إنجازاتنا', title: 'فزنا بجائزتين في المراحل الثلاث الأولى', text: 'قبل النمذجة، بنينا الأساس: فهم المشكلة، ثم فهم البيانات، ثم تجهيزها. وهذا ما حصل عليه عملنا.', photosTitle: 'صور من يوم الفوز' },
    en: { eyebrow: 'PHASES 1–2–3 · OUR AWARDS', title: 'We won two awards in the first three phases', text: 'Before modeling, we built the foundation: understanding the problem, then the data, then preparing it. This is what our work earned.', photosTitle: 'Photos from award day' },
    items: [
      { img: 'assets/awards/award-most-innovative-website.jpg', num: '01',
        ar: { title: 'أكثر موقع ابتكارًا', org: 'نادي الذكاء الاصطناعي · أكاديمية الطاقة والمياه', note: 'ضمن 3 فرق أكثر ابتكارًا' },
        en: { title: 'Most Innovative Website', org: 'EWA AI Club · Energy & Water Academy', note: 'One of 3 innovative teams' } },
      { img: 'assets/awards/award-3rd-place-ai-projects.jpg', num: '02',
        ar: { title: 'المركز الثالث · مشاريع الذكاء الاصطناعي', org: 'نادي الذكاء الاصطناعي · أكاديمية الطاقة والمياه', note: 'ضمن 3 فرق فائزة' },
        en: { title: '3rd Place · AI Projects', org: 'EWA AI Club · Energy & Water Academy', note: 'One of 3 winning teams' } }
    ],
    year: '2026',
    /* Award-day photos: upload them to assets/awards/photos/ as photo-1.jpg, photo-2.jpg, …
       then set max to the number of photos. 0 hides the photo strip. */
    photos: { dir: 'assets/awards/photos/', max: 0 }
  },
  khalid: [
    { href: 'reports/khalid/panda-all-phases-dashboard.html',
      ar: { title: 'لوحة مراحل المشروع 1–4', text: 'كل مرحلة بمصدرها وأرقامها، مع فلاتر وتصدير CSV.' },
      en: { title: 'All-phases dashboard (1–4)', text: 'Every phase with its source and numbers, with filters and CSV export.' } },
    { href: 'reports/khalid/panda-stockout-dashboard.html',
      ar: { title: 'لوحة نفاد المخزون', text: 'أداء نموذج LightGBM، ومصفوفة التصنيف، ومراجعة السجلات.' },
      en: { title: 'Stockout dashboard', text: 'LightGBM model performance, confusion matrix and record review.' } }
  ],
  khalidBy: { ar: 'إعداد: خالد الحربي', en: 'Built by Khalid Alhrabi' }
};
