/** Original, editable anatomical studies. Metres; Y up, +Z front.
 * No image planes: image colour is baked onto closed 3D surfaces.
 * References are colour/design sources, not scans or historical evidence.
 */
import * as T from './three.module.js';
import {mergeVertices} from './BufferGeometryUtils.js';
const V=(x,y,z)=>new T.Vector3(x,y,z), clamp=T.MathUtils.clamp;
const smooth=(a,b,x)=>{x=clamp((x-a)/(b-a),0,1);return x*x*(3-2*x);};
const gauss=(x,y,cx,cy,sx,sy)=>Math.exp(-(((x-cx)/sx)**2+((y-cy)/sy)**2)*2);
let seed=13579;function random(){seed=(seed*16807)%2147483647;return seed/2147483647;}
function material(color,roughness=.8,more={}){return new T.MeshStandardMaterial({color,roughness,...more});}
function mesh(g,geo,mat,name){const m=new T.Mesh(geo,mat);m.name=name||'雕塑細部';m.castShadow=m.receiveShadow=true;g.add(m);return m;}
function ell(g,p,s,mat,name){const m=mesh(g,new T.SphereGeometry(1,40,28),mat,name);m.position.set(...p);m.scale.set(...s);return m;}
function tube(g,points,r,mat,name,segments=32,sides=8){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>V(...p))),segments,r,sides,false),mat,name);}
function geometry(p,ix,uv){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));if(ix)g.setIndex(ix);if(uv)g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;}
async function sampler(file){const im=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('素材未能載入：'+file));i.src=new URL('./assets/model-reference/'+file,import.meta.url).href;});const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0);const d=ctx.getImageData(0,0,c.width,c.height).data;const col=new T.Color();return(u,v)=>{const x=clamp(Math.round(u*(c.width-1)),0,c.width-1),y=clamp(Math.round(v*(c.height-1)),0,c.height-1),i=(y*c.width+x)*4;col.setRGB(d[i]/255,d[i+1]/255,d[i+2]/255,T.SRGBColorSpace);return col.clone();};}
function paint(geo,fn){const p=geo.attributes.position,c=[];for(let i=0;i<p.count;i++){const a=fn(p.getX(i),p.getY(i),p.getZ(i));c.push(a.r,a.g,a.b);}geo.setAttribute('color',new T.Float32BufferAttribute(c,3));return geo;}
function bakeAtlas(geo,fn,tile=12){
 const src=geo.index?geo.toNonIndexed():geo.clone(),p=src.attributes.position,count=p.count/3,cols=Math.ceil(Math.sqrt(count)),size=2**Math.ceil(Math.log2(cols*tile)),canvas=document.createElement('canvas');canvas.width=canvas.height=size;
 const ctx=canvas.getContext('2d'),im=ctx.createImageData(size,size),uv=[],a=new T.Color();
 for(let i=0;i<count;i++){
  const tx=(i%cols)*tile,ty=Math.floor(i/cols)*tile,vs=[0,1,2].map(j=>[p.getX(i*3+j),p.getY(i*3+j),p.getZ(i*3+j)]);
  const coords=[[1,1],[tile-2,1],[1,tile-2]];for(const [x,y]of coords)uv.push((tx+x+.5)/size,1-(ty+y+.5)/size);
  for(let y=0;y<tile;y++)for(let x=0;x<tile;x++){
   let b=(x-1)/(tile-3),c=(y-1)/(tile-3);b=Math.max(0,b);c=Math.max(0,c);if(b+c>1){const n=b+c;b/=n;c/=n;}const w=1-b-c;
   const xyz=vs[0].map((v,k)=>v*w+vs[1][k]*b+vs[2][k]*c),col=fn(...xyz);a.copy(col).convertLinearToSRGB();const o=((ty+y)*size+tx+x)*4;im.data[o]=Math.round(a.r*255);im.data[o+1]=Math.round(a.g*255);im.data[o+2]=Math.round(a.b*255);im.data[o+3]=255;
  }
 }
 ctx.putImageData(im,0,0);src.deleteAttribute('color');src.setAttribute('uv',new T.Float32BufferAttribute(uv,2));const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;return {geo:src,map:tex};
}
function grain(kind){const size=256,d=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=4*(y*size+x);let n=128+(random()-.5)*45;if(kind==='cloth')n+=(x%3===0?18:-5)+(y%4===0?12:-4);else if(kind==='fur')n+=Math.sin(y*.8+x*.08)*22;d[i]=d[i+1]=d[i+2]=n;d[i+3]=255;}const t=new T.DataTexture(d,size,size);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(kind==='cloth'?7:3,kind==='cloth'?7:3);t.needsUpdate=true;return t;}
// Smooth union of anatomically placed volumes, polygonised with marching tetrahedra.
// Geometry is welded, normals analytic: no visible overlapping torso/limb primitives.
function implicit(parts,bounds,step=.027,blend=.055){
 const field=(x,y,z)=>{let d=100;for(const [cx,cy,cz,rx,ry,rz]of parts){const q=Math.sqrt(((x-cx)/rx)**2+((y-cy)/ry)**2+((z-cz)/rz)**2)-1;const e=q*Math.min(rx,ry,rz);const h=Math.max(blend-Math.abs(d-e),0)/blend;d=Math.min(d,e)-h*h*blend*.25;}return d;};
 const [lo,hi]=bounds,ns=hi.map((h,i)=>Math.ceil((h-lo[i])/step)),ny=ns[1]+1,nz=ns[2]+1;
 const values=new Float32Array((ns[0]+1)*ny*nz),index=(x,y,z)=>(x*ny+y)*nz+z;
 for(let x=0;x<=ns[0];x++)for(let y=0;y<=ns[1];y++)for(let z=0;z<=ns[2];z++)values[index(x,y,z)]=field(lo[0]+x*step,lo[1]+y*step,lo[2]+z*step);
 const offsets=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]],tets=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]],p=[];
 const normal=(v)=>{const e=.001;return V(field(v.x+e,v.y,v.z)-field(v.x-e,v.y,v.z),field(v.x,v.y+e,v.z)-field(v.x,v.y-e,v.z),field(v.x,v.y,v.z+e)-field(v.x,v.y,v.z-e)).normalize();};
 const tri=(a,b,c)=>{const n=normal(a.clone().add(b).add(c).multiplyScalar(1/3));if(b.clone().sub(a).cross(c.clone().sub(a)).dot(n)<0)[b,c]=[c,b];p.push(...a,...b,...c);};
 for(let x=0;x<ns[0];x++)for(let y=0;y<ns[1];y++)for(let z=0;z<ns[2];z++){
 const vs=offsets.map(([a,b,c])=>values[index(x+a,y+b,z+c)]);if(vs.every(v=>v>=0)||vs.every(v=>v<0))continue;
 const ps=offsets.map(([a,b,c])=>V(lo[0]+(x+a)*step,lo[1]+(y+b)*step,lo[2]+(z+c)*step));
 const edge=(a,b)=>ps[a].clone().lerp(ps[b],vs[a]/(vs[a]-vs[b]));
 for(const t of tets){const ins=t.filter(i=>vs[i]<0),out=t.filter(i=>vs[i]>=0);if(ins.length===1)tri(...out.map(j=>edge(ins[0],j)));else if(ins.length===3)tri(...ins.map(j=>edge(out[0],j)));else if(ins.length===2){const a=edge(ins[0],out[0]),b=edge(ins[0],out[1]),c=edge(ins[1],out[0]),d=edge(ins[1],out[1]);tri(a,b,c);tri(b,d,c);}}
 }
 let geo=mergeVertices(geometry(p),.0001);const n=[];const pp=geo.attributes.position;for(let i=0;i<pp.count;i++)n.push(...normal(V(pp.getX(i),pp.getY(i),pp.getZ(i))));geo.setAttribute('normal',new T.Float32BufferAttribute(n,3));return geo;
}
function ringSurface(g,rings,mat,name,fold=.01,segments=96){
 // Rings [y, half-width, half-depth, centre-x, centre-z]. Smooth interpolation.
 const paths=[0,1,2,3,4].map(k=>new T.CatmullRomCurve3(rings.map((r,i)=>V(i,r[k]||0,0))));
 const rows=(rings.length-1)*12,p=[],uv=[],ix=[];
 for(let i=0;i<=rows;i++){const t=i/rows,r=paths.map(c=>c.getPoint(t).y),[y,rx,rz,cx,cz]=r;for(let j=0;j<=segments;j++){const a=j/segments*Math.PI*2;const f=fold*(Math.sin(a*17+y*2)+.43*Math.sin(a*29-y*5)+.26*Math.cos(a*43+y*8));p.push(cx+(rx+f)*Math.sin(a),y,cz+(rz+f*.7)*Math.cos(a));uv.push(j/segments,t);}}
 for(let i=0;i<rows;i++)for(let j=0;j<segments;j++){const a=i*(segments+1)+j,b=a+segments+1;ix.push(a,a+1,b,b,a+1,b+1);}return mesh(g,geometry(p,ix,uv),mat,name);
}
function ribbon(g,points,width,mat,name){const path=new T.CatmullRomCurve3(points.map(p=>V(...p))),p=[],uv=[],ix=[];for(let i=0;i<=80;i++){const t=i/80,c=path.getPoint(t),a=path.getTangent(t);const side=V(a.y,-a.x,0).normalize();for(const s of [-1,1]){const v=c.clone().addScaledVector(side,width*s/2);p.push(...v);uv.push(s===-1?0:1,t);}}for(let i=0;i<80;i++){const a=i*2;ix.push(a,a+1,a+2,a+1,a+3,a+2);}return mesh(g,geometry(p,ix,uv),mat,name);}
export async function buildTiger(){
 const [coat,face]=await Promise.all([sampler('tiger-coat.png'),sampler('tiger-face.png')]);
 const g=new T.Group();g.name='林間虎影_原創三維研究';
 const fur=material(0xffffff,.96,{vertexColors:true}),ivory=material(0xcac6b2,.9),ink=material(0x211a16,.85),nose=material(0x936455,.55),eyeMat=material(0xb78b3c,.28),pupil=material(0x080b09,.18);
 const parts=[
 [0,.78,-.22,.32,.32,.79], [0,.91,.40,.34,.36,.39], [0,.83,-.76,.30,.29,.32], // ribcage, scapula, pelvis
 [0,1.02,.69,.25,.32,.33], [0,1.13,.96,.237,.216,.225], // neck, skull
 [0,1.00,1.10,.205,.15,.18], [0,1.025,1.205,.12,.085,.10], // jaws and nose bridge
 [-.107,.995,1.20,.104,.075,.095],[.107,.995,1.20,.104,.075,.095], [0,.945,1.14,.14,.065,.13]
 ];
 for(const s of [-1,1]){
 // Foreleg muscle slopes down from scapula; long metacarpal and broad paw.
 parts.push([s*.255,.70,.46,.15,.33,.19],[s*.27,.43,.52,.096,.23,.10],[s*.27,.20,.55,.075,.18,.085],[s*.27,.074,.64,.118,.074,.18]);
 // Hind femur, stifle and rearward hock. Less rigid than four vertical pillars.
 parts.push([s*.24,.69,-.76,.18,.30,.23],[s*.26,.43,-.62,.12,.20,.12],[s*.265,.24,-.80,.072,.19,.078],[s*.265,.072,-.73,.11,.072,.17]);
 for(let i=0;i<4;i++){parts.push([s*.27+(i-1.5)*.049,.06,.755,.033,.046,.068]);parts.push([s*.265+(i-1.5)*.047,.058,-.62,.032,.044,.06]);}
 }
 const geo=implicit(parts,[[-.56,-.025,-1.14],[.56,1.45,1.37]],.020,.075);
 const color=(x,y,z)=>{
 // Triplanar reference sampling: side coat, pale underside, and soft face projection.
 const u=((z*.72+.12*Math.sin(y*5)+.3*(x<0?1:0))%1+1)%1,v=clamp(1-(y-.16)/1.18,0,1);
 let c=coat(u,v);const pale=1-smooth(.40,.64,y);if(z<.85)c.lerp(new T.Color(0xcfc7af),pale*.52);
 if(z>.84){const f=face(.5+x/.54,.02+(1.25-y)/.33);const amount=smooth(.86,1.09,z)*(1-smooth(.21,.28,Math.abs(x)));c.lerp(f,amount);}
 return c;
 };
 const atlas=bakeAtlas(geo,color,10);mesh(g,atlas.geo,material(0xffffff,.96,{map:atlas.map}),'連續肩背_軀幹_四肢_足趾');
 // Tail: tapered, continuous curved tube with image-derived ring colours.
 const path=new T.CatmullRomCurve3([V(0,.91,-.97),V(.10,.77,-1.28),V(.25,.44,-1.57),V(.43,.27,-1.78),V(.61,.37,-1.94),V(.65,.56,-1.89)]);
 const tg=new T.TubeGeometry(path,100,.048,14,false),p=tg.attributes.position;
 for(let i=0;i<p.count;i++){const t=Math.floor(i/15)/100,c=path.getPointAt(t),v=V(p.getX(i),p.getY(i),p.getZ(i));v.sub(c).multiplyScalar(1-.65*t).add(c);p.setXYZ(i,...v);}tg.computeVertexNormals();paint(tg,(x,y,z)=>{const a=.5+.5*Math.sin(z*44+y*12);return a>.58?new T.Color(0x28221a):coat(.31,clamp(.8-y,.1,.9));});mesh(g,tg,fur,'漸細環紋尾');
 for(const s of [-1,1]){
 const ear=ell(g,[s*.198,1.300,.895],[.068,.072,.040],fur,'立體外耳');paint(ear.geometry,(x,y,z)=>new T.Color(z>0?0x9d7753:0x27241e));ear.rotation.z=-s*.18;
 ell(g,[s*.199,1.300,.931],[.041,.048,.010],material(0x89796a,.98),'耳廓內側');ell(g,[s*.199,1.31,.856],[.039,.048,.009],ivory,'耳背白斑');
 // Small recessed eyes and eyelids; no protruding globe in front of face.
 ell(g,[s*.108,1.16,1.133],[.043,.023,.012],ink,'眼眶');
 ell(g,[s*.108,1.16,1.145],[.026,.018,.007],eyeMat,'虹膜');ell(g,[s*.108,1.16,1.151],[.009,.014,.003],pupil,'瞳孔');
 ell(g,[s*.101,1.169,1.155],[.0045,.0045,.002],material(0xe9e9d5,.15),'角膜反光');
 tube(g,[[s*.063,1.164,1.151],[s*.108,1.180,1.151],[s*.152,1.168,1.145]],.0075,ink,'上眼瞼');
 tube(g,[[s*.068,1.151,1.151],[s*.11,1.143,1.151],[s*.15,1.158,1.145]],.0045,ink,'下眼瞼');
 for(let j=0;j<16;j++){const yy=.974+(j%4)*.012,xx=s*(.06+Math.floor(j/4)*.022),zz=1.287-.1*Math.abs(xx);ell(g,[xx,yy,zz],[.0028,.0028,.002],ink,'鬚根');tube(g,[[xx,yy,zz],[s*.24,yy+.012,1.32],[s*(.35+random()*.10),yy+.06-random()*.12,1.30-random()*.1]],.0007,ivory,'觸鬚',18,4);}
 // Toe clefts are geometry, not painted on the foot.
 for(const z of [.79,-.59])for(let j=-1;j<=1;j++)tube(g,[[s*.27+j*.049,.10,z-.045],[s*.27+j*.049,.071,z],[s*.27+j*.049,.035,z+.012]],.002,ink,'趾縫',10,5);
 }
 const ng=geometry([-.061,1.052,1.313,.061,1.052,1.313,0,1.008,1.344,0,1.072,1.294,0,1.026,1.29],[0,2,1,0,1,3,0,3,4,1,4,3,0,4,2,1,2,4]);mesh(g,ng,nose,'三維鼻翼');
 for(const s of [-1,1])ell(g,[s*.044,1.042,1.322],[.014,.008,.006],ink,'鼻孔');
 tube(g,[[0,1.012,1.34],[0,.976,1.31]],.0035,ink,'人中');tube(g,[[-.14,.965,1.22],[-.085,.956,1.28],[0,.966,1.307],[.085,.956,1.28],[.14,.965,1.22]],.004,ink,'閉合嘴線');
 g.userData={description:'原創真三維網格；AI圖像僅為造型與色彩來源',units:'metres',studyVersion:1};return g;
}
export async function buildScholar(){
 const face=await sampler('scholar-face.png'),g=new T.Group();g.name='宋代遷客_藝術重構';
 const weave=grain('cloth'),pores=grain('skin'),cloth=material(0x586270,.97,{bumpMap:weave,bumpScale:.0015,side:T.DoubleSide}),lining=material(0xbfb8a3,.98,{bumpMap:weave,bumpScale:.001}),sash=material(0x41444a,.95,{bumpMap:weave,bumpScale:.001}),hair=material(0x343631,.91),skin=material(0xbc9176,.76,{bumpMap:pores,bumpScale:.0005}),lip=material(0x805d50,.8),dark=material(0x302921,.8);
 // Adult figure 1.76m / 7.5 head lengths. Weight held over two offset feet.
 for(const s of [-1,1]){const shoe=ell(g,[s*.12,.054,.055+(s===1?.02:0)],[.085,.053,.16],material(0x303332,.92),'布鞋');tube(g,[[s*.12-.075,.025,.16],[s*.12,.02,.21],[s*.12+.075,.025,.16]],.005,lining,'鞋底縫');}
 ringSurface(g,[[.10,.245,.15],[.17,.27,.16],[.5,.25,.155],[.85,.20,.13],[1.04,.164,.117],[1.24,.207,.12],[1.39,.214,.10],[1.44,.08,.072]],cloth,'長袍連續衣身',.0045,128);
 ringSurface(g,[[.11,.215,.14],[.15,.22,.145],[.6,.19,.13]],lining,'內袍下擺',.006);
 // Sleeves hang from shoulders, down toward wrist; broad bottom hangs below hand.
 for(const s of [-1,1]){
 ringSurface(g,[[.65,.065,.078,s*.39,.035],[.71,.105,.10,s*.40,.025],[.82,.142,.114,s*.38,.012],[1.00,.15,.12,s*.33,0],[1.19,.138,.114,s*.28,0],[1.34,.10,.10,s*.22,0],[1.395,.063,.074,s*.175,0]],cloth,'垂墜寬袖',.003,80);
 ringSurface(g,[[.718,.084,.095,s*.405,.04],[.76,.091,.10,s*.40,.04],[.82,.082,.091,s*.395,.04]],lining,'袖口內襯',.002,64);
 // Palm with thenar mound, knuckles, five separately articulated fingers.
 const hand=new T.Group();hand.position.set(s*.415,.805,.095);hand.rotation.z=s*.10;g.add(hand);hand.name='五指手掌';
 ell(hand,[0,-.038,0],[.035,.057,.019],skin,'掌心');ell(hand,[-s*.022,-.04,.009],[.016,.031,.014],skin,'拇指球');
 for(let i=0;i<4;i++){const x=(i-1.5)*.0175,L=[.067,.083,.079,.060][i],top=-.071;const pts=[[x,top,0],[x+s*.002,top-L*.40,.007],[x+s*.004,top-L*.78,.018],[x+s*.003,top-L,.029]];tube(hand,pts,.0071-i*.0003,skin,'指節_'+i,18,8);ell(hand,[x,top+.002,0],[.009,.012,.016],skin,'掌指關節');ell(hand,[x+s*.003,top-L+.004,.034],[.0046,.009,.0013],material(0xbd9d88,.52),'指甲');for(const f of [.42,.75])tube(hand,[[x-.005,top-L*f,.015],[x,top-L*f-.001,.017],[x+.005,top-L*f,.015]],.00065,lip,'指節褶線',8,4);}
 tube(hand,[[-s*.025,-.025,.006],[-s*.042,-.043,.018],[-s*.048,-.064,.028],[-s*.038,-.082,.032]],.009,skin,'拇指',20,10);
 }
 // Cross collar: ivory inner lining and two overlapping textile bands, left over right.
 ribbon(g,[[-.061,1.449,.068],[-.035,1.38,.107],[.054,1.24,.143],[.11,1.16,.146]],.035,lining,'右內領');
 ribbon(g,[[.061,1.449,.071],[.036,1.38,.11],[-.048,1.25,.149],[-.087,1.18,.15]],.035,lining,'左內領');
 ribbon(g,[[-.079,1.43,.082],[-.048,1.34,.131],[.07,1.17,.153],[.12,1.05,.144]],.053,cloth,'右交領');
 ribbon(g,[[.079,1.43,.087],[.042,1.34,.135],[-.049,1.19,.165],[-.13,1.04,.148]],.058,cloth,'左交領覆右');
 ringSurface(g,[[.974,.177,.131],[.997,.173,.131],[1.026,.174,.131]],sash,'束帶',.0017);
 for(let j=0;j<6;j++){const yy=.982+j*.007;tube(g,[[-.17,yy,.037],[-.12,yy+.008,.107],[0,yy,.138],[.12,yy+.005,.10],[.17,yy,.025]],.0022,sash,'帶褶');}
 ell(g,[.07,1.00,.147],[.026,.020,.013],sash,'帶結');
 ribbon(g,[[.07,1,.15],[.09,.83,.17],[.081,.59,.19],[.107,.42,.204]],.032,sash,'垂帶一');ribbon(g,[[.058,1,.15],[.04,.84,.171],[.045,.68,.185]],.026,sash,'垂帶二');
 tube(g,[[.07,1.00,.157],[.12,.94,.16],[.09,.87,.17],[.067,.94,.165],[.07,1,.157]],.006,sash,'帶結環');
 // Neck transitions into jaw; head surface sculpted in rings with local facial relief.
 ell(g,[0,1.447,-.005],[.056,.094,.052],skin,'頸部');
 const rings=[[1.46,.018,.035,.015],[1.48,.046,.049,.012],[1.51,.071,.062,0],[1.54,.080,.069,0],[1.58,.081,.075,-.003],[1.62,.084,.078,-.006],[1.66,.083,.077,-.010],[1.70,.074,.071,-.012],[1.73,.053,.052,-.012],[1.747,.001,.002,-.012]];
 const curve=new T.CatmullRomCurve3(rings.map(r=>V(r[0],r[1],r[2]))),zc=new T.CatmullRomCurve3(rings.map(r=>V(r[0],r[3],0))),p=[],ix=[],uv=[],seg=224,rows=180;
 for(let i=0;i<=rows;i++){const t=i/rows,r=curve.getPoint(t),y=r.x,cz=zc.getPoint(t).y;for(let j=0;j<=seg;j++){const a=j/seg*Math.PI*2,x=r.y*Math.sin(a),front=Math.max(0,Math.cos(a));let z=cz+r.z*Math.cos(a);
 if(front>0){const relief=(.020*gauss(x,y,0,1.597,.019,.048)+.032*gauss(x,y,0,1.569,.023,.019)+.011*gauss(x,y,0,1.505,.045,.020)+.010*gauss(x,y,0,1.535,.033,.015)+.008*gauss(Math.abs(x),y,.055,1.574,.026,.026)-.012*gauss(Math.abs(x),y,.036,1.612,.027,.017)+.007*gauss(Math.abs(x),y,.039,1.633,.031,.015));z+=relief*front**3;}
 p.push(x,y,z);uv.push(j/seg,t);}}
 for(let i=0;i<rows;i++)for(let j=0;j<seg;j++){const a=i*(seg+1)+j,b=a+seg+1;ix.push(a,a+1,b,b,a+1,b+1);}
 const hg=geometry(p,ix,uv);const headColor=(x,y,z)=>{const base=new T.Color(0xb18c73);if(z<.005)return base;const c=face(.5+x/.15,(1.68-y)/.195);return base.lerp(c,smooth(.006,.055,z)*(1-smooth(.064,.084,Math.abs(x))));};const headAtlas=bakeAtlas(hg,headColor,7);mesh(g,headAtlas.geo,material(0xffffff,.82,{map:headAtlas.map}),'雕塑頭顱_額_顴_鼻_下頜');
 // Ear helix and concha, eyelid-limited eyes; sclera is deliberately off-white.
 for(const s of [-1,1]){
 ell(g,[s*.084,1.595,-.006],[.018,.035,.014],skin,'耳廓');ell(g,[s*.093,1.596,.005],[.008,.023,.005],lip,'耳甲腔');
 tube(g,[[s*.088,1.565,.004],[s*.101,1.584,.007],[s*.10,1.615,.004],[s*.088,1.625,.001]],.0036,skin,'耳輪');
 ell(g,[s*.035,1.610,.064],[.016,.005,.003],material(0xb7aea0,.5),'眼白');ell(g,[s*.034,1.61,.068],[.006,.005,.0015],material(0x403c2d,.3),'虹膜');ell(g,[s*.034,1.61,.070],[.003,.0035,.001],material(0x111813,.2),'瞳孔');
 tube(g,[[s*.015,1.610,.067],[s*.034,1.616,.069],[s*.054,1.612,.064]],.0011,skin,'上眼瞼');tube(g,[[s*.015,1.608,.067],[s*.034,1.606,.069],[s*.054,1.61,.064]],.0009,skin,'下眼瞼');
 for(let j=0;j<30;j++){const t=j/30,x=s*(.017+.043*t),y=1.634+.006*Math.sin(t*Math.PI)-.009*t;tube(g,[[x,y,.072],[x+s*.005,y+.002,.074],[x+s*.008,y+.001,.072]],.00025,hair,'眉毛',7,4);}
 ell(g,[s*.012,1.561,.099],[.005,.0026,.002],dark,'鼻孔');ell(g,[s*.015,1.567,.094],[.005,.004,.004],skin,'鼻翼');
 }
 tube(g,[[-.025,1.539,.078],[-.012,1.541,.088],[0,1.538,.091],[.012,1.541,.088],[.025,1.539,.078]],.0025,lip,'上唇');tube(g,[[-.023,1.536,.079],[0,1.532,.089],[.023,1.536,.079]],.003,lip,'下唇');tube(g,[[-.024,1.537,.08],[0,1.536,.091],[.024,1.537,.08]],.00085,dark,'口縫');
 // Full rear hair cap, cloth headwrap, trailing fabric and individual beard strands.
 ringSurface(g,[[1.672,.08,.077,0,-.011],[1.70,.085,.08,0,-.013],[1.74,.076,.073,0,-.016],[1.775,.045,.052,0,-.018],[1.785,.002,.002,0,-.018]],hair,'髮髻頭巾',.0003);
 for(let j=0;j<8;j++)tube(g,[[-.07,1.705+j*.006,.02],[-.045,1.714+j*.006,.063],[.025,1.72+j*.006,.064],[.07,1.716+j*.005,.014]],.003,sash,'巾布層疊');
 ell(g,[0,1.785,-.022],[.044,.030,.04],sash,'巾結');
 ribbon(g,[[-.045,1.73,-.075],[-.053,1.61,-.093],[-.05,1.46,-.09],[-.072,1.35,-.117]],.035,sash,'巾帶背面');ribbon(g,[[.03,1.73,-.075],[.049,1.59,-.096],[.045,1.43,-.111]],.032,sash,'巾帶背面二');
 for(let i=0;i<190;i++){const s=i%2?1:-1,t=random(),x=s*(.003+t*.026),y=1.528-random()*.016,z=.079-.4*Math.abs(x),len=.040+random()*.044*(1-t);tube(g,[[x,y,z],[x*.88,y-len*.45,z+.009],[x*.54,y-len,z-.004]],.00025,i%7===0?lining:hair,'鬍鬚纖維',10,4);}
 for(let i=0;i<80;i++){const s=i%2?1:-1,t=random(),x=s*(.004+t*.026),y=1.550-.009*t;tube(g,[[x,y,.089],[x+s*.006,y-.008,.092],[x+s*.013,y-.011,.086]],.00025,i%9===0?lining:hair,'髭',8,4);}
 g.userData={description:'宋代文人服飾藝術重構；非具名人物肖像',heightMetres:1.81,studyVersion:1};return g;
}
