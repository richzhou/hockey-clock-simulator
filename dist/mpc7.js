(function(root){
'use strict';
const Base=typeof module!=='undefined'?require('./engine.js').HockeyConsole:root.HockeyConsole;
class MPC7Console extends Base {
 reset(){super.reset();this.allowPenaltyPause=false;this.home.saves=0;this.guest.saves=0;this.minorTime=120000;this.majorTime=300000;this.optionIndex=-1;this.menu='';this.lastTimeout=1;this.timeoutTimes=[30000,120000,60000,30000,60000];}
 display(){
  if(this.mode==='idle'&&this.message==='READY')return this.clockText();
  if(this.mode==='m7-player')return (this.penaltyAction==='edit'?'Edit':'New')+' '+this.penTime(this.pendingTime)+' '+this.buffer.padEnd(2,'#')+'◄';
  if(this.mode==='m7-penalty-time')return (this.penaltyAction==='edit'?'Edit':'New')+' '+(this.buffer?this.buffer.padEnd(3,'0').replace(/^(.)/,'$1:'):this.penTime(this.pendingTime))+'◄ '+String(this.pendingPlayer).padStart(2,'0');
  if(this.mode==='time')return 'Time: '+this.buffer.padEnd(5,'#').replace(/^(..)(..)(.)$/,'$1:$2.$3')+'◄';
  if(this.mode==='period')return 'Period:'+this.period+'◄';
  if(this.mode==='profile')return '96-HOCKEY';
  return super.display();
 }
 clockText(){const ticks=Math.floor(Math.max(0,this.time)/100);return String(Math.floor(ticks/600)).padStart(2,'0')+':'+String(Math.floor(ticks/10)%60).padStart(2,'0')+'.'+ticks%10+(this.up?'▲':'▼')+' Per:'+this.period+(this.penaltiesOn?'P':'');}
 penTime(ms){return Math.floor(ms/60000)+':'+String(Math.floor(ms/1000)%60).padStart(2,'0');}
 beginPenalty(team,action,time){if(action!=='edit'&&this[team].penalties.length>=20){this.unsupported('The MPC-7 stores up to 20 penalties per team. Clear an existing penalty before adding another.');return;}this.team=team;this.penaltyAction=action;this.pendingTime=time;this.pendingPlayer=action==='edit'?this[team].penalties[this.selected.index].player:0;this.set=false;this.entry('m7-player','PLAYER ##');}
 press(key,source='console'){
  this.unsupportedFeature='';
  if(key==='power-off')return super.press(key,source);
  if(key==='power-on'){if(!this.powered){this.powered=true;this.timeKeysLocked=this.handheldConnected;this.idle();}return;}
  if(!this.powered)return;
  if(source==='handheld'||key==='time-on'||key==='time-off')return super.press(key,source);
  if(key==='no'){this.menu='';this.idle();return;}
  if(key==='profiles'){this.entry('profile','96-HOCKEY');return;}
  if(this.mode==='profile'&&key==='yes'){const connected=this.handheldConnected,on=this.handheldOn;this.reset();this.handheldConnected=connected;this.timeKeysLocked=connected;this.handheldOn=on;this.time=0;return;}
  if(key==='time'&&!this.set&&this.mode==='idle'&&this.message==='READY'){this.unsupported('Auxiliary timers are outside this practice tool. Use SET then TIME to change the game clock.');return;}
  if(key==='period'){this.set=false;this.entry('period','Period:#');return;}
  if(key==='goal-reset'){this.home.goal=false;this.guest.goal=false;this.idle();return;}
  if(key==='options'){if(this.mode!=='m7-options'){this.optionIndex=-1;this.menu='';}this.set=false;if(this.menu==='penalties'){this.optionIndex=(this.optionIndex+1)%3;this.mode='m7-options';this.message=['Enable Button'+(this.allowPenaltyPause?'*':''),'Minor Pen '+this.penTime(this.minorTime),'Major Pen '+this.penTime(this.majorTime)][this.optionIndex];}else{const names=['Brightness:High','Team Names >>','Profiles >>','Main Time >>','Aux Time >>','Segment Timer >>','Time Out Timer >>','Swap Home&Guests','Aux Display >>','Horn Settings >>','Wireless >>','Model >>','Time of Day >>','Penalties >>','Interval Horn >>','Shot Clocks >>','HHS Function >>'];this.optionIndex=(this.optionIndex+1)%names.length;this.mode='m7-options';this.message=names[this.optionIndex];}this.buffer='';return;}
  if(this.mode==='m7-options'&&key==='yes'){if(this.menu==='penalties'){if(this.optionIndex===0){this.allowPenaltyPause=!this.allowPenaltyPause;this.message='Enable Button'+(this.allowPenaltyPause?'*':'');}else{this.pendingTime=this.optionIndex===1?this.minorTime:this.majorTime;this.entry('m7-default-penalty','Set '+(this.optionIndex===1?'minor':'major')+' M:SS');}}else if(this.message==='Penalties >>'){this.menu='penalties';this.optionIndex=0;this.message='Enable Button'+(this.allowPenaltyPause?'*':'');}else{this.unsupported('This options item is outside the hockey practice scope. Penalties options support enabling the pause key and setting minor and major durations.');this.menu='';}return;}
  if(key==='timeout-start'){if(this.set){this.set=false;this.unsupported('Programming timeout timers is outside this practice tool. Timer 1 is a 30-second sample.');return;}if(this.running)return;if(this.timeout!==null&&this.showTimeout){if(this.timeout>10000){this.timeout=10000;this.timeoutWarned=true;this.hornEvent++;}else{this.timeout=null;this.showTimeout=false;this.hornEvent++;this.idle();}}else if(this.timeout!==null){this.showTimeout=true;this.idle();}else this.entry('m7-timeout','Time Out: (1-5)');return;}
  const fresh=key.match(/^(home|guest)-new-(minor|major)$/);if(fresh){this.beginPenalty(fresh[1],'add',fresh[2]==='minor'?this.minorTime:this.majorTime);return;}
  if(key==='penalty-clear'||key==='penalty-edit'||key==='penalty-insert'){
   if(this.mode!=='view-penalty'||!this.selected||!this[this.selected.team].penalties[this.selected.index]){this.idle('SELECT A PENALTY');return;}
   if(key==='penalty-clear'){this[this.selected.team].penalties.splice(this.selected.index,1);this.idle();return;}
   const current=this[this.selected.team].penalties[this.selected.index];this.beginPenalty(this.selected.team,key==='penalty-edit'?'edit':'insert',key==='penalty-edit'?current.time:0);return;
  }
  if(/^\d$/.test(key))return this.digit(key);
  if(key==='yes')return this.answer(true);
  const saves=key.match(/^(home|guest)-saves$/);if(saves){this.team=saves[1];this.field='saves';const direct=this.set;this.set=false;this.entry(direct?'direct':'add',this.team.toUpperCase()+' SAVES');return;}
  if(key.endsWith('-penalty'))this.set=false; // VIEW PENALTY never creates an entry on this overlay.
  if(key==='horn'&&this.set){this.set=false;this.hornEvent++;return;}
  super.press(key,source);
 }
 digit(d){
  if(this.mode==='m7-player'){this.buffer+=d;if(this.buffer.length===2)this.answer(true);return;}
  if(this.mode==='m7-penalty-time'||this.mode==='m7-default-penalty'){this.buffer+=d;if(this.buffer.length===3)this.answer(true);return;}
  if(this.mode==='m7-timeout'){const n=Number(d);if(n<1||n>5)return;this.lastTimeout=n;this.timeout=this.timeoutTimes[n-1];this.timeoutWarned=false;this.showTimeout=true;this.idle();return;}
  const mode=this.mode;super.digit(d);
  if(mode==='add'){if(this.field==='score')this[this.team].goal=true;this.showStat();}
  if(mode==='time'&&this.buffer.length===5)this.answer(true);
  if(mode==='direct'&&this.buffer.length===(this.field==='score'?3:2))this.answer(true);
 }
 answer(yes){
  if(!yes){this.idle();return;}
  if(this.mode==='m7-player'){if(this.buffer)this.pendingPlayer=Number(this.buffer);this.entry('m7-penalty-time','PEN M:SS');return;}
  if(this.mode==='m7-penalty-time'||this.mode==='m7-default-penalty'){
   const entered=this.buffer.padEnd(3,'0'),seconds=Number(entered.slice(1)),value=this.buffer?(Number(entered[0])*60+seconds)*1000:this.pendingTime;
   if(seconds>=60||!value){this.buffer='';this.message='USE 0:01–9:59';this.unsupportedFeature='Enter a penalty from 0:01 to 9:59, in M SS order.';return;}
   if(this.mode==='m7-default-penalty'){if(this.optionIndex===1)this.minorTime=value;else this.majorTime=value;this.menu='';this.idle();return;}
   const list=this[this.team].penalties,p={player:this.pendingPlayer,time:value};if(this.penaltyAction==='edit')list[this.selected.index]=p;else if(this.penaltyAction==='insert')list.splice(this.selected.index,0,p);else list.push(p);this.idle();return;
  }
  if(this.mode==='time'){const value=this.parseTime(99);if(value===null){this.buffer='';this.unsupportedFeature='Enter seconds from 00 to 59.';return;}this.time=value;this.idle();return;}
  if(this.mode==='m7-timeout'){this.digit(String(this.lastTimeout));return;}
  const stat=this.mode==='direct';super.answer(true);if(stat&&this.mode==='idle')this.showStat();
 }
 showStat(){this.idle(this.home[this.field]+' '+({score:'Score',shots:'Shots',saves:'Saves'})[this.field]+' '+this.guest[this.field]);}
 tick(ms){super.tick(ms);if(this.timeout!==null&&this.timeout<=0){this.timeout=null;this.showTimeout=false;this.idle();}}
}
if(typeof module!=='undefined')module.exports={MPC7Console};else root.MPC7Console=MPC7Console;
})(typeof window==='undefined'?globalThis:window);
