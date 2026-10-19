const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {gameScenario}=require('./dist/full-game');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
 for(const mobile of [false,true])for(const model of ['871','mpc7'])for(const assisted of [true,false]){
  const caseName=model+'-'+(assisted?'assisted':'unassisted')+'-'+(mobile?'phone':'desktop');if(process.env.FULL_GAME_CASE&&process.env.FULL_GAME_CASE!==caseName)continue;
  const context=await browser.newContext({viewport:mobile?{width:375,height:667}:{width:1440,height:1100},hasTouch:mobile,isMobile:mobile});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.argv[2]||'http://127.0.0.1:8871');if(model==='mpc7')await page.selectOption('#machine-model',model);
  const coach=mobile?'.mobile-coach':'.coach';
  const action=async name=>page.locator(coach+' [data-practice="'+name+'"]').click();
  await page.locator('#task-toggle').click();if(!await page.locator('[data-practice="game-assisted"]').isVisible())await page.locator('.full-game-picker summary').click();await page.locator('[data-practice="game-'+(assisted?'assisted':'unassisted')+'"]').click();
  assert.equal(await page.locator('.next-key').count(),assisted?1:0);
  if(!assisted){assert.doesNotMatch(await page.locator('#mobile-instruction').textContent(),/Next:|SET →/);await action('game-help');assert.match(await page.locator('#mobile-instruction').textContent(),/Next: SET/);assert.equal(await page.locator('.next-key').count(),1);}
  // Wrong keys identify the mistake and restore input without a retry.
  await page.locator('[data-key="9"]').click();assert.equal(await page.evaluate(()=>practice.failed),false);assert.match(await page.locator(coach).textContent(),/You pressed 9.*Press SET/);assert.equal(await page.locator(coach+' [data-practice="game-retry"]').count(),0);assert.equal(await page.evaluate(()=>practice.stepIndex),0);
  const steps=gameScenario(model).steps;
  for(let i=0;i<steps.length;i++){
   const step=steps[i];await page.waitForFunction(i=>practice.stepIndex===i,i);
   if(step.wait){await action('game-skip');}
   else for(const [keyIndex,key] of step.keys.entries()){if(key==='time-on'||key==='time-off'){const b=page.locator('#remote-toggle'),r=await b.boundingBox();await b.click({position:{x:r.width*(key==='time-on'?.75:.25),y:r.height/2}});}else await page.locator('[data-key="'+key+'"]').click();if(i===0&&keyIndex===2){const buffer=await page.evaluate(()=>game.buffer);await page.locator('[data-key="9"]').click();assert.equal(await page.evaluate(()=>game.buffer),buffer);assert.match(await page.locator(coach).textContent(),/Press 5/);}}
   assert.equal(await page.evaluate(()=>practice.failed),false,'event '+i+' '+step.title);
   if(!assisted&&i===0){assert.equal(await page.locator('.next-key').count(),0);assert.doesNotMatch(await page.locator('#mobile-instruction').textContent(),/Next:/);}
   if(mobile){const fit=await page.evaluate(()=>{const m=document.querySelector('main'),r=document.querySelector('.handheld').getBoundingClientRect();return {scroll:m.scrollHeight-m.clientHeight,bottom:r.bottom,height:innerHeight};});assert(fit.scroll<=1&&fit.bottom<=fit.height+1,'mobile event '+i+' '+JSON.stringify(fit));}
   if(i===steps.findIndex(s=>s.title==='Clear only guest #18')){const pens=await page.evaluate(()=>game.guest.penalties);assert.deepEqual(pens,[{player:5,time:90000}]);}
  }
  assert.equal(await page.evaluate(()=>practice.completed),true);assert.equal(await page.locator('#home-score').textContent(),'3');assert.equal(await page.locator('#guest-score').textContent(),'1');assert.equal(await page.locator('#period').textContent(),'3');assert.equal(await page.evaluate(()=>game.running),false);assert.deepEqual(errors,[]);
  await page.screenshot({path:'/private/tmp/full-game-'+model+'-'+(assisted?'assisted':'unassisted')+'.png'});
  await page.locator('#task-toggle').click();await page.selectOption('#exercise',model==='871'?'score':'home-score');await page.locator('[data-practice="start"]').click();assert.equal(await page.evaluate(()=>!!practice.fullGame),false);
  await page.locator('#task-toggle').click();if(!await page.locator('[data-practice="game-assisted"]').isVisible())await page.locator('.full-game-picker summary').click();await page.locator('[data-practice="game-unassisted"]').click();await page.locator(coach+' [data-practice="game-help"]').waitFor({state:'visible'});
  console.log('PASS '+model+' '+(assisted?'assisted':'unassisted')+' '+(mobile?'phone':'desktop')+': '+steps.length+' events, help, recovery, mobile fit, final score, return to walkthrough');await context.close();
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
