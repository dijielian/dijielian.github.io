/* dijielian.com: the name that folds into the DL mark, and the menu that comes with it (design system: NameMorph, PhoneMenu).
   Phones (<= 640px): always. The two-line name folds as you scroll; the bar holds the mark and the menu button.
   Tablets (touch, <= 1366px): only on pages longer than one screen. The one-line name folds as you scroll, and the
   menu button arrives together with the mark while the normal top bar fades away.
   Desktops: nothing here runs. Curve: ease-glide. */
(function(){
  var root=document.documentElement,h1=document.getElementById('name'),bar=document.querySelector('.bar');
  if(!h1||!bar)return;
  var homeHref=(h1.querySelector('a')||{}).getAttribute?h1.querySelector('a').getAttribute('href'):'/';   // the name's own link: the mark goes to the same place
  var phoneQ=matchMedia('(max-width:640px)'),touchQ=matchMedia('(hover:none) and (pointer:coarse) and (max-width:1366px)'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
  var NS='http://www.w3.org/2000/svg',H=320,T=64,HB=60,TA=68,GAP=28,LOGO_W=286,FOOT_W=278,MARK=28,BAR=56;
  var cl=function(v){return Math.min(1,Math.max(0,v))},lerp=function(a,b,t){return a+(b-a)*t};
  var io=function(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};
  var MARK_D='M112 96 H282.0 A116.0 116.0 0 0 1 282.0 328 H176 V356 H390 V416 H112 Z M176 156 H274.0 A56.0 56.0 0 0 1 274.0 268 H176 Z';
  var WORDS={en:['Menu','Close'],de:['Menü','Schließen'],zh:['菜单','关闭']};

  /* ---------- styles ---------- */
  var css=''+
  '.nm-ground,.nm-mark,.mm-btn,.mm{display:none}'+
  'html.nm h1 a{color:transparent}'+
  'html.nm .nm-ground{display:block;position:fixed;left:0;right:0;top:0;height:calc(env(safe-area-inset-top,0px) + 56px);background:var(--black,#000);border-bottom:1px solid var(--line,#262626);opacity:0;z-index:5;pointer-events:none;transition:background-color .7s ease,border-color .7s ease}'+
  'html.nm .nm-mark{display:block;position:fixed;left:0;top:0;width:0;height:0;overflow:visible;z-index:6;border:0;pointer-events:none;color:#E2E2E2;transition:color .7s ease}'+
  'html.nm .nm-mark.home{pointer-events:auto}'+
  'html.nm .nm-mark svg{position:absolute;left:0;top:0;max-width:none;max-height:none;transform-origin:0 0;overflow:visible}'+
  'html.nm body.studio .nm-ground{background:#e6e7ea}html.nm body.studio .nm-mark{color:#151517}'+
  '@media (prefers-reduced-motion:no-preference){html.nm .nm-mark svg{animation:nm-rise 1.1s cubic-bezier(.2,.7,.1,1) .1s backwards}}'+
  '@keyframes nm-rise{from{opacity:0;translate:0 .12em}to{opacity:1;translate:0 0}}'+
  /* phone layout: nav and languages live in the menu */
  'html.nm-phone .bar nav,html.nm-phone .bar .lang{display:none!important}'+
  /* the menu button: a word beside three 1px lines that turn into an X */
  'html.nm .mm-btn{display:flex;align-items:center;gap:.6rem;position:fixed;z-index:10;top:calc(env(safe-area-inset-top,0px) + 6px);right:calc(var(--pad,1.1rem) - 12px);height:44px;padding:0 12px;color:var(--white,#E6E6E6);font-size:.9rem;line-height:1;transition:color .5s ease,opacity .35s ease}'+
  'body.studio:not(.mm-open) .mm-btn{color:#151517}'+
  'html.mm-open .mm-btn{color:#E6E6E6}'+   /* the open sheet is always dark */
  '.mm-btn .t.c,html.mm-open .mm-btn .t.o{display:none}html.mm-open .mm-btn .t.c{display:inline}'+
  '.mm-btn .ln{display:block;position:relative;width:18px;height:13px}'+
  '.mm-btn .ln i{position:absolute;left:0;right:0;height:1px;background:currentColor;transition:transform .5s cubic-bezier(.2,.7,.1,1),top .5s cubic-bezier(.2,.7,.1,1),opacity .2s ease}'+
  '.mm-btn .ln i:nth-child(1){top:0}.mm-btn .ln i:nth-child(2){top:6px}.mm-btn .ln i:nth-child(3){top:12px}'+
  'html.mm-open .mm-btn .ln i:nth-child(1){top:6px;transform:rotate(45deg)}html.mm-open .mm-btn .ln i:nth-child(2){opacity:0}html.mm-open .mm-btn .ln i:nth-child(3){top:6px;transform:rotate(-45deg)}'+
  /* the full-screen sheet */
  'html.nm .mm{display:flex;flex-direction:column;position:fixed;inset:0;z-index:9;background:#000;color:#E6E6E6;padding:calc(env(safe-area-inset-top,0px) + 56px) var(--pad,1.1rem) calc(env(safe-area-inset-bottom,0px) + var(--pad,1.1rem));opacity:0;visibility:hidden;transition:opacity .35s ease,visibility 0s linear .35s;overflow-y:auto}'+
  'html.mm-open .mm{opacity:1;visibility:visible;transition:opacity .35s ease,visibility 0s}'+
  '.mm .mm-home{position:absolute;left:var(--pad,1.1rem);top:calc(env(safe-area-inset-top,0px) + 14px);width:25px;height:28px;border:0}'+
  '.mm .mm-home svg{display:block;width:100%;height:100%}'+
  '.mm ul{list-style:none;padding:0;margin:clamp(1.5rem,6vh,3rem) 0 0;border-top:1px solid #262626}.mm li{border-bottom:1px solid #262626}'+
  '.mm li a{display:block;border:0;padding:1.1rem 0;font-weight:600;font-size:2.6rem;line-height:1;letter-spacing:-.04em;color:#E6E6E6;translate:0 .5rem;opacity:0;transition:translate .6s cubic-bezier(.2,.7,.1,1),opacity .6s ease}'+
  'html.mm-open .mm li a{translate:0 0;opacity:1}html.mm-open .mm li:nth-child(2) a{transition-delay:.04s}html.mm-open .mm li:nth-child(3) a{transition-delay:.08s}'+
  '.mm li a .ext{font-size:.42em;vertical-align:.9em;margin-left:.15em;opacity:.55}'+
  '.mm .mm-mail{margin-top:1.4rem;font-size:1.05rem;color:#E6E6E6;align-self:flex-start;border-bottom:1px solid #444}'+
  '.mm .mm-lang{margin-top:auto;padding-top:2rem;display:flex;gap:1.2rem;font-size:.95rem}'+
  '.mm .mm-lang button{color:#8A8A8A}.mm .mm-lang button[aria-pressed="true"]{color:#E6E6E6;text-decoration:underline;text-underline-offset:.3em}'+
  'html.mm-open,html.mm-open body{overflow:hidden}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  /* ---------- markup ---------- */
  var markSvg='<svg viewBox="112 96 286 320" aria-hidden="true"><path fill="#E2E2E2" fill-rule="evenodd" d="'+MARK_D+'"/></svg>';
  var wrap=document.createElement('div');
  wrap.innerHTML='<div class="nm-ground" aria-hidden="true"></div>'+
    '<a class="nm-mark" href="'+homeHref+'" aria-hidden="true" tabindex="-1"><svg><g fill="currentColor"></g></svg></a>'+
    '<button class="mm-btn" type="button" aria-expanded="false" aria-controls="mm"><span class="t o">Menu</span><span class="t c">Close</span><span class="ln" aria-hidden="true"><i></i><i></i><i></i></span></button>'+
    '<div class="mm" id="mm" role="dialog" aria-modal="true" aria-label="Menu"><a class="mm-home" href="'+homeHref+'" aria-label="Dijie Lian, home">'+markSvg+'</a><ul></ul><a class="mm-mail"></a><div class="mm-lang" role="group" aria-label="Language"></div></div>';
  while(wrap.firstChild)document.body.appendChild(wrap.firstChild);
  var ground=document.querySelector('.nm-ground'),link=document.querySelector('.nm-mark'),svg=link.querySelector('svg'),g=svg.querySelector('g');
  var btn=document.querySelector('.mm-btn'),sheet=document.getElementById('mm'),ul=sheet.querySelector('ul'),mail=sheet.querySelector('.mm-mail'),langs=sheet.querySelector('.mm-lang');

  /* ---------- the menu mirrors the page's own nav and language switch, so it stays in step with every language ---------- */
  var navLinks=[].slice.call(bar.querySelectorAll('nav a')),pageMail=document.getElementById('mail');
  navLinks.filter(function(a){return a!==pageMail}).forEach(function(a){
    var li=document.createElement('li'),b=document.createElement('a');b.href=a.getAttribute('href');
    if(a.target)b.target=a.target,b.rel='noopener';li.appendChild(b);ul.appendChild(li);b._src=a;
  });
  [].slice.call(bar.querySelectorAll('.lang button')).forEach(function(o){
    var b=document.createElement('button');b.type='button';b.textContent=o.textContent;b.lang=o.lang;b._src=o;
    b.addEventListener('click',function(){o.click();sync()});langs.appendChild(b);
  });
  function sync(){
    var l=(root.lang||'en').slice(0,2),w=WORDS[l]||WORDS.en;
    btn.querySelector('.o').textContent=w[0];btn.querySelector('.c').textContent=w[1];sheet.setAttribute('aria-label',w[0]);
    [].forEach.call(ul.querySelectorAll('a'),function(b){b.textContent=b._src.textContent;b.setAttribute('href',b._src.getAttribute('href'));if(/^https?:/.test(b.href)&&b.target){var e=document.createElement('span');e.className='ext';e.setAttribute('aria-hidden','true');e.textContent='↗';b.appendChild(e)}});
    if(pageMail){mail.href=pageMail.href;mail.textContent=pageMail.textContent}
    [].forEach.call(langs.querySelectorAll('button'),function(b){b.setAttribute('aria-pressed',b._src.getAttribute('aria-pressed'))});
  }
  function notesLinks(){                               // Design Notes has its own address per language
    var l=(root.lang||'en').slice(0,2),p=l==='de'?'/de/notes/':l==='zh'?'/zh/notes/':'/notes/';
    [].forEach.call(document.querySelectorAll('a[data-nav="notes"]'),function(a){a.setAttribute('href',p)});
  }
  notesLinks();
  new MutationObserver(function(){notesLinks();sync()}).observe(root,{attributes:true,attributeFilter:['lang']});
  function open(v){root.classList.toggle('mm-open',v);document.body.classList.toggle('mm-open',v);btn.setAttribute('aria-expanded',String(v));if(v)sync()}
  btn.addEventListener('click',function(){open(!root.classList.contains('mm-open'))});
  sheet.addEventListener('click',function(e){if(e.target.closest('a'))open(false)});
  addEventListener('keydown',function(e){if(e.key==='Escape')open(false)});

  /* ---------- the fold ---------- */
  var mode='',built=false,FS,cap,bearD,dR0,foot0,wI,wA,wSp,sb,P,strips,dP,lP,range,safeTop,k0,xName,yNameDoc,pad,asc,last=-1;
  function add(tag,a,parent){var e=document.createElementNS(NS,tag);for(var k in a)e.setAttribute(k,a[k]);(parent||g).appendChild(e);return e}
  function build(){
    var c=document.createElement('canvas').getContext('2d');c.font='720 1000px Archivo';if('fontStretch' in c)c.fontStretch='expanded';
    var mI=c.measureText('I'),mD=c.measureText('D');
    cap=mI.actualBoundingBoxAscent/1000;FS=H/cap;
    var sty='font:720 '+FS+'px Archivo;font-stretch:125%';
    var adv=function(ch){var t=add('text',{style:sty});t.textContent=ch;var w=t.getComputedTextLength();t.remove();return w};
    var track=-0.025*FS;bearD=-mD.actualBoundingBoxLeft/1000*FS;sb=0.055*H;
    dR0=adv('D')+track-2*sb;foot0=adv('L')+track-2*sb;wSp=c.measureText(' ').width/1000*FS+track;
    var defs=add('defs',{});
    strips=[['I','J','I','E'],['I','A','N']].map(function(w,n){
      var cp=add('clipPath',{id:'nmc'+n,clipPathUnits:'userSpaceOnUse'},defs),r=add('rect',{y:-2*H,height:5*H,width:99999},cp);
      var outer=add('g',{'clip-path':'url(#nmc'+n+')'}),inner=add('g',{},outer),x=0;
      w.forEach(function(ch){var e=add('text',{x:x,y:H,style:sty},inner);e.textContent=ch;x+=adv(ch)+track});
      return{r:r,inner:inner,outer:outer,w:x};
    });
    wI=strips[0].w;wA=strips[1].w;
    dP=add('path',{'fill-rule':'evenodd'});lP=add('path',{});
    built=true;
  }
  function measure(){                                    // layout is read here only (setup, resize), never while scrolling
    safeTop=parseFloat(getComputedStyle(root).paddingTop)||0;
    var cs=getComputedStyle(h1),fsPx=parseFloat(cs.fontSize),lh=parseFloat(cs.lineHeight)/fsPx||.8;
    var c=document.createElement('canvas').getContext('2d');c.font='720 1000px Archivo';var m=c.measureText('D');
    var a=(m.fontBoundingBoxAscent||930)/1000,d=(m.fontBoundingBoxDescent||240)/1000;asc=(lh-(a+d))/2+a;
    var r=h1.getBoundingClientRect();
    range=(r.top+scrollY)+r.height*0.85;
    k0=fsPx/FS;xName=r.left+bearD*k0;yNameDoc=r.top+scrollY+(asc-cap)*fsPx;
    pad=parseFloat(getComputedStyle(document.querySelector('.page')||document.body).paddingLeft)||16;
    P=mode==='stack'?lh*FS:0;
    var W=mode==='stack'?Math.max(dR0+sb+wI,foot0+sb+wA):dR0+2*sb+wI+wSp+foot0+sb+wA;
    svg.setAttribute('viewBox','0 0 '+W+' '+(P+H));svg.style.width=W+'px';svg.style.height=(P+H)+'px';
    last=-1;
  }
  function path(dR,yb){var R=yb/2,xa=dR-R,ri=(yb-2*HB)/2,xi=dR-TA-ri;
    return 'M0 0 H'+xa+' A'+R+' '+R+' 0 0 1 '+xa+' '+yb+' H'+T+' V'+H+' H0 Z M'+T+' '+HB+' H'+xi+' A'+ri+' '+ri+' 0 0 1 '+xi+' '+(yb-HB)+' H'+T+' Z'}
  function strip(n,x0,y,vis){var s=strips[n];s.r.setAttribute('x',x0);s.inner.setAttribute('transform','translate('+(x0+vis-s.w)+' '+y+')');s.outer.style.opacity=Math.pow(vis/s.w,1.3)}
  function draw(){
    if(!built||!mode)return;
    var p=cl(scrollY/range);if(reduce.matches)p=p<.5?0:1;
    if(p===last&&p===1)return;last=p;
    var jb,yb,dR;
    if(mode==='stack'){                                 // phone: two lines, the L rises under the D
      var sI=io(cl(p/.45)),jl=io(cl((p-.3)/.62));jb=io(cl((p-.22)/.4));
      yb=lerp(H,H-HB-GAP,jb);dR=lerp(dR0,LOGO_W,jb);dP.setAttribute('d',path(dR,yb));
      var ly=lerp(P,0,jl),fw=lerp(foot0,FOOT_W,jl);
      lP.setAttribute('d','M0 '+ly+' H'+T+' V'+(ly+H-HB)+' H'+fw+' V'+(ly+H)+' H0 Z');
      strip(0,dR0+sb,0,wI*(1-sI));strip(1,fw+sb*(1-jl),ly,wA*(1-sI));
    }else{                                              // tablet: one line, the L lowers its stem and slides in along the baseline
      jb=io(cl((p-.2)/.4));var jr=io(cl((p-.2)/.32)),m=io(p),jf=io(cl((p-.45)/.55));
      yb=lerp(H,H-HB-GAP,jb);dR=lerp(dR0,LOGO_W,jb);dP.setAttribute('d',path(dR,yb));
      var L0=dR0+2*sb+wI+wSp,Lx=lerp(L0,0,m),fw2=lerp(foot0,FOOT_W,jf),lt=lerp(0,H-HB,jr);
      lP.setAttribute('d','M'+Lx+' '+lt+' H'+(Lx+T)+' V'+(H-HB)+' H'+(Lx+fw2)+' V'+H+' H'+Lx+' Z');
      var space=wSp*(1-io(cl(p/.5))),visI=cl((Lx-sb-space-(dR0+sb))/wI)*wI;
      strip(0,dR0+sb,0,visI);strip(1,Lx+fw2+sb*(1-jf),0,wA*visI/wI);
      bar.style.opacity=String(1-cl(p/.35));bar.style.pointerEvents=p>.2?'none':'';
      btn.style.opacity=String(cl((p-.25)/.4));btn.style.pointerEvents=p>.4?'':'none';
    }
    var q=io(p),k=lerp(k0,MARK/H,q),yBar=safeTop+(BAR-MARK)/2;
    svg.style.transform='translate('+lerp(xName,pad,q)+'px,'+lerp(Math.max(yNameDoc-scrollY,yBar),yBar,q)+'px) scale('+k+')';
    ground.style.opacity=String(cl((p-.6)/.4));
    link.classList.toggle('home',p>.9);
  }
  function decide(){
    if(phoneQ.matches)return 'stack';
    if(touchQ.matches&&root.scrollHeight>innerHeight+40)return 'line';   // a tablet page longer than one screen
    return '';
  }
  function setup(){
    root.classList.remove('nm','nm-phone');bar.style.opacity='';bar.style.pointerEvents='';btn.style.opacity='';btn.style.pointerEvents='';
    var m=decide();mode=m;open(false);
    root.classList.toggle('nm',!!m);root.classList.toggle('nm-phone',m==='stack');
    if(!m)return;
    sync();
    document.fonts.load('720 100px Archivo').then(function(){if(!built)build();measure();draw()});
  }
  var raf=0;
  addEventListener('scroll',function(){if(!raf)raf=requestAnimationFrame(function(){raf=0;draw()})},{passive:true});
  var rt,lastW=innerWidth;addEventListener('resize',function(){if(innerWidth===lastW)return;lastW=innerWidth;clearTimeout(rt);rt=setTimeout(setup,150)});   // phones resize while scrolling (the address bar); only a new width counts
  phoneQ.addEventListener('change',setup);
  if(document.readyState==='complete')setup();else addEventListener('load',setup);
})();
