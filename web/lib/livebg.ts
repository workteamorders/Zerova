// @ts-nocheck
/* Live background "ink paper": landscape and mist, great strokes, ink drops, drifting pigment and a pointer trail.
   Stops when the tab is hidden, when motion is paused (html[data-motion="off"]) or reduced motion is requested. */
import { Ink } from './ink';
let started = false;
export function startLiveBg(canvas) {
  if (started) return; started = true;
  var doc = document.documentElement;
  var motionOff = matchMedia('(prefers-reduced-motion: reduce)').matches || doc.dataset.motion === 'off';
  function $(id) { return document.getElementById(id); }
  function flowHidden() { var f = document.getElementById('flow'); return !f || f.hidden; }
  var HE = null, GL = {}; function heroLayout() { return null; }
/* ---------- live background: "ink paper" ----------
   Pencil symbols get written in ink and fade back (the 0 to 12 strokes idea), wet ink blooms open and dry,
   a thin mist drifts, and a click on empty paper flicks ink. Nothing is drawn over text, buttons or paintings. */
var cvs=canvas,cx=cvs.getContext('2d'),BW=0,BH=0,raf=0,lastT=0,bgTick=0,lite=false,slow=0;
function R(a,b){return a+Math.random()*(b-a)}
function sizeCv(){var d=1;BW=innerWidth;BH=innerHeight;cvs.width=BW;cvs.height=BH;cvs.style.width=BW+'px';cvs.style.height=BH+'px'}
/* keep-out zones: text, controls and paintings currently on screen */
var KEEP='h1,h2,h3,p,.btn,.sh-side,.prog,.strip>a,.frame,.chips,.bill,.flag,.ack,.nc,figure,.opts,.sw,ul.cl li,footer span,.nav a,.brand,#heroCv';
var zones=[],zoneT=0;
function readZones(){zones=[];[].slice.call(document.querySelectorAll(KEEP)).forEach(function(el){var r=el.getBoundingClientRect();if(r.bottom<-40||r.top>BH+40||r.width<2)return;
  if(el.id==='heroCv'){if(HE){var L=heroLayout();zones.push({l:r.left+L.cx-L.R*1.55,t:r.top+L.cy-L.R*1.6,r:r.left+L.cx+L.R*1.95,b:r.top+L.cy+L.R*1.5})}return}
  zones.push({l:r.left-18,t:r.top-14,r:r.right+18,b:r.bottom+14})})}
function free(x,y,rad){for(var i=0;i<zones.length;i++){var z=zones[i];if(x+rad>z.l&&x-rad<z.r&&y+rad>z.t&&y-rad<z.b)return false}return y>80&&y<BH+rad*.2}
function rectFree(l,t,r,b){if(l<12||r>BW-12||t<96||b>BH-8)return false;for(var i=0;i<zones.length;i++){var z=zones[i];if(r>z.l&&l<z.r&&b>z.t&&t<z.b)return false}return true}
function spot(rad,tries){for(var k=0;k<(tries||60);k++){var x=R(-rad*.2,BW+rad*.2),y=R(90,BH);if(free(x,y,rad))return[x,y]}return null}

/* 1. pencil symbols that get inked, hold, and fade back */
var WORDS=['TIDE','INK','SLOW','KOI9','DUSK','QUIET','REED','ASH8','VELA','MOSS','HALO','LUMA'];
var glyphs=[];
function newGlyph(){
  var w=WORDS[Math.floor(Math.random()*WORDS.length)],H,gap,wd,ox,oy,found=false,sizes=[R(96,120),R(72,92),R(56,70),R(42,52)];
  for(var si=0;si<sizes.length&&!found;si++){H=sizes[si];gap=.24*H;wd=0;w.split('').forEach(function(c,i){wd+=GL[c].w*H+(i?gap:0)});
    for(var k=0;k<50;k++){ox=R(12,BW-12-wd);oy=R(100,BH-H-12);if(rectFree(ox-H*.25,oy-H*.25,ox+wd+H*.25,oy+H*1.25)){found=true;break}}}
  if(!found)return null;
  var pens=[],x=ox,pad=H*.5;
  w.split('').forEach(function(c){GL[c].s.forEach(function(st){pens.push(st.map(function(q){return[x+q[0]*H,oy+q[1]*H]}))});x+=GL[c].w*H+gap});
  var off=document.createElement('canvas'),W2=Math.ceil(wd+pad*2),H2=Math.ceil(H+pad*2);off.width=W2;off.height=H2;var oc=off.getContext('2d');
  var red=Math.random()<.22,brushes=pens.map(function(pts,i){var loc=pts.map(function(q){return[q[0]-ox+pad,q[1]-oy+pad]}),L=[0];for(var k=1;k<loc.length;k++)L.push(L[k-1]+Math.hypot(loc[k][0]-loc[k-1][0],loc[k][1]-loc[k-1][1]));var tot=L[L.length-1]||1;
    return{len:tot,b:new Ink.Brush({seed:Math.floor(Math.random()*1e6),n:22,steps:Math.max(30,Math.round(tot/2)),pt:function(t){var d=t*tot,j=1;while(j<L.length-1&&L[j]<d)j++;var f=(d-L[j-1])/Math.max(1e-6,L[j]-L[j-1]);return[loc[j-1][0]+(loc[j][0]-loc[j-1][0])*f,loc[j-1][1]+(loc[j][1]-loc[j-1][1])*f]},
      w:function(t){return H*.15*(.55+.45*Math.min(1,t*8))*(1-.45*t)},color:function(t,br){return red?(br.dark?[150,30,20]:[196,50,31]):(br.dark?[10,9,8]:[34,32,30])},dry0:.2,dry1:.55,alpha:.9,lwScale:H/150,body:.55,bodyColor:red?[192,48,30]:[30,28,26]}),p:0}});
  var total=brushes.reduce(function(a,b){return a+b.len},0);
  return{x:ox-pad,y:oy-pad,w:W2,h:H2,ox:ox,oy:oy,pad:pad,pens:pens,off:off,oc:oc,brushes:brushes,total:total,age:0,tIn:900,tWait:R(600,1800),tWrite:R(3200,5200),tHold:R(2200,3800),tOut:2600,tPencilOut:1400}}
function stepGlyph(g,dt){g.age+=dt;var a=g.age,t1=g.tIn,t2=t1+g.tWait,t3=t2+g.tWrite,t4=t3+g.tHold,t5=t4+g.tOut,t6=t5+g.tPencilOut;
  if(a>t6)return false;
  var pencil=a<t1?a/t1:a<t5?1:1-(a-t5)/g.tPencilOut;
  /* pencil underdrawing */
  cx.save();cx.globalAlpha=.42*pencil;cx.strokeStyle='#5A544C';cx.lineWidth=1;cx.setLineDash([2,5]);cx.lineCap='round';
  g.pens.forEach(function(p){cx.beginPath();p.forEach(function(q,i){i?cx.lineTo(q[0],q[1]):cx.moveTo(q[0],q[1])});cx.stroke()});cx.restore();
  /* ink, written stroke by stroke into its own layer */
  if(a>t2){var prog=Math.min(1,(a-t2)/g.tWrite),e=prog<.5?2*prog*prog:1-Math.pow(-2*prog+2,2)/2,want=e*g.total,acc=0;
    g.brushes.forEach(function(br){var loc=Math.max(0,Math.min(1,(want-acc)/br.len));if(loc>br.p){br.b.draw(g.oc,br.p,loc);br.p=loc}acc+=br.len});
    var inkA=a<t4?1:Math.max(0,1-(a-t4)/g.tOut);cx.save();cx.globalAlpha=.7*inkA;cx.drawImage(g.off,g.x,g.y);cx.restore()}
  return true}

/* 2. wet ink blooms */
var bloomTex=[];
function makeBloom(red){var c=document.createElement('canvas'),S=256;c.width=c.height=S;var x=c.getContext('2d'),r=Ink.rng(Math.floor(Math.random()*1e6)),col=red?'196,50,31':'26,24,22';
  for(var i=0;i<9;i++){var a=r()*6.283,d=r()*S*.16,rr=S*(.16+r()*.2),gx=S/2+Math.cos(a)*d,gy=S/2+Math.sin(a)*d,g=x.createRadialGradient(gx,gy,rr*.1,gx,gy,rr);g.addColorStop(0,'rgba('+col+',.5)');g.addColorStop(.6,'rgba('+col+',.22)');g.addColorStop(1,'rgba('+col+',0)');x.fillStyle=g;x.beginPath();x.arc(gx,gy,rr,0,6.283);x.fill()}
  /* pigment grain and a darker drying edge */
  for(i=0;i<500;i++){var a2=r()*6.283,d2=Math.sqrt(r())*S*.42;x.fillStyle='rgba('+col+','+(r()*.18).toFixed(3)+')';x.fillRect(S/2+Math.cos(a2)*d2,S/2+Math.sin(a2)*d2,1+r()*1.5,1+r()*1.5)}
  x.globalCompositeOperation='destination-out';for(i=0;i<5;i++){var a3=r()*6.283,d3=S*(.25+r()*.15);x.fillStyle='rgba(0,0,0,.5)';x.beginPath();x.arc(S/2+Math.cos(a3)*d3,S/2+Math.sin(a3)*d3,S*(.06+r()*.08),0,6.283);x.fill()}
  return c}
var blooms=[];
function newBloom(x,y,size,strong){var red=Math.random()<.25;if(x==null){var p=spot(size*.22,60);if(!p)return null;x=p[0];y=p[1]}
  return{x:x,y:y,s:size,tex:bloomTex[(red?3:0)+Math.floor(Math.random()*3)],rot:R(0,6.28),age:0,life:strong?7000:R(9000,14000),peak:strong?.4:R(.22,.32)}}
function stepBloom(b,dt){b.age+=dt;var p=b.age/b.life;if(p>=1)return false;var grow=1-Math.pow(1-Math.min(1,p*1.6),3),al=p<.18?p/.18:Math.pow(1-(p-.18)/.82,1.4);
  cx.save();cx.globalAlpha=b.peak*al;cx.translate(b.x,b.y);cx.rotate(b.rot);var sz=b.s*(.25+.75*grow);cx.drawImage(b.tex,-sz/2,-sz/2,sz,sz);cx.restore();return true}

/* 3. mist bands */
var mistTex=null,mist=[];
function makeMist(){var c=document.createElement('canvas');c.width=1400;c.height=260;var x=c.getContext('2d'),r=Ink.rng(77);
  for(var i=0;i<70;i++){var gx=r()*1400,gy=130+(r()-.5)*90,rr=60+r()*140,g=x.createRadialGradient(gx,gy,0,gx,gy,rr);g.addColorStop(0,'rgba(120,114,104,.07)');g.addColorStop(1,'rgba(120,114,104,0)');x.fillStyle=g;x.beginPath();x.arc(gx,gy,rr,0,6.283);x.fill()}
  x.globalCompositeOperation='destination-in';var gx2=x.createLinearGradient(0,0,1400,0);gx2.addColorStop(0,'rgba(0,0,0,0)');gx2.addColorStop(.2,'#000');gx2.addColorStop(.8,'#000');gx2.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gx2;x.fillRect(0,0,1400,260);
  var gy2=x.createLinearGradient(0,0,0,260);gy2.addColorStop(0,'rgba(0,0,0,0)');gy2.addColorStop(.5,'#000');gy2.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gy2;x.fillRect(0,0,1400,260);
  return c}
function stepMist(t){mist.forEach(function(m){var x=((t*m.v+m.o)%(1400+BW))-1400;cx.save();cx.globalAlpha=m.a;cx.drawImage(mistTex,x,m.y*BH-130,1400,260*m.k);cx.restore()})}

/* 4. click on empty paper flicks ink */
var flecks=[];
function flick(x,y){var n=26;for(var i=0;i<n;i++){var a=R(0,6.283),sp=R(.04,.42),s=Math.pow(Math.random(),2.2)*5+.6;flecks.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,s:s,age:0,life:R(2600,4200),red:Math.random()<.3})}
  var b=newBloom(x,y,R(150,210),true);if(b)blooms.push(b)}
function stepFlecks(dt){flecks=flecks.filter(function(f){f.age+=dt;if(f.age>f.life)return false;var k=Math.max(0,1-f.age/260);f.x+=f.vx*dt*k;f.y+=f.vy*dt*k;
  var al=f.age<200?1:Math.max(0,1-(f.age-200)/(f.life-200));cx.fillStyle=f.red?'rgba(196,50,31,'+(.7*al).toFixed(3)+')':'rgba(24,22,20,'+(.7*al).toFixed(3)+')';cx.beginPath();cx.arc(f.x,f.y,f.s,0,6.283);cx.fill();return true})}

var nextG=300,nextB=200,clock=0;
function bgInit(){blooms=[];glyphs=[];flecks=[];clock=0;nextG=600;nextB=300;
  if(!bloomTex.length)for(var i=0;i<6;i++)bloomTex.push(makeBloom(i>=3));
  if(!mistTex)mistTex=makeMist();
  mist=[{y:.3,v:.006,o:R(0,2000),a:.55,k:1},{y:.74,v:-.0042,o:R(0,2000),a:.45,k:1.2}];
  mist.forEach(function(m){if(m.v<0){m.v=-m.v;m.o+=900}});
  readZones();for(var k=0;k<2;k++){var b=newBloom(null,null,R(220,380),false);if(b){b.age=R(2000,5000);blooms.push(b)}}}
function bgStep(t,dt){
  clock+=dt;zoneT+=dt;if(zoneT>700){zoneT=0;readZones()}
  cx.clearRect(0,0,BW,BH);stepMist(t);
  if(clock>nextB){nextB=clock+R(1800,3200);if(blooms.length<(lite?2:5)){var b=newBloom(null,null,R(200,420),false);if(b)blooms.push(b)}}
  if(clock>nextG){nextG=clock+R(2200,4000);if(glyphs.length<(lite?1:3)){var g=newGlyph();if(g)glyphs.push(g)}}
  blooms=blooms.filter(function(b){return stepBloom(b,dt)});
  glyphs=glyphs.filter(function(g){return stepGlyph(g,dt)});
  stepFlecks(dt);
}
function bgClear(){cx.clearRect(0,0,BW,BH);cancelAnimationFrame(raf);raf=0}
function frame(now){
  raf=0;if(motionOff||document.hidden)return;
  if(!flowHidden()||(bgTick++&1)){raf=requestAnimationFrame(frame);return}
  var dt=Math.min(80,now-(lastT||now));lastT=now;
  if(dt>52){slow++;if(slow>60&&!lite){lite=true}}else if(slow>0)slow-=.5;
  bgStep(now,dt);raf=requestAnimationFrame(frame);
}
function bgKick(){if(!raf&&!motionOff&&!document.hidden){lastT=0;raf=requestAnimationFrame(frame)}}
addEventListener('resize',function(){sizeCv();readZones()});
addEventListener('scroll',function(){readZones()},{passive:true});
document.addEventListener('visibilitychange',function(){if(document.hidden){cancelAnimationFrame(raf);raf=0}else bgKick()});
document.addEventListener('pointerdown',function(e){if(motionOff||!flowHidden())return;if(e.target.closest('a,button,input,label,canvas#heroCv,.frame,.strip'))return;readZones();if(free(e.clientX,e.clientY,4))flick(e.clientX,e.clientY)});

/* ---------- alternative live backgrounds (preview: add #bg=a|b|c|d to the URL) ---------- */
var BGV={};
/* A. Great strokes: a calligrapher paints huge grey wash strokes across the wall behind the page */
BGV.a=(function(){var L=[],next=0,clk=0;
  function mk(){var c=document.createElement('canvas');c.width=BW;c.height=BH;var x=c.getContext('2d');
    var x0=R(-.2,.4)*BW,y0=R(.1,.9)*BH,x1=R(.6,1.2)*BW,y1=R(.1,.9)*BH,c1x=R(0,1)*BW,c1y=R(-.2,1.2)*BH,W=R(.12,.22)*Math.min(BW,BH)*1.4,red=Math.random()<.2;
    if(Math.random()<.5){var t=x0;x0=x1;x1=t}
    var b=new Ink.Brush({seed:Math.floor(Math.random()*1e6),n:90,steps:500,pt:function(t){var u=1-t;return[u*u*x0+2*u*t*c1x+t*t*x1,u*u*y0+2*u*t*c1y+t*t*y1]},
      w:function(t){return W*(.45+.55*Math.min(1,t*6))*(1-.6*t)},color:function(t,br){return red?(br.dark?[150,30,20]:[196,52,32]):(br.dark?[30,28,26]:[70,66,62])},dry0:.25,dry1:.7,alpha:.9,lwScale:W/120,body:.55,bodyColor:red?[196,52,32]:[60,57,54]});
    return{c:c,x:x,b:b,p:0,age:0,write:R(3800,5600),hold:R(3000,5000),fade:R(5000,7000),peak:red?.2:.17}}
  return{init:function(){L=[];clk=0;next=0},step:function(t,dt){clk+=dt;
    if(clk>next&&L.length<3){L.push(mk());next=clk+R(2600,4200)}
    L=L.filter(function(s){s.age+=dt;var w=Math.min(1,s.age/s.write),e=1-Math.pow(1-w,2.2);if(e>s.p){s.b.draw(s.x,s.p,e);s.p=e}
      var a=s.age<s.write+s.hold?1:1-(s.age-s.write-s.hold)/s.fade;if(a<=0)return false;cx.save();cx.globalAlpha=s.peak*a;cx.drawImage(s.c,0,0);cx.restore();return true})}}})();
/* B. Ink drops: drops fall onto wet paper and bleed outward in fine tendrils, then dry */
BGV.b=(function(){var D=[],next=0,clk=0;
  function mk(x,y,big){var S=Math.round(big?320:R(160,300)),c=document.createElement('canvas');c.width=c.height=S;var g=c.getContext('2d'),red=Math.random()<.3,col=red?'190,46,28':'22,20,18',tips=[];
    var n=big?260:Math.round(S*.9);for(var i=0;i<n;i++){var a=Math.random()*6.283;var r0=R(.06,.14)*S;tips.push({x:S/2+Math.cos(a)*r0,y:S/2+Math.sin(a)*r0,a:a,v:R(.3,.9),life:R(.12,.36)*S,d:0,w:R(.6,2.2)})}
    if(x==null){var p=spot(S*.42,60);if(!p)return null;x=p[0];y=p[1]}
    return{c:c,g:g,col:col,tips:tips,x:x,y:y,S:S,age:0,core:0,life:R(9000,13000),peak:big?.55:R(.32,.45)}}
  function grow(d,dt){var g=d.g,S=d.S,k=dt/16;
    if(d.core<1){d.core=Math.min(1,d.core+.04*k);var r=S*.2*Math.sqrt(d.core),gr=g.createRadialGradient(S/2,S/2,0,S/2,S/2,r);gr.addColorStop(0,'rgba('+d.col+',.22)');gr.addColorStop(.55,'rgba('+d.col+',.12)');gr.addColorStop(1,'rgba('+d.col+',0)');g.fillStyle=gr;g.beginPath();g.arc(S/2,S/2,r,0,6.283);g.fill()}
    g.lineCap='round';d.tips.forEach(function(t){if(t.d>=t.life)return;var st=t.v*k*1.6;t.a+=(Math.random()-.5)*.9;var nx=t.x+Math.cos(t.a)*st,ny=t.y+Math.sin(t.a)*st;var f=1-t.d/t.life;
      g.strokeStyle='rgba('+d.col+','+(.16*f).toFixed(3)+')';g.lineWidth=t.w*(.4+f);g.beginPath();g.moveTo(t.x,t.y);g.lineTo(nx,ny);g.stroke();t.x=nx;t.y=ny;t.d+=st;
      if(Math.random()<.004*k&&d.tips.length<400)d.tips.push({x:t.x,y:t.y,a:t.a+R(-.8,.8),v:t.v*.8,life:(t.life-t.d)*.6,d:0,w:t.w*.7})})}
  return{init:function(){D=[];clk=0;next=0},drop:function(x,y){var d=mk(x,y,true);if(d)D.push(d)},step:function(t,dt){clk+=dt;
    if(clk>next&&D.length<8){var d=mk();if(d)D.push(d);next=clk+R(800,1500)}
    D=D.filter(function(d){d.age+=dt;if(d.age<d.life*.5)grow(d,dt);var p=d.age/d.life;if(p>=1)return false;var a=p<.06?p/.06:p<.55?1:1-(p-.55)/.45;
      /* the falling drop */
      if(d.age<260){var fy=d.y-(1-d.age/260)*90;cx.fillStyle='rgba('+d.col+','+(.7*(d.age/260)).toFixed(2)+')';cx.beginPath();cx.ellipse(d.x,fy,3,6,0,0,6.283);cx.fill()}
      cx.save();cx.globalAlpha=d.peak*a;cx.drawImage(d.c,d.x-d.S/2,d.y-d.S/2);cx.restore();return true})}}})();
/* C. Ink landscape: layered wash mountains across the bottom, mist flowing between them, parallax with the pointer and scroll */
BGV.c=(function(){var layers=[],mxN=0,myN=0,sun=null;
  function build(){layers=[];for(var L=0;L<4;L++){var c=document.createElement('canvas'),W=Math.round(BW*1.3),H=Math.round(BH*(.34-L*.04));c.width=W;c.height=H;var x=c.getContext('2d'),r=Ink.rng(31+L*7),n1=(function(){var v=[];for(var i=0;i<60;i++)v.push(r());return function(u){u=u*59;var i=Math.floor(u),f=u-i,s=f*f*(3-2*f);return v[i]*(1-s)+v[Math.min(59,i+1)]*s}})();
    var tone=95+L*38,al=.5-L*.08,pts=[];for(var i=0;i<=260;i++){var u=i/260,h=(Math.pow(n1(u),1.4)*.85+.15)*H*.8;pts.push([u*W,H-h])}
    var g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba('+tone+','+(tone-3)+','+(tone-8)+','+al+')');g.addColorStop(.7,'rgba('+tone+','+(tone-3)+','+(tone-8)+','+(al*.25)+')');g.addColorStop(1,'rgba('+tone+','+tone+','+tone+',0)');
    x.beginPath();x.moveTo(0,H);pts.forEach(function(p){x.lineTo(p[0],p[1])});x.lineTo(W,H);x.closePath();x.fillStyle=g;x.fill();
    for(i=0;i<pts.length;i++){if(r()<.35)continue;var p=pts[i],len=r()*H*.3+5;x.strokeStyle='rgba(50,48,45,'+(al*.5*r()).toFixed(3)+')';x.lineWidth=r()*1.4+.3;x.beginPath();x.moveTo(p[0],p[1]+r()*2);x.quadraticCurveTo(p[0]+(r()-.5)*10,p[1]+len*.5,p[0]+(r()-.5)*len*.5,p[1]+len);x.stroke()}
    layers.push({c:c,depth:.25+L*.25,y:BH-H*(1.0-L*.12)+L*BH*.02})}}
  return{init:function(){build()},step:function(t,dt){var k=1-Math.exp(-dt/600);mxN+=((mx>-999?(mx/BW-.5):0)-mxN)*k;var sc=Math.min(1,scrollY/BH);
    layers.forEach(function(l,i){var ox=-BW*.15-mxN*80*l.depth+Math.sin(t*.00004*(i+1))*20,oy=l.y+sc*120*l.depth;cx.drawImage(l.c,ox,oy);
      if(i<3){cx.save();cx.globalAlpha=.6;cx.drawImage(mistTex,((t*.01*(i+1)+i*500)%(BW+1400))-1400,oy-40+Math.sin(t*.0003+i)*10,1400,240);cx.restore()}})}}})();
/* D. Pigment in water: fine ink particles drift on a slow current, gather into a circle every so often, then scatter; the pointer stirs them */
BGV.d=(function(){var P=[],clk=0,phase=0,ring=null;
  return{init:function(){P=[];var n=lite?800:1600;for(var i=0;i<n;i++)P.push({x:R(0,BW),y:R(0,BH),vx:0,vy:0,red:Math.random()<.14,s:Math.random()<.7?1.4:2.4,a:R(.3,.7)});clk=0;phase=0},
    step:function(t,dt){clk+=dt;var k=dt/16;
      var cyc=clk%14000,gather=cyc>4000&&cyc<10000;if(gather&&!ring){var p=spot(Math.min(BW,BH)*.2,60)||[BW*.78,BH*.5];ring={x:p[0],y:p[1],r:Math.min(BW,BH)*R(.12,.18)}}if(!gather)ring=null;
      for(var i=0;i<P.length;i++){var q=P[i],a=Math.sin(q.x*.0021+t*.00007)*2+Math.cos(q.y*.0027-t*.00005)*2,fx=Math.cos(a)*.035,fy=Math.sin(a)*.035;
        if(ring){var dx=q.x-ring.x,dy=q.y-ring.y,d=Math.sqrt(dx*dx+dy*dy)||1,want=ring.r*(1+((i%7)-3)*.03),pull=(want-d)*.0026;fx+=dx/d*pull*k*1.6-dy/d*.012;fy+=dy/d*pull*k*1.6+dx/d*.012}
        var ex=q.x-mx,ey=q.y-my,ed=ex*ex+ey*ey;if(ed<22000){var f=(1-ed/22000)*.35;fx+=ex/Math.sqrt(ed+1)*f;fy+=ey/Math.sqrt(ed+1)*f}
        q.vx=(q.vx+fx)*.94;q.vy=(q.vy+fy)*.94;q.x+=q.vx*k*2;q.y+=q.vy*k*2;if(q.x<-5)q.x=BW+5;if(q.x>BW+5)q.x=-5;if(q.y<-5)q.y=BH+5;if(q.y>BH+5)q.y=-5;
        if(blocked(q.x,q.y))continue;cx.fillStyle=q.red?'rgba(196,50,31,'+q.a+')':'rgba(26,24,22,'+q.a+')';cx.fillRect(q.x,q.y,q.s,q.s)}}}})();
/* keep-out grid for cheap per-particle tests */
var GRID=null,GC=16,GW=0,GH=0;
function buildGrid(){GW=Math.ceil(BW/GC);GH=Math.ceil(BH/GC);GRID=new Uint8Array(GW*GH);zones.forEach(function(z){if(z.big)return;var x0=Math.max(0,Math.floor(z.l/GC)),x1=Math.min(GW-1,Math.floor(z.r/GC)),y0=Math.max(0,Math.floor(z.t/GC)),y1=Math.min(GH-1,Math.floor(z.b/GC));for(var y=y0;y<=y1;y++)for(var x=x0;x<=x1;x++)GRID[y*GW+x]=1})}
function blocked(x,y){if(!GRID)return false;var i=Math.floor(y/GC)*GW+Math.floor(x/GC);return i>=0&&i<GRID.length&&GRID[i]===1}
/* E. Everything together: landscape and mist, great strokes, ink drops, drifting pigment, and an ink trail behind the pointer */
var trail=[];
function stepTrail(t){trail=trail.filter(function(p){return t-p.t<900});if(trail.length<2)return;cx.lineCap='round';cx.lineJoin='round';
  for(var i=1;i<trail.length;i++){var a=trail[i-1],b=trail[i],age=(t-b.t)/900,w=Math.max(.6,(1-age)*b.w);cx.strokeStyle='rgba(24,22,20,'+(.55*(1-age)).toFixed(3)+')';cx.lineWidth=w;cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke();
    if(b.dot&&age<.8){cx.fillStyle='rgba('+(b.red?'196,50,31':'24,22,20')+','+(.6*(1-age)).toFixed(3)+')';cx.beginPath();cx.arc(b.dx,b.dy,b.ds,0,6.283);cx.fill()}}}
addEventListener('pointermove',function(e){if(motionOff||!flowHidden())return;var now=performance.now(),l=trail[trail.length-1];var sp=l?Math.hypot(e.clientX-l.x,e.clientY-l.y):0;if(l&&sp<3)return;
  trail.push({x:e.clientX,y:e.clientY,t:now,w:Math.max(1.5,Math.min(9,9-sp*.12)),dot:Math.random()<.25,dx:e.clientX+R(-14,14),dy:e.clientY+R(-14,14),ds:R(.8,2.6),red:Math.random()<.3});if(trail.length>80)trail.shift()},{passive:true});
BGV.e={init:function(){BGV.c.init();BGV.a.init();BGV.b.init();BGV.d.init();buildGrid()},
  step:function(t,dt){BGV.c.step(t,dt);BGV.a.step(t,dt);BGV.d.step(t,dt);BGV.b.step(t,dt);stepTrail(t);stepFlecks(dt)}};
var BGM=(location.hash.match(/bg=([a-e])/)||[])[1]||'e';
if(BGM){if(!mistTex)mistTex=makeMist();var V=BGV[BGM];bgInit=function(){V.init()};bgStep=function(t,dt){zoneT+=dt;if(zoneT>700){zoneT=0;readZones();buildGrid()}cx.clearRect(0,0,BW,BH);V.step(t,dt)};
  document.addEventListener('pointerdown',function(e){if((BGM==='b'||BGM==='e')&&!flowHidden()===false&&!e.target.closest('a,button,input,label,.frame'))BGV.b.drop(e.clientX,e.clientY)})}
var mx=-9999,my=-9999;addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY},{passive:true});
sizeCv();bgInit();if(!motionOff)bgKick();


  new MutationObserver(function () { var off = doc.dataset.motion === 'off' || matchMedia('(prefers-reduced-motion: reduce)').matches; if (off === motionOff) return; motionOff = off; if (off) bgClear(); else bgKick(); })
    .observe(doc, { attributes: true, attributeFilter: ['data-motion'] });
}
