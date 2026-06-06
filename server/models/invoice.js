import mongoose, { Schema } from 'mongoose';

// Invoice Model
const InvoiceSchema = new Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    poId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    items: [{
        itemName: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        tax: { type: Number, default: 0 },
        grandTotal: { type: Number, required: true }
    }],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    status: { type: String, enum: ['Unpaid', 'Partially Paid', 'Paid'], default: 'Unpaid' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model("Invoice", InvoiceSchema);