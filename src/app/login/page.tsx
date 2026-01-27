"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for admin first using context
    const result = await login(email, password);
    
    if (result.success) {
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      
      // Determine redirect based on role (returned in data by context eventually)
      // For now, check if user has admin role after login
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (user?.role === 'admin') {
        router.push("/admin");
      } else {
        router.push("/partner/orders");
      }
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: result.error || "Invalid credentials",
      });
    }
  };

  const handleSkip = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md rounded-lg bg-white p-6 sm:p-8 shadow-lg">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-2">Shopwave</h1>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Dropshipping</h2>
          <p className="text-sm sm:text-base text-gray-600">Partner me aapka swagat hai</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
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
              className="w-full text-sm sm:text-base"
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
              className="w-full text-sm sm:text-base"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <Button
              type="submit"
              className="w-full bg-brand-navy text-white hover:bg-brand-charcoal text-sm sm:text-base py-2 sm:py-3"
            >
              Sign in
            </Button>
          </div>
          <div>
            <Button
              type="button"
              variant="outline"
              className="w-full text-sm sm:text-base py-2 sm:py-3"
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
