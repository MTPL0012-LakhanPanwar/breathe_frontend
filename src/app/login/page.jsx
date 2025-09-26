"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
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
      router.push("/dashboard");
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center">
        <Image
          src="/logo.svg"
          alt="BREATHE AI"
          width={48}
          height={48}
          className="mx-auto h-12 w-auto"
        />
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Or{" "}
          <Link
            href="/signup"
            className="font-medium text-green-600 hover:text-green-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
        </div>

        <Button type="submit" isLoading={isLoading} fullWidth>
          Sign in
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
}
