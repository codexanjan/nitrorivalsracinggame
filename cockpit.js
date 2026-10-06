import * as T from './vendor/three.module.js';
import {mesh,box,ell,material} from './models.js?v=9';
function upholstery(carbon=false){
 const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle=carbon?'#171c21':'#25272a';x.fillRect(0,0,256,256);
 let seed=36;for(let i=0;i<9500;i++){seed=(seed*1664525+1013904223)>>>0;const px=seed%256;seed=(seed*1664525+1013904223)>>>0;x.fillStyle=i%2?'#ffffff0c':'#00000026';x.fillRect(px,seed%256,1,1);}
 if(carbon)for(let i=0;i<256;i+=8)for(let j=0;j<256;j+=8){x.fillStyle=(i+j)%16?'#4b515826':'#05080e44';x.fillRect(i,j,4,8);}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(5,3);return t;
}
function roundedPanel(w,h,depth,mat,parent,x,y,z,r=.035){
 const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
 return mesh(new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.006,bevelThickness:.006,curveSegments:5}),mat,parent,x,y,z);
}
function dashboard(parent,mat){
 const v=[],uv=[],idx=[],profile=[[-.34,-1.84],[-.31,-1.48],[-.34,-1.1],[-.44,-.8],[-.76,-.77],[-.87,-1.84]],segments=40;
 for(let i=0;i<=segments;i++){const x=-1.18+i/segments*2.95;for(let j=0;j<profile.length;j++){const [y,z]=profile[j],hump=Math.exp(-Math.pow((x-.02)/.6,2))*.04;v.push(x,y+hump,z+.05*Math.cos(x));uv.push(i/segments*3,j/profile.length);}}
 for(let i=0;i<segments;i++)for(let j=0;j<profile.length;j++){const a=i*profile.length+j,b=i*profile.length+(j+1)%profile.length,c=a+profile.length,d=b+profile.length;idx.push(a,b,c,b,d,c);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();return mesh(geo,mat,parent);
}
export class Cockpit{
 constructor(){
  this.group=new T.Group();const g=this.group;
  const black=new T.MeshStandardMaterial({color:0x171a1f,map:upholstery(),roughness:.8}),carbon=new T.MeshStandardMaterial({color:0x63656a,map:upholstery(true),roughness:.43,metalness:.2}),metal=material(0xa0a3a8,.28,.8),rubber=material(0x080b10,.8,0);
  this.trim=new T.MeshStandardMaterial({color:0x13c8d0,roughness:.4,metalness:.5});this.glove=material(0x303943,.65,0);this.tick=0;this.mirrorTick=0;
  dashboard(g,black).position.z=-.34;
  // Sewn leather strip and a fine contrasting dashboard seam.
  box(2.88,.018,.025,this.trim,g,.29,-.455,-1.12);box(2.88,.035,.06,carbon,g,.29,-.51,-1.12);
  for(const x of[-.84,1.36]){roundedPanel(.26,.085,.01,rubber,g,x,-.4,-1.15,.025);for(let k=0;k<5;k++)box(.21,.006,.015,metal,g,x,-.427+k*.013,-1.126);}
  const cluster=roundedPanel(.86,.29,.06,carbon,g,0,-.24,-1.35,.06);
  const c=document.createElement('canvas');c.width=1024;c.height=384;this.ctx=c.getContext('2d');this.texture=new T.CanvasTexture(c);this.texture.colorSpace=T.SRGBColorSpace;
  mesh(new T.PlaneGeometry(.81,.265),new T.MeshBasicMaterial({map:this.texture}),g,0,-.24,-1.281);
  this.wheel=new T.Group();this.wheel.position.set(0,-.365,-1.04);this.wheel.rotation.x=-.12;g.add(this.wheel);
  mesh(new T.TorusGeometry(.26,.028,14,64),black,this.wheel);mesh(new T.TorusGeometry(.255,.004,5,64),this.trim,this.wheel,0,0,.029);
  for(const side of[-1,1]){const o=box(.15,.065,.027,carbon,this.wheel,side*.13,-.012,.018);o.rotation.z=side*.15;box(.035,.045,.008,metal,this.wheel,side*.118,.005,.038);box(.025,.065,.013,metal,this.wheel,side*.19,.06,-.028);}
  const lower=box(.07,.17,.028,carbon,this.wheel,0,-.11,.013);lower.rotation.z=0;
  ell(.094,.07,.035,rubber,this.wheel,0,0,.025);box(.031,.027,.008,this.trim,this.wheel,0,.013,.059);
  // Proper gloves with fingers wrapped over the rim, and sleeves entering from below.
  for(const side of[-1,1]){
   ell(.038,.063,.038,this.glove,this.wheel,side*.252,.003,.026);
   for(let i=0;i<4;i++)ell(.021,.009,.019,this.glove,this.wheel,side*.258,.033-i*.016,.041);
   const sleeve=ell(.043,.16,.048,black,this.wheel,side*.305,-.16,.045);sleeve.rotation.z=side*.34;box(.025,.065,.008,this.trim,this.wheel,side*.305,-.18,.091);
  }
  const screen=document.createElement('canvas');screen.width=512;screen.height=300;this.nav=screen.getContext('2d');this.navTexture=new T.CanvasTexture(screen);this.navTexture.colorSpace=T.SRGBColorSpace;
  roundedPanel(.49,.285,.025,rubber,g,.72,-.52,-1.065,.025);
  mesh(new T.PlaneGeometry(.455,.253),new T.MeshBasicMaterial({map:this.navTexture}),g,.72,-.52,-1.026);
  for(const side of[-1,1]){const dial=mesh(new T.CylinderGeometry(.023,.023,.025,20),metal,g,.72+side*.12,-.72,-1.01);dial.rotation.x=Math.PI/2;}
  box(.21,.016,.018,this.trim,g,.72,-.721,-.99);
  roundedPanel(.5,.47,.75,black,g,.65,-.96,-.7,.07);const shifter=mesh(new T.CylinderGeometry(.014,.02,.16,16),metal,g,.57,-.665,-.63);ell(.035,.025,.045,black,g,.57,-.57,-.63);
  box(.075,.008,.13,carbon,g,.57,-.753,-.63);for(let i=0;i<2;i++)mesh(new T.TorusGeometry(.057,.009,8,24),rubber,g,.73,-.749,-.34+i*.16).rotation.x=-Math.PI/2;
  for(const [x,s] of[[-1.12,-1],[1.68,1]]){
   roundedPanel(.06,.38,1.8,black,g,x,-.73,-.5,.025);box(.035,.025,.52,carbon,g,x-s*.035,-.55,-.04);box(.018,.025,.18,metal,g,x-s*.07,-.47,-.34);
   const pillar=box(.048,1.08,.055,black,g,x,.15,-1.6);pillar.rotation.z=-s*.2;
   box(.065,.96,.06,black,g,x,.05,.7);box(.028,.025,2.6,this.trim,g,x-s*.032,-.38,-.55);
   const seat=new T.Group();g.add(seat);seat.position.set(s===-1?-.02:1.04,-.83,.68);ell(.3,.5,.12,black,seat,0,.25,.03);ell(.23,.17,.1,black,seat,0,.77,.05);ell(.31,.08,.35,black,seat,0,-.17,-.17);for(const t of[-1,1])ell(.065,.43,.1,carbon,seat,t*.27,.22,-.05);
  }
  box(2.92,.055,2.3,black,g,.28,.68,-.35);
  // Narrow mirror with a real rear camera instead of an opaque placeholder.
  box(.025,.13,.03,metal,g,.43,.57,-1.69);roundedPanel(.5,.15,.027,rubber,g,.43,.475,-1.66,.025);
  this.mirrorTarget=new T.WebGLRenderTarget(512,144);this.mirrorTarget.texture.colorSpace=T.SRGBColorSpace;
  const mirrorGeo=new T.PlaneGeometry(.468,.12);const mUV=mirrorGeo.attributes.uv;for(let i=0;i<mUV.count;i++)mUV.setX(i,1-mUV.getX(i));
  mesh(mirrorGeo,new T.MeshBasicMaterial({map:this.mirrorTarget.texture}),g,.43,.475,-1.622);
  this.rearCamera=new T.PerspectiveCamera(60,512/144,.2,1600);this.group.visible=false;this.lookYaw=0;this.lookPitch=0;this.targetYaw=0;this.targetPitch=0;
 }
 setCar(car,color){this.trim.color.set(color||car.color).lerp(new T.Color(0x37434c),.28);this.carName=car.name;}
 setVisible(v){this.group.visible=v;}
 renderMirror(renderer,scene,dt){
  this.mirrorTick+=dt;if(this.mirrorTick<.06)return;this.mirrorTick=0;
  this.rearCamera.position.copy(this.group.position);this.rearCamera.quaternion.copy(this.group.quaternion);this.rearCamera.translateZ(.6);this.rearCamera.rotateY(Math.PI);
  const target=renderer.getRenderTarget();this.group.visible=false;renderer.setRenderTarget(this.mirrorTarget);renderer.render(scene,this.rearCamera);renderer.setRenderTarget(target);this.group.visible=true;
 }
 update(r,dt,world){
  this.wheel.rotation.z=T.MathUtils.damp(this.wheel.rotation.z,-r.steer*.85,10,dt);this.tick+=dt;if(this.tick<.1)return;this.tick=0;
  const x=this.ctx;x.fillStyle='#080d13';x.fillRect(0,0,1024,384);
  const gauge=(cx,label,value,max,color)=>{const cy=185,rad=135;x.lineWidth=10;x.strokeStyle='#1f2b36';x.beginPath();x.arc(cx,cy,rad,.7*Math.PI,2.3*Math.PI);x.stroke();x.strokeStyle=color;x.beginPath();x.arc(cx,cy,rad,.7*Math.PI,(.7+1.6*Math.min(1,value/max))*Math.PI);x.stroke();for(let i=0;i<=10;i++){const a=(.7+i*.16)*Math.PI;x.strokeStyle=i>8?'#e85c56':'#687883';x.lineWidth=3;x.beginPath();x.moveTo(cx+Math.cos(a)*119,cy+Math.sin(a)*119);x.lineTo(cx+Math.cos(a)*129,cy+Math.sin(a)*129);x.stroke();}x.fillStyle='#94a8b5';x.font='18px Arial';x.textAlign='center';x.fillText(label,cx,cy+53);};
  const speed=Math.round(Math.abs(r.speed)*3.6);gauge(188,'RPM ×1000',Math.abs(r.speed)%12+2,14,'#51d2df');gauge(835,'KM/H',speed,320,'#c6f65b');
  x.fillStyle='#e9f3f4';x.font='bold 68px Arial';x.textAlign='center';x.fillText(String(speed),512,197);x.font='20px Arial';x.fillStyle='#8c9fab';x.fillText('KM/H',512,231);
  x.font='bold 44px Arial';x.fillStyle='#c6f65b';x.fillText(r.reversing?'R':'D'+Math.min(6,1+Math.floor(r.speed/12)),188,197);x.fillStyle='#eff6f6';x.fillText(String(speed),835,197);
  x.font='17px Arial';x.fillStyle='#8ca4b4';x.fillText(this.carName||'NITRO RIVALS',512,68);x.fillStyle='#33424d';x.fillRect(353,273,318,9);x.fillStyle='#57daeb';x.fillRect(353,273,318*r.nitro/100,9);x.font='15px Arial';x.fillText('NITRO '+Math.round(r.nitro)+'%',512,307);x.fillStyle=r.health<35?'#ff7460':'#aabac6';x.fillText('DAMAGE '+Math.round(100-r.health)+'%',512,343);this.texture.needsUpdate=true;
  const n=this.nav;n.fillStyle='#101b24';n.fillRect(0,0,512,300);n.strokeStyle='#233b49';n.lineWidth=2;for(let i=0;i<10;i++){n.beginPath();n.moveTo(0,i*35);n.lineTo(512,i*26+50);n.stroke();}n.strokeStyle='#728d9b';n.lineWidth=7;n.beginPath();if(world)for(let i=0;i<=70;i++){const p=world.frame(world.length*i/70).p,px=256+p.x*.65,py=163+p.z*.65;i?n.lineTo(px,py):n.moveTo(px,py);}n.stroke();if(world){const p=world.frame(r.progress).p;n.fillStyle='#c6f65b';n.beginPath();n.arc(256+p.x*.65,163+p.z*.65,8,0,Math.PI*2);n.fill();}n.fillStyle='#d8e8e9';n.font='18px Arial';n.fillText(world?.theme.name||'LIVE ROUTE',22,34);n.fillStyle='#7d96a8';n.font='14px Arial';n.fillText('LIVE GPS  /  '+Math.round(r.health)+'% CONDITION',22,276);this.navTexture.needsUpdate=true;
 }
}
