import mongoose, { Schema } from 'mongoose';

// Quotation Model
const QuotationSchema = new Schema({
    quotationNumber: { type: String, required: true, unique: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    lineItems: [{
        itemName: { type: String, required: true },
        hsnCode: { type: String },
        quantity: { type: Number, required: true },

        unitPrice: { type: Number, required: true },
        tax: { type: Number, default: 0 },
        discount: { type: Number, default: 0 }
    }],
    validUntil: { type: Date, required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    status: { type: String, enum: ['Pending Approval', 'Approved', 'Rejected', 'Converted to PO'], default: 'Pending Approval' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String }
}, { timestamps: true });

export default mongoose.model("Quotation", QuotationSchema);