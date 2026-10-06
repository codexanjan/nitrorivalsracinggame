// Metres and seconds: every racer uses the same ramp, launch, and landing rules.
export function resetJump(r){Object.assign(r,{height:0,verticalSpeed:0,airborne:false,airTime:0,jumpDistance:0,pitch:0,rampId:null});}
export function updateJump(r,dt,ramps,length){
 if(r.rescue>0){resetJump(r);return null;}
 if(r.airborne){
  r.airTime+=dt;r.jumpDistance+=Math.abs(r.speed)*dt;r.verticalSpeed-=15*dt;
  r.height+=r.verticalSpeed*dt;r.pitch=Math.max(-.2,Math.min(.18,-r.verticalSpeed/Math.max(20,r.speed)*.6));
  if(r.height<=0){const distance=r.jumpDistance;r.height=0;r.verticalSpeed=0;r.airborne=false;r.pitch=0;r.jumps=(r.jumps||0)+1;r.longestJump=Math.max(r.longestJump||0,distance);return {type:'landing',distance};}
  return null;
 }
 const p=((r.progress%length)+length)%length;
 const ramp=ramps.find(a=>p>=a.progress&&p<=a.progress+a.length&&Math.abs(r.lane-a.lane)<=a.width/2-.5);
 if(ramp){r.height=ramp.height*(p-ramp.progress)/ramp.length;r.pitch=-Math.atan2(ramp.height,ramp.length);r.rampId=ramp.id;r.verticalSpeed=0;}
 else if(r.rampId!==null){
  const previous=ramps.find(a=>a.id===r.rampId),offEnd=previous&&p>=previous.progress+previous.length&&p<previous.progress+previous.length+5;
  r.airborne=true;r.airTime=0;r.jumpDistance=0;r.verticalSpeed=offEnd&&r.speed>12?4.8+r.speed*.055:0;r.rampId=null;
  if(r.height<.02){resetJump(r);return null;}
  return {type:'jump'};
 }else{r.height=0;r.pitch=0;}
 return null;
}
