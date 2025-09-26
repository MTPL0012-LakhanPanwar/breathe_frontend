"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import Header from "@/components/Header";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import { User, Mail, Calendar, Save } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    fetchUserProfile,
    updateProfile,
    isLoadingProfile,
    profileError,
    successMessage,
    clearSuccessMessage,
  } = useAuthStore();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    gender: "",
    dob: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch user profile once
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

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
  }, [isAuthenticated, router, fetchUserProfile]);

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

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    return parts.length === 1
      ? parts[0].charAt(0).toUpperCase()
      : (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" reverseOrder={false} />
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          {/* User Info */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold">
                {getInitials(formData.username || user.username)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {formData.username || user.username}
                </h1>
                <p className="text-sm text-gray-500">
                  {user.userType === "admin" ? "Administrator" : "User"}
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
        </div>
      </main>
    </div>
  );
}
