import puppeteer from 'puppeteer';
import ejs from 'ejs';
import path from 'path';
import { Quotation, PurchaseOrder, Invoice, Payment } from '../models/index.js';

export const downloadInvoicePDF = async (req, res) => {
  let browser;
  try {
    const id = req.params.id;
    const invoiceData = await Invoice.findById(id).populate('poId').populate('createdBy', 'name').populate('vendorId');
    
    if (!invoiceData) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const payments = await Payment.find({ invoiceId: id });
    const totalPaid = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    const amountDue = invoiceData.grandTotal - totalPaid;
    
    const data = invoiceData.toObject();
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
    
    const filename = `invoice-${data.invoiceNumber || id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  } finally {
    if (browser) await browser.close();
  }
};

export const generatePDF = async (req, res) => {
  let browser;
  try {
    const { type, id } = req.params;
    let data;

    if (type === 'quotation') {
      data = await Quotation.findById(id).populate('vendorId').populate('createdBy', 'name');
    } else if (type === 'po') {
      data = await PurchaseOrder.findById(id).populate('vendorId').populate('createdBy', 'name');
    } else if (type === 'invoice') {
      const invoiceData = await Invoice.findById(id).populate('vendorId').populate('createdBy', 'name');
      if (invoiceData) {
        const payments = await Payment.find({ invoiceId: id });
        const totalPaid = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
        const balanceDue = invoiceData.grandTotal - totalPaid;
        data = invoiceData.toObject();
        data.totalPaid = totalPaid;
        data.balanceDue = balanceDue;
      }
    }

    if (!data) return res.status(404).json({ message: 'Document not found' });

    let totalPaid = 0;
    let amountDue = data.grandTotal || 0;

    if (type === 'invoice') {
      const payments = await Payment.find({ invoiceId: id });
      totalPaid = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
      amountDue = data.grandTotal - totalPaid;
    }

    const templateName = type === 'invoice' ? 'invoice.ejs' : 'document.ejs';
    const templatePath = path.join(process.cwd(), `server/templates/${templateName}`);
    const html = await ejs.renderFile(templatePath, {
      doc: data,
      type: type.toUpperCase(),
      date: new Date(data.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
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
    
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    const filename = `${type.toUpperCase()}-${data.invoiceNumber || data.poNumber || data.quotationNumber || id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  } finally {
    if (browser) await browser.close();
  }
};

export const generateInvoicePDF = async (req, res) => {
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
        { description: "Logo Design", qty: 5, price: 100, total: 500 },
        { description: "Website Design", qty: 2, price: 800, total: 1600 },
        { description: "Brand Design", qty: 3, price: 300, total: 900 },
        { description: "Banner Design", qty: 2, price: 300, total: 600 },
        { description: "Flyer Design", qty: 2, price: 400, total: 800 },
        { description: "Social Media Template", qty: 10, price: 50, total: 500 },
        { description: "Name Card", qty: 15, price: 25, total: 750 },
        { description: "Web Developer", qty: 2, price: 1000, total: 2000 }
      ],
      subTotal: 7650,
      taxRate: 15,
      taxAmount: 1148,
      grandTotal: 8798,
      bankName: "Borcelle",
      accountNumber: "123-456-7890"
    };

    const templatePath = path.join(process.cwd(), 'server/templates/document.ejs');
    const html = await ejs.renderFile(templatePath, {
      invoice: mockInvoiceData
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
    
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  } finally {
    if (browser) await browser.close();
  }
};