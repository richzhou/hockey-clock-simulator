(function(root){
'use strict';
class HockeyConsole {
 constructor(){this.reset();}
 reset(){this.handheldConnected=this.handheldConnected??false;this.timeKeysLocked=this.handheldConnected;this.handheldOn=false;this.powered=true;this.resumeRunning=false;this.startupProfile='reference-card';this.unsupportedFeature='';this.fractionalMs=0;this.showTimeout=false;this.time=1200000;this.period=1;this.running=false;this.penaltiesOn=true;this.allowPenaltyPause=true;this.autoHorn=true;this.tenths=true;this.up=false;this.home={score:0,shots:0,goal:false,penalties:[]};this.guest={score:0,shots:0,goal:false,penalties:[]};this.mode='idle';this.buffer='';this.set=false;this.selected=null;this.timeout=null;this.hornEvent=0;this.message='READY';}
 idle(message='READY'){this.mode='idle';this.buffer='';this.set=false;this.message=message;}
 entry(mode,message){this.mode=mode;this.buffer='';this.message=message;}
 unsupported(message){this.idle();this.unsupportedFeature=message;}
 parseTime(maxMinutes){const s=this.buffer.padEnd(4,'0');const m=Number(s.slice(0,2)),sec=Number(s.slice(2,4)),t=Number(s[4]||0);return sec<60&&m<=maxMinutes?(m*60+sec)*1000+t*100:null;}
 display(){
 if(this.mode==='idle'&&this.showTimeout&&this.timeout!==null)return 'TIME OUT '+(this.timeout<0?'+':'')+formatTime(Math.abs(this.timeout));
 if(this.mode==='idle')return this.message==='READY'?formatControlTime(this.time)+' '+(this.up?'UP':'DN'):this.message;
 if((this.mode==='time'&&this.message.startsWith('INVALID'))||(this.mode==='penalty-time'&&this.message.startsWith('USE ')))return this.message;
 if(this.mode==='time'||this.mode==='penalty-time'){const mask=this.mode==='time'?'MMSSs':'MMSS';const chars=Array.from(mask,(letter,i)=>this.buffer[i]||letter);return (this.mode==='time'?'SET ':'PEN ')+chars.slice(0,2).join('')+':'+chars.slice(2,4).join('')+(this.mode==='time'?'.'+chars[4]:'');}
 if(this.mode==='period')return 'PERIOD '+this.period;
 if(this.mode==='player')return this.team[0].toUpperCase()+'.PLAYER # '+this.buffer.padEnd(2,'_');
 if(this.mode==='add')return this.team.toUpperCase()+' '+this.field.toUpperCase()+' '+this[this.team][this.field]+'+';
 return this.message+(this.buffer?' '+this.buffer:'');
 }
 connectHandheld(connected){this.handheldConnected=!!connected;if(connected)this.timeKeysLocked=true;}
 press(key,source='console'){
 this.unsupportedFeature='';
 if(source==='handheld'){if(!this.handheldConnected)return;if(key==='time-on'||key==='time-off'){const on=key==='time-on';if(this.handheldOn===on)return;this.handheldOn=on;}}
 if(key==='power-off'){if(this.powered){this.resumeRunning=this.running;this.running=false;this.powered=false;this.mode='off';this.buffer='';this.set=false;this.message='';}return;}
 if(key==='power-on'){if(!this.powered){this.powered=true;this.timeKeysLocked=this.handheldConnected;this.entry('startup-resume','START WHERE TURNED OFF LAST?');}return;}
 if(!this.powered)return;
 if(this.mode.startsWith('startup-')){if(/^\d$/.test(key)&&(this.mode==='startup-model'||this.mode==='startup-resume')){if(this.mode==='startup-resume')this.entry('startup-model','ENTER MODEL CODE');this.buffer+=key;if(this.buffer.length===3){if(this.buffer==='871'){const profile=this.startupProfile,handheldOn=this.handheldOn;this.reset();this.handheldOn=handheldOn;this.startupProfile=profile;this.time=0;this.period=0;if(profile==='reference-card')this.entry('startup-shot','USE SHOT CLOCK? Y/N');else this.entry('startup-pause','USE PENALTY TIME OUT? Y/N');}else{this.buffer='';this.message='ENTER MODEL 871';}}}else if(key==='yes'||key==='no'){const yes=key==='yes';if(this.mode==='startup-resume'){if(yes){this.running=this.resumeRunning;this.idle();}else this.entry('startup-model','ENTER MODEL CODE');}else if(this.mode==='startup-shot'){if(yes)this.unsupportedFeature='Accessory shot clocks are outside this practice tool. Choose NO to continue this reference-card exercise.';else this.entry('startup-pause','USE PENALTY TIME OUT? Y/N');}else if(this.mode==='startup-pause'){this.allowPenaltyPause=yes;this.penaltiesOn=true;this.idle();}}return;}
 if((key==='time-on'||key==='time-off')&&source!=='handheld'&&this.timeKeysLocked){this.unsupportedFeature=this.handheldConnected?'Use the handheld rocker to start and stop time. The console TIME keys are inactive while it is connected.':'To enable the console TIME keys, turn power off, unplug the handheld switch, then restart the console.';return;}
 if(key==='time-on'){this.running=this.up||this.time>0;this.timeout=null;this.showTimeout=false;this.idle();return;}
 if(key==='time-off'){this.running=false;this.idle();return;}
 if(key==='set'){this.set=true;this.mode='set';this.message='SELECT FUNCTION';this.buffer='';return;}
 if(/^\d$/.test(key)){this.digit(key);return;}
 if(key==='yes'||key==='no'){this.answer(key==='yes');return;}
 if(key==='horn'&&source==='handheld'){this.hornEvent++;return;}
 const direct=this.set;this.set=false;
 if(key==='time'){if(direct)this.entry('time','SET MM:SS.s');else{if(this.timeout!==null)this.showTimeout=!this.showTimeout;this.idle();}return;}
 if(key==='horn'){if(direct)this.entry('autoHorn','AUTO HORN? Y/N');else this.hornEvent++;return;}
 if(key==='penalty-toggle'){if(this.allowPenaltyPause)this.penaltiesOn=!this.penaltiesOn;this.idle(this.penaltiesOn?'PENALTY TIME ON':'PENALTY TIME OFF');return;}
 if(key==='options'){if(direct)this.unsupported('Advanced settings are outside this practice tool. Penalty time out is selected at startup. Choose the startup exercise to practice that setting.');else this.idle((this.up?'COUNT UP':'COUNT DOWN')+' / AUTO HORN '+(this.autoHorn?'ON':'OFF')+' / PENALTY TIME OUT '+(this.allowPenaltyPause?'ON':'OFF'));return;}
 if(key==='chronometer'){if(direct)this.unsupported('Chronometer setup is outside this practice tool. CHRONOMETER by itself displays local time; TIME returns to the main clock.');else{this.mode='chronometer';this.message='TIME OF DAY';}return;}
 if(key==='timeout-start'){if(direct){this.unsupported('Programming timeout timers is outside this practice tool. To practice the default 30-second timer, press TIME OUT START, then 0.');return;}this.entry('timeout-number','TIMER # (0-9)?');return;}
 if(key==='timeout-clear'){if(this.timeout!==null&&this.timeout>10000){this.timeout=10000;this.timeoutWarned=true;this.hornEvent++;}else{this.timeout=null;this.showTimeout=false;this.idle();}return;}
 const teamKey=key.match(/^(home|guest)-(score|shots|goal|penalty)$/);
 if(teamKey){this.team=teamKey[1];const what=teamKey[2];if(what==='goal'){this[this.team].goal=!this[this.team].goal;this.idle(this.team.toUpperCase()+' GOAL '+(this[this.team].goal?'ON':'OFF'));return;}
 if(what==='penalty'){if(direct){this.penaltyAction='add';this.entry('penalty-time','PEN MM:SS');}else{const list=this[this.team].penalties;const index=this.mode==='view-penalty'&&this.selected?.team===this.team?(this.selected.index+1)%Math.max(list.length,1):0;this.selected={team:this.team,index};if(list.length){this.mode='view-penalty';this.message=this.penaltyDisplay();}else this.idle('NO '+this.team.toUpperCase()+' PENALTIES');}return;}
 this.field=what;this.entry(direct?'direct':'add',this.team.toUpperCase()+' '+what.toUpperCase()+(direct?' SET':' +'));return;}
 if(key==='misc'||key==='blank'){this.unsupported(key==='misc'?'Accessory shot clocks are outside this practice tool.':'The blank key has no documented operation in this training scope.');return;}
 if(key.startsWith('penalty-')){if(this.mode!=='view-penalty'||!this.selected){this.idle('SELECT A PENALTY');return;}this.penaltyAction=key.slice(8);this.entry('penalty-confirm',this.penaltyAction.toUpperCase()+'? Y/N');return;}
 this.idle();
 }
 activePenalties(team){const active=[],players=new Set();for(const penalty of team.penalties){if(players.has(penalty.player))continue;active.push(penalty);players.add(penalty.player);if(active.length===2)break;}return active;}
 penaltyDisplay(){const p=this[this.selected.team].penalties[this.selected.index];return p?this.selected.team[0].toUpperCase()+' '+(this.selected.index+1)+' '+formatTime(p.time)+' #'+p.player:'NO PENALTIES';}
 digit(d){
 if(this.mode==='add'){this[this.team][this.field]=Math.min(this.field==='score'?199:99,this[this.team][this.field]+Number(d));this.message=this.team.toUpperCase()+' '+this.field.toUpperCase()+' +';return;}
 if(this.mode==='period'){this.period=Number(d);this.idle();return;}
 if(this.mode==='timeout-number'){if(d!=='0'){this.idle('TIMER '+d+' NOT SET');return;}this.timeout=30000;this.timeoutWarned=false;this.showTimeout=true;this.idle('TIME OUT');return;}
 const limits={time:5,'penalty-time':4,player:2,direct:this.field==='score'?3:2};const limit=limits[this.mode];if(!limit)return;if(this.buffer.length>=limit)return;this.buffer+=d;
 if(this.mode==='player'&&this.buffer.length===2)this.answer(true);
 }
 answer(yes){
 if(this.mode==='autoHorn'){this.autoHorn=yes;this.idle();return;}
 if(!yes){if(this.mode==='time'&&this.buffer){this.buffer=this.buffer.slice(0,-1);this.message='SET MM:SS.s';return;}this.idle('CANCELED');return;}
 if(this.mode==='time'){const value=this.parseTime(99);if(value===null){this.buffer='';this.message='INVALID MM:SS.s';return;}this.time=value;this.entry('period','PERIOD (0–9)');return;}
 if(this.mode==='direct'){const n=Number(this.buffer||0),max=this.field==='score'?199:99;if(n>max){this.buffer='';this.message='MAX '+max;return;}this[this.team][this.field]=n;this.idle();return;}
 if(this.mode==='penalty-confirm'){if(this.penaltyAction==='clear'){this[this.selected.team].penalties.splice(this.selected.index,1);this.idle('PENALTY CLEARED');return;}this.team=this.selected.team;this.entry('penalty-time','PEN MM:SS');return;}
 if(this.mode==='penalty-time'){const value=this.parseTime(19);if(value===null||value<=0){this.buffer='';this.message='USE 00:01–19:59';return;}this.pendingTime=value;if(this.penaltyAction==='edit'){const p=this[this.team].penalties[this.selected.index];if(p)p.time=value;this.idle('PENALTY EDITED');}else this.entry('player',this.team[0].toUpperCase()+'.PLAYER # (00–99)');return;}
 if(this.mode==='player'){const p={player:Number(this.buffer||0),time:this.pendingTime};const list=this[this.team].penalties;if(this.penaltyAction==='insert')list.splice(this.selected.index,0,p);else list.push(p);this.idle('PENALTY ADDED');return;}
 this.idle();
 }
 tick(ms){
 if(!this.powered||this.mode.startsWith('startup-')||!Number.isFinite(ms)||ms<0)return;
 const totalMs=ms+this.fractionalMs;ms=Math.floor(totalMs);this.fractionalMs=totalMs-ms;if(ms===0)return;
 if(this.timeout!==null){const before=this.timeout;this.timeout-=ms;if(!this.timeoutWarned&&before>10000&&this.timeout<=10000){this.timeoutWarned=true;this.hornEvent++;}if(before>0&&this.timeout<=0)this.hornEvent++;}
 if(!this.running)return;
 const elapsed=this.up?ms:Math.min(ms,this.time);this.time=this.up?Math.min(5999900,this.time+elapsed):Math.max(0,this.time-elapsed);
 if(this.penaltiesOn)for(const team of [this.home,this.guest]){let remaining=elapsed;while(remaining>0&&team.penalties.length){const active=this.activePenalties(team);const step=Math.min(remaining,...active.map(p=>p.time));for(const p of active)p.time=Math.max(0,p.time-step);team.penalties=team.penalties.filter(p=>p.time>0);remaining-=step;if(step===0)break;}}
 if(!this.up&&this.time===0){this.running=false;if(this.autoHorn)this.hornEvent++;this.message='END OF PERIOD';}
 if(this.mode==='view-penalty')this.message=this.penaltyDisplay();
 }
}
function formatTime(ms,tenths=false){const total=Math.ceil(Math.max(0,ms)/1000),m=Math.floor(total/60),s=total%60;if(tenths&&ms<60000){const ticks=Math.floor(Math.max(0,ms)/100);return Math.floor(ticks/10).toString().padStart(2,'0')+'.'+ticks%10;}return m.toString().padStart(2,'0')+':'+s.toString().padStart(2,'0');}
function formatControlTime(ms){const ticks=Math.floor(Math.max(0,ms)/100);return Math.floor(ticks/600)+':'+String(Math.floor(ticks/10)%60).padStart(2,'0')+'.'+ticks%10;}
if(typeof module!=='undefined')module.exports={HockeyConsole,formatTime};else{root.HockeyConsole=HockeyConsole;root.formatTime=formatTime;}
})(typeof window==='undefined'?globalThis:window);
