"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import LoginForm from "./login/page";
import SignupForm from "./signup/page";
import { Toaster, toast } from "react-hot-toast";

export default function Page() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  const {
    isAuthenticated,
    successMessage,
    error,
    clearError,
    clearSuccessMessage,
    initializeAuth,
  } = useAuthStore();

  // Initialize auth from localStorage on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Show success/error toast messages
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      clearSuccessMessage();
    }
  }, [successMessage, clearSuccessMessage]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="shadow-xl overflow-hidden w-full max-w-md">
        <div className="p-0 md:p-8">
          {isLogin ? (
            <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
          ) : (
            <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}
