
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
import { Textarea } from "@/components/ui/textarea";

export default function CreatePartnerPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Partner</CardTitle>
        <CardDescription>
          Fill out the form below to add a new partner.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="partner_name">Partner Name</Label>
              <Input id="partner_name" placeholder="John Doe" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="partner@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" placeholder="+1 234 567 890" />
            </div>
          </div>
          
          <div className="grid gap-2">
            <h3 className="font-semibold text-lg">Bank Details</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input id="bank_name" placeholder="e.g., State Bank of India" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account_holder_name">Account Holder Name</Label>
              <Input id="account_holder_name" placeholder="As per bank records" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input id="account_number" placeholder="Enter account number" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ifsc_code">IFSC Code</Label>
              <Input id="ifsc_code" placeholder="Enter IFSC code" />
            </div>
          </div>

          <Button type="submit" className="w-full md:w-auto">Create Partner</Button>
        </form>
      </CardContent>
    </Card>
  );
}
