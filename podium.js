import * as T from './vendor/three.module.js';
import {createCar,box,mesh,material} from './models.js?v=9';
import {createCharacter,animateCharacter} from './characters.js?v=9';
function label(text,sub,color,width=1.6){
 const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');x.fillStyle='#101e29';x.fillRect(0,0,512,256);x.textAlign='center';x.fillStyle=color;x.font='bold italic '+(text.length>5?65:135)+'px Arial';x.fillText(text,256,151);x.fillStyle='#d5e4eb';x.font='bold 28px Arial';x.fillText(sub,256,216);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return new T.Mesh(new T.PlaneGeometry(width,width/2),new T.MeshBasicMaterial({map:t}));
}
export class VictoryCelebration{
 constructor(scene,car,entries){
  this.winnerName=entries[0].driver.name;this.group=new T.Group();scene.add(this.group);this.time=0;this.object=new T.Object3D();this.handPosition=new T.Vector3();this.racers=[];
  const gold=material(0xffcf53,.21,.82),dark=material(0x12212b,.5,.6),lime=new T.MeshBasicMaterial({color:0xc6f65b});
  const floor=mesh(new T.CircleGeometry(25,64),material(0x12202b,.33,.55),this.group,0,-.06);floor.rotation.x=-Math.PI/2;
  mesh(new T.CylinderGeometry(6.4,6.6,.3,64),dark,this.group,0,.1);
  const ring=mesh(new T.TorusGeometry(6.4,.035,8,96),lime,this.group,0,.27);ring.rotation.x=-Math.PI/2;
  this.car=createCar(car,entries[0].color);this.car.position.set(-4.1,.28,1.2);this.car.rotation.y=.85;this.car.scale.setScalar(.8);this.group.add(this.car);
  const heights=[1.05,.68,.43],positions=[0,-2.25,2.25],colors=['#ffd15a','#c9d9e9','#e8a37a'];
  entries.forEach((entry,i)=>{
   const h=heights[i];box(2,h,1.9,material(i===0?0x334735:0x1b2c3a,.5,.45),this.group,positions[i],.26+h/2,-.25);
   box(2,.05,1.94,material(colors[i],.25,.65),this.group,positions[i],.28+h,-.25);
   const plaque=label(String(i+1),entry.driver.name.toUpperCase()+(entry.you?' · YOU':''),colors[i],1.55);plaque.position.set(positions[i],.26+h*.5,.715);this.group.add(plaque);
   const racer=createCharacter(entry.driver,{celebrate:true});racer.scale.multiplyScalar(i===0?1.28:1.18);racer.position.set(positions[i],.31+h,-.2);racer.rotation.y=.1;this.group.add(racer);this.racers.push({racer,baseY:racer.position.y,rank:i});
  });
  this.driver=this.racers[0].racer;
  this.trophy=new T.Group();this.trophy.scale.setScalar(.78);this.group.add(this.trophy);
  // Stem centre follows the glove grip while the cup stays upright.
  box(.42,.08,.42,dark,this.trophy,0,-.31);mesh(new T.CylinderGeometry(.17,.23,.13,24),gold,this.trophy,0,-.23);
  mesh(new T.CylinderGeometry(.055,.07,.34,16),gold,this.trophy,0,0);
  const cup=mesh(new T.LatheGeometry([new T.Vector2(.075,0),new T.Vector2(.18,.08),new T.Vector2(.3,.3),new T.Vector2(.34,.44),new T.Vector2(.29,.44),new T.Vector2(.25,.29),new T.Vector2(.11,.08)],40),gold,this.trophy,0,.17);cup.material.side=T.DoubleSide;
  for(const s of[-1,1]){const handle=mesh(new T.TorusGeometry(.19,.032,8,32),gold,this.trophy,s*.3,.46);handle.scale.x=.72;}
  const banner=label('NITRO RIVALS',entries[0].driver.name.toUpperCase()+' · CHAMPION','#ffd15a',4.9);banner.position.set(-.35,4.4,-3.1);this.group.add(banner);
  for(const s of[-1,1]){box(.08,6.5,.08,gold,this.group,s*4.3,3.25,-3.15);box(.02,5,.02,lime,this.group,s*4.29,2.7,-3.09);}
  // A velvet carpet, gold stanchions, and a lit awards wall.
  const velvet=material(0x701222,.96,0);box(5,.035,10,velvet,this.group,0,.02,4.1);
  for(const side of[-1,1]){box(.035,.045,10,gold,this.group,side*2.5,.04,4.1);for(let k=0;k<4;k++){const z=2.4+k*2;mesh(new T.CylinderGeometry(.09,.1,.95,16),gold,this.group,side*2.75,.48,z);mesh(new T.SphereGeometry(.115,16,12),gold,this.group,side*2.75,.98,z);mesh(new T.CylinderGeometry(.24,.27,.08,16),gold,this.group,side*2.75,.04,z);if(k<3){const rope=new T.CatmullRomCurve3([new T.Vector3(side*2.75,.9,z),new T.Vector3(side*2.75,.7,z+1),new T.Vector3(side*2.75,.9,z+2)]);mesh(new T.TubeGeometry(rope,16,.035,8,false),velvet,this.group);}}}
  box(13,7,.2,material(0x420e21,.85),this.group,0,3.5,-4);
  for(let i=0;i<12;i++){const x=-5.6+i;box(.028,6,.05,new T.MeshBasicMaterial({color:i%2?0xf5c35a:0xb31f3b}),this.group,x,3.3,-3.84);}
  this.confetti=new T.InstancedMesh(new T.PlaneGeometry(.09,.18),new T.MeshBasicMaterial({side:T.DoubleSide}),220);this.confetti.frustumCulled=false;this.group.add(this.confetti);
  const palette=[0xffcf53,0xc6f65b,0x3de2f5,0xf47bae,0xff7b45];this.bits=Array.from({length:220},(_,i)=>{this.confetti.setColorAt(i,new T.Color(palette[i%5]));return {x:(Math.random()-.5)*13,y:Math.random()*11+2,z:(Math.random()-.5)*8,v:.7+Math.random()*1.3,phase:Math.random()*7};});
 }
 update(dt,camera){
  this.time+=dt;
  for(const {racer,baseY,rank} of this.racers){
   animateCharacter(racer,this.time+rank);racer.position.y=baseY+(rank===0?Math.max(0,Math.sin(this.time*2.4))*.035:0);
   if(rank===0){racer.userData.arms[0].rotation.z=-2.1-Math.sin(this.time*2.4)*.07;racer.userData.arms[1].rotation.z=1.7+Math.sin(this.time*1.2)*.06;}
   else {racer.userData.arms[0].rotation.z=-.5-Math.sin(this.time*2+rank)*.12;racer.userData.arms[1].rotation.z=.5+Math.sin(this.time*2+rank)*.12;}
  }
  this.group.updateMatrixWorld(true);this.driver.userData.hands[1].getWorldPosition(this.handPosition);this.group.worldToLocal(this.handPosition);this.trophy.position.copy(this.handPosition);this.trophy.rotation.y=.1;
  this.bits.forEach((p,i)=>{p.y-=dt*p.v;if(p.y<.3)p.y=10;const o=this.object;o.position.set(p.x+Math.sin(this.time+p.phase)*.4,p.y,p.z);o.rotation.set(this.time+p.phase,this.time*1.7+p.phase,p.phase);o.scale.setScalar(1);o.updateMatrix();this.confetti.setMatrixAt(i,o.matrix);});this.confetti.instanceMatrix.needsUpdate=true;
  const zoom=T.MathUtils.smoothstep(this.time,2,5),headY=this.driver.position.y+1.7*this.driver.scale.y;
  if(camera.aspect<1){camera.position.set(T.MathUtils.lerp(3.7,.8,zoom),T.MathUtils.lerp(4.8,headY+.2,zoom),T.MathUtils.lerp(15.8,6.4,zoom));camera.lookAt(.25,T.MathUtils.lerp(1.9,headY-.24,zoom),0);}else{camera.position.set(T.MathUtils.lerp(5.2,1.1,zoom),T.MathUtils.lerp(4.2,headY+.18,zoom),T.MathUtils.lerp(14.2,3.25,zoom));camera.lookAt(T.MathUtils.lerp(2.8,1.08,zoom),T.MathUtils.lerp(2.25,headY-.16,zoom),0);}
  camera.fov=46;camera.updateProjectionMatrix();
 }
 dispose(){this.group.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}}});this.group.removeFromParent();}
}
