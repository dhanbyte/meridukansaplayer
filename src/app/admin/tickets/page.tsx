"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare, Check, X, Eye, ThumbsUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [adminReply, setAdminReply] = useState("");
  const [status, setStatus] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tickets');
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (ticket: any) => {
    setSelectedTicket(ticket);
    setAdminReply(ticket.admin_response || "");
    setStatus(ticket.status);
    setIsDetailsOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedTicket) return;

    try {
      const response = await fetch('/api/admin/tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id || selectedTicket._id,
          status,
          adminReply
        })
      });

      if (response.ok) {
        toast({ title: "Ticket Updated", description: "Status and reply have been saved." });
        setIsDetailsOpen(false);
        fetchTickets();
      } else {
        throw new Error("Failed");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Update Failed", description: "Failed to update ticket." });
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading support tickets...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-brand-navy" />
          Support Ticket Management
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-4"><CardTitle className="text-xs font-semibold">Open Tickets</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-orange-600">{tickets.filter(t => t.status === 'open').length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4"><CardTitle className="text-xs font-semibold">In Progress</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-blue-600">{tickets.filter(t => t.status === 'in-progress').length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4"><CardTitle className="text-xs font-semibold">Resolved</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{tickets.filter(t => t.status === 'resolved').length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4"><CardTitle className="text-xs font-semibold">Total Tickets</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{tickets.length}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Queue</CardTitle>
          <CardDescription>Click details to respond to user concerns.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No support tickets found.
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id || ticket._id}>
                    <TableCell className="font-medium text-xs font-bold">{ticket.partner_name || ticket.partnerName}</TableCell>
                    <TableCell className="text-xs font-mono">{ticket.partner_phone || ticket.partnerPhone || 'N/A'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      <div className="font-bold text-sm">{ticket.subject}</div>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{ticket.order_id || ticket.orderId || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={
                        ticket.status === 'resolved' ? 'default' :
                        ticket.status === 'open' ? 'destructive' : 'secondary'
                      }>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[10px]">{new Date(ticket.created_at || ticket.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleOpenDetails(ticket)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Ticket: {selectedTicket?.subject}</DialogTitle>
            <DialogDescription>
              From {selectedTicket?.partner_name || selectedTicket?.partnerName} ({selectedTicket?.partner_phone || selectedTicket?.partnerPhone}) on {new Date(selectedTicket?.createdAt || selectedTicket?.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">User Message</Label>
                  <p className="text-sm whitespace-pre-wrap">"{selectedTicket.message}"</p>
                </div>
                
                {(selectedTicket.order_id || selectedTicket.orderId) && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold">Linked Order:</span>
                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">{selectedTicket.order_id || selectedTicket.orderId}</Badge>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t space-y-4">
                <div className="space-y-2">
                  <Label>Update Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Admin Reply (Visible to User)</Label>
                  <Textarea 
                    placeholder="Type your response here..." 
                    rows={5}
                    value={adminReply}
                    onChange={e => setAdminReply(e.target.value)}
                  />
                </div>

                <DialogFooter>
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleUpdate}>
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Update Ticket
                  </Button>
                </DialogFooter>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
