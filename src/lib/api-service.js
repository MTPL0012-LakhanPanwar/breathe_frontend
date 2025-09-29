// API Service with proper error handling and token management
export const apiService = {
  baseURL: "https://chatbot.breathedxb.com/chat",
  // baseURL: "http://127.0.0.1:8000",
  // Helper method to get auth headers
  getAuthHeaders: (token) => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }),

  // Generic API call handler
  async makeRequest(url, options = {}, token = null) {
    try {
      const headers = { ...options.headers };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      if (
        options.body &&
        typeof options.body === "object" &&
        !(options.body instanceof FormData)
      ) {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(options.body);
      }

      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      return await response.text();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // Auth endpoints
  async login(credentials) {
    const formData = new FormData();
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);

    return this.makeRequest("/auth/login", {
      method: "POST",
      body: formData,
    });
  },

  async signup(userData) {
    return this.makeRequest("/auth/signup", {
      method: "POST",
      body: userData,
    });
  },

  // Social login endpoint
  async socialLogin(provider, id_token) {
    return this.makeRequest("/auth/social-login", {
      method: "POST",
      body: { provider, id_token },
    });
  },

  // Admin endpoints
  async getUsers(token, page = 1, filter = null) {
    let url = `/admin/users?page=${page}`;
    if (filter) {
      url += `&filter=${filter}`;
    }
    return this.makeRequest(url, { method: "GET" }, token);
  },

  async updateUserApproval(userId, isApproved, token) {
    return this.makeRequest(
      `/admin/users/${userId}/approval`,
      {
        method: "POST",
        body: { isApproved },
      },
      token
    );
  },

  // User endpoints
  async getUserProfile(token) {
    return this.makeRequest(`/users/profile`, { method: "GET" }, token);
  },

  async updateProfile(profileData, token) {
    return this.makeRequest(
      `/users/profile`,
      { method: "PUT", body: profileData },
      token
    );
  },

  // Chat endpoint
  async sendMessage(input, token) {
    return this.makeRequest(
      "/chat",
      {
        method: "POST",
        body: { input },
      },
      token
    );
  },

  // Chat history
  async getChatHistory(token) {
    return this.makeRequest("/chat/history", { method: "GET" }, token);
  },
};
