import puppeteer from 'puppeteer';
import path from 'path';
import ejs from 'ejs';
import fs from 'fs';

async function testInvoicePDF() {
  let browser;
  try {
    const mockInvoiceData = {
      clientName: "Ketut Susilo",
      clientPhone: "123-456-7890",
      clientEmail: "hello@reallygreatsite.com",
      clientAddress: "123 Anywhere St., Any City",
      invoiceNumber: "12345",
      date: "25 June 2022",
      items: [
        { description: "Logo Design", qty: 5, price: 100, total: 500 }
      ],
      subTotal: 7650,
      taxRate: 15,
      taxAmount: 1148,
      grandTotal: 8798,
      bankName: "Borcelle",
      accountNumber: "123-456-7890"
    };

    const templatePath = path.join(process.cwd(), 'server/templates/invoice.ejs');
    const html = await ejs.renderFile(templatePath, {
      doc: mockInvoiceData,
      type: 'INVOICE',
      date: '25 June 2022',
      totalPaid: 0,
      amountDue: 8798
    });

    console.log("Launching browser...");
    browser = await puppeteer.launch({
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage', 
        '--disable-gpu'
      ],
      headless: true
    });
    console.log("Browser launched. Opening page...");
    const page = await browser.newPage();
    
    // Listen for console events from the page
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    console.log("Setting content...");
    await page.setContent(html, { waitUntil: 'load', timeout: 5000 });
    console.log("Content set. Generating PDF...");
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    console.log("PDF generated. Buffer length:", pdfBuffer.length);
  } catch (error) {
    console.error("PDF generation error:", error);
  } finally {
    if (browser) await browser.close();
    process.exit(0);
  }
}

testInvoicePDF();
