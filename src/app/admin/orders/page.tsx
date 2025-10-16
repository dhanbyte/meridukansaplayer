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
import { Button } from "@/components/ui/button";

export default function AdminOrdersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
        <CardDescription>
          A list of all orders from all partners.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Partner</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tracking ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Partner One</TableCell>
              <TableCell>
                <div className="font-medium">Liam Johnson</div>
                <div className="text-sm text-muted-foreground">
                  liam@example.com
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">Pending</Badge>
              </TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>$250.00</TableCell>
              <TableCell>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Accept</Button>
                    <Button variant="destructive" size="sm">Reject</Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
