"""Adds the final Phase 4 results to data/phases.js.
Leaderboards are read from the executed notebook 00_Model_Comparison.ipynb (its own output tables).
Business figures are copied from the Phase 4 deck (Team10_Panda_Group10_3.pdf); each carries its page number."""
import json,sys,io,math,re
import pandas as pd
nb_path,phases_json,out_js,out_json=sys.argv[1:5]
nb=json.load(open(nb_path))
def html(i,j=0):
    outs=[o for o in nb['cells'][i]['outputs'] if 'text/html' in o.get('data',{})]
    return pd.read_html(io.StringIO(''.join(outs[j]['data']['text/html'])))[0]
def clean(v):
    if isinstance(v,float) and math.isnan(v): return None
    if hasattr(v,'item'): v=v.item()
    if isinstance(v,float): return round(v,4)
    return v
def rows(df,cols):
    out=[]
    for _,r in df.iterrows():
        d={'model':r['Model'],'owner':r['Owner'],'baseline':bool(r['Baseline']),'assigned':bool(r['Assigned'])}
        for k,c in cols.items(): d[k]=clean(r[c]) if c in r else None
        out.append(d)
    return out
def stdout(i):
    return ''.join(''.join(o.get('text','')) for o in nb['cells'][i]['outputs'] if o.get('output_type')=='stream')
def psplit(t):
    out,cur,d=[],'',0
    for ch in t:
        d+=ch=='(';d-=ch==')'
        if ch==',' and d==0: out.append(cur.strip()); cur=''
        else: cur+=ch
    return out+[cur.strip()]
def champ_line(i):
    s=stdout(i); m=re.search(r'CHAMPION \(all candidates\): (.+?) \((\w+)\)',s); t=re.search(r'Best of the team-assigned models: (.+?) \((\w+)\)',s); tied=re.search(r'Tied within 1% on validation: (.+)',s)
    return {'champion':m.group(1),'best_team':t.group(1),'best_team_owner':t.group(2),'tied':psplit(tied.group(1))}
C=html(3); Rg=html(8); F=html(12)
cls={'metric':'PR-AUC','higher':True,**champ_line(3),
 'rows':rows(C,{'cv_untuned':'CV untuned','cv_tuned':'CV tuned','val':'vali_PR_AUC','val_f1':'vali_F1','acc':'test_Accuracy','precision':'test_Precision','recall':'test_Recall','f1':'test_F1','roc':'test_ROC_AUC','test':'test_PR_AUC','top20':'test_Top20_Capture','fit_s':'Fit_s','gap':'Overfit gap (train−test PR-AUC)'})}
reg={'metric':'MAE','higher':False,**champ_line(8),
 'rows':rows(Rg,{'cv_untuned':'CV untuned','cv_tuned':'CV tuned','val':'vali_MAE','val_r2':'vali_R2','test':'test_MAE','rmse':'test_RMSE','r2':'test_R2','bias':'test_Bias','gain':'test_MAE_gain_vs_mean','wape':'test_CatWeek_WAPE','fit_s':'Fit_s','gap':'Overfit gap (train−test R²)'})}
fc={'metric':'MAE','higher':False,**champ_line(12),
 'rows':rows(F,{'cv_untuned':'CV untuned','cv_tuned':'CV tuned','val':'vali_MAE','val_mape':'vali_MAPE_pct','test':'test_MAE','rmse':'test_RMSE','mape':'test_MAPE_pct','mase':'test_MASE','bias':'test_Bias'})}
dm=html(14,0)
fc['dm']=[{'model':r['Model'],'p':clean(r['p-value']),'verdict':r['Verdict']} for _,r in dm.iterrows()]
sig=html(6); cls['bootstrap']=[{'model':r['Model'],'ci':r['95% CI'],'worse':bool(r['Significantly worse than champion'])} for _,r in sig.iterrows()]
sig=html(10); reg['bootstrap']=[{'model':r['Model'],'ci':r['95% CI'],'worse':bool(r['Significantly worse than champion'])} for _,r in sig.iterrows()]
nowcast=re.search(r'validation MAE \*\*([\d,]+)\*\* · test MAE \*\*([\d,]+)\*\* units/day · test R² (\d+\.\d+)',''.join(nb['cells'][14]['outputs'][2]['data']['text/markdown']))
fc['nowcast']={'model':'XGBoost start-of-day nowcast','owner':'Afnan','val':int(nowcast.group(1).replace(',','')),'test':int(nowcast.group(2).replace(',','')),'r2':float(nowcast.group(3))}
ch=html(18); shap={r['Approach'].split(' · ')[0].lower():r['Top SHAP drivers'] for _,r in ch.iterrows()}
cls['shap']=shap.get('classification'); reg['shap']=shap.get('regression')

# Deck: Khalid's ElasticNet -> LightGBM classifier (Appendix F1, p.36) is not in notebook 00
khalid_cls={'model':'ElasticNet → LightGBM','owner':'Khalid','baseline':False,'assigned':True,'acc':0.966,'f1':0.436,'test':0.411,'top20':0.93,'source':'deck p.36'}

business={  # Phase 4 deck, Team10_Panda_Group10_3.pdf
 'today_vs_models':[
   {'k':'stockout','today':0.20,'with':0.93,'unit':'share','page':16},
   {'k':'waste','today':0.20,'with':0.68,'unit':'share','page':16},
   {'k':'forecast','today':0.275,'with':0.022,'unit':'error','page':16},
   {'k':'nba','today':7,'with':46,'of':50,'unit':'picks','page':16}],
 'stockout':{'records_day':1370,'stockouts_day':38,'found_random':8,'found_model':35,'lift':4.6,'lift_top10':7.8,'hit_model':'1 in 8','hit_random':'1 in 36','checks':274,'page':28},
 'waste':{'units_day':1218,'sar_day':23000,'covered_top20':0.68,'covered_top10':0.51,'zero_waste_share':0.57,'mae_gain':0.48,'page':29},
 'forecast':{'units_day':33296,'mae':729,'mape':0.022,'within3':0.70,'within5':0.98,'nowcast_mape':0.011,'page':32},
 'unusual':{'share':0.01,'waste_x':11,'stockout_x':5.9,'page':33},
 'case':{'saving_low':1.7,'saving_high':2.1,'waste_today':8.3,'after20':6.6,'after25':6.2,'currency':'SAR M / year','page':19},
 'pilot':{'weeks':'1–3','pass_waste':0.20,'pass_stockout':0.85,'ab_records_per_group':3004,'ab_days':5,'page':19},
 'drivers':{'stockout':[['stock',0.83],['supplier',0.08],['price',0.05],['shelf',0.02],['calendar',0.01]],'waste':[['stock',0.70],['shelf',0.27],['product',0.01],['supplier',0.01],['price',0.01],['calendar',0.01]],'page':18},
 'approaches':[
   {'k':'stockout','method':'classification · XGBoost','today':'2 in 10','with':'9 in 10','page':27},
   {'k':'waste','method':'regression · XGBoost','today':'20%','with':'68%','page':27},
   {'k':'forecast','method':'time series · ETS','today':'25–30%','with':'2.2%','page':27},
   {'k':'anomaly','method':'anomaly detection · Robust z-score','today':'—','with':'11×','page':27},
   {'k':'clusters','method':'clustering · K-Means','today':'—','with':'5.6×','page':27},
   {'k':'rules','method':'association rules · FP-Growth','today':'15%','with':'66%','page':27},
   {'k':'nba','method':'recommendation · prediction-based','today':'7 of 50','with':'46 of 50','page':27},
   {'k':'ab','method':'A/B testing · Welch test','today':'—','with':'+60% / +64%','page':27}]
}
P=json.load(open(phases_json))
P['phase4_final']={'source':{'notebook':'00_Model_Comparison.ipynb','deck':'Team10_Panda_Group10_3.pdf'},
  'test_period':{'start':'2026-08-02','end':'2026-09-26','days':56},
  'tracks':{'classification':cls,'regression':reg,'forecasting':fc},'khalid_classifier':khalid_cls,'business':business}
j=json.dumps(P,ensure_ascii=False,separators=(',',':'))
open(out_json,'w').write(json.dumps(P,ensure_ascii=False,indent=1))
open(out_js,'w').write('window.PANDA_PHASE_DATA='+j+';\n')
for k,t in P['phase4_final']['tracks'].items(): print(k,t['champion'],'| team:',t['best_team'],t['best_team_owner'],'| tied:',t['tied'],len(t['rows']))
