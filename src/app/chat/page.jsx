"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import Header from "@/components/Header";
import Button from "@/components/Button";
import { Send, Trash2, MessageSquare } from "lucide-react";
import Toast from "@/components/Toast";

export default function ChatPage() {
  const router = useRouter();
  const { user, isAuthenticated, sendChatMessage } = useAuthStore();
  const [input, setInput] = useState("");
  const [currentChat, setCurrentChat] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const messagesEndRef = useRef(null);

  // Load chat history from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedHistory = localStorage.getItem("chatHistory");
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        // Filter out chats older than 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const filteredHistory = parsedHistory.filter((chat) => {
          return new Date(chat.timestamp) > sevenDaysAgo;
        });

        setChatHistory(filteredHistory);

        // Set active chat to the most recent one if it exists
        if (filteredHistory.length > 0) {
          const mostRecent = filteredHistory.reduce((prev, current) => {
            return new Date(current.timestamp) > new Date(prev.timestamp)
              ? current
              : prev;
          });
          setActiveChatId(mostRecent.id);
          setCurrentChat(mostRecent.messages);
        }
      }
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat]);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    if (!user.isApproved) {
      setToastMessage(
        "Your account is pending approval. You cannot chat at this time."
      );
      setToastType("error");
      setShowToast(true);
      return;
    }

    // Add user message to current chat
    const userMessage = {
      text: input,
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    const updatedChat = [...currentChat, userMessage];
    setCurrentChat(updatedChat);
    setInput("");

    try {
      // Send message to API
      const response = await sendChatMessage(input);

      // Add bot response to current chat
      const botMessage = {
        text:
          response.message ||
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
                  lastMessage: input,
                  timestamp: new Date().toISOString(),
                }
              : chat
          )
        );
      } else {
        const newChatId = Date.now().toString();
        const newChat = {
          id: newChatId,
          title: input.substring(0, 30) + (input.length > 30 ? "..." : ""),
          messages: finalChat,
          lastMessage: input,
          timestamp: new Date().toISOString(),
        };
        setChatHistory((prev) => [...prev, newChat]);
        setActiveChatId(newChatId);
      }
    } catch (error) {
      // Add error message to chat
      setCurrentChat((prev) => [
        ...prev,
        {
          text: "Sorry, I couldn't process your message. Please try again.",
          sender: "bot",
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = () => {
    setCurrentChat([
      {
        text: "Welcome to BREATHE AI! I'm here to help you with mindfulness and sustainable living. How can I assist you today?",
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
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Chat history sidebar */}
        <div className="hidden md:flex md:flex-col md:w-64 bg-gray-800/90 backdrop-blur-lg text-white glass-morphism rounded-r-lg">
          <div className="p-4 border-b border-gray-700/50">
            <Button
              onClick={startNewChat}
              variant="outline"
              fullWidth
              className="bg-gray-700/80 hover:text-white border-gray-600 hover:bg-gray-600"
              icon={MessageSquare}
            >
              New Chat
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Recent Conversations
            </div>
            {chatHistory.length > 0 ? (
              chatHistory
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => selectChat(chat.id)}
                    className={`
                      flex items-center justify-between p-3 cursor-pointer rounded-md mx-2 my-1 transition-all duration-200
                      ${
                        activeChatId === chat.id
                          ? "bg-gray-700/90 shadow-sm"
                          : "hover:bg-gray-700/60"
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      <div className="flex flex-col">
                        <span className="truncate text-sm font-medium">
                          {chat.title}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(chat.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="text-gray-400 hover:text-red-400 p-1 rounded-full hover:bg-gray-600/50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
            ) : (
              <div className="p-4 text-gray-400 text-sm text-center">
                No chat history yet
              </div>
            )}
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col bg-white/90 backdrop-blur-sm">
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {currentChat.length > 0 ? (
              currentChat.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    message.sender === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }`}
                >
                  <div
                    className={`
                      max-w-[80%] p-3 rounded-lg shadow-sm
                      ${
                        message.sender === "user"
                          ? "bg-green-600/90 text-white glass-morphism border border-green-500/20"
                          : message.isError
                          ? "bg-red-50/90 text-red-800 border border-red-200 glass-morphism"
                          : "bg-gray-100/80 text-gray-800 glass-morphism border border-gray-200/30"
                      }
                    `}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    <div className="text-xs opacity-70 mt-1 flex justify-between items-center">
                      <span>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                      {message.sender === "bot" && !message.isError && (
                        <span className="text-xs bg-green-100/50 text-green-800 px-1 rounded">
                          BREATHE AI
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500 p-6 rounded-lg glass-morphism bg-white/30 border border-gray-200/30">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-green-500/70" />
                  <p className="font-medium">Start a new conversation</p>
                  <p className="text-sm mt-2">
                    Ask BREATHE AI about mindfulness and sustainable living
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-gray-200/50 p-4 bg-white/60 backdrop-blur-md glass-morphism">
            {!user.isApproved && (
              <div className="mb-4 p-3 bg-yellow-50/90 border border-yellow-200 rounded-lg glass-morphism">
                <p className="text-sm text-yellow-800">
                  Your account is pending approval. Once approved, you'll be
                  able to chat with BREATHE AI.
                </p>
              </div>
            )}
            <div className="flex space-x-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  user.isApproved
                    ? "Type your message..."
                    : "Type your message (approval pending)..."
                }
                className="flex-1 border border-gray-300/70 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none bg-white/80 backdrop-blur-sm"
                rows="2"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || !user.isApproved}
                icon={Send}
                className="self-end"
                variant="primary"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
