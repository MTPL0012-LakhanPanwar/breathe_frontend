"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import Header from "@/components/Header";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import ConfirmationModal from "@/components/ConfirmationModal";
import { User, Mail, Calendar, Save, Lock } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProfilePage() {
  const router = useRouter();
  const {
    user,
    fetchUserProfile,
    updateProfile,
    isLoadingProfile,
    profileError,
    successMessage,
    clearSuccessMessage,
    changePassword,
    deleteAccount,
  } = useAuthStore();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    gender: "",
    dob: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Fetch user profile once
  useEffect(() => {
    const loadProfile = async () => {
      const res = await fetchUserProfile();
      if (res.success && res.data) {
        setFormData({
          username: res.data.username || "",
          email: res.data.email || "",
          gender: res.data.gender || "",
          dob: res.data.dob || "",
        });
      }
    };

    loadProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      clearSuccessMessage();
    }
  }, [successMessage, clearSuccessMessage]);

  useEffect(() => {
    if (profileError) {
      toast.error(profileError);
    }
  }, [profileError]);

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) errors.username = "Username is required";

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.gender) errors.gender = "Gender is required";

    if (!formData.dob) {
      errors.dob = "Date of Birth is required";
    } else if (new Date(formData.dob) > new Date()) {
      errors.dob = "Date of Birth cannot be in the future";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    await updateProfile(formData);
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    const res = await deleteAccount();
    setIsDeletingAccount(false);

    if (res.success) {
      toast.success("Account deleted successfully!");
      setShowDeleteModal(false);
      router.push("/");
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    return parts.length === 1
      ? parts[0].charAt(0).toUpperCase()
      : (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" reverseOrder={false} />
        <Header />

        {/* Delete Account Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          title="Delete Account"
          message="Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data will be removed."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={isDeletingAccount}
        />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
            {/* User Info */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="h-10 w-16 md:h-16 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold">
                  {getInitials(formData.username || user?.username || "U")}
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                    {formData.username || user?.username || "Loading..."}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {user?.userType === "admin" ? "Administrator" : "User"}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <InputField
                    icon={User}
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    error={validationErrors.username}
                    placeholder="Enter username"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <InputField
                    icon={Mail}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={validationErrors.email}
                    placeholder="Enter email"
                  />
                </div>

                {/* Gender Dropdown */}
                <div className="relative flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>

                  <div className="relative w-full">
                    {/* Gender Icon */}
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>

                    {/* Select Dropdown */}
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-10 text-black py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 appearance-none ${
                        validationErrors.gender
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-200"
                      }`}
                    >
                      <option value="" disabled>
                        Select your gender
                      </option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>

                    {/* Dropdown Arrow */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Validation Error */}
                  {validationErrors.gender && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.gender}
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <InputField
                    icon={Calendar}
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    error={validationErrors.dob}
                    placeholder="Select date of birth"
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" isLoading={isLoadingProfile} icon={Save}>
                  Save Changes
                </Button>
              </div>
            </form>

            <div className="mt-10 flex gap-6 justify-center flex-col md:flex-row">
              {/* Change Password Section */}
              <div className="md:w-[50%] bg-white rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Change Password
                </h2>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const current_password =
                      e.target.current_password.value.trim();
                    const new_password = e.target.new_password.value.trim();

                    if (!current_password || !new_password) {
                      toast.error("Both fields are required");
                      return;
                    }

                    const res = await changePassword({
                      current_password,
                      new_password,
                    });
                    if (res.success) {
                      e.target.reset();
                      router.push("/");
                    }
                  }}
                  className="space-y-4"
                >
                  <InputField
                    icon={Lock}
                    showPasswordToggle={true}
                    type="password"
                    name="current_password"
                    placeholder="Current Password"
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    showPassword={showPassword}
                  />
                  <InputField
                    icon={Lock}
                    showPasswordToggle={true}
                    type="password"
                    name="new_password"
                    placeholder="New Password"
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    showPassword={showPassword}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" isLoading={isLoadingProfile}>
                      Update Password
                    </Button>
                  </div>
                </form>
              </div>

              {/* Delete Account Section */}
              <div className="md:w-[50%] bg-white rounded-lg">
                <h2 className="text-xl font-semibold text-red-600 mb-4">
                  Delete Account
                </h2>
                <p className="text-gray-600 mb-4">
                  Deleting your account is permanent and cannot be undone. All
                  your data will be removed.
                </p>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-600 border-1 border-red-600 hover:bg-red-700 text-white"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
