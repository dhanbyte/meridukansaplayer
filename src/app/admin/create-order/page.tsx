"use client";
import React, { useState, useEffect } from 'react';

export default function CreateOrderPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log('Create Order Page mounted');
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Create Single Order</h1>
      <div className="bg-white p-6 rounded-lg border">
        <p className="text-green-600">✅ Create Order page is working!</p>
        <p className="text-gray-600 mt-2">This page has been successfully created and is accessible.</p>
      </div>
    </div>
  );
}
