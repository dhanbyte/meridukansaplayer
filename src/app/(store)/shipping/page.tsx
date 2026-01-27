import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ShippingPage() {
  const shippingCharges = [
    { weight: '0 to 0.5kg', charge: 89 },
    { weight: '0.5kg to 1kg', charge: 129 },
    { weight: '1 to 2kg', charge: 149 },
    { weight: '2 to 3kg', charge: 169 },
    { weight: '3 to 4kg', charge: 189 },
    { weight: '4 to 5kg', charge: 209 },
    { weight: '5 to 10kg', charge: 289 },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Shipping Charges</CardTitle>
          <CardDescription>
            Our shipping rates are based on the total weight of your order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Weight Range</TableHead>
                <TableHead>Shipping Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shippingCharges.map((item) => (
                <TableRow key={item.weight}>
                  <TableCell className="font-medium">{item.weight}</TableCell>
                  <TableCell>₹{item.charge.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Handling Charges</CardTitle>
          <CardDescription>
            An additional handling fee is applied to all orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <p className="font-medium">Handling Charge</p>
            <p className="text-lg font-bold">₹25.00</p>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            This is a flat fee for all orders, regardless of order value or
            weight.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
