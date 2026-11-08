"""Build panda/data/phases.js (+ phases.json) from the All-Phases dashboard data.
Every Phase 4 number comes from window.PANDA_DATA / window.PANDA_PHASES in that file."""
import re,sys,json,hashlib
src,out_js,out_json=sys.argv[1:4]
s=open(src,encoding='utf-8').read()
grab=lambda name: json.loads(re.search(r'window\.%s=(\{.*?\});\s*</script>'%name,s,re.S).group(1))
D,PH=grab('PANDA_DATA'),grab('PANDA_PHASES')
gcols=D['group_columns']
def per_cat(exp):
    acc={}
    for row in exp['groups']:
        r=dict(zip(gcols,row)) if isinstance(row,list) else row
        a=acc.setdefault(r['Category'],{'n':0,'tp':0,'fp':0,'fn':0,'tn':0})
        for k in a: a[k]+=r[k]
    out=[]
    for c,a in sorted(acc.items()):
        p=a['tp']/(a['tp']+a['fp']) if a['tp']+a['fp'] else 0
        rc=a['tp']/(a['tp']+a['fn']) if a['tp']+a['fn'] else 0
        f=2*p*rc/(p+rc) if p+rc else 0
        out.append({'category':c,**a,'stockouts':a['tp']+a['fn'],'precision':round(p,4),'recall':round(rc,4),'f1':round(f,4)})
    return out
keep=['split','profile','model','rows','threshold','accuracy','precision','recall','f1','average_precision','roc_auc','prevalence','mcc','tn','fp','fn','tp','alerts']
exps={}
for e in D['experiments']:
    sm={k:(round(v,4) if isinstance(v,float) else v) for k,v in e['summary'].items() if k in keep}
    exps[e['id']]={'summary':sm,'test_start':e['test_start'],'test_end':e['test_end'],'by_category':per_cat(e)}
m=PH['meta']
out={
 'generated_from':{'file':'PANDA_All_Phases_Dashboard.html ','model_data':D['source'],'model_data_sha256':D['sha256']},
 'phase1':{'objectives':[
   {'id':1,'metric':'MAPE','baseline':'25–30%','target':'< 15%','ar':'توقع الطلب على مستوى الفرع للمنتجات الطازجة مع أثر التقويم السعودي والعروض','en':'Forecast store-level demand for fresh products with Saudi calendar and promotion effects'},
   {'id':2,'metric':'Recall','baseline':'—','target':'≥ 85%','ar':'التنبؤ بنفاد المخزون وخطر قرب الانتهاء، وخفض نفاد العروض 25–30%','en':'Predict stockout and near-expiry risk; cut promo stockouts by 25–30%'},
   {'id':3,'metric':'OSA','baseline':'—','target':'+3–5 pts','ar':'تحسين التموين والتوزيع بين المراكز والفروع ورفع التوفر على الرف','en':'Optimise DC/store replenishment and raise on-shelf availability'},
   {'id':4,'metric':'Waste','baseline':'5–8%','target':'−20–25%','ar':'قياس المبيعات الضائعة والتخفيضات والهدر وخفض المخزون الذاهب للتخفيض أو الانتهاء','en':'Quantify lost sales, markdown and waste; cut stock going to markdown or expiry'}],
   'assumptions':{'mape_baseline':'25–30%','promo_stockout_baseline':'8–12%','markdown_baseline':'5–8%'}},
 'data':{'raw_rows':m['raw']['rows'],'raw_columns':m['raw']['columns'],'model_rows':D['rows'],'model_columns':D['columns'],'model_stockouts':D['stockouts'],'date_start':D['date_start'],'date_end':D['date_end']},
 'phase4':{'task':'stockout_classification','experiments':exps,
   'primary':'supplied__inventory_inputs','diagnostic':'supplied__observed_record'}
}
j=json.dumps(out,ensure_ascii=False,separators=(',',':'))
open(out_json,'w').write(json.dumps(out,ensure_ascii=False,indent=1))
open(out_js,'w').write('/* Generated from PANDA_All_Phases_Dashboard.html by make_phases.py. Do not edit numbers by hand. */\nwindow.PANDA_PHASE_DATA='+j+';\n')
P=out['phase4']['experiments'][out['phase4']['primary']]['summary']
print('primary',P);print(out['phase4']['experiments']['supplied__inventory_inputs']['by_category'][:2])
