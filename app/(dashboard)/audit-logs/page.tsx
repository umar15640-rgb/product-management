'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    entity: '',
    page: 1,
  });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({
      page: filters.page.toString(),
      ...(filters.entity && { entity: filters.entity }),
    });

    const res = await fetch(`/api/audit-logs?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setLogs(data.logs || []);
  };

  const getActionBadge = (action: string) => {
    const variants: any = {
      create: 'success',
      update: 'info',
      delete: 'danger',
    };
    return <Badge variant={variants[action] || 'default'}>{action}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>System Activity</CardTitle>
              <div>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  value={filters.entity}
                  onChange={(e) => setFilters({ ...filters, entity: e.target.value, page: 1 })}
                >
                  <option value="">All Entities</option>
                  <option value="stores">Stores</option>
                  <option value="products">Products</option>
                  <option value="customers">Customers</option>
                  <option value="warranties">Warranties</option>
                  <option value="claims">Claims</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                    <TableCell>{log.user_id?.full_name || 'System'}</TableCell>
                    <TableCell className="capitalize">{log.entity}</TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell className="font-mono text-xs">{log.entity_id.toString().slice(-8)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
