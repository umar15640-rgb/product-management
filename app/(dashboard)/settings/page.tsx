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

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'store';
  const { currentStore, activeStoreUser, refreshContext } = useStore();
  
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [storeFormData, setStoreFormData] = useState({
    store_name: '',
    address: '',
    contact_phone: '',
    serial_prefix: '',
    serial_suffix: '',
    whatsapp_enabled: false,
    whatsapp_number: '',
  });

  useEffect(() => {
    if (currentStore) {
      setStoreFormData({
        store_name: currentStore.store_name || '',
        address: currentStore.address || '',
        contact_phone: currentStore.contact_phone || '',
        serial_prefix: currentStore.serial_prefix || '',
        serial_suffix: currentStore.serial_suffix || '',
        whatsapp_enabled: currentStore.whatsapp_enabled || false,
        whatsapp_number: currentStore.whatsapp_number || '',
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
    } catch (error: any) {
      console.error('Error updating store:', error);
      alert(error.message);
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
      
      // Show API key to user (this is the only time they'll see it)
      alert(`API Key created! Your API Key is: ${data.apiKey._id}\n\nPlease save this key securely. You won't be able to see it again.`);
    } catch (error: any) {
      console.error('Error creating API key:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

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
    } catch (error: any) {
      console.error('Error deleting API key:', error);
      alert(error.message);
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
          <div className="space-y-6">
            {!isAdmin && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">Only admin users can manage API keys.</p>
              </div>
            )}

            {isAdmin && (
              <div className="flex justify-end">
                <Button onClick={() => setIsApiKeyModalOpen(true)}>
                  <LuKey className="w-4 h-4 mr-2" />
                  Create API Key
                </Button>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
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
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteApiKey(apiKey._id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <LuTrash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
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
            <Input
              label="Contact Phone"
              value={storeFormData.contact_phone}
              onChange={(e) => setStoreFormData({ ...storeFormData, contact_phone: e.target.value })}
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
            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <input
                type="checkbox"
                id="whatsapp_enabled"
                checked={storeFormData.whatsapp_enabled}
                onChange={(e) => setStoreFormData({ ...storeFormData, whatsapp_enabled: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-primary-600"
              />
              <label htmlFor="whatsapp_enabled" className="text-sm font-medium text-neutral-700">
                Enable WhatsApp Integration
              </label>
            </div>
            {storeFormData.whatsapp_enabled && (
              <Input
                label="WhatsApp Number"
                value={storeFormData.whatsapp_number}
                onChange={(e) => setStoreFormData({ ...storeFormData, whatsapp_number: e.target.value })}
              />
            )}
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
      </div>
    </DashboardLayout>
  );
}
