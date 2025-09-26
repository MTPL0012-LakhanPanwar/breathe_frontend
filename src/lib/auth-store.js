// lib/auth-store.js
"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { apiService } from "./api-service";

export const useAuthStore = create(
  devtools((set, get) => ({
    // --- Auth State ---
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,

    // --- Loading States ---
    isLoading: false,
    isLoadingUsers: false,
    isLoadingProfile: false,
    isLoadingChat: false,

    // --- Error States ---
    error: null,
    usersError: null,
    profileError: null,
    chatError: null,

    // --- Success States ---
    successMessage: null,

    // --- Data States ---
    users: [],
    currentProfile: null,
    chatMessages: [],

    // --- UI State ---
    activeTab: "dashboard",

    // --------------------------
    // --- Helpers & Actions ---
    // --------------------------

    setSuccessMessage: (message) => {
      set({ successMessage: message });
      setTimeout(() => set({ successMessage: null }), 3000);
    },

    initializeAuth: () => {
      try {
        const token = localStorage.getItem("access_token");
        const refresh = localStorage.getItem("refresh_token");
        const user = localStorage.getItem("user");

        if (token && refresh && user) {
          set({
            accessToken: token,
            refreshToken: refresh,
            // user: JSON.parse(user),
            user: user,
            isAuthenticated: true,
          });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      }
    },

    login: async (credentials) => {
      set({ isLoading: true, error: null });
      try {
        const data = await apiService.login(credentials);

        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("user", JSON.stringify(data.user));

        set({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        get().setSuccessMessage("Login successful!");
        return { success: true, data };
      } catch (error) {
        set({ isLoading: false, error: error.message || "Login failed" });
        return { success: false, error };
      }
    },

    signup: async (userData) => {
      set({ isLoading: true, error: null });
      try {
        const data = await apiService.signup(userData);

        localStorage.setItem("user", JSON.stringify(data));

        set({ user: data, isLoading: false, error: null });
        get().setSuccessMessage("Account created successfully!");
        return { success: true, data };
      } catch (error) {
        set({ isLoading: false, error: error.message || "Signup failed" });
        return { success: false, error };
      }
    },

    socialLogin: async ({ provider }) => {
      set({ isLoading: true, error: null });
      try {
        const authWindow = window.open(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`,
          "_blank",
          "width=600,height=600"
        );

        const handleMessage = async (event) => {
          if (event.origin !== window.location.origin) return;

          if (event.data?.type === "social_auth_success") {
            window.removeEventListener("message", handleMessage);

            const { access_token, refresh_token, user } = event.data.payload;

            localStorage.setItem("access_token", access_token);
            localStorage.setItem("refresh_token", refresh_token);
            localStorage.setItem("user", JSON.stringify(user));

            set({
              accessToken: access_token,
              refreshToken: refresh_token,
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            get().setSuccessMessage(
              `${
                provider.charAt(0).toUpperCase() + provider.slice(1)
              } login successful!`
            );

            return {
              success: true,
              data: { access_token, refresh_token, user },
            };
          }
        };

        window.addEventListener("message", handleMessage);

        // Demo simulation
        setTimeout(() => {
          const mockUser = {
            id: `${provider}_user_123`,
            name: `${
              provider.charAt(0).toUpperCase() + provider.slice(1)
            } User`,
            email: `user@${provider}.com`,
            isApproved: true,
            role: "user",
          };

          const mockTokens = {
            access_token: `mock_${provider}_access_token_${Date.now()}`,
            refresh_token: `mock_${provider}_refresh_token_${Date.now()}`,
          };

          localStorage.setItem("access_token", mockTokens.access_token);
          localStorage.setItem("refresh_token", mockTokens.refresh_token);
          localStorage.setItem("user", JSON.stringify(mockUser));

          set({
            accessToken: mockTokens.access_token,
            refreshToken: mockTokens.refresh_token,
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          if (authWindow) authWindow.close();

          get().setSuccessMessage(
            `${
              provider.charAt(0).toUpperCase() + provider.slice(1)
            } login successful!`
          );
        }, 1500);

        return { success: true };
      } catch (error) {
        set({
          isLoading: false,
          error: error.message || `${provider} login failed`,
          isAuthenticated: false,
        });
        return { success: false, error };
      }
    },

    logout: () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        error: null,
        users: [],
        currentProfile: null,
        chatMessages: [],
        activeTab: "dashboard",
      });

      get().setSuccessMessage("Logged out successfully!");
    },

    // --- Admin actions ---
    fetchUsers: async () => {
      const { accessToken } = get();
      if (!accessToken) return { success: false, error: "No access token" };

      set({ isLoadingUsers: true, usersError: null });
      try {
        const data = await apiService.getUsers(accessToken);
        set({ users: data, isLoadingUsers: false, usersError: null });
        return { success: true, data };
      } catch (error) {
        set({
          isLoadingUsers: false,
          usersError: error.message || "Failed to fetch users",
        });
        return { success: false, error: error.message };
      }
    },

    updateUserApproval: async (userId, isApproved) => {
      const { accessToken, users } = get();
      if (!accessToken) return { success: false, error: "No access token" };

      set({ isLoading: true, error: null });
      try {
        const data = await apiService.updateUserApproval(
          userId,
          isApproved,
          accessToken
        );

        const updatedUsers = users.map((user) =>
          user.id === userId ? { ...user, isApproved } : user
        );

        set({ users: updatedUsers, isLoading: false, error: null });

        get().setSuccessMessage(
          `User ${isApproved ? "approved" : "unapproved"} successfully!`
        );
        return { success: true, data };
      } catch (error) {
        set({
          isLoading: false,
          error: error.message || "Failed to update user approval",
        });
        return { success: false, error: error.message };
      }
    },

    // --- User actions ---
    fetchUserProfile: async (userId) => {
      const { accessToken } = get();
      if (!accessToken) return { success: false, error: "No access token" };

      set({ isLoadingProfile: true, profileError: null });
      try {
        const data = await apiService.getUserById(userId, accessToken);
        set({
          currentProfile: data,
          isLoadingProfile: false,
          profileError: null,
        });
        return { success: true, data };
      } catch (error) {
        set({
          isLoadingProfile: false,
          profileError: error.message || "Failed to fetch profile",
        });
        return { success: false, error: error.message };
      }
    },

    updateProfile: async (profileData) => {
      const { accessToken } = get();
      if (!accessToken) return { success: false, error: "No access token" };

      set({ isLoadingProfile: true, profileError: null });
      try {
        const data = await apiService.updateProfile(profileData, accessToken);
        set({
          currentProfile: data,
          user: data,
          isLoadingProfile: false,
          profileError: null,
        });

        localStorage.setItem("user", JSON.stringify(data));
        get().setSuccessMessage("Profile updated successfully!");
        return { success: true, data };
      } catch (error) {
        set({
          isLoadingProfile: false,
          profileError: error.message || "Failed to update profile",
        });
        return { success: false, error: error.message };
      }
    },

    // --- Chat ---
    sendChatMessage: async (input) => {
      const { accessToken, chatMessages } = get();
      if (!accessToken) return { success: false, error: "No access token" };

      set({ isLoadingChat: true, chatError: null });

      const userMessage = {
        type: "user",
        content: input,
        timestamp: new Date(),
      };
      const updatedMessages = [...chatMessages, userMessage];
      set({ chatMessages: updatedMessages });

      try {
        const data = await apiService.sendMessage(input, accessToken);

        const botMessage = {
          type: "bot",
          content: data.response,
          timestamp: new Date(),
        };
        set({
          chatMessages: [...updatedMessages, botMessage],
          isLoadingChat: false,
          chatError: null,
        });

        return { success: true, data };
      } catch (error) {
        set({
          isLoadingChat: false,
          chatError: error.message || "Failed to send message",
        });
        return { success: false, error: error.message };
      }
    },

    // --- UI ---
    setActiveTab: (tab) => set({ activeTab: tab }),
  }))
);

// Custom hook to use the store
// export const useAuth = () => {
//   const [state, setState] = useState(useAuthStore.getState());

//   useEffect(() => {
//     const unsubscribe = useAuthStore.subscribe(setState);
//     return unsubscribe;
//   }, []);

//   return {
//     ...state,
//     login: useAuthStore.login,
//     signup: useAuthStore.signup,
//     logout: useAuthStore.logout,
//     fetchUsers: useAuthStore.fetchUsers,
//     updateUserApproval: useAuthStore.updateUserApproval,
//     fetchUserProfile: useAuthStore.fetchUserProfile,
//     updateProfile: useAuthStore.updateProfile,
//     sendChatMessage: useAuthStore.sendChatMessage,
//     setActiveTab: useAuthStore.setActiveTab,
//   };
// };
