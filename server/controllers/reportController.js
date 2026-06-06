
import { Quotation, PurchaseOrder, Invoice, Vendor, Payment } from '../models/index.js';
import { UserRole } from '../models/User.js';
import mongoose from 'mongoose';

export const getGeneralStats = async (req, res) => {
  try {
    const query = req.user.role === UserRole.USER ? { createdBy: req.user._id } : {};
    const [quotations, pos, invoices, vendors, payments] = await Promise.all([
    Quotation.find(query),
    PurchaseOrder.find(query),
    Invoice.find(query),
    Vendor.find(),
    Payment.find(req.user.role === UserRole.USER ? { createdBy: req.user._id } : {})]
    );

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
    const matchStage = req.user.role === UserRole.USER ? { $match: { createdBy: new mongoose.Types.ObjectId(req.user._id) } } : { $match: {} };
    const trends = await PurchaseOrder.aggregate([
    matchStage,
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalValue: { $sum: "$grandTotal" },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id": 1 } }]
    );

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedTrends = trends.map((t) => ({
      month: monthNames[t._id - 1],
      value: t.totalValue,
      count: t.count
    }));

    res.json(formattedTrends);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getVendorSpending = async (req, res) => {
  try {
    const matchStage = req.user.role === UserRole.USER ? { $match: { createdBy: new mongoose.Types.ObjectId(req.user._id) } } : { $match: {} };
    const spending = await PurchaseOrder.aggregate([
    matchStage,
    {
      $group: {
        _id: "$vendorId",
        totalSpent: { $sum: "$grandTotal" }
      }
    },
    {
      $lookup: {
        from: "vendors",
        localField: "_id",
        foreignField: "_id",
        as: "vendor"
      }
    },
    { $unwind: "$vendor" },
    {
      $project: {
        name: "$vendor.vendorName",
        value: "$totalSpent"
      }
    },
    { $sort: { value: -1 } },
    { $limit: 5 }]
    );

    res.json(spending);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};