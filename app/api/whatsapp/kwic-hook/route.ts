import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WhatsAppEventLog } from '@/models/WhatsAppEventLog';
import { Product } from '@/models/Product';
import { Warranty } from '@/models/Warranty';
import { Customer } from '@/models/Customer';
import { Claim } from '@/models/Claim';
import { whatsappClient } from '@/lib/whatsapp-client';

interface WhatsAppWebhookPayload {
  from: string;
  message: {
    type: string;
    text?: { body: string };
  };
}

const userSessions = new Map<string, { state: string; data: any }>();

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const payload: WhatsAppWebhookPayload = await req.json();
    const phoneNumber = payload.from;
    const messageText = payload.message.text?.body?.trim().toLowerCase() || '';

    await WhatsAppEventLog.create({
      phone_number: phoneNumber,
      message_type: 'incoming',
      message_content: messageText,
      event_type: 'message_received',
      metadata: payload,
    });

    const session = userSessions.get(phoneNumber) || { state: 'idle', data: {} };

    let response = '';

    if (messageText === 'hi' || messageText === 'hello' || messageText === 'menu') {
      response = `Welcome to Warranty Management! 🛡️

Please choose an option:
1️⃣ Register Warranty
2️⃣ Check Warranty
3️⃣ Create Claim
4️⃣ Check Claim Status

Reply with the number of your choice.`;
      session.state = 'menu';
    } else if (session.state === 'menu') {
      if (messageText === '1') {
        response = 'Please enter the product serial number to register warranty:';
        session.state = 'register_warranty_serial';
      } else if (messageText === '2') {
        response = 'Please enter the product serial number to check warranty:';
        session.state = 'check_warranty_serial';
      } else if (messageText === '3') {
        response = 'Please enter the product serial number to create a claim:';
        session.state = 'create_claim_serial';
      } else if (messageText === '4') {
        response = 'Please enter your claim ID:';
        session.state = 'check_claim_id';
      } else {
        response = 'Invalid option. Please reply with 1, 2, 3, or 4.';
      }
    } else if (session.state === 'check_warranty_serial') {
      const product = await Product.findOne({ serial_number: messageText.toUpperCase() });
      
      if (!product) {
        response = 'Product not found. Please check the serial number and try again.';
      } else {
        const warranty = await Warranty.findOne({ product_id: product._id })
          .populate('customer_id')
          .populate('store_id');

        if (!warranty) {
          response = `Product found: ${product.brand} ${product.product_model}\nNo warranty registered yet.`;
        } else {
          const daysLeft = Math.ceil((new Date(warranty.warranty_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          response = `✅ Warranty Details:
Product: ${product.brand} ${product.product_model}
Serial: ${product.serial_number}
Status: ${warranty.status}
Valid Until: ${new Date(warranty.warranty_end).toLocaleDateString()}
Days Remaining: ${daysLeft > 0 ? daysLeft : 'Expired'}`;
        }
      }
      session.state = 'idle';
    } else if (session.state === 'create_claim_serial') {
      const product = await Product.findOne({ serial_number: messageText.toUpperCase() });
      
      if (!product) {
        response = 'Product not found. Please check the serial number and try again.';
        session.state = 'idle';
      } else {
        const warranty = await Warranty.findOne({ product_id: product._id });
        
        if (!warranty) {
          response = 'No warranty found for this product.';
          session.state = 'idle';
        } else {
          session.data.warrantyId = warranty._id.toString();
          response = `Please describe the issue with your ${product.brand} ${product.product_model}:`;
          session.state = 'create_claim_description';
        }
      }
    } else if (session.state === 'create_claim_description') {
      const warranty = await Warranty.findById(session.data.warrantyId).populate('customer_id');
      
      const claim = await Claim.create({
        warranty_id: session.data.warrantyId,
        store_id: warranty!.store_id,
        claim_type: 'repair',
        description: messageText,
        status: 'pending',
        timeline_events: [
          {
            timestamp: new Date(),
            action: 'Claim created via WhatsApp',
          },
        ],
      });

      response = `✅ Claim created successfully!
Claim ID: ${claim._id}
Status: Pending
We will review your claim and get back to you soon.`;
      session.state = 'idle';
      session.data = {};
    } else if (session.state === 'check_claim_id') {
      const claim = await Claim.findById(messageText)
        .populate({
          path: 'warranty_id',
          populate: { path: 'product_id' },
        });

      if (!claim) {
        response = 'Claim not found. Please check the ID and try again.';
      } else {
        const product = (claim.warranty_id as any).product_id;
        response = `📋 Claim Status:
Claim ID: ${claim._id}
Product: ${product.brand} ${product.product_model}
Type: ${claim.claim_type}
Status: ${claim.status}
Created: ${new Date(claim.created_at).toLocaleDateString()}

Latest Update: ${claim.timeline_events[claim.timeline_events.length - 1]?.action || 'No updates'}`;
      }
      session.state = 'idle';
    } else {
      response = 'Type "menu" to see available options.';
    }

    userSessions.set(phoneNumber, session);

    await whatsappClient.sendText(phoneNumber, response);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
