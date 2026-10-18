const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const url=process.argv[2]||'http://127.0.0.1:8871',output=process.argv[3]||'/private/tmp/nevco-portrait-board';
(async()=>{fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({headless:true,channel:'chrome'});const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage(),errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
 const keys=async(...seq)=>{for(const k of seq.flat())await page.locator('[data-key="'+k+'"]').tap();};
 const rocker=async on=>{const b=page.locator('#remote-toggle'),r=await b.boundingBox();await b.tap({position:{x:r.width*(on?.75:.25),y:r.height/2}});};
 const start=async id=>{await page.locator('#task-toggle').tap();await page.selectOption('#exercise',id);await page.locator('[data-practice=start]').tap();};
 const fits=async label=>{const dimensions=await page.evaluate(()=>{const main=document.querySelector('main'),coach=document.querySelector('.mobile-coach');return {page:document.documentElement.scrollWidth<=innerWidth,main:main.scrollHeight<=main.clientHeight+1,coach:coach.scrollHeight<=coach.clientHeight+1};});assert.deepEqual(dimensions,{page:true,main:true,coach:true},label+' '+JSON.stringify(dimensions));for(const selector of ['.console','.handheld','.scoreboard']){if(!await page.locator(selector).isVisible())continue;const r=await page.locator(selector).boundingBox();assert(r.y>=0&&r.y+r.height<= (await page.viewportSize()).height+1,label+' '+selector+' outside viewport');}};
 try{
 for(const model of ['871','mpc7'])for(const size of [{width:375,height:667},{width:390,height:844},{width:430,height:932}]){
  await page.setViewportSize(size);await page.goto(url,{waitUntil:'domcontentloaded'});if(model!=='871')await page.selectOption('#machine-model',model);
  assert.equal(await page.locator('.scoreboard').isVisible(),true);assert.equal(await page.locator('.console').isVisible(),true);assert.equal(await page.locator('#view-toggle').getAttribute('aria-expanded'),'true');await fits(model+' default '+size.height);
  await keys('home-score','1','yes','guest-score','2','yes');
  for(const team of ['home','guest'])for(const player of ['07','18']){if(model==='871')await keys('set',team+'-penalty','0','2','0','0','yes',...player);else await keys(team+'-new-minor',...player,'yes');}
  assert.equal(await page.locator('#home-score').textContent(),'1');assert.equal(await page.locator('#guest-score').textContent(),'2');assert.equal(await page.locator('#home-penalties > div').count(),2);assert.equal(await page.locator('#guest-penalties > div').count(),2);await fits(model+' full board '+size.height);
  await page.screenshot({path:path.join(output,model+'-'+size.width+'x'+size.height+'.png')});
  await page.locator('#view-toggle').tap();assert.equal(await page.locator('.scoreboard').isVisible(),false);assert.equal(await page.locator('.console').isVisible(),true);assert.equal(await page.locator('#view-toggle').getAttribute('aria-expanded'),'false');await page.locator('#view-toggle').tap();assert.equal(await page.locator('#home-score').textContent(),'1');
  await start(model==='871'?'period-break':'break');await keys('9');await fits(model+' long hint '+size.height);assert.equal(await page.locator('#mobile-feedback').isVisible(),true);await page.screenshot({path:path.join(output,model+'-hint-'+size.height+'.png')});
  await start('concurrent');const steps=require(model==='871'?'./dist/walkthroughs.js':'./dist/mpc7-walkthroughs.js').tasks.concurrent.steps;
  // Complete setup through starting both penalties, using the actual keys.
  for(const step of steps){if(step.keys.includes('time-off'))break;for(const k of step.keys){if(k==='time-on')await rocker(true);else await keys(k);}}
  const progress=await page.locator('.guide-progress').getAttribute('aria-valuenow');await page.locator('#view-toggle').tap();await page.waitForTimeout(1200);await page.locator('#view-toggle').tap();assert.equal(await page.locator('.guide-progress').getAttribute('aria-valuenow'),progress);assert.match(await page.locator('#home-penalties').textContent(),/01:5[89]/);assert.match(await page.locator('#board-status').textContent(),/RUNNING/);await rocker(false);
  await page.locator('#view-toggle').tap();await page.setViewportSize({width:844,height:390});await page.locator('#view-toggle').tap();assert.equal(await page.locator('.scoreboard').isVisible(),true);assert.equal(await page.locator('.console').isVisible(),false);await page.locator('#view-toggle').tap();assert.equal(await page.locator('.console').isVisible(),true);await page.setViewportSize(size);assert.equal(await page.locator('.scoreboard').isVisible(),false);await page.locator('#view-toggle').tap();assert.equal(await page.locator('.scoreboard').isVisible(),true);await fits(model+' restored '+size.height);
  checks.push(model+' '+size.width+'×'+size.height+': live full board, hide/show, long hint, running penalties, rotation');console.log('PASS '+checks.at(-1));
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({url,checks,pageErrors:errors},null,2));console.log('PASS '+checks.length+' portrait scenarios, no JavaScript errors');
 }catch(e){await page.screenshot({path:path.join(output,'failure.png')});throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
