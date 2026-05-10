import React, { useState, useRef, useEffect } from "react";
import { MessageType } from "../types";
import { chatWithAI } from "../endpoints/chatbot";

const sessionToken = sessionStorage.getItem("token");
const localToken = localStorage.getItem("token");

const token: string = sessionToken
  ? sessionToken
  : localToken
  ? localToken
  : "";

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: "1",
      text: token
        ? "Hello! How can I help you with skin lesion questions today?"
        : "Welcome! Please sign in to start a conversation and get personalized assistance with skin lesion questions.",
      sender_type: "ai",
      timestamp: new Date().toISOString(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  // Format timestamp for display
  const formatTimestamp = (timestamp: string | number | Date): string => {
    const date =
      typeof timestamp === "string"
        ? new Date(timestamp)
        : timestamp instanceof Date
        ? timestamp
        : new Date(timestamp);

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || isTyping) return;

    // Check if user is authenticated
    if (!token) {
      // Add system message asking user to log in
      const loginPromptMessage: MessageType = {
        id: Date.now().toString(),
        text: "Please sign in to continue the conversation. Your messages will be saved to your account.",
        sender_type: "ai",
        timestamp: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, loginPromptMessage]);
      setMessage("");
      return;
    }

    // Add user message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      text: message,
      sender_type: "user",
      timestamp: new Date().toISOString(), // Store as ISO string for consistency
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setMessage("");
    setIsTyping(true);

    try {
      const result = await chatWithAI({ message }, token);
      const botMessage: MessageType = {
        id: Date.now().toString(),
        text: result.ai_response.text,
        sender_type: "ai",
        timestamp: result.ai_response.timestamp, // API returns timestamp
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message
      const errorMessage: MessageType = {
        id: Date.now().toString(),
        text: "Sorry, I couldn't process your message. Please try again.",
        sender_type: "ai",
        timestamp: new Date().toISOString(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Auto-scroll to bottom when new messages are added or typing status changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleChat}
        className="bg-secondary text-foreground rounded-full w-14 h-14 flex items-center justify-center shadow-secondary hover:bg-primary transition-all"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      <div
        className={`bg-foreground rounded-lg shadow-secondary overflow-hidden flex flex-col 
        transition-all duration-300 ease-in-out
        ${isOpen ? "max-h-96 w-80 opacity-100 mb-2" : "max-h-0 w-0 opacity-0"}`}
      >
        <div className="bg-secondary text-foreground p-4">
          <h3 className="font-bold">Skin Lesion Assistant</h3>
        </div>

        <div className="flex-grow overflow-y-auto p-4 max-h-64 bg-background">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 ${
                msg.sender_type === "user" ? "text-right" : ""
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg max-w-[80%]
                  ${
                    msg.sender_type === "user"
                      ? "bg-secondary text-foreground rounded-br-none"
                      : "bg-foreground text-primary rounded-bl-none border border-secondary"
                  }`}
              >
                {msg.text}
              </div>
              <div className="text-xs text-[var(--muted-text-color)] mt-1">
                {formatTimestamp(msg.timestamp)}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start mb-4">
              <div className="bg-foreground p-3 rounded-lg rounded-bl-none border border-secondary inline-block">
                <div className="flex items-center space-x-1">
                  <div
                    className="w-2 h-2 bg-secondary rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-secondary rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-secondary rounded-full animate-bounce"
                    style={{ animationDelay: "600ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSendMessage}
          className="border-t border-secondary p-3 flex bg-foreground flex-col"
        >
          {!token && (
            <div className="w-full text-center mb-2">
              <a
                href="/signin"
                className="text-secondary hover:underline text-sm font-medium"
              >
                Sign in to use the chatbot
              </a>
            </div>
          )}

          <div className="flex w-full">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                token ? "Type a message..." : "Sign in to send messages"
              }
              disabled={isTyping || !token}
              className={`flex-grow border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary bg-background text-primary ${
                isTyping || !token ? "opacity-50" : ""
              }`}
            />
            <button
              type="submit"
              disabled={isTyping || !message.trim() || !token}
              className={`px-4 py-2 rounded-r-lg border-secondary flex items-center justify-center ${
                isTyping || !message.trim() || !token
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-secondary text-foreground hover:bg-primary hover:text-foreground"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;
