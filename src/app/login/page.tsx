"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { useFirebaseApp, useFirestore, useAuth } from "@/firebase/provider";
import { useUser } from "@/firebase/use-user";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const app = useFirebaseApp();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading } = useUser();

  React.useEffect(() => {
    if (user && !loading) {
      const checkUserRole = async () => {
        if (!firestore) return;
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === "admin") {
            router.push("/admin");
          } else if (userData.role === "partner") {
            router.push("/partner/orders");
          } else {
             router.push("/");
          }
        }
      };
      checkUserRole();
    }
  }, [user, loading, firestore, router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(firestore, "users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'admin') {
          router.push("/admin");
        } else if (userData.role === 'partner') {
          router.push("/partner/orders");
        } else {
           router.push("/");
        }
      } else {
          // This case handles regular users or partners who don't have a specific role document yet.
          // For this app, we assume they are customers/store visitors.
          router.push("/");
      }

    } catch (error: any) {
       // Special handling for admin user creation on first login
      if (email === "admin@example.com" && password === "704331" && error.code === 'auth/user-not-found') {
          try {
            const adminCredential = await createUserWithEmailAndPassword(auth, email, password);
            const adminUser = adminCredential.user;
            await setDoc(doc(firestore, "users", adminUser.uid), {
              uid: adminUser.uid,
              email: adminUser.email,
              displayName: "Admin",
              role: "admin",
            });
            router.push("/admin");
          } catch (creationError: any) {
             toast({
                variant: "destructive",
                title: "Admin Creation Failed",
                description: creationError.message,
            });
          }
      } else {
         toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Please check your email and password.",
        });
      }
    }
  };

  const handleSkip = () => {
    router.push("/");
  };

  if(loading || user) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div>Loading...</div>
      </div>
    )
  }

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
