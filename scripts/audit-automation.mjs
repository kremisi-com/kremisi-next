// Read-only browser audit. Every non-GET/HEAD request is blocked, including Server Actions.
// Requires Playwright in the environment; no application dependency is added.
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.AUDIT_PLAYWRIGHT || 'playwright');
const axePath = require.resolve('axe-core/axe.min.js');
const base = process.env.AUDIT_BASE || 'http://127.0.0.1:3101';
const phase = process.env.AUDIT_PHASE || 'before';
const output = path.resolve(`docs/landing-automation/audit-evidence/${phase}`);
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.AUDIT_CHROMIUM ? { executablePath: process.env.AUDIT_CHROMIUM } : {}) });
const summary = { date: new Date().toISOString(), base, browser: browser.version(), phase, safety: 'All non-GET/HEAD requests blocked. No real submissions.', pages: [] };
const sizes = [['desktop',1440,900],['laptop',1280,800],['tablet',768,1024],['mobile',390,844],['small-mobile',320,568]];
async function runPage(name, width, height, pathname, theme='dark', reducedMotion='no-preference') {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: width < 500, hasTouch: width <= 768, colorScheme: theme, reducedMotion });
  const result = { name, width, height, pathname, theme, reducedMotion, errors: [], failedRequests: [], badResponses: [], blockedWrites: [] };
  await context.route('**/*', async route => {
    if (!['GET','HEAD'].includes(route.request().method())) {
      result.blockedWrites.push({ url: route.request().url(), method: route.request().method() });
      return route.abort('blockedbyclient');
    }
    return route.continue();
  });
  await context.addInitScript(({ theme }) => {
    localStorage.setItem('theme', theme);
    window.__auditVitals = { lcp: [], shifts: [], longtasks: [], events: [] };
    for (const [type,key] of [['largest-contentful-paint','lcp'],['layout-shift','shifts'],['longtask','longtasks'],['event','events']]) {
      try { new PerformanceObserver(list => list.getEntries().forEach(e => window.__auditVitals[key].push(e.toJSON()))).observe({type,buffered:true,durationThreshold:16}); } catch {}
    }
  }, { theme });
  const page = await context.newPage();
  page.on('pageerror', e => result.errors.push({ type:'pageerror', message:e.message }));
  page.on('console', m => { if(m.type()==='error') result.errors.push({type:'console',message:m.text()}); });
  page.on('requestfailed', r => result.failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
  page.on('response', r => { if(r.status()>=400) result.badResponses.push({url:r.url(),status:r.status()}); });
  try {
    const response = await page.goto(`${base}${pathname}`, { waitUntil:'domcontentloaded', timeout:60000 });
    result.status = response.status();
    await page.locator('h1').first().waitFor({ timeout:20000 }).catch(()=>{});
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForTimeout(2500);
    result.cookieBanner = await page.locator('#iubenda-cs-banner').isVisible().catch(()=>false);
    await page.screenshot({path:path.join(output,`${name}-initial.png`)});
    if(result.cookieBanner) {
      const reject=page.locator('.iubenda-cs-reject-btn');
      if(await reject.isVisible()) { await reject.click(); await page.waitForTimeout(400); result.consentAction='reject'; }
    }
    await page.screenshot({path:path.join(output,`${name}-hero.png`)});
    result.hero = await page.evaluate(()=>({heading:document.querySelector('h1')?.innerText,cta:[...document.querySelectorAll('main a[href="#contatto"]')].map(e=>({text:e.innerText,top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom}))}));
    // Trigger lazy media and scroll-dependent animations, then capture the complete rendered page.
    for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=height*0.8) {
      await page.evaluate(y=>window.scrollTo(0,y),y); await page.waitForTimeout(100);
    }
    await page.waitForTimeout(600);
    result.closing = await page.locator('#videos-cta video').evaluateAll(es=>es.map(e=>({src:e.getAttribute('src'),paused:e.paused,readyState:e.readyState,error:e.error?.code})));
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.waitForTimeout(400);
    await page.screenshot({path:path.join(output,`${name}-full.png`),fullPage:true});
    result.dom = await page.evaluate(()=>({
      title:document.title,lang:document.documentElement.lang,description:document.querySelector('meta[name="description"]')?.content,
      canonical:document.querySelector('link[rel="canonical"]')?.href,
      alternates:[...document.querySelectorAll('link[hreflang]')].map(e=>({lang:e.hreflang,href:e.href})),
      robots:document.querySelector('meta[name="robots"]')?.content||'default index,follow',
      h1Count:document.querySelectorAll('h1').length, documentWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,height:document.body.scrollHeight,
      overflow:[...document.querySelectorAll('main *,nav *,footer *')].filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width&&r.height&&(r.left < -1 || r.right>innerWidth+1)&&s.visibility!=='hidden'&&s.display!=='none'&&e.name!=='krs_x9q4'&&!e.closest('[aria-hidden="true"]');}).slice(0,30).map(e=>({tag:e.tagName,text:e.innerText?.slice(0,80),class:e.className,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})),
      images:[...document.images].map(e=>({src:e.currentSrc||e.src,alt:e.alt,complete:e.complete,naturalWidth:e.naturalWidth,width:e.width})),
      links:[...document.querySelectorAll('a[href]')].map(e=>({text:e.innerText||e.getAttribute('aria-label')||e.querySelector('img')?.alt,href:e.getAttribute('href')})),
      form:document.querySelector('form')?{submitDisabled:document.querySelector('form button[type="submit"]')?.disabled,fields:[...document.querySelector('form').elements].map(e=>({name:e.name,type:e.type,required:e.required,minLength:e.minLength,disabled:e.disabled})),alerts:[...document.querySelectorAll('form [role="alert"]')].map(e=>e.innerText)}:null,
      animations:document.getAnimations().filter(a=>a.playState==='running').length,
      vitals:window.__auditVitals,navigation:performance.getEntriesByType('navigation').map(e=>e.toJSON()),resources:performance.getEntriesByType('resource').map(e=>({name:e.name,transferSize:e.transferSize,decodedBodySize:e.decodedBodySize,duration:e.duration,initiatorType:e.initiatorType}))
    }));
    if(pathname.includes('automazioni')) {
      const cta=page.locator('#inizio a[href="#contatto"]').first();
      await cta.click(); await page.waitForTimeout(500);
      result.ctaTarget=await page.locator('#contatto').evaluate(e=>({hash:location.hash,top:e.getBoundingClientRect().top,title:e.querySelector('h2')?.innerText}));
      await page.locator('form').screenshot({path:path.join(output,`${name}-form.png`)});
      result.nativeValidation=await page.locator('form').evaluate(form=>({valid:form.checkValidity(),invalid:[...form.elements].filter(e=>e.willValidate&&!e.validity.valid).map(e=>({name:e.name,valueMissing:e.validity.valueMissing,typeMismatch:e.validity.typeMismatch}))}));
      await page.addScriptTag({path:axePath});
      result.axe=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return {violations:r.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,help:v.help,helpUrl:v.helpUrl,nodes:v.nodes.map(n=>({html:n.html,target:n.target,failureSummary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>({id:v.id,nodes:v.nodes.length})),passes:r.passes.length};});
      await page.evaluate(()=>window.scrollTo(0,0));
      await page.locator('body').click({position:{x:width-3,y:height-3}});
      result.keyboard=[];
      for(let i=0;i<16;i++) { await page.keyboard.press('Tab'); result.keyboard.push(await page.evaluate(()=>{const e=document.activeElement,r=e.getBoundingClientRect();return {tag:e.tagName,text:e.innerText?.slice(0,70),ariaLabel:e.getAttribute('aria-label'),href:e.getAttribute('href'),name:e.name,top:r.top,bottom:r.bottom};})); }
    }
  } catch(e) {result.exception=String(e);}
  summary.pages.push(result);
  await fs.writeFile(path.join(output,`${name}.json`),JSON.stringify(result,null,2));
  console.log(JSON.stringify({name,status:result.status,exception:result.exception,overflow:result.dom?.overflow.length,errors:result.errors.length,axe:result.axe?.violations.map(v=>`${v.id}:${v.nodes.length}`)}));
  await context.close();
}
try {
  for (const [name,w,h] of sizes) await runPage(name,w,h,'/it/automazioni-aziendali');
  await runPage('desktop-light',1440,900,'/it/automazioni-aziendali','light');
  await runPage('mobile-light',390,844,'/it/automazioni-aziendali','light');
  await runPage('mobile-reduced-motion',390,844,'/it/automazioni-aziendali','dark','reduce');
  if(phase==='before' || process.env.AUDIT_HOME === 'true') {
    await runPage('home-desktop',1440,900,'/it');
    await runPage('home-overview-desktop',1440,900,'/it?view=overview');
    await runPage('home-mobile',390,844,'/it?view=overview');
  }
} finally {
  await fs.writeFile(path.join(output,'results.json'),JSON.stringify(summary,null,2));
  await browser.close();
}
