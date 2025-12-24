'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

export default function StoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    store_name: '',
    address: '',
    contact_phone: '',
    serial_prefix: 'PRD',
    serial_suffix: '',
    whatsapp_enabled: false,
    whatsapp_number: '',
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/stores', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setStores(data.stores || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    await fetch('/api/stores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    setIsModalOpen(false);
    fetchStores();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Stores</h1>
          <Button onClick={() => setIsModalOpen(true)}>Add Store</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Store List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Serial Format</TableHead>
                  <TableHead>WhatsApp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store._id}>
                    <TableCell className="font-medium">{store.store_name}</TableCell>
                    <TableCell>{store.address || '-'}</TableCell>
                    <TableCell>{store.contact_phone || '-'}</TableCell>
                    <TableCell className="font-mono">{store.serial_prefix}####{store.serial_suffix}</TableCell>
                    <TableCell>{store.whatsapp_enabled ? '✅' : '❌'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Store">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Store Name"
              value={formData.store_name}
              onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
              required
            />

            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            <Input
              label="Contact Phone"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Serial Prefix"
                value={formData.serial_prefix}
                onChange={(e) => setFormData({ ...formData, serial_prefix: e.target.value })}
                required
              />

              <Input
                label="Serial Suffix"
                value={formData.serial_suffix}
                onChange={(e) => setFormData({ ...formData, serial_suffix: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="whatsapp_enabled"
                checked={formData.whatsapp_enabled}
                onChange={(e) => setFormData({ ...formData, whatsapp_enabled: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="whatsapp_enabled" className="text-sm font-medium">
                Enable WhatsApp Integration
              </label>
            </div>

            {formData.whatsapp_enabled && (
              <Input
                label="WhatsApp Number"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              />
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Store</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
