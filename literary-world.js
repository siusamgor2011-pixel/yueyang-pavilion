import { detailTexture, makeTiger } from './realism.js';
import * as T from './three.module.js';
// Original procedural teaching models. Figures and spatial arrangement are interpretations.
export function buildLiteraryWorld({obj,mesh,bar,mats,getMode,textPanel}){
 const weave=detailTexture('linen'),skinMap=detailTexture('skin');const cloth=c=>new T.MeshStandardMaterial({color:c,roughness:.92,side:T.DoubleSide,map:weave,bumpMap:weave,bumpScale:.002});
 const skin=new T.MeshStandardMaterial({map:skinMap,bumpMap:skinMap,bumpScale:.0015,color:0xe4cbb2,roughness:.8}),ink=cloth(0x28241e),paper=cloth(0xd5c5a1),green=cloth(0x536b38);
 function ell(g,mat,p,s){const m=mesh(g,new T.SphereGeometry(1,40,28),mat,...p);m.scale.set(...s);return m;}
 function curve(g,points,r,mat){const c=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(g,new T.TubeGeometry(c,32,r,8,false),mat,0,0,0);}
 function garment(g,mat,rings){const shape=new T.CatmullRomCurve3(rings.map(r=>new T.Vector3(r[0],r[1],r[2]))),centers=new T.CatmullRomCurve3(rings.map(r=>new T.Vector3(r[3]||0,r[4]||0,0)));rings=shape.getPoints((rings.length-1)*8).map((v,i,a)=>{const c=centers.getPoint(i/(a.length-1));return [v.x,v.y,v.z,c.x,c.y];});const p=[],ix=[],seg=64;for(let k=0;k<rings.length;k++){const [y,rx,rz,cx=0,cz=0]=rings[k];for(let j=0;j<=seg;j++){const a=j/seg*Math.PI*2,fold=(y>1.6?0:.005*Math.cos(a*12+.3*y)+.003*Math.sin(a*19-y));p.push(cx+(rx+fold)*Math.cos(a),y,cz+(rz+fold)*Math.sin(a));}}for(let k=0;k<rings.length-1;k++)for(let j=0;j<seg;j++){const a=k*(seg+1)+j;ix.push(a,a+1,a+seg+1,a+1,a+seg+2,a+seg+1);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setIndex(ix);geo.computeVertexNormals();return mesh(g,geo,mat,0,0,0);}
 function person(g,color=0x596359,poet=false){const robe=cloth(color);const figure=new T.Group();g.add(figure);
 ell(figure,ink,[-.12,.065,.05],[.095,.065,.18]);ell(figure,ink,[.12,.065,.09],[.095,.065,.18]);
 garment(figure,robe,[[.12,.31,.19],[.25,.30,.18],[.55,.26,.16],[.88,.22,.15],[1.04,.19,.14],[1.25,.23,.135],[1.36,.22,.12],[1.40,.09,.085]]);
 garment(figure,cloth(0x393d30),[[.94,.222,.159],[.985,.221,.157]]);
 // Draped sleeves follow bent elbows rather than rigid cylinders.
 for(const sign of [-1,1]){const sleeve=garment(figure,robe,[[.85,.09,.12,sign*.20,.20],[.89,.13,.13,sign*.28,.15],[1.02,.15,.15,sign*.34,.08],[1.20,.13,.13,sign*.30,0],[1.33,.10,.10,sign*.21,0],[1.36,.075,.08,sign*.17,0]]);ell(figure,skin,[sign*.18,.99,.29],[.065,.035,.10]);for(let i=0;i<4;i++)curve(figure,[[sign*(.13+i*.024),.99,.30],[sign*(.13+i*.024),.985,.36]],.009,skin);}
 curve(figure,[[-.07,1.4,.075],[.16,1.17,.15],[.15,1.02,.16]],.014,paper);curve(figure,[[.07,1.4,.08],[-.08,1.24,.15]],.014,paper);
 ell(figure,skin,[0,1.42,0],[.06,.08,.06]);const head=ell(figure,skin,[0,1.57,0],[.098,.145,.088]);
 // Small eye sockets, lids, nose bridge, lips and ears at adult proportions.
 for(const sign of [-1,1]){ell(figure,skin,[sign*.102,1.57,.005],[.021,.04,.022]);ell(figure,cloth(0xb5a48c),[sign*.039,1.595,.080],[.023,.008,.006]);ell(figure,ink,[sign*.039,1.595,.086],[.005,.006,.003]);curve(figure,[[sign*.016,1.625,.076],[sign*.042,1.628,.084],[sign*.068,1.62,.071]],.004,ink);}
 ell(figure,skin,[0,1.565,.092],[.012,.035,.019]);ell(figure,skin,[0,1.543,.107],[.019,.012,.013]);curve(figure,[[-.026,1.516,.084],[0,1.519,.091],[.026,1.516,.084]],.0035,cloth(0x725447));
 ell(figure,ink,[0,1.675,-.014],[.108,.07,.09]);if(poet){ell(figure,ink,[0,1.75,-.01],[.05,.045,.05]);for(let i=-3;i<=3;i++)curve(figure,[[i*.008,1.50,.075],[i*.006,1.44,.08],[i*.003,1.41,.05]],.003,ink);}else{garment(figure,ink,[[1.67,.11,.10],[1.73,.105,.095],[1.78,.07,.07]]);}
 for(const sign of [-1,1]){curve(figure,[[sign*.019,1.603,.079],[sign*.04,1.606,.085],[sign*.060,1.600,.074]],.0025,skin);curve(figure,[[sign*.02,1.584,.079],[sign*.04,1.582,.083],[sign*.06,1.586,.073]],.0015,skin);ell(figure,skin,[sign*.104,1.57,.008],[.012,.027,.014]);ell(figure,ink,[sign*.011,1.536,.109],[.004,.002,.002]);}const scroll=mesh(figure,new T.CylinderGeometry(.028,.028,.34,16),paper,0,1.0,.34);scroll.rotation.z=Math.PI/2;
 return figure;}
 const traveler=obj('traveler','all','遷客 · 失意的官員',[-17,.45,-7],'遷客騷人，多會於此','遷客指被貶謫、流放的官吏。角色為教學虛構，並非范仲淹本人。',g=>person(g,0x5b6252));
 const poet=obj('poet','all','騷人 · 登樓的詩人',[17,.45,-5],'覽物之情，得無異乎？','騷人泛指詩人、文人。角色及台詞為教學推演，並非原文中的具名人物。',g=>person(g,0x766551,true));
 traveler.dialogue=()=>getMode()==='rain'?['雨下個不停，連遠山也看不清了。舟船受損，商旅停行；再聽風聲與虎猿的聲音，眼前處處蕭條，我不禁想起自己被貶遠離京城的遭遇。','這裏的「國」是甚麼？','國指國都、京城。']:getMode()==='sun'?['春光明亮，水天一色。看著沙鷗和游魚，我的心胸也開闊起來；官場上的得寵與受辱，彷彿暫時都放下了。','你的煩惱消失了嗎？','這是一時的忘懷。']:['雲霧散盡，月色照著湖面；漁人彼此唱答，我迎風持杯，喜悅難以言盡。此刻確有「寵辱皆忘」之感。','這就是古仁人之心嗎？','還不能等同。'];
 traveler.topics=()=>getMode()==='rain'?[
 ['你為何「去國懷鄉」？','「去國」是離開京城，不是離開祖國。我身為被貶的官員，遠離原來的政治生活，又思念家鄉；眼前昏暗的風雨景象，更觸動這份失落與鄉愁。'],
 ['「憂讒畏譏」又在怕甚麼？','我擔心別人進讒言、說壞話，也害怕受到譏評。這不只是怕下雨，而是個人的仕途、名聲與得失仍壓在心上。'],
 ['景物怎樣使你「感極而悲」？','陰風濁浪、日星隱耀、山岳潛形，使視野昏暗；商旅停行與舟具毀壞又顯出險惡，虎嘯猿啼增添悲涼。滿目蕭條與我的失意互相觸發，感傷便到了極點。'],
 ['古仁人也這樣憂嗎？','古仁人也有憂慮，但著眼於君與民、天下人的處境，不把悲喜繫於自己的升沉。「不以物喜，不以己悲」並非沒有感情，而是超越一己得失。']
 ]:getMode()==='sun'?[
 ['「心曠神怡」從何而來？','明亮的春光、平靜的湖面、水天相映，以及沙鷗、游魚、茂盛香草，讓我感到開闊、舒暢。課文用明麗而有生機的樂景引出喜情。'],
 ['「寵辱皆忘」是甚麼意思？','「寵」是得寵，「辱」是受辱。美景使我暫時把仕途上的榮辱放下；不是官職真的恢復了，也不是從此沒有煩惱。'],
 ['為何仍不同於古仁人？','我的心情仍隨外物而變：晴景引喜，雨景引悲。古仁人不因景物變化或個人際遇而悲喜，憂樂的重心在天下人。']
 ]:[
 ['月夜使你有甚麼感受？','長煙散盡，皓月映湖，月影有動有靜，漁歌此唱彼和。我迎風持酒，感到喜洋洋，這是第四段樂景引出的喜情。'],
 ['和陰雨時的你有何不同？','陰雨喚起我離京思鄉、憂讒畏譏的悲；月夜美景讓我暫忘寵辱。這兩種反應都仍受景物與個人際遇牽動，正是「覽物之情，得無異乎」的具體展開。'],
 ['你會如何理解「先憂後樂」？','不能只以自己是否舒暢作標準。古仁人不論在朝或在野，仍關心君民；先為天下人的困難擔憂、籌謀，待天下人安樂後才享樂。這才超越了我的一己悲喜。']
 ];
 poet.dialogue=()=>getMode()==='moon'?['你看，微波上的月色如金光跳動，水靜時又像一輪沉璧。','湖裏真的有金和玉嗎？','沒有。金與璧都是月影的比喻。聽漁人互答，這依然是第四段的樂景。']:getMode()==='rain'?['山影隱沒，遠處虎猿的聲音更添悲涼。','這些景物有甚麼作用？','陰暗景色與悲切聲音共同襯托遷客騷人的感傷，與晴日樂景對照。']:['沙鷗有飛有歇，魚兒游動，香草茂盛，都是春日生機。','「翔集」是甚麼意思？','翔是飛翔，集是鳥停下棲息。不是全部沙鷗一直在飛。'];
 obj('inscriptions','all','唐賢今人詩賦',[-17,.45,10],'刻唐賢、今人詩賦於其上','樓上刻有前代與當代文人的詩賦。此處刻板為教學示意，不冒充已考證的北宋原刻內容。',g=>{mesh(g,new T.BoxGeometry(2.2,1.6,.16),mats.dark,0,1,0);for(const x of [-.85,.85])mesh(g,new T.BoxGeometry(.12,1.4,.2),mats.wood,x,.7,0);if(textPanel){['唐賢今人詩賦','刻於岳陽樓上','教學示意刻板'].forEach((t,i)=>{const p=textPanel(t,1.9,.30,'#393128','#d7c59c',170);p.position.set(0,1.48-i*.40,.091);g.add(p);});}});
 const merchant=obj('merchant','rain','商旅與停航貨物',[-26,.45,0],'商旅不行','商旅因惡劣天氣而不能前行，凸顯風浪對人的威脅。貨包、位置與人物為教學配置。',g=>{person(g,0x75634f);for(let i=0;i<3;i++){mesh(g,new T.BoxGeometry(.6,.5,.5),mats.wood,.9+(i%2)*.7,.25,Math.floor(i/2)*.7);for(const z of [-.18,.18])bar(g,[.61+(i%2)*.7,.51,z+Math.floor(i/2)*.7],[1.19+(i%2)*.7,.51,z+Math.floor(i/2)*.7],.016,ink);}});
 obj('gull','sun','沙鷗 · 翔與集',[-24,.45,-20],'沙鷗翔集','此處有棲息的沙鷗，湖上另有飛翔的沙鷗。「翔集」把動與靜合寫。',g=>{for(let i=0;i<3;i++){const b=new T.Group();b.position.set(i*.75,0,(i%2)*.5);g.add(b);ell(b,mats.stone,[0,.27,0],[.16,.18,.32]);ell(b,paper,[0,.49,-.17],[.12,.12,.13]);const beak=mesh(b,new T.ConeGeometry(.045,.18,10),cloth(0xbd9853),0,.48,-.33);beak.rotation.x=-Math.PI/2;for(const x of [-.08,.08]){bar(b,[x,0,0],[x,.17,0],.012,ink);ell(b,ink,[x,.51,-.24],[.012,.012,.01]);}}});
 obj('islet','sun','汀洲與蘭草',[-33,.45,-20],'岸芷汀蘭，郁郁青青','芷與蘭是香草意象；汀指水邊小洲。此處用低矮洲石與蘭草群示意，並非精確地形或植物鑑定。',g=>{ell(g,mats.stone,[0,0,0],[1.6,.22,1]);for(let i=0;i<36;i++){const a=i*2.4;curve(g,[[Math.cos(a)*.8,.1,Math.sin(a)*.6],[Math.cos(a)*1,.5,Math.sin(a)*.7],[Math.cos(a)*1.2,.8,Math.sin(a)*.9]],.018,green);}});
 // Forest animals remain on the forest edge; they do not threaten or chase the player.
 obj('tiger','rain','林間虎影',[-33,.45,15],'虎嘯猿啼','虎嘯與猿啼是第三段的聽覺描寫，增添悲涼氣氛。可見動物是教學示意，不代表從岳陽樓必能看見牠們。',g=>makeTiger(g,{mesh,ell,curve}));
 obj('ape','rain','樹旁猿影',[31,.45,14],'虎嘯猿啼','猿的啼聲與虎嘯、風聲合寫聽覺之悲。這是場景示意，不把猛獸放在樓內，也不宣稱精確物種。',g=>{const fur=cloth(0x4a4539);ell(g,fur,[0,.65,0],[.24,.39,.19]);ell(g,fur,[0,1.05,0],[.18,.19,.17]);ell(g,skin,[0,1.03,-.13],[.13,.12,.07]);for(const x of [-1,1]){curve(g,[[x*.20,.90,0],[x*.37,.57,-.05],[x*.40,.17,-.11]],.07,fur);curve(g,[[x*.13,.42,0],[x*.21,.2,-.1],[x*.21,.08,-.20]],.09,fur);}bar(g,[.6,0,.2],[.6,2.8,.2],.12,mats.wood);});
 obj('letter','all','修樓記與囑文書卷',[17,.45,12],'乃重修岳陽樓，增其舊制；屬予作文以記之','慶曆四年滕子京謫守巴陵郡，翌年政通人和、百廢具興而重修岳陽樓，再請范仲淹作記。書卷是敘事提示，不是歷史原件。',g=>{mesh(g,new T.BoxGeometry(1.8,.10,1.1),mats.wood,0,.8,0);for(const x of [-.7,.7])for(const z of [-.4,.4])mesh(g,new T.BoxGeometry(.1,.8,.1),mats.dark,x,.4,z);mesh(g,new T.BoxGeometry(.7,.01,.6),paper,0,.86,0);for(const z of [-.3,.3]){const m=mesh(g,new T.CylinderGeometry(.035,.035,.8,14),mats.dark,0,.89,z);m.rotation.z=Math.PI/2;}});
 return {traveler,poet,merchant,person};
}
