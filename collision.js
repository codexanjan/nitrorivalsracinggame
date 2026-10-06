// Solid oriented vehicle bounds. Contact separation is independent of damage cooldown.
export function vehicleBounds(car={}){
 return {halfLength:car.type==='muscle'?2.83:car.type==='hyper'?2.8:2.58,halfWidth:car.type==='hyper'?1.47:car.type==='muscle'?1.42:1.35};
}
export function roadLimit(car,yaw=0){const b=vehicleBounds(car);return 10-b.halfWidth*Math.abs(Math.cos(yaw))-b.halfLength*Math.abs(Math.sin(yaw))-.12;}
function pose(r,frame){
 const f=frame?frame(r.progress):{p:{x:r.progress,z:0},d:{x:1,z:0},n:{x:0,z:1}};
 const c=Math.cos(r.yaw||0),s=Math.sin(r.yaw||0),bounds=vehicleBounds(r.car);
 return {x:f.p.x+f.n.x*r.lane,z:f.p.z+f.n.z*r.lane,dx:f.d.x,dz:f.d.z,nx:f.n.x,nz:f.n.z,
  fx:f.d.x*c+f.n.x*s,fz:f.d.z*c+f.n.z*s,sx:f.n.x*c-f.d.x*s,sz:f.n.z*c-f.d.z*s,...bounds};
}
export function vehicleContact(a,b,frame){
 // Pitch lifts a nose or tail into the other car's space. Only clear a jump
 // when the complete car, including its wheels, clears the roof below.
 const vertical=r=>{const pitch=r.pitch||0,h=r.height||0,l=vehicleBounds(r.car).halfLength;return {min:h+.02*Math.cos(pitch)-l*Math.abs(Math.sin(pitch)),max:h+1.65*Math.cos(pitch)+l*Math.abs(Math.sin(pitch))};};
 const va=vertical(a),vb=vertical(b);if(va.min>vb.max+.12||vb.min>va.max+.12)return null;
 const A=pose(a,frame),B=pose(b,frame),x=B.x-A.x,z=B.z-A.z;
 if(x*x+z*z>55)return null;
 let overlap=Infinity,ax=0,az=0;
 for(const [nx,nz] of [[A.fx,A.fz],[A.sx,A.sz],[B.fx,B.fz],[B.sx,B.sz]]){
  const extent=p=>Math.abs(nx*p.fx+nz*p.fz)*p.halfLength+Math.abs(nx*p.sx+nz*p.sz)*p.halfWidth;
  const d=x*nx+z*nz,o=extent(A)+extent(B)+.12-Math.abs(d);
  if(o<=.0001)return null;
  if(o<overlap){overlap=o;const sign=d<0?-1:1;ax=nx*sign;az=nz*sign;}
 }
 return {overlap,ax,az,A,B};
}
function move(r,p,dx,dz){
 const limit=roadLimit(r.car,r.yaw||0),before=r.lane;
 r.lane=Math.max(-limit,Math.min(limit,r.lane+dx*p.nx+dz*p.nz));
 r.progress+=dx*p.dx+dz*p.dz;
 return r.lane-before;
}
export function resolveVehicleContacts(racers,length,frame,onImpact){
 const impacted=new Set(),changed=new Set();
 // Iterative resolution also handles a full grid piled against a barrier.
 for(let iteration=0;iteration<24;iteration++){
  let contacts=0;
  for(let i=0;i<racers.length;i++)for(let j=i+1;j<racers.length;j++){
   const a=racers[i],b=racers[j];
   let gap=b.progress-a.progress;if(length)gap=((gap+length/2)%length+length)%length-length/2;
   if(Math.abs(gap)>8)continue;
   const hit=vehicleContact(a,b,frame);if(!hit)continue;contacts++;
   const key=i+':'+j;
   if(onImpact&&!impacted.has(key)){impacted.add(key);onImpact(a,b,Math.min(1.2,.35+Math.abs(a.speed-b.speed)/35));}
   // Solid bodies remain separable during recovery and after crossing the finish.
   const amount=hit.overlap+.004,shareA=.5,shareB=.5;
   const beforeA=a.lane,beforeB=b.lane;
   move(a,hit.A,-hit.ax*amount*shareA,-hit.az*amount*shareA);
   move(b,hit.B,hit.ax*amount*shareB,hit.az*amount*shareB);
   // If a side wall prevents the minimum displacement, separate along the road instead.
   const remain=vehicleContact(a,b,frame);
   if(remain&&Math.abs(hit.ax*hit.A.nx+hit.az*hit.A.nz)>.65&&
      (Math.abs(a.lane-beforeA)<amount*shareA*.5||Math.abs(b.lane-beforeB)<amount*shareB*.5)){
    const distance=hit.A.halfLength+hit.B.halfLength+.2-Math.abs(gap),sign=gap<0?-1:1;
    if(distance>0){a.progress-=sign*distance*shareA;b.progress+=sign*distance*shareB;}
   }
   changed.add(a);changed.add(b);
  }
  if(!contacts)break;
 }
 return changed;
}
export function findClearSpawn(r,racers,length,frame){
 const old=r.progress;
 for(let back=0;back<=48;back+=6)for(const lane of [0,-4,4,-7,7]){
  const probe={...r,progress:old-back,lane,yaw:0};
  if(racers.every(b=>b===r||!vehicleContact(probe,b,frame))){r.progress=probe.progress;r.lane=lane;return;}
 }
 r.progress=old-54;r.lane=0;
}
