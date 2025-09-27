"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, Plus, MessageSquare, Trash2, User, Bot, X } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { Toaster, toast } from "react-hot-toast";
import Header from "@/components/Header";

export default function ChatPage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    sendChatMessage,
    isLoadingChat,
    chatError,
    fetchUserProfile,
  } = useAuthStore();

  const [currentChat, setCurrentChat] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
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

  // Check authentication and initialize
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    } else {
      fetchUserProfile();
      loadChatHistory();
    }
  }, [isAuthenticated, router, fetchUserProfile]);

  // Initialize welcome message if no current chat
  useEffect(() => {
    if (isAuthenticated && currentChat.length === 0) {
      setCurrentChat([
        {
          id: 1,
          text: "Welcome to BREATHE AI! 🌱 I'm here to help you with mindfulness and sustainable living. How can I assist you today?",
          sender: "bot",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [isAuthenticated, currentChat.length]);

  // Show error toasts
  useEffect(() => {
    if (chatError) {
      toast.error(chatError);
    }
  }, [chatError]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat]);

  // Save chat history whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const loadChatHistory = () => {
    try {
      const stored = localStorage.getItem("chatHistory");
      if (stored) {
        const parsedHistory = JSON.parse(stored);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const filteredHistory = parsedHistory.filter(
          (chat) => new Date(chat.timestamp) > sevenDaysAgo
        );

        setChatHistory(filteredHistory);

        if (filteredHistory.length > 0) {
          const mostRecent = filteredHistory.reduce((prev, current) =>
            new Date(current.timestamp) > new Date(prev.timestamp)
              ? current
              : prev
          );
          setActiveChatId(mostRecent.id);
          setCurrentChat(mostRecent.messages);
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Check user approval status
    if (user?.isApproved === "pending") {
      showPermissionMessage(
        "Your account is pending approval. Please wait for admin approval to start chatting."
      );
      return;
    }

    if (user?.isApproved === "declined") {
      showPermissionMessage(
        "Your account has been declined. Please contact the admin for approval to start chatting."
      );
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    const updatedChat = [...currentChat, userMessage];
    setCurrentChat(updatedChat);
    const currentInput = input;
    setInput("");

    try {
      // Send message using your API service
      const response = await sendChatMessage(currentInput);

      if (response.success) {
        const botMessage = {
          id: Date.now() + 1,
          text:
            response.data?.response ||
            "I'm here to help you with mindfulness and sustainable living!",
          sender: "bot",
          timestamp: new Date().toISOString(),
        };

        const finalChat = [...updatedChat, botMessage];
        setCurrentChat(finalChat);

        // Update or create chat in history
        if (activeChatId) {
          setChatHistory((prev) =>
            prev.map((chat) =>
              chat.id === activeChatId
                ? {
                    ...chat,
                    messages: finalChat,
                    lastMessage: currentInput,
                    timestamp: new Date().toISOString(),
                  }
                : chat
            )
          );
        } else {
          const newChatId = Date.now().toString();
          const newChat = {
            id: newChatId,
            title:
              currentInput.substring(0, 30) +
              (currentInput.length > 30 ? "..." : ""),
            messages: finalChat,
            lastMessage: currentInput,
            timestamp: new Date().toISOString(),
          };
          setChatHistory((prev) => [...prev, newChat]);
          setActiveChatId(newChatId);
        }
      } else {
        showErrorMessage(
          response.error ||
            "Sorry, I couldn't process your message. Please try again."
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
      showErrorMessage(
        "Sorry, I couldn't process your message. Please try again."
      );
    }
  };

  const showPermissionMessage = (message) => {
    const permissionMessage = {
      id: Date.now(),
      text: message,
      sender: "system",
      timestamp: new Date().toISOString(),
    };
    setCurrentChat((prev) => [...prev, permissionMessage]);
  };

  const showErrorMessage = (message) => {
    const errorMessage = {
      id: Date.now(),
      text: message,
      sender: "bot",
      timestamp: new Date().toISOString(),
      isError: true,
    };
    setCurrentChat((prev) => [...prev, errorMessage]);
  };

  const startNewChat = () => {
    setCurrentChat([
      {
        id: Date.now(),
        text: "Welcome to BREATHE AI! 🌱 I'm here to help you with mindfulness and sustainable living. How can I assist you today?",
        sender: "bot",
        timestamp: new Date().toISOString(),
      },
    ]);
    setActiveChatId(null);
  };

  const selectChat = (chatId) => {
    const selected = chatHistory.find((chat) => chat.id === chatId);
    if (selected) {
      setCurrentChat(selected.messages);
      setActiveChatId(chatId);
    }
  };

  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId));
    if (activeChatId === chatId) {
      startNewChat();
    }
    toast.success("Chat deleted successfully.");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusColor = (isApproved) => {
    if (isApproved) return "bg-green-100 text-green-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getStatusMessage = (isApproved) => {
    if (!isApproved) return "Account pending approval - Chat access limited";
    return "";
  };

  // Loading state for authentication
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Your existing Header component */}
      <Header />

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
            className="w-10 h-10 fixed top-17 left-4 md:top-20 md:left-10 z-30 px-2.5 py-1 rounded-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg transition-all duration-200 hover:shadow-xl"
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
              onClick={startNewChat}
              className="w-40 cursor-pointer mx-auto flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl text-white font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            <div className="text-xs font-medium text-green-300/70 px-2 py-2 uppercase tracking-wider">
              Recent Conversations
            </div>
            {chatHistory.length > 0 ? (
              <div className="space-y-1">
                {chatHistory
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => selectChat(chat.id)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                        activeChatId === chat.id
                          ? "bg-gradient-to-r from-green-600/30 to-green-700/30 shadow-sm border border-green-500/30"
                          : "hover:bg-green-600/10 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <MessageSquare
                          className={`w-5 h-5 flex-shrink-0 ${
                            activeChatId === chat.id
                              ? "text-green-400"
                              : "text-green-300/60"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-sm font-medium truncate ${
                              activeChatId === chat.id
                                ? "text-white"
                                : "text-gray-200"
                            }`}
                          >
                            {chat.title}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(chat.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => deleteChat(chat.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 transition-all duration-200 flex-shrink-0 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
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
          {user?.isApproved !== undefined && !user.isApproved && (
            <div className="border-t border-green-500/20 p-4 bg-gradient-to-r from-yellow-600/10 to-yellow-500/10">
              <div className="text-xs px-3 py-2 rounded-full text-center bg-yellow-100 text-yellow-800 shadow-sm">
                {getStatusMessage(user.isApproved)}
              </div>
            </div>
          )}
        </div>

        {/* Main chat area */}
        <div className="mx-auto max-w-5xl flex-1 flex flex-col bg-white/90 backdrop-blur-sm">
          {/* Chat header with sidebar toggle */}
          <div className="border-b border-gray-200/50 p-4 bg-white/80 backdrop-blur-md">
            <div className="flex items-center">
              {user?.isApproved !== undefined && !user.isApproved && (
                <div
                  className={`text-xs px-3 py-1 rounded-full ${getStatusColor(
                    user.isApproved
                  )}`}
                >
                  Chat Access Limited
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/50">
            {currentChat.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start space-x-3 w-full md:max-w-[70%] ${
                    message.sender === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 shadow-lg ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-green-600 to-green-700"
                        : message.sender === "system"
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                        : "bg-gradient-to-r from-green-500 to-green-600"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <User className="w-5 h-5" />
                    ) : message.sender === "system" ? (
                      "⚠️"
                    ) : (
                      <Bot className="w-5 h-5" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={`rounded-2xl px-4 py-2 shadow-sm backdrop-blur-sm border ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-green-600 to-green-700 text-white border-green-500/20 shadow-lg"
                        : message.sender === "system"
                        ? "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-200/50"
                        : message.isError
                        ? "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-200/50"
                        : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 border-gray-200/30"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.text}
                    </p>
                    <div className="text-xs opacity-70 mt-1 flex items-center justify-between">
                      <span>
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {message.sender === "bot" && !message.isError && (
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
                <div className="flex items-start space-x-3 w-ful md:max-w-[70%]">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: "#4CAF50" }}
                  >
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
            {!user?.isApproved && (
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
                    user?.isApproved
                      ? "Ask BREATHE AI..."
                      : "Type your message (approval pending)..."
                  }
                  className="w-full text-black px-4 py-2 pr-12 border-1 border-gray-300/70 rounded-3xl outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 resize-none max-h-32 min-h-[46px] bg-white/90 backdrop-blur-sm shadow-sm"
                  rows="1"
                  style={{ lineHeight: "1.5" }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoadingChat}
                  className={`absolute cursor-pointer right-2 bottom-3 p-2 rounded-xl transition-all duration-200 ${
                    input.trim() && !isLoadingChat
                      ? "text-white shadow-sm hover:shadow-md"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  style={
                    input.trim() && !isLoadingChat
                      ? { backgroundColor: "#4CAF50" }
                      : {}
                  }
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

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}
