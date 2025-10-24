"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { chatService } from "../lib/chat-service";

export const useChatStore = create(
  devtools(
    persist(
      (set, get) => ({
        // --- Chat State ---
        currentChat: [],
        chatHistory: [],
        activeChatId: null,

        // --- Loading States ---
        isLoadingChat: false,
        isLoadingHistory: false,
        isLoadingRename: false,
        isLoadingDelete: false,

        // --- Error States ---
        chatError: null,
        historyError: null,

        // --- Pagination ---
        skip: 0,
        limit: 50,
        hasMore: true,

        // --------------------------
        // --- Actions ---
        // --------------------------

        /**
         * Initialize with welcome message
         */
        initializeWelcomeMessage: () => {
          const { currentChat, activeChatId } = get();
          // Only show welcome if no active chat and no current messages
          if (currentChat.length === 0 && !activeChatId) {
            set({
              currentChat: [
                {
                  id: Date.now(),
                  role: "assistant",
                  content:
                    "Welcome to BREATHE AI! 🌱 I'm here to help you with mindfulness and sustainable living. How can I assist you today?",
                  timestamp: new Date().toISOString(),
                },
              ],
            });
          }
        },

        /**
         * Load chat history from backend
         */
        fetchChatHistory: async () => {
          set({ isLoadingHistory: true, historyError: null });

          try {
            const { skip, limit } = get();
            const chats = await chatService.getChatList(skip, limit);

            set({
              chatHistory: chats,
              isLoadingHistory: false,
              hasMore: chats.length === limit,
            });

            return { success: true, data: chats };
          } catch (error) {
            const errorMsg = error.message || "Failed to load chat history";
            set({ isLoadingHistory: false, historyError: errorMsg });
            return { success: false, error: errorMsg };
          }
        },

        /**
         * Load more chat history (pagination)
         */
        loadMoreChatHistory: async () => {
          const { skip, limit, chatHistory, hasMore } = get();

          if (!hasMore)
            return { success: false, error: "No more chats to load" };

          set({ isLoadingHistory: true, historyError: null });

          try {
            const newSkip = skip + limit;
            const chats = await chatService.getChatList(newSkip, limit);

            set({
              chatHistory: [...chatHistory, ...chats],
              skip: newSkip,
              isLoadingHistory: false,
              hasMore: chats.length === limit,
            });

            return { success: true, data: chats };
          } catch (error) {
            const errorMsg = error.message || "Failed to load more chats";
            set({ isLoadingHistory: false, historyError: errorMsg });
            return { success: false, error: errorMsg };
          }
        },

        /**
         * Load specific chat by ID
         */
        loadChatById: async (chatId) => {
          set({ isLoadingChat: true, chatError: null });

          try {
            const chat = await chatService.getChatById(chatId);

            // Convert backend format to frontend format
            const messages = chat.messages.map((msg, index) => ({
              id: Date.now() + index,
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp,
            }));

            set({
              currentChat: messages,
              activeChatId: chatId,
              isLoadingChat: false,
            });

            return { success: true, data: chat };
          } catch (error) {
            const errorMsg = error.message || "Failed to load chat";
            set({ isLoadingChat: false, chatError: errorMsg });
            return { success: false, error: errorMsg };
          }
        },

        /**
         * Send a message
         */
        sendMessage: async (userInput) => {
          const { activeChatId, currentChat } = get();

          set({ isLoadingChat: true, chatError: null });

          // Add user message to UI immediately
          const userMessage = {
            id: Date.now(),
            role: "user",
            content: userInput,
            timestamp: new Date().toISOString(),
          };

          const updatedChat = [...currentChat, userMessage];
          set({ currentChat: updatedChat });

          try {
            // Send to backend
            const response = await chatService.sendMessage(
              userInput,
              activeChatId
            );

            // Add bot response
            const botMessage = {
              id: Date.now() + 1,
              role: "assistant",
              content: response.response,
              timestamp: new Date().toISOString(),
            };

            const finalChat = [...updatedChat, botMessage];

            set({
              currentChat: finalChat,
              activeChatId: response.chat_id,
              isLoadingChat: false,
            });

            // Refresh chat history to show updated chat
            get().fetchChatHistory();

            return { success: true, data: response };
          } catch (error) {
            const errorMsg = error.message || "Failed to send message";

            // Add error message to chat
            const errorMessage = {
              id: Date.now() + 1,
              role: "assistant",
              content: errorMsg,
              timestamp: new Date().toISOString(),
              isError: true,
            };

            set({
              currentChat: [...updatedChat, errorMessage],
              isLoadingChat: false,
              chatError: errorMsg,
            });

            return { success: false, error: errorMsg };
          }
        },

        /**
         * Start a new chat
         */
        startNewChat: () => {
          set({
            currentChat: [
              {
                id: Date.now(),
                role: "assistant",
                content:
                  "Welcome to BREATHE AI! 🌱 I'm here to help you with mindfulness and sustainable living. How can I assist you today?",
                timestamp: new Date().toISOString(),
              },
            ],
            activeChatId: null,
            chatError: null,
          });
        },

        /**
         * Select a chat from history
         */
        selectChat: async (chatId) => {
          return get().loadChatById(chatId);
        },

        /**
         * Rename a chat
         */
        renameChat: async (chatId, newTitle) => {
          set({ isLoadingRename: true, chatError: null });

          try {
            await chatService.renameChat(chatId, newTitle);

            // Update local chat history
            const { chatHistory } = get();
            const updatedHistory = chatHistory.map((chat) =>
              chat._id === chatId ? { ...chat, title: newTitle } : chat
            );

            set({
              chatHistory: updatedHistory,
              isLoadingRename: false,
            });

            return { success: true };
          } catch (error) {
            const errorMsg = error.message || "Failed to rename chat";
            set({ isLoadingRename: false, chatError: errorMsg });
            return { success: false, error: errorMsg };
          }
        },

        /**
         * Delete a chat
         */
        deleteChat: async (chatId, permanent = false) => {
          set({ isLoadingDelete: true, chatError: null });

          try {
            await chatService.deleteChat(chatId, permanent);

            // Remove from local history
            const { chatHistory, activeChatId } = get();
            const updatedHistory = chatHistory.filter(
              (chat) => chat._id !== chatId
            );

            set({
              chatHistory: updatedHistory,
              isLoadingDelete: false,
            });

            // If deleted chat was active, start new chat
            if (activeChatId === chatId) {
              get().startNewChat();
            }

            return { success: true };
          } catch (error) {
            const errorMsg = error.message || "Failed to delete chat";
            set({ isLoadingDelete: false, chatError: errorMsg });
            return { success: false, error: errorMsg };
          }
        },

        /**
         * Clear errors
         */
        clearChatError: () => set({ chatError: null }),
        clearHistoryError: () => set({ historyError: null }),
      }),
      {
        name: "chat-storage", // unique name for localStorage key
        partialPersist: (state) => ({
          activeChatId: state.activeChatId, // Only persist activeChatId
        }),
      }
    )
  )
);
