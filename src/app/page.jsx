"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import LoginForm from "./login/page";
import SignupForm from "./signup/page";
import Image from "next/image";
import Toast from "@/components/Toast"; // make sure you have a Toast component

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
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
          <div className="text-center">
            <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Image
                src="/logo.svg"
                alt="BREATHE AI"
                width={32}
                height={32}
                className="rounded-full"
              />
            </div>
            <h1 className="text-white text-xl font-semibold">BREATHE AI</h1>
            <p className="text-white/80 text-sm mt-1">
              {isLogin
                ? "Welcome back to your wellness journey"
                : "Start your journey to inner peace"}
            </p>
          </div>
        </div>

        <div className="p-8">
          {isLogin ? (
            <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
          ) : (
            <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>

        {successMessage && (
          <Toast
            message={successMessage}
            type="success"
            onClose={clearSuccessMessage}
          />
        )}

        {error && <Toast message={error} type="error" onClose={clearError} />}
      </div>
    </div>
  );
}
