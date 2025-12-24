'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

export default function StoreUsersPage() {
  const [storeUsers, setStoreUsers] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    store_id: '',
    user_id: '',
    role: 'staff',
    permissions: [] as string[],
  });

  useEffect(() => {
    fetchStoreUsers();
    fetchStores();
    fetchUsers();
  }, []);

  const fetchStoreUsers = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/store-users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setStoreUsers(data.storeUsers || []);
  };

  const fetchStores = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/stores', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setStores(data.stores || []);
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsers([data.user]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    await fetch('/api/store-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    setIsModalOpen(false);
    fetchStoreUsers();
    setFormData({
      store_id: '',
      user_id: '',
      role: 'staff',
      permissions: [],
    });
  };

  const getRoleBadge = (role: string) => {
    const variants: any = {
      admin: 'danger',
      manager: 'warning',
      staff: 'success',
    };
    return <Badge variant={variants[role] || 'default'}>{role}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Store Users</h1>
            <p className="text-neutral-600">Manage user roles and permissions across stores</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="h-11">
            <span className="mr-2">+</span> Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {storeUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">👥</div>
                <p className="text-neutral-600 font-medium">No users assigned</p>
                <p className="text-neutral-500 text-sm">Assign your first user to a store</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Store</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Assigned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {storeUsers.map((storeUser) => (
                      <TableRow key={storeUser._id}>
                        <TableCell className="font-medium">{storeUser.user_id?.full_name}</TableCell>
                        <TableCell>{storeUser.store_id?.store_name}</TableCell>
                        <TableCell>{getRoleBadge(storeUser.role)}</TableCell>
                        <TableCell>
                          {storeUser.permissions.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {storeUser.permissions.map((perm: string, idx: number) => (
                                <Badge key={idx} variant="default" className="text-xs">
                                  {perm.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-neutral-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-neutral-600">{new Date(storeUser.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign User to Store" size="md">
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                User <span className="text-danger-600">*</span>
              </label>
              <select
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                required
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.full_name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Role <span className="text-danger-600">*</span>
              </label>
              <select
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">Permissions</label>
              <div className="space-y-2 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                {['view_products', 'create_products', 'view_warranties', 'create_warranties', 'manage_claims'].map((perm) => (
                  <label key={perm} className="flex items-center cursor-pointer hover:bg-white p-2 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(perm)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, permissions: [...formData.permissions, perm] });
                        } else {
                          setFormData({
                            ...formData,
                            permissions: formData.permissions.filter((p) => p !== perm),
                          });
                        }
                      }}
                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 cursor-pointer"
                    />
                    <span className="text-sm text-neutral-700 ml-2 capitalize">{perm.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Assign User</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
