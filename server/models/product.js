import mongoose, { Schema } from 'mongoose';

const ProductSchema = new Schema({
    name: { type: String, required: true },
    code: { type: String, required: true }, // HSN or SAC code
    codeType: { type: String, enum: ['HSN', 'SAC'], required: true },
    gstRate: { type: Number, required: true },
    defaultPrice: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model("Product", ProductSchema);
