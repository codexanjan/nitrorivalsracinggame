import assert from 'node:assert/strict';
import {CARS,vehicleState,driveVehicle,Race} from '../core.js';
for(const car of CARS){
 const r={...vehicleState(),car};
 for(let i=0;i<300;i++)driveVehicle(r,1/60,{throttle:true},0,car,1);
 assert(r.speed>30);let stopped=false;
 for(let i=0;i<240;i++){const before=r.speed;driveVehicle(r,1/60,{reverse:true,boost:true,throttle:true},0,car,1);if(before===0||r.speed===0)stopped=true;if(r.speed<0)assert(stopped,'Must stop before changing direction');assert(!r.boosting);}
 assert(r.reversing);assert(r.speed>=-12&&r.speed<-11);const behind=r.progress;
 for(let i=0;i<60;i++)driveVehicle(r,1/60,{reverse:true,turn:.5},0,car,1);
 assert(r.progress<behind);assert(r.lane<0,'Reverse steering changes lateral direction');
 for(let i=0;i<200;i++)driveVehicle(r,1/60,{throttle:true},0,car,1);
 assert(r.speed>0);assert(!r.reversing);
 const s=vehicleState();for(let i=0;i<120;i++)driveVehicle(s,1/60,{brake:true},0,car,1);assert(s.speed<0,'Holding brake engages reverse');
 const at=s.speed;driveVehicle(s,.1,{},0,car,1);assert(s.speed>at,'Release reverse coasts toward stop');
}
const race=new Race({car:CARS[0],trackLength:1100,mode:'sprint'});race.status='racing';const p=race.pickups[0];p.lane=0;race.progress=p.progress-1;race.speed=20;race.step(.1,{throttle:true});const coins=race.coins;p.lap=-1;race.progress=p.progress-1;race.speed=20;race.step(.1,{throttle:true});assert.equal(race.coins,coins,'Reverse cannot farm a previously collected coin');
console.log('PASS: 4 cars brake before reversing, reverse limit, no reverse nitro, correct steering, forward recovery, brake hold, coasting and pickup replay prevention.');
