import * as T from './vendor/three.module.js';
import {mesh,ell,box,material} from './models.js?v=9';
export const STYLES={
 Maya:{title:'Coastal pro',suit:0xe4e9e9,secondary:0x203444,cut:'race',height:1,shoulder:.205},
 Kai:{title:'Night endurance',suit:0x192938,secondary:0x48516e,cut:'endurance',height:1.045,shoulder:.235},
 Sofia:{title:'Street leather',suit:0x9b342c,secondary:0xebe0cf,cut:'leather',height:.985,shoulder:.205},
 Anjan:{title:'Apex club',suit:0x224d77,secondary:0xe2bb5e,cut:'bomber',height:1.025,shoulder:.23},
 Riya:{title:'Tech navigator',suit:0x667d73,secondary:0xcca7c7,cut:'tech',height:.96,shoulder:.2},
 Jaggu:{title:'Rally veteran',suit:0xb7a98f,secondary:0x314637,cut:'rally',height:1.055,shoulder:.25}
};
function fabric(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#dededb';x.fillRect(0,0,128,128);for(let i=0;i<128;i+=2){x.fillStyle=i%4?'#ffffff14':'#00000012';x.fillRect(i,0,1,128);x.fillRect(0,i,128,1);}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(3,3);t.colorSpace=T.SRGBColorSpace;return t;}
function complexion(d){
 const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#faf6f2';x.fillRect(0,0,256,256);let seed=[...d.name].reduce((n,s)=>n+s.charCodeAt(0),0);const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<1800;i++){const a=random()*256,b=random()*256;x.fillStyle=i%3?'#ffffff12':'#7d4c3510';x.fillRect(a,b,1,1);}
 for(const u of[0,256]){const g=x.createRadialGradient(u,115,1,u,115,30);g.addColorStop(0,'#bc675d15');g.addColorStop(1,'#bc675d00');x.fillStyle=g;x.fillRect(u-30,85,60,60);}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;
}
function tailored(rings,mat,parent){
 const verts=[],uv=[],idx=[],n=40;
 rings.forEach(([y,w,front,back],k)=>{for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,c=Math.cos(a);verts.push(Math.sin(a)*w,y,c*(c>0?front:back));uv.push(i/n,k/(rings.length-1));}});
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+n+1;idx.push(a,a+1,b,b,a+1,b+1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const norms=g.attributes.normal;for(let k=0;k<rings.length;k++){const a=k*(n+1),b=a+n,avg=new T.Vector3().fromBufferAttribute(norms,a).add(new T.Vector3().fromBufferAttribute(norms,b)).normalize();norms.setXYZ(a,avg.x,avg.y,avg.z);norms.setXYZ(b,avg.x,avg.y,avg.z);}return mesh(g,mat,parent);
}
export function createCharacter(d,options={}){
 const style=STYLES[d.name],female=d.gender==='female',root=new T.Group();root.name='Driver_'+d.name;
 const skin=new T.MeshStandardMaterial({color:d.skin,roughness:.72,metalness:0}),hair=material(d.hair,.88,0),suit=new T.MeshStandardMaterial({color:style.suit,map:fabric(),roughness:style.cut==='leather'?.4:.82}),accent=material(d.color,.55,0),trim=material(style.secondary,.6,0),dark=material(0x131b23,.74,0),metal=material(0xb6c2c7,.3,.68),lip=material(female?0x985346:0x77503e,.82,0);
 const v=(x,y,z=0)=>new T.Vector3(x,y,z);
 function tube(points,r,mat,parent=root){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>v(...p))),16,r,6,false),mat,parent);}
 function limb(a,b,rA,rB,mat,parent=root){const m=a.clone().add(b).multiplyScalar(.5),dir=b.clone().sub(a);const o=mesh(new T.CylinderGeometry(rB,rA,dir.length(),20,2),mat,parent,m.x,m.y,m.z);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());ell(rA,rA,rA,mat,parent,a.x,a.y,a.z);ell(rB,rB,rB,mat,parent,b.x,b.y,b.z);return o;}
 const facial={Maya:[.95,.013,.026],Kai:[.99,.015,.031],Sofia:[.93,.012,.028],Anjan:[1.04,.015,.032],Riya:[.94,.013,.025],Jaggu:[1.11,.017,.035]}[d.name];
 const faceSkin=skin.clone();faceSkin.map=complexion(d);suit.bumpMap=suit.map;suit.bumpScale=.0012;
 const w=style.shoulder,waist=female?.148:.172;
 tailored([[1,.15,.085,.075],[1.05,.17,.1,.08],[1.15,waist,.092,.09],[1.33,w*.87,.115,.105],[1.43,w,.105,.095],[1.49,w*.84,.075,.07],[1.53,.069,.06,.054]],suit,root);
 box(.014,.35,.009,metal,root,0,1.28,.117);box(.019,.019,.012,metal,root,0,1.45,.12);
 const badge=document.createElement('canvas');badge.width=256;badge.height=100;const x=badge.getContext('2d');x.fillStyle='#17232b';x.fillRect(0,0,256,100);x.fillStyle=d.color;x.font='bold 34px Arial';x.fillText(d.name.toUpperCase(),15,44);x.fillStyle='#e3e7e7';x.font='18px Arial';x.fillText('NR / '+d.call,15,78);const badgeTexture=new T.CanvasTexture(badge);badgeTexture.colorSpace=T.SRGBColorSpace;
 mesh(new T.PlaneGeometry(.13,.05),new T.MeshBasicMaterial({map:badgeTexture}),root,-.105,1.38,.111);
 for(const s of[-1,1])tube([[s*(w-.03),1.43,.072],[s*.155,1.3,.107],[s*(waist-.018),1.15,.093]],.004,accent);
 box(waist*1.9,.032,.196,dark,root,0,1.04);box(.04,.027,.007,metal,root,0,1.04,.103);
 if(style.cut==='race'){
  for(const s of[-1,1]){box(.045,.34,.009,dark,root,s*.105,1.27,.113);box(.008,.33,.008,accent,root,s*.115,1.28,.119);}
  box(.28,.019,.01,accent,root,0,1.19,.126);
 }else if(style.cut==='leather'){
  const tee=mesh(new T.ConeGeometry(.105,.25,3),trim,root,0,1.41,.119);tee.rotation.z=Math.PI;tee.scale.z=.1;
  for(const s of[-1,1]){const lapel=box(.053,.19,.012,dark,root,s*.08,1.42,.117);lapel.rotation.z=-s*.35;box(.095,.008,.01,metal,root,s*.1,1.18,.101);}
 }else if(style.cut==='bomber'){
  for(let i=0;i<6;i++){box(.13,.009,.009,trim,root,.1,1.24+i*.022,.118);box(.055,.008,.008,dark,root,-.14,1.17+i*.015,.099);}
  box(.35,.047,.19,dark,root,0,1.07);
 }else if(style.cut==='tech'){
  const harness=box(.037,.41,.012,dark,root,.035,1.32,.126);harness.rotation.z=-.53;box(.044,.036,.019,metal,root,.09,1.29,.14);box(.086,.087,.022,trim,root,.09,1.16,.105);
 }else if(style.cut==='rally'){
  for(const s of[-1,1]){box(.088,.092,.026,trim,root,s*.11,1.31,.115);box(.08,.014,.03,accent,root,s*.11,1.35,.135);}
 }else{
  box(.33,.033,.013,accent,root,0,1.24,.13);for(const s of[-1,1])box(.037,.16,.012,trim,root,s*.153,1.36,.109);
 }
 limb(v(0,1.53),v(0,1.65),.045,.04,skin);ell(.073,.028,.067,dark,root,0,1.54);if(style.cut==='endurance')ell(.073,.04,.07,trim,root,0,1.575);
 const head=new T.Group();head.position.set(0,1.719,0);root.add(head);
 // A continuous sculpted head: tapered jaw, cheek planes, recessed sockets, and an integrated nose.
 const profile=[[-.127,.004,.043],[-.115,.041,.065],[-.087,.065,.073],[-.05,.08,.08],[-.015,.092,.085],[.025,.092,.087],[.058,.089,.085],[.092,.08,.079],[.118,.053,.052],[.132,.004,.003]],rings=[],verts=[],uv=[],indices=[],n=64;
 for(let j=0;j<profile.length-1;j++)for(let k=0;k<4;k++)rings.push(profile[j].map((v,i)=>T.MathUtils.lerp(v,profile[j+1][i],k/4)));rings.push(profile.at(-1));
 for(let j=0;j<rings.length;j++){const [y,width,depth]=rings[j];for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,xx=Math.sin(a)*width*(female?.95:1),front=Math.max(0,Math.cos(a));let zz=Math.cos(a)*depth;
  const nose=Math.exp(-Math.pow(xx/facial[1],2)-Math.pow((y+.005)/.029,2))*facial[2];
  const cheeks=Math.exp(-Math.pow((Math.abs(xx)-.05)/.024,2)-Math.pow((y+.024)/.033,2))*.004;
  const sockets=Math.exp(-Math.pow((Math.abs(xx)-.039)/.019,2)-Math.pow((y-.023)/.013,2))*.004;
  zz+=front*(nose+cheeks-sockets);verts.push(xx*facial[0],y,zz);uv.push(i/n,j/(rings.length-1));}}
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+n+1;indices.push(a,a+1,b,a+1,b+1,b);}const fg=new T.BufferGeometry();fg.setAttribute('position',new T.Float32BufferAttribute(verts,3));fg.setAttribute('uv',new T.Float32BufferAttribute(uv,2));fg.setIndex(indices);fg.computeVertexNormals();const normals=fg.attributes.normal;for(let j=0;j<rings.length;j++){const a=j*(n+1),b=a+n,avg=new T.Vector3().fromBufferAttribute(normals,a).add(new T.Vector3().fromBufferAttribute(normals,b)).normalize();normals.setXYZ(a,avg.x,avg.y,avg.z);normals.setXYZ(b,avg.x,avg.y,avg.z);}mesh(fg,faceSkin,head);
 const eyes=[];for(const s of[-1,1]){
  ell(.012,.027,.014,skin,head,s*.092,-.005,-.002);
  const eye=new T.Group();eye.position.set(s*.038,.025,.079);head.add(eye);eyes.push(eye);
  ell(.017,.006,.0035,material(0xe1daca,.62,0),eye);ell(.0045,.005,.0015,material(d.eyes,.55,0),eye,0,0,.0034);ell(.002,.003,.001,dark,eye,0,0,.0049);ell(.0008,.0008,.0005,material(0xffffff,.3),eye,-.001,.002,.0058);
  tube([[s*.021,.025,.081],[s*.038,.032,.083],[s*.055,.025,.074]],female?.0019:.0013,hair,head);
  tube([[s*.021,.019,.081],[s*.038,.018,.081],[s*.055,.024,.074]],.0022,skin,head);
  tube([[s*.022,.048,.079],[s*.039,.053,.082],[s*.058,.047,.072]],female?.0018:.0022,hair,head);
 }
 for(const s of[-1,1])ell(.0028,.0012,.0018,lip,head,s*.008,-.021,.106);
 tube([[-.02,-.055,.078],[0,-.053,.085],[.02,-.055,.078]],.0016,lip,head);tube([[-.018,-.058,.078],[0,-.06,.084],[.018,-.058,.078]],.0017,lip,head);
 if(d.name==='Sofia'||d.name==='Riya')for(const s of[-1,1]){const e=mesh(new T.TorusGeometry(.012,.0017,8,20),metal,head,s*.094,-.031,.008);e.rotation.y=s*.35;}
 for(const s of[-1,1])tube([[s*.059,.011,.077],[s*.062,-.007,.076],[s*.055,-.027,.079]],.0009,skin,head);
 const cap=mesh(new T.SphereGeometry(1,40,24,0,Math.PI*2,0,1.3),hair,head,0,.004,-.005);cap.scale.set(female?.091:.099,.132,.091);
 if(d.style==='ponytail'){
  tube([[0,.04,-.09],[.017,-.08,-.125],[.025,-.24,-.1]],.029,hair,head);for(let i=0;i<8;i++)tube([[-.079+i*.02,.077,.045],[-.06+i*.015,.126,-.005],[0,.045,-.095]],.0022,trim,head);
 }else if(d.style==='bob'||d.style==='waves'){
  const end=d.style==='bob'?-.125:-.23;for(const s of[-1,1])for(let i=0;i<6;i++)tube([[s*(.075+i*.003),.07,-.027],[s*(.096+i*.002),-.025,-.012],[s*(.086+i*.003),end,-.015]],.0075,hair,head);
  for(let i=0;i<5;i++)tube([[-.07,.087,.037],[-.055+i*.013,.119,.046],[.032+i*.01,.07,.065]],.004,hair,head);
 }else{const sweep=ell(.077,d.style==='quiff'?.026:.017,.056,hair,head,-.008,.128,.012);sweep.rotation.z=.18;for(let i=0;i<10;i++){const xx=-.077+i*.017;tube([[xx,.09,.052],[xx*.7,.145+(d.style==='quiff'?.013:0),.013],[xx*.7+.014,.103,-.052]],.0018,hair,head);}}
 if(d.name==='Kai'){
  for(const s of[-1,1]){const glasses=new T.Mesh(new T.TorusGeometry(.021,.0025,6,20),trim);glasses.scale.y=.55;glasses.position.set(s*.038,.031,.087);head.add(glasses);}box(.032,.004,.004,metal,head,0,.032,.091);
 }else if(d.name==='Anjan'){
  const band=mesh(new T.SphereGeometry(1,32,4,0,Math.PI*2,1.05,.13),trim,head,0,.002,-.004);band.scale.set(.101,.13,.094);
 }else if(d.name==='Riya'){
  for(const s of[-1,1]){ell(.014,.024,.025,dark,head,s*.103,.013,-.006);tube([[s*.114,.015,.012],[s*.107,-.025,.042],[s*.039,-.054,.1]],.0028,metal,head);}ell(.008,.004,.005,dark,head,.037,-.054,.102);
 }else if(d.name==='Jaggu'){
  const beard=tailored([[-.122,.027,.052,.023],[-.107,.044,.062,.028],[-.084,.069,.066,.035],[-.068,.066,.056,.036]],hair,head);
  for(const s of[-1,1])tube([[s*.006,-.041,.093],[s*.016,-.042,.09],[s*.025,-.047,.084]],.0028,hair,head);
 }
 const arms=[],hands=[];for(const s of[-1,1]){
  const arm=new T.Group();arm.position.set(s*w,1.46,0);root.add(arm);arms.push(arm);
  const bent=!options.celebrate&&((d.name==='Sofia'&&s===1)||(d.name==='Anjan'&&s===-1)),elbow=v(s*.055,-.24,bent?.1:0),hand=v(s*(bent?-.08:.07),bent?-.29:-.45,bent?.145:.033);
  limb(v(0,0),elbow,.057,.042,suit,arm);limb(elbow,hand,.043,.031,suit,arm);ell(.056,.051,.058,trim,arm,0,-.026,0);
  box(.026,.12,.008,accent,arm,s*.041,-.15,.049);ell(.031,.052,.028,dark,arm,hand.x,hand.y-.048,hand.z);for(let i=0;i<4;i++)ell(.005,.018,.006,dark,arm,hand.x+(i-1.5)*.012,hand.y-.081,hand.z+.016);
  const grip=new T.Group();grip.position.set(hand.x,hand.y-.048,hand.z);arm.add(grip);hands.push(grip);
  for(let k=0;k<3;k++){const seam=mesh(new T.TorusGeometry(.034,.0014,5,20,Math.PI),trim,arm,hand.x,hand.y-.044+k*.011,hand.z+.004);seam.rotation.x=Math.PI/2;}
  tube([[s*.036,-.07,.047],[s*.045,-.18,.043],[elbow.x,elbow.y,.045]],.0016,trim,arm);for(let k=0;k<3;k++)tube([[elbow.x-.026,elbow.y+k*.009,.048],[elbow.x,elbow.y+.008+k*.009,.053],[elbow.x+.026,elbow.y+k*.009,.048]],.0014,suit,arm);
  limb(v(s*.09,1.01),v(s*.108,.58),.077,.058,style.cut==='leather'?dark:suit);limb(v(s*.108,.58),v(s*.11,.14),.056,.043,style.cut==='leather'?dark:suit);
  ell(.048,.07,.025,dark,root,s*.108,.59,.052);tube([[s*.145,.95,.025],[s*.154,.67,.02],[s*.152,.26,.03]],.006,accent);
  if(style.cut==='tech'||style.cut==='rally')box(.055,.1,.029,trim,root,s*.155,.83,.028);
  ell(.061,.058,.112,dark,root,s*.111,.075,.045);box(.12,.018,.215,trim,root,s*.111,.025,.04);for(let k=0;k<4;k++)box(.056,.006,.008,metal,root,s*.111,.075+k*.015,.137-k*.009);
 }
 if(d.name==='Maya'){
  const helmet=new T.Group();helmet.position.set(-.285,.89,.033);root.add(helmet);ell(.102,.112,.1,trim,helmet);ell(.096,.043,.027,dark,helmet,0,.021,.089);box(.12,.018,.02,accent,helmet,0,-.035,.099);
 }
 root.scale.setScalar(style.height);root.userData={head,eyes,arms,hands,phase:d.name.length*.9,gender:d.gender,style:style.title};return root;
}
export function animateCharacter(root,time){if(!root?.userData.head)return;const d=root.userData;d.head.rotation.y=Math.sin(time*.35+d.phase)*.045;d.arms.forEach((a,i)=>a.rotation.z=Math.sin(time*.6+i*2)*.013);const blink=(time+d.phase)%5.1;d.eyes.forEach(e=>e.scale.y=blink<.1?.18:1);}
