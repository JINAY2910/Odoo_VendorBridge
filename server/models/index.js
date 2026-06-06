// import mongoose, { Schema } from 'mongoose';

// // Vendor Model
// const VendorSchema = new Schema({
//   vendorName: { type: String, required: true },
//   contactDetails: { type: String, required: true },
//   address: { type: String, required: true },
//   gstNumber: { type: String, required: true },
//   createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
// }, { timestamps: true });


// // Quotation Model
// const QuotationSchema = new Schema({
//   quotationNumber: { type: String, required: true, unique: true },
//   vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
//   lineItems: [{
//     itemName: { type: String, required: true },
//     quantity: { type: Number, required: true },
//     unitPrice: { type: Number, required: true },
//     tax: { type: Number, default: 0 },
//     discount: { type: Number, default: 0 }
//   }],
//   validUntil: { type: Date, required: true },
//   subtotal: { type: Number, required: true },
//   tax: { type: Number, default: 0 },
//   discount: { type: Number, default: 0 },
//   grandTotal: { type: Number, required: true },
//   status: { type: String, enum: ['Pending Approval', 'Approved', 'Rejected', 'Converted to PO'], default: 'Pending Approval' },
//   createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
//   remarks: { type: String }
// }, { timestamps: true });


// // PurchaseOrder Model
// const PurchaseOrderSchema = new Schema({
//   poNumber: { type: String, required: true, unique: true },
//   quotationId: { type: Schema.Types.ObjectId, ref: 'Quotation' },
//   vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
//   lineItems: [{
//     itemName: { type: String, required: true },
//     quantity: { type: Number, required: true },
//     unitPrice: { type: Number, required: true },
//     tax: { type: Number, default: 0 },
//     discount: { type: Number, default: 0 }
//   }],
//   subtotal: { type: Number, required: true },
//   tax: { type: Number, default: 0 },
//   discount: { type: Number, default: 0 },
//   grandTotal: { type: Number, required: true },
//   status: { type: String, enum: ['Pending Approval', 'Approved', 'Rejected', 'Closed'], default: 'Pending Approval' },
//   createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
//   remarks: { type: String }
// }, { timestamps: true });


// // Invoice Model
// const InvoiceSchema = new Schema({
//   invoiceNumber: { type: String, required: true, unique: true },
//   poId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
//   vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
//   items: [{
//     itemName: { type: String, required: true },
//     quantity: { type: Number, required: true },
//     unitPrice: { type: Number, required: true },
//     tax: { type: Number, default: 0 },
//     grandTotal: { type: Number, required: true }
//   }],
//   subtotal: { type: Number, required: true },
//   tax: { type: Number, default: 0 },
//   grandTotal: { type: Number, required: true },
//   status: { type: String, enum: ['Unpaid', 'Partially Paid', 'Paid'], default: 'Unpaid' },
//   createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
// }, { timestamps: true });


// // Payment Model
// const PaymentSchema = new Schema({
//   invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
//   amountPaid: { type: Number, required: true },
//   paymentDate: { type: Date, default: Date.now },
//   paymentMethod: { type: String, required: true },
//   remarks: { type: String },
//   createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
// }, { timestamps: true });


// // ApprovalLog Model
// const ApprovalLogSchema = new Schema({
//   entityType: { type: String, enum: ['Quotation', 'PurchaseOrder'], required: true },
//   entityId: { type: Schema.Types.ObjectId, required: true },
//   action: { type: String, enum: ['Approve', 'Reject'], required: true },
//   remarks: { type: String },
//   performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
// }, { timestamps: true });


// export const Vendor = mongoose.model('Vendor', VendorSchema);
// export const Quotation = mongoose.model('Quotation', QuotationSchema);
// export const PurchaseOrder = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
// export const Invoice = mongoose.model('Invoice', InvoiceSchema);
// export const Payment = mongoose.model('Payment', PaymentSchema);
// export const ApprovalLog = mongoose.model('ApprovalLog', ApprovalLogSchema);

export { default as Vendor } from "./vendor.js";
export { default as Quotation } from "./quotation.js";
export { default as PurchaseOrder } from "./purchaseOrder.js";
export { default as Invoice } from "./invoice.js";
export { default as Payment } from "./payment.js";
export { default as ApprovalLog } from "./approvalLog.js";
export { default as Product } from "./product.js";
export { default as User } from "./User.js";