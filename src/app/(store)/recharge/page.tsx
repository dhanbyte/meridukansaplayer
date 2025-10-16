
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
  };

  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-lg">
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
              width={300}
              height={300}
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
    </div>
  );
}
