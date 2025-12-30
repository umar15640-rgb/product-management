'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useStore } from '@/context/store-context';
import { useSearchParams, useRouter } from 'next/navigation';
import { LuPencil, LuKey, LuTrash2 } from 'react-icons/lu';
import { PhoneInputField } from '@/components/ui/PhoneInputField';
import { showToast } from '@/components/ui/Toast';
import { showConfirm } from '@/components/ui/ConfirmDialog';

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'store';
  const { currentStore, activeStoreUser, refreshContext } = useStore();
  
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isEditApiKeyModalOpen, setIsEditApiKeyModalOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingApiKey, setEditingApiKey] = useState<any>(null);
  const [editApiKeyData, setEditApiKeyData] = useState({ status: 'Enabled' });
  
  const [storeFormData, setStoreFormData] = useState({
    store_name: '',
    address: '',
    contact_phone: '',
    serial_prefix: '',
    serial_suffix: '',
  });

  useEffect(() => {
    if (currentStore) {
      setStoreFormData({
        store_name: currentStore.store_name || '',
        address: currentStore.address || '',
        contact_phone: currentStore.contact_phone || '',
        serial_prefix: currentStore.serial_prefix || '',
        serial_suffix: currentStore.serial_suffix || '',
      });
    }
  }, [currentStore]);

  useEffect(() => {
    if (activeTab === 'api-keys' && currentStore?._id) {
      fetchApiKeys();
    }
  }, [activeTab, currentStore]);

  const fetchApiKeys = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/api-keys?store_id=${currentStore._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setApiKeys(data.apiKeys || []);
  };

  const handleStoreUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore || activeStoreUser?.role !== 'admin') {
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`/api/stores/${currentStore._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(storeFormData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update store');
      }

      setIsStoreModalOpen(false);
      refreshContext();
      showToast('Store settings updated successfully', 'success');
    } catch (error: any) {
      console.error('Error updating store:', error);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore || activeStoreUser?.role !== 'admin') {
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const expired_at = formData.get('expired_at') as string;

    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          store_id: currentStore._id,
          name,
          expired_at: expired_at || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create API key');
      }

      const data = await res.json();
      setIsApiKeyModalOpen(false);
      fetchApiKeys();
      
      showToast(`API Key created: ${data.apiKey._id}. Save it securely!`, 'success');
    } catch (error: any) {
      console.error('Error creating API key:', error);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    showConfirm(
      'Delete API Key',
      'This action cannot be undone. The API key will be permanently deleted.',
      async () => {
        const token = localStorage.getItem('token');
        try {
          const res = await fetch(`/api/api-keys/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to delete API key');
          }

          fetchApiKeys();
          showToast('API key deleted successfully', 'success');
        } catch (error: any) {
          console.error('Error deleting API key:', error);
          showToast(error.message, 'error');
        }
      },
      { isDangerous: true, confirmText: 'Delete', cancelText: 'Cancel' }
    );
  };

  const handleEditApiKey = (apiKey: any) => {
    setEditingApiKey(apiKey);
    setEditApiKeyData({ status: apiKey.status });
    setIsEditApiKeyModalOpen(true);
  };

  const handleUpdateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApiKey) return;

    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`/api/api-keys/${editingApiKey._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editApiKeyData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update API key');
      }

      setIsEditApiKeyModalOpen(false);
      setEditingApiKey(null);
      fetchApiKeys();
      showToast('API key updated successfully', 'success');
    } catch (error: any) {
      console.error('Error updating API key:', error);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = activeStoreUser?.role === 'admin';

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Settings</h1>
          <p className="text-neutral-600">Manage your store settings and integrations</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-neutral-200">
          <button
            onClick={() => router.push('/settings?tab=store')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'store'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Store Settings
          </button>
          <button
            onClick={() => router.push('/settings?tab=api-keys')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'api-keys'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            API Keys
          </button>
        </div>

        {/* Store Settings Tab */}
        {activeTab === 'store' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Store Information</CardTitle>
                {isAdmin && (
                  <Button onClick={() => setIsStoreModalOpen(true)}>
                    <LuPencil className="w-4 h-4 mr-2" />
                    Edit Store
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {currentStore ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Store Name</label>
                    <p className="text-neutral-900 mt-1">{currentStore.store_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Address</label>
                    <p className="text-neutral-600 mt-1">{currentStore.address || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Contact Phone</label>
                    <p className="text-neutral-600 mt-1">{currentStore.contact_phone || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Serial Prefix</label>
                    <p className="text-neutral-900 mt-1 font-mono">{currentStore.serial_prefix}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Serial Suffix</label>
                    <p className="text-neutral-900 mt-1 font-mono">{currentStore.serial_suffix || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">WhatsApp Integration</label>
                    <div className="mt-1">
                      {currentStore.whatsapp_enabled ? (
                        <Badge variant="success">Enabled</Badge>
                      ) : (
                        <Badge variant="default">Disabled</Badge>
                      )}
                    </div>
                  </div>
                  {currentStore.whatsapp_enabled && currentStore.whatsapp_number && (
                    <div>
                      <label className="text-sm font-medium text-neutral-700">WhatsApp Number</label>
                      <p className="text-neutral-600 mt-1">{currentStore.whatsapp_number}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-neutral-500">No store selected</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* API Keys Tab */}
        {activeTab === 'api-keys' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>API Keys</CardTitle>
                {isAdmin && (
                  <Button onClick={() => setIsApiKeyModalOpen(true)}>
                    <LuKey className="w-4 h-4 mr-2" />
                    Create API Key
                  </Button>
                )}
              </div>
              {!isAdmin && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-yellow-800 text-sm">Only admin users can manage API keys.</p>
                </div>
              )}
            </CardHeader>
              <CardContent>
                {apiKeys.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-neutral-600">No API keys found</p>
                    {isAdmin && (
                      <p className="text-neutral-500 text-sm mt-2">Create your first API key to get started</p>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>API Key (ID)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expires At</TableHead>
                        <TableHead>Created At</TableHead>
                        {isAdmin && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiKeys.map((apiKey: any) => (
                        <TableRow key={apiKey._id}>
                          <TableCell className="font-medium">{apiKey.name}</TableCell>
                          <TableCell>
                            <code className="bg-neutral-100 px-2 py-1 rounded text-sm font-mono">
                              {apiKey._id}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge variant={apiKey.status === 'Enabled' ? 'success' : 'default'}>
                              {apiKey.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {apiKey.expired_at
                              ? new Date(apiKey.expired_at).toLocaleDateString()
                              : 'Never'}
                          </TableCell>
                          <TableCell>
                            {new Date(apiKey.created_at).toLocaleDateString()}
                          </TableCell>
                          {isAdmin && (
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditApiKey(apiKey)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <LuPencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteApiKey(apiKey._id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <LuTrash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
        )}

        {/* Store Edit Modal */}
        <Modal
          isOpen={isStoreModalOpen}
          onClose={() => setIsStoreModalOpen(false)}
          title="Edit Store Settings"
          size="md"
        >
          <form onSubmit={handleStoreUpdate} className="space-y-5">
            <Input
              label="Store Name"
              value={storeFormData.store_name}
              onChange={(e) => setStoreFormData({ ...storeFormData, store_name: e.target.value })}
              required
            />
            <Input
              label="Address"
              value={storeFormData.address}
              onChange={(e) => setStoreFormData({ ...storeFormData, address: e.target.value })}
            />
            <PhoneInputField
              label="Contact Phone"
              value={storeFormData.contact_phone}
              onChange={(phone) => setStoreFormData({ ...storeFormData, contact_phone: phone })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Serial Prefix"
                value={storeFormData.serial_prefix}
                onChange={(e) => setStoreFormData({ ...storeFormData, serial_prefix: e.target.value })}
                required
              />
              <Input
                label="Serial Suffix"
                value={storeFormData.serial_suffix}
                onChange={(e) => setStoreFormData({ ...storeFormData, serial_suffix: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsStoreModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Update Store
              </Button>
            </div>
          </form>
        </Modal>

        {/* API Key Create Modal */}
        <Modal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
          title="Create API Key"
          size="md"
        >
          <form onSubmit={handleCreateApiKey} className="space-y-5">
            <Input
              label="Name"
              name="name"
              placeholder="e.g., Production API Key"
              required
            />
            <Input
              label="Expires At (Optional)"
              name="expired_at"
              type="date"
            />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The API key will be shown only once after creation. Make sure to save it securely.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsApiKeyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Create API Key
              </Button>
            </div>
          </form>
        </Modal>

        {/* API Key Edit Modal */}
        <Modal
          isOpen={isEditApiKeyModalOpen}
          onClose={() => setIsEditApiKeyModalOpen(false)}
          title="Edit API Key"
          size="md"
        >
          <form onSubmit={handleUpdateApiKey} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
              <select
                value={editApiKeyData.status}
                onChange={(e) => setEditApiKeyData({ ...editApiKeyData, status: e.target.value })}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900"
              >
                <option value="Enabled">Enabled</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditApiKeyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Update API Key
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
