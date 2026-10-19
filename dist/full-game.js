(function(root){
'use strict';
function gameScenario(model){
 const m7=model==='mpc7',steps=[];
 const action=(title,cue,keys,check)=>steps.push({title,cue,instruction:keys.map(k=>k.replaceAll('-',' ').toUpperCase()).join(' → ')+'.',keys,check});
 const load=(minutes,period,title,cue)=>action(title,cue,['set','time',...String(minutes).padStart(2,'0'),'0','0','yes',...(m7?['period']:[]),String(period)],g=>g.time===minutes*60000&&g.period===period&&!g.running);
 const on=title=>action(title,title==='Start the intermission'?'Start the 1-minute break. Check PENALTY CLOCKS PAUSED before running the main clock.':'Faceoff / clock start. Run the clock.', ['time-on'],g=>g.running&&(title!=='Start the intermission'||!g.penaltiesOn));
 const stop=cue=>action('Stop the clock',cue,['time-off'],g=>!g.running&&!g.handheldOn);
 const wait=(target,cue)=>steps.push({title:'Play continues',cue,instruction:'Let the clock run, or choose Skip to next event. Stop it when the next whistle appears.',keys:[],wait:true,target,ready:g=>g.time<=target,check:g=>g.time===target});
 const goal=(team,total)=>action('Record the '+team+' goal',team.toUpperCase()+' scores. Record the goal; keep all penalties unless the official directs a removal.',[team+'-score','1',m7?'goal-reset':'yes'],g=>g[team].score===total&&(!m7||!g[team].goal));
 const penalty=(team,player)=>action('Enter '+team+' #'+String(player).padStart(2,'0'), 'Official: '+team.toUpperCase()+' #'+player+' receives a 2:00 minor. Display this penalty.',m7?[team+'-new-minor',...String(player).padStart(2,'0'),'yes']:['set',team+'-penalty','0','2','0','0','yes',...String(player).padStart(2,'0')],g=>g[team].penalties.some(p=>p.player===player&&p.time===120000));
 const pause=()=>action('Pause penalties for intermission','Press PENALTY ON/OFF. Check PENALTY CLOCKS PAUSED before running the 1-minute break. Keep all stored penalties.',['penalty-toggle'],g=>!g.penaltiesOn);
 const enable=()=>action('Resume penalty timing','Before the next faceoff, press PENALTY ON/OFF. Check PENALTY CLOCKS ON so stored penalties resume with play.',['penalty-toggle'],g=>g.penaltiesOn);
 const intermission=(next,carry)=>{stop('Period ended. Move the handheld OFF, then pause penalties before timing the break. '+carry);pause();load(1,0,'Set the intermission','Run a 1-minute break in period 0. Preserve all stored penalties.');on('Start the intermission');wait(0,'Intermission is running. Penalties must remain unchanged.');stop('Break ended. Move the switch OFF before setting the next period.');load(15,next,'Prepare period '+next,'Load 15:00 for period '+next+'. Keep the existing scores and penalties.');enable();on('Start period '+next);};
 load(5,0,'Prepare warm-up','Pregame: set a 5-minute warm-up in period 0. Scores start at 0–0.');on('Start warm-up');wait(0,'Warm-up is underway.');stop('Warm-up ended. Move the switch OFF.');load(15,1,'Prepare period 1','Set 15:00 for the first period.');on('Opening faceoff');
 wait(720000,'Period 1 is underway. Next event: 12:00.');stop('P1 12:00: whistle. HOME scores. Stop the clock.');goal('home',1);on('Resume period 1');
 wait(480000,'Play continues. Next whistle: P1 08:00.');stop('P1 08:00: two HOME players receive penalties. Stop the clock.');penalty('home',7);penalty('home',18);on('Run both home penalties');
 wait(360000,'HOME #7 and #18 serve together. At 06:00 both expire.');
 wait(40000,'Play continues. Next whistle: P1 00:40.');stop('P1 00:40: GUEST #12 receives a minor. Stop the clock.');penalty('guest',12);on('Play the final forty seconds');wait(0,'Period 1 ends with 1:20 remaining on GUEST #12.');
 intermission(2,'GUEST #12 carries 1:20 into period 2.');
 wait(820000,'GUEST #12 resumes from 1:20 and expires at P2 13:40.');
 wait(660000,'Play continues. Next whistle: P2 11:00.');stop('P2 11:00: whistle. GUEST scores.');goal('guest',1);on('Resume period 2');
 wait(480000,'Next whistle: P2 08:00.');stop('P2 08:00: two GUEST players receive minors.');penalty('guest',5);penalty('guest',18);on('Run the two guest penalties');
 wait(450000,'Next whistle: P2 07:30.');stop('P2 07:30: HOME scores. Official directs removal of GUEST #18 only.');goal('home',2);
 action('Select the penalty to remove','Official: clear GUEST #18, the second penalty. Keep GUEST #05.', ['guest-penalty','guest-penalty'],g=>g.guest.penalties[g.selected?.index]?.player===18);
 action('Clear only guest #18','Remove the displayed GUEST #18 penalty. GUEST #05 must remain at 1:30.', ['penalty-clear',...(m7?[]:['yes'])],g=>g.guest.penalties.length===1&&g.guest.penalties[0].player===5&&g.guest.penalties[0].time===90000);
 on('Resume after the goal');wait(360000,'GUEST #05 expires at P2 06:00.');wait(30000,'Next whistle: P2 00:30.');stop('P2 00:30: official directs one displayed minor on each team.');penalty('home',24);penalty('guest',9);on('Run penalties on both teams');wait(0,'Period 2 ends. HOME #24 and GUEST #09 each carry 1:30.');
 intermission(3,'Keep 1:30 on HOME #24 and GUEST #09.');wait(810000,'Both penalties resume from 1:30 and expire at P3 13:30.');wait(600000,'Next whistle: P3 10:00.');stop('P3 10:00: whistle. HOME scores.');goal('home',3);on('Resume the final period');wait(0,'Play out period 3. Final score should be HOME 3, GUEST 1.');stop('Final horn. Move the switch OFF. The game is over.');
 return {title:'Full game: warm-up and three periods',description:'One continuous game, including goals, two intermissions, concurrent penalties and carry-over penalties.',steps};
}
class FullGameSession {
 constructor(model,assisted=true){this.model=model;this.assisted=assisted;this.task=null;this.stepIndex=0;this.keyIndex=0;this.completed=false;this.failed=false;this.feedback='';this.helpShown=false;this.mistakeHelp=false;this.mistakes=0;this.helpRequests=0;this.results=[];}
 start(id,g){g.reset();g.allowPenaltyPause=true;g.time=0;g.period=0;this.task=gameScenario(this.model);this.id='full-game';this.stepIndex=0;this.keyIndex=0;this.completed=false;this.failed=false;this.feedback='';this.helpShown=false;this.mistakeHelp=false;this.mistakes=0;this.helpRequests=0;this.results=[];this.saveCheckpoint(g);this.beforePress(g);}
 get fullGame(){return true;}
 get current(){return this.task?.steps[this.stepIndex];}
 get expected(){return this.current?.keys[this.keyIndex];}
 get guidance(){return this.assisted||this.helpShown||this.mistakeHelp;}
 beforePress(g){this.inputCheckpoint=JSON.parse(JSON.stringify(g));}
 label(key,g){if(g.handheldConnected&&['time-on','time-off'].includes(key))return key==='time-on'?'HANDHELD ON':'HANDHELD OFF';const names={'penalty-toggle':'PENALTY ON/OFF','goal-reset':'GOAL LIGHT RESET','penalty-clear':this.model==='mpc7'?'CLEAR PENALTY':'PENALTY CLEAR'};if(this.model==='mpc7'&&['home-penalty','guest-penalty'].includes(key))return key.split('-')[0].toUpperCase()+' VIEW PENALTY';return names[key]||(key||'').replaceAll('-',' ').toUpperCase();}
 reject(key,g){if(this.inputCheckpoint){for(const field of Object.keys(g))if(!Object.hasOwn(this.inputCheckpoint,field))delete g[field];Object.assign(g,JSON.parse(JSON.stringify(this.inputCheckpoint)));}this.mistakes++;this.mistakeHelp=true;const next=this.current.wait?'Let play continue; use '+this.label('time-on',g)+' if stopped.':'Press '+this.label(this.expected,g)+' to continue.';this.feedback='You pressed '+this.label(key,g)+'. '+next+' Your previous entry is kept.';}
 saveCheckpoint(g){this.checkpoint=JSON.parse(JSON.stringify(g));}
 retry(g){const connected=g.handheldConnected;Object.assign(g,JSON.parse(JSON.stringify(this.checkpoint)));g.connectHandheld(connected);this.keyIndex=0;this.failed=false;this.feedback='';this.beforePress(g);}
 requestHelp(){if(!this.helpShown)this.helpRequests++;this.helpShown=true;}
 finish(g){if(!this.current.check(g)){this.mistakes++;this.failed=true;this.feedback='The console result needs correcting. Choose Retry event to restore this event without losing earlier game progress.';return;}this.results.push(this.current.title);this.stepIndex++;this.keyIndex=0;this.feedback='';this.helpShown=false;this.mistakeHelp=false;if(this.stepIndex===this.task.steps.length){this.completed=true;return;}this.saveCheckpoint(g);this.beforePress(g);}
 observe(g){if(this.task&&!this.completed&&!this.failed&&this.current.wait&&this.current.ready(g))this.finish(g);}
 record(key,g){if(!this.task||this.completed||this.failed)return;if(this.current.wait){if(key==='time-on'&&g.running){this.feedback='';this.mistakeHelp=false;this.beforePress(g);return;}if(key==='time-off'){this.feedback='Play is still underway. Resume the clock to reach the next event.';this.beforePress(g);return;}this.reject(key,g);return;}
  if(!this.assisted&&key==='time'&&this.expected==='yes'&&this.current.title.startsWith('Record the ')&&g.mode==='idle'&&this.current.check(g)){this.finish(g);return;}
  if(key!==this.expected){this.reject(key,g);return;}this.keyIndex++;this.feedback='';this.mistakeHelp=false;if(this.keyIndex===this.current.keys.length)this.finish(g);this.beforePress(g);
 }
 tick(g,ms){if(this.completed){g.tick(ms);return;}if(this.failed||!this.current?.wait)return;g.tick(Math.min(ms,Math.max(0,g.time-this.current.target)));this.observe(g);this.beforePress(g);}
 skip(g){if(this.failed||!this.current?.wait||!g.running)return;this.tick(g,Math.max(0,g.time-this.current.target));}
}
if(typeof module!=='undefined')module.exports={gameScenario,FullGameSession};else root.FullGameSession=FullGameSession;
})(typeof window==='undefined'?globalThis:window);
