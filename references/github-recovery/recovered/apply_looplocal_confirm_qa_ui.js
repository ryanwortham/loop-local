const fs = require('fs');
const { chromium } = require('playwright');
const sql = fs.readFileSync('/Users/productivebot/productivebot/confirm_looplocal_qa.sql', 'utf8');
(async()=>{
 const browser = await chromium.connectOverCDP('http://127.0.0.1:18800');
 const context = browser.contexts()[0] || await browser.newContext();
 const page = await context.newPage();
 let detected=false, response=null;
 page.on('request', req=>{ const pd=req.postData()||''; if(req.method()==='POST' && pd.includes('email_confirmed_at') && pd.includes('looplocal.qa.1781898905368')) { detected=true; console.log('QA_CONFIRM_POST_DETECTED'); }});
 page.on('response', async res=>{ const u=res.url(); if(detected && !response && u.includes('/pg-meta/itraeknotcdtdzaeukan/query')) { try { response={status:res.status(), text:(await res.text()).slice(0,1000)}; } catch {} }});
 await page.goto('https://supabase.com/dashboard/project/itraeknotcdtdzaeukan/sql/new', {waitUntil:'domcontentloaded', timeout:60000});
 await page.waitForTimeout(8000);
 await page.evaluate((sql) => window.monaco.editor.getModels()[0].setValue(sql), sql);
 await page.keyboard.press('Meta+Enter');
 await page.waitForTimeout(8000);
 console.log('QA_CONFIRM_RESPONSE', JSON.stringify(response));
 await page.close(); await browser.close();
})();
