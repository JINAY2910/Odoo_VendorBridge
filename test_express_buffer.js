import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
app.get('/', async (req, res) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent('<h1>Test</h1>');
  const pdfBuffer = await page.pdf({ format: 'A4' });
  console.log("Is Buffer?", Buffer.isBuffer(pdfBuffer));
  console.log("Type:", Object.prototype.toString.call(pdfBuffer));
  await browser.close();
  
  res.setHeader('Content-Type', 'application/pdf');
  // Express handles Buffer. What if it is Uint8Array?
  res.send(Buffer.from(pdfBuffer));
});
const server = app.listen(3001, () => console.log('Listening on 3001'));
setTimeout(() => {
  server.close();
  process.exit(0);
}, 2000);
