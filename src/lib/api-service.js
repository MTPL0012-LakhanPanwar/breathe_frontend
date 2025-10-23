/**
 * Base API Service
 * Handles all HTTP requests with centralized error handling and auth support.
 */

const APIsURL = process.env.NEXT_PUBLIC_API_URL;

export const apiService = {
  baseURL: APIsURL,

  /**
   * Generate headers for authenticated requests
   * @param {string} token - JWT token
   * @returns {Object} Headers object
   */
  getAuthHeaders(token) {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  },

  /**
   * Make a generic API request
   * @param {string} url - Endpoint path (without base URL)
   * @param {Object} options - Fetch options
   * @param {string|null} token - Optional token
   * @returns {Promise<any>} Response data
   */
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
        let message = `HTTP ${response.status}`;
        try {
          const err = await response.json();
          message = err.detail || err.message || message;
        } catch {
          message = response.statusText || message;
        }
        throw new Error(message);
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

  /**
   * Make authenticated requests automatically using stored token
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {Object} [options={}] - Fetch options
   * @returns {Promise<any>} Response data
   */
  async fetchWithAuth(endpoint, options = {}) {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
          const err = await response.json();
          message = err.detail || err.message || message;
        } catch {
          message = response.statusText || message;
        }
        throw new Error(message);
      }

      return await response.json();
    } catch (error) {
      console.error("Authenticated API Error:", error);
      throw error;
    }
  },
};
