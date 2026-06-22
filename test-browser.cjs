const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  const consoleLogs = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      errors.push({ type: 'console', text });
    }
  });
  
  page.on('pageerror', err => {
    errors.push({ type: 'pageerror', message: err.message, stack: err.stack });
  });
  
  page.on('requestfailed', req => {
    errors.push({ type: 'network', url: req.url(), failure: req.failure()?.errorText });
  });
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    const rootContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? { hasChildren: root.children.length > 0, childCount: root.children.length, html: root.innerHTML.substring(0, 500) } : null;
    });
    
    console.log('=== CONSOLE LOGS ===');
    consoleLogs.forEach(l => console.log(`[${l.type}] ${l.text.substring(0, 200)}`));
    
    console.log('\n=== ERRORS ===');
    errors.forEach(e => console.log(JSON.stringify(e, null, 2)));
    
    console.log('\n=== ROOT CONTENT ===');
    console.log(JSON.stringify(rootContent, null, 2));
    
  } catch (e) {
    console.log('Navigation error:', e.message);
  }
  
  await browser.close();
})();
