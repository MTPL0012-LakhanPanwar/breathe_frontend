"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/lib/auth-store";
import {
  User,
  MessageCircle,
  Settings,
  Shield,
  CheckCircle,
  LogOut,
  Users as UsersIcon,
  Calendar,
  Mail,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, successMessage, clearSuccessMessage } =
    useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  BREATHE AI Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user?.username}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <nav className="flex space-x-2">
                <button
                  onClick={() => router.push("/chat")}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat</span>
                </button>
                <button
                  onClick={() => router.push("/profile")}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200"
                >
                  <Settings className="h-4 w-4" />
                  <span>Profile</span>
                </button>
                {user?.userType === "admin" && (
                  <button
                    onClick={() => router.push("/admin/users")}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Users</span>
                  </button>
                )}
              </nav>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span className="text-green-700">{successMessage}</span>
            <button
              onClick={clearSuccessMessage}
              className="ml-auto text-green-400 hover:text-green-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Welcome</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {user?.username}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Type Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Account Type
                  </p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {user?.userType}
                  </p>
                </div>
              </div>
            </div>

            {/* Approval Status Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div
                  className={`p-3 rounded-full ${
                    user?.isApproved ? "bg-green-100" : "bg-yellow-100"
                  }`}
                >
                  <CheckCircle
                    className={`h-6 w-6 ${
                      user?.isApproved ? "text-green-600" : "text-yellow-600"
                    }`}
                  />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p
                    className={`text-lg font-semibold ${
                      user?.isApproved ? "text-green-900" : "text-yellow-900"
                    }`}
                  >
                    {user?.isApproved ? "Approved" : "Pending"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Profile Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Date of Birth
                  </p>
                  <p className="text-gray-900">{formatDate(user?.dob)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <UsersIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Gender</p>
                  <p className="text-gray-900 capitalize">{user?.gender}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Member Since
                  </p>
                  <p className="text-gray-900">{formatDate(user?.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => router.push("/chat")}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left"
              >
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Start Chatting</p>
                    <p className="text-sm text-gray-600">
                      {user?.isApproved
                        ? "Begin a conversation with BREATHE AI"
                        : "View chat (approval required to send messages)"}
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push("/profile")}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left"
              >
                <div className="flex items-center space-x-3">
                  <Settings className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Update Profile</p>
                    <p className="text-sm text-gray-600">
                      Manage your account information
                    </p>
                  </div>
                </div>
              </button>

              {user?.userType === "admin" && (
                <button
                  onClick={() => router.push("/admin/users")}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left"
                >
                  <div className="flex items-center space-x-3">
                    <Shield className="h-6 w-6 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Manage Users</p>
                      <p className="text-sm text-gray-600">
                        Admin panel for user management
                      </p>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Account Status Notice */}
          {!user?.isApproved && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Account Pending Approval:</strong> Your account is
                    currently under review. Once approved by an admin, you'll be
                    able to fully interact with BREATHE AI. You can explore the
                    interface, but chat functionality will be limited until
                    approval.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Message */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-8 text-white">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold mb-4">
                Welcome to BREATHE AI! 🌿
              </h2>
              <p className="text-green-100 mb-6">
                Your personal AI companion for mindfulness, wellness, and
                sustainable living. I'm here to help you heal yourself while
                healing the Earth through guided conversations, mindfulness
                exercises, and eco-friendly lifestyle tips.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => router.push("/chat")}
                  className="bg-white text-green-600 hover:bg-green-50 px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  {user?.isApproved ? "Start Chatting" : "View Chat"}
                </button>
                <button
                  onClick={() => router.push("/profile")}
                  className="bg-green-400 hover:bg-green-300 text-green-900 px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Complete Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
