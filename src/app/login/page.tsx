
"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    const user = { name: "Test User", email: "test@example.com" };
    localStorage.setItem("user", JSON.stringify(user));
    router.push("/partner/orders");
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

