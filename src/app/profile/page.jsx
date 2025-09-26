"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import Header from "@/components/Header";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import { User, Mail, Phone, MapPin, Save } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    updateProfile,
    isLoadingProfile,
    profileError,
    successMessage,
    clearSuccessMessage,
  } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    } else if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
      });
    }
  }, [isAuthenticated, router, user]);

  // Show success toast
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      clearSuccessMessage();
    }
  }, [successMessage, clearSuccessMessage]);

  // Show error toast
  useEffect(() => {
    if (profileError) {
      toast.error(profileError);
    }
  }, [profileError]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
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
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
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
      {/* Toast container */}
      <Toaster position="top-right" reverseOrder={false} />

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="h-20 w-20 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold">
                {getInitials(formData.name || user.username)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {formData.name || user.username}
                </h1>
                <p className="text-sm text-gray-500">
                  {user.userType === "admin" ? "Administrator" : "User"}
                </p>
                <div className="flex items-center mt-1">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      user.isApproved ? "bg-green-500" : "bg-yellow-500"
                    } mr-2`}
                  ></div>
                  <span className="text-xs text-gray-500">
                    {user.isApproved ? "Approved" : "Pending Approval"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                icon={User}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={validationErrors.name}
                placeholder="Your full name"
              />

              <InputField
                icon={Mail}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={validationErrors.email}
                placeholder="Your email address"
              />

              <InputField
                icon={Phone}
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={validationErrors.phone}
                placeholder="Your phone number (optional)"
              />

              <InputField
                icon={MapPin}
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                error={validationErrors.location}
                placeholder="Your location (optional)"
              />
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
