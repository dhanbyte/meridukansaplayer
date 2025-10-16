
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
          <Button type="submit">Create Partner</Button>
        </form>
      </CardContent>
    </Card>
  );
}
