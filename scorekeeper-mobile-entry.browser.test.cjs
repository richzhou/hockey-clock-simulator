const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
global.Scorekeeper=require('./scorekeeper/model.js');const T=require('./scorekeeper/training.js');
const server=http.createServer((req,res)=>{let route;try{route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return res.writeHead(400).end();}const root=__dirname,file=path.resolve(root,'.'+route+(route.endsWith('/')?'index.html':''));const rel=path.relative(root,file);if(!file.startsWith(root+path.sep)||rel.split(path.sep).some(x=>x.startsWith('.'))||!['.html','.js','.css'].includes(path.extname(file)))return res.writeHead(403).end();fs.readFile(file,(e,data)=>{if(e)return res.writeHead(404).end();res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(data);});});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url=(process.env.SIMULATOR_BASE_URL||'http://127.0.0.1:'+server.address().port).replace(/\/$/,'');
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{for(const width of [320,375,430,768]){
  const p=await browser.newPage({viewport:{width,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(url+'/scorekeeper/');await p.locator('#acknowledge').click();await p.locator('[data-action=skip-pregame]').click();
  const dialog=p.locator('#entry-dialog'),body=p.locator('#entry-body');
  const close=()=>p.locator('[data-close=entry-dialog]').click();
  const open=(action,team)=>p.locator('.action-grid [data-action='+action+'][data-team='+team+']').click();
  const save=()=>body.locator('button[type=submit]').click();
  for(const action of ['shots','notes','options']){const control=p.locator('.game-toolbar [data-action='+action+']');assert.equal(await control.getAttribute('aria-label'),action[0].toUpperCase()+action.slice(1));assert.ok((await control.boundingBox()).height>=44);await control.click();assert.ok(await dialog.isVisible());await close();}
  const end=p.locator('.game-toolbar [data-action=begin-wrap]');assert.equal(await end.getAttribute('aria-label'),'End Game');assert.equal(await end.locator('svg').count(),1);assert.ok((await end.boundingBox()).x+(await end.boundingBox()).width<=width);
  await open('goal','home');
  if(width<=600){const box=await dialog.boundingBox();assert.ok(box.width>=width-1);assert.ok(box.height>=843);assert.equal(await dialog.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(51, 56, 60)');}
  for(const n of [12,7,9])await body.locator('[data-player="'+n+'"]').click();
  for(const [n,color] of [[12,'rgb(41, 148, 87)'],[7,'rgb(255, 255, 255)']])assert.equal(await body.locator('[data-player="'+n+'"]').evaluate(e=>getComputedStyle(e,'::before').backgroundColor),color);
  await body.locator('input[name=strength][value="Power Play"]').check();assert.equal(await body.locator('#time').getAttribute('inputmode'),'text');assert.equal(await body.locator('[data-clock-colon]').count(),0);await body.locator('#time').fill('');await body.locator('#time').pressSequentially('03:00');assert.equal(await body.locator('#time').inputValue(),'03:00');
  assert.equal(await body.locator('#time').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(220, 226, 227)');
  await p.locator('#entry-help').click();await p.locator('[data-close=hint-dialog]').click();assert.equal(await body.locator('#time').inputValue(),'03:00');
  if(width<=600){await body.evaluate(e=>e.scrollTop=0);const top=await dialog.locator('.dialog-head').boundingBox();await body.evaluate(e=>e.scrollTop=e.scrollHeight);assert.equal((await dialog.locator('.dialog-head').boundingBox()).y,top.y);}
  await p.screenshot({path:'/private/tmp/mobile-entry-goal-'+width+'.png'});await save();assert.equal(await p.evaluate(()=>state.events[0].time),'03:00');
  await open('penalty','away');await body.locator('#time').fill('03:00');await body.locator('#starttime').fill('02:45');await body.locator('[data-player="16"]').click();await body.locator('[data-player="4"]').click();
  assert.equal(await body.locator('[data-player="16"]').evaluate(e=>getComputedStyle(e,'::before').backgroundColor),'rgb(201, 163, 64)');
  await body.locator('#choose-infraction').click();assert.equal(await p.locator('#entry-title').textContent(),'Select Infraction');
  await body.locator('[data-infraction=Slashing]').click();await body.locator('[data-severity=major]').click();assert.equal(await body.locator('[data-infraction=Slashing]').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(0, 102, 164)');
  await p.screenshot({path:'/private/tmp/mobile-entry-infraction-'+width+'.png'});await body.locator('#infraction-next').click();assert.equal(await body.locator('#time').inputValue(),'03:00');assert.equal(await body.locator('#starttime').inputValue(),'02:45');
  await body.evaluate(e=>e.scrollTop=e.scrollHeight);await p.screenshot({path:'/private/tmp/mobile-entry-penalty-'+width+'.png'});await save();assert.equal(await p.evaluate(()=>state.events[1].severity),'major');
  assert.equal(await p.locator('.active-penalty[data-id="2"] .jersey>span').textContent(),'4');
  await open('penalty','away');await body.locator('[data-player="12"]').click();await body.locator('#choose-infraction').click();await body.locator('[data-infraction=Holding]').click();await body.locator('#infraction-next').click();await body.locator('#time').fill('02:50');await save();assert.equal(await p.locator('.active-penalty').count(),2);
  await p.locator('.active-penalty[data-id="3"]').click();assert.match(await p.locator('#entry-title').textContent(),/Away/);await body.locator('#time').fill('00:50');await p.screenshot({path:'/private/tmp/mobile-entry-penalty-end-'+width+'.png'});await save();assert.equal(await p.locator('.active-penalty[data-id="3"]').count(),0);assert.equal(await p.locator('.active-penalty[data-id="2"]').count(),1);assert.equal(await p.evaluate(()=>state.events.find(e=>e.id===3).end.time),'00:50');assert.equal(await p.locator('.event [data-action=release][data-id="3"]').count(),1);await p.locator('.app-shell').evaluate(e=>e.scrollTop=0);await p.screenshot({path:'/private/tmp/mobile-entry-active-penalty-'+width+'.png'});
  await p.locator('.active-penalty[data-id="2"]').click();await body.locator('#time').fill('00:45');await save();assert.equal(await p.locator('.active-penalty').count(),0);

  await open('goalie','home');await body.locator('#time').fill('02:30');await body.locator('[data-goalie="30"]').click();assert.match(await body.locator('#goalie-summary').textContent(),/Outgoing: Goalie #1.*Incoming: Goalie #30/);await p.screenshot({path:'/private/tmp/mobile-entry-goalie-'+width+'.png'});await body.getByRole('button',{name:'Swap',exact:true}).click();assert.equal(await p.evaluate(()=>state.goalies.home),30);
  await end.click();assert.match(await p.locator('#entry-title').textContent(),/End Game/);assert.equal(await body.locator('#actualStart').inputValue(),'18:00');await close();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);await p.close();console.log('PASS entry panels, palette, toolbar, draft preservation and saves '+width);
 }}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
