import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { createServer } from 'vite';

const ROUTES = ['/', '/blog'];

const prerender = async () => {
  const distDir = path.join(process.cwd(), 'dist');

  // Start a temporary static server from dist
  const { createServer: createHttpServer } = await import('http');
  const { handler } = await import('serve-handler').catch(() => null) || {};

  // Use Vite's preview server
  const { preview } = await import('vite');
  const server = await preview({ preview: { port: 4199, strictPort: true } });
  const baseUrl = 'http://localhost:4199';

  const browser = await puppeteer.launch({ headless: 'new' });

  try {
    for (const route of ROUTES) {
      const page = await browser.newPage();

      // Set viewport for consistent rendering
      await page.setViewport({ width: 1200, height: 800 });

      // Navigate to the page
      await page.goto(`${baseUrl}${route}`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait for React to hydrate
      await page.waitForSelector('#root', { timeout: 10000 });

      // Wait a bit for lazy components
      await new Promise(r => setTimeout(r, 2000));

      // Get the rendered HTML
      const html = await page.content();

      // Determine output path
      const outputDir = route === '/' ? distDir : path.join(distDir, route);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const outputPath = path.join(outputDir, 'index.html');

      fs.writeFileSync(outputPath, html);
      console.log(`Prerendered ${route} -> ${outputPath}`);

      await page.close();
    }
  } finally {
    await browser.close();
    server.httpServer.close();
  }
};

prerender().catch(console.error);
