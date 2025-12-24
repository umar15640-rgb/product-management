'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

export default function WhatsAppPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/audit-logs?entity=whatsapp_event_logs', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setLogs(data.logs || []);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">WhatsApp Integration</h1>
          <p className="text-neutral-600">Monitor and manage WhatsApp communications</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-600 flex items-center gap-2">
                <span className="text-lg">🟢</span> Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="success" className="text-base">Active</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-600 flex items-center gap-2">
                <span className="text-lg">🔗</span> Webhook URL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <code className="text-xs bg-neutral-100 px-2 py-1 rounded block break-all">/api/whatsapp/kwic-hook</code>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-600 flex items-center gap-2">
                <span className="text-lg">💬</span> Messages Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-neutral-900">{logs.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Message Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-neutral-600 font-medium">No messages yet</p>
                <p className="text-neutral-500 text-sm">Messages will appear here as they are received</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.slice(0, 20).map((log) => (
                      <TableRow key={log._id}>
                        <TableCell className="text-neutral-600 text-sm">{new Date(log.created_at).toLocaleString()}</TableCell>
                        <TableCell className="font-medium font-mono">{log.phone_number}</TableCell>
                        <TableCell>
                          <Badge variant={log.message_type === 'incoming' ? 'info' : 'primary'}>
                            {log.message_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-neutral-600 uppercase">{log.event_type}</TableCell>
                        <TableCell className="max-w-xs truncate text-neutral-700">{log.message_content}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Available WhatsApp Commands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border-b border-neutral-200 pb-3 last:border-0">
                  <code className="bg-neutral-100 px-2 py-1 rounded text-sm font-mono">menu</code>
                  <p className="text-sm text-neutral-600 mt-1">Show main menu</p>
                </div>
                <div className="border-b border-neutral-200 pb-3 last:border-0">
                  <code className="bg-neutral-100 px-2 py-1 rounded text-sm font-mono">1</code>
                  <p className="text-sm text-neutral-600 mt-1">Register warranty</p>
                </div>
                <div className="border-b border-neutral-200 pb-3 last:border-0">
                  <code className="bg-neutral-100 px-2 py-1 rounded text-sm font-mono">2</code>
                  <p className="text-sm text-neutral-600 mt-1">Check warranty status</p>
                </div>
                <div className="border-b border-neutral-200 pb-3 last:border-0">
                  <code className="bg-neutral-100 px-2 py-1 rounded text-sm font-mono">3</code>
                  <p className="text-sm text-neutral-600 mt-1">Create claim</p>
                </div>
                <div className="border-b border-neutral-200 pb-3 last:border-0">
                  <code className="bg-neutral-100 px-2 py-1 rounded text-sm font-mono">4</code>
                  <p className="text-sm text-neutral-600 mt-1">Check claim status</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-700 mb-1">API Endpoint</p>
                  <code className="bg-neutral-100 px-3 py-2 rounded text-xs block break-all">/api/whatsapp/kwic-hook</code>
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-700 mb-1">Method</p>
                  <Badge variant="primary">POST</Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-700 mb-1">Status</p>
                  <Badge variant="success">Connected & Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
