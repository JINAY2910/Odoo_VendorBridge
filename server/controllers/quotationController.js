import { Quotation, PurchaseOrder, ApprovalLog, Vendor, User } from '../models/index.js';
import { UserRole } from '../models/User.js';
import { logActivity } from '../utils/activityLogger.js';

// Auto-generate quotation number (e.g., QUO-2026-0001)
const generateQuotationNumber = async () => {
  const count = await Quotation.count();
  const year = new Date().getFullYear();
  return `QUO-${year}-${(count + 1).toString().padStart(4, '0')}`;
};

// Auto-generate PO number (e.g., PO-2026-0001)
const generatePONumber = async () => {
  const count = await PurchaseOrder.count();
  const year = new Date().getFullYear();
  return `PO-${year}-${(count + 1).toString().padStart(4, '0')}`;
};

export const createQuotation = async (req, res) => {
  try {
    const { vendorId, lineItems, validUntil, rfqId, timeline, notes } = req.body;

    let subtotal = 0;
    let tax = 0;
    let discount = 0;

    lineItems.forEach((item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      subtotal += itemSubtotal;
      tax += itemSubtotal * (item.tax || 0) / 100;
      discount += itemSubtotal * (item.discount || 0) / 100;
    });

    const grandTotal = subtotal + tax - discount;
    const quotationNumber = await generateQuotationNumber();

    const quotation = await Quotation.create({
      quotationNumber,
      vendorId,
      lineItems,
      validUntil,
      subtotal,
      tax,
      discount,
      grandTotal,
      createdBy: req.user._id,
      status: 'Pending Approval',
      rfqId: rfqId || null,
      timeline: timeline || null,
      notes: notes || null
    });

    await logActivity('Create', 'Quotation', quotation.id, req.user._id);

    res.status(201).json(quotation);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getQuotations = async (req, res) => {
  try {
    const query = req.user.role === UserRole.USER ? { createdBy: req.user._id } : {};
    const quotations = await Quotation.findAll({
      where: query,
      include: [
        { model: Vendor, as: 'vendor', attributes: ['vendorName'] },
        { model: User, as: 'creator', attributes: ['name'] },
        { model: User, as: 'approver', attributes: ['name'] }
      ]
    });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findByPk(req.params.id, {
      include: [
        { model: Vendor, as: 'vendor', attributes: ['vendorName', 'email', 'phone', 'address', 'gstNumber'] },
        { model: User, as: 'creator', attributes: ['name'] },
        { model: User, as: 'approver', attributes: ['name'] }
      ]
    });
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const approveRejectQuotation = async (req, res) => {
  try {
    const { action, remarks } = req.body; // action: 'Approve' or 'Reject'
    const quotation = await Quotation.findByPk(req.params.id);

    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    if (quotation.status !== 'Pending Approval') {
      return res.status(400).json({ message: 'Quotation is not in Pending Approval status' });
    }

    if (action === 'Approve') {
      quotation.status = 'Converted to PO';
      quotation.approvedBy = req.user._id;
      quotation.remarks = remarks;
      await quotation.save();

      // Auto-generate PO
      const poNumber = await generatePONumber();
      const po = await PurchaseOrder.create({
        poNumber,
        quotationId: quotation.id,
        vendorId: quotation.vendorId,
        lineItems: quotation.lineItems,
        subtotal: quotation.subtotal,
        tax: quotation.tax,
        discount: quotation.discount,
        grandTotal: quotation.grandTotal,
        createdBy: quotation.createdBy,
        status: 'Pending Approval'
      });

      // Log approval action
      await ApprovalLog.create({
        entityType: 'Quotation',
        entityId: quotation.id,
        action,
        remarks,
        performedBy: req.user._id
      });

      await logActivity(action, 'Quotation', quotation.id, req.user._id);
      await logActivity('Create', 'PurchaseOrder', po.id, req.user._id);
    } else {
      quotation.status = 'Rejected';
      quotation.approvedBy = req.user._id;
      quotation.remarks = remarks;
      await quotation.save();

      // Log approval action
      await ApprovalLog.create({
        entityType: 'Quotation',
        entityId: quotation.id,
        action,
        remarks,
        performedBy: req.user._id
      });

      await logActivity(action, 'Quotation', quotation.id, req.user._id);
    }

    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const convertToPO = async (req, res) => {
  try {
    const quotation = await Quotation.findByPk(req.params.id);

    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    if (quotation.status !== 'Approved') {
      return res.status(400).json({ message: 'Only Approved quotations can be converted to PO' });
    }

    const poNumber = await generatePONumber();

    const po = await PurchaseOrder.create({
      poNumber,
      quotationId: quotation.id,
      vendorId: quotation.vendorId,
      lineItems: quotation.lineItems,
      subtotal: quotation.subtotal,
      tax: quotation.tax,
      discount: quotation.discount,
      grandTotal: quotation.grandTotal,
      createdBy: quotation.createdBy, // Set to original quotation creator
      status: 'Pending Approval'
    });

    quotation.status = 'Converted to PO';
    await quotation.save();

    await logActivity('Create', 'PurchaseOrder', po.id, req.user._id);

    res.status(201).json(po);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getQuotationsByRFQ = async (req, res) => {
  try {
    const { rfqId } = req.params;
    const quotations = await Quotation.findAll({
      where: { rfqId },
      include: [
        { model: Vendor, as: 'vendor', attributes: ['vendorName'] },
        { model: User, as: 'creator', attributes: ['name'] },
        { model: User, as: 'approver', attributes: ['name'] }
      ],
      order: [['grandTotal', 'ASC']]
    });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};