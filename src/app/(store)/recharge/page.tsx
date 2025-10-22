
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/firebase/use-user";
import { useFirestore } from "@/firebase/provider";
import { useCollection } from "@/firebase/use-collection";
import { collection, addDoc, serverTimestamp, where } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { RechargeRequest } from "@/lib/types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function RechargePage() {
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: transactions = [], loading: transactionsLoading } = useCollection<RechargeRequest>(
    user ? 'rechargeRequests' : null,
    user ? where('userId', '==', user.uid) : ''
  );

  const currentBalance = transactions
    .filter((t) => t.status === "Approved")
    .reduce((acc, t) => acc + t.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !screenshot || !user || !firestore) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter an amount and upload a screenshot.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload screenshot to Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, `recharge-screenshots/${user.uid}/${Date.now()}-${screenshot.name}`);
      const snapshot = await uploadBytes(storageRef, screenshot);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // 2. Create recharge request in Firestore
      const rechargeData = {
        userId: user.uid,
        amount: Number(amount),
        screenshotUrl: downloadURL,
        status: "Pending",
        requestDate: serverTimestamp(),
      };
      
      addDoc(collection(firestore, "rechargeRequests"), rechargeData)
        .then(() => {
            toast({
              title: "Request Submitted",
              description: "Your recharge request has been sent for approval.",
            });
            setAmount("");
            setScreenshot(null);
            // Clear the file input
            const fileInput = document.getElementById('screenshot') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        })
        .catch(async (err) => {
            const permissionError = new FirestorePermissionError({
              path: 'rechargeRequests',
              operation: 'create',
              requestResourceData: rechargeData
            });
            errorEmitter.emit('permission-error', permissionError);
        });

    } catch (error) {
      console.error("Error submitting recharge request:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (userLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
       <Card className="w-full">
        <CardHeader>
          <CardTitle>Current Wallet Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">₹{currentBalance.toFixed(2)}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recharge Wallet</CardTitle>
            <CardDescription>
              Scan the QR code to pay, then upload a screenshot of the payment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <Image
                src="https://storage.googleapis.com/stedi-assets/shopwave-qr.jpeg"
                alt="Paytm QR Code"
                width={250}
                height={250}
              />
            </div>
            <p className="text-center text-sm font-medium text-gray-700">
              UPI ID: 9157499884@ptsbi
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="screenshot">Payment Screenshot</Label>
                <Input
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setScreenshot(e.target.files ? e.target.files[0] : null)
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit for Approval"}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Your balance will be updated once the admin approves your request.
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              A record of your recent recharge requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? <p>Loading history...</p> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={3} className="text-center">No transactions yet.</TableCell>
                     </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        ₹{transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>{transaction.requestDate?.toDate().toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.status === "Approved"
                              ? "default"
                              : transaction.status === "Pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )))}
                </TableBody>
              </Table>
            )}
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
