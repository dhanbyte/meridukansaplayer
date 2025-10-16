"use client";

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
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement actual login logic
    // For now, storing a dummy user and redirecting
    try {
      localStorage.setItem("user", JSON.stringify({ email: "partner@example.com", role: "partner" }));
      // Redirect based on role
      router.push('/partner/orders');
    } catch (error) {
      console.error("Could not save user to local storage", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold">Shopwave Dropshipping</h1>
        <p className="text-muted-foreground">Partner me aapka swagat hai</p>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center p-6">
            <Image 
                src="https://wukusy.com/wp-content/uploads/2024/05/wukusy-logo.png" 
                alt="Wukusy Logo"
                width={200}
                height={50}
                data-ai-hint="logo"
                priority
            />
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleLogin}>
            <div className="grid gap-2">
              <Label htmlFor="email" className="sr-only">Email address</Label>
              <Input id="email" type="email" placeholder="Email address" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="sr-only">Password</Label>
              <Input id="password" type="password" placeholder="Password" required />
            </div>
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
