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
    activeTab: "chat",

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
        const errorMsg = error.message || "Login failed";
        set({ isLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }
    },

    signup: async (userData) => {
      set({ isLoading: true, error: null });
      try {
        const data = await apiService.signup(userData);

        localStorage.setItem("user", JSON.stringify(data));

        set({ user: data, isLoading: false, error: null });
        return { success: true, data };
      } catch (error) {
        const errorMsg = error.message || "Signup failed";
        set({ isLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }
    },

    socialLogin: async ({ provider, id_token }) => {
      set({ isLoading: true, error: null });
      try {
        const data = await apiService.socialLogin(provider, id_token); // uses fixed service

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
        chatMessages: [],
        activeTab: "chat",
      });
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
        const data = await apiService.updateUserApproval(
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
        const data = await apiService.getUserProfile(accessToken);
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
        const data = await apiService.updateProfile(profileData, accessToken);
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
        const errorMsg = error.message || "Failed to send message";
        set({ isLoadingChat: false, chatError: errorMsg });
        return { success: false, error: errorMsg };
      }
    },

    // --- UI ---
    setActiveTab: (tab) => set({ activeTab: tab }),
    clearError: () => set({ error: null }),
    clearSuccessMessage: () => set({ successMessage: null }),
  }))
);
