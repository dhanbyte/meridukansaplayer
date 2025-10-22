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

export default function TestPage() {

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Test Page</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>MongoDB Connection Test</CardTitle>
          <CardDescription>Testing MongoDB connection and API endpoints.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is a test page for MongoDB integration.</p>
        </CardContent>
      </Card>
    </div>
  );
}
