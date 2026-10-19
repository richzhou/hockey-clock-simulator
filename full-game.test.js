const {test}=require('node:test'),assert=require('node:assert/strict');
const {HockeyConsole}=require('./dist/engine'),{MPC7Console}=require('./dist/mpc7'),{FullGameSession}=require('./dist/full-game');
for(const model of ['871','mpc7'])for(const assisted of [true,false])test(model+' complete continuous game '+(assisted?'assisted':'unassisted'),()=>{
 const g=model==='871'?new HockeyConsole():new MPC7Console();g.connectHandheld(true);const p=new FullGameSession(model,assisted);p.start('full-game',g);let count=0,carry1=false,carry2=false,concurrent=false,breaks=0;
 while(!p.completed&&count++<200){const step=p.current;if(step.title==='Start warm-up')assert.equal(g.time,300000);if(step.title==='Start the intermission')assert.equal(g.time,60000);if(step.wait){const before=g.time,pen=g.guest.penalties[0]?.time;p.skip(g);if(!g.penaltiesOn&&pen){assert.equal(g.guest.penalties[0].time,pen);breaks++;}assert(g.time<=before);}
 else {for(const key of step.keys){g.press(key,key.startsWith('time-')?'handheld':'console');p.record(key,g);assert.equal(p.failed,false,p.feedback+' at '+step.title);} }
 if(g.period===1&&g.time===0&&g.guest.penalties[0]?.time===80000)carry1=true;
 if(g.period===2&&g.time===0&&g.home.penalties[0]?.time===90000&&g.guest.penalties[0]?.time===90000)carry2=true;
 if(g.home.penalties.length===2&&g.home.penalties.every(x=>x.time===120000))concurrent=true;
 }
 assert.equal(p.completed,true);assert(carry1&&carry2&&concurrent);assert.equal(breaks,2);assert.equal(g.home.score,3);assert.equal(g.guest.score,1);assert.equal(g.period,3);assert.equal(g.time,0);assert.equal(g.running,false);assert.equal(g.home.penalties.length+g.guest.penalties.length,0);
});
test('unassisted help is event-scoped; wrong key preserves progress and permits continuation',()=>{
 const g=new HockeyConsole(),p=new FullGameSession('871',false);p.start('full-game',g);assert.equal(p.guidance,false);p.requestHelp();assert.equal(p.guidance,true);assert.equal(p.helpRequests,1);
 for(const key of p.current.keys){g.press(key);p.record(key,g);}assert.equal(p.guidance,false);assert.equal(p.stepIndex,1);
 g.press('home-score');p.record('home-score',g);assert.equal(p.failed,false);assert.match(p.feedback,/You pressed HOME SCORE.*TIME ON/);assert.equal(p.stepIndex,1);assert.equal(g.time,300000);assert.equal(g.mode,'idle');assert.equal(p.mistakes,1);g.press('time-on');p.record('time-on',g);assert.equal(p.current.wait,true);assert.equal(p.feedback,'');
});
test('training freezes at cues; skip uses penalty ticking and cannot skip clock actions',()=>{
 const g=new HockeyConsole(),p=new FullGameSession('871');g.connectHandheld(true);p.start('full-game',g);p.skip(g);assert.equal(p.stepIndex,0);
 while(!p.current.wait){for(const key of [...p.current.keys]){g.press(key,key.startsWith('time-')?'handheld':'console');p.record(key,g);}}
 p.tick(g,10000000);assert.equal(g.time,0);assert.equal(p.current.wait,undefined);const step=p.stepIndex;p.tick(g,10000);assert.equal(p.stepIndex,step);assert.equal(g.time,0);
});

test('unassisted 871 accepts TIME to finish score entry',()=>{
 const g=new HockeyConsole(),p=new FullGameSession('871',false);g.connectHandheld(true);p.start('full-game',g);
 while(p.current.title!=='Record the home goal'){if(p.current.wait)p.skip(g);else for(const key of [...p.current.keys]){g.press(key,key.startsWith('time-')?'handheld':'console');p.record(key,g);}}
 for(const key of ['home-score','1','time']){g.press(key);p.record(key,g);}assert.equal(p.failed,false);assert.equal(p.current.title,'Resume period 1');assert.equal(p.mistakes,0);
});
test('fractional real-time progression lands on the cue without spending extra penalty time',()=>{
 const g=new HockeyConsole(),p=new FullGameSession('871');g.connectHandheld(true);p.start('full-game',g);
 while(!(p.current.wait&&p.current.cue.startsWith('Period 1 ends'))){if(p.current.wait)p.skip(g);else for(const key of [...p.current.keys]){g.press(key,key.startsWith('time-')?'handheld':'console');p.record(key,g);}}
 for(let n=0;n<1000&&p.current.wait;n++)p.tick(g,63.7);
 assert.equal(g.time,0);assert.equal(g.guest.penalties[0].time,80000);p.tick(g,100000);assert.equal(g.guest.penalties[0].time,80000);
});

for(const model of ['871','mpc7'])for(const assisted of [true,false])test(model+' wrong digit restores partial entry and keeps current event '+assisted,()=>{
 const g=model==='871'?new HockeyConsole():new MPC7Console(),p=new FullGameSession(model,assisted);p.start('full-game',g);
 for(const key of ['set','time','0']){g.press(key);p.record(key,g);}const snapshot=JSON.stringify(g);g.press('9');p.record('9',g);assert.equal(JSON.stringify(g),snapshot);assert.equal(p.keyIndex,3);assert.equal(p.failed,false);assert.equal(p.expected,'5');assert.match(p.feedback,/You pressed 9.*Press 5/);assert.equal(p.guidance,true);
 for(const key of [...p.current.keys].slice(p.keyIndex)){g.press(key);p.record(key,g);}assert.equal(g.time,300000);assert.equal(p.stepIndex,1);assert.equal(p.feedback,'');
});
test('wrong key during play preserves the elapsed clock and active penalties',()=>{
 const g=new HockeyConsole(),p=new FullGameSession('871');g.connectHandheld(true);p.start('full-game',g);
 while(!(p.current.wait&&p.current.cue.startsWith('Period 1 ends'))){if(p.current.wait)p.skip(g);else for(const key of [...p.current.keys]){g.press(key,key.startsWith('time-')?'handheld':'console');p.record(key,g);}}
 p.tick(g,10000);const snapshot=JSON.stringify(g);p.beforePress(g);g.press('penalty-toggle');p.record('penalty-toggle',g);assert.equal(JSON.stringify(g),snapshot);assert.equal(p.failed,false);assert.match(p.feedback,/PENALTY ON\/OFF/);p.skip(g);assert.equal(g.guest.penalties[0].time,80000);
});

test('wrong new-penalty key removes transient entry fields as well as restoring the display',()=>{
 const g=new MPC7Console(),p=new FullGameSession('mpc7');p.start('full-game',g);const before=JSON.stringify(g);p.beforePress(g);g.press('home-new-minor');p.record('home-new-minor',g);assert.equal(JSON.stringify(g),before);assert.equal(p.expected,'set');assert.equal(p.failed,false);
});
