import mongoose, { Schema, Model } from 'mongoose';
import { IStoreUser } from '@/types';

const StoreUserSchema = new Schema<IStoreUser>(
  {
    store_id: { type: Schema.Types.ObjectId, ref: 'stores', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'user_accounts', required: true },
    role: { type: String, enum: ['admin', 'manager', 'staff'], required: true },
    permissions: [{ type: String }],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'store_users',
  }
);

StoreUserSchema.index({ store_id: 1, user_id: 1 }, { unique: true });
StoreUserSchema.index({ user_id: 1 });

export const StoreUser: Model<IStoreUser> =
  mongoose.models.store_users || mongoose.model<IStoreUser>('store_users', StoreUserSchema);
