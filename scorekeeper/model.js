(function(root){
'use strict';
const roster=[{n:4,name:'Avery'},{n:7,name:'Blake'},{n:9,name:'Casey'},{n:12,name:'Drew'},{n:16,name:'Ellis'},{n:18,name:'Finley'}];
const clone=x=>JSON.parse(JSON.stringify(x));
function initial(){return {stage:'login',ready:{home:false,away:false,staff:false,officials:false},staff:{scorekeeper:'',timekeeper:''},periods:[15,15,15],entry:'remaining',events:[],nextId:1,goalies:{home:1,away:1},notes:'',shots:{home:0,away:0},checked:[],signatures:{},actualStart:'18:00',actualEnd:'19:10'};}
function timeSeconds(value){if(!/^\d{1,2}:\d{2}$/.test(value||''))throw Error('Use minutes and seconds, for example 12:34.');const [m,s]=value.split(':').map(Number);if(s>59)throw Error('Seconds must be between 00 and 59.');return m*60+s;}
function validTime(s,p,t){if(!Number.isInteger(Number(p))||p<1||p>3)throw Error('Choose period 1, 2 or 3.');if(timeSeconds(t)>s.periods[p-1]*60)throw Error('That time is longer than the selected period. Check the arena clock.');}
function validPlayer(n){return roster.some(p=>p.n===Number(n));}
function score(s,team){return s.events.filter(e=>e.type==='goal'&&e.team===team).length;}
function apply(state,a){const s=clone(state);const v=a.data||{};const team=a.team||v.team;
 const needLive=()=>{if(s.stage!=='live')throw Error('Start the practice game before recording an event.');};
 switch(a.type){
 case 'login':if(v.game!=='DEMO-1001'||v.hcr!=='DEMO-HOME')throw Error('Use the displayed demo game and roster numbers. Never enter real credentials here.');s.stage='pregame';break;
 case 'roster':if(!['home','away'].includes(team))throw Error('Choose a team.');if(!v.confirmed)throw Error('Confirm the demo roster after checking it.');s.ready[team]=true;break;
 case 'staff':if(!v.scorekeeper?.trim()||!v.timekeeper?.trim())throw Error('Enter fictional volunteer names for both roles.');s.staff=v;s.ready.staff=true;break;
 case 'officials':if(!v.confirmed)throw Error('Confirm the demo officials are present.');s.ready.officials=true;break;
 case 'start':if(!Object.values(s.ready).every(Boolean))throw Error('Complete all four pregame checks first.');if(!v.periods||v.periods.length!==3||v.periods.some(x=>!Number.isInteger(Number(x))||x<1||x>30))throw Error('Set each period to a whole number of minutes from 1 to 30.');if(v.entry!=='remaining')throw Error('Choose Remaining Time, as shown in the PCAHA training.');s.periods=v.periods.map(Number);s.stage='live';break;
 case 'goal': case 'penalty': case 'goalie': {
 needLive();if(!['home','away'].includes(team))throw Error('Choose Home or Away.');validTime(s,v.period,v.time);
 if(a.type==='goal'){if(!validPlayer(v.scorer))throw Error('Choose the scorer first.');if(!Array.isArray(v.assists)||v.assists.length>2||v.assists.some(n=>!validPlayer(n))||new Set([v.scorer,...v.assists]).size!==v.assists.length+1)throw Error('Select up to two different assists. The scorer cannot assist their own goal.');}
 if(a.type==='penalty'){if(!validPlayer(v.player)&&v.player!=='BENCH'&&![1,30].includes(v.player))throw Error('Select the penalized player, goalie or bench.');if(!validPlayer(v.servedBy))throw Error('Select the player serving the penalty.');if(!['Holding','Tripping','Roughing','Slashing','Head contact (7.6)','Bench minor'].includes(v.infraction))throw Error('Select an infraction from the practice list.');if(![2,4,5].includes(Number(v.minutes)))throw Error('Select the assessed penalty length.');validTime(s,v.startPeriod||v.period,v.startTime||v.time);const off=(Number(v.period)-1)*100000-timeSeconds(v.time),start=(Number(v.startPeriod||v.period)-1)*100000-timeSeconds(v.startTime||v.time);if(start<off)throw Error('Penalty Start Time cannot be before Off Time. Check the period and remaining time.');}
 if(a.type==='goalie'&&![0,1,30].includes(Number(v.goalie)))throw Error('Choose a goalie or Pull.');
 const event={...v,type:a.type,team,id:v.id||s.nextId++};if(v.id){const i=s.events.findIndex(e=>e.id===v.id&&e.type===a.type);if(i<0)throw Error('That event is no longer available.');s.events[i]=event;}else s.events.push(event);if(a.type==='goalie')s.goalies[team]=Number(v.goalie);break;}
 case 'delete': {needLive();const event=s.events.find(e=>e.id===v.id);if(!event)throw Error('Choose an existing event.');if(!['goal','penalty'].includes(event.type))throw Error('Edit the goalie change instead.');s.events=s.events.filter(e=>e.id!==v.id);break;}
 case 'release':{needLive();const e=s.events.find(e=>e.id===v.id&&e.type==='penalty');if(!e)throw Error('Choose the correct penalty first.');validTime(s,v.period,v.time);const start=(Number(e.startPeriod||e.period)-1)*100000-timeSeconds(e.startTime||e.time);const end=(Number(v.period)-1)*100000-timeSeconds(v.time);if(end<start)throw Error('The release cannot be before the penalty starts.');e.end={period:Number(v.period),time:v.time};break;}
 case 'periods':needLive();if(!v.periods||v.periods.length!==3||v.periods.some(x=>!Number.isInteger(Number(x))||x<1||x>30))throw Error('Use whole minutes from 1 to 30 for each period.');for(const e of s.events){for(const [p,t] of [[e.period,e.time],[e.startPeriod,e.startTime],[e.end?.period,e.end?.time]])if(p&&t&&timeSeconds(t)>Number(v.periods[p-1])*60)throw Error('That period would be shorter than an existing event time. Correct the event first.');}s.periods=v.periods.map(Number);break;
 case 'notes':needLive();s.notes=String(v.notes||'').slice(0,2000);break;
 case 'shots':needLive();if(['home','away'].some(t=>!Number.isInteger(Number(v[t]))||Number(v[t])<score(s,t)||Number(v[t])>200))throw Error('Shots must be whole numbers, at least the goals scored, and no more than 200 in this exercise.');s.shots={home:Number(v.home),away:Number(v.away)};break;
 case 'check':needLive();if(!v.checked)throw Error('Compare the entries with the scratch sheet, then confirm the check.');s.checked.push(v.label||'Period checked');break;
 case 'begin-wrap':needLive();s.stage='sign';break;
 case 'sign':if(s.stage!=='sign')throw Error('Open End Game to begin the final checks.');if(!v.scorekeeper?.trim()||!v.timekeeper?.trim())throw Error('Enter fictional initials for both off-ice officials.');s.signatures={scorekeeper:v.scorekeeper,timekeeper:v.timekeeper};s.stage='review';break;
 case 'review':if(s.stage!=='review')throw Error('Complete sign-off before review.');if(!v.checked)throw Error('Compare the score, goals, penalties, goalies and scratch sheet before continuing.');s.stage='submit';break;
 case 'submit':if(s.stage!=='submit')throw Error('Review the practice scoresheet first.');if(!v.official?.trim())throw Error('Enter fictional official initials after the simulated review.');s.signatures.official=v.official;s.stage='sync';break;
 case 'sync':if(s.stage!=='sync')throw Error('Submit the practice sheet before simulating synchronization.');s.stage='finish';break;
 case 'finish':if(s.stage!=='finish')throw Error('Wait for the practice sync step before finishing.');s.stage='end';break;
 case 'end':if(s.stage!=='end')throw Error('Complete sign-off, review and the practice sync first.');validTime(s,v.period,v.time);if(!/^\d{2}:\d{2}$/.test(v.actualStart||'')||!/^\d{2}:\d{2}$/.test(v.actualEnd||''))throw Error('Enter actual start and end times.');for(const t of [v.actualStart,v.actualEnd]){const [h,m]=t.split(':').map(Number);if(h>23||m>59)throw Error('Use valid 24-hour start and end times.');}s.actualStart=v.actualStart;s.actualEnd=v.actualEnd;s.stage='complete';break;
 default:throw Error('Choose an available practice action.');}
 return s;}
const api={initial,apply,timeSeconds,validTime,score,roster,clone};if(typeof module!=='undefined')module.exports=api;root.Scorekeeper=api;
})(typeof globalThis!=='undefined'?globalThis:this);
