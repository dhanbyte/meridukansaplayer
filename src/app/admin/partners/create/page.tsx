"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useFirebaseApp, useFirestore } from "@/firebase/provider";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";


export default function CreatePartnerPage() {
  const { toast } = useToast();
  const app = useFirebaseApp();
  const firestore = useFirestore();
  const router = useRouter();

  const [partnerName, setPartnerName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [bankName, setBankName] = React.useState("");
  const [accountHolderName, setAccountHolderName] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [ifscCode, setIfscCode] = React.useState("");


  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app) return;
    const auth = getAuth(app);

    if (!partnerName || !email || !password) {
       toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in Partner Name, Email, and Password.",
      });
      return;
    }

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Add partner details to Firestore
      if (!firestore) throw new Error("Firestore is not available");
      const partnerData = {
        name: partnerName,
        email: email,
        phone: phone,
        bankName: bankName,
        accountHolderName: accountHolderName,
        accountNumber: accountNumber,
        ifscCode: ifscCode,
        status: "Active",
        uid: user.uid,
      };
      
      const docRef = await addDoc(collection(firestore, "partners"), partnerData);
      
      setDoc(doc(firestore, "partners", docRef.id), { id: docRef.id }, { merge: true })
      .catch(async (err) => {
          const permissionError = new FirestorePermissionError({
            path: `partners/${docRef.id}`,
            operation: 'update',
            requestResourceData: { id: docRef.id }
          });
          errorEmitter.emit('permission-error', permissionError);
      });


      // 3. Add user role to a 'users' collection
       const userDocData = {
          uid: user.uid,
          email: user.email,
          displayName: partnerName,
          role: "partner",
        };
       setDoc(doc(firestore, "users", user.uid), userDocData)
        .catch(async (err) => {
            const permissionError = new FirestorePermissionError({
              path: `users/${user.uid}`,
              operation: 'create',
              requestResourceData: userDocData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });


      toast({
        title: "Partner Created",
        description: "The new partner has been successfully created.",
      });

      router.push("/admin/partners");


    } catch (error: any) {
      console.error("Error creating partner:", error);
      toast({
        variant: "destructive",
        title: "Error creating partner",
        description: error.message,
      });
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Partner</CardTitle>
        <CardDescription>
          Fill out the form below to add a new partner.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreatePartner} className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="partner_name">Partner Name</Label>
              <Input id="partner_name" placeholder="John Doe" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="partner@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" placeholder="+1 234 567 890" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Set a password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>

          <div className="grid gap-2">
            <h3 className="font-semibold text-lg">Bank Details</h3>
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
          <Button type="submit" className="w-full md:w-auto">
            Create Partner
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
