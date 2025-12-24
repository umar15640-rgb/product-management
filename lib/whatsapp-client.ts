import { WhatsAppEventLog } from '@/models/WhatsAppEventLog';
import { Types } from 'mongoose';

interface WhatsAppMessage {
  to: string;
  type: 'text' | 'image' | 'document';
  text?: string;
  media_url?: string;
  caption?: string;
  filename?: string;
}

export class WhatsAppClient {
  private apiUrl: string;
  private apiKey: string;
  private phoneNumber: string;

  constructor() {
    this.apiUrl = process.env.KWIC_API_URL || '';
    this.apiKey = process.env.KWIC_API_KEY || '';
    this.phoneNumber = process.env.KWIC_PHONE_NUMBER || '';
  }

  async sendMessage(message: WhatsAppMessage, storeId?: Types.ObjectId) {
    try {
      const response = await fetch(`${this.apiUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: this.phoneNumber,
          ...message,
        }),
      });

      const result = await response.json();

      await WhatsAppEventLog.create({
        store_id: storeId,
        phone_number: message.to,
        message_type: 'outgoing',
        message_content: message.text || message.caption || 'Media message',
        event_type: 'message_sent',
        metadata: { result },
      });

      return result;
    } catch (error) {
      console.error('WhatsApp send error:', error);
      throw error;
    }
  }

  async sendText(to: string, text: string, storeId?: Types.ObjectId) {
    return this.sendMessage({ to, type: 'text', text }, storeId);
  }

  async sendDocument(to: string, documentUrl: string, filename: string, caption?: string, storeId?: Types.ObjectId) {
    return this.sendMessage({
      to,
      type: 'document',
      media_url: documentUrl,
      filename,
      caption,
    }, storeId);
  }

  async sendImage(to: string, imageUrl: string, caption?: string, storeId?: Types.ObjectId) {
    return this.sendMessage({
      to,
      type: 'image',
      media_url: imageUrl,
      caption,
    }, storeId);
  }
}

export const whatsappClient = new WhatsAppClient();
