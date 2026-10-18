const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const baseURL=process.argv[2]||'http://127.0.0.1:8871';
const source=process.argv[3]||__dirname;
const output=process.argv[4]||path.join(require('node:os').tmpdir(),'nevco-playwright');
const {tasks}=require(path.join(source,'dist/walkthroughs.js'));
const passed=[],errors=[];let browser,page;
function pass(name){passed.push(name);console.log('PASS '+name);}
async function text(selector,expected,timeout=8000){const pattern=expected instanceof RegExp?expected:new RegExp('^'+String(expected).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$');await page.waitForFunction(({selector,source,flags})=>{const el=document.querySelector(selector);return el&&new RegExp(source,flags).test(el.textContent.trim());},{selector,source:pattern.source,flags:pattern.flags},{timeout});}
async function handheld(on){const rocker=page.locator('#remote-toggle'),r=await rocker.boundingBox();await rocker.click({position:{x:r.width*(on ? 0.75 : 0.25),y:r.height/2}});}
async function toggleHandheld(){await handheld((await page.locator('#remote-toggle').getAttribute('aria-checked'))!=='true');}
async function keys(...sequence){for(const key of sequence.flat()){const button=page.locator(`[data-key="${key}"]`);if((key==='time-on'||key==='time-off')&&await button.getAttribute('aria-disabled')==='true')await handheld(key==='time-on');else {await button.click();if(key==='power-on'||key==='power-off')await page.locator('#confirm-power').click();}}}
async function start(id){await page.locator('#task-toggle').click();await page.selectOption('#exercise',id);await page.locator('[data-practice="start"]').click();}
async function complete(){await text('.task-complete','✓ Task complete');assert.equal(await page.locator('.mistake-hint').count(),0);}
async function newGame(){await page.locator('#reset').click();await page.locator('#confirm-reset').click();await text('#game-time','20:00');}
async function main(){
 fs.mkdirSync(output,{recursive:true});
 let input='';if(process.stdin.isTTY){console.log('Ready for test configuration JSON (input hidden).');process.stdin.setRawMode(true);process.stdin.resume();input=await new Promise(resolve=>{let buffer='';const receive=chunk=>{buffer+=chunk.toString();if(buffer.includes('\n')){process.stdin.off('data',receive);process.stdin.setRawMode(false);process.stdin.pause();resolve(buffer.slice(0,buffer.indexOf('\n')));}};process.stdin.on('data',receive);});}else{for await(const chunk of process.stdin)input+=chunk;}
 const config=input.trim()?JSON.parse(input):{};
 browser=await chromium.launch({headless:true,channel:"chrome"});
 const context=await browser.newContext({viewport:{width:1440,height:1100},reducedMotion:'reduce'});
 if(config.bearer){const origin=new URL(baseURL).origin;await context.route(origin+'/**',route=>route.continue({headers:{...route.request().headers(),'OAI-Sites-Authorization':'Bearer '+config.bearer}}));}
 page=await context.newPage();page.setDefaultTimeout(8000);page.on('pageerror',err=>errors.push(err.message));page.on('crash',()=>errors.push('Browser page crashed'));
 await page.goto(baseURL,{waitUntil:'networkidle',timeout:25000});await text('h1','Your seat at the scorer’s table.');
 if(!process.env.NEVCO_MOBILE_ONLY){
 assert.equal(await page.locator('#exercise option').count(),Object.keys(tasks).length+1);pass('Page loads, '+Object.keys(tasks).length+' task options and free practice');
 for(const [id,task]of Object.entries(tasks)){
  await start(id);
  for(const [index,step]of task.steps.entries()){
   if(step.wait){await page.waitForFunction(index=>Number(document.querySelector('.guide-progress').getAttribute('aria-valuenow'))>index,index,{timeout:step.waitMs+10000});}
   else for(const key of step.keys){await keys(key);assert.equal(await page.locator('.mistake-hint').count(),0,`${id}: unexpected hint after ${key}`);}
   assert.equal(await page.locator('.guide-progress').getAttribute('aria-valuenow'),String(index+1),`${id}: step ${index+1}`);
   if(id==='carry'&&index===1){await text('#guest-penalties',/#12\s+01:20/);await text('#game-time','00.0');await page.screenshot({path:path.join(output,'carry-period-end.png'),fullPage:true});}
  }
  await complete();pass('Walkthrough: '+task.title);
 }
 await start('score');await keys('home-goal');await page.locator('#practice-mistake-hint').waitFor({state:'visible'});await text('#practice-mistake-hint',/Next, click HOME SCORE/);
 assert.equal(await page.locator('.console').evaluate(el=>el.querySelector('#practice-mistake-hint')!==null),false);await text('#home-score','2');
 await page.screenshot({path:path.join(output,'desktop-mistake-hint.png'),fullPage:true});
 await keys('home-score');assert.equal(await page.locator('.mistake-hint').count(),0);await keys('1','time');await complete();pass('Wrong mouse click gives outside-machine hint; correct click clears it');
 await start('time');await keys('set','time','1','9');await text('#practice-mistake-hint',/Next, click 5/);await page.locator('#practice-mistake-hint [data-practice="restart"]').click();await text('.coach',/Click SET/);await text('#game-time','00.0');pass('Wrong digit hint and Restart task restore a prepared game');
 await newGame();await keys('set','time','0','0','1','2','yes','2');await text('#game-time','12.0');await text('#period','2');await toggleHandheld();await text('#board-status',/CLOCK RUNNING/);await text('#game-time',/^(11|10)\./);await keys('time-off');const frozen=await page.locator('#game-time').textContent();await page.waitForTimeout(400);await text('#game-time',frozen);pass('Manual clock sequence, alternate switch, stop and freeze');
 await keys('home-score','1','1','yes');await text('#home-score','2');await keys('set','home-score','1','yes');await text('#home-score','1');await keys('guest-shots','1','1','yes');await text('#guest-shots','2');await keys('set','guest-shots','1','yes');await text('#guest-shots','1');pass('Manual score and shots add/correct sequences');
 await keys('set','home-penalty','0','2','0','0','yes','0','7');await text('#home-penalties',/#07\s+02:00/);await keys('home-penalty','penalty-edit','yes','0','1','3','0','yes');await text('#home-penalties',/#07\s+01:30/);await keys('home-penalty','penalty-clear','no');await text('#home-penalties',/#07/);await keys('home-penalty','penalty-clear','yes');await text('#home-penalties','NO PENALTIES');pass('Manual penalty add/edit, canceled clear and confirmed clear');
 await keys('timeout-start','0');await page.waitForFunction(()=>/^TIME OUT 00:[23]\d$/.test(document.querySelector('#console-display').getAttribute('aria-label')));await page.selectOption('#speed','20');await text('#timeout-display',/TIME OUT OVER \+/,5000);await keys('time-on');assert.equal(await page.locator('#timeout-display').isVisible(),false);await keys('time-off');await page.selectOption('#speed','1');pass('Timeout appears on operator display, counts past zero, cancels on TIME ON');
 await newGame();await keys('set','time','0','0','0','1','yes','1');await page.locator('#sound').click();await keys('time-on');await page.locator('#horn-indicator').waitFor({state:'visible',timeout:3000});await keys('time-off');await page.locator('#horn-indicator').waitFor({state:'hidden',timeout:1000});pass('End-of-period horn appears and TIME OFF silences it immediately');
 const horn=page.locator('[data-key="horn"]');await horn.scrollIntoViewIfNeeded();const box=await horn.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.locator('#horn-indicator').waitFor({state:'visible'});await page.mouse.up();await page.locator('#horn-indicator').waitFor({state:'hidden'});pass('Manual horn follows mouse press and release');
 await newGame();await keys('set','time','0','8','0','0','no');await page.waitForFunction(()=>document.querySelector('#console-display').getAttribute('aria-label')==='SET 08:0S.s');await keys('no','no','no','no');await text('#game-time','20:00');pass('Manual NO key erases one time digit and cancels without changing the clock');
 await keys('set','options');await page.locator('.training-notice').waitFor({state:'visible'});assert.equal(await page.locator('.console .training-notice').count(),0);await text('#game-time','20:00');pass('Unsupported options are identified outside the machine instead of using a fictional menu');
 await keys('set','home-penalty','0','2','0','0','yes','0','7','set','home-penalty','0','2','0','0','yes','1','8','set','home-penalty','0','2','0','0','yes','2','4');assert.equal(await page.locator('.training-notice').isVisible(),false);assert.equal(await page.locator('#home-penalties > div').count(),2);await text('.queued-penalties',/HOME: 1 additional penalty stored/);await keys('home-penalty','home-penalty','home-penalty');await page.waitForFunction(()=>/#24/.test(document.querySelector('#console-display').getAttribute('aria-label')));pass('Reference-card footnote: extra penalties are accepted while only two appear on the scoreboard');
 await start('startup');await page.locator('#task-toggle').click();await page.selectOption('#exercise','free');await page.locator('#exercise-body [data-practice="free"]').click();await keys('power-on','8','7','1');await page.waitForFunction(()=>document.querySelector('#console-display').getAttribute('aria-label')==='USE PENALTY TIME OUT? Y/N');await keys('yes');await text('#game-time','00.0');pass('Manufacturer startup accepts model 871 directly at the resume prompt');
 await start('startup-card');await keys('power-on','no','8','7','1','yes');await page.locator('.training-notice').waitFor({state:'visible'});await text('#practice-mistake-hint',/Next, click NO/);assert.equal(await page.locator('.console .training-notice').count(),0);await keys('no','no');await complete();pass('Unsupported accessory choice is explained outside the machine and recovers with NO');
 // Independent checks transcribed from the user's photographed quick-reference card.
 await newGame();await keys('power-off','power-on');await page.waitForFunction(()=>document.querySelector('#console-display').getAttribute('aria-label')==='START WHERE TURNED OFF LAST?');await keys('no','8','7','1');await page.waitForFunction(()=>document.querySelector('#console-display').getAttribute('aria-label')==='USE SHOT CLOCK? Y/N');await keys('no');await page.waitForFunction(()=>document.querySelector('#console-display').getAttribute('aria-label')==='USE PENALTY TIME OUT? Y/N');await keys('no');await text('#game-time','00.0');pass('PHOTO 1 Getting Started: POWER ON, NO, 871, NO shot clock, NO penalty time out');
 await keys('set','time','0','3','0','0','yes','0');await text('#game-time','03:00');await text('#period','0');await toggleHandheld();await text('#game-time','02:59',2500);await toggleHandheld();await text('#board-status',/CLOCK STOPPED/);const warmupStopped=await page.locator('#game-time').textContent();await page.waitForTimeout(200);await text('#game-time',warmupStopped);pass('PHOTO 2 Warm-up: SET, TIME, 0300, YES, period 0; attached switch starts and stops');
 await keys('set','time','1','5','0','0','yes','1');await text('#game-time','15:00');await text('#period','1');pass('PHOTO 2 Period: SET, TIME, 1500, YES, period 1');
 await keys('home-score','1','yes','guest-score','1','yes');await text('#home-score','1');await text('#guest-score','1');await keys('set','home-score','3','yes','set','guest-score','2','yes');await text('#home-score','3');await text('#guest-score','2');pass('PHOTO 3 Scores: team SCORE, 1, YES adds; SET, team SCORE, actual total, YES replaces');
 await keys('set','home-penalty','0','2','0','0','yes','0','9','set','guest-penalty','0','2','0','0','yes','1','2');await text('#home-penalties',/#09\s+02:00/);await text('#guest-penalties',/#12\s+02:00/);pass('PHOTO 4 Enter penalties: SET, team PENALTY, 0200, YES, two-digit player with leading zero');
 await keys('home-penalty','penalty-edit','yes','0','1','3','0','yes');await text('#home-penalties',/#09\s+01:30/);await text('#guest-penalties',/#12\s+02:00/);pass('PHOTO 4 Edit penalties: team PENALTY, PENALTY EDIT, YES, corrected time, YES');
 await keys('guest-score','1','yes','home-penalty','penalty-clear','yes');await text('#guest-score','3');await text('#home-penalties','NO PENALTIES');await text('#guest-penalties',/#12/);pass('PHOTO 4 Clear after recording goal: team PENALTY, PENALTY CLEAR, YES');
 await keys('set','home-penalty','0','0','0','3','yes','0','7','set','home-penalty','0','0','3','0','yes','1','8','set','home-penalty','0','2','0','0','yes','2','4');assert.equal(await page.locator('#home-penalties > div').count(),2);await text('#home-penalties',/#07/);assert.equal((await page.locator('#home-penalties').textContent()).includes('#24'),false);await keys('home-penalty','home-penalty','home-penalty');await page.waitForFunction(()=>/#24/.test(document.querySelector('#console-display').getAttribute('aria-label')));await page.selectOption('#speed','5');await toggleHandheld();await text('#home-penalties',/#24/,5000);await toggleHandheld();await page.selectOption('#speed','1');assert.equal(await page.locator('#home-penalties > div').count(),2);assert.equal((await page.locator('#home-penalties').textContent()).includes('#07'),false);await text('#home-penalties',/#18/);await page.screenshot({path:path.join(output,'photo-penalty-promotion.png'),fullPage:true});pass('PHOTO footnote: third entry is stored, only two display, next appears after older penalty expires');
 await page.setViewportSize({width:390,height:844});await start('period-break');
 for(const step of tasks['period-break'].steps)await keys(step.keys);await complete();await text('#guest-penalties',/#12\s+01:20/);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'Mobile layout has horizontal overflow');pass('Mobile period break: mouse keys work and carry-over penalty is preserved');
 await start('score');await keys('home-goal');await page.locator('#mobile-feedback').waitFor({state:'visible'});await page.screenshot({path:path.join(output,'mobile-mistake-hint.png'),fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);await page.locator('#mobile-actions [data-practice="restart"]').click();await keys('home-score','1','time');await complete();pass('Mobile mistake hint and restart are usable outside the console');
 }
 // Touch-based mobile task picker, model selector, and instructions beside the keys.
 const touchContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3});
 if(config.bearer){const origin=new URL(baseURL).origin;await touchContext.route(origin+'/**',route=>route.continue({headers:{...route.request().headers(),'OAI-Sites-Authorization':'Bearer '+config.bearer}}));}
 const desktopPage=page;page=await touchContext.newPage();page.on('pageerror',err=>errors.push(err.message));
 await page.goto(baseURL,{waitUntil:'networkidle'});
 assert.equal(await page.locator('#machine-model option').count(),2);await text('#machine-model option[value="871"]','Rosemary Brown Arena · Nevco 871');await page.selectOption('#machine-model','871');
 assert.equal(await page.locator('.orientation-reminder').count(),0);
 await start('score');await page.locator('[data-key="home-goal"]').tap();await text('#mobile-feedback',/Pressed HOME GOAL/);await text('#mobile-next','Tap HOME SCORE');
 await page.locator('#task-toggle').tap();await page.selectOption('#exercise','carry');await page.locator('#task-close').tap();
 await text('#mobile-next','Tap HOME SCORE');await text('#home-score','2');
 await page.locator('#mobile-actions [data-practice="restart"]').tap();await text('#mobile-step','STEP 1 OF 3');
 await page.locator('[data-key="home-score"]').tap();await page.locator('[data-key="1"]').tap();
 await page.screenshot({path:path.join(output,'phone-portrait-instructions.png')});
 await page.setViewportSize({width:844,height:390});await page.locator('[data-key="time"]').tap();await complete();await text('#home-score','3');
 pass('Top walkthrough picker and arena model selector; browsing/canceling preserves task; restart and rotation preserve correct behavior');
 for(const size of [{width:844,height:390},{width:667,height:375},{width:932,height:430},{width:667,height:320}]){
  await page.setViewportSize(size);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Mobile horizontal overflow');
  const frame=await page.locator('.console').boundingBox();assert(frame.y>=0&&frame.y+frame.height<=size.height,'Whole machine must fit vertically');
  assert.equal(await page.locator('main').evaluate(el=>el.scrollHeight<=el.clientHeight+1),true,'Practice must not need page scrolling');
  const hand=await page.locator('.handheld').boundingBox();assert(hand.y>=0&&hand.y+hand.height<=size.height,'Handheld stays visible');
  const small=await page.locator('.keys-layout button').evaluateAll(bs=>bs.map(b=>({key:b.dataset.key,width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height})).filter(r=>r.width<44||r.height<44));assert.equal(small.length,0,JSON.stringify({size,small}));
 }
 await start('period-break');
 for(const step of tasks['period-break'].steps.slice(0,-1))await keys(step.keys);
 await page.locator('[data-key="home-goal"]').tap();await text('#mobile-next','Tap HANDHELD OFF');
 assert.equal(await page.locator('.mobile-coach').evaluate(el=>el.scrollHeight<=el.clientHeight+1),true,'Longest instruction and mistake hint must fit');
 assert.equal(await page.locator('main').evaluate(el=>el.scrollHeight<=el.clientHeight+1),true,'Longest instruction must not push machine below screen');
 await page.screenshot({path:path.join(output,'phone-landscape-long-instruction-hint.png')});
 await handheld(false);await complete();
 await page.locator('#view-toggle').tap();assert.equal(await page.locator('.scoreboard').isVisible(),true);await text('#guest-penalties',/#12\s+01:20/);await page.locator('#view-toggle').tap();
 await page.selectOption('#machine-model','871');await text('#guest-penalties',/#12\s+01:20/);
 await page.locator('#tools-toggle').tap();await page.selectOption('#speed','1');await page.locator('#tools-close').tap();assert.equal(await page.locator('.console').isVisible(),true);
 await page.locator('#task-toggle').tap();await page.selectOption('#exercise','carry');assert.equal(await page.locator('#task-dialog').evaluate(el=>el.scrollHeight<=el.clientHeight+1),true,'Task picker should fit without scrolling');await page.screenshot({path:path.join(output,'phone-task-picker.png')});await page.keyboard.press('Escape');await text('#mobile-step','TASK COMPLETE');
 await page.screenshot({path:path.join(output,'phone-landscape-top-controls.png')});
 await start('handheld');await page.locator('[data-key="time-on"]').tap({force:true});await text('#board-status',/CLOCK STOPPED/);await text('#mobile-instruction',/handheld rocker/);assert.equal(await page.locator('.guide-progress').getAttribute('aria-valuenow'),'0');
 await handheld(true);await text('#board-status',/CLOCK RUNNING/);await text('#mobile-next','Tap HANDHELD OFF');
 await page.locator('[data-key="time-off"]').tap({force:true});await text('#board-status',/CLOCK RUNNING/);assert.equal(await page.locator('.guide-progress').getAttribute('aria-valuenow'),'1');
 await handheld(false);await complete();
 pass('Connected handheld rocker controls clock and blocked console time keys do not advance the walkthrough');
 await page.locator('#task-toggle').tap();await page.selectOption('#exercise','free');await page.locator('#exercise-body [data-practice="free"]').tap();
 const hh=page.locator('#handheld-horn');const hb=await hh.boundingBox();await page.mouse.move(hb.x+hb.width/2,hb.y+hb.height/2);await page.mouse.down();await page.waitForFunction(()=>document.querySelector('#handheld-horn').getAttribute('aria-pressed')==='true');await page.mouse.move(1,1);await page.mouse.up();await page.waitForFunction(()=>document.querySelector('#handheld-horn').getAttribute('aria-pressed')==='false');
 await hh.focus();await page.keyboard.down('Space');await page.waitForFunction(()=>document.querySelector('#handheld-horn').getAttribute('aria-pressed')==='true');await page.keyboard.up('Space');await page.waitForFunction(()=>document.querySelector('#handheld-horn').getAttribute('aria-pressed')==='false');
 await page.mouse.move(hb.x+hb.width/2,hb.y+hb.height/2);await page.mouse.down();await page.waitForFunction(()=>document.querySelector('#handheld-horn').getAttribute('aria-pressed')==='true');await page.waitForFunction(()=>document.querySelector('#handheld-horn').getAttribute('aria-pressed')==='false',null,{timeout:5500});await page.mouse.up();
 pass('Handheld horn: press/hold, release outside, keyboard release, and automatic four-second limit');
 await page.locator('#handheld-connect').tap();await text('#handheld-state','UNPLUGGED');await page.locator('[data-key="time-on"]').tap({force:true});await text('#board-status',/CLOCK STOPPED/);assert.equal(await page.locator('[data-key="time-on"]').getAttribute('aria-disabled'),'true');
 await keys('power-off','power-on','yes');assert.equal(await page.locator('[data-key="time-on"]').getAttribute('aria-disabled'),'false');await keys('time-on');await text('#board-status',/CLOCK RUNNING/);await keys('time-off');await page.locator('#handheld-connect').tap();await text('#handheld-state','CONNECTED');assert.equal(await page.locator('[data-key="time-on"]').getAttribute('aria-disabled'),'true');
 pass('Unplug requires a power restart before console time keys work; reconnect restores handheld control');
 await page.setViewportSize({width:390,height:844});assert.equal(await page.locator('.orientation-reminder').count(),0);
 assert.equal(await page.locator('main').evaluate(el=>el.scrollHeight<=el.clientHeight+1),true,'Portrait instructions and machine fit together');
 await touchContext.close();page=desktopPage;await page.setViewportSize({width:1440,height:1100});
 pass('Four landscape sizes plus portrait: top controls, full instructions and hints with machine, scoreboard/settings dialogs, no page scrolling');

 // MPC-7 checks use actual mouse keys, independent assertions, and every model-specific guide.
 await page.selectOption('#machine-model','mpc7');
 await text('.nevco small','MPC-7 SERIES · HOCKEY');await text('.handheld-name small','TCS-7');
 assert.equal(await page.locator('[data-key=home-new-minor]').count(),1);assert.equal(await page.locator('[data-key=home-goal]').count(),0);await text('#home-score','0');
 const mpcTasks=require(path.join(source,'dist/mpc7-walkthroughs.js')).tasks;
 assert.equal(await page.locator('#exercise option').count(),Object.keys(mpcTasks).length+1);
 for(const [id,task] of Object.entries(mpcTasks)){
  await start(id);
  for(const [index,step] of task.steps.entries()){
   if(step.wait)await page.waitForFunction(index=>Number(document.querySelector('.guide-progress').getAttribute('aria-valuenow'))>index,index,{timeout:step.waitMs+6000});
   else for(const key of step.keys){await keys(key);assert.equal(await page.locator('.mistake-hint').count(),0,`MPC7 ${id}: hint after ${key}`);}
   assert.equal(await page.locator('.guide-progress').getAttribute('aria-valuenow'),String(index+1),`MPC7 ${id}: step ${index+1}`);
  }
  await complete();pass('MPC-7 walkthrough: '+task.title);
 }
 await start('time');await keys('set','time','1','9');await text('#practice-mistake-hint',/Next, click 2/);assert.equal(await page.locator('.console .mistake-hint').count(),0);await page.locator('#practice-mistake-hint [data-practice=restart]').click();await keys('set','time','2','0','yes','period','1');await complete();
 await page.locator('#task-toggle').click();await page.selectOption('#exercise','free');await page.locator('#exercise-body [data-practice=free]').click();
 await keys('set','time','1','2','3','4','5');await text('#game-time','12:35');await text('#period','1');await keys('set','time','0','9','no');await text('#game-time','12:35');
 await keys('home-new-minor','0','7','yes');await text('#home-penalties',/#07\s+02:00/);await keys('home-new-major','1','8','yes');await text('#home-penalties',/#18\s+05:00/);await keys('home-penalty','penalty-clear');assert.equal((await page.locator('#home-penalties').textContent()).includes('#07'),false);await text('#home-penalties',/#18/);
 await keys('home-score','1','1');await text('#home-score','1');await keys('home-score','1');await text('#home-score','2');await page.waitForFunction(()=>document.querySelector('#console-display').getAttribute('aria-label')==='2 Score 0');await keys('time');await page.waitForFunction(()=>document.querySelector('#console-display').getAttribute('aria-label').includes('Per:1'));await keys('goal-reset');assert.equal(await page.locator('#home-goal').evaluate(el=>el.classList.contains('on')),false);
 pass('MPC-7 independent manual checks: five-digit autoaccept, whole-entry cancel, separate period, player-first minor/major, immediate clear, one addition per score selection');
 await page.screenshot({path:path.join(output,'mpc7-desktop.png'),fullPage:true});
 await page.selectOption('#machine-model','871');await text('#home-score','0');assert.equal(await page.locator('[data-key=home-goal]').count(),1);assert.equal(await page.locator('#exercise option[value=handheld]').count(),1);await keys('set','time','0','3','0','0','yes');await page.waitForFunction(()=>document.querySelector('#console-display').getAttribute('aria-label').startsWith('PERIOD'));await keys('0');await text('#game-time','03:00');
 pass('Switching models clears the sample game and restores the correct keypad, tasks and 871 time/period behavior');
 const mpcTouch=await browser.newContext({viewport:{width:667,height:320},isMobile:true,hasTouch:true});
 if(config.bearer){const origin=new URL(baseURL).origin;await mpcTouch.route(origin+'/**',route=>route.continue({headers:{...route.request().headers(),'OAI-Sites-Authorization':'Bearer '+config.bearer}}));}
 page=await mpcTouch.newPage();page.on('pageerror',err=>errors.push(err.message));await page.goto(baseURL,{waitUntil:'networkidle'});await page.selectOption('#machine-model','mpc7');
 for(const size of [{width:844,height:390},{width:667,height:320},{width:390,height:844}]){
  await page.setViewportSize(size);await start('custom');await page.locator('[data-key=guest-new-minor]').tap();
  await page.locator('[data-key="9"]').tap();await text('#mobile-feedback',/Pressed 9/);await text('#mobile-next','Tap 1');
  assert.equal(await page.locator('main').evaluate(el=>el.scrollHeight<=el.clientHeight+1),true,'MPC-7 whole mobile view fits');
  assert.equal(await page.locator('.mobile-coach').evaluate(el=>el.scrollHeight<=el.clientHeight+1),true,'MPC-7 instructions and hint fit');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.locator('#mobile-actions [data-practice=restart]').click();for(const step of mpcTasks.custom.steps)await keys(step.keys);await complete();
  await page.screenshot({path:path.join(output,`mpc7-${size.width}x${size.height}.png`)});
 }
 await page.setViewportSize({width:667,height:320});await start('break');await keys('9');
 assert.equal(await page.locator('.mobile-coach').evaluate(el=>el.scrollHeight<=el.clientHeight+1),true,'MPC-7 long options instruction with hint fits');
 assert.equal(await page.locator('main').evaluate(el=>el.scrollHeight<=el.clientHeight+1),true);await page.screenshot({path:path.join(output,'mpc7-mobile-long-hint.png')});
 await page.locator('#tools-toggle').tap();await text('.arena-source-note',/Kensington and Burnaby Lake: grouped under MPC-7 for practice/);await page.locator('#tools-close').click();
 await mpcTouch.close();page=desktopPage;
 pass('MPC-7 mobile touch walkthroughs and hints fit beside the full console; More explains the shared Kensington / Burnaby Lake practice option');
 assert.deepEqual(errors,[],'Browser JavaScript errors');
 const report={url:baseURL,passed:passed.length,checks:passed,pageErrors:errors,screenshots:output};fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({result:'passed',checks:passed.length,screenshots:output}));
}
main().catch(async err=>{console.error('FAIL '+err.stack);if(page){try{await page.screenshot({path:path.join(output,'failure.png'),fullPage:true});fs.writeFileSync(path.join(output,'failure.txt'),await page.locator('body').innerText());}catch{}}process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();});
