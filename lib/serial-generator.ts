import { Store } from '@/models/Store';
import { Types } from 'mongoose';

export async function generateSerialNumber(storeId: string | Types.ObjectId): Promise<{
  serial_number: string;
  serial_prefix_used: string;
  serial_suffix_used: string;
  serial_number_index: number;
}> {
  const store = await Store.findByIdAndUpdate(
    storeId,
    { $inc: { serial_counter: 1 } },
    { new: true }
  );

  if (!store) {
    throw new Error('Store not found');
  }

  const index = store.serial_counter;
  const serial_number = `${store.serial_prefix}${index}${store.serial_suffix}`;

  return {
    serial_number,
    serial_prefix_used: store.serial_prefix,
    serial_suffix_used: store.serial_suffix,
    serial_number_index: index,
  };
}
