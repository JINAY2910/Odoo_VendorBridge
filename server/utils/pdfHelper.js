import puppeteer from 'puppeteer';
import ejs from 'ejs';
import path from 'path';
import { Invoice, PurchaseOrder, Vendor, User, Payment } from '../models/index.js';

export const generateInvoicePDFBuffer = async (invoiceId) => {
  let browser;
  try {
    const invoiceData = await Invoice.findByPk(invoiceId, {
      include: [
        { model: PurchaseOrder, as: 'po' },
        { model: User, as: 'creator', attributes: ['name'] },
        { model: Vendor, as: 'vendor' }
      ]
    });
    
    if (!invoiceData) {
      throw new Error('Invoice not found');
    }

    const payments = await Payment.findAll({ where: { invoiceId } });
    const totalPaid = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    const amountDue = invoiceData.grandTotal - totalPaid;
    
    const data = invoiceData.toJSON();
    const templatePath = path.join(process.cwd(), 'server/templates/invoice.ejs');
    const html = await ejs.renderFile(templatePath, {
      doc: data,
      type: 'INVOICE',
      date: new Date(invoiceData.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      totalPaid,
      amountDue
    });

    browser = await puppeteer.launch({
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage', 
        '--disable-gpu'
      ],
      headless: true
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({ 
      format: 'A4', 
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });
    
    return pdfBuffer;
  } finally {
    if (browser) await browser.close();
  }
};
