"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Mail, Lock } from "lucide-react";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import Link from "next/link";
import Image from "next/image";

export default function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
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

    const result = await login(formData);
    if (result.success) {
      router.push("/chat");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Header with BREATHE AI branding */}
      <div className="w-full max-w-sm mb-8">
        <div className="bg-green-500 rounded-2xl p-8 text-center text-white mb-8">
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
            Welcome back to your wellness journey
          </p>
        </div>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sign in to your account
          </h2>
          <p className="text-gray-600 text-sm">
            or{" "}
            <Link
              href="signup"
              className="text-green-500 font-medium hover:text-green-600"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form
          className="bg-white rounded-2xl shadow-lg p-6"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <InputField
              icon={Mail}
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={validationErrors.username}
              placeholder="Enter your username"
            />

            <InputField
              icon={Lock}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={validationErrors.password}
              placeholder="Enter your password"
              showPasswordToggle={true}
              onTogglePassword={() => setShowPassword(!showPassword)}
              showPassword={showPassword}
            />

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div className="flex items-center justify-center">
              <Button type="submit" isLoading={isLoading} className="w-35">
                Sign In
              </Button>
            </div>
          </div>
        </form>
      </div>
      {/* Social Login */}
      <SocialLoginButtons />
    </div>
  );
}
