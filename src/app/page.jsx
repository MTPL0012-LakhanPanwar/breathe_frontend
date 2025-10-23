"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Initialize auth from localStorage
    initializeAuth();
    setIsChecking(false);
  }, [initializeAuth]);

  useEffect(() => {
    // Only redirect after checking is done
    if (!isChecking) {
      if (isAuthenticated) {
        router.replace("/chat");
      } else {
        router.replace("/login");
      }
    }
  }, [isChecking, isAuthenticated, router]);

  // Show loading while checking auth and redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-black">Loading...</p>
      </div>
    </div>
  ); 
}
