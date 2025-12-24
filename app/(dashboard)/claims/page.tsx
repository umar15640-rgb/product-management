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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Claims</h1>
          <Button onClick={() => setIsModalOpen(true)}>Create Claim</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Claims List</CardTitle>
          </CardHeader>
          <CardContent>
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
                    <TableCell className="font-mono text-xs">{claim._id.slice(-8)}</TableCell>
                    <TableCell>
                      {claim.warranty_id?.product_id?.brand} {claim.warranty_id?.product_id?.product_model}
                    </TableCell>
                    <TableCell>{claim.warranty_id?.customer_id?.customer_name}</TableCell>
                    <TableCell className="capitalize">{claim.claim_type}</TableCell>
                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                    <TableCell>{new Date(claim.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {claim.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(claim._id, 'approved')}
                              className="text-green-600 hover:underline text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(claim._id, 'rejected')}
                              className="text-red-600 hover:underline text-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {claim.status === 'approved' && (
                          <button
                            onClick={() => updateStatus(claim._id, 'completed')}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedClaim(claim)}
                          className="text-gray-600 hover:underline text-sm"
                        >
                          View
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Claim">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warranty</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.warranty_id}
                onChange={(e) => setFormData({ ...formData, warranty_id: e.target.value })}
                required
              >
                <option value="">Select Warranty</option>
                {warranties.map((warranty) => (
                  <option key={warranty._id} value={warranty._id}>
                    {warranty.product_id?.serial_number} - {warranty.customer_id?.customer_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Claim Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
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
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Claim Information</h4>
                <p><strong>ID:</strong> {selectedClaim._id}</p>
                <p><strong>Type:</strong> {selectedClaim.claim_type}</p>
                <p><strong>Status:</strong> {selectedClaim.status}</p>
                <p><strong>Description:</strong> {selectedClaim.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Timeline</h4>
                <div className="space-y-2">
                  {selectedClaim.timeline_events?.map((event: any, idx: number) => (
                    <div key={idx} className="border-l-2 border-blue-500 pl-4 py-2">
                      <p className="font-medium">{event.action}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                      {event.notes && <p className="text-sm">{event.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
