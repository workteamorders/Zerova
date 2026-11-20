// @ts-nocheck
/* Bristle-brush ink painter for the hero art and the live background. Browser only. Illustration, not the on-chain renderer. */
var Ink=(function(){
function rng(seed){var a=seed>>>0;return function(){a=(a+0x6D2B79F5)|0;var t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function vnoise(r,n){var v=[];for(var i=0;i<n+2;i++)v.push(r());return function(x){x=((x%n)+n)%n;var i=Math.floor(x),f=x-i,s=f*f*(3-2*f);return v[i]*(1-s)+v[i+1]*s}}
function sm(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)}
/* a brush pass along a curve. o: {pt(t)->[x,y], w(t), color(t)->[r,g,b], seed, n, dry0, dry1, alpha} */
function Brush(o){
  var r=rng(o.seed),N=o.n||150,b=[];
  for(var j=0;j<N;j++){var off=-1+2*(j+r()*.9)/N;
    b.push({off:off,lw:.6+r()*2.6*(1-Math.abs(off)*.4),a:(.35+r()*.6),
      gap:vnoise(r,64),gf:6+r()*26,decay:.15+r()*.6,edge:Math.pow(Math.abs(off),3),dark:r()<.18,
      shift:(r()-.5)*.08,paper:r()<.14,light:r()<.22})}
  this.o=o;this.b=b;this.S=o.steps||700;this.done=0;this.eo=vnoise(r,64);this.ei=vnoise(r,64);
}
Brush.prototype.draw=function(ctx,s0,s1){
  var o=this.o,S=this.S,b=this.b;s0=Math.max(0,Math.floor(s0*S));s1=Math.min(S,Math.floor(s1*S));if(s1<=s0)return;
  var pts=[],nrm=[];
  for(var s=Math.max(0,s0-1);s<=s1;s++){var t=s/S,p=o.pt(t),q=o.pt(Math.min(1,t+.002)),dx=q[0]-p[0],dy=q[1]-p[1],d=Math.hypot(dx,dy)||1;pts.push([t,p[0],p[1],o.w(t)]);nrm.push([-dy/d,dx/d])}
  ctx.lineCap='round';
  if(o.body){var bw=o.body,L=[],Rr=[];for(var k0=0;k0<pts.length;k0++){var P0=pts[k0],t0=P0[0],w0=P0[3]*bw*(1-(o.dry0+(o.dry1-o.dry0)*t0)*.6),e1=this.eo(t0*40)*.18,e2=this.ei(t0*40)*.18;
      L.push([P0[1]+nrm[k0][0]*w0/2*(1+e1),P0[2]+nrm[k0][1]*w0/2*(1+e1)]);Rr.push([P0[1]-nrm[k0][0]*w0/2*(1+e2),P0[2]-nrm[k0][1]*w0/2*(1+e2)])}
    ctx.beginPath();ctx.moveTo(L[0][0],L[0][1]);for(k0=1;k0<L.length;k0++)ctx.lineTo(L[k0][0],L[k0][1]);for(k0=Rr.length-1;k0>=0;k0--)ctx.lineTo(Rr[k0][0],Rr[k0][1]);ctx.closePath();
    var bc=o.bodyColor;ctx.fillStyle='rgb('+bc[0]+','+bc[1]+','+bc[2]+')';ctx.fill()}
  for(var j=0;j<b.length;j++){var br=b[j];ctx.beginPath();var pen=false,col=null;
    for(var k=0;k<pts.length;k++){var P=pts[k],t=P[0],w=P[3];
      var dry=o.dry0+(o.dry1-o.dry0)*t, ink=1-br.decay*t;
      var th=dry+br.edge*.55-(ink-.5)*.35;
      var on=br.gap(t*br.gf*10)>th&&w>.6;
      var x=P[1]+nrm[k][0]*(br.off+br.shift)*w/2,y=P[2]+nrm[k][1]*(br.off+br.shift)*w/2;
      if(on){if(!pen){ctx.moveTo(x,y);pen=true}else ctx.lineTo(x,y)}else pen=false;
      if(k===0)col=o.color(t,br);
    }
    if(br.paper&&o.body)col=[236,229,217];else if(br.light)col=[Math.min(255,col[0]+60),Math.min(255,col[1]+52),Math.min(255,col[2]+44)];ctx.strokeStyle='rgba('+col[0]+','+col[1]+','+col[2]+','+(br.a*(o.alpha||1)*(br.paper?.55:1)).toFixed(3)+')';
    ctx.lineWidth=br.lw*(o.lwScale||1);ctx.stroke()}
};
function splatter(ctx,r,n,cx,cy,R,col,spread,size){for(var i=0;i<n;i++){var a=r()*6.283,d=R*(1+(r()-.3)*spread),x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d,s=Math.pow(r(),3)*size+.4;ctx.fillStyle='rgba('+col+','+(.35+r()*.6).toFixed(2)+')';ctx.beginPath();ctx.arc(x,y,s,0,6.283);ctx.fill()}}
function sun(ctx,x,y,R,seed){var r=rng(seed);ctx.save();ctx.beginPath();ctx.arc(x,y,R,0,6.283);ctx.clip();
  var g=ctx.createRadialGradient(x-R*.3,y-R*.3,R*.1,x,y,R);g.addColorStop(0,'#D8402A');g.addColorStop(1,'#C1301F');ctx.fillStyle=g;ctx.fillRect(x-R,y-R,R*2,R*2);
  for(var i=0;i<900;i++){var a=r()*6.283,d=Math.sqrt(r())*R,s=r()*R*.06+.5;ctx.fillStyle=r()<.5?'rgba(255,220,200,'+(r()*.10).toFixed(3)+')':'rgba(120,20,10,'+(r()*.12).toFixed(3)+')';ctx.beginPath();ctx.ellipse(x+Math.cos(a)*d,y+Math.sin(a)*d,s*2.2,s,r()*3,0,6.283);ctx.fill()}
  ctx.restore();
  /* soft dry edge */
  for(i=0;i<160;i++){var a2=r()*6.283,s2=r()*2+.5;ctx.fillStyle='rgba(193,48,31,'+(r()*.5).toFixed(2)+')';ctx.beginPath();ctx.arc(x+Math.cos(a2)*(R+r()*3),y+Math.sin(a2)*(R+r()*3),s2,0,6.283);ctx.fill()}}
function mountains(ctx,x0,y0,W,H,seed,layers,flip){var r=rng(seed),cv=document.createElement("canvas"),Hh=Math.round(H*1.9);y0-=H*.4;cv.width=Math.round(W);cv.height=Hh;var c=cv.getContext('2d');
  for(var L=0;L<layers;L++){var n1=vnoise(r,40),n2=vnoise(r,40),base=H*(.75+L*.22),amp=H*(.6-L*.12),tone=140+L*30,alpha=.6-L*.14;
    var pts=[];for(var i=0;i<=200;i++){var u=i/200,x=u*W,env=.25+.75*Math.sin(Math.PI*u);var h=(n1(u*6+L*3)*.7+n2(u*19)*.3)*amp*env;pts.push([x,base-h])}
    var g=c.createLinearGradient(0,base-amp,0,base+H*.5);g.addColorStop(0,'rgba('+tone+','+(tone-3)+','+(tone-8)+','+alpha+')');g.addColorStop(.5,'rgba('+tone+','+(tone-3)+','+(tone-8)+','+(alpha*.3)+')');g.addColorStop(1,'rgba('+tone+','+tone+','+tone+',0)');
    c.beginPath();c.moveTo(0,Hh);pts.forEach(function(p){c.lineTo(p[0],p[1])});c.lineTo(W,Hh);c.closePath();c.fillStyle=g;c.fill();
    for(var k=0;k<pts.length;k++){if(r()<.25)continue;var p=pts[k],len=r()*H*.25+4;c.strokeStyle='rgba(64,62,58,'+(alpha*.55*r()).toFixed(3)+')';c.lineWidth=r()*1.3+.3;c.beginPath();c.moveTo(p[0],p[1]+r()*2);c.quadraticCurveTo(p[0]+(r()-.5)*8,p[1]+len*.5,p[0]+(r()-.5)*len*.5,p[1]+len);c.stroke()}
    c.strokeStyle='rgba(70,68,64,'+(alpha*.6)+')';c.lineWidth=1.1;c.beginPath();pts.forEach(function(p,i){i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])});c.stroke()}
  c.globalCompositeOperation='destination-in';var gx=c.createLinearGradient(0,0,W,0);
  if(flip){gx.addColorStop(0,'rgba(0,0,0,0)');gx.addColorStop(.35,'rgba(0,0,0,1)');gx.addColorStop(1,'rgba(0,0,0,1)')}else{gx.addColorStop(0,'rgba(0,0,0,1)');gx.addColorStop(.6,'rgba(0,0,0,1)');gx.addColorStop(1,'rgba(0,0,0,0)')}
  c.fillStyle=gx;c.fillRect(0,0,W,Hh);var gy=c.createLinearGradient(0,0,0,Hh);gy.addColorStop(0,'rgba(0,0,0,1)');gy.addColorStop(.62,'rgba(0,0,0,1)');gy.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gy;c.fillRect(0,0,W,Hh);
  ctx.drawImage(cv,x0,y0)}
/* the hero enso: black sweep over the top, red sweep down the right, a dry tail at the bottom left */
function Enso(cx,cy,R,seed){
  var r=rng(seed),ph=r()*6.28,K=R/300;
  function circ(a0,a1,rr,wob){return function(t){var a=(a0+(a1-a0)*t)*Math.PI/180,rad=R*rr*(1+wob*Math.sin(a*3+ph));return[cx+Math.cos(a)*rad,cy+Math.sin(a)*rad*.98]}}
  var black=new Brush({seed:seed+1,n:200,steps:900,pt:circ(128,338,1,.02),w:function(t){return R*.48*(.6+.4*sm(t/.05))*(1-.25*t)*(t>.82?Math.pow(1-(t-.82)/.18,.6):1)},
    color:function(t,br){var v=br.dark?8:22+((br.off+1)*12|0);return[v,v-2,v-3]},dry0:.12,dry1:.42,alpha:.9,lwScale:K*1.3,body:.8,bodyColor:[38,36,34]});
  var bottom=new Brush({seed:seed+5,n:130,steps:600,pt:circ(48,132,1.01,.02),w:function(t){return R*.3*(.4+.6*sm(t/.2))*(1-.4*t)},
    color:function(t,br){var v=br.dark?10:30;return[v,v-2,v-3]},dry0:.42,dry1:.6,alpha:.8,lwScale:K*1.1,body:.45,bodyColor:[44,42,40]});
  var red=new Brush({seed:seed+2,n:170,steps:900,pt:circ(286,412,1.05,.02),w:function(t){return R*.36*(.5+.5*sm(t/.06))*(1-.45*t)*(t>.8?Math.pow(1-(t-.8)/.2,.7):1)},
    color:function(t,br){return br.dark?[140,26,18]:[200+((br.off*18)|0),52+((br.off*10)|0),32]},dry0:.14,dry1:.5,alpha:.92,lwScale:K*1.2,body:.6,bodyColor:[192,48,30]});
  var tail=new Brush({seed:seed+3,n:60,steps:500,pt:function(t){var a=(118+34*t)*Math.PI/180,rad=R*(1.0+.32*t);return[cx+Math.cos(a)*rad-t*R*.12,cy+Math.sin(a)*rad+t*R*.05]},w:function(t){return R*.13*Math.pow(1-t,.8)},
    color:function(){return[18,16,15]},dry0:.35,dry1:.72,alpha:.85,lwScale:K});
  this.passes=[[black,0,.48],[bottom,.66,.82],[red,.42,.7],[tail,.8,1]];this.cx=cx;this.cy=cy;this.R=R;this.seed=seed;this.p=0;this.spl=false;
}
Enso.prototype.paint=function(ctx,p){var self=this;
  this.passes.forEach(function(q){var b=q[0],a=(self.p-q[1])/(q[2]-q[1]),c=(p-q[1])/(q[2]-q[1]);a=Math.max(0,Math.min(1,a));c=Math.max(0,Math.min(1,c));if(c>a)b.draw(ctx,a,c)});
  if(p>=.92&&!this.spl){this.spl=true;var r=rng(this.seed+9);splatter(ctx,r,320,this.cx-this.R*.08,this.cy-this.R*.05,this.R*1.2,'24,22,20',.32,3.4*this.R/300);splatter(ctx,r,120,this.cx+this.R*.2,this.cy,this.R*1.18,'196,52,32',.22,3*this.R/300)}
  this.p=p;};
return{Brush:Brush,Enso:Enso,sun:sun,mountains:mountains,splatter:splatter,rng:rng};
})();

export { Ink };
