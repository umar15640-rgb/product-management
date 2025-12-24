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
    const token = localStorage.getItem('token');
    
    await fetch('/api/warranties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    setIsModalOpen(false);
    fetchWarranties();
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Warranties</h1>
          <Button onClick={() => setIsModalOpen(true)}>Register Warranty</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Warranty List</CardTitle>
          </CardHeader>
          <CardContent>
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
                      {warranty.product_id?.brand} {warranty.product_id?.product_model}
                      <br />
                      <span className="text-xs text-gray-500 font-mono">
                        {warranty.product_id?.serial_number}
                      </span>
                    </TableCell>
                    <TableCell>{warranty.customer_id?.customer_name}</TableCell>
                    <TableCell>{new Date(warranty.warranty_start).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(warranty.warranty_end).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(warranty.status)}</TableCell>
                    <TableCell>
                      {warranty.warranty_pdf_url && (
                        <a
                          href={warranty.warranty_pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View PDF
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Warranty">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                required
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.brand} {product.product_model} - {product.serial_number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                required
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.customer_name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Start Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.warranty_start}
                onChange={(e) => setFormData({ ...formData, warranty_start: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Register Warranty</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
