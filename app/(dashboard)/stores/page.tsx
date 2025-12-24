'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

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
    setFormData({
      store_name: '',
      address: '',
      contact_phone: '',
      serial_prefix: 'PRD',
      serial_suffix: '',
      whatsapp_enabled: false,
      whatsapp_number: '',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Stores</h1>
            <p className="text-neutral-600">Manage your store locations and configurations</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="h-11">
            <span className="mr-2">+</span> Add Store
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Store Network</CardTitle>
          </CardHeader>
          <CardContent>
            {stores.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🏪</div>
                <p className="text-neutral-600 font-medium">No stores found</p>
                <p className="text-neutral-500 text-sm">Add your first store to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                        <TableCell className="font-medium text-neutral-900">{store.store_name}</TableCell>
                        <TableCell className="text-neutral-600">{store.address || '-'}</TableCell>
                        <TableCell>{store.contact_phone || '-'}</TableCell>
                        <TableCell>
                          <code className="bg-neutral-100 px-2 py-1 rounded text-sm font-mono">
                            {store.serial_prefix}####{store.serial_suffix || 'XXXX'}
                          </code>
                        </TableCell>
                        <TableCell>
                          {store.whatsapp_enabled ? (
                            <Badge variant="success">✓ Enabled</Badge>
                          ) : (
                            <Badge variant="default">Disabled</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Store" size="md">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Store Name"
              placeholder="Main Store"
              value={formData.store_name}
              onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
              required
            />

            <Input
              label="Address"
              placeholder="123 Main St, City, State 12345"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            <Input
              label="Contact Phone"
              placeholder="+1 (555) 123-4567"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Serial Prefix"
                placeholder="PRD"
                value={formData.serial_prefix}
                onChange={(e) => setFormData({ ...formData, serial_prefix: e.target.value })}
                required
              />

              <Input
                label="Serial Suffix"
                placeholder="2024"
                value={formData.serial_suffix}
                onChange={(e) => setFormData({ ...formData, serial_suffix: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <input
                type="checkbox"
                id="whatsapp_enabled"
                checked={formData.whatsapp_enabled}
                onChange={(e) => setFormData({ ...formData, whatsapp_enabled: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-primary-600"
              />
              <label htmlFor="whatsapp_enabled" className="text-sm font-medium text-neutral-700">
                Enable WhatsApp Integration
              </label>
            </div>

            {formData.whatsapp_enabled && (
              <Input
                label="WhatsApp Number"
                placeholder="+1 (555) 987-6543"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              />
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Store</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
