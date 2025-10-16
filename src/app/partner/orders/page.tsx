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

export default function PartnerOrdersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Orders</CardTitle>
        <CardDescription>A list of your recent orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <div className="font-medium">Liam Johnson</div>
                <div className="text-sm text-muted-foreground">
                  liam@example.com
                </div>
              </TableCell>
              <TableCell>Product A</TableCell>
              <TableCell>
                <Badge variant="outline">Pending</Badge>
              </TableCell>
              <TableCell>$250.00</TableCell>
              <TableCell>2023-06-23</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
