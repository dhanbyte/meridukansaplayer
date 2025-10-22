'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function CreatePartnerPage() {
  const [partnerName, setPartnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (auth !== 'true') {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName || !email || !password) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in Partner Name, Email, and Password.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: partnerName,
          email,
          phone,
          password,
          bankName,
          accountHolderName,
          accountNumber,
          ifscCode,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create partner');
      }
      toast({
        title: "Partner Created",
        description: "The new partner has been successfully created.",
      });
      router.push("/admin/partners");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating partner",
        description: "Failed to create partner. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Partner</CardTitle>
        <CardDescription>
          Naya partner add kariye
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreatePartner} className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="partner_name">Partner Name</Label>
              <Input id="partner_name" placeholder="Partner ka naam" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="partner@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Partner ka password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>

          <div className="grid gap-2">
            <h3 className="font-semibold text-lg">Bank Details (Optional)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input id="bank_name" placeholder="e.g., State Bank of India" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account_holder_name">Account Holder Name</Label>
              <Input id="account_holder_name" placeholder="As per bank records" value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input id="account_number" placeholder="Enter account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ifsc_code">IFSC Code</Label>
              <Input id="ifsc_code" placeholder="Enter IFSC code" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} />
            </div>
          </div>
          <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Partner"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
// ...existing code...
      phone,
      password,
      bankName,
      accountHolderName,
      accountNumber,
      ifscCode,
      status: 'Active'
    };
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: partnerName,
          email: email,
          password: password,
          phone: phone,
          bankName: bankName,
          accountHolderName: accountHolderName,
          accountNumber: accountNumber,
          ifscCode: ifscCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create partner');
      }

      // Show success and redirect
      router.push("/admin/partners");

    } catch (error) {
      // Show error
    } finally {
      setIsLoading(false);
    }
  }
  if (!isAuthenticated) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Partner</CardTitle>
        <CardDescription>
          Naya partner add kariye
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreatePartner} className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="partner_name">Partner Name</Label>
              <Input id="partner_name" placeholder="Partner ka naam" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="partner@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Partner ka password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>

          <div className="grid gap-2">
            <h3 className="font-semibold text-lg">Bank Details (Optional)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input id="bank_name" placeholder="e.g., State Bank of India" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account_holder_name">Account Holder Name</Label>
              <Input id="account_holder_name" placeholder="As per bank records" value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input id="account_number" placeholder="Enter account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ifsc_code">IFSC Code</Label>
              <Input id="ifsc_code" placeholder="Enter IFSC code" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} />
            </div>
          </div>
          <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Partner"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
