import User from './User.js';
import Vendor from './vendor.js';
import Product from './product.js';
import Quotation from './quotation.js';
import PurchaseOrder from './purchaseOrder.js';
import Invoice from './invoice.js';
import Payment from './payment.js';
import ApprovalLog from './approvalLog.js';
import RFQ from './rfq.js';

// Setup Associations

// Vendor associations
Vendor.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

// Product associations
Product.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

// RFQ associations
RFQ.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

// Quotation associations
Quotation.belongsTo(RFQ, { as: 'rfq', foreignKey: 'rfqId' });
Quotation.belongsTo(Vendor, { as: 'vendor', foreignKey: 'vendorId' });
Quotation.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
Quotation.belongsTo(User, { as: 'approver', foreignKey: 'approvedBy' });

// PurchaseOrder associations
PurchaseOrder.belongsTo(Quotation, { as: 'quotation', foreignKey: 'quotationId' });
PurchaseOrder.belongsTo(Vendor, { as: 'vendor', foreignKey: 'vendorId' });
PurchaseOrder.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
PurchaseOrder.belongsTo(User, { as: 'approver', foreignKey: 'approvedBy' });

// Invoice associations
Invoice.belongsTo(PurchaseOrder, { as: 'po', foreignKey: 'poId' });
Invoice.belongsTo(Vendor, { as: 'vendor', foreignKey: 'vendorId' });
Invoice.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

// Payment associations
Payment.belongsTo(Invoice, { as: 'invoice', foreignKey: 'invoiceId' });
Payment.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

// ApprovalLog associations
ApprovalLog.belongsTo(User, { as: 'performer', foreignKey: 'performedBy' });

export {
  User,
  Vendor,
  Product,
  Quotation,
  PurchaseOrder,
  Invoice,
  Payment,
  ApprovalLog,
  RFQ
};