import { Op } from 'sequelize';
import { Payment, Invoice, PurchaseOrder, Quotation, User } from '../models/index.js';
import { UserRole } from '../models/User.js';

export const recordPayment = async (req, res) => {
  try {
    const { invoiceId, amountPaid, paymentDate, paymentMethod, remarks } = req.body;

    const invoice = await Invoice.findByPk(invoiceId);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    // Calculate totalPaid for invoice
    const allPayments = await Payment.findAll({ where: { invoiceId } });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amountPaid, 0);
    const remainingAmount = invoice.grandTotal - totalPaid;

    // Check if payment exceeds remaining balance
    if (amountPaid > remainingAmount + 0.01) {
      return res.status(400).json({ message: 'Payment exceeds remaining balance' });
    }

    const payment = await Payment.create({
      invoiceId,
      amountPaid,
      paymentDate,
      paymentMethod,
      remarks,
      createdBy: req.user._id
    });

    // Update invoice status with new amount
    const newTotalPaid = totalPaid + amountPaid;

    if (newTotalPaid >= invoice.grandTotal - 0.01) {
      invoice.status = 'Paid';
    } else if (newTotalPaid > 0) {
      invoice.status = 'Partially Paid';
    }

    await invoice.save();

    // Close PO and Quotation if invoice is fully paid
    if (invoice.status === 'Paid') {
      const po = await PurchaseOrder.findByPk(invoice.poId);
      if (po && po.status !== 'Closed') {
        po.status = 'Closed';
        await po.save();

        if (po.quotationId) {
          const quotation = await Quotation.findByPk(po.quotationId);
          if (quotation && quotation.status !== 'Converted to PO') {
            quotation.status = 'Converted to PO';
            await quotation.save();
          }
        }
      }
    }

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getPayments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === UserRole.USER) {
      // Find invoices created by this user
      const userInvoices = await Invoice.findAll({
        where: { createdBy: req.user._id },
        attributes: ['id']
      });
      const invoiceIds = userInvoices.map((i) => i.id);
      query = { invoiceId: { [Op.in]: invoiceIds } };
    }

    const payments = await Payment.findAll({
      where: query,
      include: [
        { model: Invoice, as: 'invoice', attributes: ['invoiceNumber', 'grandTotal'] },
        { model: User, as: 'creator', attributes: ['name'] }
      ]
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getPaymentsByInvoice = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { invoiceId: req.params.invoiceId },
      include: [
        { model: User, as: 'creator', attributes: ['name'] }
      ]
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};