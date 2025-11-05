 
"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  User,
  Bell,
  Box,
  Truck,
  MoreHorizontal,
  LogOut,
// Only keep the export default StoreLayout function below

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex flex-col flex-1 sm:pl-16">
        <Header />
        <main className="flex-1 p-6">
           {children}
        </main>
      </div>
    </div>
  );
}


export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex min-h-screen bg-gray-100">
        <div className="flex flex-col flex-1 sm:pl-16">
          <Header />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </CartProvider>
  );
}
