import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEmployees } from "../hooks/useEmployees";
import { usePayments } from "../hooks/usePayments";
import { generateAIResponse, type AIContext } from "../services/aiService";
import { useChat } from "../hooks/useChat"; // Import useChat hook

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantPageProps {
  companyName?: string;
  sessionId?: string | null; // New prop for session ID
  onSessionCreated?: (sessionId: string) => void; // Callback for new session
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({
  companyName = "My Company",
  sessionId: initialSessionId,
  onSessionCreated,
}) => {
  const { employees } = useEmployees();
  const { getAllPayments } = usePayments();
  const { createChatSession, getChatMessages, addChatMessage } = useChat(); // Use chat hook

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingMessage, setLoadingMessage] = useState("Thinking...");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(
    initialSessionId || null
  );
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load existing chat messages if a session ID is provided
  useEffect(() => {
    const loadMessages = async () => {
      if (initialSessionId) {
        setIsLoading(true);
        setLoadingMessage("Loading conversation...");
        try {
          const dbMessages = await getChatMessages(initialSessionId);
          const loadedMessages: Message[] = dbMessages.map((msg) => ({
            id: msg.id,
            type: msg.type,
            content: msg.content,
            timestamp: new Date(msg.created_at),
          }));
          setMessages(loadedMessages);
          setCurrentSessionId(initialSessionId);
        } catch (error) {
          console.error("Failed to load chat messages:", error);
          setMessages([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        // If no session ID, start with the initial assistant message
        setMessages([
          {
            id: "initial-ai-message",
            type: "assistant",
            content: `Hello! I'm your smart AI assistant for ${companyName}. I'm powered by Google Gemini AI and have deep knowledge about your company data, payroll operations, and Monad blockchain technology. I can analyze your employee data, provide payment insights, explain blockchain concepts, and have natural conversations. What would you like to know?`,
            timestamp: new Date(),
          },
        ]);
      }
    };

    loadMessages();
  }, [initialSessionId, companyName, getChatMessages]);

  // Fetch payments data
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const allPayments = await getAllPayments();
        setPayments(allPayments);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
        setPayments([]);
      }
    };

    fetchPayments();
  }, [getAllPayments]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessageContent = inputValue.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: userMessageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setLoadingMessage("Analyzing your question...");

    let sessionToUse = currentSessionId;

    // Create a new session if one doesn't exist
    if (!sessionToUse) {
      try {
        const newSession = await createChatSession(
          "New Chat",
          userMessageContent
        );
        if (newSession) {
          sessionToUse = newSession.id;
          setCurrentSessionId(newSession.id);
          onSessionCreated?.(newSession.id); // Notify parent about new session
        } else {
          // Even if session creation fails, we can still process the AI response
          console.warn(
            "Session creation failed, but continuing with AI response"
          );
        }
      } catch (error) {
        console.error("Error creating chat session:", error);
        // Don't return here - continue with AI processing
      }
    }

    // Save user message to DB if session exists
    if (sessionToUse) {
      try {
        await addChatMessage(sessionToUse, "user", userMessageContent);
      } catch (error) {
        console.error("Error saving user message:", error);
        // Continue anyway
      }
    }

    try {
      const context: AIContext = {
        employees,
        payments,
        companyName,
      };

      console.log("Sending to AI:", userMessageContent);
      console.log("AI Context:", context);

      setLoadingMessage("Processing with AI...");
      const response = await generateAIResponse(userMessageContent, context);

      console.log("AI Response received:", response);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message to DB if session exists
      if (sessionToUse) {
        try {
          await addChatMessage(sessionToUse, "assistant", response);
        } catch (error) {
          console.error("Error saving assistant message:", error);
          // Continue anyway - user still sees the message
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "I apologize, but I encountered an error processing your request. Please try again. Error details have been logged to the console.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setLoadingMessage("Thinking...");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Mobile gets fewer suggestions to save space
  const allQuestions = [
    "What is the current price of MON",
    "When is the Monad mainnet launch?",
    "How can I participate in the Monad airdrop?",
    "How many employees do we have?",
    "Who is our highest paid employee?",
    "When was the last payment made?",
    "Company overview please",
    "Employee salary breakdown",
    "What makes Monad blockchain unique?",
    "How do I get testnet MON tokens?",
  ];

  const quickQuestions = isMobile ? allQuestions.slice(0, 3) : allQuestions;

  return (
    <div className="h-full flex flex-col">
      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto bg-white p-3 sm:p-6 space-y-3 sm:space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start space-x-2 sm:space-x-3 max-w-full sm:max-w-3xl ${
                  message.type === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === "user" ? "bg-gray-900" : "bg-black"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  ) : (
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  )}
                </div>

                <div
                  className={`rounded-lg px-3 py-2 sm:px-4 sm:py-3 ${
                    message.type === "user"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                    {message.content}
                  </div>
                  <div
                    className={`text-xs mt-1 sm:mt-2 ${
                      message.type === "user"
                        ? "text-gray-300"
                        : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-2 sm:space-x-3 max-w-full sm:max-w-3xl">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black flex items-center justify-center">
                <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-lg px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-gray-600" />
                  <span className="text-gray-600 text-sm sm:text-base">
                    {loadingMessage}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Quick Questions - Responsive */}
      {messages.length <= 1 && (
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-3 py-3 sm:px-6 sm:py-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 flex items-center space-x-2">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Try asking:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputValue(question)}
                className="text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg transition-colors leading-tight"
              >
                {question}
              </button>
            ))}
          </div>
          {isMobile && allQuestions.length > quickQuestions.length && (
            <div className="text-xs text-gray-500 mt-2">
              {allQuestions.length - quickQuestions.length} more suggestions
              available on desktop
            </div>
          )}
        </div>
      )}

      {/* Fixed Input Area - Responsive */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isMobile
                ? "Ask me anything..."
                : "Ask me anything about your company, employees, payments, or Monad blockchain..."
            }
            className="flex-1 bg-gray-100 border border-gray-300 text-gray-900 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 sm:p-3 rounded-lg transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>

        <div className="text-xs text-gray-500 mt-1 sm:mt-2 leading-tight">
          {isMobile
            ? "Press Enter to send"
            : "Press Enter to send • Shift+Enter for new line"}
        </div>
      </div>
    </div>
  );
};
