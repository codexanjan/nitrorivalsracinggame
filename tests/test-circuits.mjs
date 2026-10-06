import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {TrackWorld} from '../world.js';
import {CARS,TRACKS,Race} from '../core.js';
import {vehicleContact,resolveVehicleContacts} from '../collision.js';
let steps=0;
for(const theme of TRACKS){
 const w=Object.create(TrackWorld.prototype),points=[];
 for(let i=0;i<20;i++){const a=i/20*Math.PI*2,r=1+.12*Math.sin(3*a)+.05*Math.cos(5*a);points.push(new T.Vector3(Math.sin(a)*theme.rx*r,0,Math.cos(a)*theme.rz*r));}
 w.curve=new T.CatmullRomCurve3(points,true,'catmullrom',.5);w.length=w.curve.getLength();w.samples=Array.from({length:1001},(_,i)=>w.frameExact(i/1000));
 for(const car of CARS){
  const ramps=[.18,.49,.77].map((f,id)=>({id,progress:w.length*f,lane:[0,-4,4][id],length:12,width:6,height:1.5}));
  const r=new Race({car,trackLength:w.length,collisionFrame:p=>w.frame(p),ramps,grip:theme.grip,mode:'sprint',difficulty:'hard'});r.status='racing';
  for(let tick=0;tick<12000&&r.status!=='finished';tick++){
   r.step(1/60,{throttle:1,boost:tick%400<100,turn:-r.lane*.2-r.lateral*.1},p=>w.curvature(p));steps++;
   const all=[r,...r.opponents];for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){const contact=vehicleContact(all[i],all[j],p=>w.frame(p));assert(!contact||contact.overlap<.025,theme.id+car.id+' contact at '+tick);}
  }
  assert.equal(r.status,'finished',theme.id+car.id+' must finish');
  const a={...r,progress:w.length-.7,lane:0,yaw:.1},b={...r,progress:.7,lane:0,yaw:-.1};resolveVehicleContacts([a,b],w.length,p=>w.frame(p));assert(!vehicleContact(a,b,p=>w.frame(p)),'lap boundary bodies');
 }
}
console.log('PASS: 12 complete races on actual track geometry, '+steps+' physics steps, solid contacts and lap-boundary separation.');
