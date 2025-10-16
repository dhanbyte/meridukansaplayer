
"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (email === "admin@example.com" && password === "704331") {
      // Admin login
      const admin = { name: "Admin User", email: "admin@example.com" };
      localStorage.setItem("user", JSON.stringify(admin));
      router.push("/admin");
    } else if (email && password) {
       // Partner login (simulation)
       // In a real app, you would validate partner credentials against a database
      const user = { name: "Partner User", email: email };
      localStorage.setItem("user", JSON.stringify(user));
      router.push("/partner/orders");
    } else {
        toast({
            variant: "destructive",
            title: "Invalid Credentials",
            description: "Please check your email and password.",
        });
    }
  };

  const handleSkip = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
           <Image
            src="https://wukusy.com/wp-content/uploads/2024/05/wukusy-logo.png"
            alt="Wukusy Logo"
            width={180}
            height={50}
            className="mx-auto"
            priority
          />
          <h1 className="mt-4 text-2xl font-bold text-gray-800">Shopwave Dropshipping</h1>
          <p className="text-gray-600">Partner me aapka swagat hai</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label htmlFor="email" className="sr-only">
              Email address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password" className="sr-only">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <Button
              type="submit"
              className="w-full bg-red-500 text-white hover:bg-red-600"
            >
              Sign in
            </Button>
          </div>
          <div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleSkip}
            >
              Skip for now
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
