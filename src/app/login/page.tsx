"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple admin check
    if (email === "admin@example.com" && password === "704331") {
      router.push("/admin");
      return;
    }
    
    // For now, redirect all users to home
    router.push("/");
  };

  const handleSkip = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md rounded-lg bg-white p-6 sm:p-8 shadow-lg">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">Shopwave</h1>
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
              className="w-full bg-red-500 text-white hover:bg-red-600 text-sm sm:text-base py-2 sm:py-3"
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
