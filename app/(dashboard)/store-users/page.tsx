'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useStore } from '@/context/store-context';

export default function StoreUsersPage() {
  const { currentStore, refreshContext } = useStore();
  const [storeUsers, setStoreUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // New User Form Data
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff',
    permissions: [] as string[],
  });

  useEffect(() => {
    if (currentStore?._id) {
        fetchStoreUsers();
    }
  }, [currentStore]);

  const fetchStoreUsers = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/store-users?store_id=${currentStore._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setStoreUsers(data.storeUsers || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    
    // NOTE: In a real implementation, you'd likely have a specific API endpoint 
    // to "Invite User" or "Create Staff" which handles both UserAccount creation 
    // and StoreUser linking transactionally. 
    // Here we will reuse the signup endpoint logic or a dedicated endpoint.
    // For this example, let's assume we post to /api/store-users with full details
    // and the backend handles the account creation if it doesn't exist.
    
    try {
        const res = await fetch('/api/store-users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                ...formData,
                store_id: currentStore._id // Force current store
            }),
        });

        if (res.ok) {
            setIsModalOpen(false);
            fetchStoreUsers();
            refreshContext(); // Refresh global context so the new user appears in the switcher
            setFormData({
                full_name: '',
                email: '',
                phone: '',
                password: '',
                role: 'staff',
                permissions: [],
            });
        }
    } catch (error) {
        console.error("Failed to add user", error);
    } finally {
        setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: any = { admin: 'danger', manager: 'warning', staff: 'success' };
    return <Badge variant={variants[role] || 'default'}>{role}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Store Staff</h1>
            <p className="text-neutral-600">Manage your team and their permissions</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="h-11">
            <span className="mr-2">+</span> Add Staff Member
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {storeUsers.map((storeUser) => (
                    <TableRow key={storeUser._id}>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-600">
                                {storeUser.user_id?.full_name?.charAt(0)}
                            </div>
                            {storeUser.user_id?.full_name}
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="text-sm">{storeUser.user_id?.email}</span>
                            <span className="text-xs text-neutral-500">{storeUser.user_id?.phone}</span>
                        </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(storeUser.role)}</TableCell>
                    <TableCell className="text-neutral-600">{new Date(storeUser.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Staff Member" size="md">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Full Name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                />
                <Input
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                />
            </div>

            <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
            />
            
            <Input
                label="Default Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Create a password for them"
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Role</label>
              <select
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>Add Member</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}