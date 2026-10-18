const {test}=require('node:test');const assert=require('node:assert/strict');
const {MPC7Console}=require('./dist/mpc7.js');const {PracticeSession}=require('./dist/walkthroughs.js');const {tasks}=require('./dist/mpc7-walkthroughs.js');
function keys(g,...seq){for(const k of seq.flat())g.press(k);}
for(const [id,task]of Object.entries(tasks))test('MPC-7 walkthrough: '+task.title,()=>{
 const g=new MPC7Console(),practice=new PracticeSession(tasks);g.connectHandheld(true);practice.start(id,g);
 for(const [index,step]of task.steps.entries()){
  if(step.wait){g.tick(step.waitMs);practice.observe(g);}
  else for(const k of step.keys){g.press(k,k.startsWith('time-')?'handheld':'console');practice.record(k,g);assert.equal(practice.feedback,'',id+': '+k);}
  assert.equal(practice.stepIndex,index+1,id+': '+index);
 }
 assert.equal(practice.completed,true);
});
test('MPC-7 time autoaccepts five digits, NO cancels whole entry, period is separate',()=>{const g=new MPC7Console();keys(g,'set','time','1','2','3','4','5');assert.equal(g.time,754500);assert.equal(g.mode,'idle');keys(g,'set','time','0','9','no');assert.equal(g.time,754500);assert.equal(g.mode,'idle');keys(g,'period','2');assert.equal(g.period,2);});
test('MPC-7 score additions require selecting score for each addition; goal reset is independent',()=>{const g=new MPC7Console();keys(g,'home-score','1','1');assert.equal(g.home.score,1);assert.equal(g.display(),'1 Score 0');assert.equal(g.home.goal,true);keys(g,'goal-reset');assert.equal(g.home.goal,false);assert.equal(g.home.score,1);});
test('MPC-7 edit YES keeps player and time, clear is immediate and insertion remains ordered',()=>{const g=new MPC7Console();keys(g,'home-new-minor','0','7','yes','home-new-major','1','8','yes');keys(g,'home-penalty','penalty-edit','yes','yes');assert.deepEqual(g.home.penalties,[{player:7,time:120000},{player:18,time:300000}]);keys(g,'home-penalty','penalty-clear');assert.deepEqual(g.home.penalties,[{player:18,time:300000}]);keys(g,'home-penalty','penalty-insert','1','2','1','3','0');assert.deepEqual(g.home.penalties.map(p=>p.player),[12,18]);});
test('MPC-7 rejects invalid seconds without creating a penalty; NO cancels',()=>{const g=new MPC7Console();keys(g,'guest-new-minor','1','2','2','6','0');assert.equal(g.guest.penalties.length,0);assert.match(g.unsupportedFeature,/0:01/);keys(g,'no');assert.equal(g.mode,'idle');});
test('MPC-7 queues a same-player penalty until its predecessor expires',()=>{const g=new MPC7Console();g.home.penalties=[{player:7,time:1000},{player:7,time:120000},{player:18,time:90000}];keys(g,'time-on');g.tick(2000);assert.deepEqual(g.home.penalties,[{player:7,time:119000},{player:18,time:88000}]);});
test('MPC-7 maximum 20 penalties and paused timeout restriction',()=>{const g=new MPC7Console();g.home.penalties=Array.from({length:20},(_,player)=>({player,time:120000}));keys(g,'home-new-minor');assert.match(g.unsupportedFeature,/20/);keys(g,'time-on','timeout-start');assert.equal(g.timeout,null);assert.equal(g.mode,'idle');});
test('MPC-7 handheld retains physical switch edge and interlock through power restart',()=>{const g=new MPC7Console();g.connectHandheld(true);keys(g,'time-on');assert.equal(g.running,false);g.time=1000;g.press('time-on','handheld');g.tick(1000);keys(g,'set','time','2','0','yes');g.press('time-on','handheld');assert.equal(g.running,false);g.press('time-off','handheld');g.press('time-on','handheld');assert.equal(g.running,true);keys(g,'power-off');g.connectHandheld(false);keys(g,'power-on','time-on');assert.equal(g.running,true);});

test('MPC-7 penalty options accept existing defaults and custom durations; unrelated setup is identified',()=>{const g=new MPC7Console();keys(g,...Array(14).fill('options'),'yes','options','yes','yes');assert.equal(g.minorTime,120000);keys(g,...Array(14).fill('options'),'yes','options','yes','1','3','0');assert.equal(g.minorTime,90000);keys(g,'guest-new-minor','0','7','yes');assert.equal(g.guest.penalties[0].time,90000);keys(g,'set','timeout-start');assert.match(g.unsupportedFeature,/outside/);keys(g,'time');assert.match(g.unsupportedFeature,/Auxiliary/);});

test('MPC-7 stat result stays on operator display and TIME returns to the main clock',()=>{const g=new MPC7Console();keys(g,'guest-shots','1');assert.equal(g.display(),'0 Shots 1');keys(g,'time');assert.equal(g.message,'READY');assert.equal(g.unsupportedFeature,'');keys(g,'set','home-score','2','yes');assert.equal(g.display(),'2 Score 0');});
