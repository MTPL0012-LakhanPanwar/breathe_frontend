import { apiService } from "./api-service";

/**
 * Authentication & User Management Service
 * Handles all auth and user-related API operations
 */
export const authService = {
  /**
   * Login user with username & password
   * @param {{username: string, password: string}} credentials
   */
  async login(credentials) {
    const formData = new FormData();
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);

    return apiService.makeRequest("/auth/login", {
      method: "POST",
      body: formData,
    });
  },

  /**
   * User signup
   * @param {Object} userData - Registration payload
   */
  async signup(userData) {
    return apiService.makeRequest("/auth/signup", {
      method: "POST",
      body: userData,
    });
  },

  /**
   * Social login (Google, Facebook, etc.)
   * @param {Object} payload - Social login payload
   */
  async socialLogin(payload) {
    return apiService.makeRequest("/auth/social-login", {
      method: "POST",
      body: payload,
    });
  },

  /**
   * Get logged-in user's profile
   * @param {string} token
   */
  async getUserProfile(token) {
    return apiService.makeRequest("/users/profile", { method: "GET" }, token);
  },

  /**
   * Update user profile
   * @param {Object} profileData
   * @param {string} token
   */
  async updateProfile(profileData, token) {
    return apiService.makeRequest(
      "/users/profile",
      { method: "PUT", body: profileData },
      token
    );
  },

  /**
   * Change password
   * @param {Object} data - Old and new password
   * @param {string} token
   */
  async changePassword(data, token) {
    return apiService.makeRequest(
      "/auth/change-password",
      { method: "POST", body: data },
      token
    );
  },

  /**
   * Delete logged-in user's account
   * @param {string} token
   */
  async deleteAccount(token) {
    return apiService.makeRequest(
      "/auth/delete-account",
      { method: "DELETE" },
      token
    );
  },

  // Admin Endpoints

  /**
   * Get list of users (Admin only)
   * @param {string} token - Admin JWT token
   * @param {number} page - Page number
   * @param {string|null} filter - Optional search filter
   */
  async getUsers(token, page = 1, filter = null) {
    let url = `/admin/users?page=${page}`;
    if (filter) url += `&filter=${filter}`;
    return apiService.makeRequest(url, { method: "GET" }, token);
  },

  /**
   * Update user approval status (Admin only)
   * @param {string} userId
   * @param {boolean} isApproved
   * @param {string} token
   */
  async updateUserApproval(userId, isApproved, token) {
    return apiService.makeRequest(
      `/admin/users/${userId}/approval`,
      { method: "POST", body: { isApproved } },
      token
    );
  },
};
