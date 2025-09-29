import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";

export const SocialLoginButtons = () => {
  const router = useRouter();
  const { socialLogin, isLoading } = useAuthStore();

  const handleSocialLogin = async (provider) => {
    try {
      const result = await socialLogin({ provider });
      if (result.success) {
        router.push("/chat");
      }
    } catch (error) {
      console.error("Social login error:", error);
    }
  };

  return (
    <div className="mt-4 grid grid-cols-3 gap-3">
      <button
        type="button"
        onClick={() => handleSocialLogin("google")}
        disabled={isLoading}
        className="w-full inline-flex justify-center py-2 px-4 border border-gray-300/60 rounded-md shadow-sm bg-white/80 backdrop-blur-sm glass-morphism text-sm font-medium text-black hover:bg-gray-50/90 transition-all duration-200 hover:scale-105"
      >
        Google
      </button>    
    </div>
  );
};

export default SocialLoginButtons;
