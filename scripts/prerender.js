import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const prerender = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport for consistent rendering
  await page.setViewport({ width: 1200, height: 800 });
  
  // Navigate to the local development server
  await page.goto('http://localhost:8080', { 
    waitUntil: 'networkidle0',
    timeout: 30000 
  });
  
  // Wait for React to hydrate
  await page.waitForSelector('#root', { timeout: 10000 });
  
  // Get the rendered HTML
  const html = await page.content();
  
  // Write the prerendered HTML
  const outputPath = path.join(process.cwd(), 'dist', 'index.html');
  fs.writeFileSync(outputPath, html);
  
  console.log('✅ Prerendered HTML saved to dist/index.html');
  
  await browser.close();
};

prerender().catch(console.error);
