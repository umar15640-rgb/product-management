'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { LuActivity, LuWebhook, LuMessageSquare, LuInbox } from 'react-icons/lu';

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
                <LuActivity className="text-lg text-primary-600" /> 
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="success" className="text-base">Active</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-600 flex items-center gap-2">
                <LuWebhook className="text-lg text-primary-600" />
                Webhook URL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <code className="text-xs bg-neutral-100 px-2 py-1 rounded block break-all text-neutral-700">/api/whatsapp/kwic-hook</code>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-600 flex items-center gap-2">
                <LuMessageSquare className="text-lg text-primary-600" />
                Messages Today
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
                <LuInbox className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
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

        {/* ... rest of the component (Available Commands, Integration Details) ... */}
        {/* Note: Ensure the rest of the file is preserved if copying/pasting, or only update the top section */}
      </div>
    </DashboardLayout>
  );
}