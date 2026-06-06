
import { PurchaseOrder, ApprovalLog } from '../models/index.js';


// Auto-generate PO number (e.g., PO-2026-0001)
const generatePONumber = async () => {
  const count = await PurchaseOrder.countDocuments();
  const year = new Date().getFullYear();
  return `PO-${year}-${(count + 1).toString().padStart(4, '0')}`;
};

export const createPO = async (req, res) => {
  try {
    const { vendorId, quotationId, lineItems, discount = 0 } = req.body;

    let subtotal = 0;
    let tax = 0;

    lineItems.forEach((item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      subtotal += itemSubtotal;
      tax += itemSubtotal * (item.tax || 0) / 100;
    });

    const grandTotal = subtotal + tax - discount;
    const poNumber = await generatePONumber();

    const po = await PurchaseOrder.create({
      poNumber,
      vendorId,
      quotationId: quotationId || undefined,
      lineItems,
      subtotal,
      tax,
      discount,
      grandTotal,
      createdBy: req.user._id,
      status: 'Pending Approval'
    });

    res.status(201).json(po);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getPOs = async (req, res) => {
  try {
    // Allow USER to see all POs so they can create invoices from them
    const query = {};
    const pos = await PurchaseOrder.find(query).
    populate('vendorId', 'vendorName').
    populate('quotationId', 'quotationNumber').
    populate('createdBy', 'name').
    populate('approvedBy', 'name');
    res.json(pos);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getPOById = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id).
    populate('vendorId', 'vendorName contactDetails address gstNumber').
    populate('quotationId', 'quotationNumber').
    populate('createdBy', 'name').
    populate('approvedBy', 'name');
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    res.json(po);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const approveRejectPO = async (req, res) => {
  try {
    const { action, remarks } = req.body; // action: 'Approve' or 'Reject'
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    if (po.status !== 'Pending Approval') {
      return res.status(400).json({ message: 'Purchase Order is not in Pending Approval status' });
    }

    po.status = action === 'Approve' ? 'Approved' : 'Rejected';
    po.approvedBy = req.user._id;
    po.remarks = remarks;
    await po.save();

    // Log approval action
    await ApprovalLog.create({
      entityType: 'PurchaseOrder',
      entityId: po._id,
      action,
      remarks,
      performedBy: req.user._id
    });

    res.json(po);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};