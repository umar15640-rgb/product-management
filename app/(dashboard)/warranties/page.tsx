'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

export default function WarrantiesPage() {
  const [warranties, setWarranties] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    customer_id: '',
    warranty_start: '',
  });

  useEffect(() => {
    fetchWarranties();
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchWarranties = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/warranties', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setWarranties(data.warranties || []);
  };

  const fetchProducts = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/products', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setProducts(data.products || []);
  };

  const fetchCustomers = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/customers', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setCustomers(data.customers || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!formData.product_id) {
      setError('Please select a product');
      setLoading(false);
      return;
    }
    if (!formData.customer_id) {
      setError('Please select a customer');
      setLoading(false);
      return;
    }
    if (!formData.warranty_start) {
      setError('Warranty start date is required');
      setLoading(false);
      return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('/api/warranties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register warranty');
      }

      setIsModalOpen(false);
      fetchWarranties();
      setFormData({
        product_id: '',
        customer_id: '',
        warranty_start: '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      active: 'success',
      expired: 'danger',
      claimed: 'warning',
      void: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Warranties</h1>
            <p className="text-neutral-600">Register and manage product warranties</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="h-11">
            <span className="mr-2">+</span> Register Warranty
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Warranty Registry</CardTitle>
          </CardHeader>
          <CardContent>
            {warranties.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🛡️</div>
                <p className="text-neutral-600 font-medium">No warranties found</p>
                <p className="text-neutral-500 text-sm">Register your first warranty to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warranties.map((warranty) => (
                      <TableRow key={warranty._id}>
                        <TableCell>
                          <div className="font-medium text-neutral-900">
                            {warranty.product_id?.brand} {warranty.product_id?.product_model}
                          </div>
                          <div className="text-xs text-neutral-500 font-mono mt-1">
                            {warranty.product_id?.serial_number}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{warranty.customer_id?.customer_name}</TableCell>
                        <TableCell>{new Date(warranty.warranty_start).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(warranty.warranty_end).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(warranty.status)}</TableCell>
                        <TableCell>
                          {warranty.warranty_pdf_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                window.open(warranty.warranty_pdf_url, '_blank');
                              }}
                            >
                              📄 PDF
                            </Button>
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

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Warranty" size="md">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Product <span className="text-danger-600">*</span>
              </label>
              <select
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                required
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.brand} {product.product_model} - {product.serial_number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Customer <span className="text-danger-600">*</span>
              </label>
              <select
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                required
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.customer_name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Warranty Start Date <span className="text-danger-600">*</span>
              </label>
              <input
                type="date"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                value={formData.warranty_start}
                onChange={(e) => setFormData({ ...formData, warranty_start: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>Register Warranty</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
