
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
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock data for transactions
const transactions = [
  { id: "TXN12345", amount: 500, date: "2024-07-28", status: "Approved" },
  { id: "TXN12346", amount: 250, date: "2024-07-27", status: "Pending" },
  { id: "TXN12347", amount: 1000, date: "2024-07-26", status: "Approved" },
  { id: "TXN12348", amount: 300, date: "2024-07-25", status: "Rejected" },
];

const currentBalance = transactions
  .filter((t) => t.status === "Approved")
  .reduce((acc, t) => acc + t.amount, 0);

export default function RechargePage() {
  const { toast } = useToast();
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !screenshot) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter an amount and upload a screenshot.",
      });
      return;
    }
    // Handle submission to admin
    toast({
      title: "Request Submitted",
      description: "Your recharge request has been sent for approval.",
    });
    setAmount("");
    setScreenshot(null);
    // You would typically add the new transaction to a state here
  };

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
              <Button type="submit" className="w-full">
                Submit for Approval
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      ₹{transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{transaction.date}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
