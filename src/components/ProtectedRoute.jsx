"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  // Mark client mounted
  useEffect(() => {
    setIsClient(true);
    initializeAuth(); // check tokens from localStorage
  }, [initializeAuth]); 

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.push("/login");
    }
  }, [isClient, isAuthenticated, router]);

  if (!isClient || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-black">Loading....</p>
        </div>
      </div>
    );
  }

  return children;
}
