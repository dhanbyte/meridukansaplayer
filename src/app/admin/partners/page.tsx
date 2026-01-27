"use client";

import { Button } from "@/components/ui/button";
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
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useCollection } from "@/hooks/use-collection";
import type { Partner } from "@/lib/types";

export default function AdminPartnersPage() {

  const { data: partners = [], loading } = useCollection<Partner>("partners");

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Partners</h1>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/admin/partners/create">
            <Button size="sm" className="h-7 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Create Partner
              </span>
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Partner Accounts</CardTitle>
          <CardDescription>
            Manage your partner accounts here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Bank Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map((partner, index) => (
                <TableRow key={partner.id || partner._id || index}>
                  <TableCell>
                    <div className="font-medium">{partner.name}</div>
                  </TableCell>
                  <TableCell>{partner.email}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p><strong>Bank:</strong> {partner.bankName}</p>
                      <p><strong>A/C:</strong> ****{partner.accountNumber?.slice(-4)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={partner.status === "Active" ? "default" : "destructive"}>{partner.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      {partner.status === "Active" ? "Deactivate" : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
