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

export default function AdminPartnersPage() {
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
              <TableRow>
                <TableCell>
                  <div className="font-medium">Partner One</div>
                </TableCell>
                <TableCell>partner.one@example.com</TableCell>
                 <TableCell>
                  <div className="text-sm">
                    <p><strong>Bank:</strong> State Bank of India</p>
                    <p><strong>A/C:</strong> ****1234</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge>Active</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    Deactivate
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
