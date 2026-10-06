import assert from 'node:assert/strict';
import {vehicleContact,resolveVehicleContacts} from '../collision.js';
import {CARS,vehicleState,Race} from '../core.js';
let cases=0;
for(const car of CARS)for(const pitch of[-.2,0,.2])for(const height of[0,.5,1.45,1.8,2.25,3.2]){
 const a={...vehicleState(20),car,height,pitch,yaw:.15},b={...vehicleState(20),car};
 if(height<=1.45||Math.abs(pitch)>.1&&height<=2.25)assert(vehicleContact(a,b),'Low or tilted jump must still be solid');
 if(height===3.2)assert.equal(vehicleContact(a,b),null,'Fully clear jump may pass above');
 resolveVehicleContacts([a,b],1000,null);const contact=vehicleContact(a,b);assert(!contact||contact.overlap<.025);cases++;
 const group=Array.from({length:6},(_,i)=>({...vehicleState(30+(i%2)*.8,(i%3-1)*1.4),car,height:i%2?height:0,pitch:i%2?pitch:0,yaw:i%2?.12:-.12}));
 resolveVehicleContacts(group,1000,null);for(let i=0;i<6;i++)for(let j=i+1;j<6;j++){const c=vehicleContact(group[i],group[j]);assert(!c||c.overlap<.025,'Packed mixed-height cars stay solid');}
}
const race=new Race({car:CARS[0],trackLength:1100,difficulty:'hard',mode:'circuit'});race.status='racing';let contested=false;
for(let i=0;i<8000&&race.status!=='finished';i++){race.step(1/60,{throttle:true,turn:-race.lane*.2-race.lateral*.08},.006);if(race.opponents.filter(b=>b.progress>race.progress).length>=3)contested=true;for(const b of race.opponents)assert.deepEqual(b.car,race.car,'Rivals must not get hidden horsepower');}
assert(contested,'At least three Pro rivals can overtake an unboosted player');
console.log(`PASS: ${cases} pitched jump pairs and packed 6-car height cases, plus competitive Pro overtakes with equal car stats.`);
