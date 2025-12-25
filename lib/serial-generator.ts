import { Store } from '@/models/Store';
import { Product } from '@/models/Product';
import { Types } from 'mongoose';

export async function generateSerialNumber(storeId: string | Types.ObjectId): Promise<{
  serial_number: string;
  serial_prefix_used: string;
  serial_suffix_used: string;
}> {
  const store = await Store.findById(storeId);

  if (!store) {
    throw new Error('Store not found');
  }

  let isUnique = false;
  let serial_number = '';
  const maxRetries = 10;
  let attempts = 0;

  while (!isUnique && attempts < maxRetries) {
    // Generate a random 6-digit number
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    serial_number = `${store.serial_prefix}${randomNum}${store.serial_suffix || ''}`;

    // Check uniqueness
    const existing = await Product.findOne({ serial_number });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique serial number after multiple attempts');
  }

  // We no longer increment a counter since it's random
  
  return {
    serial_number,
    serial_prefix_used: store.serial_prefix,
    serial_suffix_used: store.serial_suffix || '',
  };
}