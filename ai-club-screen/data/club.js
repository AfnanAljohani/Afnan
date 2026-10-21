/* Club data: the daily timetable, reminders, club team, weekly bonus challenges and the "don't forget" items.
   Edit this file to change what the screen shows; no code changes needed. */

const DAY=[
  {type:'lec',  name:['المحاضرة الأولى','Lecture 1'],  s:'08:00',e:'08:50',g:1},
  {type:'brk',  name:['البريك الأول','Break 1'],       s:'08:50',e:'09:00',g:1},
  {type:'lec',  name:['المحاضرة الثانية','Lecture 2'], s:'09:00',e:'09:50',g:2},
  {type:'brk',  name:['البريك الثاني','Break 2'],      s:'09:50',e:'10:10',g:2},
  {type:'lec',  name:['المحاضرة الثالثة','Lecture 3'], s:'10:10',e:'11:00',g:3},
  {type:'brk',  name:['البريك الثالث','Break 3'],      s:'11:00',e:'11:10',g:3},
  {type:'lec',  name:['المحاضرة الرابعة','Lecture 4'], s:'11:10',e:'12:00',g:4},
  {type:'lunch',name:['بريك الغداء','Lunch Break'],    s:'12:00',e:'13:00',g:4},
  {type:'lec',  name:['المحاضرة الخامسة','Lecture 5'], s:'13:00',e:'13:50',g:5},
  {type:'brk',  name:['البريك الخامس','Break 5'],      s:'13:50',e:'14:00',g:5},
  {type:'lec',  name:['المحاضرة السادسة','Lecture 6'], s:'14:00',e:'14:50',g:6},
];
const RETURN_LEAD=5; // minutes before a break ends
// "Don't forget" reminder: pops up at these times and stays for FORGET_MIN minutes
const FORGET_AT=['12:00','14:45'],FORGET_MIN=10;

// Club leadership
const LEADS=[
  {name:['أفنان الجهني','Afnan Al-Juhani'],role:['قائدة النادي','Club Lead'],tone:'gold'},
  {name:['سارة الشمراني','Sarah Al-Shamrani'],role:['نائبة القائدة','Deputy Lead'],tone:'teal'},
  {name:['فهد اليامي','Fahad Al-Yami'],role:['مستشار النادي','Club Advisor'],tone:'orange'},
];
// status: 'approved' = team confirmed, 'pending' = candidates, head not chosen yet
const DEPTS=[
  {name:['التدريب والتطوير','Training & Development'],tone:'o',icon:'cap',status:'pending',
   members:[['لجين السلمي','Lujain Al-Sulami'],['شرق السلمي','Sharq Al-Sulami'],['جوري الجعيد','Jouri Al-Juaid'],['عهد الفارسي','Ahd Al-Farsi'],['دعاء برناوي','Duaa Barnawi'],['الجوهرة الحربي','Aljawhara Al-Harbi']]},
  {name:['العلاقات العامة','Public Relations'],tone:'t',icon:'cube',status:'pending',
   members:[['أثير الخضير','Atheer Al-Khudair'],['ريما العتيبي','Reema Al-Otaibi'],['عبير العكوز','Abeer Al-Akkouz'],['خالد الحربي','Khalid Al-Harbi']]},
  {name:['الفعاليات والتصميم','Events & Design'],tone:'t',icon:'pen',status:'pending',
   members:[['رغد المرشدي','Raghad Al-Murshidi'],['سارة الوذيناني','Sarah Al-Wuthaynani'],['شهد مروي','Shahad Marwi'],['محمد المطيري','Mohammed Al-Mutairi'],['سارة السليم','Sarah Al-Sulaim']]},
  {name:['الخطابة والإلقاء','AI Speaker'],tone:'o',icon:'mic',status:'approved',
   members:[{n:['مروان الجهني','Marwan Al-Juhani'],r:['قائد القسم','Lead']},{n:['عبدالرحمن قوتة','Abdulrahman Qutah'],r:['المساعد','Assistant']}]},
  {name:['العلاقات الطلابية والشكاوى','Student Relations'],tone:'t',icon:'chat',status:'approved',
   members:[['عبدالرحمن الثقفي','Abdulrahman Al-Thaqafi']]},
];
// Weekly bonus: one challenge per training day (Sunday–Thursday), all submitted on Saturday.
// Add the next challenge to its day; days without one show as "waiting for the instructor".
const BONUS_WEEKS=[
  {start:'2026-10-18', due:'2026-10-24', dueTime:'11:00',
   days:{
    '2026-10-18':{kind:'models', n:1, week:19, poster:'p1',
      title:'Compare Week 19 Models', ar:'قارن بين نماذج الأسبوع 19',
      desc:['طبّق كل النماذج اللي أخذناها في الأسبوع 19 على بيانات الصور المعطاة.','Use all the models covered in Week 19 on the provided image dataset.'],
      steps:[['قارن النتائج ووضّح أي نموذج أداؤه أفضل وليش','Compare their results and explain which model performs best and why.'],
             ['ادعم مقارنتك بشرح واضح ونتائج','Support your comparison with clear explanations and results.']],
      say:"Same data. Different models. Let's compare!"},
    '2026-10-20':{kind:'tasks', poster:'p2', points:5, file:'20.1', deadline:'11:00 AM', via:'Dr. Mo’s email',
      title:'RNN Bonus Challenge', ar:'تحدي RNN', sub:'File 20.1 — Student Challenges',
      tasks:['Change w_h from 0.5 to 0.9. Which time steps are affected and why?',
             'Reverse the input sequence. Is the final hidden state the same?',
             'Change the initial hidden state from 0 to 0.5. What changes?',
             'In the impulse experiment, compare recurrent weights 0,1, 0.5, and 0.95.',
             'In the gradient simulation, replace the factor 0.6 with 0.9. Explain the difference.',
             'In TensorFlow, change SimpleRNN(12) to SimpleRNN(4). Does the training curve change?']},
   }},
];

const ITEMS=[
  {name:['بطاقتك الأكاديمية','Academy ID card'],icon:'card'},
  {name:['الشاحن','Charger'],icon:'plug'},
  {name:['سماعات البلوتوث','Bluetooth earbuds'],icon:'buds'},
  {name:['سلك الشحن','Charging cable'],icon:'cable'},
];
