import mongoose, { Schema, Model } from 'mongoose';
import { IWarranty } from '@/types';

const WarrantySchema = new Schema<IWarranty>(
  {
    product_id: { type: Schema.Types.ObjectId, ref: 'products', required: true },
    customer_id: { type: Schema.Types.ObjectId, ref: 'customers', required: true },
    store_id: { type: Schema.Types.ObjectId, ref: 'stores', required: true },
    warranty_start: { type: Date, required: true },
    warranty_end: { type: Date, required: true },
    status: { type: String, enum: ['active', 'expired', 'claimed', 'void'], default: 'active' },
    qr_code_url: { type: String },
    warranty_pdf_url: { type: String },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'warranties',
  }
);

WarrantySchema.index({ product_id: 1 }, { unique: true });
WarrantySchema.index({ customer_id: 1 });
WarrantySchema.index({ store_id: 1 });
WarrantySchema.index({ status: 1 });

export const Warranty: Model<IWarranty> =
  mongoose.models.warranties || mongoose.model<IWarranty>('warranties', WarrantySchema);
