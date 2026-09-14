(function(){
"use strict";
var stage=document.getElementById('stage'),scroll=document.getElementById('scroll'),
    bar=document.getElementById('bar'),barWrap=document.getElementById('barWrap'),
    segbar=document.getElementById('segbar'),stepno=document.getElementById('stepno'),
    topbar=document.getElementById('topbar');

var IMG={weight:'img/symptom-weight.jpg',bloat:'img/symptom-bloating.jpg',sleep:'img/symptom-sleep.jpg',sweats:'img/symptom-night-sweats.jpg',mood:'img/symptom-mood.jpg',energy:'img/symptom-energy.jpg'};
var JJ='img/jj-smith.jpg',BOTTLE='img/hormone-focus-bottle.jpg',F1='img/customer-1.jpg',F2='img/customer-2.jpg',F3='img/customer-3.jpg';

var F4='img/customer-4.jpg',F5='img/customer-5.jpg',F6='img/customer-6.jpg';
/* The two places this funnel is allowed to send someone. The doctor route
   goes to the brand site and never to the shop. */
var SHOP='https://shop.jjsmithonline.com/products/hormonal-imbalance'+
 '?src=quiz&utm_source=quiz&utm_medium=owned&utm_campaign=hormone_check&utm_content=offer_screen';
var BRAND='https://www.jjsmithonline.com/';

var STAR='<svg viewBox="0 0 24 24" fill="var(--star)"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>';
var TICK='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
function stars(){return'<span class="stars">'+STAR+STAR+STAR+STAR+STAR+'<b>4.9</b> <em>169 verified reviews</em></span>'}

/* ===== symptoms: shared vs perimenopause-specific ===== */
var TILES=[
 /* Order follows the 114 customer reviews, not the store page: hot flashes 37%,
    weight 35%, night sweats 27%, sleep 27%. Relief leads, weight follows. */
 ['sweats','Hot flashes or night sweats','peri','nights'],
 ['weight','Weight that will not shift','shared','body'],
 ['sleep','Poor sleep','shared','nights'],
 ['bloat','Bloating most days','shared','body'],
 ['mood','Mood swings and brain fog','shared','head'],
 ['energy','Low energy','shared','energy']
];
var MOOD=[
 ['irritable','Snapping at people, when I never used to','shared'],
 ['anxious','Anxious in a way I did not used to be','shared'],
 ['flat','Flat, or crying at nothing','shared'],
 ['notme','I do not feel like myself any more','shared']
];
var MARKERS=[
 ['skipped','I have skipped a period','peri'],
 ['heavier','My periods are heavier or longer','peri'],
 ['closer','They come closer together, or further apart','peri'],
 ['pms','My PMS is worse than it used to be','shared'],
 ['tender','Breast tenderness before my period','shared'],
 ['none','None of these','none']
];

var SHORT={weight:'the weight',bloat:'the bloating',sleep:'the poor sleep',
 sweats:'the hot flashes',mood:'the mood swings',energy:'the low energy'};
function symPhrase(){
  var l=S.sym.map(function(k){return SHORT[k]}).filter(Boolean);
  if(!l.length)return'everything you have told me so far';
  if(l.length===1)return l[0];
  if(l.length===2)return l[0]+' and '+l[1];
  return l.slice(0,2).join(', ')+' and '+(l.length>3?(l.length-2)+' more symptoms':l[2]);
}
var TRIED_WHY={
 food:['You cut foods out.','It was never your plate.'],
 gym:['You trained harder.','It was never calories.'],
 sleep:['You fixed your bedtime.','It was never your routine.'],
 dim:['You tried a hormone supplement.','It was doing half the job.'],
 doctor:['You asked your doctor.','You were told it is normal. A true word, and a useless one.'],
 bloods:['You had bloods done.','They came back fine. They usually do.'],
 wait:['You waited for it to pass.','It does not pass on its own.']
};
var PUBLISHED={
 weight:'Support for Hormonal Weight Gain.*',
 bloat:'Less Bloating and Water Retention.*',
 sleep:'Sleep Better. Wake Up With More Energy.*',
 sweats:'Sleep Better. Wake Up With More Energy.*',
 mood:'Feel Calmer &amp; More Like Yourself.*',
 energy:'Sleep Better. Wake Up With More Energy.*'
};
var NOWSIDE={
 weight:'Weight that will not shift',bloat:'Bloated most days',sleep:'Poor sleep',
 sweats:'Hot flashes and night sweats',mood:'Mood swings and brain fog',energy:'Low energy'
};

var S={sym:[],age:'',periods:'',stopCause:'',reg:'',mood:[],markers:[],sev:'',tried:[],helped:'',name:''};

function has(id){return S.sym.indexOf(id)>-1}
function periScore(){
  var n=0;
  if(has('sweats'))n+=2;
  S.markers.forEach(function(m){var r=MARKERS.filter(function(x){return x[0]===m})[0];if(r&&r[2]==='peri')n++});
  if(S.reg==='allover')n+=2; else if(S.reg==='abit')n++;
  if(S.age==='40s')n++; if(S.age==='50s')n+=2; if(S.age==='60')n+=2;
  return n;
}
function explained(){return S.stopCause&&S.stopCause!=='none'}
function older(){return S.age==='50s'||S.age==='60'}
function under40(){return S.age==='u30'||S.age==='30s'}

/* Why we would send her to a doctor instead of giving her a read.
   Returns '' when we are confident enough to answer her ourselves. */
function docReason(){
  if(S.periods!=='stopped')return S.age==='60'?'late':'';   /* bleeding at sixty needs looking at */
  if(S.stopCause==='treatment')return'treatment';        /* not our call, at any age */
  if(S.stopCause==='surgery'&&!older())return'surgery';  /* we never asked about her ovaries */
  if(!explained()&&under40())return'young';              /* stopping before forty is not menopause */
  return'';
}

/* When the bleed is being suppressed, her cycle cannot tell us anything.
   Read her by symptoms and age instead, and say so on the result. */
function masked(){return S.periods==='stopped'&&(S.stopCause==='coil'||S.stopCause==='pill')}

function stateKey(){
  if(S.periods==='stopped'){
    if(docReason())return'D';
    if(masked()){
      if(older())return'C';
      if(S.age==='40s')return'B';
      if(S.age==='30s')return periScore()>=5?'B':'A';
      return'A';
    }
    if(S.stopCause==='surgery')return'C';   /* fifties and over; younger went to D above */
    if(S.age==='40s')return'E';
    if(under40())return'D';
    return'C';
  }
  /* she still has periods, changed or not */
  if(docReason())return'D';
  if(older())return'B';
  if(S.age==='40s')return periScore()>=3?'B':'A';
  if(S.age==='30s')return periScore()>=5?'B':'A';
  return'A';                                /* under thirty is never perimenopause */
}
var VERDICT={
 A:{name:'Hormonal imbalance',sub:function(){
   if(masked())return'You are too young for this to be the change, and your symptoms line up with estrogen building up faster than your body clears it. Your coil or your pill is hiding your cycle, so this read comes from everything else you told me.';
   return'Your cycle is still keeping time, and your symptoms are tracking it. That points to estrogen building up faster than your body clears it, rather than the change itself.';
 }},
 B:{name:'Perimenopause',sub:'The years before your periods stop, when your hormones stop keeping time. It can begin in your late thirties and run for years. Most women are never told it exists.'},
 C:{name:'Menopause',sub:function(){
   if(masked())return'Your age and your symptoms both point here. The one sign that would confirm it is the one your coil or your pill is hiding, so take this as a read rather than a confirmation.';
   return'Your periods have stopped. The symptoms did not stop with them, and nobody warned you about that part.';
 }},
 E:{name:'Early menopause',sub:'Your periods have stopped in your forties, which is earlier than average. It is not rare, and it is worth having confirmed by your doctor so you know where you stand.'},
 D:{name:'This one needs a doctor',sub:function(){
   var r=docReason();
   if(r==='treatment')return'Your periods have stopped while you are on treatment. That can be temporary or lasting, and the team looking after you is the right place to settle it. I am not going to read it from a quiz.';
   if(r==='late')return'You are sixty or over and still bleeding. That is uncommon enough to be worth having looked at properly before anybody talks to you about supplements. I am not going to read it from a quiz.';
   if(r==='surgery')return'Your periods have stopped after surgery. Whether your ovaries are still working is the part that decides this, and we did not ask you that. It is a question for the person who operated on you.';
   return'Your periods have stopped and you are under forty. That is not menopause in the ordinary sense, and I am not going to guess at it. There are several possible reasons and most of them are worth knowing about properly.';
 }}
};
function vsub(v){return typeof v.sub==='function'?v.sub():v.sub}
function confidence(){
  var p=periScore();
  if(stateKey()==='D')return'Worth checking properly';
  if(masked())return'Read from your symptoms';
  if(S.periods==='stopped')return'Clear';
  if(p>=5||p<=1)return'Clear';
  return'Two things overlapping';
}
var SEVW={rare:1,monthly:2,weekly:3,daily:4};
function score(){
  var raw=S.sym.length+S.mood.length+S.markers.filter(function(m){return m!=='none'}).length;
  return{raw:raw,max:14,pct:Math.min(100,Math.round((raw/14)*70 + ((SEVW[S.sev]||1)/4)*30))};
}
var GROUPS=[
 {k:'body',name:'Weight and bloating',ids:['weight','bloat']},
 {k:'nights',name:'Sleep and temperature',ids:['sleep','sweats']},
 {k:'head',name:'Mood and mind',ids:['mood']},
 {k:'energy',name:'Energy',ids:['energy']}
];
function gCount(g){var n=0;g.ids.forEach(function(i){if(has(i))n++});if(g.k==='head')n+=S.mood.length;return n}
function gMax(g){return g.k==='head'?1+MOOD.length:g.ids.length}

function esc(s){return String(s).replace(/[&<>]/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;'})[c]})}
function nm(){return S.name.trim()||'you'}

var FLOW=['s1','s2','s3','s4','s4b','s5','s6','s7','s8','s9','s10','s11','s12','s13','r1','r2','rDoc','r4','r4b','r5','r6','r7'];
var QS=['s1','s2','s4','s4b','s5','s6','s7','s8','s10','s11'];
var REVEAL=['r1','r2','rDoc','r4','r4b','r5','r6','r7'];
var SKIP={s4b:function(){return S.periods!=='stopped'},s5:function(){return S.periods==='stopped'}};
/* under 40 with no periods and no explanation: give her the read, then stop. No product. */
SKIP.rDoc=function(){return stateKey()!=='D'};
['r4','r4b','r5','r6','r7'].forEach(function(k){SKIP[k]=function(){return stateKey()==='D'}});
var here='s1';

function go(id){
  here=id;
  var live=function(k){return !(SKIP[k]&&SKIP[k]())};
  var shown=REVEAL.filter(live),asked=QS.filter(live);
  var qi=asked.indexOf(id),ri=shown.indexOf(id);
  topbar.style.display='flex';
  if(ri>-1){barWrap.style.display='none';segbar.style.display='flex';stepno.textContent='';
    segbar.innerHTML=shown.map(function(_,i){return'<i class="'+(i<=ri?'on':'')+'"></i>'}).join('');
  }else{segbar.style.display='none';barWrap.style.display='block';
    if(qi>-1){bar.style.width=((qi+1)/asked.length*100)+'%';stepno.textContent='Question '+(qi+1)+' of '+asked.length}
    else{bar.style.width='100%';stepno.textContent=''}}
  stage.innerHTML='';
  var el=document.createElement('div');el.className='rise';
  el.innerHTML=SCREEN[id]();stage.appendChild(el);
  scroll.scrollTop=0;
  if(AFTER[id])AFTER[id](el);
}
function nextId(f){var i=FLOW.indexOf(f)+1;while(i<FLOW.length&&SKIP[FLOW[i]]&&SKIP[FLOW[i]]())i++;return FLOW[i]}
function next(){go(nextId(here))}
function back(){var i=FLOW.indexOf(here);if(i>0){var j=i-1;while(j>0&&SKIP[FLOW[j]]&&SKIP[FLOW[j]]())j--;go(FLOW[j])}}

function single(k,list){return'<div class="opts">'+list.map(function(o){
  return'<button type="button" class="opt" data-single="'+k+'" data-val="'+o[0]+'" aria-pressed="'+(S[k]===o[0])+'"><span class="tick">'+TICK+'</span><span>'+esc(o[1])+'</span></button>';
}).join('')+'</div>'}
function multi(k,list,cta){return'<div class="opts">'+list.map(function(o){
  return'<button type="button" class="opt multi" data-multi="'+k+'" data-val="'+o[0]+'" aria-pressed="'+(S[k].indexOf(o[0])>-1)+'"><span class="tick">'+TICK+'</span><span>'+esc(o[1])+'</span></button>';
}).join('')+'</div><button type="button" class="cta" data-next '+(S[k].length?'':'disabled')+'>'+cta+'</button>'}
function backL(){return'<button type="button" class="backLink" data-back>&larr; Back</button>'}

var SCREEN={},AFTER={};

function tileGrid(){return'<div class="tiles">'+TILES.map(function(t){
  return'<button type="button" class="tile" data-tile="'+t[0]+'" aria-pressed="'+has(t[0])+'"><img src="'+IMG[t[0]]+'" alt=""><span>'+esc(t[1])+'</span></button>';
}).join('')+'</div>';}

/* The question is the page. Whatever angle brought her here is handled by the
   landing page in front of this, so screen one stays the same for every ad. */
SCREEN.s1=function(){return'<p class="eyebrow">Let us build your hormone plan</p>'+
'<h2 class="q">What changes have frustrated you the most?</h2><p class="qsub">Select all that apply.</p>'+
tileGrid()+
'<button type="button" class="cta" data-next '+(S.sym.length?'':'disabled')+'>Continue</button>'+
'<div class="footTrust">'+stars()+'</div>';};

SCREEN.s2=function(){return'<p class="eyebrow">About you</p><h2 class="q">What is your age?</h2>'+
'<p class="qsub">This helps us personalize your results.</p>'+
single('age',[['u30','Under 30'],['30s','30 to 39'],['40s','40 to 49'],['50s','50 to 59'],['60','60+']])+backL();};

var VCHECK='<svg viewBox="0 0 24 24" fill="none" stroke="var(--good)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M8 12.2l2.7 2.6L16 9.6"/></svg>';
var REVIEWS=[
 {r:5,b:'I finally shed this hormonal weight gain! My energy and moods are so much better. Starting to feel like myself again.',n:'Lisa'},
 {r:5,b:'It&rsquo;s so AMAZING has given me my life back!',n:'Anita F.'},
 {r:5,b:'I have only been taking it a few weeks but I have noticed some improvement! I will order again!',n:'Angela S.'}
];
function rs(n){var o='';for(var i=0;i<n;i++)o+=STAR;return o}
SCREEN.s3=function(){
  var v=REVIEWS[0];   /* Lisa. She names the symptoms rather than praising the product. */
  return'<p class="eyebrow">You are in the right place</p>'+
  '<h2 class="q">Women with your symptoms have already done this.</h2>'+
  '<div class="rev"><div class="rs">'+rs(v.r)+'</div><p>&ldquo;'+v.b+'&rdquo;</p>'+
    '<div class="foot"><b>'+v.n+'</b><span class="vbadge">'+VCHECK+'Verified buyer</span></div></div>'+
  '<button type="button" class="cta" data-next>Continue</button>';};

SCREEN.s4=function(){return'<p class="eyebrow">Your cycle</p><h2 class="q">Do you still have periods?</h2>'+
'<p class="qsub">This one question tells me the most.</p>'+
single('periods',[['yes','Yes, I still have them'],['changing','Yes, but they have changed'],['stopped','No, they have stopped']])+backL();};

SCREEN.s4b=function(){return'<p class="eyebrow">Your cycle</p><h2 class="q">Is anything else likely to be stopping them?</h2>'+
'<p class="qsub">This changes the answer completely, so it is worth asking.</p>'+
single('stopCause',[
 ['coil','A hormonal coil, implant or injection'],
 ['pill','Taking the pill without a break'],
 ['surgery','A hysterectomy or other surgery'],
 ['treatment','Cancer treatment or another medication'],
 ['none','No, nothing like that']])+backL();};

SCREEN.s5=function(){return'<p class="eyebrow">Your cycle</p><h2 class="q">And how regular are they?</h2>'+
single('reg',[['clock','Like clockwork'],['abit','A bit off, but roughly predictable'],['allover','All over the place']])+backL();};

SCREEN.s6=function(){return'<p class="eyebrow">Mood and mind</p><h2 class="q">Has your mood changed lately?</h2>'+
'<p class="qsub">Not how you have always been. What is different now. Select all that apply.</p>'+
multi('mood',MOOD.map(function(m){return[m[0],m[1]]}),'Continue')+
'<button type="button" class="cta soft" data-next>None of these</button>'+backL();};

SCREEN.s7=function(){return'<p class="eyebrow">A few more</p><h2 class="q">Any of these in the last year?</h2>'+
'<p class="qsub">These tell me which stage you are in.</p>'+
multi('markers',MARKERS.map(function(m){return[m[0],m[1]]}),'Continue')+backL();};

SCREEN.s8=function(){return'<p class="eyebrow">How often</p><h2 class="q">How often does this hit you?</h2>'+
'<p class="qsub">Thinking about '+symPhrase()+'.</p>'+
single('sev',[['rare','Now and then'],['monthly','Around my cycle each month'],['weekly','Most weeks'],['daily','Nearly every day']])+backL();};

SCREEN.s9=function(){
  var reg=S.reg?({clock:'like clockwork',abit:'a bit off',allover:'all over the place'})[S.reg]:'';
  return'<p class="eyebrow">Here is what is going on</p><h2 class="q">All of it comes from one place.</h2>'+
  '<div class="mech">'+
    '<p class="mechTop">Every month your body makes hormones. Then it has to clear them out again.</p>'+
    '<div class="mechFig">'+
      '<div class="vessel"><span class="vGap" id="vGap"></span><span class="vFill" id="vFill"></span><span class="vLine" id="vLine"></span></div>'+
      '<div class="mechKey">'+
        '<div class="keyRow"><span class="keySwatch gap"></span><div><b>What stays in</b><span>The part that does not leave. It builds up month after month.</span></div></div>'+
        '<div class="keyRow"><span class="keySwatch out"></span><div><b>What leaves</b><span>Cleared out through your gut.</span></div></div>'+
      '</div>'+
    '</div>'+
    '<p class="mechCap">Made each month</p>'+
  '</div>'+
  '<div class="block key"><p class="lead">The part that does not leave is what you have been feeling.</p>'+
  (reg?'<p style="margin-top:10px">Your periods being <strong>'+reg+'</strong> helps me place which stage you are in.</p>':'')+
  '</div>'+
  '<button type="button" class="cta" data-next>So why has nothing worked? &rarr;</button>';};

SCREEN.s10=function(){return'<p class="eyebrow">What you have tried</p><h2 class="q">What have you already tried?</h2>'+
'<p class="qsub">Select all that apply.</p>'+
multi('tried',[['food','Cutting foods out'],['gym','Training harder'],['sleep','Fixing my bedtime'],['dim','A hormone supplement'],['doctor','Asking my doctor'],['bloods','Having bloods done'],['wait','Waiting for it to pass']],'Continue')+
'<button type="button" class="cta soft" data-next>Nothing yet</button>'+backL();};

SCREEN.s11=function(){return'<p class="eyebrow">And did it work</p><h2 class="q">Did any of it help?</h2>'+
single('helped',[['temp','Yes, for a while'],['little','A little, but it never lasted'],['none','No, nothing changed'],['worse','No, it got worse']])+backL();};

SCREEN.s12=function(){return'<div class="loadWrap">'+
'<h2 class="q" style="text-align:center">Analyzing your answers.</h2>'+
'<p class="qsub" style="text-align:center">Preparing your plan.</p>'+
'<div class="ring"><svg width="132" height="132"><circle cx="66" cy="66" r="58" stroke="var(--wash-2)" stroke-width="11" fill="none"/>'+
'<circle id="ringFill" cx="66" cy="66" r="58" stroke="var(--plum)" stroke-width="11" fill="none" stroke-linecap="round" stroke-dasharray="364" stroke-dashoffset="364"/></svg>'+
'<div class="pct" id="pct">0%</div></div>'+
'<ul class="loadList" id="loadList">'+
 '<li><span class="ld"></span>Reading what you told me</li>'+
 '<li><span class="ld"></span>Weighing how often it hits</li>'+
 '<li><span class="ld"></span>Working out your stage</li>'+
 /* 169 is the Hormone Focus review count, not a number of customers. Saying
    "169 women" turns a rating into a club size, which is the exact error
    the claim rule names. No number here: none is needed. */
 '<li><span class="ld"></span>Matching it against what other women report</li>'+
 '<li><span class="ld"></span>Building your plan</li>'+
'</ul></div>';};

SCREEN.s13=function(){var sc=score(),doc=stateKey()==='D';
return'<p class="eyebrow">'+(doc?'Almost there':'Good news')+'</p>'+
'<h2 class="rTitle">'+(doc?'Your read is ready.':'Your pattern is clear, and your plan is ready.')+'</h2>'+
'<p class="rDeck">You said yes to '+sc.raw+' things, and they are not '+sc.raw+' separate problems. Where should I send it?</p>'+
'<input class="field" id="nf" type="text" placeholder="Your first name" autocomplete="given-name">'+
'<input class="field" id="ef" type="email" placeholder="you@email.com" autocomplete="email">'+
'<button type="button" class="cta" data-next disabled>Show me my results</button>'+
'<p class="fine">Prototype only. Nothing is sent and no address is stored.</p>';};

/* ================= REVEAL ================= */
SCREEN.r1=function(){var v=VERDICT[stateKey()];
 return'<p class="eyebrow">Your hormone check</p><h2 class="rTitle">'+esc(nm())+', here is your answer.</h2>'+
 '<div class="verdict"><p class="lab">What your answers point to</p><p class="name">'+v.name+'</p><p class="sub">'+vsub(v)+'</p>'+
 '<span class="conf">'+confidence()+'</span></div>'+
 (masked()?'<div class="block"><p class="blabel">One thing to say plainly</p>'+
   '<p>'+(S.stopCause==='coil'?'Your coil, implant or injection is stopping the bleed.':'Taking the pill without a break is stopping the bleed.')+
   ' So your periods cannot tell us anything here. This read is built from your symptoms and your age instead.</p></div>':'')+
 '<button type="button" class="cta" data-next>Show me how you know &rarr;</button>';};

SCREEN.r2=function(){var sc=score();
 var bars=GROUPS.map(function(g){var n=gCount(g),m=gMax(g),p=m?Math.round(n/m*100):0;
  return'<div class="barRow"><b>'+g.name+'</b><i>'+n+' of '+m+'</i><span class="barTrack"><span class="barFill" data-pct="'+p+'"></span></span></div>'}).join('');
 return'<p class="eyebrow">Here is how I know</p><h2 class="rTitle">Your read.</h2>'+
 '<div class="symStrip">'+TILES.filter(function(t){return has(t[0])}).map(function(t){
   return'<figure><img src="'+IMG[t[0]]+'" alt=""><figcaption>'+esc(t[1])+'</figcaption></figure>'}).join('')+'</div>'+
 '<div class="scoreCard"><div class="scoreBig">'+sc.raw+' <small>of 14</small></div>'+
 '<p class="scoreLab">'+(sc.pct>65?'A strong pattern':sc.pct>35?'A clear pattern':'Early signs')+'</p>'+
 '<div class="gauge"><span class="gaugePin" id="pin"></span></div>'+
 '<div class="gaugeEnds"><span>Mild</span><span>Moderate</span><span>Severe</span></div>'+
 '<div class="bars">'+bars+'</div></div>'+
 '<button type="button" class="cta" data-next>Why has nothing worked? &rarr;</button>';};

var DOC={
 young:{deck:'Periods stopping before forty has several possible causes, and most of them are worth knowing about rather than guessing at.',
  say:'My periods have stopped and I am under forty. I would like it looked into.',
  look:'A blood test is the usual next step. It can rule things in or out quickly, and several of the possible causes are very treatable once they are named.'},
 surgery:{deck:'After surgery, whether your ovaries are still working is the part that decides everything else. That is not something a quiz can tell you.',
  say:'My periods stopped after my surgery. I would like to know whether my ovaries are still working.',
  look:'A blood test can show whether your ovaries are still producing. It changes what is worth doing next, so it is worth asking for by name.'},
 late:{deck:'Bleeding at sixty or over is uncommon, and it is the kind of thing worth having looked at rather than explained away.',
  say:'I am sixty or over and I am still bleeding. I would like it looked into.',
  look:'They will usually want to examine you and may arrange a scan. It is a short conversation and it is the right first step.'},
 treatment:{deck:'Treatment can stop your periods for a while or for good, and which one it is matters. The team already looking after you is the right place to settle it.',
  say:'My periods have stopped since starting treatment. I would like to know whether this is temporary.',
  look:'They will already have your history. Bring the list below so nothing gets left out of the conversation.'}
};
SCREEN.rDoc=function(){
  var r=docReason()||'young';
  var picked=TILES.filter(function(t){return has(t[0])}).map(function(t){return t[1].toLowerCase()});
  var list=picked.length?picked.join(', '):'what you described';
  return'<p class="eyebrow">What to do now</p>'+
  '<h2 class="rTitle">Take this to your doctor.</h2>'+
  '<p class="rDeck">'+DOC[r].deck+'</p>'+
  '<div class="block key"><p class="blabel">What to say</p>'+
  '<p class="lead">&ldquo;'+DOC[r].say+'&rdquo;</p>'+
  '<p>Then tell them how long it has been, and mention '+esc(list)+'.</p></div>'+
  '<div class="block"><p class="blabel">What they may look at</p>'+
  '<p>'+DOC[r].look+'</p></div>'+
  '<a class="cta soft" href="'+BRAND+'" target="_blank" rel="noopener">More from JJ Smith</a>'+
  '<button type="button" class="cta soft" data-restart>Start the check again</button>'+
  '<p class="fine">This check is based on what you told us and is not medical advice. It cannot diagnose anything and it is not a substitute for seeing a doctor.</p>';};

SCREEN.r3=function(){
 var rows=TILES.filter(function(t){return has(t[0])}).map(function(t){
  return'<div class="gapRow"><div class="l">'+NOWSIDE[t[0]]+'</div><div class="r">'+PUBLISHED[t[0]]+'</div></div>'}).join('');
 if(!rows)rows='<div class="gapRow"><div class="l">What you are feeling now</div><div class="r">Feel Calmer &amp; More Like Yourself.*</div></div>';
 return'<p class="eyebrow">The gap</p><h2 class="rTitle">Here is the distance you are trying to close.</h2>'+
 '<div class="gapTable"><div class="gapHead"><div class="l">Where you are</div><div class="r">Where this goes</div></div>'+rows+'</div>'+
 '<p class="fine">*These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure or prevent any disease.</p>'+
 '<button type="button" class="cta" data-next>How do I close it? &rarr;</button>';};

SCREEN.r4=function(){
 var why=S.tried.map(function(k){var c=TRIED_WHY[k];return c?'<p><strong>'+esc(c[0])+'</strong> '+esc(c[1])+'</p>':''}).join('');
 if(!why)why='<p><strong>You have not tried anything for this yet.</strong> Most women have not. Nobody tells you there is anything to try.</p>';
 return'<p class="eyebrow">What you have already tried</p><h2 class="rTitle">Why nothing has worked.</h2>'+
 '<div class="block">'+why+'</div>'+
 '<div class="block key"><p class="lead">None of it was aimed at the cause.</p></div>'+
 '<button type="button" class="cta" data-next>So what does? &rarr;</button>';};

SCREEN.r4b=function(){
 return'<p class="eyebrow">What does</p><h2 class="rTitle">Two capsules a day.</h2>'+
 '<div class="shot"><img src="'+BOTTLE+'" alt="Hormone Focus"></div>'+
 '<div class="badges">'+
   '<span class="badge">60-day guarantee</span>'+
   '<span class="badge">No diet changes</span>'+
   '<span class="badge">Two capsules a day</span>'+
 '</div>'+
 '<div class="block key"><p class="lead">Most hormone supplements only do half the job.</p>'+
 '<p>They break it down. They do not carry it out. So it goes back in.</p>'+
 '<p><strong>Hormone Focus is a 3-in-1 blend that does all three.</strong></p>'+
 '<div class="formula">'+
 '<div class="ing"><b>Breaks it down &mdash; <em>DIM</em></b><i>From broccoli and cabbage.</i></div>'+
 '<div class="ing"><b>Carries it out &mdash; <em>Calcium D-Glucarate</em></b><i>So it does not come back.</i></div>'+
 '<div class="ing"><b>Helps you absorb both &mdash; <em>BioPerine</em></b><i>From black pepper.</i></div>'+
 '</div></div>'+
 '<div class="sealWrap"><span class="seal"><b>SEE<br>RESULTS</b><i>or it&rsquo;s free</i></span>'+
   '<div class="sealTxt"><b>Sixty days. Up to two bottles.</b><span>Empty or full. Tell us and we send your money back.</span></div></div>'+
 '<p class="microDisc">Results may vary based on individual. No results guaranteed.</p>'+
 '<button type="button" class="cta" data-next>How fast does it work? &rarr;</button>';};

SCREEN.r5=function(){return'<p class="eyebrow">You asked</p>'+
'<h2 class="rTitle">This is how fast it works.</h2>'+
'<div class="protocol">Take two capsules a day</div>'+
'<div class="steps">'+
'<div class="step"><b class="n">1</b><div class="t"><b>The first month</b><span>Your body needs a full cycle before it can show you anything. The first thing most women notice is <em>less bloating and water retention.</em>*</span></div></div>'+
'<div class="step"><b class="n">2</b><div class="t"><b>While you wait</b><span>JJ&rsquo;s Starter Guide arrives the day your bottle ships. One thing to change a week.</span></div></div>'+
'<div class="step"><b class="n">3</b><div class="t"><b>Day thirty</b><span>The point most women say they can tell.</span></div></div>'+
'<div class="step"><b class="n">4</b><div class="t"><b>Day sixty</b><span>The guarantee is still running. It outlasts the bottle by a month, on purpose.</span></div></div>'+
'</div><button type="button" class="cta" data-next>Who else is doing this? &rarr;</button>';};

SCREEN.r6=function(){return'<p class="eyebrow">Who else is doing this</p>'+
'<h2 class="rTitle">You would be in good company.</h2>'+
'<div class="block key"><p class="lead">JJ&rsquo;s books and challenges have helped over 800,000 women.</p>'+
'<p>Hormone Focus is the one she made for what happens to your hormones.</p></div>'+
'<div class="selfieGrid">'+
 '<img src="'+F1+'" alt=""><img src="'+F2+'" alt=""><img src="'+F3+'" alt="">'+
 '<img src="'+F4+'" alt=""><img src="'+F5+'" alt=""><img src="'+F6+'" alt="">'+
'</div>'+
'<p class="selfieCap">Real customers, from JJ&rsquo;s own product page.</p>'+
'<div class="ratingBlock" style="margin-top:14px"><div class="ratingBig">4.9</div>'+
'<div class="ratingStars">'+rs(5)+'</div><p class="ratingSub">from 169 verified reviews of Hormone Focus</p></div>'+
'<button type="button" class="cta" data-next>See what it costs &rarr;</button>';};

SCREEN.r7=function(){var v=VERDICT[stateKey()],sc=score();
 return'<p class="eyebrow">Based on your answers</p><h2 class="rTitle">Here is where I would start you, '+esc(nm())+'.</h2>'+
 '<p class="rDeck">'+v.name+' &middot; '+sc.raw+' of 14 signs &middot; '+({rare:'now and then',monthly:'around your cycle',weekly:'most weeks',daily:'nearly every day'}[S.sev]||'')+'</p>'+

 '<div class="ladder">'+
  '<div class="rung"><span class="rn">1</span><div class="rt"><b>Your Starter Guide</b><i>Arrives today. What to change this week, before the capsules have done anything.</i></div><span class="rp free">Free</span></div>'+
  '<div class="rung on"><span class="rn">2</span><div class="rt"><b>Hormone Focus, 30 days</b><i>Two capsules a day. You change nothing else.</i></div><span class="rp">$49.99</span></div>'+
  '<div class="rung"><span class="rn">3</span><div class="rt"><b>Subscribe and save 10%</b><i>It takes more than one month to know. Cancel any time.</i></div><span class="rp">$44.99<em>/mo</em></span></div>'+
 '</div>'+

 '<div class="shot"><img src="'+BOTTLE+'" alt="Hormone Focus"></div>'+

 '<div class="sealWrap"><span class="seal"><b>SEE<br>RESULTS</b><i>or it&rsquo;s free</i></span>'+
 '<div class="sealTxt"><b>Sixty days. Up to two bottles.</b><span>Empty or full. If you do not feel the difference, tell us and we send your money back.</span></div></div>'+
 '<p class="microDisc">Results may vary based on individual. No results guaranteed.</p>'+

 '<a class="cta" href="'+SHOP+'" target="_blank" rel="noopener">Start today &mdash; $49.99</a>'+
 '<button type="button" class="cta soft" data-restart>Start the check again</button>'+
 '<div class="warn"><b>Open before this ships.</b> The 10% subscribe-and-save comes from JJ&rsquo;s live product page, so $44.99 is derived rather than confirmed. No 3 or 6-month bundle exists yet. The Starter Guide still has to be produced. The button now goes to the product page carrying quiz UTMs; a prefilled Shopify checkout would be better and does not exist yet.</div>'+
 '<p class="fine">Not for use if pregnant or nursing. Speak to your doctor first if you have a history of breast, uterine or ovarian cancer, liver disease, blood clots, heart disease or stroke, or if you take blood thinners or prescribed medication. These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure or prevent any disease. Individual results vary.</p>';};

/* ================= after render ================= */
AFTER.s12=function(el){
  var pct=el.querySelector('#pct'),ring=el.querySelector('#ringFill'),
      items=el.querySelectorAll('#loadList li');
  var n=0;
  var t=setInterval(function(){
    n+=1; if(n>100)n=100;
    pct.textContent=n+'%';
    ring.setAttribute('stroke-dashoffset',364-(364*n/100));
    var k=Math.floor(n/20);
    for(var i=0;i<items.length;i++){
      items[i].classList.toggle('now', i===Math.min(k,items.length-1) && n<100);
      items[i].classList.toggle('done', i<k || n>=100);
    }
    if(n>=100){clearInterval(t);setTimeout(next,900)}
  },66);
};
AFTER.s9=function(el){
  var fill=el.querySelector('#vFill'),gap=el.querySelector('#vGap'),line=el.querySelector('#vLine');
  setTimeout(function(){ fill.style.height='64%'; gap.style.height='36%'; line.style.bottom='64%'; },340);
};
AFTER.s13=function(el){
  var e=el.querySelector('#ef'),f=el.querySelector('#nf'),b=el.querySelector('[data-next]');
  function chk(){b.disabled=!/.+@.+\..+/.test(e.value.trim())}
  e.addEventListener('input',chk);
  f.addEventListener('input',function(){S.name=f.value});
  [e,f].forEach(function(x){x.addEventListener('keydown',function(ev){if(ev.key==='Enter'&&!b.disabled)next()})});
};
AFTER.r2=function(el){
  setTimeout(function(){
    el.querySelectorAll('.barFill').forEach(function(f){f.style.width=f.getAttribute('data-pct')+'%'});
    var pin=el.querySelector('#pin'); if(pin)pin.style.left=score().pct+'%';
  },260);
};

document.addEventListener('click',function(e){
  var b=e.target.closest?e.target.closest('button'):null; if(!b)return;
  if(b.hasAttribute('data-back')){back();return}
  if(b.hasAttribute('data-restart')){reset();go('s1');return}
  var tl=b.getAttribute('data-tile');
  if(tl){tog(S.sym,tl);b.setAttribute('aria-pressed',has(tl));
    var c=stage.querySelector('[data-next]');if(c)c.disabled=!S.sym.length;return}
  if(b.hasAttribute('data-next')){next();return}
  var sk=b.getAttribute('data-single');
  if(sk){S[sk]=b.getAttribute('data-val');
    stage.querySelectorAll('[data-single="'+sk+'"]').forEach(function(x){x.setAttribute('aria-pressed',x===b)});
    setTimeout(next,200);return}
  var mk=b.getAttribute('data-multi');
  if(mk){var v=b.getAttribute('data-val');
    if(mk==='markers'&&v==='none'){S.markers=['none']}
    else{tog(S[mk],v);var ni=S.markers.indexOf('none');if(mk==='markers'&&ni>-1)S.markers.splice(ni,1)}
    stage.querySelectorAll('[data-multi="'+mk+'"]').forEach(function(x){x.setAttribute('aria-pressed',S[mk].indexOf(x.getAttribute('data-val'))>-1)});
    var cc=stage.querySelector('[data-next]');if(cc)cc.disabled=!S[mk].length}
});
function tog(a,v){var i=a.indexOf(v);if(i>-1)a.splice(i,1);else a.push(v)}
function reset(){S={sym:[],age:'',periods:'',stopCause:'',reg:'',mood:[],markers:[],sev:'',tried:[],helped:'',name:''}}

var PRESET={
 A:{sym:['weight','bloat','mood'],age:'30s',periods:'yes',reg:'clock',mood:['irritable','notme'],markers:['pms','tender'],sev:'monthly',tried:['food','doctor'],helped:'little',name:'Deborah'},
 B:{sym:['weight','bloat','sleep','sweats','mood','energy'],age:'40s',periods:'changing',reg:'allover',mood:['irritable','anxious','notme'],markers:['skipped','heavier','closer'],sev:'weekly',tried:['food','gym','doctor','bloods','wait'],helped:'none',name:'Renee'},
 C:{sym:['weight','sleep','sweats','energy'],age:'50s',periods:'stopped',reg:'',mood:['flat','notme'],markers:['none'],sev:'daily',tried:['sleep','doctor','wait'],helped:'worse',name:'Yvonne'}
};
var deviceEl=document.querySelector('.device');
function seg(id,fn){var el=document.getElementById(id);if(!el)return;
  el.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest?ev.target.closest('button'):null;
    if(!b||!el.contains(b))return;
    var all=el.getElementsByTagName('button');for(var i=0;i<all.length;i++)all[i].className='';
    b.className='on';try{fn(b)}catch(e){}});}
seg('viewSeg',function(b){deviceEl.className=(b.getAttribute('data-view')==='desktop')?'device wide':'device'});
seg('jumpSeg',function(b){var k=b.getAttribute('data-jump');
  if(k==='start'){reset();go('s1');return}
  S=JSON.parse(JSON.stringify(PRESET[k]));go('r1')});

go('s1');
})();
