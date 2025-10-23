"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Mail, Lock, User, Calendar, Users } from "lucide-react";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import Link from "next/link";
import Image from "next/image";

export default function SignupForm() {

  const { signup, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    dob: "",
    gender: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (!formData.dob) {
      errors.dob = "Date of birth is required";
    } else if (new Date(formData.dob) > new Date()) {
      errors.dob = "Date of birth cannot be in the future";
    }
    if (!formData.gender) {
      errors.gender = "Gender is required";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await signup({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      dob: formData.dob,
      gender: formData.gender,
    });

    if (result.success) {
      setSuccessMessage(
        "Your request has been submitted to the Admin. He will review and approve it. Once approved, you will receive confirmation via email."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-md mb-8">
        <div className="bg-green-500 rounded-2xl p-8 text-center text-white mb-2">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="BREATHE AI"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
          <h1 className="text-xl font-bold tracking-wide">BREATHE AI</h1>
          <p className="text-green-100 text-sm mt-2">
            Start your wellness journey today
          </p>
        </div>
      </div>

      <div className="w-full max-w-md">
        {/* Show success message instead of form */}
        {successMessage ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-green-600 font-medium mb-5">{successMessage}</p>
            <Link
              href="/login"
              className="text-green-500 font-medium hover:text-green-600"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create your account
              </h2>
              <p className="text-gray-600 text-sm">
                Or{" "}
                <Link
                  href="/login"
                  className="text-green-500 font-medium hover:text-green-600"
                >
                  sign in to your account
                </Link>
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <InputField
                    icon={User}
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    error={validationErrors.username}
                    placeholder="Enter your username"
                  />

                  <InputField
                    icon={Mail}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={validationErrors.email}
                    placeholder="Enter your email"
                  />

                  <InputField
                    icon={Lock}
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={validationErrors.password}
                    placeholder="Create a password"
                    showPasswordToggle={true}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    showPassword={showPassword}
                  />

                  <InputField
                    icon={Calendar}
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    error={validationErrors.dob}
                    placeholder="Date of birth"
                    max={new Date().toISOString().split("T")[0]}
                  />

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 text-black py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 appearance-none ${
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
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
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
                    {validationErrors.gender && (
                      <p className="border-red-300 text-red-500 focus:ring-red-500 text-sm mt-1">
                        {validationErrors.gender}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <Button type="submit" isLoading={isLoading} className="w-35">
                    Sign Up
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Social Login */}
      <SocialLoginButtons />
    </div>
  );
}
