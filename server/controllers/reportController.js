import { fn, col } from 'sequelize';
import { Quotation, PurchaseOrder, Invoice, Vendor, Payment } from '../models/index.js';
import { UserRole } from '../models/User.js';

export const getGeneralStats = async (req, res) => {
  try {
    const query = req.user.role === UserRole.USER ? { createdBy: req.user._id } : {};
    const [quotations, pos, invoices, vendors, payments] = await Promise.all([
      Quotation.findAll({ where: query }),
      PurchaseOrder.findAll({ where: query }),
      Invoice.findAll({ where: query }),
      Vendor.findAll(),
      Payment.findAll({ where: req.user.role === UserRole.USER ? { createdBy: req.user._id } : {} })
    ]);

    const totalQuotationValue = quotations.reduce((sum, q) => sum + q.grandTotal, 0);
    const totalPOValue = pos.reduce((sum, p) => sum + p.grandTotal, 0);
    const totalInvoiceValue = invoices.reduce((sum, i) => sum + i.grandTotal, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);

    res.json({
      summary: {
        totalQuotations: quotations.length,
        totalPOs: pos.length,
        totalInvoices: invoices.length,
        totalVendors: vendors.length,
        totalQuotationValue,
        totalPOValue,
        totalInvoiceValue,
        pendingPayments: totalInvoiceValue - totalPaid
      }
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getMonthlyTrends = async (req, res) => {
  try {
    const query = req.user.role === UserRole.USER ? { createdBy: req.user._id } : {};
    const trends = await PurchaseOrder.findAll({
      attributes: [
        [fn('MONTH', col('createdAt')), 'monthNum'],
        [fn('SUM', col('grandTotal')), 'totalValue'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: query,
      group: [fn('MONTH', col('createdAt'))],
      order: [[fn('MONTH', col('createdAt')), 'ASC']],
      raw: true
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedTrends = trends.map((t) => ({
      month: monthNames[parseInt(t.monthNum, 10) - 1] || 'Unknown',
      value: parseFloat(t.totalValue || 0),
      count: parseInt(t.count || 0, 10)
    }));

    res.json(formattedTrends);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getVendorSpending = async (req, res) => {
  try {
    const query = req.user.role === UserRole.USER ? { createdBy: req.user._id } : {};
    const spending = await PurchaseOrder.findAll({
      attributes: [
        'vendorId',
        [fn('SUM', col('grandTotal')), 'totalSpent']
      ],
      where: query,
      include: [
        {
          model: Vendor,
          as: 'vendor',
          attributes: ['vendorName']
        }
      ],
      group: ['vendorId', 'vendor.id'],
      order: [[fn('SUM', col('grandTotal')), 'DESC']],
      limit: 5
    });

    const formattedSpending = spending.map((s) => ({
      name: s.vendor ? s.vendor.vendorName : 'Unknown Vendor',
      value: parseFloat(s.getDataValue('totalSpent') || 0)
    }));

    res.json(formattedSpending);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};