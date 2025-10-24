"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { authService } from "../lib/auth-service";

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

    // --- Error States ---
    error: null,
    usersError: null,
    profileError: null,

    // --- Success States ---
    successMessage: null,

    // --- Data States ---
    users: [],
    currentProfile: null,

    // --- UI State ---
    activeTab: "chat",

    // --------------------------
    // --- Helpers & Actions ---
    // --------------------------

    setSuccessMessage: (message) => {
      set({ successMessage: message });
      setTimeout(() => set({ successMessage: null }), 2000);
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
            user: user,
            isAuthenticated: true,
          });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      }
    },

    // --- Auth actions ---
    login: async (credentials) => {
      set({ isLoading: true, error: null });
      try {
        const data = await authService.login(credentials);

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
        const errorMsg = error.message || "Login failed";
        set({ isLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }
    },

    signup: async (userData) => {
      set({ isLoading: true, error: null });
      try {
        const data = await authService.signup(userData);

        localStorage.setItem("user", JSON.stringify(data));

        set({ user: data, isLoading: false, error: null });
        return { success: true, data };
      } catch (error) {
        const errorMsg = error.message || "Signup failed";
        set({ isLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }
    },

    socialLogin: async ({ provider, id_token, access_token }) => {
      set({ isLoading: true, error: null });
      try {
        const payload = { provider };

        // Add the appropriate token based on provider
        if (provider === "google" && id_token) {
          payload.id_token = id_token;
        } else if (provider === "facebook" && access_token) {
          payload.access_token = access_token;
        }

        const data = await authService.socialLogin(payload);

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

        get().setSuccessMessage(`${provider} login successful!`);
        return { success: true };
      } catch (error) {
        const errorMsg = error.message || `${provider} login failed`;
        set({ isLoading: false, error: errorMsg, isAuthenticated: false });
        return { success: false, error: errorMsg };
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
        activeTab: "chat",
      });
    },

    // --- Admin actions ---
    fetchUsers: async () => {
      const { accessToken } = get();
      if (!accessToken) return { success: false, error: "No access token" };

      set({ isLoadingUsers: true, usersError: null });
      try {
        const data = await authService.getUsers(accessToken);
        set({ users: data, isLoadingUsers: false, usersError: null });
        return { success: true, data };
      } catch (error) {
        const errorMsg = error.message || "Failed to fetch users";
        set({ isLoadingUsers: false, usersError: errorMsg });
        return { success: false, error: errorMsg };
      }
    },

    updateUserApproval: async (userId, isApproved) => {
      const { accessToken, users } = get();
      if (!accessToken) return { success: false, error: "No access token" };

      set({ isLoading: true, error: null });
      try {
        const data = await authService.updateUserApproval(
          userId,
          isApproved,
          accessToken
        );

        const updatedUsers = users.map((user) =>
          user.id === userId ? { ...user, isApproved } : user
        );

        set({ users: updatedUsers, isLoading: false, error: null });

        return { success: true, data };
      } catch (error) {
        const errorMsg = error.message || "Failed to update user approval";
        set({ isLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }
    },

    // --- User actions ---
    fetchUserProfile: async () => {
      const { accessToken } = get();
      if (!accessToken) return { success: false, error: "No access token" };

      set({ isLoadingProfile: true, profileError: null });
      try {
        const data = await authService.getUserProfile(accessToken);
        set({
          currentProfile: data,
          user: data, // Update the stored user as well
          isLoadingProfile: false,
          profileError: null,
        });
        return { success: true, data };
      } catch (error) {
        const errorMsg = error.message || "Failed to fetch profile";
        set({ isLoadingProfile: false, profileError: errorMsg });
        return { success: false, error: errorMsg };
      }
    },

    updateProfile: async (profileData) => {
      const { accessToken } = get();
      if (!accessToken) return { success: false, error: "No access token" };

      set({ isLoadingProfile: true, profileError: null });
      try {
        const data = await authService.updateProfile(profileData, accessToken);
        set({
          currentProfile: data,
          user: data, // Update local user
          isLoadingProfile: false,
          profileError: null,
        });
        localStorage.setItem("user", JSON.stringify(data));
        get().setSuccessMessage("Profile updated successfully!");
        return { success: true, data };
      } catch (error) {
        const errorMsg = error.message || "Failed to update profile";
        set({ isLoadingProfile: false, profileError: errorMsg });
        return { success: false, error: errorMsg };
      }
    },

    changePassword: async (payload) => {
      const { accessToken } = get();
      if (!accessToken) return { success: false, error: "No access token" };

      set({ isLoading: true, error: null });
      try {
        const data = await authService.changePassword(payload, accessToken);
        set({ isLoading: false });
        get().setSuccessMessage(
          data.message || "Password changed successfully!"
        );
        return { success: true, data };
      } catch (error) {
        const errorMsg = error.message || "Failed to change password";
        set({ isLoading: false, error: errorMsg });
        get().setSuccessMessage(errorMsg);
        return { success: false, error: errorMsg };
      }
    },

    deleteAccount: async () => {
      const { accessToken } = get();
      if (!accessToken) return { success: false, error: "No access token" };

      set({ isLoading: true, error: null });
      try {
        const data = await authService.deleteAccount(accessToken);

        // Clear local storage
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });

        return { success: true, data };
      } catch (error) {
        const errorMsg = error.message || "Failed to delete account";
        set({ isLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }
    },

    // --- UI ---
    setActiveTab: (tab) => set({ activeTab: tab }),
    clearError: () => set({ error: null }),
    clearSuccessMessage: () => set({ successMessage: null }),
  }))
);
