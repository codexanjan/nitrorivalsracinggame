// Original procedural soundtrack and effects. No network audio or copyrighted tracks.
export class RacingAudio{
 init(){
  if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});return;}
  const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;
  try{this.ctx=new Context();}catch{return;}
  const c=this.ctx;this.master=c.createGain();this.master.gain.value=.32;const limiter=c.createDynamicsCompressor();limiter.threshold.value=-18;limiter.ratio.value=4;this.master.connect(limiter);limiter.connect(c.destination);
  this.musicBus=c.createGain();this.musicBus.gain.value=.3;this.musicBus.connect(this.master);
  this.engine=c.createOscillator();this.engine.type='sawtooth';this.engine.frequency.value=60;this.filter=c.createBiquadFilter();this.filter.type='lowpass';this.filter.frequency.value=500;this.engineGain=c.createGain();this.engineGain.gain.value=0;this.engine.connect(this.filter);this.filter.connect(this.engineGain);this.engineGain.connect(this.master);this.engine.start();
  this.sub=c.createOscillator();this.sub.type='sine';this.sub.frequency.value=40;this.subGain=c.createGain();this.subGain.gain.value=0;this.sub.connect(this.subGain);this.subGain.connect(this.master);this.sub.start();
  this.noiseBuffer=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const data=this.noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.55;
  this.wind=this.loopNoise('lowpass',900);this.jet=this.loopNoise('bandpass',1800);this.tires=this.loopNoise('highpass',1200);this.nextBeat=c.currentTime+.03;this.step=0;this.previousBoost=false;this.enabled=true;this.nextWarning=0;
 }
 loopNoise(type,frequency){const c=this.ctx,source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();source.buffer=this.noiseBuffer;source.loop=true;filter.type=type;filter.frequency.value=frequency;gain.gain.value=0;source.connect(filter);filter.connect(gain);gain.connect(this.master);source.start();return {source,filter,gain};}
 tone(frequency,duration=.15,gain=.15,type='sine',when=this.ctx?.currentTime,bus=this.master,endFrequency=null){
  if(!this.ctx||!this.enabled)return;const c=this.ctx,o=c.createOscillator(),g=c.createGain(),t=Math.max(c.currentTime,when??c.currentTime);o.type=type;o.frequency.setValueAtTime(frequency,t);if(endFrequency)o.frequency.exponentialRampToValueAtTime(endFrequency,t+duration);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(bus);o.start(t);o.stop(t+duration+.02);o.onended=()=>{o.disconnect();g.disconnect();};
 }
 burst(duration=.2,gain=.35,type='lowpass',frequency=1000,when=this.ctx?.currentTime,bus=this.master){
  if(!this.ctx||!this.enabled)return;const c=this.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),t=Math.max(c.currentTime,when??c.currentTime);s.buffer=this.noiseBuffer;f.type=type;f.frequency.value=frequency;g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);s.connect(f);f.connect(g);g.connect(bus);s.start(t);s.stop(t+duration+.02);s.onended=()=>{s.disconnect();f.disconnect();g.disconnect();};
 }
 music(scene,track){
  const c=this.ctx;if(this.nextBeat<c.currentTime-.25)this.nextBeat=c.currentTime+.02;
  // Sixteenth-note synth pulse: four original minor chords, bass, kick and hats.
  const interval=60/(scene==='race'?124:108)/4,roots=track===1?[45,48,41,43]:track===2?[50,46,53,48]:[45,41,48,43];
  const hz=n=>440*Math.pow(2,(n-69)/12);
  while(this.nextBeat<c.currentTime+.14){const t=this.nextBeat,k=this.step%16,root=roots[Math.floor(this.step/16)%4];
   if(k%4===0)this.tone(125,.15,.48,'sine',t,this.musicBus,42);
   if(k===4||k===12){this.burst(.1,.19,'highpass',1600,t,this.musicBus);this.tone(185,.085,.1,'triangle',t,this.musicBus,100);}
   if(k%2===0)this.burst(.033,k%4===2?.11:.065,'highpass',6000,t,this.musicBus);
   if(k%2===0)this.tone(hz(root+(k===10?7:0)),interval*1.65,.18,'triangle',t,this.musicBus);
   if(k%2===1){const notes=[0,7,12,3,7,15,12,7],note=root+24+notes[(k-1)/2];this.tone(hz(note),interval*1.5,scene==='race'?.085:.065,'triangle',t,this.musicBus);}
   if(k===0)for(const n of[0,3,7])this.tone(hz(root+12+n),interval*14,.028,'sine',t,this.musicBus);
   this.step++;this.nextBeat+=interval;
  }
 }
 update(r,{page='landing',enabled=true,music=true,track=0,hidden=false}={}){
  if(!this.ctx)return;this.enabled=enabled;const c=this.ctx,t=c.currentTime,active=page==='race'&&r&&['racing','countdown'].includes(r.status),paused=hidden||page==='race'&&r?.status==='paused';
  this.master.gain.setTargetAtTime(enabled&&!hidden?.32:0,t,.05);this.musicBus.gain.setTargetAtTime(music&&!paused?.3:0,t,.08);
  const speed=Math.abs(r?.speed||0);this.engineGain.gain.setTargetAtTime(active?.1+speed*.001:0,t,.07);this.subGain.gain.setTargetAtTime(active?.07:0,t,.08);
  if(active){const rpm=55+(speed%12)*9+Math.floor(speed/12)*8;this.engine.frequency.setTargetAtTime(rpm,t,.1);this.sub.frequency.setTargetAtTime(rpm*.48,t,.1);this.filter.frequency.setTargetAtTime(300+speed*20,t,.1);}
  this.wind.gain.gain.setTargetAtTime(active?speed*.00065+(r.airborne?.1:0):0,t,.08);this.wind.filter.frequency.setTargetAtTime(400+speed*24,t,.1);
  this.jet.gain.gain.setTargetAtTime(active&&r.boosting?.22:0,t,.035);this.tires.gain.gain.setTargetAtTime(active&&r.drifting&&!r.airborne?.2:0,t,.05);
  if(enabled&&music&&!paused)this.music(active?'race':'menu',track);
  if(r!==this.lastRace){this.lastRace=r;this.lastCount=-1;this.previousBoost=false;this.lastGear=1;}
  if(active){
   const count=r.status==='countdown'?Math.ceil(r.countdown):0;if(count!==this.lastCount&&r.time<.1){this.tone(count?550:1100,count?.1:.25,.19,'square');this.lastCount=count;}
   if(r.boosting&&!this.previousBoost)this.tone(240,.25,.16,'sine',t,this.master,1000);this.previousBoost=r.boosting;
   const gear=Math.min(6,1+Math.floor(speed/12));if(gear!==this.lastGear&&r.speed>0)this.burst(.045,.09,'bandpass',700);this.lastGear=gear;
   if(r.reversing&&t>this.nextWarning){this.tone(650,.09,.065);this.nextWarning=t+.85;}
   else if(r.health<25&&t>this.nextWarning){this.tone(420,.12,.11);this.nextWarning=t+2.2;}
  }
 }
 hit(){this.burst(.25,.6,'lowpass',1800);this.tone(110,.23,.4,'triangle',this.ctx?.currentTime,this.master,28);this.tone(2400,.08,.055,'square');}
 coin(){this.tone(1046,.08,.14);if(this.ctx)this.tone(1568,.1,.12,'sine',this.ctx.currentTime+.06);}
 jump(){this.tone(270,.25,.15,'sine',this.ctx?.currentTime,this.master,740);this.burst(.2,.12,'bandpass',1900);}
 land(){this.tone(95,.16,.28,'sine',this.ctx?.currentTime,this.master,38);this.burst(.18,.22,'lowpass',500);}
 victory(){if(!this.ctx)return;const t=this.ctx.currentTime;[523,659,784,1046,784,1046].forEach((n,i)=>this.tone(n,i===5?.8:.25,.22,'triangle',t+i*.19));this.burst(.75,.16,'bandpass',900,t+.6);}
 silence(){if(this.ctx)this.master.gain.setTargetAtTime(0,this.ctx.currentTime,.025);}
}
