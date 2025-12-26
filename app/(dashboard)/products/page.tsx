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

export default function ProductsPage() {
  const { activeStoreUser } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    store_id: '',
    product_model: '',
    category: '',
    brand: '',
    manufacturing_date: '',
    base_warranty_months: 12,
  });

  useEffect(() => {
    if (activeStoreUser) fetchProducts();
    fetchStores();
  }, [activeStoreUser]);

  const fetchProducts = async () => {
    const token = localStorage.getItem('token');
    // Don't pass userId if empty - API will filter by store automatically
    const res = await fetch('/api/products', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setProducts(data.products || []);
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
    if (!formData.brand.trim()) {
      setError('Brand is required');
      setLoading(false);
      return;
    }
    if (!formData.product_model.trim()) {
      setError('Model is required');
      setLoading(false);
      return;
    }
    if (!formData.category.trim()) {
      setError('Category is required');
      setLoading(false);
      return;
    }
    if (!formData.manufacturing_date) {
      setError('Manufacturing date is required');
      setLoading(false);
      return;
    }
    if (formData.base_warranty_months < 1) {
      setError('Warranty period must be at least 1 month');
      setLoading(false);
      return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add product');
      }

      setIsModalOpen(false);
      fetchProducts();
      setFormData({
        store_id: '',
        product_model: '',
        category: '',
        brand: '',
        manufacturing_date: '',
        base_warranty_months: 12,
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
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Products</h1>
            <p className="text-neutral-600">Manage your product inventory and warranty information</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="h-11">
            <span className="mr-2">+</span> Add Product
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📦</div>
                <p className="text-neutral-600 font-medium">No products found</p>
                <p className="text-neutral-500 text-sm">Add your first product to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Manufacturing Date</TableHead>
                      <TableHead>Warranty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell className="font-mono text-primary-600 font-semibold">{product.serial_number}</TableCell>
                        <TableCell className="font-medium">{product.brand}</TableCell>
                        <TableCell>{product.product_model}</TableCell>
                        <TableCell>
                          <Badge variant="info">{product.category}</Badge>
                        </TableCell>
                        <TableCell>{new Date(product.manufacturing_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="primary">{product.base_warranty_months} months</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Product" size="md">
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
              label="Brand"
              placeholder="Apple, Samsung, etc."
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              required
            />

            <Input
              label="Model"
              placeholder="iPhone 15 Pro Max"
              value={formData.product_model}
              onChange={(e) => setFormData({ ...formData, product_model: e.target.value })}
              required
            />

            <Input
              label="Category"
              placeholder="Electronics, Appliances, etc."
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />

            <Input
              label="Manufacturing Date"
              type="date"
              value={formData.manufacturing_date}
              onChange={(e) => setFormData({ ...formData, manufacturing_date: e.target.value })}
              required
            />

            <Input
              label="Warranty Period (Months)"
              type="number"
              placeholder="12"
              min="1"
              value={formData.base_warranty_months}
              onChange={(e) => setFormData({ ...formData, base_warranty_months: parseInt(e.target.value) })}
              required
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>Create Product</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
