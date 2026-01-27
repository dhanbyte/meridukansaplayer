"use client";
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, Check, X, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import Image from 'next/image';

interface RechargeRequest {
  _id: string;
  partnerId: string;
  partnerName: string;
  amount: number;
  transactionId: string;
  screenshotUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  adminNote?: string;
}

export default function AdminWalletPage() {
  const [requests, setRequests] = useState<RechargeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RechargeRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [adjustedAmount, setAdjustedAmount] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wallet/recharge');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.recharges || []);
      }
    } catch (error) {
      console.error("Error fetching recharges:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (req: RechargeRequest) => {
    setSelectedRequest(req);
    setAdjustedAmount(req.amount.toString());
    setAdminNote("");
    setIsDetailsOpen(true);
  };

  const handleProcess = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;

    try {
      const response = await fetch('/api/admin/wallet/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rechargeId: selectedRequest._id,
          status,
          finalAmount: status === 'approved' ? parseFloat(adjustedAmount) : 0,
          note: adminNote
        })
      });

      if (response.ok) {
        toast({
          title: status === 'approved' ? "Recharge Approved" : "Recharge Rejected",
          description: `User's wallet has been updated.`
        });
        setIsDetailsOpen(false);
        fetchRequests();
      } else {
        throw new Error("Failed");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process request."
      });
    }
  };

  if (loading) return <div className="p-8 text-center">Loading requests...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="h-6 w-6" />
          Wallet Recharge Requests
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending & Recent Requests</CardTitle>
          <CardDescription>Verify transaction IDs and screenshots before approving.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No recharge requests found.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req._id}>
                    <TableCell className="font-medium">{req.partnerName}</TableCell>
                    <TableCell className="font-bold text-green-600">₹{req.amount}</TableCell>
                    <TableCell className="font-mono text-xs">{req.transactionId}</TableCell>
                    <TableCell>
                      <Badge variant={
                        req.status === 'approved' ? 'default' : 
                        req.status === 'rejected' ? 'destructive' : 'outline'
                      }>
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleOpenDetails(req)}>
                        <Eye className="h-4 w-4 mr-2" />
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
            <DialogTitle>Recharge Details - {selectedRequest?.partnerName}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="border rounded-lg p-2 bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Payment Screenshot</p>
                  <div className="relative aspect-[3/4] w-full">
                    <Image 
                      src={selectedRequest.screenshotUrl} 
                      alt="Payment SS" 
                      fill 
                      className="object-contain rounded"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>Partner Name</Label>
                  <div className="p-2 border rounded bg-muted/30">{selectedRequest.partnerName}</div>
                </div>
                <div className="space-y-1">
                  <Label>Transaction / UTR ID</Label>
                  <div className="p-2 border rounded font-mono bg-muted/30">{selectedRequest.transactionId}</div>
                </div>
                
                <div className="pt-4 border-t space-y-3">
                  <div className="space-y-1">
                    <Label className="text-blue-600 font-bold">Adjust Approved Amount (₹)</Label>
                    <Input 
                      type="number" 
                      value={adjustedAmount} 
                      onChange={e => setAdjustedAmount(e.target.value)}
                      className="border-blue-200"
                    />
                    <p className="text-[10px] text-muted-foreground">User requested: ₹{selectedRequest.amount}</p>
                  </div>
                  <div className="space-y-1">
                    <Label>Internal Note</Label>
                    <Input 
                      placeholder="Reason for adjustment or rejection" 
                      value={adminNote}
                      onChange={e => setAdminNote(e.target.value)}
                    />
                  </div>
                </div>

                {selectedRequest.status === 'pending' && (
                  <div className="flex gap-2 pt-4">
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700" 
                      onClick={() => handleProcess('approved')}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1" 
                      onClick={() => handleProcess('rejected')}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
