'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

export default function ClaimsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [warranties, setWarranties] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [formData, setFormData] = useState({
    warranty_id: '',
    claim_type: 'repair',
    description: '',
  });

  useEffect(() => {
    fetchClaims();
    fetchWarranties();
  }, []);

  const fetchClaims = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/claims', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setClaims(data.claims || []);
  };

  const fetchWarranties = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/warranties', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setWarranties(data.warranties || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    await fetch('/api/claims', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    setIsModalOpen(false);
    fetchClaims();
    setFormData({
      warranty_id: '',
      claim_type: 'repair',
      description: '',
    });
  };

  const updateStatus = async (claimId: string, status: string) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/claims/${claimId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    fetchClaims();
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: 'warning',
      approved: 'info',
      rejected: 'danger',
      completed: 'success',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Claims</h1>
            <p className="text-neutral-600">Manage warranty claims and service requests</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="h-11">
            <span className="mr-2">+</span> Create Claim
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Claims</CardTitle>
          </CardHeader>
          <CardContent>
            {claims.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-neutral-600 font-medium">No claims found</p>
                <p className="text-neutral-500 text-sm">Create your first claim to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.map((claim) => (
                      <TableRow key={claim._id}>
                        <TableCell className="font-mono text-xs font-semibold bg-neutral-50 px-2 py-1 rounded">{claim._id.slice(-8)}</TableCell>
                        <TableCell className="font-medium">
                          {claim.warranty_id?.product_id?.brand} {claim.warranty_id?.product_id?.product_model}
                        </TableCell>
                        <TableCell>{claim.warranty_id?.customer_id?.customer_name}</TableCell>
                        <TableCell>
                          <Badge variant="info" className="capitalize">{claim.claim_type}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(claim.status)}</TableCell>
                        <TableCell className="text-neutral-600 text-sm">{new Date(claim.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {claim.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => updateStatus(claim._id, 'approved')}
                                  className="text-success-600 hover:bg-success-50"
                                >
                                  ✓ Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => updateStatus(claim._id, 'rejected')}
                                  className="text-danger-600 hover:bg-danger-50"
                                >
                                  ✕ Reject
                                </Button>
                              </>
                            )}
                            {claim.status === 'approved' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateStatus(claim._id, 'completed')}
                                className="text-primary-600 hover:bg-primary-50"
                              >
                                ✓ Complete
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedClaim(claim)}
                            >
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Claim" size="md">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Warranty <span className="text-danger-600">*</span>
              </label>
              <select
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                value={formData.warranty_id}
                onChange={(e) => setFormData({ ...formData, warranty_id: e.target.value })}
                required
              >
                <option value="">Select a warranty</option>
                {warranties.map((warranty) => (
                  <option key={warranty._id} value={warranty._id}>
                    {warranty.product_id?.serial_number} - {warranty.customer_id?.customer_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Claim Type <span className="text-danger-600">*</span>
              </label>
              <select
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                value={formData.claim_type}
                onChange={(e) => setFormData({ ...formData, claim_type: e.target.value })}
                required
              >
                <option value="repair">Repair</option>
                <option value="replacement">Replacement</option>
                <option value="refund">Refund</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description <span className="text-danger-600">*</span>
              </label>
              <textarea
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 transition-all duration-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                rows={4}
                placeholder="Describe the issue or claim details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Claim</Button>
            </div>
          </form>
        </Modal>

        {selectedClaim && (
          <Modal
            isOpen={!!selectedClaim}
            onClose={() => setSelectedClaim(null)}
            title="Claim Details"
            size="lg"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">Claim ID</p>
                  <p className="text-lg font-mono text-neutral-900">{selectedClaim._id.slice(-12)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">Status</p>
                  <div>{getStatusBadge(selectedClaim.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">Type</p>
                  <p className="text-lg capitalize text-neutral-900">{selectedClaim.claim_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">Created</p>
                  <p className="text-lg text-neutral-900">{new Date(selectedClaim.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-600 mb-2">Description</p>
                <p className="text-neutral-700 bg-neutral-50 p-4 rounded-lg">{selectedClaim.description}</p>
              </div>

              {selectedClaim.timeline_events && selectedClaim.timeline_events.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-3">Timeline</p>
                  <div className="space-y-3">
                    {selectedClaim.timeline_events.map((event: any, idx: number) => (
                      <div key={idx} className="border-l-4 border-primary-500 pl-4 py-2">
                        <p className="font-medium text-neutral-900">{event.action}</p>
                        <p className="text-sm text-neutral-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                        {event.notes && <p className="text-sm text-neutral-600 mt-1">{event.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
