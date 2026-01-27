"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

export default function SupportPage() {
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const uid = user?._id || user?.id;
      const pid = user?.partnerId || user?.partner_id;
      const response = await fetch(`/api/tickets?userId=${uid}&partnerId=${pid}`);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      toast({ variant: "destructive", title: "Missing fields", description: "Subject and message are required." });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?._id || user?.id,
          partnerId: user?.partnerId || user?.partner_id || "N/A",
          partnerName: user?.name || user?.username,
          partnerPhone: user?.phone || user?.whatsappNumber || "N/A",
          subject,
          message,
          orderId
        })
      });

      if (response.ok) {
        toast({ title: "Ticket Raised", description: "Our support team will get back to you soon." });
        setIsTicketOpen(false);
        setSubject("");
        setMessage("");
        setOrderId("");
        fetchTickets();
      } else {
        throw new Error("Failed");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to raise ticket." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) return <div className="p-8 text-center">Please login to access support.</div>;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-brand-navy" />
            Support Helpdesk
          </h1>
          <p className="text-sm text-muted-foreground">Raise tickets for orders, payments or technical issues.</p>
        </div>

        <Dialog open={isTicketOpen} onOpenChange={setIsTicketOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-navy hover:bg-brand-navy/90">
              <Plus className="h-4 w-4 mr-2" />
              Raise New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>
                Briefly describe your issue. Our team usually responds within 24 hours.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-1">
                <Label>Subject</Label>
                <Input 
                  placeholder="e.g. Payment not updated, Order delayed" 
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Order ID (Optional)</Label>
                <Input 
                  placeholder="e.g. ORD-12345" 
                  value={orderId}
                  onChange={e => setOrderId(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Detailed Message</Label>
                <Textarea 
                  placeholder="Describe your concern in detail..." 
                  className="min-h-[120px]"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Raising Ticket..." : "Submit Ticket"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-700">~24 Hours</p>
            <p className="text-xs text-blue-600">Average response time</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 border-green-100">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Total Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">
              {tickets.filter(t => t.status === 'resolved').length}
            </p>
            <p className="text-xs text-green-600">Tickets solved successfully</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50/50 border-orange-100">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              Active Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-700">
              {tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length}
            </p>
            <p className="text-xs text-orange-600">Currently being processed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticket History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading tickets...</TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No tickets raised yet.
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id || ticket._id}>
                    <TableCell>
                      <div className="font-bold">{ticket.subject}</div>
                      {ticket.orderId && <div className="text-[10px] text-muted-foreground">Order: {ticket.orderId}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        ticket.status === 'resolved' ? 'default' :
                        ticket.status === 'open' ? 'outline' : 'secondary'
                      }>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize text-xs">{ticket.priority}</TableCell>
                    <TableCell className="text-[10px]">{new Date(ticket.updated_at || ticket.updatedAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">View</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{ticket.subject}</DialogTitle>
                            <DialogDescription>Raised on {new Date(ticket.created_at || ticket.createdAt).toLocaleDateString()}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="bg-muted/30 p-3 rounded text-sm whitespace-pre-wrap italic">
                              "{ticket.message}"
                            </div>
                            {ticket.admin_response && (
                              <div className="space-y-1">
                                <Label className="text-blue-600 font-bold">Admin Response:</Label>
                                <div className="bg-blue-50 border border-blue-100 p-3 rounded text-sm whitespace-pre-wrap">
                                  {ticket.admin_response}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="text-center py-8 border-t">
        <p className="text-sm text-muted-foreground">Our support team usually responds within 24 hours.</p>
      </div>
    </div>
  );
}
