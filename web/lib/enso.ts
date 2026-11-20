// @ts-nocheck
/**
 * Illustrative Enso generator for the web preview: the coin's symbol (A-Z, 0-9) brushed in 12 strokes of equal ink length.
 * NOT the on-chain renderer; the contract draws the final painting.
 */
/* ---------- glyph engine: the symbol itself is the painting, cut into 12 strokes of equal ink length ---------- */
function rng(seed){var a=Math.floor(seed)>>>0;return function(){a=(a+0x6D2B79F5)|0;var t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
var GEST=[
 {w0:36,w1:32,dry:.18,jit:1.2,tilt:.0,pulse:.04,wob:2,splat:1},
 {w0:70,w1:16,dry:.55,jit:2.2,tilt:.06,pulse:.08,wob:4,splat:3},
 {w0:16,w1:56,dry:.35,jit:2.0,tilt:-.08,pulse:.1,wob:6,splat:2},
 {w0:44,w1:30,dry:.85,jit:4.5,tilt:.04,pulse:.2,wob:5,splat:4},
 {w0:30,w1:30,dry:.3,jit:2.5,tilt:0,pulse:.55,wob:3,splat:2},
 {w0:28,w1:24,dry:.4,jit:2.2,tilt:.02,pulse:.12,wob:12,splat:1},
 {w0:66,w1:58,dry:.95,jit:3,tilt:.05,pulse:.1,wob:4,splat:0},
 {w0:72,w1:50,dry:.12,jit:1.6,tilt:.03,pulse:.06,wob:3,splat:2}];
function arc(cx,cy,rx,ry,a0,a1,n){var o=[],k;n=n||Math.max(8,Math.round(Math.abs(a1-a0)/12));for(k=0;k<=n;k++){var a=(a0+(a1-a0)*k/n)*Math.PI/180;o.push([cx+rx*Math.cos(a),cy+ry*Math.sin(a)])}return o}
function cat(){var o=[];for(var i=0;i<arguments.length;i++){var p=arguments[i];o=o.concat(o.length&&p.length&&Math.hypot(o[o.length-1][0]-p[0][0],o[o.length-1][1]-p[0][1])<1e-6?p.slice(1):p)}return o}
/* skeletons in a box of height 1 (y down); w = advance width */
var GL={
A:{w:.72,s:[[[0,1],[.36,0],[.72,1]],[[.16,.62],[.56,.62]]]},
B:{w:.66,s:[[[0,1],[0,0]],cat([[0,0],[.34,0]],arc(.34,.25,.26,.25,-90,90),[[.34,.5],[0,.5]]),cat([[0,.5],[.38,.5]],arc(.38,.75,.28,.25,-90,90),[[.38,1],[0,1]])]},
C:{w:.8,s:[arc(.42,.5,.4,.5,-42,-318)]},
D:{w:.74,s:[[[0,0],[0,1]],cat([[0,0],[.3,0]],arc(.3,.5,.44,.5,-90,90),[[.3,1],[0,1]])]},
E:{w:.6,s:[[[.6,0],[0,0],[0,1],[.62,1]],[[0,.5],[.48,.5]]]},
F:{w:.6,s:[[[.6,0],[0,0],[0,1]],[[0,.5],[.48,.5]]]},
G:{w:.84,s:[arc(.42,.5,.42,.5,-40,-356),[[.48,.56],[.84,.56],[.84,.96]]]},
H:{w:.66,s:[[[0,0],[0,1]],[[.66,0],[.66,1]],[[0,.5],[.66,.5]]]},
I:{w:.16,s:[[[.08,0],[.08,1]]]},
J:{w:.52,s:[cat([[.52,0],[.52,.7]],arc(.26,.7,.26,.3,0,180))]},
K:{w:.66,s:[[[0,0],[0,1]],[[.62,0],[0,.6]],[[.2,.42],[.66,1]]]},
L:{w:.56,s:[[[0,0],[0,1],[.58,1]]]},
M:{w:.84,s:[[[0,1],[.04,0],[.42,.66],[.8,0],[.84,1]]]},
N:{w:.68,s:[[[0,1],[0,0],[.68,1],[.68,0]]]},
O:{w:.86,s:[arc(.43,.5,.43,.5,-90,270)]},
P:{w:.6,s:[[[0,1],[0,0]],cat([[0,0],[.32,0]],arc(.32,.27,.28,.27,-90,90),[[.32,.54],[0,.54]])]},
Q:{w:.88,s:[arc(.43,.5,.43,.5,-90,270),[[.52,.7],[.88,1.04]]]},
R:{w:.66,s:[[[0,1],[0,0]],cat([[0,0],[.32,0]],arc(.32,.27,.28,.27,-90,90),[[.32,.54],[0,.54]]),[[.28,.54],[.66,1]]]},
S:{w:.64,s:[cat(arc(.32,.26,.3,.24,-28,-270),arc(.32,.75,.32,.25,-90,162))]},
T:{w:.68,s:[[[0,0],[.68,0]],[[.34,0],[.34,1]]]},
U:{w:.66,s:[cat([[0,0],[0,.64]],arc(.33,.64,.33,.36,180,0),[[.66,.64],[.66,0]])]},
V:{w:.7,s:[[[0,0],[.35,1],[.7,0]]]},
W:{w:.96,s:[[[0,0],[.22,1],[.48,.3],[.74,1],[.96,0]]]},
X:{w:.66,s:[[[0,0],[.66,1]],[[.66,0],[0,1]]]},
Y:{w:.68,s:[[[0,0],[.34,.52],[.68,0]],[[.34,.52],[.34,1]]]},
Z:{w:.64,s:[[[0,0],[.62,0],[0,1],[.66,1]]]},
'0':{w:.62,s:[arc(.31,.5,.31,.5,-90,270)]},
'1':{w:.36,s:[[[0,.2],[.28,0],[.28,1]]]},
'2':{w:.62,s:[cat(arc(.3,.3,.3,.3,-165,35),[[.55,.47],[0,1],[.64,1]])]},
'3':{w:.62,s:[cat(arc(.28,.26,.28,.24,-160,90),arc(.28,.74,.33,.26,-90,160))]},
'4':{w:.66,s:[[[.5,1],[.5,0],[0,.68],[.68,.68]]]},
'5':{w:.62,s:[cat([[.6,0],[.08,0],[.04,.45]],arc(.3,.7,.32,.3,-125,145))]},
'6':{w:.64,s:[cat(arc(.34,.55,.34,.47,-62,-200),arc(.33,.72,.31,.27,180,540))]},
'7':{w:.62,s:[[[0,0],[.62,0],[.2,1]]]},
'8':{w:.62,s:[arc(.31,.25,.26,.24,90,450),arc(.31,.73,.31,.27,-90,270)]},
'9':{w:.64,s:[cat(arc(.31,.29,.31,.28,0,360),[[.62,.29],[.58,.7],[.28,1]])]}
};
function resample(pts,step){var o=[pts[0]],acc=0,i;for(i=1;i<pts.length;i++){var a=pts[i-1],b=pts[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<1e-9)continue;var t=step-acc;while(t<=d){o.push([a[0]+(b[0]-a[0])*t/d,a[1]+(b[1]-a[1])*t/d]);t+=step}acc=d-(t-step)}var last=pts[pts.length-1],pl=o[o.length-1];if(Math.hypot(last[0]-pl[0],last[1]-pl[1])>step*.3)o.push(last);return o}
var gcache={};
function buildSym(sym,seed,gi){
  var key=sym+'/'+seed+'/'+gi;if(gcache[key])return gcache[key];
  var g=GEST[gi],r=rng(seed*2654435761+777),f1=function(v){return Math.round(v*10)/10};
  var ch=sym.split('').filter(function(c){return GL[c]});if(!ch.length)ch=['0'];
  var rows=ch.length<=3?[ch]:[ch.slice(0,Math.ceil(ch.length/2)),ch.slice(Math.ceil(ch.length/2))];
  var GAP=.24,maxW=780,top=150,bottom=900,rowGap=.34;
  var rw=rows.map(function(rw){var w=0;rw.forEach(function(c,i){w+=GL[c].w+(i?GAP:0)});return w});
  var H=Math.min(rows.length===1?320:290,maxW/Math.max.apply(null,rw),(bottom-top)/(rows.length+(rows.length-1)*rowGap));
  var blockH=H*(rows.length+(rows.length-1)*rowGap),y0=top+(bottom-top-blockH)/2-20;
  /* pen strokes in writing order, in card units */
  var pens=[];
  rows.forEach(function(row,ri){var x=500-rw[ri]*H/2,y=y0+ri*H*(1+rowGap);
    row.forEach(function(c){var G=GL[c],sl=g.tilt;
      G.s.forEach(function(st){var pts=st.map(function(p){return[x+(p[0]+sl*(1-p[1]))*H,y+p[1]*H]});pens.push(resample(pts,5))});
      x+=(G.w+GAP)*H})});
  /* jitter the skeleton a little (hand), and measure */
  var wob=g.wob*(H/300);
  pens=pens.map(function(P){var ph=r()*6.28,fr=.02+r()*.02;var o=P.map(function(p,i){return[p[0]+Math.sin(i*fr*6+ph)*wob*.6+(r()-.5)*.4,p[1]+Math.cos(i*fr*5+ph)*wob*.6+(r()-.5)*.4]});
    var L=[0];for(var i=1;i<o.length;i++)L.push(L[i-1]+Math.hypot(o[i][0]-o[i-1][0],o[i][1]-o[i-1][1]));return{p:o,L:L,len:L[L.length-1]}});
  var total=pens.reduce(function(a,b){return a+b.len},0);
  var base=H*.0042,ss=function(x){var c=Math.max(0,Math.min(1,x));return c*c*(3-2*c)};
  pens.forEach(function(pen){var ph=r()*6.28,n=pen.p.length;pen.w=[];pen.eo=[];pen.ei=[];
    for(var i=0;i<n;i++){var u=pen.L[i]/Math.max(1,pen.len);
      var w=(g.w0+(g.w1-g.w0)*u)*base*(1+g.pulse*Math.sin(u*6.28*1.5+ph));
      w*=(.55+.45*ss(pen.L[i]/Math.min(60,pen.len*.3)))*(.5+.5*ss((pen.len-pen.L[i])/Math.min(46,pen.len*.25)));
      pen.w.push(w);pen.eo.push((r()-.5)*g.jit*(H/300));pen.ei.push((r()-.5)*g.jit*(H/300))}
    /* smooth edge noise */
    ['eo','ei'].forEach(function(k){var a=pen[k],b=a.slice();for(var i=1;i<n-1;i++)b[i]=(a[i-1]+2*a[i]+a[i+1])/4*2;pen[k]=b});
    pen.nx=[];pen.ny=[];for(i=0;i<n;i++){var a=pen.p[Math.max(0,i-1)],c=pen.p[Math.min(n-1,i+1)],dx=c[0]-a[0],dy=c[1]-a[1],d=Math.hypot(dx,dy)||1;pen.nx.push(-dy/d);pen.ny.push(dx/d)}});
  /* cut the ink into 12 portions of equal length */
  var cuts=[],acc=0;pens.forEach(function(pen,pi){cuts.push({pi:pi,a:acc,b:acc+pen.len});acc+=pen.len});
  function sub(pen,s0,s1){var i0=0,i1=pen.p.length-1;while(i0<i1&&pen.L[i0+1]<=s0)i0++;while(i1>i0&&pen.L[i1-1]>=s1)i1--;return[i0,i1]}
  function poly(pen,i0,i1,grow,js){var o=[],n=[],i;for(i=i0;i<=i1;i++){var hw=pen.w[i]/2+grow;o.push([pen.p[i][0]+pen.nx[i]*(hw+pen.eo[i]*js),pen.p[i][1]+pen.ny[i]*(hw+pen.eo[i]*js)]);n.push([pen.p[i][0]-pen.nx[i]*(hw+pen.ei[i]*js),pen.p[i][1]-pen.ny[i]*(hw+pen.ei[i]*js)])}
    var ring=o.concat(n.reverse());return'M'+ring.map(function(q){return f1(q[0])+','+f1(q[1])}).join(' L')+' Z'}
  function line(pen,i0,i1,f,ex){var o=[],i;for(i=i0;i<=i1;i++){var k=f*pen.w[i]+ex;o.push([pen.p[i][0]+pen.nx[i]*k,pen.p[i][1]+pen.ny[i]*k])}return'M'+o.map(function(q){return f1(q[0])+','+f1(q[1])}).join(' L')}
  var strokes=[];
  for(var k=0;k<12;k++){
    var A=total*k/12,B=total*(k+1)/12,s={i:k,body:'',halo:'',head:'',op:k%2===0?.94:.9,center:'',br:[],hr:[],dots:[],segs:[]};
    cuts.forEach(function(c){var lo=Math.max(A,c.a),hi=Math.min(B,c.b);if(hi-lo<.5)return;var pen=pens[c.pi],s0=lo-c.a,s1=hi-c.a;
      var ix=sub(pen,Math.max(0,s0-3),s1+3),i0=ix[0],i1=ix[1];if(i1-i0<1)return;
      s.segs.push({p:pen.p.slice(i0,i1+1),st:s0<1});s.body+=poly(pen,i0,i1,0,1);s.halo+=poly(pen,i0,i1,H*.012,1.7);s.center+=line(pen,i0,i1,0,0);
      if(s0<1){var hi2=Math.min(i1,i0+6);s.head+=poly(pen,i0,hi2,0,1)}
      var nb=Math.max(3,5+Math.round(g.dry*4));
      for(var b=0;b<nb;b++){var f=-.4+(.8*b)/(nb-1)+(r()-.5)*.06;if(r()<.35+.65*g.dry)s.br.push({d:line(pen,i0,i1,f,0),sw:f1((1+r()*2.8*(.5+g.dry))*H/300),op:f1(.3+.55*g.dry*r()+.2*r()),dash:Math.round(14+r()*60)+' '+Math.round(4+r()*20*(.4+g.dry))+' '+Math.round(16+r()*60)+' '+Math.round(4+r()*16)})}
      if(r()<.6){var side=r()>.5?.5:-.5;s.hr.push({d:line(pen,i0,Math.min(i1,i0+Math.round((i1-i0)*.6)),side,(r()-.5)*4),sw:f1(1+r()*1.2),op:f1(.3+r()*.3),dash:Math.round(16+r()*36)+' '+Math.round(5+r()*14)})}
    });
    strokes.push(s);
  }
  /* splatter near stroke ends */
  for(var q=0;q<g.splat;q++){var pen=pens[Math.floor(r()*pens.length)],end=r()>.5,i=end?pen.p.length-1:0,k2=Math.min(11,Math.floor(((cuts[pens.indexOf(pen)].a+(end?pen.len:0))/total)*12-(end?1e-6:0)));
    for(var z=0;z<2;z++){var sd=r()>.5?1:-1,d=pen.w[i]/2+H*(.04+r()*.08);strokes[Math.max(0,k2)].dots.push({x:f1(pen.p[i][0]+pen.nx[i]*d*sd+(r()-.5)*10),y:f1(pen.p[i][1]+pen.ny[i]*d*sd+(r()-.5)*10),r:f1((2+r()*4.5)*H/300+1)})}}
  var ghost=pens.map(function(pen){return'M'+pen.p.map(function(q){return f1(q[0])+','+f1(q[1])}).join(' L')}).join('');
  var wcx=500,wcy=y0+blockH/2,wrx=Math.max.apply(null,rw)*H/2+H*.1,wry=blockH/2+H*.08,wp=[],ph1=r()*6.28,ph2=r()*6.28;
  for(var kk=0;kk<72;kk++){var aa=kk/72*6.2832,ca=Math.cos(aa),sa=Math.sin(aa),sq=Math.pow(Math.abs(ca),.7)*Math.sign(ca),sb=Math.pow(Math.abs(sa),.7)*Math.sign(sa),wv=1+.035*Math.sin(aa*3+ph1)+.025*Math.sin(aa*7+ph2);wp.push(f1(wcx+wrx*sq*wv)+','+f1(wcy+wry*sb*wv))}
  var wash='M'+wp.join(' L')+' Z';
  var fibers=[],specks=[];for(z=0;z<16;z++){var x1=r()*1000,y1=r()*1250;fibers.push([f1(x1),f1(y1),f1(x1+(r()-.5)*120),f1(y1+(r()-.5)*36)])}
  for(z=0;z<26;z++)specks.push([f1(r()*1000),f1(r()*1250),f1(.6+r()*1.1)]);
  var qq=[r()>.4,r()>.5,r()>.5,r()>.35],cells=[],cs=22,ox=743+57-cs*2,oy=953+57-cs*2;
  [[0,0,qq[0]],[1,0,qq[1]],[0,1,qq[2]],[1,1,qq[3]]].forEach(function(c){if(!c[2])return;var x=c[0],y=c[1];[[x,y],[3-x,y],[x,3-y],[3-x,3-y]].forEach(function(m){cells.push([ox+m[0]*cs,oy+m[1]*cs,cs-3])})});
  return gcache[key]={strokes:strokes,ghost:ghost,wash:wash,fibers:fibers,specks:specks,cells:cells,maskW:f1(H*.5),H:H,bounds:{x0:500-Math.max.apply(null,rw)*H/2,x1:500+Math.max.apply(null,rw)*H/2}};
}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var uidN=0;
function svgSym(data,c,name,sym,no){
  var u='p'+(uidN++),o=[];name=esc(name);sym=esc(sym);
  o.push('<svg viewBox="0 0 1000 1250" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>');
  data.strokes.forEach(function(s){o.push('<mask id="'+u+'m'+s.i+'" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1250"><path class="mp" d="'+(s.center||'M0,0')+'" fill="none" stroke="#fff" stroke-width="'+data.maskW+'" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></mask>')});
  o.push('</defs><rect width="1000" height="1250" fill="'+c.paper+'"/>');
  data.fibers.forEach(function(f){o.push('<line x1="'+f[0]+'" y1="'+f[1]+'" x2="'+f[2]+'" y2="'+f[3]+'" stroke="'+c.shade+'" stroke-width="1.4" stroke-opacity=".18"/>')});
  data.specks.forEach(function(k){o.push('<circle cx="'+k[0]+'" cy="'+k[1]+'" r="'+k[2]+'" fill="'+c.shade+'" fill-opacity=".3"/>')});
  o.push('<path d="'+data.wash+'" fill="'+c.wash+'" fill-opacity=".12"/>');
  o.push('<path class="ghost" d="'+data.ghost+'" fill="none" stroke="'+c.ink+'" stroke-opacity=".16" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round" stroke-linejoin="round"/>');
  data.strokes.forEach(function(s){if(!s.body)return;
    o.push('<g mask="url(#'+u+'m'+s.i+')"><path d="'+s.halo+'" fill="'+c.ink+'" fill-opacity=".1"/><path d="'+s.body+'" fill="'+c.ink+'" fill-opacity="'+s.op+'"/>'+(s.head?'<path d="'+s.head+'" fill="'+c.ink+'" fill-opacity=".22"/>':''));
    s.br.forEach(function(b){o.push('<path d="'+b.d+'" fill="none" stroke="'+c.paper+'" stroke-width="'+b.sw+'" stroke-opacity="'+b.op+'" stroke-dasharray="'+b.dash+'" stroke-linecap="round"/>')});
    s.hr.forEach(function(b){o.push('<path d="'+b.d+'" fill="none" stroke="'+c.ink+'" stroke-width="'+b.sw+'" stroke-opacity="'+b.op+'" stroke-dasharray="'+b.dash+'" stroke-linecap="round"/>')});
    s.dots.forEach(function(d){o.push('<circle cx="'+d.x+'" cy="'+d.y+'" r="'+d.r+'" fill="'+c.ink+'" fill-opacity=".75"/>')});
    o.push('</g>')});
  o.push('<g class="rim"><rect x="20" y="20" width="960" height="1210" fill="none" stroke="'+c.seal+'" stroke-width="3" stroke-opacity=".9"/><rect x="32" y="32" width="936" height="1186" fill="none" stroke="'+c.seal+'" stroke-width="1.5" stroke-opacity=".9"/></g>');
  o.push('<g transform="rotate(-4 800 1010)"><g class="seal"><rect x="743" y="953" width="114" height="114" fill="none" stroke="'+c.seal+'" stroke-width="6"/>');
  data.cells.forEach(function(k){o.push('<rect x="'+k[0]+'" y="'+k[1]+'" width="'+k[2]+'" height="'+k[2]+'" fill="'+c.seal+'"/>')});
  o.push('</g></g>');
  o.push('<text x="60" y="1146" font-family="serif" font-size="40" fill="'+c.ink+'">'+name+(name!==sym?' ('+sym+')':'')+'</text><text x="60" y="1198" font-family="sans-serif" font-size="26" fill="'+c.ink+'" fill-opacity=".8">No. '+no+'</text><text class="cnt" x="940" y="1198" text-anchor="end" font-family="sans-serif" font-size="26" fill="'+c.ink+'" fill-opacity=".8">0 of 12 strokes</text></svg>');
  return o.join('');
}


export { buildSym, svgSym, GL };
