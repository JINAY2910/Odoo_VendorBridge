import mongoose, { Schema } from 'mongoose';

// PurchaseOrder Model
const PurchaseOrderSchema = new Schema({
    poNumber: { type: String, required: true, unique: true },
    quotationId: { type: Schema.Types.ObjectId, ref: 'Quotation' },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    lineItems: [{
        itemName: { type: String, required: true },
        hsnCode: { type: String },
        quantity: { type: Number, required: true },

        unitPrice: { type: Number, required: true },
        tax: { type: Number, default: 0 },
        discount: { type: Number, default: 0 }
    }],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    status: { type: String, enum: ['Pending Approval', 'Approved', 'Rejected', 'Closed'], default: 'Pending Approval' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String }
}, { timestamps: true });

export default mongoose.model("PurchaseOrder", PurchaseOrderSchema);