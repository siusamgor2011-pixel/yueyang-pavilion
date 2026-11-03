import { createExplore } from './explore.js';
import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js';
import { Water } from './Water.js';

const $ = s => document.querySelector(s);
const clamp = THREE.MathUtils.clamp;
let seed=73651;
const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
const rnd=(a,b)=>a+(b-a)*rand();
const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0xbacbd0,.0015);
const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.18,4500);
camera.position.set(35,24,43);
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch(e){$('#loading').innerHTML='<p>此瀏覽器未能啟動 3D 顯示</p><span>請使用支援 WebGL 的 Safari 或 Chrome 再試。</span>';throw e;}
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
$('#experience').appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);
controls.target.set(0,8.8,0);controls.enableDamping=true;controls.dampingFactor=.065;
controls.minDistance=7;controls.maxDistance=210;controls.maxPolarAngle=Math.PI*.485;
controls.minTargetRadius=0;controls.maxTargetRadius=95;controls.autoRotateSpeed=.33;
controls.touches.ONE=THREE.TOUCH.ROTATE;controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;
controls.mouseButtons.RIGHT=THREE.MOUSE.PAN;
const hemi=new THREE.HemisphereLight(0xd3e9ef,0x75634d,2.3);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffedc5,3.2);sun.position.set(-40,65,45);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-37,right:37,top:37,bottom:-37,near:1,far:160});sun.shadow.bias=-.0004;sun.shadow.normalBias=.075;sun.shadow.radius=3;scene.add(sun);scene.add(sun.target);
const fill=new THREE.DirectionalLight(0xbad5db,.65);fill.position.set(35,18,-24);scene.add(fill);

function texture(size,paint,repeatX=1,repeatY=1){const c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d');paint(ctx,size);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeatX,repeatY);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;}
const woodTex=texture(512,(c,s)=>{c.fillStyle='#7e4430';c.fillRect(0,0,s,s);for(let i=0;i<1600;i++){c.strokeStyle=`rgba(${rand()>.5?'30,13,6':'211,139,83'},${rnd(.025,.13)})`;c.lineWidth=rnd(.3,1.6);c.beginPath();const y=rnd(0,s);c.moveTo(0,y);for(let x=0;x<=s;x+=20)c.lineTo(x,y+Math.sin(x*.025+i)*rnd(1,4));c.stroke();}for(let i=0;i<22;i++){c.strokeStyle='#301e1418';c.lineWidth=rnd(.4,1);c.strokeRect(rnd(0,s),rnd(0,s),rnd(15,90),rnd(.5,2));}},2,1);
const stoneTex=texture(1024,(c,s)=>{c.fillStyle='#aaa79a';c.fillRect(0,0,s,s);for(let y=0;y<s;y+=128){for(let x=-256;x<s;x+=256){const xx=x+((y/128)%2)*128;c.fillStyle=`hsl(43,${rnd(3,9)}%,${rnd(51,67)}%)`;c.fillRect(xx+2,y+2,252,124);c.strokeStyle='#c5c0ae';c.lineWidth=2;c.strokeRect(xx+4,y+4,248,120);}}for(let i=0;i<100000;i++){c.fillStyle=rand()>.5?'#ffffff0b':'#222a200b';c.fillRect(rnd(0,s),rnd(0,s),rnd(.4,2.2),rnd(.3,1.8));}},2,1);
const floorTex=texture(1024,(c,s)=>{c.fillStyle='#999b8d';c.fillRect(0,0,s,s);for(let y=0;y<s;y+=128)for(let x=0;x<s;x+=128){c.fillStyle=`hsl(56,${rnd(5,12)}%,${rnd(62,75)}%)`;c.fillRect(x+2,y+2,124,124);}for(let i=0;i<50000;i++){c.fillStyle='#2337230b';c.fillRect(rnd(0,s),rnd(0,s),2,1);}},4,4);
const groundTex=texture(512,(c,s)=>{c.fillStyle='#878a62';c.fillRect(0,0,s,s);for(let i=0;i<60000;i++){c.fillStyle=`rgba(${rand()>.4?'46,69,29':'197,176,122'},.12)`;c.fillRect(rnd(0,s),rnd(0,s),rnd(1,3),rnd(1,3));}},30,30);
const plasterTex=texture(256,(c,s)=>{c.fillStyle='#d8cdb3';c.fillRect(0,0,s,s);for(let i=0;i<12000;i++){c.fillStyle=rand()>.5?'#fff4da16':'#776a4c09';c.fillRect(rand()*s,rand()*s,rand()*2,1);}});
const mats={
 wood:new THREE.MeshStandardMaterial({color:0xa57a54,map:woodTex,bumpMap:woodTex,bumpScale:.018,roughness:.79}),
 red:new THREE.MeshStandardMaterial({color:0xa56b49,map:woodTex,roughness:.62}),
 dark:new THREE.MeshStandardMaterial({color:0x372b20,map:woodTex,roughness:.8}),
 gold:new THREE.MeshStandardMaterial({color:0xb48b43,roughness:.38,metalness:.32}),
 teal:new THREE.MeshStandardMaterial({color:0x365349,roughness:.74}),
 stone:new THREE.MeshStandardMaterial({color:0xe6e2d5,map:stoneTex,bumpMap:stoneTex,bumpScale:.04,roughness:.96}),
 floor:new THREE.MeshStandardMaterial({color:0xd8d4bf,map:floorTex,bumpMap:floorTex,bumpScale:.018,roughness:.93}),
 plaster:new THREE.MeshStandardMaterial({map:plasterTex,roughness:1}),
 tile:new THREE.MeshStandardMaterial({color:0xb99946,roughness:.42,metalness:.16}),
 roofbase:new THREE.MeshStandardMaterial({color:0x675039,roughness:.85,side:THREE.DoubleSide}),
 glass:new THREE.MeshStandardMaterial({color:0x8d9c82,roughness:.6,metalness:.12}),
 tree:new THREE.MeshStandardMaterial({color:0x485b36,roughness:1,side:THREE.DoubleSide}),
 trunk:new THREE.MeshStandardMaterial({color:0x5e5141,roughness:1}),
};
const building=new THREE.Group();scene.add(building);const world=new THREE.Group();scene.add(world);
const buckets=new Map();const dummy=new THREE.Object3D();
// Open clusters of curved leaves replace opaque faceted foliage balls.
function foliageGeometry(){const p=[],uv=[];for(let k=0;k<18;k++){const a=k*2.399,x=Math.cos(a)*(.25+(k%4)*.12),z=Math.sin(a)*(.25+(k%4)*.12),y=(k%5)*.14-.3;const length=.28+(k%3)*.08,width=.10;const c=new THREE.Vector3(x,y,z),dir=new THREE.Vector3(Math.cos(a),.35,Math.sin(a)).normalize(),side=new THREE.Vector3(-Math.sin(a),0,Math.cos(a));const A=c.clone().addScaledVector(dir,-length),B=c.clone().addScaledVector(side,width),C=c.clone().addScaledVector(dir,length),D=c.clone().addScaledVector(side,-width),M=c.clone().add(new THREE.Vector3(0,.055,0));for(const tri of [[A,B,M],[B,C,M],[C,D,M],[D,A,M]]){tri.forEach(v=>p.push(v.x,v.y,v.z));uv.push(0,0,1,0,.5,1);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;}
const geometries={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,12),leaf:foliageGeometry(),sphere:new THREE.SphereGeometry(1,12,8)};
function item(shape,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0,parent=building){const key=shape+'_'+mat+'_'+parent.uuid;if(!buckets.has(key))buckets.set(key,{shape,mat,parent,items:[]});buckets.get(key).items.push({x,y,z,sx,sy,sz,rx,ry,rz});}
const box=(mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0,p=building)=>item('box',mat,x,y,z,sx,sy,sz,rx,ry,rz,p);
const cyl=(mat,x,y,z,r,h,r2=r,p=building)=>item('cyl',mat,x,y,z,r,h,r2,0,0,0,p);
function beamBetween(mat,a,b,width=.13,depth=width,parent=building){const v=new THREE.Vector3().subVectors(b,a),mid=new THREE.Vector3().addVectors(a,b).multiplyScalar(.5);dummy.position.copy(mid);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());const e=new THREE.Euler().setFromQuaternion(dummy.quaternion);item('box',mat,mid.x,mid.y,mid.z,width,v.length(),depth,e.x,e.y,e.z,parent);}
function tube(points,r,mat,parent=building){const curve=new THREE.CatmullRomCurve3(points);const m=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(12,points.length*3),r,7,false),mats[mat]);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function commit(){for(const b of buckets.values()){const m=new THREE.InstancedMesh(geometries[b.shape],mats[b.mat],b.items.length);for(let i=0;i<b.items.length;i++){const p=b.items[i];dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(p.rx,p.ry,p.rz);dummy.scale.set(p.sx,p.sy,p.sz);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);if(['tree','stone','wood','tile','trunk','leaf'].includes(b.mat)){m.setColorAt(i,new THREE.Color().setScalar(rnd(.84,1.08)));}}m.castShadow=true;m.receiveShadow=true;m.computeBoundingSphere();b.parent.add(m);}buckets.clear();}

// Shore and masonry: the building is anchored to a continuous bank.
const landShape=new THREE.Shape();landShape.moveTo(-260,300);landShape.lineTo(260,300);for(let x=260;x>=-260;x-=5)landShape.lineTo(x,20+4*Math.sin(x*.035)+2*Math.cos(x*.09));landShape.closePath();
const landGeo=new THREE.ShapeGeometry(landShape,1);landGeo.rotateX(Math.PI/2);
const ground=new THREE.Mesh(landGeo,new THREE.MeshStandardMaterial({map:groundTex,color:0xb0aa84,roughness:1,side:THREE.DoubleSide}));ground.position.z=-38;ground.position.y=-.05;scene.add(ground);
// The shoreline sits behind the tower; the broad apron extends to land.
box('stone',0,-.8,20,96,2.2,88,0,0,0,world);
box('floor',0,.35,20,94,.18,87,0,0,0,world);
box('stone',0,1.25,0,23.8,1.8,19.5);box('floor',0,2.22,0,24.5,.28,20.1);
box('stone',0,.1,-24.7,96,2.8,1.2,0,0,0,world);
box('stone',0,.85,-24.7,96,.3,1.5,0,0,0,world);
for(let i=0;i<10;i++){const y=.45+i*.18;box('stone',0,y,13.1-i*.34,7.2,.2,6-i*.48);}
for(let side of [-1,1]){for(let i=0;i<11;i++)box('stone',side*4.0,.85+i*.16,14.7-i*.35,.38,.55,.5);}
// Stone balustrade along the lake.
for(let x=-46;x<=46;x+=2.3){box('stone',x,1.54,-24.6,.22,1.4,.25,0,0,0,world);item('sphere','stone',x,2.28,-24.6,.18,.18,.18,0,0,0,world);}
box('stone',0,2,-24.6,93,.15,.21,0,0,0,world);box('stone',0,1.17,-24.6,93,.12,.18,0,0,0,world);
for(let x=-45;x<=45;x+=.57)box('stone',x,1.55,-24.6,.07,.68,.1,0,0,0,world);

// Through-columns, floor decks, lattice, painted beams, and gallery balustrades.
for(const x of [-3,3])for(const z of [-2.5,2.5]){cyl('dark',x,9.2,z,.3,13.8);cyl('stone',x,2.67,z,.43,.42);}
const levels=[{f:2.4,c:6.6,w:7.6,d:5.9},{f:7.0,c:11,w:6.8,d:5.2},{f:11.5,c:15.1,w:6.05,d:4.65}];
function rail(a,b,y){const len=a.distanceTo(b),v=b.clone().sub(a).normalize(),n=Math.round(len/.7);for(let i=0;i<=n;i++){const p=a.clone().lerp(b,i/n);box('red',p.x,y+.6,p.z,.13,1.15,.13);item('sphere','gold',p.x,y+1.23,p.z,.095,.095,.095);}for(let yy of [.22,.8,1.12]){const aa=a.clone(),bb=b.clone();aa.y=bb.y=y+yy;beamBetween('red',aa,bb,.1,.12);}for(let i=0;i<n;i++){const p=a.clone().lerp(b,(i+.5)/n);const q=p.clone().addScaledVector(v,.22),r=p.clone().addScaledVector(v,-.22);q.y=y+.68;r.y=y+.33;beamBetween('red',q,r,.065);q.y=y+.33;r.y=y+.68;beamBetween('red',q,r,.065);}}
for(let li=0;li<levels.length;li++){
const {f,c,w,d}=levels[li];
box('dark',0,f+.03,0,(w+.7)*2,.27,(d+.7)*2);box('wood',0,f+.2,0,(w+.6)*2,.1,(d+.6)*2);
for(const sign of [-1,1]){
 box('dark',0,c-.2,sign*d,w*2+.8,.35,.4);box('teal',0,c-.42,sign*d,w*2+.6,.12,.43);box('gold',0,c-.52,sign*d,w*2+.4,.045,.45);
 box('dark',sign*w,c-.2,0,.4,.35,d*2+.8);box('teal',sign*w,c-.42,0,.43,.12,d*2+.6);
 for(let x=-w;x<=w+.01;x+=w/2){cyl('red',x,(f+c)/2,sign*d,.22,c-f);cyl('stone',x,f+.15,sign*d,.32,.24);box('gold',x,c-.6,sign*d,.5,.12,.5);}
 for(let z=-d;z<=d+.01;z+=d/2){cyl('red',sign*w,(f+c)/2,z,.22,c-f);cyl('stone',sign*w,f+.15,z,.32,.24);}
 // Recessed wooden screens leave the central lakeside door open.
 const wz=sign*(d-1.15),wx=w-1.05;
 for(let x=-wx;x<=wx;x+=.28){if(Math.abs(x)<1.5)continue;box('dark',x,f+1.75,wz,.055,2.6,.07);}
 for(let y=f+.55;y<c-.65;y+=.31){for(const x of [-wx/2-1.0,wx/2+1.0])box('dark',x,y,wz,wx-1.7,.055,.07);}
 for(let z=-d+1;z<=d-1;z+=.28)box('dark',sign*(w-1.1),f+1.75,z,.07,2.6,.055);
 for(let y=f+.55;y<c-.65;y+=.31)box('dark',sign*(w-1.1),y,0,.07,.055,(d-1)*2);
 for(let x=-w+.5;x<w;x+=1.0)box('wood',x,c-.08,0,.14,.21,d*2+.3);
 rail(new THREE.Vector3(-w-.35,0,sign*(d+.45)),new THREE.Vector3(w+.35,0,sign*(d+.45)),f+.25);
 rail(new THREE.Vector3(sign*(w+.45),0,-d-.35),new THREE.Vector3(sign*(w+.45),0,d+.35),f+.25);
}
// The two upper galleries are edged in repeated miniature corbels.
for(let x=-w;x<=w;x+=1.0)for(let side of [-1,1])box('teal',x,f-.18,side*(d+.18),.34,.32,.72);
}

// Bracket sets are individually modelled and batched for smooth interaction.
function bracket(x,z,y,angle){const pos=(a,b,h)=>new THREE.Vector3(x+Math.cos(angle)*a-Math.sin(angle)*b,y+h,z+Math.sin(angle)*a+Math.cos(angle)*b);for(let j=0;j<4;j++){const h=j*.16,len=.48+j*.3;const p=pos(0,j*.18,h);box(j%2?'wood':'teal',p.x,p.y,p.z,len,.14,.25,0,-angle,0);for(let sg of [-1,1]){const a=pos(sg*len*.43,j*.18,h+.08);box('red',a.x,a.y,a.z,.14,.16,.3,0,-angle,0);}}const a=pos(0,.1,-.24),b=pos(0,.8,.4);beamBetween('wood',a,b,.14,.2);}
for(const l of levels){for(let x=-l.w;x<=l.w+.1;x+=l.w/2){bracket(x,l.d,l.c-.35,0);bracket(x,-l.d,l.c-.35,Math.PI);}for(let z=-l.d+.2;z<l.d;z+=l.d/2){bracket(l.w,z,l.c-.35,-Math.PI/2);bracket(-l.w,z,l.c-.35,Math.PI/2);}}

// Curved roof surfaces and thousands of raised barrel tiles are true geometry.
const roofSpecs=[{w:10.7,d:8.8,y:6.45,h:2.3,inner:[6.5,4.95]},{w:9.7,d:7.9,y:10.9,h:2.5,inner:[5.75,4.4]},{w:8.6,d:7.1,y:15.05,h:4.0,inner:null}];
function roofY(x,z,r){const p=Math.min(1,Math.max(Math.max(0,Math.abs(x)-r.w*.24)/(r.w*.76),Math.abs(z)/r.d));const corner=Math.pow(Math.abs(x)/r.w*Math.abs(z)/r.d,5);const arch=r.inner?Math.pow(1-p,1.65):(Math.sqrt(Math.max(.04,1-.96*p*p))-.2)/.8;return r.y+r.h*arch+.72*Math.pow(p,8)*(.32+.68*corner);}
function buildRoof(r){
 const deckPositions=[],deckIndices=[];const resolution=70;
 for(let j=0;j<=resolution;j++)for(let i=0;i<=resolution;i++){const x=-r.w+i*r.w*2/resolution,z=-r.d+j*r.d*2/resolution;deckPositions.push(x,roofY(x,z,r)-.055,z);}
 for(let j=0;j<resolution;j++)for(let i=0;i<resolution;i++){const x=-r.w+(i+.5)*r.w*2/resolution,z=-r.d+(j+.5)*r.d*2/resolution;if(r.inner&&Math.abs(x)<r.inner[0]&&Math.abs(z)<r.inner[1])continue;const a=j*(resolution+1)+i;deckIndices.push(a,a+resolution+1,a+1,a+1,a+resolution+1,a+resolution+2);}
 const deckGeo=new THREE.BufferGeometry();deckGeo.setAttribute('position',new THREE.Float32BufferAttribute(deckPositions,3));deckGeo.setIndex(deckIndices);deckGeo.computeVertexNormals();const deck=new THREE.Mesh(deckGeo,mats.roofbase);deck.castShadow=true;deck.receiveShadow=true;building.add(deck);
 const positions=[],uvs=[],normals=[],indices=[];let count=0;
 const nx=Math.ceil(r.w*2/.33),nz=Math.ceil(r.d*2/.48);
 for(let ix=0;ix<nx;ix++)for(let iz=0;iz<nz;iz++){
  const xa=-r.w+ix*r.w*2/nx,za=-r.d+iz*r.d*2/nz,dx=r.w*2/nx,dz=r.d*2/nz;
  if(r.inner&&Math.abs(xa+dx/2)<r.inner[0]&&Math.abs(za+dz/2)<r.inner[1])continue;
  const sideSlope=Math.abs(xa)/r.w>Math.abs(za)/r.d&&Math.abs(xa)>r.w*.4;
  for(let j=0;j<=2;j++)for(let i=0;i<=4;i++){const u=i/4,v=j/2,x=xa+dx*(.006+u*.988),z=za+dz*(.004+v*.992);const arch=.068*Math.sin(Math.PI*(sideSlope?v:u));positions.push(x,roofY(x,z,r)+arch,z);uvs.push((ix+u)/nx*10,(iz+v)/nz*8);}
  for(let j=0;j<2;j++)for(let i=0;i<4;i++){const a=count+j*5+i;indices.push(a,a+5,a+1,a+1,a+5,a+6);}count+=15;
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();
 const m=new THREE.Mesh(g,mats.tile);m.castShadow=true;m.receiveShadow=true;building.add(m);
 // underside, thick eaves, corner ridges, and curled ridge ends.
 for(const sign of [-1,1]){
  let pts=[];for(let i=0;i<=36;i++){const x=-r.w+i*r.w*2/36,z=sign*r.d;pts.push(new THREE.Vector3(x,roofY(x,z,r)-.06,z));}tube(pts,.12,'dark');tube(pts.map(p=>p.clone().add(new THREE.Vector3(0,.11,0))),.065,'gold');
  pts=[];for(let i=0;i<=30;i++){const z=-r.d+i*r.d*2/30,x=sign*r.w;pts.push(new THREE.Vector3(x,roofY(x,z,r)-.06,z));}tube(pts,.12,'dark');
  for(const sg of [-1,1]){pts=[];for(let i=0;i<=22;i++){const p=i/22,x=sg*(r.w*.24+r.w*.76*p),z=sign*r.d*p;pts.push(new THREE.Vector3(x,roofY(x,z,r)+.13,z));}tube(pts,.14,'gold');const x=sg*r.w,z=sign*r.d,y=roofY(x,z,r);tube([new THREE.Vector3(x*.9,y-.12,z*.9),new THREE.Vector3(x,y+.2,z),new THREE.Vector3(x*1.035,y+.75,z*1.035)],.1,'gold');item('sphere','gold',x*1.035,y+.84,z*1.035,.14,.14,.14);}
 }
 const ry=roofY(0,0,r);box('dark',0,ry-.02,0,r.w*.49,.2,.27);tube([new THREE.Vector3(-r.w*.27,ry+.65,0),new THREE.Vector3(-r.w*.23,ry+.2,0),new THREE.Vector3(0,ry+.15,0),new THREE.Vector3(r.w*.23,ry+.2,0),new THREE.Vector3(r.w*.27,ry+.65,0)],.15,'gold');
 for(let i=-5;i<=5;i++){const x=i*.36;box('gold',x,ry+.34,0,.23,.16,.4);}
 // Exposed rafter tails under each eave.
 for(let x=-r.w+.3;x<r.w;x+=.4)for(const sg of [-1,1]){const za=sg*(r.d-.05),zb=sg*(r.d-1.4);beamBetween('wood',new THREE.Vector3(x,roofY(x,za,r)-.3,za),new THREE.Vector3(x,roofY(x,zb,r)-.3,zb),.105,.13);}
}
roofSpecs.forEach(buildRoof);

function textPanel(text,w,h,bg='#242b23',fg='#c9aa65',font=95){const t=texture(1024,(c,s)=>{c.fillStyle=bg;c.fillRect(0,0,s,s);c.strokeStyle='#a68a45';c.lineWidth=8;c.strokeRect(16,16,s-32,s-32);c.fillStyle=fg;c.textAlign='center';c.textBaseline='middle';c.font=`500 ${font}px "Noto Serif TC","Songti TC",serif`;c.fillText(text,s/2,s/2,s-80);});const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,roughness:.8,side:THREE.DoubleSide}));return m;}
for(const sign of [-1,1]){const plaque=textPanel('岳 陽 樓',4.1,1.1,'#24281e','#dfc477',600);plaque.position.set(0,5.95,sign*6.17);if(sign<0)plaque.rotation.y=Math.PI;building.add(plaque);box('dark',0,5.95,sign*6.1,4.3,1.22,.16);}
// A small literature screen, visibly a teaching display rather than an asserted original.
const screen=textPanel('先天下之憂而憂',4.2,1.0,'#4e3025','#d5ba87',420);screen.position.set(0,4.35,-2.2);building.add(screen);box('dark',0,4.2,-2.35,4.5,2.9,.2);
for(let i=-2;i<=2;i++)box('wood',i*1.05,3.06,-2.2,1,.13,.7);

// Trees are kept peripheral, with twig silhouettes and varied leaf clusters.
function tree(x,z,s){const y=.6;const h=5.4*s;cyl('trunk',x,y+h/2,z,.16*s,h,.16*s,world);for(let j=0;j<6;j++){const a=j*2.4+rnd(-.3,.3),p=new THREE.Vector3(x,y+h*.45+j*.22*s,z),b=new THREE.Vector3(x+Math.cos(a)*1.6*s,y+h*.8+rnd(0,1)*s,z+Math.sin(a)*1.6*s);beamBetween('trunk',p,b,.1*s,.1*s,world);for(let k=0;k<12;k++){const px=b.x+rnd(-1.1,1.1)*s,py=b.y+rnd(-.2,1.5)*s,pz=b.z+rnd(-1.1,1.1)*s;item('leaf','tree',px,py,pz,rnd(.45,.95)*s,rnd(.5,1)*s,rnd(.5,1)*s,0,rnd(0,6),0,world);}}}
for(let i=0;i<24;i++){const x=(i%2?-1:1)*rnd(24,47),z=rnd(-12,59);tree(x,z,rnd(.75,1.55));}
// Low shore plants and small waterside reed clusters.
for(let i=0;i<260;i++){const x=rnd(-95,95),z=rnd(-27,-25.6);const y=-.5;const h=rnd(.5,1.6);for(let j=0;j<3;j++)box('tree',x+j*.1,y+h/2,z,.035,h,.035,rnd(-.2,.2),0,rnd(-.2,.2),world);}
commit();

// Atmospheric mountains use rolling continuous silhouettes rather than cones.
const mountains=[];
for(let layer=0;layer<3;layer++){
 const g=new THREE.PlaneGeometry(2800,1,190,1);const pos=g.attributes.position;
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),top=i<191;const h=top?18+Math.sin(x*.004+layer*3)*14+Math.sin(x*.011+layer)*9+Math.cos(x*.027)*3:0;pos.setXYZ(i,x,h,-360-layer*220);}g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:[0x7c9692,0x9ab0a9,0xa9beb4][layer],roughness:1,side:THREE.DoubleSide}));m.position.y=-.9;scene.add(m);mountains.push(m);
}
// A low distant island balances the open horizon.
const islandGeo=new THREE.SphereGeometry(1,48,16);const island=new THREE.Mesh(islandGeo,new THREE.MeshStandardMaterial({color:0x607e67,roughness:1}));island.scale.set(100,10,28);island.position.set(-105,-4,-240);scene.add(island);

// Sky is a full dome: continuous cloud noise, a restrained sun, and night glow.
const skyUniforms={time:{value:0},rain:{value:0},night:{value:0},sunDir:{value:new THREE.Vector3(-.45,.65,.6).normalize()}};
const sky=new THREE.Mesh(new THREE.SphereGeometry(1900,40,22),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:skyUniforms,vertexShader:`varying vec3 vWorld;void main(){vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`
precision highp float;varying vec3 vWorld;uniform float time,rain,night;uniform vec3 sunDir;
float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=noise(p)*a;p=p*2.04+3.2;a*=.5;}return v;}
void main(){vec3 d=normalize(vWorld-cameraPosition);float h=max(d.y,0.);vec3 day=mix(vec3(.76,.84,.81),vec3(.28,.54,.71),pow(h,.55));float sd=max(dot(d,sunDir),0.);day+=vec3(1.,.73,.39)*pow(sd,70.)*.16;day+=vec3(1.,.9,.65)*smoothstep(.99965,.99995,sd)*1.3;
vec3 storm=mix(vec3(.46,.53,.54),vec3(.19,.25,.29),pow(h,.6));vec3 dark=mix(vec3(.10,.17,.23),vec3(.013,.035,.078),pow(h,.65));vec3 col=mix(mix(day,storm,rain),dark,night);
vec3 cp=d/(max(d.y,.07)+.32)*2.7+vec3(time*.006,0.,time*.003);float f=fbm(cp);float cloud=smoothstep(mix(.53,.28,rain),mix(.77,.78,rain),f)*smoothstep(-.025,.13,d.y);vec3 cc=mix(vec3(.97,.96,.89),vec3(.30,.35,.37),rain);cc=mix(cc,vec3(.11,.16,.22),night);col=mix(col,cc,cloud*(.75+.22*rain));float stars=pow(hash(floor(d*1050.)),150.)*smoothstep(.07,.4,d.y);col+=stars*night*.22;gl_FragColor=vec4(col,1.);#include <tonemapping_fragment>
#include <colorspace_fragment>
}`.replace(';#include',';\n#include')}));sky.frustumCulled=false;scene.add(sky);

const normalTex=texture(256,(c,s)=>{const im=c.createImageData(s,s);for(let y=0;y<s;y++)for(let x=0;x<s;x++){const a=Math.sin(x*.13+Math.cos(y*.09)*2)*.5+Math.sin(y*.19+x*.07)*.25;const b=Math.cos(y*.11+Math.sin(x*.12)*2)*.5+Math.cos(x*.17-y*.1)*.25;const i=(y*s+x)*4;im.data[i]=128+a*65;im.data[i+1]=128+b*65;im.data[i+2]=235;im.data[i+3]=255;}c.putImageData(im,0,0);});normalTex.colorSpace=THREE.NoColorSpace;
const waterGeo=new THREE.PlaneGeometry(3000,3000,220,220);const wp=waterGeo.attributes.position;
for(let i=0;i<wp.count;i++){const x=wp.getX(i),y=wp.getY(i);wp.setXY(i,Math.sign(x)*Math.pow(Math.abs(x)/1500,2.1)*1500,Math.sign(y)*Math.pow(Math.abs(y)/1500,2.1)*1500);}
const water=new Water(waterGeo,{textureWidth:512,textureHeight:512,waterNormals:normalTex,sunDirection:sun.position.clone().normalize(),sunColor:0xffedcb,waterColor:0x3d8587,distortionScale:1.8,fog:true});
water.rotation.x=-Math.PI/2;water.position.y=-1;scene.add(water);
water.material.uniforms.wave={value:.04};water.material.uniforms.storm={value:0};water.material.uniforms.clearView={value:1};
water.material.vertexShader=water.material.vertexShader.replace('uniform float time;','uniform float time; uniform float wave;').replace('void main() {','void main() {\n vec3 p=position; p.z+=wave*(sin(p.x*.19+time*1.3)+.5*sin(p.y*.27-time*1.7+p.x*.1)+.25*sin(p.x*.6+p.y*.4-time*2.5));').replaceAll('vec4( position, 1.0 )','vec4( p, 1.0 )');
water.material.fragmentShader=water.material.fragmentShader.replace('void main() {','void main() { if(clearView>0.5 && distance(worldPosition.xz,vec2(15.,-31.))<4.) discard;').replace('uniform float size;','uniform float size; uniform float storm; uniform float clearView;').replace('vec3 outgoingLight = albedo;','float foam=pow(max(0.0,sin(worldPosition.x*.34+time*2.3)*sin(worldPosition.z*.22-time*1.7)),12.0)*storm*.22; vec3 outgoingLight = mix(albedo,vec3(.67,.72,.70),foam);');

// Moon: spatial disc so the water reflection follows the viewing direction.
const moonTex=texture(512,(c,s)=>{c.clearRect(0,0,s,s);const gr=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s*.5);gr.addColorStop(0,'#fffbe1');gr.addColorStop(.84,'#e5e3cd');gr.addColorStop(.96,'#b8bfc4');gr.addColorStop(1,'#b8bfc400');c.fillStyle=gr;c.beginPath();c.arc(s/2,s/2,s*.495,0,Math.PI*2);c.fill();c.globalCompositeOperation='source-atop';for(let i=0;i<90;i++){c.fillStyle=`rgba(74,86,102,${rnd(.025,.14)})`;c.beginPath();c.ellipse(rnd(10,500),rnd(10,500),rnd(4,55),rnd(4,40),rand()*Math.PI,0,Math.PI*2);c.fill();}});
const moon=new THREE.Mesh(new THREE.PlaneGeometry(24,24),new THREE.MeshBasicMaterial({map:moonTex,transparent:true,depthWrite:false,toneMapped:false,opacity:0}));moon.position.set(-100,190,-560);scene.add(moon);
const moonHalo=new THREE.Sprite(new THREE.SpriteMaterial({map:texture(128,(c,s)=>{const gr=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);gr.addColorStop(0,'#d9e6ff55');gr.addColorStop(.2,'#bed3ff18');gr.addColorStop(1,'#a5caff00');c.fillStyle=gr;c.fillRect(0,0,s,s);}),transparent:true,depthWrite:false,toneMapped:false,opacity:0}));moonHalo.position.copy(moon.position);moonHalo.scale.set(90,90,1);scene.add(moonHalo);

// Rain lines are camera-local, with a roof mask and ripples on the water.
const rainCount=9000;const rainPos=new Float32Array(rainCount*6),rainData=[];
for(let i=0;i<rainCount;i++)rainData.push({x:rnd(-90,90),z:rnd(-90,90),y:rnd(0,60),speed:rnd(17,28),len:rnd(.6,1.3)});
const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));
const rainMat=new THREE.LineBasicMaterial({color:0xd1e0e1,transparent:true,opacity:0,depthWrite:false});const rainLines=new THREE.LineSegments(rainGeo,rainMat);rainLines.frustumCulled=false;scene.add(rainLines);
const rippleCount=320,rippleGeo=new THREE.BufferGeometry(),ripplePos=[],rippleAge=[];
for(let i=0;i<rippleCount;i++){const x=rnd(-85,85),z=rnd(-125,-28),a=rand()*6.28;for(let j=0;j<16;j++){const t=j/16*Math.PI*2,u=(j+1)/16*Math.PI*2;ripplePos.push(x+Math.cos(t)*.24,-.95,z+Math.sin(t)*.24,x+Math.cos(u)*.24,-.95,z+Math.sin(u)*.24);}}
rippleGeo.setAttribute('position',new THREE.Float32BufferAttribute(ripplePos,3));const ripples=new THREE.LineSegments(rippleGeo,new THREE.LineBasicMaterial({color:0xc5dcda,transparent:true,opacity:0,depthWrite:false}));scene.add(ripples);

const birds=[];const birdGroup=new THREE.Group();scene.add(birdGroup);
const birdMat=new THREE.MeshStandardMaterial({color:0xe3e6d9,side:THREE.DoubleSide,roughness:.9});
for(let i=0;i<14;i++){const b=new THREE.Group(),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,1.05,.03,-.15,.33,0,.17,0,0,0,-.33,0,.17,-1.05,.03,-.15],3));g.computeVertexNormals();const wing=new THREE.Mesh(g,birdMat);b.add(wing);b.scale.setScalar(rnd(.32,.55));birdGroup.add(b);birds.push({b,wing,phase:rand()*6.28,r:rnd(20,65),h:rnd(3,15),speed:rnd(.03,.09)});}
const boats=[];
function boat(x,z,s){const group=new THREE.Group();const shape=new THREE.Shape();shape.moveTo(-.7,-2.8);shape.quadraticCurveTo(0,-3.8,.7,-2.8);shape.lineTo(.95,1.9);shape.quadraticCurveTo(0,3,-.95,1.9);shape.closePath();const hullGeo=new THREE.ExtrudeGeometry(shape,{depth:.48,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.12,bevelThickness:.1});hullGeo.rotateX(-Math.PI/2);const hull=new THREE.Mesh(hullGeo,mats.dark);group.add(hull);const cab=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.05,2.1,12,1,false,0,Math.PI),mats.wood);cab.rotation.x=Math.PI/2;cab.rotation.z=Math.PI;cab.position.set(0,.4,.5);group.add(cab);group.position.set(x,-.65,z);group.scale.setScalar(s);group.rotation.y=rnd(-.8,.8);scene.add(group);boats.push(group);}
boat(-48,-72,.8);boat(41,-120,.7);boat(-19,-170,.6);

const modeData={sun:{kicker:'01 / 春和景明',caption:'春日 · 水天一色',poem:'春和景明，波瀾不驚。<br>上下天光，一碧萬頃。',text:'晴光映水，遠近澄明。從樓上望向洞庭，感受遷客騷人眼中的開闊與舒暢。',mood:'心曠神怡'},rain:{kicker:'02 / 霪雨霏霏',caption:'陰雨 · 山岳潛形',poem:'陰風怒號，濁浪排空。<br>日星隱耀，山岳潛形。',text:'雨幕遮去遠山，陰風捲起濁浪。這樣的景象，如何觸動失意文人的去國懷鄉與憂讒畏譏？',mood:'感極而悲'},moon:{kicker:'03 / 皓月千里',caption:'月夜 · 水月相映',poem:'長煙一空，皓月千里。<br>浮光躍金，靜影沉璧。',text:'微波使月色碎成躍動金光；水面漸靜，月影如玉沉璧。留意同一輪明月如何呈現動靜之美。',mood:'此樂何極'}};
let mode='sun',weather={rain:0,night:0},brightness=1,frameCount=0,viewTween=null,elapsed=0,labelsOn=false,balconyMode=false;
const initial={position:new THREE.Vector3(35,24,43),target:new THREE.Vector3(0,8.8,0)};
const views={overview:initial,roof:{position:new THREE.Vector3(20,22,24),target:new THREE.Vector3(0,14.8,0)},balcony:{position:new THREE.Vector3(.2,13.3,-4.7),target:new THREE.Vector3(-45,10,-260)},lake:{position:new THREE.Vector3(37,15,-53),target:new THREE.Vector3(0,8.2,0)}};
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),2800);}
function setMode(m){mode=m;const d=modeData[m];document.body.classList.toggle('night',m==='moon');document.body.classList.toggle('rain',m==='rain');for(const el of document.querySelectorAll('[data-mode]')){const on=el.dataset.mode===m;el.classList.toggle('selected',on);el.setAttribute('aria-pressed',on);}$('#poem-kicker').textContent=d.kicker;$('#scene-caption').textContent=d.caption;$('#poem').innerHTML=d.poem;$('#interpretation').textContent=d.text;$('#mood').textContent=d.mood;if(labelsOn)updateHotspotContents();$('#detail').hidden=true;}
for(const b of document.querySelectorAll('[data-mode]'))b.addEventListener('click',()=>setMode(b.dataset.mode));
function goView(v){if(adventure?.active)adventure.walk(false);controls.autoRotate=false;$('#auto').setAttribute('aria-pressed','false');balconyMode=v==='balcony';controls.enableRotate=!balconyMode;controls.enableZoom=!balconyMode;controls.enablePan=!balconyMode;const d=views[v];controls.minDistance=balconyMode?1:7;controls.maxDistance=balconyMode?400:210;viewTween={start:performance.now(),pos:camera.position.clone(),target:controls.target.clone(),toPos:d.position.clone(),toTarget:d.target.clone()};document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>goView(b.dataset.view)));
$('#reset').onclick=()=>goView('overview');$('#auto').onclick=()=>{if(balconyMode){goView('overview');setTimeout(()=>{controls.autoRotate=true;$('#auto').setAttribute('aria-pressed','true');},1300);}else{controls.autoRotate=!controls.autoRotate;$('#auto').setAttribute('aria-pressed',controls.autoRotate);}};
controls.addEventListener('start',()=>{viewTween=null;controls.autoRotate=false;$('#auto').setAttribute('aria-pressed','false');});
$('#fold-poem').onclick=()=>{const folded=$('#poem-panel').classList.toggle('folded');$('#fold-poem').textContent=folded?'+':'−';$('#fold-poem').setAttribute('aria-expanded',!folded);$('#fold-poem').setAttribute('aria-label',folded?'展開原文':'收起原文');};
$('#settings-btn').onclick=()=>$('#settings').showModal();$('#info-btn').onclick=()=>$('#info').showModal();document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).close());
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
$('#quality').onchange=e=>{const high=e.target.value==='high';renderer.setPixelRatio(Math.min(devicePixelRatio,high?2:1.5));sun.shadow.mapSize.set(high?4096:2048,high?4096:2048);sun.shadow.map?.dispose();sun.shadow.map=null;toast(high?'已切換高畫質':'已切換標準畫質');};
$('#brightness').oninput=e=>brightness=Number(e.target.value);
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('此裝置不支援網頁全螢幕，可橫向觀看。');}};

const hotspotDefs=[{pos:new THREE.Vector3(-105,9,-240),name:'遠山',title:()=>mode==='rain'?'山岳潛形':'銜遠山，吞長江',text:()=>mode==='rain'?'山影隱沒於雨霧之中，與晴日清晰的遠景對照，營造昏暗蒼茫的氣氛。':'「銜」「吞」以有力量的動詞寫湖與山川的關係，表現洞庭湖的廣闊氣勢。'},
{pos:new THREE.Vector3(-9,0,-40),name:'湖面',title:()=>mode==='rain'?'陰風怒號，濁浪排空':mode==='moon'?'浮光躍金，靜影沉璧':'波瀾不驚，上下天光',text:()=>mode==='rain'?'風勢推動波浪，水色轉濁、浪峰起伏，呼應陰雨段的險惡景象。':mode==='moon'?'同一月影，在微波中碎成躍動的金光，在平靜水面則如沉入湖中的玉璧。':'「不驚」寫水面平靜；天空與湖水互映，形成水天一色的開闊景象。'},
{pos:new THREE.Vector3(8.1,15.9,5.8),name:'飛檐與盔頂',title:()=>'登樓覽物',text:()=>'環繞樓身，觀察層層飛檐與圍廊，再切換「樓上望湖」，將外觀與登樓視野連起來。外形採現存樓體的辨識特徵，並非北宋原樓復原。'}];
const hotspots=hotspotDefs.map((d,i)=>{const b=document.createElement('button');b.className='hotspot';b.textContent=d.name;b.hidden=true;$('#hotspots').appendChild(b);b.onclick=()=>{$('#detail-tag').textContent='景物與課文';$('#detail-title').textContent=d.title();$('#detail-text').textContent=d.text();$('#detail').hidden=false;};return{...d,el:b};});
function updateHotspotContents(){hotspots[1].el.textContent=mode==='moon'?'水中月影':'湖面';}
$('#annotations').onclick=()=>{labelsOn=!labelsOn;$('#annotations').setAttribute('aria-pressed',labelsOn);$('#annotations').textContent=labelsOn?'隱藏景物解說 ↙':'顯示景物解說 ↗';if(!labelsOn){hotspots.forEach(h=>h.el.hidden=true);$('#detail').hidden=true;}updateHotspotContents();};
$('#detail-close').onclick=()=>$('#detail').hidden=true;
const proj=new THREE.Vector3();function updateHotspots(){for(const h of hotspots){proj.copy(h.pos).project(camera);const x=(proj.x*.5+.5)*innerWidth,y=(-proj.y*.5+.5)*innerHeight;h.el.hidden=!labelsOn||adventure.active||camera.position.distanceTo(h.pos)>3.6||proj.z>1||proj.z< -1||x<15||x>innerWidth-15||y<185||y>innerHeight-230;if(!h.el.hidden){h.el.style.left=x+'px';h.el.style.top=y+'px';}}}

// Synthesised wind and water; no autoplay or external sound downloads.
let audio=null,soundOn=false;
function initAudio(){const C=window.AudioContext||window.webkitAudioContext;if(!C){toast('此瀏覽器不支援環境音。');return null;}const ctx=new C(),buffer=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate),data=buffer.getChannelData(0);let last=0;for(let i=0;i<data.length;i++){last=(last+(Math.random()*2-1)*.04)/1.025;data[i]=last*4;}const source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=600;const gain=ctx.createGain();gain.gain.value=0;source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);source.start();return{ctx,gain,filter};}
$('#sound').onclick=async()=>{audio??=initAudio();if(!audio)return;await audio.ctx.resume();soundOn=!soundOn;$('#sound').textContent=soundOn?'關閉':'開啟';$('#sound').setAttribute('aria-pressed',soundOn);};
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const daylight=new THREE.Color(),targetColor=new THREE.Color(),waterColor=water.material.uniforms.waterColor.value;
function blendColor(out,a,b,c,r,n){out.set(a).lerp(targetColor.set(b),r).lerp(targetColor.set(c),n);}
function collisionGuard(){if(balconyMode||adventure.active)return;camera.position.y=Math.max(camera.position.y,.9);const x=Math.abs(camera.position.x),z=Math.abs(camera.position.z);if(x<11.6&&z<9.7&&camera.position.y<20.4){const ratio=Math.max(x/12,z/10,.01);camera.position.x/=ratio;camera.position.z/=ratio;}controls.target.y=clamp(controls.target.y,1,22);}
function animate(now){requestAnimationFrame(animate);const dt=Math.min(.05,(now-(animate.last??now))/1000);animate.last=now;elapsed+=dt;frameCount++;
 const ease=1-Math.exp(-dt*1.6);weather.rain+=(Number(mode==='rain')-weather.rain)*ease;weather.night+=(Number(mode==='moon')-weather.night)*ease;
 const r=weather.rain,n=weather.night,t=elapsed;
 skyUniforms.time.value=t;skyUniforms.rain.value=r;skyUniforms.night.value=n;
 blendColor(scene.fog.color,0xbcced0,0x7c9094,0x23394b,r,n);scene.fog.density=.00165+r*.0055+n*.0001;
 blendColor(hemi.color,0xd6e9ee,0xaebbc3,0x92b5dc,r,n);blendColor(hemi.groundColor,0x89785e,0x59625a,0x455260,r,n);hemi.intensity=2.15-r*.35-n*.9;
 blendColor(sun.color,0xffe7bb,0xc5d1d5,0xc5def5,r,n);sun.intensity=3.1-r*2.55-n*2.35;fill.intensity=.55+r*.25+n*.08;
 sun.position.lerpVectors(new THREE.Vector3(-40,65,45),new THREE.Vector3(-25,45,-55),n);
 renderer.toneMappingExposure=(1.06-r*.02+n*.12)*brightness;
 blendColor(waterColor,0x3c7d79,0x536666,0x122e42,r,n);const u=water.material.uniforms;u.time.value=t*(.65+r*.8);u.distortionScale.value=1.5+r*5.5-n*1.1+(n*(Math.sin(t*.23)*.5+.5)*1.2);u.size.value=1.7+r*1.2;u.wave.value=.025+r*1.35+n*.012;u.storm.value=r;u.sunDirection.value.lerpVectors(new THREE.Vector3(-.45,.65,.6).normalize(),moon.position.clone().normalize(),n);blendColor(u.sunColor.value,0xffedce,0xadbabc,0xc8d7e6,r,n);
 mats.tile.roughness=.42-r*.22;mats.wood.roughness=.73-r*.32;mats.stone.roughness=.96-r*.55;mats.floor.roughness=.93-r*.65;
 moon.material.opacity=n;moonHalo.material.opacity=n;moon.lookAt(camera.position);birdGroup.visible=r<.65&&n<.65;
 birds.forEach((v,i)=>{const a=t*v.speed+v.phase;v.b.position.set(Math.cos(a)*v.r, v.h+Math.sin(a*2)*1.5,-64+Math.sin(a)*v.r*.5);v.b.rotation.y=-a;v.wing.scale.y=1+Math.sin(t*3.5+v.phase)*.8;v.wing.rotation.z=Math.sin(t*4+v.phase)*.1;});
 boats.forEach((b,i)=>{b.rotation.z=Math.sin(t*(.8+r)+i)*(.012+r*.06);b.position.y=-.65+Math.sin(t*.9+i)*(.02+r*.15);});
 rainMat.opacity=r*.32;rainLines.visible=r>.01;ripples.material.opacity=r*.15;
 if(r>.01){const cx=camera.position.x,cz=camera.position.z;for(let i=0;i<rainCount;i++){const d=rainData[i],yy=((d.y-t*d.speed)%60+60)%60,x=d.x+cx+yy*.18,z=d.z+cz;let top=-Infinity;if(Math.abs(x)<11&&Math.abs(z)<9)top=20;const show=yy>top||top<0;const o=i*6;rainPos[o]=x;rainPos[o+1]=show?yy:-8;rainPos[o+2]=z;rainPos[o+3]=x+.12;rainPos[o+4]=show?yy+d.len:-8;rainPos[o+5]=z;}rainGeo.attributes.position.needsUpdate=true;}
 if(viewTween&&!adventure.active){const k=clamp((now-viewTween.start)/1400,0,1),e=k*k*(3-2*k);camera.position.lerpVectors(viewTween.pos,viewTween.toPos,e);controls.target.lerpVectors(viewTween.target,viewTween.toTarget,e);if(k===1)viewTween=null;}
 if(!adventure.active)controls.update();collisionGuard();adventure.update(dt,t);updateHotspots();
 if(audio){const vol=Number($('#volume').value);audio.gain.gain.setTargetAtTime(soundOn?vol*(.18+r*.55+n*.02):0,audio.ctx.currentTime,.2);audio.filter.frequency.setTargetAtTime(450+r*1900,audio.ctx.currentTime,.3);}
 renderer.render(scene,camera);
 if(frameCount===3){$('#loading').classList.add('hide');setTimeout(()=>$('#loading').remove(),1000);}
}
const adventure=createExplore({scene,camera,controls,setMode,getMode:()=>mode,toast,mats,water,textPanel});
window.__yueyang={adventure,scene,camera,controls,renderer,setMode,goView,get mode(){return mode;},get weather(){return weather;},building};
window.addEventListener('error',e=>{console.error('Scene error',e.error);if($('#loading')&&!$('#loading').classList.contains('hide'))$('#loading span').textContent='載入遇到問題，請重新整理。';});
requestAnimationFrame(animate);
