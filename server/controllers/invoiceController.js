import { Invoice, PurchaseOrder, Vendor, User } from '../models/index.js';
import { UserRole } from '../models/User.js';
import { generateInvoicePDFBuffer } from '../utils/pdfHelper.js';
import { sendInvoiceEmail } from '../utils/mailer.js';
import { logActivity } from '../utils/activityLogger.js';

// Auto-generate invoice number (e.g., INV-2026-0001)
const generateInvoiceNumber = async () => {
  const count = await Invoice.count();
  const year = new Date().getFullYear();
  return `INV-${year}-${(count + 1).toString().padStart(4, '0')}`;
};

export const createInvoice = async (req, res) => {
  try {
    const { poId, items } = req.body;

    const po = await PurchaseOrder.findByPk(poId);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    if (po.status !== 'Approved') {
      return res.status(400).json({ message: 'Invoices can only be created from Approved POs' });
    }

    // Calculate total for this invoice
    let invoiceSubtotal = 0;
    let invoiceTax = 0;
    items.forEach((item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      invoiceSubtotal += itemSubtotal;
      invoiceTax += itemSubtotal * (item.tax || 0) / 100;
      item.grandTotal = itemSubtotal + itemSubtotal * (item.tax || 0) / 100;
    });
    const invoiceGrandTotal = invoiceSubtotal + invoiceTax;

    // Calculate already invoiced amount
    const existingInvoices = await Invoice.findAll({ where: { poId } });
    const alreadyInvoiced = existingInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const remainingAmount = po.grandTotal - alreadyInvoiced;

    // Strict validation: prevent overbilling
    if (invoiceGrandTotal > remainingAmount + 0.01) { // Adding small epsilon for float precision
      return res.status(400).json({
        message: 'Invoice amount exceeds remaining PO balance',
        poTotal: po.grandTotal,
        alreadyInvoiced,
        remainingAmount,
        requestedAmount: invoiceGrandTotal
      });
    }

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
      invoiceNumber,
      poId,
      vendorId: po.vendorId,
      items,
      subtotal: invoiceSubtotal,
      tax: invoiceTax,
      grandTotal: invoiceGrandTotal,
      createdBy: req.user._id,
      status: 'Unpaid'
    });

    await logActivity('Create', 'Invoice', invoice.id, req.user._id);

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const query = req.user.role === UserRole.USER ? { createdBy: req.user._id } : {};
    const invoices = await Invoice.findAll({
      where: query,
      include: [
        { model: Vendor, as: 'vendor', attributes: ['vendorName'] },
        { model: PurchaseOrder, as: 'po', attributes: ['poNumber'] },
        { model: User, as: 'creator', attributes: ['name'] }
      ]
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: Vendor, as: 'vendor', attributes: ['vendorName', 'contactDetails', 'address', 'gstNumber'] },
        { model: PurchaseOrder, as: 'po', attributes: ['poNumber', 'grandTotal'] },
        { model: User, as: 'creator', attributes: ['name'] }
      ]
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const sendInvoiceEmailController = async (req, res) => {
  try {
    const { email } = req.body;
    const id = req.params.id;

    if (!email) {
      return res.status(400).json({ message: 'Recipient email is required' });
    }

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const pdfBuffer = await generateInvoicePDFBuffer(id);
    await sendInvoiceEmail(email, pdfBuffer, invoice.invoiceNumber);

    res.json({ message: 'Invoice email sent successfully' });
  } catch (error) {
    console.error('Email invoice error:', error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};