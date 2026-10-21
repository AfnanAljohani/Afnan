/* Screen logic: reads the data files in ../data and renders the slides. */

/* ---------- storage + language ---------- */
const store={get(k,f){try{const v=localStorage.getItem(k);return v==null?f:JSON.parse(v)}catch(e){return f}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let LANG=store.get('ewa-lang','ar');
const L=(ar,en)=>LANG==='ar'?ar:en;
const tx=v=>Array.isArray(v)?L(v[0],v[1]):v;

const TABS=[['الآن','Now'],['البريكات','Breaks'],['لا تنسى','Don’t forget'],['بونس الأسبوع','Weekly bonus'],['أبطال النادي','Club heroes'],['جلسات الأسبوع','This week'],['التقويم','Calendar']];

/* ---------- interface text ---------- */
const I18N={
  brand:['نادي الذكاء الاصطناعي','AI Club'],
  academy:['أكاديمية الطاقة والمياه','Energy & Water Academy'],
  simTag:['وقت تجريبي','Test time'],
  next:['التالي','Next'],
  todaySession:['جلسة البرنامج اليوم','Today’s program session'],
  dayPath:['مسار اليوم التدريبي','Training day timeline'],
  lgLec:['محاضرة','Lecture'],lgBrk:['بريك','Break'],lgLunch:['غداء','Lunch'],
  schEyebrow:['خلال اليوم التدريبي','During the training day'],
  schTitle:['جدول المحاضرات <em>والبريكات</em>','Lectures <em>&amp; Breaks</em>'],
  schTag:['التحضير للعودة قبل نهاية كل بريك بخمس دقائق','Head back 5 minutes before each break ends'],
  schNote:['يبدأ التحضير للعودة إلى القاعات التدريبية <b>قبل انتهاء كل بريك بخمس دقائق</b>، نأمل من الجميع الاستعداد لبدء المحاضرة في موعدها وعدم التأخر.',
           'Please head back to the training rooms <b>5 minutes before the end of each break</b> and be ready for the next lecture on time. Please avoid being late.'],
  tape:['لحظة...','Wait...'],
  fgSub:['تأكد ما نسيت شي!','Did you forget anything?'],
  bubble:['خذ نظرة على مكانك قبل تطلع','Check your seat before you leave'],
  bonusTitle:['بونس <em>الأسبوع</em>','Weekly <em>Bonus</em>'],
  bonusSay:['كل يوم تحدي جديد، جمّع نقاطك قبل السبت!<small>A new challenge every day. Collect your points before Saturday!</small>','A new challenge every day. Collect your points before Saturday!'],
  cdD:['يوم','days'],cdH:['ساعة','hours'],cdM:['دقيقة','min'],cdS:['ثانية','sec'],
  heroesEyebrow:['فرق الأقسام · 2026–27','Department teams · 2026–27'],
  heroesTitle:['أبطال <em>نادي الذكاء الاصطناعي</em>','AI Club <em>Heroes</em>'],
  calEyebrow:['كل جلسات البرنامج · اللي أخذناها واللي جاية','Every program session · past and upcoming'],
  calToday:['اليوم','Today'],lgExam:['أسبوع الاختبارات','Exam week'],lgHol:['إجازة','Holiday'],lgToday:['اليوم','Today'],lgDone:['تم أخذها','Done'],calPrevLbl:['الشهر السابق','Previous month'],calNextLbl:['الشهر التالي','Next month'],
  motto:['لا نتعلم الذكاء الاصطناعي، نصنع أثره','We don’t just learn AI, we make an impact'],
  hint:['اسحب الشاشة أو استخدم الأسهم للتنقل','Swipe or use the arrow keys'],
  tabsLbl:['الشرائح','Slides'],
  langLbl:['English','العربية'],
  prevLbl:['السابق','Previous'],nextLbl:['التالي','Next'],
  playLbl:['إيقاف التنقل التلقائي','Pause auto-play'],pausedLbl:['تشغيل التنقل التلقائي','Start auto-play'],
  fullLbl:['ملء الشاشة','Full screen'],setLbl:['الإعدادات','Settings'],
  setTitle:['إعدادات الشاشة','Screen settings'],
  optLang:['اللغة','Language'],
  optAuto:['تبديل العربي والإنجليزي تلقائيًا','Alternate Arabic and English'],
  optDur:['مدة كل شريحة','Time per slide'],
  optSim:['تجربة وقت آخر','Preview another time'],
  optTime:['الوقت التجريبي','Preview time'],
  setNote:['التنبيهات تشتغل تلقائيًا: شريط «ارجعوا للقاعات» في آخر 5 دقائق من كل بريك، وتنبيه «لا تنسى أغراضك» الساعة 12:00 ظهرًا و2:45 العصر.',
           'Alerts run on their own: a “head back” banner in the last 5 minutes of each break, and the “don’t forget” reminder at 12:00 PM and 2:45 PM.'],
  setKeys:['<span class="kbd">← →</span> أو <span class="kbd">PgUp PgDn</span> للتنقل · <span class="kbd">1 2 3…</span> لشريحة معيّنة · <span class="kbd">مسافة</span> إيقاف · <span class="kbd">F</span> ملء الشاشة · <span class="kbd">L</span> اللغة',
           '<span class="kbd">← →</span> or <span class="kbd">PgUp PgDn</span> to move · <span class="kbd">1 2 3…</span> jump to a slide · <span class="kbd">Space</span> pause · <span class="kbd">F</span> full screen · <span class="kbd">L</span> language'],
};

/* ---------- helpers ---------- */
const $=id=>document.getElementById(id);
const T=s=>{const[h,m]=s.split(':').map(Number);return h*60+m};
const pad=n=>String(n).padStart(2,'0');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ap=h=>h<12?L('ص','AM'):L('م','PM');
function hm(min){let h=Math.floor(min/60),m=Math.round(min%60);if(m===60){h++;m=0}return `${pad(h%12||12)}:${pad(m)} ${ap(h)}`}
function hmB(min){const h=Math.floor(min/60);return `<bdi class="num">${pad(h%12||12)}:${pad(min%60)}</bdi> ${ap(h)}`}
function hmPlain(min){let h=Math.floor(min/60)%12||12;return `${pad(h)}:${pad(min%60)}`}
function mmss(min){const t=Math.max(0,Math.ceil(min*60));const h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;return h?`${h}:${pad(m)}:${pad(s)}`:`${pad(m)}:${pad(s)}`}
function dur(min){min=Math.round(min);const h=Math.floor(min/60),m=min%60;
  if(LANG==='en')return h?`${h} h${m?` ${m} min`:''}`:`${min} min`;
  if(min<60)return `${min} دقيقة`;return (h===1?'ساعة':h===2?'ساعتين':h+' ساعات')+(m?` و${m} دقيقة`:'')}
const mins=n=>L(`${n} دقيقة`,`${n} min`);
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const holidayOf=k=>HOLIDAYS.find(h=>k>=h.from&&k<=h.to)||null;
const ACTIVE=SESSIONS.filter(r=>!holidayOf(r[0])); // planned sessions that actually run
const SESS={};ACTIVE.forEach(r=>SESS[r[0]]=r);
const PLAN={};SESSIONS.forEach(r=>PLAN[r[0]]=r);
const DOW_AR=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'],DOW_EN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MON_AR=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],MON_EN=['January','February','March','April','May','June','July','August','September','October','November','December'];
const dow=x=>L(DOW_AR,DOW_EN)[x.getDay()];
const mon=i=>L(MON_AR,MON_EN)[i];
const dm=x=>`${x.getDate()}/${x.getMonth()+1}`;
const day=s=>new Date(s+'T00:00');
const fullDate=x=>L(`${dow(x)} ${x.getDate()} ${mon(x.getMonth())} ${x.getFullYear()}`,`${dow(x)}, ${x.getDate()} ${mon(x.getMonth())} ${x.getFullYear()}`);
const shortDate=x=>L(`${dow(x)} ${x.getDate()} ${mon(x.getMonth())}`,`${dow(x)}, ${x.getDate()} ${mon(x.getMonth())}`);
const delivery=d=>/in person/i.test(d)?[L('حضوري','In person'),'t']:/virtual/i.test(d)?[L('عن بُعد','Remote'),'o']:[d||'—',''];

/* ---------- time (real or simulated) ---------- */
let sim=store.get('ewa-sim',{on:false,time:'09:56'});
let simBase=Date.now();
function now(){
  const d=new Date();
  if(!sim.on)return d;
  const[h,m]=sim.time.split(':').map(Number);
  const s=new Date(d);s.setHours(h,m,0,0);
  return new Date(s.getTime()+(Date.now()-simBase));
}

/* ---------- SVG art ---------- */
const NODE='#E9EEF4',TEAL='#26B8B0',ORNG='#F2703D';
function line(pts,w=11){return `<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#DCE3EA" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`}
function dot(x,y,r,c=NODE){return `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`}
function beacon(x,y,r,c){return `<circle cx="${x}" cy="${y}" r="${r*2.1}" fill="none" stroke="${c}" stroke-opacity=".35" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${r*1.55}" fill="none" stroke="${c}" stroke-width="4"/>${dot(x,y,r,c)}`}
function robotHead(ox=0,oy=0,s=1,ant=TEAL){
  const P=p=>[ox+p[0]*s,oy+p[1]*s];
  const oct=[[85,120],[270,120],[296,157],[296,262],[258,302],[96,302],[58,262],[58,157],[85,120]].map(P);
  const face=[[177,157],[221,192],[214,247],[177,262],[140,247],[132,192],[177,157]].map(P);
  let g=line([P([177,58]),P([177,120])],11*s)+line(oct,11*s)+line([P([58,210]),P([18,210])],11*s)+line(face,7*s);
  g+=beacon(...P([177,44]),13*s,ant)+dot(...P([18,210]),16*s,TEAL);
  oct.slice(0,8).forEach(p=>g+=dot(p[0],p[1],11*s));
  face.slice(0,6).forEach((p,i)=>{if(i!==1&&i!==5)g+=dot(p[0],p[1],7*s)});
  [[132,192],[221,192]].map(P).forEach(p=>g+=`<circle cx="${p[0]}" cy="${p[1]}" r="${24*s}" fill="none" stroke="${TEAL}" stroke-width="${5*s}"/>`+dot(p[0],p[1],14*s));
  return g;
}
function logoSVG(){
  let g=robotHead(0,0,1);
  g+=line([[296,210],[408,210]])+dot(352,210,9,ORNG);
  g+=line([[520,120],[437,120],[408,152],[408,270],[437,302],[520,302]])+line([[408,210],[488,210]]);
  g+=dot(437,120,12)+dot(408,152,12)+dot(408,270,12)+dot(437,302,12)+dot(408,210,16)+dot(488,210,13)+dot(520,120,18,TEAL)+dot(520,302,18,TEAL);
  g+=line([[575,120],[626,302],[691,228],[757,302],[808,120]])+dot(626,302,13)+dot(691,228,13)+dot(757,302,13)+dot(575,120,18,TEAL)+dot(808,120,18,TEAL);
  g+=line([[862,302],[898,224],[946,120],[994,224],[1030,302]])+line([[898,224],[994,224]])+dot(898,224,13)+dot(994,224,13)+dot(862,302,18,TEAL)+dot(1030,302,18,TEAL)+beacon(946,120,16,ORNG);
  return g;
}
const AV=c=>`<svg viewBox="0 0 320 320" aria-hidden="true">${robotHead(-17,-15,1.05,c||ORNG)}</svg>`;
const ICON={
  cap:`<svg viewBox="0 0 64 64" fill="none" stroke="#E9EEF4" stroke-width="3" stroke-linejoin="round"><path d="M6 24l26-12 26 12-26 12z"/><path d="M17 30v13l15 7 15-7V30"/><path d="M58 24v15"/><circle cx="58" cy="41" r="3.5" fill="${TEAL}" stroke="none"/><circle cx="32" cy="12" r="3.5" fill="${ORNG}" stroke="none"/><circle cx="32" cy="50" r="3.5" fill="${TEAL}" stroke="none"/></svg>`,
  cube:`<svg viewBox="0 0 64 64" fill="none" stroke="#E9EEF4" stroke-width="3" stroke-linejoin="round"><path d="M32 6l22 13v26L32 58 10 45V19z"/><path d="M32 32V6M32 32l22-13M32 32L10 19M32 32v26M32 32l22 13M32 32L10 45" stroke-opacity=".7"/><circle cx="32" cy="32" r="5" fill="${ORNG}" stroke="none"/><circle cx="10" cy="45" r="3.5" fill="${TEAL}" stroke="none"/><circle cx="54" cy="45" r="3.5" fill="${TEAL}" stroke="none"/></svg>`,
  pen:`<svg viewBox="0 0 64 64" fill="none" stroke="#E9EEF4" stroke-width="3" stroke-linejoin="round"><path d="M18 10h28"/><path d="M22 10L14 30l18 22 18-22-8-20"/><path d="M32 52V34"/><circle cx="32" cy="30" r="4"/><circle cx="18" cy="10" r="4" fill="${TEAL}" stroke="none"/><circle cx="46" cy="10" r="4" fill="${TEAL}" stroke="none"/><circle cx="32" cy="54" r="4" fill="${ORNG}" stroke="none"/></svg>`,
  mic:`<svg viewBox="0 0 64 64" fill="none" stroke="#E9EEF4" stroke-width="3" stroke-linecap="round"><rect x="23" y="6" width="18" height="32" rx="9"/><path d="M14 30a18 18 0 0 0 36 0M32 48v8M22 57h20"/><circle cx="32" cy="7" r="4" fill="${ORNG}" stroke="none"/><circle cx="14" cy="30" r="3.5" fill="${TEAL}" stroke="none"/><circle cx="50" cy="30" r="3.5" fill="${TEAL}" stroke="none"/></svg>`,
  chat:`<svg viewBox="0 0 64 64" fill="none" stroke="#E9EEF4" stroke-width="3" stroke-linejoin="round"><path d="M10 14h44v30H26l-10 9v-9h-6z"/><circle cx="22" cy="29" r="3.5" fill="${TEAL}" stroke="none"/><circle cx="32" cy="29" r="3.5" fill="#E9EEF4" stroke="none"/><circle cx="42" cy="29" r="3.5" fill="${TEAL}" stroke="none"/><circle cx="52" cy="14" r="4" fill="${ORNG}" stroke="none"/></svg>`,
  card:`<svg class="ico" viewBox="0 0 100 100" fill="none" stroke-linejoin="round"><rect x="40" y="6" width="20" height="16" rx="4" fill="#C9D3DE"/><rect x="18" y="16" width="64" height="78" rx="9" fill="#F3F6FA"/><rect x="18" y="16" width="64" height="24" rx="9" fill="#5AA9E6"/><rect x="18" y="30" width="64" height="10" fill="#5AA9E6"/><text x="50" y="33" text-anchor="middle" font-family="Alexandria,sans-serif" font-size="11" font-weight="700" fill="#fff">EWA</text><circle cx="50" cy="56" r="10" fill="#1E2C44"/><path d="M36 76h28M40 84h20" stroke="#B5C1CF" stroke-width="4" stroke-linecap="round"/></svg>`,
  plug:`<svg class="ico" viewBox="0 0 100 100"><rect x="35" y="8" width="7" height="22" rx="3" fill="#B8C3CF"/><rect x="58" y="8" width="7" height="22" rx="3" fill="#B8C3CF"/><rect x="22" y="26" width="56" height="62" rx="12" fill="#F3F6FA"/><path d="M53 42l-10 15h9l-5 14 12-18h-9z" fill="#C9D3DE"/><rect x="40" y="80" width="20" height="5" rx="2" fill="#B8C3CF"/></svg>`,
  buds:`<svg class="ico" viewBox="0 0 100 100"><rect x="14" y="44" width="72" height="48" rx="20" fill="#F3F6FA"/><path d="M14 58h72" stroke="#C9D3DE" stroke-width="2"/><circle cx="50" cy="74" r="2.5" fill="#3DD68C"/><ellipse cx="34" cy="34" rx="11" ry="13" fill="#F3F6FA"/><rect x="31" y="34" width="7" height="22" rx="3.5" fill="#E2E8EF"/><ellipse cx="66" cy="34" rx="11" ry="13" fill="#F3F6FA"/><rect x="62" y="34" width="7" height="22" rx="3.5" fill="#E2E8EF"/><circle cx="37" cy="32" r="4" fill="#1E2C44"/><circle cx="63" cy="32" r="4" fill="#1E2C44"/></svg>`,
  cable:`<svg class="ico" viewBox="0 0 100 100" fill="none"><ellipse cx="52" cy="46" rx="30" ry="24" stroke="#F3F6FA" stroke-width="5"/><ellipse cx="52" cy="46" rx="22" ry="17" stroke="#DCE3EA" stroke-width="5"/><ellipse cx="52" cy="46" rx="14" ry="10" stroke="#F3F6FA" stroke-width="5"/><path d="M24 58c-6 10-8 18-6 26M80 56c6 10 6 20 2 28" stroke="#F3F6FA" stroke-width="5" stroke-linecap="round"/><rect x="12" y="80" width="13" height="16" rx="3" fill="#F3F6FA"/><rect x="76" y="80" width="13" height="16" rx="3" fill="#F3F6FA"/></svg>`,
};
function botSVG(){
  return `<defs><linearGradient id="shell" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C9D4E0"/></linearGradient></defs>
  <ellipse cx="100" cy="240" rx="54" ry="7" fill="#26B8B0" opacity=".25"/>
  <g class="arm"><rect x="146" y="112" width="20" height="44" rx="10" fill="url(#shell)" transform="rotate(-24 156 150)"/><circle cx="168" cy="106" r="13" fill="url(#shell)"/><rect x="164" y="80" width="8" height="22" rx="4" fill="url(#shell)"/></g>
  <rect x="34" y="150" width="20" height="46" rx="10" fill="url(#shell)" transform="rotate(16 44 150)"/>
  <rect x="58" y="136" width="84" height="78" rx="28" fill="url(#shell)"/>
  <text x="100" y="172" text-anchor="middle" font-family="Alexandria,sans-serif" font-size="15" font-weight="700" fill="#5D6E88">EWA</text>
  <text x="100" y="190" text-anchor="middle" font-family="Alexandria,sans-serif" font-size="11" font-weight="800" fill="#26B8B0">AI CLUB</text>
  <rect x="70" y="210" width="22" height="24" rx="9" fill="url(#shell)"/><rect x="108" y="210" width="22" height="24" rx="9" fill="url(#shell)"/>
  <circle cx="30" cy="76" r="15" fill="#13243F" stroke="#26B8B0" stroke-width="4"/><circle cx="170" cy="76" r="15" fill="#13243F" stroke="#26B8B0" stroke-width="4"/>
  <rect x="30" y="18" width="140" height="116" rx="50" fill="url(#shell)"/>
  <rect x="44" y="34" width="112" height="84" rx="36" fill="#0B1526"/>
  <g class="lids" stroke="#5FE0D6" stroke-width="7" stroke-linecap="round" fill="none" style="filter:drop-shadow(0 0 6px #26B8B0)">
    <path d="M66 78q11-15 22 0"/><path d="M112 78q11-15 22 0"/><path d="M90 96q10 8 20 0"/>
  </g>`;
}

/* ---------- static renders ---------- */
$('logo').innerHTML=logoSVG();
$('bot').innerHTML=botSVG();

const CLK=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`;
const IC_BOOK=`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z"/></svg>`;
const IC_CUP=`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6zM17 11h1.5a2.5 2.5 0 0 1 0 5H17M8 2c0 2 2 2 2 4M12 2c0 2 2 2 2 4"/></svg>`;
const IC_FORK=`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 2v8a2 2 0 0 0 4 0V2M9 12v10M17 2c-2 1.5-3 4-3 7v4h3v9"/></svg>`;
const IC_CHECK=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;

function renderSchedule(){
  const groups={};DAY.forEach((p,i)=>(groups[p.g]=groups[p.g]||[]).push(i));
  $('schGrid').innerHTML=Object.keys(groups).map(g=>{
    const rows=groups[g].map(i=>{const p=DAY[i];const len=T(p.e)-T(p.s);
      return `<div class="row ${p.type}" data-i="${i}">${p.type==='lec'?IC_BOOK:p.type==='lunch'?IC_FORK:IC_CUP}<div class="rn">${tx(p.name)} ${p.type!=='lec'?`<small>(${mins(len)})</small>`:''}</div><div class="rt">${hmPlain(T(p.s))} – ${hm(T(p.e))}</div></div>`}).join('');
    const brk=groups[g].map(i=>DAY[i]).find(p=>p.type!=='lec');
    const ret=brk?`<div class="ret">${CLK}<div>${L('التحضير للعودة','Head back at')}<b>${hm(T(brk.e)-RETURN_LEAD)}</b></div></div>`:`<div class="ret"><div>${L('نهاية اليوم','Day ends')}<b>${hm(T(DAY[DAY.length-1].e))}</b></div></div>`;
    return `<div class="panel grp"><div class="grp-n">${pad(g)}</div><div class="grp-rows">${rows}</div>${ret}</div>`}).join('');
}
function renderTimeline(){
  const a=T(DAY[0].s),b=T(DAY[DAY.length-1].e);
  let n=0;
  $('tl').innerHTML=DAY.map((p,i)=>{if(p.type==='lec')n++;return `<div class="tl-b ${p.type}" data-i="${i}" style="flex:${T(p.e)-T(p.s)}"><i class="fill"></i><span>${p.type==='lec'?L('محاضرة ','Lecture ')+n:p.type==='lunch'?L('غداء','Lunch'):''}</span></div>`}).join('')+'<div class="tl-now" id="tlNow"></div>';
  const marks=[];for(let m=a;m<b-20;m+=60)marks.push(`<span style="inset-inline-start:${(m-a)/(b-a)*100}%">${hmPlain(m)}</span>`);marks.push(`<span style="inset-inline-start:100%">${hmPlain(b)}</span>`);
  $('tlScale').innerHTML=marks.join('');
}
function renderItems(){
  $('items').innerHTML=ITEMS.map(it=>`<div class="panel item">${ICON[it.icon]}<b>${tx(it.name)}</b><span class="ck">${IC_CHECK}</span></div>`).join('');
}
function renderHeroes(){
  let n=0;
  $('leads').innerHTML=LEADS.map((l,i)=>`<div class="panel lead ${l.tone}" style="animation-delay:${i*90}ms"><span class="lead-av">${i<3?'<svg class="crown" viewBox="0 0 24 24" fill="currentColor"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/></svg>':''}${AV(l.tone==='orange'?ORNG:TEAL)}</span><div><span class="lead-role">${tx(l.role)}</span><b>${esc(tx(l.name))}</b></div></div>`).join('');
  const ST={approved:['ok',IC_CHECK+L('معتمد','Approved')],
            pending:['wait',`<b>${L('؟','?')}</b>`+L('مرشحون · من سيكون رئيس القسم؟','Candidates · who will lead?')],
            candidate:['cand',L('مرشح القسم','Candidate')]};
  $('hGrid').innerHTML=DEPTS.map(d=>{
    const ms=d.members.map((m,k)=>{n++;const nm=m.n||m,role=m.r;return `<span class="m" style="animation-delay:${k*70}ms">${AV(d.tone==='o'?ORNG:TEAL)}${esc(tx(nm))}${role?`<em>${tx(role)}</em>`:''}</span>`}).join('');
    return `<div class="panel dept ${d.tone}${d.status==='approved'?' is-ok':''}"><div class="dept-h"><span class="dept-ic">${ICON[d.icon]}</span><div><b>${tx(d.name)}</b><span class="en">${d.name[1]}</span></div><span class="cnt">${d.members.length}</span></div><span class="st ${ST[d.status][0]}">${ST[d.status][1]}</span><div class="mem">${ms}</div></div>`}).join('');
  const ok=DEPTS.filter(d=>d.status==='approved').length;
  $('hCount').textContent=L(`${n} بطل وبطلة · ${DEPTS.length} أقسام · ${ok} معتمد`,`${n} members · ${DEPTS.length} departments · ${ok} approved`);
}

/* ---------- bonus challenge ---------- */
function weekStart(d){const s=new Date(d);s.setHours(0,0,0,0);s.setDate(s.getDate()-s.getDay());return s}
const MODEL_COL=['#26B8B0','#9B7BFF','#3DD68C','#EDBB5C','#F2703D','#5AA9E6'];
function flowSVG(n){
  const tiles=[['#7FB8E8','<path d="M4 30l10-14 7 9 5-6 10 11z" fill="#fff" opacity=".9"/>'],['#C98B5A','<circle cx="20" cy="20" r="10" fill="#F4D3A8"/><path d="M11 13l2-8 5 6M29 13l-2-8-5 6" fill="#F4D3A8"/>'],['#3E7D3A','<circle cx="20" cy="20" r="6" fill="#6B3E12"/><circle cx="20" cy="20" r="12" fill="none" stroke="#F7C41A" stroke-width="5" stroke-dasharray="4 2"/>'],['#4A8C5E','<path d="M8 24c6-10 18-12 26-6-6 1-9 5-11 9z" fill="#1F7BC1"/><path d="M14 26c4 2 9 2 13 0" stroke="#F2703D" stroke-width="3"/>']];
  const H=200,ty=i=>12+i*47,my=i=>(H/(n+1))*(i+1);
  let g='';
  tiles.forEach((t,i)=>{g+=`<path d="M52 ${ty(i)+20} C110 ${ty(i)+20} 110 100 150 100" stroke="#26B8B0" stroke-opacity=".5" stroke-width="2" fill="none"/>`});
  for(let i=0;i<n;i++){g+=`<path d="M150 100 C190 100 190 ${my(i)} 230 ${my(i)}" stroke="${MODEL_COL[i]}" stroke-opacity=".7" stroke-width="2" fill="none"/><path d="M350 ${my(i)} C400 ${my(i)} 400 100 450 100" stroke="${MODEL_COL[i]}" stroke-opacity=".7" stroke-width="2" fill="none" class="flowline"/>`}
  tiles.forEach((t,i)=>{g+=`<g transform="translate(12 ${ty(i)})"><rect width="40" height="40" rx="7" fill="${t[0]}"/>${t[1]}</g>`});
  g+=`<circle cx="150" cy="100" r="6" fill="#26B8B0"/><circle cx="450" cy="100" r="6" fill="#EDBB5C"/>`;
  for(let i=0;i<n;i++){const y=my(i);g+=`<rect x="230" y="${y-14}" width="120" height="28" rx="8" fill="#0B1830" stroke="${MODEL_COL[i]}" stroke-width="1.5"/>`;
    for(let k=0;k<3;k++)for(let j=0;j<2;j++)g+=`<circle cx="${246+k*14}" cy="${y-6+j*12}" r="3" fill="${MODEL_COL[i]}"/>`;
    g+=`<rect x="298" y="${y-6}" width="36" height="3" rx="1.5" fill="${MODEL_COL[i]}" opacity=".7"/><rect x="298" y="${y+2}" width="24" height="3" rx="1.5" fill="${MODEL_COL[i]}" opacity=".5"/>`}
  g+=`<rect x="460" y="40" width="130" height="120" rx="12" fill="#F3F6FA"/><rect x="460" y="40" width="130" height="16" rx="8" fill="#DCE3EA"/>`;
  const hs=[30,48,40,66,56].slice(0,Math.max(3,Math.min(5,n)));
  hs.forEach((h,i)=>g+=`<rect x="${474+i*22}" y="${146-h}" width="14" height="${h}" rx="3" fill="${MODEL_COL[i]}"><animate attributeName="height" values="0;${h}" dur="1.2s" begin="${i*.15}s" fill="freeze"/><animate attributeName="y" values="146;${146-h}" dur="1.2s" begin="${i*.15}s" fill="freeze"/></rect>`);
  return `<svg viewBox="0 0 600 ${H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${g}</svg>`;
}
function pickBonusWeek(d){const k=iso(d);return BONUS_WEEKS.find(w=>k<=w.due)||BONUS_WEEKS[BONUS_WEEKS.length-1]}
const bwDue=w=>new Date(w.due+'T'+(w.dueTime||'23:59')+':00');
const bwDays=w=>[0,1,2,3,4].map(i=>{const x=day(w.start);x.setDate(x.getDate()+i);return x});
const IC_TROPHY=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/></svg>`;
const IC_FILE=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>`;
const IC_SEND=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>`;
let bwKey='',bwSel=null,bwPinned=0;
function renderBonus(d){
  const w=pickBonusWeek(d);if(!w)return;
  const days=bwDays(w),today=iso(d),due=bwDue(w);
  const posted=days.filter(x=>w.days[iso(x)]);
  // the selected day follows today unless someone tapped a day in the last 45 s
  if(!bwSel||Date.now()>bwPinned){const t=days.find(x=>iso(x)===today&&w.days[today]);bwSel=t?today:iso((posted.filter(x=>iso(x)<=today).pop()||posted[0]||days[0]))}
  const k=LANG+'|'+w.start+'|'+today+'|'+bwSel;
  if(k!==bwKey){bwKey=k;
    const s=day(w.start);
    $('bwRange').textContent=` · ${s.getDate()}–${due.getDate()} ${mon(due.getMonth())} ${due.getFullYear()}`;
    $('bwDue').innerHTML=`${IC_SEND}<span>${L('التسليم','Submit')}</span><b>${shortDate(due)}</b>`;
    $('bwDays').innerHTML=days.map((x,i)=>{const di=iso(x),c=w.days[di];
      const st=c?(di===today?'today':di<today?'done':'open'):(di<=today?'none':'soon');
      const lbl=c?(c.n?`Challenge ${c.n}`:c.title.replace(' Bonus Challenge','')):L(di<=today?'لا يوجد تحدي':'قريبًا',di<=today?'No challenge':'Coming soon');
      return `<button type="button" class="bw-day ${st}${di===bwSel?' sel':''}" data-d="${di}" role="tab" aria-selected="${di===bwSel}"><span class="bw-n">${L('اليوم','DAY')} ${i+1}</span><b>${dow(x)}</b><span class="bw-dt num">${dm(x)}</span><span class="bw-l">${esc(lbl)}</span>${c&&c.points?`<span class="bw-pts">+${c.points}</span>`:''}</button>`}).join('');
    renderChallengeCard(w,day(bwSel),w.days[bwSel],today);
    $('dlDate').textContent=`${fullDate(due)} · ${hm(T(w.dueTime||'23:59'))}`;
    $('winA').textContent=L(`البداية ${dm(s)}`,`Start ${dm(s)}`);$('winB').textContent=L(`التسليم ${dm(due)}`,`Due ${dm(due)}`);
    $('chBot').innerHTML=AV(TEAL);
  }
  const s=day(w.start),done=d>due,left=Math.max(0,due-d)/1000;
  $('dl').classList.toggle('done',done);
  $('dlLbl').textContent=done?L('انتهى تسليم الأسبوع · بانتظار تحديات الأسبوع الجاي','This week is closed · new challenges coming'):L('آخر موعد لتسليم تحديات الأسبوع','Deadline for this week’s challenges');
  $('cdD').textContent=Math.floor(left/86400);$('cdH').textContent=pad(Math.floor(left%86400/3600));$('cdM').textContent=pad(Math.floor(left%3600/60));$('cdS').textContent=pad(Math.floor(left%60));
  $('winBar').style.width=(Math.min(1,Math.max(0,(d-s)/(due-s)))*100).toFixed(2)+'%';
}
function renderChallengeCard(w,x,c,today){
  const el=$('ch');const di=iso(x);
  $('dlPoster').innerHTML=c&&c.poster?`<button type="button" class="poster" data-poster="${c.poster}" aria-label="${L('تكبير صورة التحدي','Open challenge poster')}"><img src="${POSTERS[c.poster]}" alt="${esc(c.title)}"><span class="scan"></span><span class="zoom">${L('اضغط للتكبير','Tap to enlarge')}</span></button>`:'';
  $('dl').classList.toggle('has-poster',!!(c&&c.poster));
  if(!c){el.className='panel ch empty';
    el.innerHTML=`<div class="ch-wait"><span class="ch-code">&gt; day_${pad(bwDays(w).findIndex(y=>iso(y)===di)+1)}.challenge<i class="caret"></i></span><b>${L(`تحدي ${dow(x)}`,`${dow(x)}’s challenge`)}</b><p>${di<=today?L('ما فيه تحدي بونس مسجّل لهذا اليوم.','No bonus challenge was posted for this day.'):L('بانتظار تحدي الدكتور… جهّز نفسك!','Waiting for the instructor’s challenge… get ready!')}</p></div>`;return}
  el.className='panel ch';
  const badge=c.n?`CHALLENGE ${c.n}`:L('تحدي اليوم','DAILY CHALLENGE');
  let body='';
  if(c.kind==='tasks'){
    body=`<ol class="tasks">${c.tasks.map((t,i)=>`<li style="animation-delay:${i*70}ms"><span class="tn">${pad(i+1)}</span><span class="tt">${esc(t)}</span></li>`).join('')}</ol>
      <div class="ch-meta">
        <span>${IC_FILE}<small>Required file</small><b>${esc(c.file)}</b></span>
        <span>${CLK}<small>Deadline</small><b>${esc(c.deadline)}</b></span>
        <span>${IC_SEND}<small>Submit via</small><b>${esc(c.via)}</b></span>
      </div>`;
  }else{
    const models=SESSIONS.filter(r=>r[1]===c.week&&r[4]).map(r=>r[4]);
    body=`<p class="ch-desc">${esc(tx(c.desc))}${LANG==='ar'?`<small>${esc(c.desc[1])}</small>`:''}</p>
      <div class="steps">${c.steps.map((st,i)=>`<div class="step"><span class="n">${i+1}</span><div><b>${esc(tx(st))}</b>${LANG==='ar'?`<span>${esc(st[1])}</span>`:''}</div></div>`).join('')}</div>
      ${models.length?`<div class="models"><span>${L(`نماذج الأسبوع ${c.week}:`,`Week ${c.week} models:`)}</span>${models.map((m,i)=>`<span class="model"><i style="background:${MODEL_COL[i%MODEL_COL.length]}"></i>${esc(m)}</span>`).join('')}</div>`:''}
      <div class="flow">${flowSVG(Math.max(3,Math.min(5,models.length||4)))}</div>
      ${c.say?`<p class="ch-quote" dir="ltr">“${esc(c.say)}”</p>`:''}`;
  }
  el.innerHTML=`<div class="ch-main">
      <div class="ch-top"><span class="ch-badge">${IC_TROPHY}<span>${badge}</span></span>${c.points?`<span class="ch-pts">${IC_TROPHY}<b>${c.points}</b> BONUS POINTS</span>`:''}<span class="ch-date">${shortDate(x)}</span></div>
      <h3 class="ch-title">${esc(c.title)}</h3>
      <p class="ch-ar">${esc(L(c.ar,c.sub||''))}</p>${LANG==='ar'&&c.sub?`<p class="ch-sub" dir="ltr">${esc(c.sub)}</p>`:''}
      ${body}
    </div>
`;
}
$('bwDays').addEventListener('click',e=>{const b=e.target.closest('.bw-day');if(!b)return;bwSel=b.dataset.d;bwPinned=Date.now()+45000;holdManual(45000);bwKey='';renderBonus(now())});
// poster lightbox
function openPoster(id){const lb=$('lightbox');$('lbImg').src=POSTERS[id];lb.hidden=false;holdManual(60000);$('lbClose').focus()}
function closePoster(){$('lightbox').hidden=true}
$('dlPoster').addEventListener('click',e=>{const p=e.target.closest('.poster');if(p)openPoster(p.dataset.poster)});
$('lightbox').addEventListener('click',e=>{if(e.target.id!=='lbImg')closePoster()});

/* ---------- week ---------- */
let weekKey='';
function renderWeek(d){
  const k=iso(d);if(LANG+k===weekKey)return;weekKey=LANG+k;
  const days5=s=>[0,1,2,3,4].map(i=>{const x=new Date(s);x.setDate(s.getDate()+i);return x});
  let days=days5(weekStart(d)),rows=days.map(x=>SESS[iso(x)]),next=false;
  if(!rows.some(Boolean)||d.getDay()>4){ // weekend or holiday week → show next scheduled week
    const nxt=ACTIVE.find(r=>r[0]>k);
    if(nxt){days=days5(weekStart(day(nxt[0])));rows=days.map(x=>SESS[iso(x)]);next=true}
  }
  const wk=rows.find(Boolean)?.[1];
  $('wkTitle').innerHTML=L(`جلسات <em>${next?'الأسبوع الجاي':'هذا الأسبوع'}${wk?` · ${wk}`:''}</em>`,`${next?'Next week':'This week'} <em>${wk?`· Week ${wk}`:''}</em>`);
  $('wkRange').textContent=`${days[0].getDate()} ${mon(days[0].getMonth())} – ${days[4].getDate()} ${mon(days[4].getMonth())} ${days[4].getFullYear()}`;
  $('wGrid').innerHTML=days.map((x,i)=>{const r=rows[i];const di=iso(x);const cls=di===k?'today':di<k?'past':'';
    const head=`<div class="wd-h"><b>${dow(x)}</b><span class="num">${dm(x)}</span></div>`;
    const hol=holidayOf(di);
    if(hol)return `<div class="panel wd hol ${cls}">${head}${cls==='today'?`<span class="badge-today">${L('اليوم','Today')}</span>`:''}<span class="hol-tag">${tx(hol.name)}</span><div class="tp none">${L('ما فيه تدريب','No training')}</div></div>`;
    if(!r)return `<div class="panel wd ${cls}">${head}<div class="tp none">${L('لا توجد جلسة','No session')}</div></div>`;
    const[dl,dc]=delivery(r[6]);
    return `<div class="panel wd ${cls}">${head}${cls==='today'?`<span class="badge-today">${L('اليوم','Today')}</span>`:''}<div class="code">${esc(r[3]?r[3]+' · ':'')}${esc(r[2])}</div><div class="tp">${esc(r[4]||r[2])}</div><div class="who">${esc(r[5])}</div><div class="tags"><span class="tag ${dc}">${dl}</span></div></div>`}).join('');
  const cnt=rows.filter(Boolean).length,modes=[...new Set(rows.filter(Boolean).map(r=>delivery(r[6])[0]))];
  $('wFoot').innerHTML=`<span class="tag t">${L(`${cnt} جلسات`,`${cnt} sessions`)}</span>`+(modes.length?`<span>${L('طريقة الحضور: ','Attendance: ')}${modes.join(L(' و',' & '))}</span>`:'')+`<span class="src">${L('المصدر: خطة دبلوم الذكاء الاصطناعي','Source: AI Association Degree plan')}</span>`;
}

/* ---------- calendar ---------- */
const UNIT_COL={'AIT-101':'#26B8B0','AIT-102':'#E5484D','AIT-103':'#5AA9E6','AIT-104':'#3D8BFF','AIT-105':'#9B7BFF','AIT-106':'#3DD68C','AIT-107':'#F2703D','AIT-108':'#EDBB5C','AIT-109':'#E36FB0','AIT-110':'#5FE0D6','AIT-111':'#C9A8FF'};
const unitCol=u=>UNIT_COL[u]||'#93A4BC';
const isExam=r=>!!(r&&/^Exam/i.test(r[2]||''));
let calSwipedAt=0,calMonth=null,calSel=null,calKey='',calManual=0,hjDay=null,hjMonth=null,hjYear=null,hjFull=null;
function makeHijriCal(){
  const loc=L('ar-SA','en')+'-u-ca-islamic-umalqura-nu-latn';
  try{hjDay=new Intl.DateTimeFormat(loc,{day:'numeric'});hjMonth=new Intl.DateTimeFormat(loc,{month:'long'});hjYear=new Intl.DateTimeFormat(loc,{year:'numeric'});hjFull=new Intl.DateTimeFormat(loc,{day:'numeric',month:'long',year:'numeric'})}catch(e){hjDay=hjMonth=hjYear=hjFull=null}
}
const hj=(f,x)=>f?f.format(x):'';
// program months, for the quick-jump strip
const CAL_MONTHS=(()=>{const a=day(SESSIONS[0][0]),b=day(SESSIONS[SESSIONS.length-1][0]);const out=[];for(let m=new Date(a.getFullYear(),a.getMonth(),1);m<=b;m=new Date(m.getFullYear(),m.getMonth()+1,1))out.push(m);return out})();
function calCell(x,month,today){
  const k=iso(x),r=PLAN[k],hol=holidayOf(k),wd=x.getDay(),ex=isExam(r)&&!hol;
  const cls=['cd-day',x.getMonth()!==month?'other':'',k===today?'today':'',k<today?'past':'',wd>4?'wkend':'',hol?'hol':'',ex?'exam':'',k===calSel?'sel':''].filter(Boolean).join(' ');
  let inner=`<span class="cd-top"><span class="cd-n num">${x.getDate()}</span><span class="cd-h num">${hj(hjDay,x)}</span></span>`;
  if(wd===0&&r&&r[1])inner+=`<span class="cd-wk">W${r[1]}</span>`;
  if(hol)inner+=`<span class="cd-hol">${tx(hol.name)}</span>`;
  if(ex)inner+=`<span class="cd-exam">${L('اختبار','Exam')} · ${esc(r[2].replace(/\D/g,''))}</span><span class="cd-s ex"><span>${esc(r[4]||r[2])}</span></span>`;
  else if(r&&r[4]){inner+=`<span class="cd-s${hol?' off':''}" style="--u:${unitCol(r[3])}"><b>${esc(r[3]||r[2])}</b><span>${esc(r[4])}</span></span>`}
  if(r&&k<today&&!hol)inner+=`<i class="cd-ok" aria-hidden="true">${IC_CHECK}</i>`;
  return `<button type="button" class="${cls}" data-d="${k}">${inner}</button>`;
}
function renderCalendar(d,force){
  const today=iso(d);
  if(!calMonth||(!force&&Date.now()>calManual&&slides[cur]?.id!=='s-cal')){calMonth=new Date(d.getFullYear(),d.getMonth(),1);calSel=today}
  const k=LANG+'|'+iso(calMonth)+'|'+calSel+'|'+today;
  if(k===calKey)return;calKey=k;
  if(!hjDay)makeHijriCal();
  const m=calMonth.getMonth(),y=calMonth.getFullYear(),last=new Date(y,m+1,0);
  const h1=hj(hjMonth,calMonth),h2=hj(hjMonth,last),hy=hj(hjYear,last);
  $('calTitle').innerHTML=L(`التقويم <em>${mon(m)} ${y}</em>`,`Calendar <em>${mon(m)} ${y}</em>`)+(h1?`<small class="cal-hj">${h1===h2?h1:h1+' – '+h2} ${hy}</small>`:'');
  // quick-jump strip
  const curM=today.slice(0,7);
  $('calMonths').innerHTML=CAL_MONTHS.map(x=>{const km=iso(x).slice(0,7);const ex=SESSIONS.some(r=>r[0].startsWith(km)&&isExam(r));const ho=HOLIDAYS.some(h=>h.from.slice(0,7)<=km&&h.to.slice(0,7)>=km);
    return `<button type="button" class="cm${km===iso(calMonth).slice(0,7)?' sel':''}${km===curM?' now':''}${km<curM?' past':''}" data-m="${km}"><b>${L(MON_AR,MON_EN)[x.getMonth()].slice(0,LANG==='ar'?20:3)}</b><span class="num">${x.getFullYear()}</span><i class="dots">${ex?'<i class="dx"></i>':''}${ho?'<i class="dh"></i>':''}</i></button>`}).join('');
  try{$('calMonths').querySelector('.cm.sel').scrollIntoView({block:'nearest',inline:'center'})}catch(e){}
  $('calDow').innerHTML=[0,1,2,3,4,5,6].map(i=>`<span class="${i>4?'wkend':''}">${L(DOW_AR,DOW_EN)[i]}</span>`).join('');
  const start=new Date(y,m,1);start.setDate(1-start.getDay());
  const cells=[];
  for(const x=new Date(start);x<=last||x.getDay()!==0;x.setDate(x.getDate()+1))cells.push(new Date(x));
  $('calGrid').style.setProperty('--rows',cells.length/7);
  $('calGrid').innerHTML=cells.map(x=>calCell(x,m,today)).join('');
  // agenda list for small screens
  const inMonth=cells.filter(x=>x.getMonth()===m&&(PLAN[iso(x)]||holidayOf(iso(x))&&x.getDay()<5));
  $('calList').innerHTML=inMonth.length?inMonth.map(x=>{const kk=iso(x),r=PLAN[kk],hol=holidayOf(kk),ex=isExam(r)&&!hol;
    return `<button type="button" class="cl-row${kk===today?' today':''}${kk<today?' past':''}${hol?' hol':''}${ex?' exam':''}${kk===calSel?' sel':''}" data-d="${kk}" style="--u:${unitCol(r?.[3])}"><span class="cl-d"><b>${x.getDate()}</b>${dow(x)}<small class="num">${hj(hjDay,x)} ${hj(hjMonth,x)}</small></span><span class="cl-t">${hol?`<em>${tx(hol.name)}</em>`:''}${ex?`<em class="ex">${L('اختبار','Exam')} ${esc(r[2].replace(/\D/g,''))}</em>`:''}${r&&(r[4]||ex)?`<span${hol?' class="off"':''}>${esc(r[4]||r[2])}</span>`:''}</span></button>`}).join(''):`<p class="cl-empty">${L('ما فيه جلسات بهالشهر','No sessions this month')}</p>`;
  renderCalSide(d);
}
function renderCalSide(d){
  const today=iso(d),x=day(calSel),r=PLAN[calSel],hol=holidayOf(calSel),ex=isExam(r)&&!hol;
  const st=hol?['hol',L('إجازة','Day off')]:ex?['exam',L('اختبار','Exam')]:!r?['none',L('ما فيه جلسة','No session')]:calSel<today?['done',L('تم أخذها','Completed')]:calSel===today?['now',L('اليوم','Today')]:['soon',L('قادمة','Upcoming')];
  let h=`<div class="cs-date"><span class="num">${x.getDate()}</span><div><b>${dow(x)}</b><span>${mon(x.getMonth())} ${x.getFullYear()}</span><span class="cs-hj">${hj(hjFull,x)}</span></div><span class="cs-st ${st[0]}">${st[1]}</span></div>`;
  if(hol)h+=`<p class="cs-hol">${tx(hol.name)}</p>`;
  if(ex)h+=`<p class="cs-exam">${L('أسبوع الاختبارات','Exam week')} · ${esc(r[2])}</p>`;
  if(r&&(r[4]||ex)){const[dl,dc]=delivery(r[6]);
    h+=`<div class="cs-topic${hol?' off':''}${ex?' ex':''}" style="--u:${ex?'var(--gold)':unitCol(r[3])}"><span class="cs-code">${esc(r[3]?r[3]+' · ':'')}${/^\d/.test(r[2])?'Session '+esc(r[2]):esc(r[2])}</span><b>${esc(r[4]||r[2])}</b></div>
      <div class="tags">${r[5]?`<span class="tag">${esc(r[5])}</span>`:''}<span class="tag ${dc}">${dl}</span>${r[1]?`<span class="tag g">${L('الأسبوع ','Week ')}${r[1]}</span>`:''}</div>`;
    if(hol)h+=`<p class="cs-note">${L('الجلسة المخططة لهذا اليوم ما راح تصير بسبب الإجازة.','The session planned for this day won’t run because of the holiday.')}</p>`;}
  else if(!hol)h+=`<p class="cs-note">${x.getDay()>4?L('عطلة نهاية الأسبوع.','Weekend.'):L('ما فيه جلسة مسجلة في خطة البرنامج.','Nothing planned in the program for this day.')}</p>`;
  const ws=weekStart(x);const wk=[0,1,2,3,4].map(i=>{const y=new Date(ws);y.setDate(ws.getDate()+i);return y});
  h+=`<h4>${L('أسبوعها','That week')}</h4><ul class="cs-week">${wk.map(y=>{const kk=iso(y),rr=PLAN[kk],hh=holidayOf(kk),ee=isExam(rr)&&!hh;return `<li class="${kk===calSel?'sel':''}${kk<today?' past':''}${hh?' hol':''}${ee?' exam':''}" data-d="${kk}"><span>${dow(y)} ${dm(y)}</span><b>${hh?tx(hh.name):rr&&(rr[4]||ee)?esc(rr[4]||rr[2]):'—'}</b></li>`}).join('')}</ul>`;
  const m=calMonth.getMonth(),y=calMonth.getFullYear();
  const ms=SESSIONS.filter(rr=>{const dd=day(rr[0]);return dd.getMonth()===m&&dd.getFullYear()===y&&(rr[4]||isExam(rr))&&!holidayOf(rr[0])});
  const done=ms.filter(rr=>rr[0]<today).length;
  h+=`<div class="cs-sum"><span><b class="num">${ms.length}</b>${L('جلسة بالشهر','sessions')}</span><span><b class="num">${done}</b>${L('تم أخذها','completed')}</span><span><b class="num">${ms.length-done}</b>${L('باقية','to go')}</span></div>`;
  $('calSide').innerHTML=h;
}
function calGo(month,sel){calMonth=month;const t=iso(now());const first=iso(calMonth);calSel=sel||((t.slice(0,7)===first.slice(0,7))?t:first);calManual=Date.now()+90000;holdManual(90000);calKey='';renderCalendar(now(),true)}
function calShift(n){calGo(new Date(calMonth.getFullYear(),calMonth.getMonth()+n,1))}
$('calPrev').addEventListener('click',()=>calShift(-1));
$('calNext').addEventListener('click',()=>calShift(1));
$('calToday').addEventListener('click',()=>{calMonth=null;calManual=0;calKey='';renderCalendar(now(),true)});
$('calMonths').addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(b)calGo(day(b.dataset.m+'-01'))});
['calGrid','calList','calSide'].forEach(id=>$(id).addEventListener('click',e=>{if(Date.now()-calSwipedAt<400)return;const b=e.target.closest('[data-d]');if(!b)return;const dd=day(b.dataset.d);calGo(dd.getMonth()!==calMonth.getMonth()?new Date(dd.getFullYear(),dd.getMonth(),1):calMonth,b.dataset.d)}));
// swipe on the month grid flips months instead of slides
(()=>{const g=$('calGrid').parentElement;let x0=null,y0=0;
  g.addEventListener('pointerdown',e=>{x0=e.clientX;y0=e.clientY},true);
  g.addEventListener('pointerup',e=>{if(x0==null)return;const dx=e.clientX-x0;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(e.clientY-y0)){calSwipedAt=Date.now();calShift((LANG==='ar'?dx>0:dx<0)?1:-1)}x0=null},true);
})();

/* ---------- live status ---------- */
function status(d){
  const wd=d.getDay(),m=d.getHours()*60+d.getMinutes()+d.getSeconds()/60;
  const a=T(DAY[0].s),b=T(DAY[DAY.length-1].e);
  if(wd>4)return{mode:'off',m};
  const hol=holidayOf(iso(d));if(hol)return{mode:'holiday',m,hol};
  if(m<a)return{mode:'before',m,left:a-m,next:DAY[0]};
  if(m>=b)return{mode:'after',m};
  const i=DAY.findIndex(p=>m>=T(p.s)&&m<T(p.e)),p=DAY[i];
  const total=T(p.e)-T(p.s),left=T(p.e)-m;
  return{mode:'live',m,i,p,left,total,frac:1-left/total,next:DAY[i+1],returnSoon:p.type!=='lec'&&left<=RETURN_LEAD};
}
function forgetTime(st){
  if(st.mode==='off'||st.mode==='holiday')return false;
  return FORGET_AT.some(t=>st.m>=T(t)&&st.m<T(t)+FORGET_MIN);
}
function nextWorkSession(d){const k=iso(d);return ACTIVE.find(r=>r[0]>k)}

function updateLive(d,st){
  const box=$('now');box.className='panel now';
  let kind='',name='',range='',msg='',ringNum='--:--',ringLbl='',frac=0;
  if(st.mode==='live'){
    const p=st.p;box.classList.add('k-'+p.type);if(st.returnSoon)box.classList.add('urgent');
    kind={lec:L('محاضرة جارية الآن','Lecture in progress'),brk:L('بريك الآن','Break time'),lunch:L('استراحة الغداء الآن','Lunch break')}[p.type];
    name=tx(p.name);range=`${hmB(T(p.s))} – ${hmB(T(p.e))}`;
    ringNum=mmss(st.left);ringLbl=L('متبقي','left');frac=st.frac;
    if(p.type==='lec')msg=st.next?L(`بعدها: <b>${tx(st.next.name)}</b> الساعة ${hm(T(st.next.s))}`,`Next: <b>${tx(st.next.name)}</b> at ${hm(T(st.next.s))}`)
                                 :L(`آخر محاضرة لليوم، ينتهي اليوم <b>${hm(T(p.e))}</b>`,`Last lecture today, the day ends at <b>${hm(T(p.e))}</b>`);
    else if(st.returnSoon)msg=L('<b>حان وقت التحضير للعودة</b> توجّهوا للقاعات الآن','<b>Time to head back</b> to the training rooms');
    else msg=L(`التحضير للعودة الساعة <b>${hm(T(p.e)-RETURN_LEAD)}</b> · استمتعوا بالاستراحة`,`Head back at <b>${hm(T(p.e)-RETURN_LEAD)}</b> · enjoy your break`);
  }else if(st.mode==='before'){
    kind=L('قبل بداية اليوم','Before the day starts');name=L('صباح الخير!','Good morning!');
    range=L(`المحاضرة الأولى ${hmB(T(DAY[0].s))}`,`Lecture 1 at ${hmB(T(DAY[0].s))}`);
    ringNum=mmss(st.left);ringLbl=L('على البداية','to start');
    msg=L(`جهّز أغراضك، اليوم يبدأ بعد <b>${dur(st.left)}</b>`,`Get your things ready, the day starts in <b>${dur(st.left)}</b>`);
  }else if(st.mode==='after'){
    kind=L('انتهى اليوم التدريبي','Training day is over');name=L('يعطيكم العافية','Great work today');
    range=L(`انتهت المحاضرة السادسة ${hmB(T(DAY[DAY.length-1].e))}`,`Lecture 6 ended at ${hmB(T(DAY[DAY.length-1].e))}`);
    ringNum='✓';ringLbl=L('تم بنجاح','Done');frac=1;
    msg=L('قبل تطلع: <b>بطاقتك، الشاحن، السماعات، والسلك</b>','Before you leave: <b>ID card, charger, earbuds and cable</b>');
  }else if(st.mode==='holiday'){
    const n=nextWorkSession(d);kind=L('ما فيه تدريب اليوم','No training today');name=tx(st.hol.name);
    range=n?L(`نرجع ${shortDate(day(n[0]))}`,`Back on ${shortDate(day(n[0]))}`):'';
    ringNum='☀';ringLbl=L('إجازة','Day off');
  }else{
    const n=nextWorkSession(d);kind=L('إجازة نهاية الأسبوع','Weekend');name=L('استمتعوا بالإجازة','Enjoy the weekend');
    range=n?L(`نرجع ${shortDate(day(n[0]))}`,`Back on ${shortDate(day(n[0]))}`):'';
    ringNum='☾';ringLbl=L('إجازة','Weekend');
  }
  $('nowKind').textContent=kind;$('nowName').textContent=name;$('nowRange').innerHTML=range;$('nowMsg').innerHTML=msg;
  $('ringNum').textContent=ringNum;$('ringLbl').textContent=ringLbl;
  $('ringP').style.strokeDashoffset=(301.6*(1-frac)).toFixed(1);
  $('nowBar').style.width=(frac*100).toFixed(2)+'%';

  // next
  const nx=st.mode==='live'?st.next:st.mode==='before'?DAY[0]:null;
  if(nx){$('nextName').textContent=tx(nx.name);$('nextMeta').innerHTML=`<span class="num">${hm(T(nx.s))}</span><span>${L('بعد ','in ')}${dur(T(nx.s)-st.m)}</span>${nx.type!=='lec'?`<span class="tag g">${mins(T(nx.e)-T(nx.s))}</span>`:''}`}
  else{const n=nextWorkSession(d);$('nextName').textContent=n?shortDate(day(n[0])):'—';$('nextMeta').innerHTML=n?`<span>${tx(DAY[0].name)}</span><span class="num">${hm(T(DAY[0].s))}</span>`:''}

  // today's program session
  const r=SESS[iso(d)];
  if(r){const[dl,dc]=delivery(r[6]);$('tdTopic').textContent=r[4]||r[2];$('tdTags').innerHTML=`${r[3]?`<span class="tag t">${esc(r[3])}</span>`:''}<span class="tag">${/^\d/.test(r[2])?'Session '+esc(r[2]):esc(r[2])}</span>${r[5]?`<span class="tag">${esc(r[5])}</span>`:''}<span class="tag ${dc}">${dl}</span>${r[1]?`<span class="tag g">${L('الأسبوع ','Week ')}${r[1]}</span>`:''}`}
  else{const n=nextWorkSession(d);$('tdTopic').textContent=n?(n[4]||n[2]):'—';$('tdTags').innerHTML=`<span class="tag o">${L('لا توجد جلسة اليوم','No session today')}</span>${n?`<span class="tag">${L('القادمة: ','Next: ')}${day(n[0]).getDate()} ${mon(day(n[0]).getMonth())}</span>`:''}`}
  const ups=ACTIVE.filter(x=>x[0]>iso(d)).slice(0,3);
  $('tdUp').innerHTML=ups.length?`<h4>${L('الجلسات القادمة','Upcoming sessions')}</h4>`+ups.map(x=>{const dd=day(x[0]);return `<div class="up-r"><b>${dow(dd)} ${dm(dd)}</b><span>${esc(x[4]||x[2])}</span></div>`}).join(''):'';

  // timeline
  const a=T(DAY[0].s),b=T(DAY[DAY.length-1].e);
  document.querySelectorAll('.tl-b').forEach((el,i)=>{const e=T(DAY[i].e);
    el.classList.toggle('past',st.mode==='after'||(st.mode==='live'&&st.m>=e));
    el.classList.toggle('cur',st.mode==='live'&&st.i===i);
    el.querySelector('.fill').style.width=(st.mode==='live'&&st.i===i?st.frac*100:0)+'%'});
  const tn=$('tlNow');tn.hidden=st.mode!=='live';tn.style.insetInlineStart=(Math.min(1,Math.max(0,(st.m-a)/(b-a)))*100)+'%';

  // schedule rows
  document.querySelectorAll('#schGrid .row').forEach(el=>{const i=+el.dataset.i,e=T(DAY[i].e);
    el.classList.toggle('done',st.mode==='after'||(st.mode==='live'&&st.m>=e));el.classList.toggle('cur',st.mode==='live'&&st.i===i)});
  document.querySelectorAll('#schGrid .grp').forEach(g=>{const c=g.querySelector('.row.cur');g.classList.toggle('cur',!!c);g.classList.toggle('brk-now',!!c&&!c.classList.contains('lec'))});

  // alert banner
  const al=$('alert');
  al.classList.remove('fg-alert');$('alertNum').hidden=false;
  if(forgetTime(st)){al.classList.add('show','fg-alert');$('alertNum').hidden=true;$('alertTxt').textContent=L('لحظة… تأكد ما نسيت شي! بطاقتك، الشاحن، السماعات، والسلك','Wait… did you forget anything? ID card, charger, earbuds and cable')}
  else if(st.mode==='live'&&st.returnSoon){al.classList.add('show');$('alertTxt').textContent=L(`التحضير للعودة · ${tx(st.p.name)} ينتهي ${hm(T(st.p.e))}`,`Head back · ${tx(st.p.name)} ends at ${hm(T(st.p.e))}`);$('alertNum').textContent=mmss(st.left)}
  else al.classList.remove('show');
}

/* ---------- header clock ---------- */
let hijri=null;
function makeHijri(){try{hijri=new Intl.DateTimeFormat(L('ar-SA','en')+'-u-ca-islamic-umalqura-nu-latn',{day:'numeric',month:'long',year:'numeric'})}catch(e){hijri=null}}
function updateClock(d){
  const h=d.getHours();$('clk').textContent=`${pad(h%12||12)}:${pad(d.getMinutes())}`;$('clkS').textContent=pad(d.getSeconds());$('clkAP').textContent=ap(h);
  $('dDay').textContent=fullDate(d);
  $('dHijri').textContent=hijri?hijri.format(d):'';
  document.body.classList.toggle('sim-on',!!sim.on);
}

/* ---------- slides ---------- */
// Slides switched off for now: put an id back to show that slide again
const HIDDEN_SLIDES=['s-heroes'];
const allSlides=[...document.querySelectorAll('.slide')];
const SLIDE_TABS=allSlides.map((s,i)=>TABS[i]).filter((t,i)=>!HIDDEN_SLIDES.includes(allSlides[i].id));
allSlides.forEach(s=>{if(HIDDEN_SLIDES.includes(s.id))s.hidden=true});
const slides=allSlides.filter(s=>!HIDDEN_SLIDES.includes(s.id));
let cur=0,playing=store.get('ewa-play',true),dwell=store.get('ewa-dur',15)*1000,autoLang=store.get('ewa-autolang',false),shownAt=Date.now(),manualUntil=0,lastForget=false;
$('tabs').innerHTML=slides.map((s,i)=>`<button class="tab" type="button" data-i="${i}"><span></span><i class="pg"></i></button>`).join('');
const tabs=[...document.querySelectorAll('.tab')];
function go(i,back){
  i=(i+slides.length)%slides.length;
  slides[cur].classList.remove('on','back');
  cur=i;const s=slides[cur];s.style.transform='';s.classList.toggle('back',!!back);
  void s.offsetWidth;s.classList.add('on');
  tabs.forEach((t,k)=>t.classList.toggle('on',k===cur));
  try{tabs[cur].scrollIntoView({block:'nearest',inline:'nearest'})}catch(e){}
  shownAt=Date.now();
  if(s.id==='s-forget')animateChecks();
  if(s.id==='s-heroes')renderHeroes();
}
function holdManual(ms){manualUntil=Date.now()+ms}
function step(dir){go(cur+dir,dir<0);holdManual(45000);osd()}
let osdT=0;function osd(){const o=$('osd');o.textContent=`${cur+1} / ${slides.length} · ${tx(SLIDE_TABS[cur])}`;o.classList.add('show');clearTimeout(osdT);osdT=setTimeout(()=>o.classList.remove('show'),1400)}
let checkTimers=[];
function animateChecks(){
  checkTimers.forEach(clearTimeout);checkTimers=[];
  const its=[...document.querySelectorAll('.item')];its.forEach(x=>x.classList.remove('ok'));
  its.forEach((x,k)=>checkTimers.push(setTimeout(()=>x.classList.add('ok'),700+k*650)));
}
$('tabs').addEventListener('click',e=>{const t=e.target.closest('.tab');if(t){go(+t.dataset.i,+t.dataset.i<cur);holdManual(45000)}});
$('bNext').addEventListener('click',()=>step(1));
$('bPrev').addEventListener('click',()=>step(-1));
function setPlay(v){playing=v;store.set('ewa-play',v);$('playIc').innerHTML=v?'<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>':'<path class="flip" d="M17 5v14L6 12z"/>';$('bPlay').setAttribute('aria-label',tx(I18N[v?'playLbl':'pausedLbl']));shownAt=Date.now()}
$('bPlay').addEventListener('click',()=>setPlay(!playing));
function toggleFull(){try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen().catch(()=>{})}catch(e){}}
$('bFull').addEventListener('click',toggleFull);
$('bSet').addEventListener('click',()=>{$('sheet').hidden=!$('sheet').hidden});
$('bLang').addEventListener('click',()=>setLang(LANG==='ar'?'en':'ar'));

// keyboard, presentation clickers and TV remotes
const TV_LAYOUT='(min-width:1100px) and (min-height:680px)';
document.addEventListener('keydown',e=>{
  if(e.target.matches&&e.target.matches('input,select'))return;
  if(!$('lightbox').hidden){if(['Escape','GoBack','BrowserBack','Backspace','Enter',' '].includes(e.key)){e.preventDefault();closePoster()}return}
  const k=e.key,rtl=LANG==='ar',onBtn=!!(e.target.closest&&e.target.closest('button')),tv=matchMedia(TV_LAYOUT).matches;
  let act=null;
  if(k==='ArrowLeft')act=rtl?1:-1;
  else if(k==='ArrowRight')act=rtl?-1:1;
  else if(['PageDown','MediaTrackNext','MediaFastForward','n','N'].includes(k)||(tv&&k==='ArrowDown'))act=1;
  else if(['PageUp','MediaTrackPrevious','MediaRewind','p','P'].includes(k)||(tv&&k==='ArrowUp'))act=-1;
  if(act){e.preventDefault();step(act);return}
  if(/^[1-9]$/.test(k)&&+k<=slides.length){go(+k-1,+k-1<cur);holdManual(45000);osd();return}
  if(k==='Home'||k==='End'){e.preventDefault();go(k==='Home'?0:slides.length-1);holdManual(45000);osd();return}
  if(['MediaPlayPause','MediaPlay','MediaPause','k','K'].includes(k)||((k===' '||k==='Enter')&&!onBtn)){e.preventDefault();setPlay(!playing);return}
  if(k==='f'||k==='F')toggleFull();
  else if(k==='l'||k==='L'||k==='ل')setLang(LANG==='ar'?'en':'ar');
  else if(k==='s'||k==='S'||k==='س')$('sheet').hidden=!$('sheet').hidden;
  else if((k==='Escape'||k==='GoBack'||k==='BrowserBack'||k==='Backspace')&&!$('sheet').hidden){e.preventDefault();$('sheet').hidden=true}
});

// drag / swipe the stage to move between slides
(()=>{const st=$('stage');let x0=null,y0=0,dx=0,id=null;
  st.addEventListener('pointerdown',e=>{if(e.target.closest('button,input,select,.cal-main,.cal-months'))return;x0=e.clientX;y0=e.clientY;dx=0;id=e.pointerId});
  st.addEventListener('pointermove',e=>{if(x0==null||e.pointerId!==id)return;dx=e.clientX-x0;
    if(Math.abs(dx)>8&&Math.abs(dx)>Math.abs(e.clientY-y0)){try{st.setPointerCapture(id)}catch(_){}const s=slides[cur];s.classList.add('dragging');s.style.transform=`translateX(${dx}px) rotate(${dx/90}deg)`;s.style.opacity=String(1-Math.min(.6,Math.abs(dx)/900))}});
  const end=()=>{if(x0==null)return;const s=slides[cur];s.classList.remove('dragging');s.style.opacity='';
    if(Math.abs(dx)>90){const fwd=LANG==='ar'?dx>0:dx<0;step(fwd?1:-1)}else{s.style.transition='transform .35s';s.style.transform='';setTimeout(()=>s.style.transition='',360)}
    x0=null;dx=0};
  st.addEventListener('pointerup',end);st.addEventListener('pointercancel',end);
})();

// settings
$('optDur').value=String(dwell/1000);
$('optDur').addEventListener('change',e=>{dwell=+e.target.value*1000;store.set('ewa-dur',+e.target.value)});
$('optAuto').checked=autoLang;
$('optAuto').addEventListener('change',e=>{autoLang=e.target.checked;store.set('ewa-autolang',autoLang)});
$('optLang').addEventListener('change',e=>setLang(e.target.value));
$('optSim').checked=!!sim.on;$('optTime').value=sim.time;
function applySim(){sim={on:$('optSim').checked,time:$('optTime').value||'09:56'};simBase=Date.now();store.set('ewa-sim',sim);weekKey='';bwKey='';calKey='';calMonth=null;tick()}
$('optSim').addEventListener('change',applySim);$('optTime').addEventListener('change',applySim);

// language switch: flips direction and re-renders every slide
function setLang(l){LANG=l==='en'?'en':'ar';store.set('ewa-lang',LANG);applyLang()}
function applyLang(){
  const h=document.documentElement;h.lang=LANG;h.dir=L('rtl','ltr');
  document.title=L('شاشة نادي الذكاء الاصطناعي','EWA AI Club Screen');
  document.querySelectorAll('[data-t]').forEach(el=>el.textContent=tx(I18N[el.dataset.t]));
  document.querySelectorAll('[data-th]').forEach(el=>el.innerHTML=tx(I18N[el.dataset.th]));
  document.querySelectorAll('[data-ta]').forEach(el=>el.setAttribute('aria-label',tx(I18N[el.dataset.ta])));
  $('bLang').textContent=L('EN','ع');$('optLang').value=LANG;
  [...$('optDur').options].forEach(o=>o.textContent=L(`${o.value} ثانية`,`${o.value} seconds`));
  tabs.forEach((t,i)=>t.firstChild.textContent=tx(SLIDE_TABS[i]));
  makeHijri();renderSchedule();renderTimeline();renderItems();renderHeroes();
  weekKey='';bwKey='';calKey='';hjDay=null;setPlay(playing);tick();
  if(slides[cur].id==='s-forget')animateChecks();
}

// eyes look around
(()=>{const pupils=document.querySelectorAll('.eye i');let t=0;setInterval(()=>{t++;const a=[[0,0],[.12,0],[-.12,0],[0,-.08],[.1,.06]][t%5];pupils.forEach(p=>p.style.transform=`translate(${a[0]}em,${a[1]}em)`)},1600)})();

// keep the screen awake while shown
let wake=null;async function keepAwake(){try{if('wakeLock' in navigator&&!wake){wake=await navigator.wakeLock.request('screen');wake.addEventListener('release',()=>wake=null)}}catch(e){}}
document.addEventListener('click',keepAwake);document.addEventListener('keydown',keepAwake);document.addEventListener('visibilitychange',()=>{if(!document.hidden)keepAwake()});

/* ---------- main loop ---------- */
function tick(){
  const d=now(),st=status(d);
  updateClock(d);updateLive(d,st);renderBonus(d);renderWeek(d);renderCalendar(d);
  const fg=forgetTime(st);
  if(fg&&!lastForget&&Date.now()>manualUntil)go(2);
  lastForget=fg;
  const elapsed=Date.now()-shownAt;
  const pinned=fg&&slides[cur].id==='s-forget';
  if(playing&&!pinned&&Date.now()>manualUntil&&elapsed>=dwell){
    if(cur===slides.length-1&&autoLang){LANG=LANG==='ar'?'en':'ar';store.set('ewa-lang',LANG);go(0);applyLang();return}
    go(cur+1);
  }
  if(slides[cur].id==='s-forget'&&pinned&&elapsed>=dwell){shownAt=Date.now();animateChecks()}
  tabs[cur].style.setProperty('--p',(playing&&!pinned?Math.min(100,elapsed/dwell*100):100)+'%');
}
go(0);applyLang();setInterval(tick,1000);
// open a page straight from its link, e.g. …/ai-club-screen/#calendar
function openFromHash(){const id={calendar:'s-cal',week:'s-week',bonus:'s-bonus',breaks:'s-sched'}[location.hash.slice(1)];const i=slides.findIndex(x=>x.id===id);if(i>=0){go(i);holdManual(10*60*1000)}}
openFromHash();addEventListener('hashchange',openFromHash);

/* ---------- background: circuit traces + drifting nodes ---------- */
(()=>{const c=$('bg'),x=c.getContext('2d');let W,H,traces=[],dots=[],dpr=Math.min(2,window.devicePixelRatio||1);
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function build(){W=c.width=innerWidth*dpr;H=c.height=innerHeight*dpr;traces=[];dots=[];
    const n=Math.round((innerWidth*innerHeight)/90000)+8;
    for(let i=0;i<n;i++){let px=Math.random()*W,py=Math.random()*H;const pts=[[px,py]];const segs=2+Math.floor(Math.random()*3);
      for(let s=0;s<segs;s++){const dir=Math.floor(Math.random()*4),len=(40+Math.random()*140)*dpr;
        if(dir===0)px+=len;else if(dir===1)py+=len;else{px+=len*.7*(dir===2?1:-1);py+=len*.7}pts.push([px,py])}
      traces.push({pts,col:Math.random()<.28?'242,112,61':'38,184,176',a:.12+Math.random()*.16,t:Math.random()})}
    for(let i=0;i<70;i++)dots.push({x:Math.random()*W,y:Math.random()*H,r:(Math.random()*1.4+.4)*dpr,v:(Math.random()*.15+.03)*dpr,a:Math.random()*.5+.15})}
  function len(p){let L=0;for(let i=1;i<p.length;i++)L+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);return L}
  function at(p,f){let L=len(p)*f;for(let i=1;i<p.length;i++){const s=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);if(L<=s){const k=s?L/s:0;return[p[i-1][0]+(p[i][0]-p[i-1][0])*k,p[i-1][1]+(p[i][1]-p[i-1][1])*k]}L-=s}return p[p.length-1]}
  function draw(){
    x.clearRect(0,0,W,H);
    const g=x.createRadialGradient(W*.3,H*.35,0,W*.3,H*.35,Math.max(W,H)*.7);g.addColorStop(0,'rgba(20,52,84,.55)');g.addColorStop(1,'rgba(7,16,29,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
    x.strokeStyle='rgba(126,170,214,.035)';x.lineWidth=1;const step=64*dpr;
    for(let gx=0;gx<W;gx+=step){x.beginPath();x.moveTo(gx,0);x.lineTo(gx,H);x.stroke()}
    for(let gy=0;gy<H;gy+=step){x.beginPath();x.moveTo(0,gy);x.lineTo(W,gy);x.stroke()}
    traces.forEach(t=>{x.strokeStyle=`rgba(${t.col},${t.a})`;x.lineWidth=1.2*dpr;x.beginPath();t.pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke();
      const e=t.pts[t.pts.length-1];x.fillStyle=`rgba(${t.col},${t.a*2})`;x.beginPath();x.arc(e[0],e[1],3*dpr,0,7);x.fill();
      x.strokeStyle=`rgba(${t.col},${t.a*1.6})`;x.beginPath();x.arc(t.pts[0][0],t.pts[0][1],3*dpr,0,7);x.stroke();
      if(!still){t.t=(t.t+.0025)%1;const q=at(t.pts,t.t);x.fillStyle=`rgba(${t.col},.75)`;x.shadowColor=`rgb(${t.col})`;x.shadowBlur=10*dpr;x.beginPath();x.arc(q[0],q[1],2*dpr,0,7);x.fill();x.shadowBlur=0}});
    dots.forEach(d=>{if(!still){d.y-=d.v;if(d.y<0){d.y=H;d.x=Math.random()*W}}x.fillStyle=`rgba(200,220,240,${d.a})`;x.beginPath();x.arc(d.x,d.y,d.r,0,7);x.fill()});
    if(!still)requestAnimationFrame(draw)}
  build();draw();addEventListener('resize',()=>{build();if(still)draw()});
})();
