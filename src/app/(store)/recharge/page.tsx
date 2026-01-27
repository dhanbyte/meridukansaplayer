
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RechargePage() {
  const router = useRouter();

  useEffect(() => {
    // Force redirect to banking page which has all wallet functionality
    // Add timestamp to prevent caching issues
    router.replace(`/banking?t=${Date.now()}`);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Wallet page...</p>
        <p className="text-xs text-gray-500 mt-2">All wallet functionality has been moved to Banking</p>
      </div>
    </div>
  );
}
