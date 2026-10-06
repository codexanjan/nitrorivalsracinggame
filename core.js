import {resolveVehicleContacts,findClearSpawn,roadLimit} from './collision.js?v=9';
import {resetJump,updateJump} from './jumps.js?v=9';
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const CARS=[
 {id:'pulse',name:'PULSE GT',tag:'THE ALL-ROUNDER',type:'gt',color:'#12cbd1',price:0,speed:60,accel:19,grip:1.08,nitro:1,desc:'A planted chassis. Instant response. Your first step onto the grid.'},
 {id:'blaze',name:'BLAZE V8',tag:'AMERICAN MUSCLE',type:'muscle',color:'#ed6d31',price:750,speed:65,accel:17,grip:.86,nitro:1.05,desc:'Long hood, deep exhaust, and enough torque to light up the rear tires.'},
 {id:'ghost',name:'GHOST RS',tag:'PRECISION ENGINEERED',type:'sport',color:'#d9e1ec',price:1500,speed:68,accel:21,grip:1.23,nitro:.95,desc:'Lightweight construction and sharp handling for late-braking overtakes.'},
 {id:'spectre',name:'SPECTRE X',tag:'UNLEASH THE HYPERCAR',type:'hyper',color:'#bdff3f',price:2800,speed:75,accel:23,grip:1.13,nitro:1.25,desc:'Low, wide, and relentless. Built to turn every straight into a runway.'}
];
export const DRIVERS=[
 {name:'Maya',call:'PULSE',gender:'female',color:'#18cbd4',skin:'#be8564',hair:'#211914',style:'ponytail',eyes:'#4a3425',bio:'Coastal precision. Calm under pressure.'},
 {name:'Kai',call:'GHOST',gender:'male',color:'#ae9bff',skin:'#e0ad89',hair:'#161b25',style:'swept',eyes:'#34281f',bio:'Late brakes. Clean lines. Mountain specialist.'},
 {name:'Sofia',call:'BLAZE',gender:'female',color:'#ff743b',skin:'#c89272',hair:'#6b291b',style:'waves',eyes:'#496349',bio:'Fearless overtakes and flowing drifts.'},
 {name:'Anjan',call:'APEX',gender:'male',color:'#ffcd50',skin:'#a87551',hair:'#161511',style:'quiff',eyes:'#2b211a',bio:'Sharp reflexes. Every lap is a new challenge.'},
 {name:'Riya',call:'NOVA',gender:'female',color:'#e7a5ef',skin:'#b8815c',hair:'#302219',style:'bob',eyes:'#65533e',bio:'An engineer at heart. A racer by instinct.'},
 {name:'Jaggu',call:'TORQUE',gender:'male',color:'#79cfac',skin:'#986847',hair:'#23201e',style:'crop',eyes:'#332820',bio:'Patient in the corners. Relentless on the straights.'}
];
export const TRACKS=[
 {id:'coast',name:'AZURE COAST',tag:'GOLDEN HOUR / COASTAL',desc:'Ocean straights, palm-lined bends, and a sunlit harbor.',sky:0x86b4d0,horizon:0xfbd5ad,ground:0xc8bb91,accent:0xf6b879,rx:205,rz:130,grip:1,weather:'Clear',kind:'coast'},
 {id:'city',name:'NEON HARBOR',tag:'AFTER DARK / CITY',desc:'A rain-slick skyline. Luminous tunnels. One electric night.',sky:0x070e21,horizon:0x344565,ground:0x182332,accent:0x2be4de,rx:185,rz:140,grip:.94,weather:'Light rain',kind:'city'},
 {id:'alpine',name:'FROSTVALE PASS',tag:'HIGH ALTITUDE / ALPINE',desc:'Snow peaks, pine forests, and a demanding mountain circuit.',sky:0x719dbf,horizon:0xd8e6f1,ground:0xd0dce5,accent:0x8dc9ed,rx:195,rz:145,grip:.87,weather:'Snow flurries',kind:'alpine'}
];
export const PARTS=[
 {id:'repair',name:'REPAIR KIT',price:120,kind:'stock',desc:'Restore 35% condition during a race. Press E.',icon:'✚'},
 {id:'nitro',name:'NITRO CANISTER',price:90,kind:'stock',desc:'Refill 50% nitro. Press B.',icon:'↯'},
 {id:'tires',name:'SPORT TIRES',price:450,kind:'installed',desc:'Permanent +0.12 grip for this car.',icon:'◉'},
 {id:'turbo',name:'TURBO ASSEMBLY',price:600,kind:'installed',desc:'Permanent +3 acceleration and +2 top speed.',icon:'⚙'},
 {id:'armor',name:'IMPACT BRACING',price:400,kind:'installed',desc:'Permanent 20% lower impact damage.',icon:'⬡'}
];
export function buyPart(save,id,carId=save.selectedCar){
 const part=PARTS.find(p=>p.id===id);if(!part||save.coins<part.price)return false;
 if(part.kind==='stock'&&(save.inventory[id]||0)>=99)return false;
 if(part.kind==='installed'&&(!save.owned.includes(carId)||save.parts[carId]?.includes(id)))return false;
 save.coins-=part.price;
 if(part.kind==='stock')save.inventory[id]=Math.min(99,(save.inventory[id]||0)+1);
 else (save.parts[carId]??=[]).push(id);
 return true;
}
export function usePart(save,race,id){
 if(!race||race.status!=='racing'||!(save.inventory[id]>0))return false;
 if(id==='repair'&&race.health<100){race.health=Math.min(100,race.health+35);race.notify('REPAIRED · '+Math.round(race.health)+'% CONDITION');}
 else if(id==='nitro'&&race.nitro<100){race.nitro=Math.min(100,race.nitro+50);race.notify('NITRO CANISTER · +50%');}
 else return false;
 save.inventory[id]--;return true;
}
export function freshSave(){return {version:2,coins:500,owned:['pulse'],selectedCar:'pulse',driver:0,paint:{},upgrades:{},inventory:{repair:1,nitro:0},parts:{},best:{},wins:0,races:0,settings:{sound:true,music:true,quality:'high',assist:true,shake:true}}}
export function parseSave(raw){const s=freshSave();try{const d=JSON.parse(raw);if(!d||d.version!==2)return s;s.coins=clamp(Math.floor(Number(d.coins)||0),0,10000000);s.owned=[...new Set(['pulse',...(Array.isArray(d.owned)?d.owned:[]).filter(id=>CARS.some(c=>c.id===id))])];s.selectedCar=s.owned.includes(d.selectedCar)?d.selectedCar:'pulse';s.driver=clamp(Math.floor(Number(d.driver)||0),0,5);for(const k of ['repair','nitro'])if(d.inventory&&Object.hasOwn(d.inventory,k))s.inventory[k]=clamp(Math.floor(Number(d.inventory[k])||0),0,99);for(const c of CARS)s.parts[c.id]=[...new Set((Array.isArray(d.parts?.[c.id])?d.parts[c.id]:[]).filter(id=>PARTS.some(p=>p.id===id&&p.kind==='installed')))];for(const c of CARS){s.upgrades[c.id]=clamp(Math.floor(Number(d.upgrades?.[c.id])||0),0,3);if(/^#[0-9a-f]{6}$/i.test(d.paint?.[c.id]||''))s.paint[c.id]=d.paint[c.id]}if(d.best&&typeof d.best==='object')for(const [k,v]of Object.entries(d.best))if(Number.isFinite(v)&&v>0)s.best[k]=v;s.wins=Math.max(0,Math.floor(Number(d.wins)||0));s.races=Math.max(0,Math.floor(Number(d.races)||0));for(const k of ['sound','music','assist','shake'])if(typeof d.settings?.[k]==='boolean')s.settings[k]=d.settings[k];if(['high','low'].includes(d.settings?.quality))s.settings.quality=d.settings.quality;return s}catch{return s}}
export function purchase(save,id){const c=CARS.find(c=>c.id===id);if(!c)return false;if(save.owned.includes(id)){save.selectedCar=id;return true}if(save.coins<c.price)return false;save.coins-=c.price;save.owned.push(id);save.selectedCar=id;return true}
export function upgradeCost(save,id){return 350+250*(save.upgrades[id]||0)}
export function upgrade(save,id){const lvl=save.upgrades[id]||0,cost=upgradeCost(save,id);if(!save.owned.includes(id)||lvl>=3||save.coins<cost)return false;save.coins-=cost;save.upgrades[id]=lvl+1;return true}
export function carStats(save,id){const c=CARS.find(c=>c.id===id)||CARS[0],lvl=save.upgrades[c.id]||0,parts=save.parts?.[c.id]||[];return {...c,speed:c.speed+lvl*2+(parts.includes('turbo')?2:0),accel:c.accel+lvl*1.5+(parts.includes('turbo')?3:0),grip:c.grip+lvl*.035+(parts.includes('tires')?.12:0),damageScale:parts.includes('armor')?.8:1}}

// One vehicle integrator for the player and all bots. Difficulty changes decisions,
// never horsepower, boost capacity, grip, collision damage, or recovery timing.
export function vehicleState(progress=0,lane=0){return {progress,lane,speed:0,steer:0,yaw:0,lateral:0,nitro:100,health:100,heat:0,boosting:false,overheated:false,drifting:false,cooldown:0,rescue:0,crashes:0,combo:0,draft:0,height:0,verticalSpeed:0,airborne:false,airTime:0,jumpDistance:0,pitch:0,rampId:null,jumps:0,longestJump:0,reverseHold:0,reversing:false};}
export function driveVehicle(r,dt,input,curvature,car,surfaceGrip,assist=true){
 r.cooldown=Math.max(0,r.cooldown-dt);
 if(r.rescue>0){r.rescue-=dt;r.speed=0;r.boosting=false;if(r.rescue<=0){r.health=70;r.lane=0;r.yaw=0;r.lateral=0;r.cooldown=2;}return;}
 const wantsReverse=!!input.reverse;
 const turn=clamp(Number(input.turn??((input.right?1:0)-(input.left?1:0))),-1,1);
 r.steer+=(turn-r.steer)*(1-Math.exp(-dt*5));
 r.drifting=!!input.drift&&r.speed>16&&Math.abs(r.steer)>.15;
 r.boosting=!!input.boost&&!input.brake&&!wantsReverse&&r.speed>=0&&!!input.throttle&&r.nitro>1&&!r.overheated;
 const max=(car.speed+(r.boosting?18*car.nitro:0))*(.84+.16*r.health/100);
 const throttle=wantsReverse||input.brake?0:clamp(Number(input.throttle||0),0,1),brake=clamp(Number(input.brake||wantsReverse||0),0,1);
 r.reverseHold=brake&&r.speed<=.1?r.reverseHold+dt:0;
 const reverse=wantsReverse||r.reverseHold>.25;
 if(r.speed<0||(reverse&&r.speed<=.1)){
  r.boosting=false;r.drifting=false;r.speed=clamp(r.speed+(throttle?24:reverse?-9:4)*dt,-12,0);
 }else{
 const drag=.018*r.speed+Math.abs(curvature)*r.speed*.25;
 let acceleration=throttle*car.accel*Math.max(.05,1-Math.pow(r.speed/(max+7),2))-drag-5*(1-throttle)-brake*36+(r.boosting?16:0)-(r.drifting?2:0);
 if(r.speed>max)acceleration-=Math.min(12,(r.speed-max)*1.3);
 r.speed=clamp(r.speed+acceleration*dt,0,(car.speed+18*car.nitro)*1.025);
  }
 r.reversing=r.speed<-.1;
 const grip=car.grip*surfaceGrip;
 const wanted=r.steer*(r.drifting?.48:.22)/Math.max(1,Math.abs(r.speed)/65);
 r.yaw+=(wanted-r.yaw)*(1-Math.exp(-dt*(r.drifting?2.4:5)*grip));
 if(!assist)r.yaw-=curvature*r.speed*dt;
 r.lateral+=(Math.sin(r.yaw)*r.speed-r.lateral)*(1-Math.exp(-dt*(r.drifting?3:8)*grip));
 r.lane+=r.lateral*dt;
 r.progress+=r.speed*Math.max(.5,Math.cos(r.yaw))*dt;
 r.nitro=clamp(r.nitro+(r.boosting?-23:r.drifting?10:2.5)*dt,0,100);
 r.heat=clamp(r.heat+(r.boosting?24:-18)*dt,0,100);
 if(r.heat>=99)r.overheated=true;if(r.heat<25)r.overheated=false;
}
export function impactVehicle(r,strength=1){
 if(r.cooldown>0||r.rescue>0)return false;
 r.cooldown=.85;r.health=clamp(r.health-(7+Math.abs(r.speed)*.22)*strength*(r.car?.damageScale??1),0,100);
 r.speed*=1-clamp(strength*.28,.12,.42);r.combo=0;r.crashes++;
 if(r.health<=0){r.rescue=2.5;r.speed=0;r.boosting=false;}return true;
}
export class Race{
 constructor({car,trackLength,grip=1,mode='circuit',difficulty='normal',assist=true,seed=1,collisionFrame=null,ramps=[]}){
  Object.assign(this,vehicleState());this.ramps=ramps;this.car={...car};this.collisionFrame=collisionFrame;this.length=trackLength;this.grip=grip;this.mode=mode;this.assist=assist;this.difficulty=difficulty;this.status='countdown';this.countdown=3;this.time=0;this.drift=0;this.coins=0;this.rewindUsed=false;this.history=[];this.historyTimer=0;this.event='';this.eventTime=0;this.events=[];this.settled=false;this.maxSpeed=0;this.nearMisses=0;this.lastLap=0;this.finishTime=null;
  this.pickups=Array.from({length:45},(_,i)=>({progress:35+i*(trackLength-60)/45,lane:Math.sin(i*.9+seed)*5.4,type:i%11===7?'repair':i%6===3?'nitro':'coin',lap:-1,botLaps:{},taken:[]}));
  this.opponents=mode==='time'?[]:Array.from({length:5},(_,i)=>({...vehicleState(-8-i*7,(i%3-1)*4),id:i,car:{...car},finish:null,nearLap:-1,targetLane:(i%3-1)*4,decision:0}));
 }
 get laps(){return this.mode==='sprint'?1:3}
 get rank(){return 1+this.opponents.filter(r=>this.finishTime===null?r.finish!==null||r.progress>this.progress:r.finish!==null&&r.finish<this.finishTime).length}
 notify(text){this.event=text;this.eventTime=2.1}
 crash(strength=1){if(!['racing','recovering'].includes(this.status))return;if(impactVehicle(this,strength)){this.events.push({type:'crash',strength});this.notify('IMPACT · '+Math.round(100-this.health)+'% DAMAGE');if(this.rescue>0){this.status='recovering';this.notify('CREW RECOVERY · +5 SEC');}}}
 recover(){resetJump(this);this.health=70;this.speed=0;this.lane=0;this.yaw=0;this.lateral=0;this.time+=5;this.cooldown=2;this.rescue=0;this.status='racing';this.history=[];findClearSpawn(this,[this,...this.opponents],this.length,this.collisionFrame);this.notify('RECOVERED · 70% CONDITION · +5 SEC');this.events.push({type:'respawn'});}
 resetCar(){if(!['racing','recovering'].includes(this.status))return;resetJump(this);this.speed=0;this.lane=0;this.yaw=0;this.lateral=0;this.time+=3;this.cooldown=2;this.rescue=0;this.health=Math.max(50,this.health);this.status='racing';this.history=[];findClearSpawn(this,[this,...this.opponents],this.length,this.collisionFrame);this.notify('RESPAWN · '+Math.round(100-this.health)+'% DAMAGE · +3 SEC');this.events.push({type:'respawn'});}
 rewind(){if(this.rewindUsed||this.status!=='racing'||this.history.length<90)return false;const h=this.history[0];resetJump(this);Object.assign(this,{progress:h.progress,lane:h.lane,speed:h.speed,yaw:h.yaw,health:Math.max(this.health,h.health),lateral:0,cooldown:2});findClearSpawn(this,[this,...this.opponents],this.length,this.collisionFrame);this.rewindUsed=true;this.history=[];this.time+=3;this.notify('SECOND CHANCE · +3 SEC');this.events.push({type:'rewind'});return true}
 curvatureAt(source,progress){return typeof source==='function'?source(progress):source;}
 botInput(r,curve){
  const hard=this.difficulty==='hard',easy=this.difficulty==='easy',skill=easy?.88:hard?1:.985;
  const upcoming=this.curvatureAt(this.curveSource??curve,r.progress+30),all=[this,...this.opponents].filter(b=>b!==r);
  const nearby=all.filter(b=>Math.abs(b.progress-r.progress)<40&&Math.abs((b.height||0)-r.height)<2.3);
  const ahead=nearby.filter(b=>b.progress>r.progress&&Math.abs(b.lane-r.lane)<3).sort((a,b)=>a.progress-b.progress)[0];
  r.decision-=1/60;
  if(r.decision<=0){
   r.decision=easy?.3:hard?.1:.16;
   let preferred=clamp(upcoming*160,-2.8,2.8);
   const ramp=this.ramps.find(a=>{const gap=(a.progress-(r.progress%this.length)+this.length)%this.length;return gap>8&&gap<55;});
   if(ramp&&r.id%3!==1)preferred=ramp.lane;
   const candidates=[-6.4,-3.2,0,3.2,6.4,preferred];
   const score=lane=>{let n=Math.abs(lane-r.lane)*.18+Math.abs(lane-preferred)*.6;for(const b of nearby){const gap=b.progress-r.progress,d=Math.abs(lane-b.lane);if(gap>-6&&gap<30&&d<3.1)n+=(30-Math.max(0,gap))*(3.1-d)*1.4;}return n;};
   r.targetLane=candidates.sort((a,b)=>score(a)-score(b))[0];
  }
  const bend=Math.max(Math.abs(curve),Math.abs(upcoming)),target=r.car.speed*skill*(1-clamp(bend*(hard?4:easy?9:6),0,hard?.1:.15));
  const leader=Math.max(this.progress,...this.opponents.map(b=>b.progress)),gapToLead=leader-r.progress;
  const straight=bend<.014,clear=!ahead||ahead.progress-r.progress>10||Math.abs(r.targetLane-ahead.lane)>3;
  if(this.time>(r.aiBoostUntil||0)&&this.time>(r.aiBoostReady||0)&&straight&&clear&&r.nitro>30&&r.heat<45&&r.speed>r.car.speed*.45){
   if(gapToLead>4||r.progress%this.length>this.length-150||((r.progress/110+r.id)%4<1.5)){r.aiBoostUntil=this.time+(hard?2.2:easy?1.3:1.8);r.aiBoostReady=r.aiBoostUntil+1.4;}
  }
  const boost=this.time<(r.aiBoostUntil||0)&&clear&&r.nitro>2&&!r.overheated;
  const blocked=ahead&&ahead.progress-r.progress<12&&r.speed-ahead.speed>4;
  const turn=clamp((r.targetLane-r.lane)*.19-r.lateral*.085,-.68,.68);
  return {throttle:!r.rescue&&!blocked&&r.speed<target+(boost?19:1),brake:!!blocked||r.speed>target+7&&!boost,turn,boost,drift:hard&&bend>.008&&Math.abs(turn)>.4&&r.nitro<75};
 }
 handleBoundary(r){const limit=roadLimit(r.car,r.yaw);if(Math.abs(r.lane)<=limit)return;r.lane=clamp(r.lane,-limit,limit);if(r===this)this.crash(.7);else impactVehicle(r,.7);r.lateral=-Math.sign(r.lane)*Math.max(.7,Math.abs(r.lateral)*.15);r.yaw=-Math.sign(r.lane)*.015;}
 step(dt,input,curvature=0){
  this.events=[];if(this.status==='finished'||this.status==='paused')return;
  if(this.status==='countdown'){this.countdown-=dt;if(this.countdown<=0){this.status='racing';this.notify('GO!')}return;}
  this.curveSource=curvature;this.time+=dt;this.eventTime=Math.max(0,this.eventTime-dt);
  const oldProgress=this.progress,wasRecovering=this.status==='recovering',all=[this,...this.opponents];
  for(const r of all)r.draft=0;
  if(wasRecovering){this.rescue-=dt;if(this.rescue<=0)this.recover();}else{
   driveVehicle(this,dt,input,this.curvatureAt(curvature,this.progress),this.car,this.grip,this.assist);this.handleBoundary(this);
  }
  for(const r of this.opponents){
   if(r.finish!==null){r.speed=Math.max(0,r.speed-dt*6);r.progress+=r.speed*dt;continue;}
   const c=this.curvatureAt(curvature,r.progress);
   driveVehicle(r,dt,this.botInput(r,c),c,r.car,this.grip,true);this.handleBoundary(r);
  }
  for(const r of all){const event=updateJump(r,dt,this.ramps,this.length);if(event&&r===this){this.events.push(event);if(event.type==='jump')this.notify('AIRBORNE!');else {this.coins+=20;this.notify('CLEAN LANDING · '+Math.round(event.distance)+'m · +20 COINS');}}}
  resolveVehicleContacts(all,this.length,this.collisionFrame,(a,b,strength)=>{
   const gap=b.progress-a.progress,side=b.lane-a.lane;
   const closing=Math.abs(gap)>Math.abs(side)?Math.abs(a.speed-b.speed):Math.abs(a.lateral-b.lateral);
   if(closing>1&&a.cooldown<=0&&b.cooldown<=0){
    if(a===this)this.crash(strength);else if(impactVehicle(a,strength))this.events.push({type:'botCrash',id:a.id,strength});
    if(impactVehicle(b,strength))this.events.push({type:'botCrash',id:b.id,strength});
   }
   if(Math.abs(gap)>Math.abs(side)){
    const follower=gap>0?a:b,leader=gap>0?b:a;
    if(follower.speed>leader.speed){const average=(follower.speed+leader.speed)*.5;follower.speed=average;leader.speed=Math.min(average,(leader.car.speed+18*leader.car.nitro)*1.025);}
   }else{a.lateral*=.6;b.lateral*=.6;}
  });
  for(const a of all)for(const b of all){if(a===b)continue;const gap=b.progress-a.progress;if(a.speed>10&&!a.airborne&&gap>6&&gap<26&&Math.abs(b.lane-a.lane)<2.5){a.draft=1;a.nitro=Math.min(100,a.nitro+6*dt);break;}}
  if(this.drifting&&!this.airborne){this.combo+=dt;this.drift+=this.speed*dt*(1+Math.min(this.combo/3,3));}else this.combo=Math.max(0,this.combo-dt*2);
  this.maxSpeed=Math.max(this.maxSpeed,this.speed);
  for(const r of this.opponents){const gap=r.progress-this.progress,lap=Math.floor(this.progress/this.length);if(gap<0&&gap>-2.5&&Math.abs(r.lane-this.lane)>2.1&&Math.abs(r.lane-this.lane)<3.5&&r.nearLap!==lap){r.nearLap=lap;this.nearMisses++;this.coins+=10;this.notify('CLEAN OVERTAKE +10');}if(r.progress>=this.length*this.laps&&r.finish===null){r.finish=this.time;r.boosting=false;}}
  const lap=Math.floor(this.progress/this.length);if(lap>this.lastLap&&lap<this.laps){this.lastLap=lap;this.notify(lap===this.laps-1?'FINAL LAP':'LAP '+(lap+1));this.coins+=25;}
  for(const p of this.pickups){
   const pl=Math.floor(oldProgress/this.length),at=p.progress+pl*this.length;
   if(pl>=0&&!p.taken.includes(pl)&&oldProgress<=at+1&&this.progress>=at-1&&Math.abs(this.lane-p.lane)<1.8&&this.height<1.5){p.lap=pl;p.taken.push(pl);if(p.type==='coin'){this.coins+=10;this.events.push({type:'coin'});}else if(p.type==='repair'){this.health=Math.min(100,this.health+28);this.notify('ROAD REPAIR · '+Math.round(this.health)+'% CONDITION');}else{this.nitro=Math.min(100,this.nitro+35);this.notify('NITRO REFILL +35');}}
   for(const r of this.opponents){const bl=Math.floor(r.progress/this.length);if(p.botLaps[r.id]!==bl&&Math.abs(r.progress-(p.progress+bl*this.length))<1&&Math.abs(r.lane-p.lane)<1.8&&r.height<1.5){p.botLaps[r.id]=bl;if(p.type==='repair')r.health=Math.min(100,r.health+28);if(p.type==='nitro')r.nitro=Math.min(100,r.nitro+35);}}
  }
  this.historyTimer+=dt;if(this.historyTimer>=1/30){this.historyTimer=0;this.history.push({progress:this.progress,lane:this.lane,speed:this.speed,yaw:this.yaw,health:this.health});if(this.history.length>150)this.history.shift();}
  if(this.progress>=this.length*this.laps){this.progress=this.length*this.laps;this.finishTime=this.time;this.status='finished';this.boosting=false;}
 }
}
export function settleRace(save,race,trackId){if(race.settled||race.status!=='finished')return null;race.settled=true;const base=race.mode==='time'?180:[500,350,260,210,170,140][race.rank-1];const clean=race.crashes===0?100:0,driftBonus=Math.min(180,Math.floor(race.drift/80)),reward=base+race.coins+clean+driftBonus;save.coins+=reward;save.races++;if(race.rank===1&&race.mode!=='time')save.wins++;const key=trackId+'-'+race.mode+'-'+race.car.id;const best=!save.best[key]||race.time<save.best[key];if(best)save.best[key]=race.time;return {reward,base,clean,driftBonus,collected:race.coins,best,key}}
