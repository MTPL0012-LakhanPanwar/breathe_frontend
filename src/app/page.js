"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Initial welcome message
  useEffect(() => {
    addMessage(
      `Welcome to BREATHE AI!💡\nI'm here to help you heal yourself while healing the Earth. ✨\nWhat would you like to explore today - mindfulness, sustainable living, or both?`,
      "bot"
    );
  }, []);

  const addMessage = (content, sender) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender, content, time: formatTime(new Date()) },
    ]);
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    addMessage(input, "user");
    setInput("");

    // Loading placeholder
    const loadingId = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        sender: "bot",
        content: "loading",
        time: formatTime(new Date()),
      },
    ]);

    try {
      const res = await fetch("https://chatbot.breathedxb.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();

      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== loadingId)
          .concat({
            id: Date.now(),
            sender: "bot",
            content: data.response,
            time: formatTime(new Date()),
          })
      );
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== loadingId)
          .concat({
            id: Date.now(),
            sender: "bot",
            content: "Please try again.",
            time: formatTime(new Date()),
          })
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-600 to-green-400 text-white shadow">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="logo"
            width={60}
            height={60}
            className="rounded-full"
          />
          <span className="text-lg font-medium">BREATHE AI</span>
        </div>
      </div>

      {/* Messages */}
      <div className="mx-auto w-full md:w-4xl flex-1 overflow-y-auto p-4 space-y-3 px-4 py-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`px-3 py-2 rounded-2xl text-sm max-w-[80%] shadow ${
                msg.sender === "user"
                  ? "bg-green-600 text-white rounded-br-sm"
                  : msg.content === "loading"
                  ? "bg-transparent"
                  : "bg-green-50 text-gray-800 rounded-bl-sm"
              }`}
            >
              {msg.content === "loading" ? (
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-150" />
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-300" />
                </div>
              ) : (
                msg.content
              )}
            </div>
            <span className="text-[10px] text-gray-500 mt-1">{msg.time}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mx-auto w-full md:w-4xl flex items-center p-3 border-t border-gray-200 gap-2 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          type="text"
          placeholder="Send a message..."
          className="flex-1 border rounded-full px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={sendMessage}
          className="bg-green-600 hover:bg-green-700 rounded-full w-10 h-10 flex items-center justify-center transition"
        >
          <Image
            src="/chatSend.svg"
            alt="send"
            width={20}
            height={20}
            className="rounded-full"
          />
        </button>
      </div>
    </div>
  );
}
