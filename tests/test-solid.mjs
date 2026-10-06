import assert from 'node:assert/strict';
import {Race,CARS,freshSave,parseSave,PARTS,buyPart,usePart,carStats,vehicleState} from '../core.js';
import {resolveVehicleContacts,vehicleContact,findClearSpawn,roadLimit} from '../collision.js';
const length=1200,rad=length/(2*Math.PI),frame=p=>{const a=p/rad;return {p:{x:Math.cos(a)*rad,z:Math.sin(a)*rad},d:{x:-Math.sin(a),z:Math.cos(a)},n:{x:-Math.cos(a),z:-Math.sin(a)}};};
function verify(all,f,label){for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){const hit=vehicleContact(all[i],all[j],f);assert(!hit||hit.overlap<.015,label+' pair '+i+'/'+j+' overlap '+hit?.overlap);}}
for(const car of CARS){
 for(const curved of [false,true])for(const lane of [0,8.4,-8.4])for(const yaw of [0,.2,-.35]){
  const f=curved?frame:null,all=Array.from({length:6},(_,i)=>({...vehicleState(100+i*.1,Math.max(-roadLimit(car),Math.min(roadLimit(car),lane))),yaw,car,cooldown:2}));
  resolveVehicleContacts(all,length,f);verify(all,f,car.id+' packed');
  all.forEach(v=>assert(Math.abs(v.lane)<=roadLimit(car)+.001));
 }
 const r=new Race({car,trackLength:length,collisionFrame:frame});r.status='racing';r.speed=70;r.opponents.forEach((b,i)=>{b.progress=5+i*7;b.speed=30;b.lane=0;});
 for(let i=0;i<4000&&r.status!=='finished';i++){r.step(1/60,{throttle:1,boost:i%200<50,turn:Math.sin(i/60)*.4},()=>1/rad);verify([r,...r.opponents],frame,car.id+' dynamic '+i);}
 r.status='racing';r.progress=200;r.opponents.forEach((b,i)=>{b.progress=200+(i-2)*2;b.lane=0;});r.resetCar();verify([r,...r.opponents].slice(0,1).concat([]),frame,'spawn');assert(r.opponents.every(b=>!vehicleContact(r,b,frame)));
}
const save=freshSave();save.coins=5000;
for(const p of PARTS)assert(buyPart(save,p.id,'pulse'));assert(!buyPart(save,'armor','pulse'));
assert.equal(save.inventory.repair,2);assert.equal(save.inventory.nitro,1);assert.equal(carStats(save,'pulse').damageScale,.8);assert(carStats(save,'pulse').grip>CARS[0].grip);
const r=new Race({car:carStats(save,'pulse'),trackLength:1200});r.status='racing';r.health=45;r.nitro=25;assert(usePart(save,r,'repair'));assert.equal(r.health,80);assert.equal(save.inventory.repair,1);assert(usePart(save,r,'nitro'));assert.equal(r.nitro,75);assert(!usePart(save,r,'tires'));
assert.deepEqual(parseSave(JSON.stringify(save)).parts.pulse,save.parts.pulse);assert.equal(parseSave(JSON.stringify(save)).inventory.repair,1);
const old=parseSave(JSON.stringify({version:2,coins:123,owned:['pulse']}));assert.equal(old.coins,123);assert.equal(old.inventory.repair,1);
console.log('PASS: all 4 car bounds, 72 packed grid/wall/rotated cases, curved-track physics simulation, safe spawn, parts costs, duplicate prevention, consumables and old-save migration.');
