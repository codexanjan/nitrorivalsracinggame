import assert from 'node:assert/strict';
import {Race,CARS,TRACKS,vehicleState,freshSave,carStats,settleRace} from '../core.js';
import {updateJump} from '../jumps.js';
import {vehicleContact} from '../collision.js';
for(const speed of [0,10,35,70]){
 const a={...vehicleState(),speed},b={...vehicleState(),speed};const ramps=[{id:0,progress:20,length:12,width:6,lane:0,height:1.5}];
 let land=0,max=0;for(let i=0;i<600;i++){a.progress+=speed/60;b.progress+=speed/60;const e=updateJump(a,1/60,ramps,1000);updateJump(b,1/60,ramps,1000);assert.deepEqual(a,b,'All cars use equal jump physics');max=Math.max(max,a.height);assert(a.height>=0&&Number.isFinite(a.pitch));if(e?.type==='landing')land++;}
 if(speed>=35){assert(land===1);assert(max>2);assert(a.longestJump>25);}else if(speed===0)assert.equal(max,0);
}
const a={...vehicleState(10),height:3},b=vehicleState(10);assert.equal(vehicleContact(a,b),null);a.height=0;assert(vehicleContact(a,b));
let runs=0;
for(const track of TRACKS)for(const car of CARS){
 const length=1100,ramps=[.18,.49,.77].map((f,id)=>({id,progress:f*length,length:12,width:6,lane:[0,-4,4][id],height:1.5}));
 const race=new Race({car,trackLength:length,grip:track.grip,ramps,mode:'sprint',difficulty:'easy'});race.status='racing';
 for(let i=0;i<5000&&race.status!=='finished';i++){
  const ramp=ramps.find(r=>r.progress>race.progress-12);const lane=ramp?.lane??race.lane;
  race.step(1/60,{throttle:true,boost:race.nitro>35,turn:Math.max(-.65,Math.min(.65,(lane-race.lane)*.2-race.lateral*.08))},0);
  assert(race.height>=0);for(const bot of race.opponents)assert(bot.height>=0);
 }
 assert.equal(race.status,'finished');assert(race.jumps>=1,'Ramp jumps occur in a full race');const s=freshSave();assert(settleRace(s,race,track.id));assert.equal(settleRace(s,race,track.id),null);runs++;
}
const r=new Race({car:carStats(freshSave(),'pulse'),trackLength:1100});r.status='racing';r.airborne=true;r.height=4;r.verticalSpeed=6;r.status='paused';r.step(1/60,{throttle:true});assert.equal(r.height,4);r.status='racing';r.resetCar();assert.equal(r.height,0);assert.equal(r.airborne,false);
console.log(`PASS: ${runs} complete races with ramps, equal launch physics, landing rewards, airborne clearance, pause, safe respawn and exactly-once finish payouts.`);
