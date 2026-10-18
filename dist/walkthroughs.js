(function(root){
'use strict';
const step=(title,instruction,keys,check)=>({title,instruction,keys,check});
const penalty=(player,time)=>({player,time});
const tasks={
 startup:{title:'Start a new game: power on and model 871',group:'Getting started',description:'Follow your quick-reference sheet: turn on the console, decline the last game, enter 871, and decline accessory shot clocks and penalty time out.',setup:g=>{g.press('power-off');},steps:[
 step('Turn the console on','Click the power switch on the console. The operator display asks whether to resume the last game.',['power-on'],g=>g.mode==='startup-resume'),
 step('Start a fresh game','Click NO to decline resuming the last game.',['no'],g=>g.mode==='startup-model'),
 step('Enter the hockey model code','Click 8 7 1 to select model code 871.',['8','7','1'],g=>g.mode==='startup-shot'),
 step('Decline accessory shot clocks','Click NO, as shown on your reference sheet.',['no'],g=>g.mode==='startup-pause'),
 step('Finish the reference-sheet setup','Click NO for penalty time out. This setting makes penalties follow the main clock. Other exercises that need a break clock load penalty pause enabled.',['no'],g=>g.mode==='idle'&&g.time===0&&!g.allowPenaltyPause)]},
 warmup:{title:'Set and run a warm-up',group:'Clock & periods',description:'Load a 3-minute warm-up and use period 0 to distinguish it from game play.',setup:g=>{g.time=0;g.period=0;},steps:[
 step('Open the clock setting','Click SET, then TIME.',['set','time'],g=>g.mode==='time'),
 step('Enter the warm-up length','Click 0 3 0 0, then YES for a three-minute warm-up. Use your arena’s required duration in a real game.',['0','3','0','0','yes'],g=>g.time===180000&&g.mode==='period'),
 step('Select warm-up period 0','Click 0. This is a warm-up, so the game’s first period has not started.',['0'],g=>g.period===0),
 step('Start the warm-up','Click the alternate time control switch to ON, or click TIME ON.',['time-on'],g=>g.running),
 step('Stop before setting up play','For this exercise, stop the warm-up early with the alternate switch or TIME OFF. You can now set the first period.',['time-off'],g=>!g.running&&g.period===0)]},
 time:{title:'Set the first period',group:'Clock & periods',description:'Prepare a 15-minute first period before the opening faceoff.',setup:g=>{g.time=0;g.period=0;},steps:[
 step('Select the game clock','SET selects direct entry. TIME opens the game clock setting.', ['set','time'],g=>g.mode==='time'),
 step('Enter 15 minutes','Enter minutes and seconds in order: 1 5 0 0. YES accepts the time.',['1','5','0','0','yes'],g=>g.time===900000&&g.mode==='period'),
 step('Choose the period','Press 1 for the first period. The clock stays stopped until play begins.',['1'],g=>g.period===1&&!g.running)]},
 play:{title:'Start play and stop at a whistle',group:'Clock & periods',description:'Practice starting the game clock at the faceoff and stopping it at a whistle.',setup:g=>{},steps:[
 step('Start at the faceoff','Click TIME ON. You can also click the alternate time control switch.',['time-on'],g=>g.running),
 step('Stop at the whistle','Let a little time pass, then click TIME OFF. The alternate switch also stops the clock.',['time-off'],g=>!g.running)]},
 next:{title:'Set the next period',group:'Clock & periods',description:'The first period has ended. Load 15 minutes for period 2.',setup:g=>{g.time=0;},steps:[
 step('Open the clock setting','Press SET, then TIME.',['set','time'],g=>g.mode==='time'),
 step('Load the next period’s time','Enter 1 5 0 0, then YES.',['1','5','0','0','yes'],g=>g.time===900000),
 step('Select period 2','Press 2. Setting the time does not automatically advance the period.',['2'],g=>g.period===2&&!g.running)]},
 score:{title:'Record a home goal',group:'Scores & shots',description:'Home has scored. Add one goal to its current score of 2.',setup:g=>{g.home.score=2;g.guest.score=1;},steps:[
 step('Select the home score','HOME SCORE opens add mode. The HOME GOAL button controls a light; it does not change the score.',['home-score'],g=>g.mode==='add'),
 step('Add one goal','Click 1 to increase home’s score from 2 to 3.',['1'],g=>g.home.score===3),
 step('Return to the clock','Press TIME to return the operator display to the main clock.',['time'],g=>g.mode==='idle')]},
 'score-correct':{title:'Correct an incorrect score',group:'Scores & shots',description:'Home’s score shows 3, but it should be 2. Replace the total.',setup:g=>{g.home.score=3;g.guest.score=1;},steps:[
 step('Choose direct score entry','Press SET before HOME SCORE to replace the score instead of adding to it.',['set','home-score'],g=>g.mode==='direct'),
 step('Enter the correct total','Click 2, then YES to accept home’s corrected score.',['2','yes'],g=>g.home.score===2&&g.guest.score===1)]},
 shots:{title:'Record a guest shot on goal',group:'Scores & shots',description:'Guest has 8 shots. Add one shot without changing its score.',setup:g=>{g.guest.shots=8;g.guest.score=1;},steps:[
 step('Select guest shots','GUEST SHOTS opens add mode for the shots total.',['guest-shots'],g=>g.mode==='add'),
 step('Add a shot','Click 1. Guest shots should increase from 8 to 9.',['1'],g=>g.guest.shots===9&&g.guest.score===1),
 step('Return to the clock','Press TIME to leave shots entry.',['time'],g=>g.mode==='idle')]},
 'shots-correct':{title:'Correct the shots total',group:'Scores & shots',description:'Home’s shots show 12. Correct the total to 11.',setup:g=>{g.home.shots=12;},steps:[
 step('Choose direct shots entry','Press SET, then HOME SHOTS.',['set','home-shots'],g=>g.mode==='direct'),
 step('Enter the correct total','Click 1 1, then YES.',['1','1','yes'],g=>g.home.shots===11)]},
 penalty:{title:'Add a guest minor penalty',group:'Penalties',description:'Guest player 12 receives a two-minute penalty while the clock is stopped.',setup:g=>{},steps:[
 step('Choose the penalized team','Press SET, then GUEST PENALTY to enter a new penalty.',['set','guest-penalty'],g=>g.mode==='penalty-time'),
 step('Enter the penalty length','For two minutes, click 0 2 0 0, then YES.',['0','2','0','0','yes'],g=>g.mode==='player'),
 step('Enter the player number','Click 1 2. A two-digit player number completes the penalty entry.',['1','2'],g=>g.guest.penalties.some(p=>p.player===12&&p.time===120000)),
 step('Start play','Click TIME ON. The main clock and the penalty now count together.',['time-on'],g=>g.running&&g.penaltiesOn)]},
 'penalty-home':{title:'Add a home minor penalty',group:'Penalties',description:'Home player 7 receives a two-minute penalty. Use a leading zero for the player number.',setup:g=>{},steps:[
 step('Choose home penalty entry','Press SET, then HOME PENALTY.',['set','home-penalty'],g=>g.mode==='penalty-time'),
 step('Enter two minutes','Click 0 2 0 0, then YES.',['0','2','0','0','yes'],g=>g.mode==='player'),
 step('Enter player 07','Click 0 7 to finish entering the penalty.',['0','7'],g=>g.home.penalties.some(p=>p.player===7&&p.time===120000))]},
 edit:{title:'Edit a penalty’s remaining time',group:'Penalties',description:'Guest player 12 has 2:00 showing. Correct the remaining penalty time to 1:30.',setup:g=>{g.guest.penalties=[penalty(12,120000)];},steps:[
 step('Select the penalty','Click GUEST PENALTY to recall the first penalty on that team’s list.',['guest-penalty'],g=>g.mode==='view-penalty'),
 step('Confirm the edit','Click PENALTY EDIT, then YES.',['penalty-edit','yes'],g=>g.mode==='penalty-time'),
 step('Enter the corrected time','Click 0 1 3 0, then YES. The player number stays the same.',['0','1','3','0','yes'],g=>g.guest.penalties[0]?.player===12&&g.guest.penalties[0]?.time===90000)]},
 clear:{title:'Clear one of two penalties: select player 18',group:'Penalties',description:'Guest players 12 and 18 have penalties. Cycle through the team’s penalties on the operator display, select player 18, and clear only that penalty. Player 12 must remain.',setup:g=>{g.guest.penalties=[penalty(12,90000),penalty(18,120000)];},steps:[
 step('Recall the first penalty','Click GUEST PENALTY once, without SET. The operator display shows penalty 1, player #12. This is not the player to clear.',['guest-penalty'],g=>g.mode==='view-penalty'&&g.guest.penalties[g.selected.index]?.player===12),
 step('Select the second penalty','Click GUEST PENALTY again. Each press recalls the next penalty; after the last, the list starts over. Check that the operator display now shows player #18.',['guest-penalty'],g=>g.mode==='view-penalty'&&g.guest.penalties[g.selected.index]?.player===18),
 step('Request removal of player 18','With #18 displayed, click PENALTY CLEAR. It acts on the displayed penalty, not both penalties.',['penalty-clear'],g=>g.mode==='penalty-confirm'&&g.guest.penalties[g.selected.index]?.player===18),
 step('Confirm and check the other penalty','Click YES. Player #18 is removed; player #12 must remain at 1:30. Use HOME PENALTY the same way when selecting a home penalty.',['yes'],g=>g.guest.penalties.length===1&&g.guest.penalties[0].player===12&&g.guest.penalties[0].time===90000)]},
 select:{title:'Select the second penalty to clear',group:'Penalties',description:'Guest players 12 and 18 have penalties. Clear player 18’s penalty and keep player 12’s.',setup:g=>{g.guest.penalties=[penalty(12,90000),penalty(18,120000)];},steps:[
 step('Recall the first penalty','Click GUEST PENALTY to display player 12’s penalty.',['guest-penalty'],g=>g.selected?.index===0),
 step('Move to the second penalty','Click GUEST PENALTY again to display player 18’s penalty.',['guest-penalty'],g=>g.selected?.index===1),
 step('Clear only the selected penalty','Click PENALTY CLEAR, then YES. Player 12’s penalty stays on the board.',['penalty-clear','yes'],g=>g.guest.penalties.length===1&&g.guest.penalties[0].player===12)]},
 break:{title:'Run an intermission and resume play',group:'Breaks & timeouts',description:'The period has ended with 1:30 left on a guest penalty. Run a 3-minute break without using up that penalty.',setup:g=>{g.time=0;g.guest.penalties=[penalty(12,90000)];},steps:[
 step('Pause the penalty clocks','Click PENALTY ON/OFF. Penalties must be paused before running the break clock.',['penalty-toggle'],g=>!g.penaltiesOn),
 step('Load a three-minute break','Click SET, TIME, 0 3 0 0, then YES.',['set','time','0','3','0','0','yes'],g=>g.time===180000),
 step('Mark the break as period 0','Click 0, then TIME ON to run the break. The guest penalty stays at 1:30.',['0','time-on'],g=>g.period===0&&g.running&&!g.penaltiesOn&&g.guest.penalties[0]?.time===90000),
 step('Stop the break clock','For this exercise, stop the break early with TIME OFF.',['time-off'],g=>!g.running),
 step('Prepare period 2','Click SET, TIME, 1 5 0 0, YES, then 2.',['set','time','1','5','0','0','yes','2'],g=>g.period===2&&g.time===900000),
 step('Enable penalty clocks again','Click PENALTY ON/OFF before play resumes.',['penalty-toggle'],g=>g.penaltiesOn),
 step('Resume the game','Click TIME ON. The guest penalty and the game clock now count together.',['time-on'],g=>g.running&&g.penaltiesOn)]},
 timeout:{title:'Run a 30-second timeout',group:'Breaks & timeouts',description:'With play stopped, run timeout timer 0, then return to the game clock.',setup:g=>{g.time=600000;},steps:[
 step('Choose a timeout timer','Click TIME OUT START to select a timer.',['timeout-start'],g=>g.mode==='timeout-number'),
 step('Start timer 0','Click 0. This timer runs for 30 seconds and gives a warning at 10 seconds.',['0'],g=>g.timeout===30000),
 step('Return to play','For this exercise, end the timeout early. TIME ON cancels the timeout and starts the game clock.',['time-on'],g=>g.timeout===null&&g.running)]}
};
tasks['startup-card']={...tasks.startup,title:'Start a new game: arena reference card',setup:g=>{g.startupProfile='reference-card';g.press('power-off');}};
tasks.startup={...tasks.startup,setup:g=>{g.startupProfile='manual';g.press('power-off');},title:'Start a new game: manufacturer manual',description:'Follow the manufacturer’s wired startup: turn on, decline the last game, enter model 871, and choose penalty time out. The arena reference-card variant is available as a separate task.',steps:tasks.startup.steps.filter((_,index)=>index!==3).map((item,index)=>index===2?{...item,check:g=>g.mode==='startup-pause'}:index===3?{...item,title:'Choose penalty time out',instruction:'Click NO for this exercise. Penalties then follow the main clock. Choose YES at startup when you need to pause penalty clocks during a period break.'}:item)};
Object.assign(tasks,{
 'guest-score':{title:'Record a guest goal',group:'Scores & shots',description:'Guest has scored. Add one goal to its current score of 1.',setup:g=>{g.home.score=2;g.guest.score=1;},steps:[
 step('Select the guest score','Click GUEST SCORE to enter add mode.',['guest-score'],g=>g.mode==='add'),
 step('Add one and confirm','Click 1, then YES to finish. The guest score becomes 2.',['1','yes'],g=>g.guest.score===2&&g.home.score===2&&g.mode==='idle')]},
 'clock-correct':{title:'Correct the game clock while it runs',group:'Clock & periods',description:'Practice the sheet’s time-setting sequence during play. Reset the clock to 18:30 while keeping period 1.',setup:g=>{g.time=1150000;},steps:[
 step('Run the game clock','Click TIME ON. The clock will keep running while you enter its correction.',['time-on'],g=>g.running),
 step('Open time correction','Click SET, then TIME.',['set','time'],g=>g.running&&g.mode==='time'),
 step('Enter the corrected time','Click 1 8 3 0, then YES.',['1','8','3','0','yes'],g=>g.running&&g.time===1110000&&g.mode==='period'),
 step('Keep period 1 and stop for review','Click 1, then TIME OFF. The clock is corrected and the period remains 1.',['1','time-off'],g=>g.period===1&&!g.running)]},
 concurrent:{title:'Run two penalties on the same team',group:'Concurrent penalties',description:'Home player 7 already has 2:00. Add a separate 2:00 penalty for home player 18, then run both clocks together.',setup:g=>{g.home.penalties=[penalty(7,120000)];},steps:[
 step('Add another home penalty','Click SET, then HOME PENALTY. This creates a separate entry; it does not edit player 7.',['set','home-penalty'],g=>g.mode==='penalty-time'),
 step('Enter the second penalty’s duration','Click 0 2 0 0, then YES.',['0','2','0','0','yes'],g=>g.mode==='player'),
 step('Identify the second player','Click 1 8. Both players should now appear with 2:00.',['1','8'],g=>g.home.penalties.length===2&&g.home.penalties.every(p=>p.time===120000)),
 step('Run both penalty clocks','Click TIME ON. The two home penalties count down together.',['time-on'],g=>g.running&&g.penaltiesOn),
 step('Stop both at a whistle','After watching both clocks count, click TIME OFF. Both penalties stop with the main clock.',['time-off'],g=>!g.running&&g.home.penalties.length===2&&g.home.penalties[0].time===g.home.penalties[1].time)]},
 'both-teams':{title:'Run penalties on both teams',group:'Concurrent penalties',description:'The officials have directed a penalty to be displayed for each team. Home player 7 has 2:00; add 2:00 for guest player 12. This exercise practices clock operation, not manpower rulings.',setup:g=>{g.home.penalties=[penalty(7,120000)];},steps:[
 step('Choose the guest team','Click SET, then GUEST PENALTY.',['set','guest-penalty'],g=>g.mode==='penalty-time'),
 step('Enter the guest penalty','Click 0 2 0 0, YES, then 1 2 for guest player 12.',['0','2','0','0','yes','1','2'],g=>g.home.penalties[0]?.player===7&&g.guest.penalties[0]?.player===12),
 step('Run the clocks together','Click TIME ON. The home and guest penalty clocks both follow the game clock.',['time-on'],g=>g.running&&g.penaltiesOn),
 step('Stop for a whistle','Click TIME OFF. Neither team’s penalty continues while play is stopped.',['time-off'],g=>!g.running&&g.home.penalties[0]?.time===g.guest.penalties[0]?.time)]},
 'clock-entry-correction':{title:'Correct a mistyped time with NO',group:'Clock & periods',description:'Practice backing up one digit with NO before accepting a time. The existing game clock stays unchanged until YES.',setup:g=>{},steps:[
 step('Open time entry','Click SET, then TIME.',['set','time'],g=>g.mode==='time'),
 step('Enter an intentional mistake','Click 1 9. For this exercise, the second digit is wrong; the target is 15:00.',['1','9'],g=>g.buffer==='19'&&g.time===1200000),
 step('Back up one digit','Click NO to erase the 9. NO backs up entered time digits; when no digits remain, NO cancels the entry.',['no'],g=>g.buffer==='1'&&g.mode==='time'),
 step('Complete the correct time','Click 5 0 0, then YES.',['5','0','0','yes'],g=>g.time===900000&&g.mode==='period'),
 step('Keep period 1','Click 1 to finish.',['1'],g=>g.period===1&&g.time===900000)]},
 queued:{title:'Enter more than two penalties: reference-card footnote',group:'Concurrent penalties',description:'Follow the footnote on your photo: enter every penalty, even when only two fit on the scoreboard. The next stored penalty appears as an older one expires.',setup:g=>{g.home.penalties=[penalty(7,5000),penalty(18,45000)];},steps:[
 step('Add a third penalty using the same entry sequence','Click SET, HOME PENALTY, 0 2 0 0, YES, then 2 4 for player 24. The scoreboard still shows only players 7 and 18.',['set','home-penalty','0','2','0','0','yes','2','4'],g=>g.home.penalties.length===3&&g.home.penalties[2].player===24),
 step('Recall the stored penalty on the console','Click HOME PENALTY three times. The console can recall player 24 even while only the first two appear on the scoreboard.',['home-penalty','home-penalty','home-penalty'],g=>g.home.penalties[g.selected.index]?.player===24),
 step('Start the clocks','Click the time control switch to ON, or TIME ON. Only the first two players’ penalties count initially.',['time-on'],g=>g.running&&g.home.penalties[2].time===120000),
 {...step('Watch the next stored penalty appear','Wait about five seconds. When player 7 expires, player 24 appears in the second scoreboard position and begins counting. If you stopped the clock early, click TIME ON.',[],g=>g.home.penalties.length===2&&g.home.penalties[1]?.player===24&&g.home.penalties[1].time<120000),wait:true,waitMs:7000,ready:g=>g.home.penalties.length===2&&g.home.penalties[1]?.player===24&&g.home.penalties[1].time<120000}]},
 powerplay:{title:'Record a power-play goal and clear the instructed penalty',group:'Penalties',description:'Home scores. In this prepared situation, the officials instruct you to remove guest player 12’s penalty. Guest player 18’s penalty must stay.',setup:g=>{g.home.score=2;g.guest.score=1;g.guest.penalties=[penalty(12,90000),penalty(18,240000)];},steps:[
 step('Record the goal','Click HOME SCORE, 1, then YES. Scoring does not automatically remove a penalty.',['home-score','1','yes'],g=>g.home.score===3&&g.guest.penalties.length===2),
 step('Check the instructed penalty','Click GUEST PENALTY. Verify that the display identifies player 12 before clearing.',['guest-penalty'],g=>g.guest.penalties[g.selected.index]?.player===12),
 step('Clear player 12’s penalty','Click PENALTY CLEAR, then YES. Only clear a penalty when instructed for the game situation.',['penalty-clear','yes'],g=>g.guest.penalties.length===1&&g.guest.penalties[0].player===18&&g.home.score===3)]},
 'cancel-clear':{title:'Cancel an accidental penalty-clear request',group:'Penalties',description:'You selected a penalty by mistake. Practice using NO before confirming its removal.',setup:g=>{g.guest.penalties=[penalty(12,90000)];},steps:[
 step('Recall the penalty','Click GUEST PENALTY.',['guest-penalty'],g=>g.mode==='view-penalty'),
 step('Open the clear confirmation','Click PENALTY CLEAR. The penalty is still present until you confirm.',['penalty-clear'],g=>g.mode==='penalty-confirm'&&g.guest.penalties.length===1),
 step('Cancel the removal','Click NO. Player 12’s penalty remains at 1:30.',['no'],g=>g.guest.penalties[0]?.player===12&&g.guest.penalties[0]?.time===90000)]},
 insert:{title:'Insert a missed penalty ahead of another',group:'Penalties',description:'Home player 18 is already listed. The officials instruct you to insert a missed 2:00 penalty for player 7 ahead of it.',setup:g=>{g.home.penalties=[penalty(18,90000)];},steps:[
 step('Select the entry to insert ahead of','Click HOME PENALTY to recall player 18.',['home-penalty'],g=>g.selected?.index===0),
 step('Confirm inserting a penalty','Click PENALTY INSERT, then YES.',['penalty-insert','yes'],g=>g.mode==='penalty-time'),
 step('Enter the missed penalty','Click 0 2 0 0, YES, then 0 7. The list should show player 7 followed by player 18.',['0','2','0','0','yes','0','7'],g=>g.home.penalties.length===2&&g.home.penalties[0].player===7&&g.home.penalties[1].player===18)]},
 carry:{title:'Carry a penalty across the period end',group:'Period breaks & carry-over penalties',description:'There are 10 seconds left in period 1 and 1:30 left on guest player 12’s penalty. Finish the period, preserve the remaining 1:20, and resume it in period 2.',setup:g=>{g.time=10000;g.guest.penalties=[penalty(12,90000)];},steps:[
 step('Run the final ten seconds','Click TIME ON. The penalty and game clock count together.',['time-on'],g=>g.running),
 {...step('Wait for the end-of-period horn','Let the final ten seconds finish. The game clock stops at zero and the penalty stops with 1:20 remaining. If you stopped the clock early, click TIME ON.','',g=>g.time===0&&!g.running&&g.guest.penalties[0]?.time===80000),keys:[],wait:true,waitMs:11000,ready:g=>g.time===0&&!g.running},
 step('Switch time control off after the horn','Click TIME OFF. Do not clear or re-enter the penalty. It remains stored for the next period.',['time-off'],g=>g.guest.penalties[0]?.time===80000),
 step('Set the next period’s time','Click SET, TIME, 1 5 0 0, then YES. Changing the main clock must leave the penalty at 1:20.',['set','time','1','5','0','0','yes'],g=>g.time===900000&&g.guest.penalties[0]?.time===80000),
 step('Select period 2','Click 2. Check that guest player 12 still has 1:20 before play resumes.',['2'],g=>g.period===2&&g.guest.penalties[0]?.time===80000),
 step('Resume both clocks','Click TIME ON. The penalty continues from 1:20, not a fresh 2:00.',['time-on'],g=>g.running&&g.penaltiesOn&&g.guest.penalties[0]?.time===80000)]},
 'period-break':{title:'Set a period-break clock without spending penalty time',group:'Period breaks & carry-over penalties',description:'Period 1 has ended with 1:20 remaining on a guest penalty. Run a 3-minute break while keeping that penalty unchanged. This task loads penalty time out enabled.',setup:g=>{g.time=0;g.guest.penalties=[penalty(12,80000)];},steps:[
 step('Pause penalty clocks first','Click PENALTY ON/OFF. Verify that the penalty-clock status says PAUSED. This feature must be enabled; the reference sheet’s NO setting would disable it.',['penalty-toggle'],g=>!g.penaltiesOn),
 step('Enter the break duration','Click SET, TIME, 0 3 0 0, then YES. Use the break duration required by your arena in a real game.',['set','time','0','3','0','0','yes'],g=>g.time===180000&&g.guest.penalties[0]?.time===80000),
 step('Use period 0 for this practice break','Click 0. The guest penalty stays on the board.',['0'],g=>g.period===0),
 step('Run the break clock','Click TIME ON. The main clock runs while guest player 12’s penalty stays at 1:20.',['time-on'],g=>g.running&&!g.penaltiesOn&&g.guest.penalties[0]?.time===80000),
 step('Stop the break for review','Click TIME OFF before the break finishes. Before play resumes, set the next period and turn penalty clocks back ON.',['time-off'],g=>!g.running&&!g.penaltiesOn&&g.guest.penalties[0]?.time===80000)]}
});
tasks.handheld={title:'Use the handheld clock switch',group:'Getting started',description:'Use the connected TCS-5 handheld rocker to start and stop the game clock. The console TIME ON and TIME OFF keys are inactive while it is connected.',setup:g=>{g.connectHandheld(true);},steps:[
 step('Start with the handheld rocker','Click the ON half of the handheld rocker. The game and enabled penalty clocks run together.',['time-on'],g=>g.running&&g.handheldOn),
 step('Stop with the handheld rocker','Click the OFF half of the handheld rocker at a whistle. The main clock stops.',['time-off'],g=>!g.running&&!g.handheldOn)]};
function keyLabel(key){return /^\d$/.test(key)?key:({'yes':'YES','no':'NO','penalty-toggle':'PENALTY ON/OFF','timeout-start':'TIME OUT START','timeout-clear':'TIME OUT CLEAR','power-on':'POWER ON','power-off':'POWER OFF'})[key]||key.replaceAll('-',' ').toUpperCase();}
class PracticeSession{
 constructor(registry=tasks){this.tasks=registry;this.task=null;this.stepIndex=0;this.keyIndex=0;this.completed=false;this.failed=false;this.feedback='';}
 start(id,game){if(!this.tasks[id])throw new Error('Unknown practice task');game.reset();this.tasks[id].setup(game);this.task=this.tasks[id];this.id=id;this.stepIndex=0;this.keyIndex=0;this.completed=false;this.failed=false;this.feedback='';}
 get current(){return this.task?.steps[this.stepIndex];}
 get expected(){return this.current?.keys[this.keyIndex];}
 finishStep(game){if(!this.current.check(game)){this.failed=true;this.feedback='The console does not match this step’s expected result. Click Restart task to try again from the prepared game.';return;}this.feedback='';this.stepIndex++;this.keyIndex=0;if(this.stepIndex===this.task.steps.length)this.completed=true;}
 observe(game){if(this.task&&!this.completed&&!this.failed&&this.current.wait&&this.current.ready(game))this.finishStep(game);}
 record(key,game){if(!this.task||this.completed||this.failed)return;
 if(this.current.wait){if(key==='time-on'&&game.running)this.feedback='';else this.feedback='Watch the clocks for this step. '+this.current.instruction+' If another setting changed, click Restart task.';this.observe(game);return;}
 if(key!==this.expected){this.feedback='You pressed '+keyLabel(key)+'. Next, click '+keyLabel(this.expected)+'. '+this.current.instruction+' If your entry changed, click Restart task to try again from the prepared game.';return;}
 this.feedback='';this.keyIndex++;
 if(this.keyIndex===this.current.keys.length)this.finishStep(game);
 }
}
if(typeof module!=='undefined')module.exports={tasks,PracticeSession,keyLabel};else{root.practiceTasks=tasks;root.PracticeSession=PracticeSession;root.keyLabel=keyLabel;}
})(typeof window==='undefined'?globalThis:window);
