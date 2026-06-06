import mongoose, { Schema } from 'mongoose';

// ApprovalLog Model
const ApprovalLogSchema = new Schema({
    entityType: { type: String, enum: ['Quotation', 'PurchaseOrder'], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    action: { type: String, enum: ['Approve', 'Reject'], required: true },
    remarks: { type: String },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model("ApprovalLog", ApprovalLogSchema);