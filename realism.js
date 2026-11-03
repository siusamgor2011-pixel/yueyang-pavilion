import * as T from './three.module.js';
export function detailTexture(kind,size=512){const data=new Uint8Array(size*size*4);let seed=7163;const random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};for(let y=0;y<size;y++)for(let x=0;x<size;x++){const u=x/size,v=y/size,n=random()-.5;let c;if(kind==='fur'){const pale=Math.max(0,1-Math.abs(v-.66)*7);const stripe=Math.sin(u*73+Math.sin(v*13)*2.5+Math.sin(v*37+u*17)*.5);const edge=.72+.18*Math.sin(u*11);const black=stripe>edge&&v>.13&&v<.89;const hair=Math.sin(y*2.4+x*.13)*5+n*17;c=black?[37+hair,31+hair,24+hair]:[175+pale*47+hair,111+pale*92+hair,51+pale*135+hair];}else if(kind==='linen'){const grain=(x%3===0?-10:0)+(y%3===0?-8:0)+n*16;c=[195+grain,192+grain,180+grain];}else if(kind==='skin'){const n2=n*11+Math.sin(u*25)*2; c=[205+n2,165+n2*.8,137+n2*.7];}else{const n2=n*25+Math.sin(x*.5+y*.1)*8;c=[100+n2,105+n2,94+n2];}const i=(y*size+x)*4;data[i]=c[0];data[i+1]=c[1];data[i+2]=c[2];data[i+3]=255;}const t=new T.DataTexture(data,size,size,T.RGBAFormat);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.needsUpdate=true;return t;}
export function makeTiger(g,{mesh,ell,curve}){
 const furMap=detailTexture('fur',1024);const fur=new T.MeshStandardMaterial({map:furMap,bumpMap:furMap,bumpScale:.007,roughness:.94,color:0xffe2b9});
 const light=new T.MeshStandardMaterial({color:0xd9d1b7,roughness:1,map:detailTexture('linen',128)}),dark=new T.MeshStandardMaterial({color:0x211e18,roughness:.7}),pink=new T.MeshStandardMaterial({color:0x604a40,roughness:.65});
 const eye=new T.MeshStandardMaterial({color:0xb99b48,roughness:.25}),black=new T.MeshStandardMaterial({color:0x11120d,roughness:.17});
 ell(g,fur,[0,.90,.15],[.37,.43,.92]);ell(g,fur,[0,1.03,-.53],[.34,.42,.40]);
 for(const x of [-.23,.23])for(const z of [-.52,.70]){ell(g,fur,[x,.62,z],[.14,.35,.20]);ell(g,fur,[x,.29,z-.06],[.105,.29,.11]);ell(g,light,[x,.09,z-.13],[.14,.10,.21]);for(let i=-1;i<=1;i++){ell(g,fur,[x+i*.064,.08,z-.27],[.044,.055,.075]);}}
 ell(g,fur,[0,1.12,-.88],[.29,.28,.28]);ell(g,light,[0,.98,-.96],[.25,.15,.23]);
 for(const s of [-1,1]){ell(g,dark,[s*.205,1.34,-.78],[.09,.11,.055]);ell(g,fur,[s*.205,1.355,-.79],[.07,.085,.045]);ell(g,light,[s*.205,1.36,-.828],[.04,.052,.012]);
 ell(g,dark,[s*.135,1.18,-1.085],[.055,.030,.012]);ell(g,eye,[s*.137,1.181,-1.104],[.030,.015,.009]);ell(g,black,[s*.137,1.182,-1.116],[.008,.013,.004]);ell(g,light,[s*.146,1.189,-1.12],[.005,.005,.003]);
 curve(g,[[s*.065,1.205,-1.09],[s*.14,1.219,-1.10],[s*.205,1.20,-1.067]],.012,fur);
 ell(g,light,[s*.085,1.055,-1.15],[.105,.065,.09]);for(let i=0;i<7;i++){const yy=1.04+(i%3)*.024,xx=s*(.06+Math.floor(i/3)*.04);ell(g,dark,[xx,yy,-1.248],[.006,.006,.003]);curve(g,[[xx,yy,-1.247],[s*.23,yy+.015,-1.29],[s*(.34+i*.016),yy+.03-i*.008,-1.22]],.0009,light);}
 for(let i=0;i<3;i++)curve(g,[[s*.17,1.07+i*.07,-1.10],[s*.24,1.08+i*.07,-1.03],[s*.27,1.1+i*.07,-.94]],.003,dark);
 }
 // Broad triangular feline nose, nostrils, philtrum and lower jaw.
 const ng=new T.BufferGeometry();ng.setAttribute('position',new T.Float32BufferAttribute([-.07,1.12,-1.24,.07,1.12,-1.24,0,1.065,-1.28,-.07,1.12,-1.24,0,1.14,-1.21,.07,1.12,-1.24],3));ng.computeVertexNormals();mesh(g,ng,pink,0,0,0);
 for(const x of [-.045,.045])ell(g,dark,[x,1.10,-1.25],[.015,.009,.006]);
 curve(g,[[0,1.065,-1.279],[0,1.025,-1.27]],.005,dark);curve(g,[[-.15,1.005,-1.15],[-.07,1.015,-1.245],[0,1.025,-1.27],[.07,1.015,-1.245],[.15,1.005,-1.15]],.006,dark);
 ell(g,light,[0,.94,-1.10],[.13,.035,.10]);for(let i=0;i<3;i++)curve(g,[[-.10,1.31-i*.04,-1.08],[0,1.33-i*.04,-1.12],[.10,1.31-i*.04,-1.08]],.003,dark);
 curve(g,[[0,1.0,.95],[.15,.85,1.35],[.35,.63,1.68],[.46,.74,1.91]],.055,fur);
 g.userData.faceFeatures=['eyes','pupils','ears','nose','nostrils','muzzle','mouth','whiskers'];
}
