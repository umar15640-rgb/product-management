'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/context/store-context';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export default function CustomersPage() {
  const { activeStoreUser } = useStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    store_id: '',
    customer_name: '',
    phone: '',
    email: '',
    address: '',
    gst_number: '',
  });

  useEffect(() => {
    if (activeStoreUser) fetchCustomers();
    fetchStores();
  }, [activeStoreUser]);

  const fetchCustomers = async () => {
    const token = localStorage.getItem('token');
    const userId = activeStoreUser?.user_id?._id || '';
    const res = await fetch(`/api/customers?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setCustomers(data.customers || []);
  };

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
    setError('');
    setLoading(true);
    
    if (!formData.store_id) {
      setError('Please select a store');
      setLoading(false);
      return;
    }
    if (!formData.customer_name.trim()) {
      setError('Customer name is required');
      setLoading(false);
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setError('Phone number must be at least 10 digits');
      setLoading(false);
      return;
    }
    if (formData.email && !formData.email.includes('@')) {
      setError('Invalid email address');
      setLoading(false);
      return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add customer');
      }

      setIsModalOpen(false);
      fetchCustomers();
      setFormData({
        store_id: '',
        customer_name: '',
        phone: '',
        email: '',
        address: '',
        gst_number: '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Customers</h1>
            <p className="text-neutral-600">Manage customer information and profiles</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="h-11">
            <span className="mr-2">+</span> Add Customer
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer Directory</CardTitle>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">👤</div>
                <p className="text-neutral-600 font-medium">No customers found</p>
                <p className="text-neutral-500 text-sm">Add your first customer to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>GST Number</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer._id}>
                        <TableCell className="font-medium text-neutral-900">{customer.customer_name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell className="text-primary-600">{customer.email || '-'}</TableCell>
                        <TableCell>
                          {customer.gst_number ? (
                            <Badge variant="info">{customer.gst_number}</Badge>
                          ) : (
                            <span className="text-neutral-400">-</span>
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

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Customer" size="md">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Store <span className="text-danger-600">*</span>
              </label>
              <select
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                value={formData.store_id}
                onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
                required
              >
                <option value="">Select a store</option>
                {stores.map((store) => (
                  <option key={store._id} value={store._id}>
                    {store.store_name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Customer Name"
              placeholder="John Doe"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              required
            />

            <Input
              label="Phone"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Address"
              placeholder="123 Main St, City, State 12345"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            <Input
              label="GST Number"
              placeholder="27AAPFL1234H1Z0"
              value={formData.gst_number}
              onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>Add Customer</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
