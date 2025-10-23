import { apiService } from "./api-service";

/**
 * Chat Service
 * Handles chat creation, messaging, and history management
 */
export const chatService = {
  /**
   * Send a chat message
   * @param {string} userInput - User's message
   * @param {string|null} chatId - Optional existing chat ID
   * @returns {Promise<{chat_id: string, response: string, title: string}>}
   */
  async sendMessage(userInput, chatId = null) {
    const endpoint = chatId ? `/chat?chat_id=${chatId}` : "/chat";
    return apiService.fetchWithAuth(endpoint, {
      method: "POST",
      body: JSON.stringify({ user_input: userInput }),
    });
  },

  /**
   * Get list of chat histories
   * @param {number} skip - Number of chats to skip (for pagination)
   * @param {number} limit - Maximum number of chats to return
   */
  async getChatList(skip = 0, limit = 50) {
    return apiService.fetchWithAuth(`/chats?skip=${skip}&limit=${limit}`);
  },

  /**
   * Get complete chat by ID
   * @param {string} chatId - Chat ID
   */
  async getChatById(chatId) {
    return apiService.fetchWithAuth(`/chats/${chatId}`);
  },

  /**
   * Rename a chat
   * @param {string} chatId - Chat ID
   * @param {string} newTitle - New chat title
   */
  async renameChat(chatId, newTitle) {
    return apiService.fetchWithAuth(`/chats/${chatId}`, {
      method: "PATCH",
      body: JSON.stringify({ title: newTitle }),
    });
  },

  /**
   * Delete a chat
   * @param {string} chatId - Chat ID
   * @param {boolean} permanent - If true, permanently delete
   */
  async deleteChat(chatId, permanent = false) {
    const endpoint = permanent
      ? `/chats/${chatId}?permanent=true`
      : `/chats/${chatId}`;
    return apiService.fetchWithAuth(endpoint, { method: "DELETE" });
  },
};
