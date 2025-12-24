import mongoose, { Schema, Model } from 'mongoose';
import { IWhatsAppEventLog } from '@/types';

const WhatsAppEventLogSchema = new Schema<IWhatsAppEventLog>(
  {
    store_id: { type: Schema.Types.ObjectId, ref: 'stores' },
    phone_number: { type: String, required: true },
    message_type: { type: String, enum: ['incoming', 'outgoing'], required: true },
    message_content: { type: String, required: true },
    event_type: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    collection: 'whatsapp_event_logs',
  }
);

WhatsAppEventLogSchema.index({ phone_number: 1 });
WhatsAppEventLogSchema.index({ store_id: 1 });
WhatsAppEventLogSchema.index({ created_at: -1 });

export const WhatsAppEventLog: Model<IWhatsAppEventLog> =
  mongoose.models.whatsapp_event_logs || mongoose.model<IWhatsAppEventLog>('whatsapp_event_logs', WhatsAppEventLogSchema);
