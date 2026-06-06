import mongoose, { Schema } from 'mongoose';

// Vendor Model
const VendorSchema = new Schema({
    vendorName: { type: String, required: true },
    contactDetails: { type: String, required: true },
    address: { type: String, required: true },
    gstNumber: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model("Vendor", VendorSchema);