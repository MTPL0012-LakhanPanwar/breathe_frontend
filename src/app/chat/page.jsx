"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Plus,
  MessageSquare,
  Trash2,
  Bot,
  X,
  Edit2,
  Check,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useChatStore } from "@/store/chat-store";
import { Toaster, toast } from "react-hot-toast";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function ChatPage() {
  const { user, fetchUserProfile } = useAuthStore();
  const {
    currentChat,
    chatHistory,
    activeChatId,
    isLoadingChat,
    isLoadingHistory,
    chatError,
    initializeWelcomeMessage,
    fetchChatHistory,
    sendMessage,
    startNewChat,
    selectChat,
    renameChat,
    deleteChat,
    clearChatError,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const messagesEndRef = useRef(null);

  // Handle responsive sidebar - close on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        // lg breakpoint
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize data
  useEffect(() => {
    fetchUserProfile();
    fetchChatHistory();
    initializeWelcomeMessage();
  }, []);

  // Show error toasts
  useEffect(() => {
    if (chatError) {
      toast.error(chatError);
      clearChatError();
    }
  }, [chatError, clearChatError]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat]);

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Check user approval status
    if (user?.isApproved === "pending") {
      toast.error(
        "Your account is pending approval. Please wait for admin approval."
      );
      return;
    }

    if (user?.isApproved === "declined") {
      toast.error("Your account has been declined. Please contact the admin.");
      return;
    }

    const currentInput = input;
    setInput("");

    const result = await sendMessage(currentInput);

    if (!result.success) {
      toast.error(result.error);
    }
  };

  const handleSelectChat = async (chatId) => {
    const result = await selectChat(chatId);

    if (!result.success) {
      toast.error(result.error);
    }

    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleStartNewChat = () => {
    startNewChat();

    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleStartEdit = (chat, e) => {
    e.stopPropagation();
    setEditingChatId(chat._id);
    setEditingTitle(chat.title);
  };

  const handleSaveEdit = async (chatId, e) => {
    e.stopPropagation();

    if (!editingTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    const result = await renameChat(chatId, editingTitle.trim());

    if (result.success) {
      toast.success("Chat renamed successfully");
      setEditingChatId(null);
      setEditingTitle("");
    } else {
      toast.error(result.error);
    }
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingChatId(null);
    setEditingTitle("");
  };

  const openDeleteModal = (chat, e) => {
    e.stopPropagation();
    setChatToDelete(chat);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!chatToDelete) return;

    setIsDeletingChat(true);
    const result = await deleteChat(chatToDelete._id, false);
    setIsDeletingChat(false);

    if (result.success) {
      toast.success("Chat deleted successfully");
      setShowDeleteModal(false);
      setChatToDelete(null);
    } else {
      toast.error(result.error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <ProtectedRoute>
      <div className="h-screen bg-gray-50 flex flex-col">
        <Header />

        {/* Delete Chat Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setChatToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Chat"
          message={`Are you sure you want to delete "${chatToDelete?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={isDeletingChat}
        />

        <div className="flex flex-1 overflow-hidden relative">
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Floating sidebar toggle button (when sidebar is closed) */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 cursor-pointer fixed top-17 left-4 md:top-20 md:left-10 z-30 px-2.5 py-1 rounded-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg transition-all duration-200 hover:shadow-xl"
              title="Open chat history"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          )}

          {/* Chat history sidebar */}
          <div
            className={`
              ${sidebarOpen ? "w-72 lg:w-80" : "w-0 lg:w-0"}
              transition-all duration-300 ease-in-out
              bg-gradient-to-b from-gray-800 to-gray-900 text-white
              flex flex-col overflow-hidden shadow-xl
              fixed top-0 left-0 h-full z-50
              lg:relative
            `}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-green-500/20 bg-gradient-to-r from-green-600/10 to-green-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-lg text-green-400">
                    Chat History
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 cursor-pointer rounded-lg hover:bg-green-600/20 transition-colors text-green-300 hover:text-white"
                  title="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleStartNewChat}
                className="w-40 cursor-pointer mx-auto flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl text-white font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>New Chat</span>
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto scroll-smooth px-3 py-2">
              <div className="text-xs font-medium text-green-300/70 px-2 py-2 uppercase tracking-wider">
                Recent Conversations
              </div>

              {isLoadingHistory && chatHistory.length === 0 ? (
                <div className="p-4 text-green-300/60 text-sm text-center">
                  Loading chats...
                </div>
              ) : chatHistory?.length > 0 ? (
                <div className="space-y-1">
                  {chatHistory?.map((chat) => (
                    <div
                      key={chat._id}
                      onClick={() => handleSelectChat(chat._id)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                        activeChatId === chat._id
                          ? "bg-gradient-to-r from-green-600/30 to-green-700/30 shadow-sm border border-green-500/30"
                          : "hover:bg-green-600/10 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <MessageSquare
                          className={`w-5 h-5 flex-shrink-0 ${
                            activeChatId === chat._id
                              ? "text-green-400"
                              : "text-green-300/60"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          {editingChatId === chat._id ? (
                            <div
                              className="flex items-center space-x-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) =>
                                  setEditingTitle(e.target.value)
                                }
                                className="flex-1 px-2 py-1 text-sm bg-gray-700 text-white rounded border border-green-500/30 focus:outline-none focus:border-green-500"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    handleSaveEdit(chat._id, e);
                                  if (e.key === "Escape") handleCancelEdit(e);
                                }}
                              />
                              <button
                                onClick={(e) => handleSaveEdit(chat._id, e)}
                                className="p-1 rounded hover:bg-green-500/20 text-green-400"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1 rounded hover:bg-red-500/20 text-red-400"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div
                                className={`text-sm font-medium truncate ${
                                  activeChatId === chat._id
                                    ? "text-white"
                                    : "text-gray-200"
                                }`}
                              >
                                {chat.title}
                              </div>
                              <div className="text-xs text-gray-400 mt-1 flex items-center justify-between">
                                <span>
                                  {new Date(
                                    chat.updated_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {editingChatId !== chat._id && (
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleStartEdit(chat, e)}
                            className="p-1 cursor-pointer rounded hover:bg-blue-500/20 transition-all duration-200 text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => openDeleteModal(chat, e)}
                            className="p-1 cursor-pointer rounded hover:bg-red-500/20 transition-all duration-200 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-green-300/60 text-sm text-center">
                  No conversations yet. Start your first chat!
                </div>
              )}
            </div>

            {/* Status indicator at bottom of sidebar */}
            {user?.isApproved !== "approved" && (
              <div className="border-t border-green-500/20 p-4 bg-gradient-to-r from-yellow-600/10 to-yellow-500/10">
                <div className="text-xs px-3 py-2 rounded-full text-center bg-yellow-100 text-yellow-800 shadow-sm">
                  Account pending approval - Chat access limited
                </div>
              </div>
            )}
          </div>

          {/* Main chat area */}
          <div className="mx-auto max-w-5xl flex-1 flex flex-col bg-white/90 backdrop-blur-sm">
            {/* Chat header with sidebar toggle */}
            {user?.isApproved !== "approved" && (
              <div className="border-b border-gray-200/50 p-4 bg-white/80 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                    Chat Access Limited
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scroll-smooth p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/50">
              {currentChat.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-start space-x-3 w-full md:max-w-[70%] ${
                      message.role === "user"
                        ? "flex-row-reverse space-x-reverse"
                        : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 shadow-lg ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-green-600 to-green-700"
                          : "bg-gradient-to-r from-green-500 to-green-600"
                      }`}
                    >
                      {message.role === "user" ? (
                        <span>{getInitials(user?.username)}</span>
                      ) : (
                        <Bot className="w-5 h-5" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div
                      className={`rounded-2xl px-4 py-2 shadow-sm backdrop-blur-sm border ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-green-600 to-green-700 text-white border-green-500/20 shadow-lg"
                          : message.isError
                          ? "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-200/50"
                          : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 border-gray-200/30"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </p>
                      <div className="text-xs opacity-70 mt-1 flex items-center justify-between">
                        <span>
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                        {message.role === "assistant" && !message.isError && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full shadow-sm">
                            BREATHE AI
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoadingChat && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3 w-full md:max-w-[70%]">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm bg-gradient-to-r from-green-500 to-green-600">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="bg-gray-100/80 backdrop-blur-sm rounded-2xl px-4 py-2 border border-gray-200/30">
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-gray-200/50 p-4 bg-white/80 backdrop-blur-md">
              {user?.isApproved !== "approved" && (
                <div className="mb-4 p-3 bg-yellow-50/90 border border-yellow-200/50 rounded-lg backdrop-blur-sm">
                  <p className="text-sm text-yellow-800">
                    Your account is pending approval. Once approved, you'll be
                    able to chat with BREATHE AI.
                  </p>
                </div>
              )}
              <div className="flex items-end space-x-3">
                <div className="relative w-full sm:max-w-xl lg:max-w-2xl mx-auto">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      user?.isApproved === "approved"
                        ? "Ask BREATHE AI..."
                        : "Type your message (approval pending)..."
                    }
                    disabled={user?.isApproved !== "approved"}
                    className="w-full text-black px-4 py-2 pr-12 border-1 border-gray-300/70 rounded-3xl outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 resize-none max-h-32 min-h-[46px] bg-white/90 backdrop-blur-sm shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    rows="1"
                    style={{ lineHeight: "1.5" }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={
                      !input.trim() ||
                      isLoadingChat ||
                      user?.isApproved !== "approved"
                    }
                    className={`absolute cursor-pointer right-2 bottom-3 p-2 rounded-xl transition-all duration-200 ${
                      input.trim() &&
                      !isLoadingChat &&
                      user?.isApproved === "approved"
                        ? "bg-green-600 text-white shadow-sm hover:shadow-md hover:bg-green-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500 text-center mt-2">
                BREATHE AI can make mistakes. Consider checking important
                information.
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </ProtectedRoute>
  );
}
