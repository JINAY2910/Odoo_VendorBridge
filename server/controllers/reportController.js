import { fn, col, Op } from 'sequelize';
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

export const getReportsSummary = async (req, res) => {
  try {
    const totalVendors = await Vendor.count();
    const totalPOs = await PurchaseOrder.count();
    const totalInvoiced = await Invoice.sum('grandTotal') || 0;

    const pendingQuotations = await Quotation.count({ where: { status: 'Pending Approval' } });
    const pendingPOs = await PurchaseOrder.count({ where: { status: 'Pending Approval' } });
    const pendingApprovals = pendingQuotations + pendingPOs;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const totalPOsThisMonth = await PurchaseOrder.count({
      where: {
        createdAt: { [Op.gte]: startOfMonth }
      }
    });

    const totalInvoiceValue = totalInvoiced;

    // Top 5 vendors by PO count (including totalSpent)
    const topVendorsRaw = await PurchaseOrder.findAll({
      attributes: [
        'vendorId',
        [fn('COUNT', col('PurchaseOrder.id')), 'poCount'],
        [fn('SUM', col('grandTotal')), 'totalSpent']
      ],
      include: [{ model: Vendor, as: 'vendor', attributes: ['vendorName'] }],
      group: ['vendorId', 'vendor.id'],
      order: [[fn('SUM', col('grandTotal')), 'DESC']],
      limit: 5
    });

    const topVendors = topVendorsRaw.map(v => ({
      vendorName: v.vendor?.vendorName || `Vendor #${v.vendorId}`,
      poCount: parseInt(v.getDataValue('poCount'), 10) || 0,
      totalSpent: parseFloat(v.getDataValue('totalSpent')) || 0
    }));

    // Monthly Spend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlySpendRaw = await PurchaseOrder.findAll({
      where: {
        createdAt: { [Op.gte]: sixMonthsAgo }
      },
      attributes: [
        [fn('YEAR', col('createdAt')), 'year'],
        [fn('MONTH', col('createdAt')), 'monthNum'],
        [fn('SUM', col('grandTotal')), 'totalSpent']
      ],
      group: [fn('YEAR', col('createdAt')), fn('MONTH', col('createdAt'))],
      order: [
        [fn('YEAR', col('createdAt')), 'ASC'],
        [fn('MONTH', col('createdAt')), 'ASC']
      ],
      raw: true
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlySpend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthNum = d.getMonth() + 1;
      const year = d.getFullYear();
      const name = monthNames[d.getMonth()];

      const match = monthlySpendRaw.find(p => parseInt(p.monthNum, 10) === monthNum && parseInt(p.year, 10) === year);
      monthlySpend.push({
        month: `${name} ${year}`,
        spend: match ? parseFloat(match.totalSpent || 0) : 0
      });
    }

    res.json({
      totalVendors,
      totalPOs,
      totalInvoiced,
      pendingApprovals,
      totalPOsThisMonth,
      totalInvoiceValue,
      topVendors,
      monthlySpend
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};