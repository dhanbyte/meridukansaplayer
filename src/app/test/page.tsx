"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase/use-user";
import { useCollection } from "@/firebase/use-collection";
import { useFirestore } from "@/firebase/provider";
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import type { Product, Partner, Order, RechargeRequest } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function TestPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  // Data Fetching Hooks
  const { data: products, loading: productsLoading, error: productsError } = useCollection<Product>("products");
  const { data: partners, loading: partnersLoading, error: partnersError } = useCollection<Partner>("partners");
  const { data: orders, loading: ordersLoading, error: ordersError } = useCollection<Order>("orders");
  const { data: rechargeRequests, loading: rechargeLoading, error: rechargeError } = useCollection<RechargeRequest>("rechargeRequests");

  const handleAddProduct = async () => {
    if (!firestore) return;
    const productData: Omit<Product, 'id'> = {
      slug: "test-product",
      name: "Test Product",
      brand: "Tester",
      category: "Testing",
      subcategory: "Unit Tests",
      price: { original: 100, currency: "₹" },
      quantity: 10,
      image: "https://picsum.photos/seed/test/400/400",
      description: "A product for testing.",
      ratings: { average: 5, count: 1 },
      sku: "TEST-001",
    };
    
    addDoc(collection(firestore, "products"), productData)
      .then((docRef) => {
         setDoc(doc(firestore, "products", docRef.id), { id: docRef.id }, { merge: true });
         toast({ title: "Success", description: "Test product added." });
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: 'products',
          operation: 'create',
          requestResourceData: productData
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleAddOrder = async () => {
    if (!firestore || !user) {
        toast({ title: "Error", description: "You must be logged in to create an order.", variant: "destructive"});
        return;
    };
    const orderData: Omit<Order, 'id' | 'orderDate'> = {
      partnerId: user.uid,
      customerName: "Test Customer",
      customerPhone: "1234567890",
      shippingAddress: "123 Test St",
      productSku: "TEST-001",
      quantity: 1,
      paymentMethod: "COD",
      status: "Pending",
      amount: 100,
    };
     const finalData = { ...orderData, orderDate: serverTimestamp() };
     addDoc(collection(firestore, "orders"), finalData)
      .then((docRef) => {
        setDoc(doc(firestore, "orders", docRef.id), { id: docRef.id }, { merge: true });
        toast({ title: "Success", description: "Test order added." })
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: 'orders',
          operation: 'create',
          requestResourceData: finalData
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };
  
  const handleAddRecharge = async () => {
     if (!firestore || !user) {
        toast({ title: "Error", description: "You must be logged in to create a request.", variant: "destructive"});
        return;
    };
    const rechargeData: Omit<RechargeRequest, 'id' | 'requestDate'> = {
      userId: user.uid,
      amount: 50,
      screenshotUrl: "https://picsum.photos/seed/screenshot/200/300",
      status: "Pending",
    };
    const finalData = { ...rechargeData, requestDate: serverTimestamp() };
     addDoc(collection(firestore, "rechargeRequests"), finalData)
      .then((docRef) => {
        setDoc(doc(firestore, "rechargeRequests", docRef.id), { id: docRef.id }, { merge: true });
        toast({ title: "Success", description: "Test recharge request added." });
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: 'rechargeRequests',
          operation: 'create',
          requestResourceData: finalData
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  const renderStatus = (loading: boolean, error: Error | null, data: any[] | null) => {
    if (loading) return <span className="text-yellow-500">Loading...</span>;
    if (error) return <span className="text-red-500">Error: {error.message.split('\n')[0]}</span>;
    if (data) return <span className="text-green-500">Success ({data.length} docs)</span>;
    return <span className="text-gray-500">Idle</span>;
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Backend Test Page</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
          <CardDescription>Checks if a user is currently logged in.</CardDescription>
        </CardHeader>
        <CardContent>
          {userLoading ? (
             <p>Loading user state...</p>
          ) : user ? (
            <div className="text-green-600">
                <p><strong>Logged In:</strong> Yes</p>
                <p><strong>UID:</strong> {user.uid}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role || 'Not set'}</p>
            </div>
          ) : (
             <p className="text-red-600"><strong>Logged In:</strong> No</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Firestore Read Tests</CardTitle>
          <CardDescription>Attempts to read data from various Firestore collections.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
                <p>Products Collection (`/products`):</p>
                {renderStatus(productsLoading, productsError, products)}
            </div>
             <div className="flex justify-between items-center">
                <p>Partners Collection (`/partners`):</p>
                {renderStatus(partnersLoading, partnersError, partners)}
            </div>
             <div className="flex justify-between items-center">
                <p>Orders Collection (`/orders`):</p>
                {renderStatus(ordersLoading, ordersError, orders)}
            </div>
            <div className="flex justify-between items-center">
                <p>Recharge Requests (`/rechargeRequests`):</p>
                {renderStatus(rechargeLoading, rechargeError, rechargeRequests)}
            </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Firestore Write Tests</CardTitle>
          <CardDescription>Attempts to write a new document to various collections.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
            <Button onClick={handleAddProduct} disabled={!firestore}>Add Test Product</Button>
            <Button onClick={handleAddOrder} disabled={!firestore || !user}>Add Test Order</Button>
            <Button onClick={handleAddRecharge} disabled={!firestore || !user}>Add Test Recharge Request</Button>
        </CardContent>
      </Card>

    </div>
  );
}
