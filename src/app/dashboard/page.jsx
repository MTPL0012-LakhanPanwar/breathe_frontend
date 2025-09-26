"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import Header from "@/components/Header";
import Button from "@/components/Button";
import { MessageCircle } from "lucide-react";
import Toast from "@/components/Toast";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, successMessage, clearSuccessMessage } =
    useAuthStore();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (successMessage) {
      setShowToast(true);
      const timer = setTimeout(() => {
        clearSuccessMessage();
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, clearSuccessMessage]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {showToast && successMessage && (
        <Toast
          message={successMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Welcome, {user.username}!
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-green-800 mb-2">
                Your Status
              </h2>
              <div className="flex items-center space-x-2 mb-4">
                <div
                  className={`h-3 w-3 rounded-full ${
                    user.isApproved ? "bg-green-500" : "bg-yellow-500"
                  }`}
                ></div>
                <span className="text-sm font-medium text-gray-700">
                  {user.isApproved ? "Approved" : "Pending Approval"}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {user.isApproved
                  ? "You can now chat with BREATHE AI and access all features."
                  : "Your account is pending approval from an administrator. Some features may be limited."}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                Chat with BREATHE AI
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Start a conversation with our AI assistant to explore
                mindfulness, sustainable living, and more.
              </p>
              <Button
                onClick={() => router.push("/chat")}
                icon={MessageCircle}
                disabled={!user.isApproved}
              >
                Start Chatting
              </Button>
              {!user.isApproved && (
                <p className="mt-2 text-xs text-red-600">
                  You need approval to chat with BREATHE AI
                </p>
              )}
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-purple-800 mb-2">
                Account Type
              </h2>
              <p className="text-sm font-medium text-gray-700 mb-1">
                {user.userType === "admin" ? "Administrator" : "Standard User"}
              </p>
              <p className="text-sm text-gray-600">
                {user.userType === "admin"
                  ? "You have access to administrative features, including user management."
                  : "You have access to standard user features."}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
