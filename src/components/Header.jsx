import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Menu, X, Shield, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import Link from "next/link";
import { Toaster, toast } from "react-hot-toast";

const Header = () => {
  const router = useRouter();
  const { user, fetchUserProfile, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
    toast.success("Logout successful!");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/40 border-b border-gray-200 shadow-sm glass-morphism">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="mx-auto px-2 sm:px-3 lg:px-8">
        <div className="flex justify-between h-16">
          <Link href="/chat" className="flex items-center">
            <Image
              src="/logo.png"
              alt="BREATHE AI"
              width={60}
              height={60}
              className=""
            />
            <span className="ml-2 text-xl font-bold text-green-600">
              BREATHE AI
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user?.userType === "admin" && (
              <button
                onClick={() => router.push("/admin/users")}
                className="cursor-pointer px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                Users
              </button>
            )}
            <div className="relative ml-3">
              <div
                onClick={() => router.push("/profile")}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-medium">
                  {getInitials(user?.name || user?.username)}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="cursor-pointer px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/60 backdrop-blur-xl shadow-lg glass-morphism rounded-b-lg">
            <div
              onClick={() => router.push("/profile")}
              className="flex items-center space-x-2 px-3 py-2 cursor-pointer"
            >
              <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-medium">
                {getInitials(user?.name || user?.username)}
              </div>
            </div>
            {user?.userType == "admin" && (
              <button
                onClick={() => {
                  router.push("/admin/users");
                  setIsMenuOpen(false);
                }}
                className="cursor-pointer border-b border-b-green-600 flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 w-full text-left"
              >
                <Shield className="h-5 w-5" />
                <span>Users</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="cursor-pointer border-b border-b-green-600 flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 w-full text-left"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
