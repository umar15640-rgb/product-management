'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    stores: 0,
    products: 0,
    warranties: 0,
    claims: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      
      const [storesRes, productsRes, warrantiesRes, claimsRes] = await Promise.all([
        fetch('/api/stores', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/warranties', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/claims', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const stores = await storesRes.json();
      const products = await productsRes.json();
      const warranties = await warrantiesRes.json();
      const claims = await claimsRes.json();

      setStats({
        stores: stores.stores?.length || 0,
        products: products.total || 0,
        warranties: warranties.total || 0,
        claims: claims.total || 0,
      });
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Stores</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{stats.stores}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{stats.products}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Active Warranties</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{stats.warranties}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Claims</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{stats.claims}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/products" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                <div className="text-2xl mb-2">📦</div>
                <div className="text-sm font-medium">Add Product</div>
              </a>
              <a href="/warranties" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                <div className="text-2xl mb-2">🛡️</div>
                <div className="text-sm font-medium">Register Warranty</div>
              </a>
              <a href="/customers" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                <div className="text-2xl mb-2">👤</div>
                <div className="text-sm font-medium">Add Customer</div>
              </a>
              <a href="/claims" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                <div className="text-2xl mb-2">📋</div>
                <div className="text-sm font-medium">View Claims</div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
