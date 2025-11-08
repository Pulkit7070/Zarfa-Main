import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { generateAIResponse } from "../services/aiService";
import { getConnectedAccount, isWalletConnected } from "../utils/aptos";
import type { ChatSession, ChatMessage } from "../lib/supabase";

// Helper function to generate a UUID
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const useChat = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check wallet connection on hook initialization
  useEffect(() => {
    const checkWalletConnection = () => {
      console.log("🔍 Checking wallet connection...");
      if (isWalletConnected()) {
        const account = getConnectedAccount();
        console.log("✅ Wallet connected:", account);
        setWalletAddress(account);
      } else {
        console.log("❌ Wallet not connected");
        setWalletAddress(null);
      }
    };

    checkWalletConnection();

    // Set up interval to check wallet connection every 2 seconds
    const interval = setInterval(checkWalletConnection, 2000);

    return () => clearInterval(interval);
  }, []);

  const fetchChatSessions = useCallback(async () => {
    if (!walletAddress) {
      setChatSessions([]);
      setLoadingSessions(false);
      return;
    }

    setLoadingSessions(true);
    setError(null);

    // First try to get chat sessions from localStorage
    const localStorageKey = `Zarfa_chat_sessions_${walletAddress}`;
    const storedSessions = localStorage.getItem(localStorageKey);

    if (storedSessions) {
      try {
        const parsedSessions = JSON.parse(storedSessions);
        setChatSessions(parsedSessions);
        setLoadingSessions(false);
        return;
      } catch (parseError) {
        console.error(
          "Error parsing chat sessions from localStorage:",
          parseError
        );
      }
    }

    // If no sessions in localStorage, try to get from Supabase for backward compatibility
    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", walletAddress)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setChatSessions(data);
        // Save to localStorage for future use
        localStorage.setItem(localStorageKey, JSON.stringify(data));
      } else {
        setChatSessions([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch chat sessions"
      );
      console.error("Error fetching chat sessions:", err);
      setChatSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchChatSessions();
  }, [fetchChatSessions]);

  const createChatSession = useCallback(
    async (
      title: string,
      initialMessageContent?: string
    ): Promise<ChatSession | null> => {
      console.log("🚀 Creating chat session...", { walletAddress, title });

      if (!walletAddress) {
        setError("Wallet not connected - using offline mode");
        console.warn("Creating session without wallet connection");

        // Create a temporary session for offline use
        const now = new Date().toISOString();
        const tempSession: ChatSession = {
          id: generateUUID(),
          user_id: "offline-user",
          title: title,
          last_message_content: initialMessageContent || null,
          last_message_timestamp: initialMessageContent ? now : null,
          created_at: now,
          updated_at: now,
        };

        console.log("Created temporary offline session:", tempSession);
        return tempSession;
      }

      setError(null);
      try {
        const now = new Date().toISOString();
        const newSession: ChatSession = {
          id: generateUUID(),
          user_id: walletAddress,
          title: title,
          last_message_content: initialMessageContent || null,
          last_message_timestamp: initialMessageContent ? now : null,
          created_at: now,
          updated_at: now,
        };

        // Add to state
        const updatedSessions = [newSession, ...chatSessions];
        setChatSessions(updatedSessions);

        // Save to localStorage
        const localStorageKey = `Zarfa_chat_sessions_${walletAddress}`;
        localStorage.setItem(localStorageKey, JSON.stringify(updatedSessions));

        console.log("✅ Created chat session in localStorage:", newSession);

        // Try to also save to Supabase for backward compatibility
        try {
          await supabase.from("chat_sessions").insert({
            id: newSession.id,
            user_id: walletAddress,
            title: title,
            last_message_content: initialMessageContent || null,
            last_message_timestamp: initialMessageContent ? now : null,
          });
          console.log("✅ Saved to Supabase successfully");
        } catch (supabaseError) {
          console.warn(
            "Failed to save chat session to Supabase (continuing anyway):",
            supabaseError
          );
        }

        return newSession;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create chat session"
        );
        console.error("❌ Error creating chat session:", err);
        return null;
      }
    },
    [walletAddress, chatSessions]
  );

  const updateChatSession = useCallback(
    async (
      sessionId: string,
      updates: Partial<ChatSession>
    ): Promise<ChatSession | null> => {
      if (!walletAddress) {
        setError("Wallet not connected");
        return null;
      }

      setError(null);
      try {
        // Find the session to update
        const sessionToUpdate = chatSessions.find(
          (session) => session.id === sessionId
        );
        if (!sessionToUpdate) {
          throw new Error(`Chat session with ID ${sessionId} not found`);
        }

        // Create updated session
        const updatedSession = {
          ...sessionToUpdate,
          ...updates,
          updated_at: new Date().toISOString(),
        };

        // Update in state
        const updatedSessions = chatSessions.map((session) =>
          session.id === sessionId ? updatedSession : session
        );
        setChatSessions(updatedSessions);

        // Save to localStorage
        const localStorageKey = `Zarfa_chat_sessions_${walletAddress}`;
        localStorage.setItem(localStorageKey, JSON.stringify(updatedSessions));

        console.log("Updated chat session in localStorage:", updatedSession);

        // Try to also update in Supabase for backward compatibility
        try {
          await supabase
            .from("chat_sessions")
            .update({
              ...updates,
              updated_at: updatedSession.updated_at,
            })
            .eq("id", sessionId)
            .eq("user_id", walletAddress);
        } catch (supabaseError) {
          console.error(
            "Failed to update chat session in Supabase (continuing anyway):",
            supabaseError
          );
        }

        return updatedSession;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update chat session"
        );
        console.error("Error updating chat session:", err);
        return null;
      }
    },
    [walletAddress, chatSessions]
  );

  const deleteChatSession = useCallback(
    async (sessionId: string): Promise<boolean> => {
      if (!walletAddress) {
        setError("Wallet not connected");
        return false;
      }

      setError(null);
      try {
        // Update state by filtering out the session
        const updatedSessions = chatSessions.filter(
          (session) => session.id !== sessionId
        );
        setChatSessions(updatedSessions);

        // Save to localStorage
        const localStorageKey = `Zarfa_chat_sessions_${walletAddress}`;
        localStorage.setItem(localStorageKey, JSON.stringify(updatedSessions));

        console.log("Deleted chat session from localStorage, ID:", sessionId);

        // Try to also delete from Supabase for backward compatibility
        try {
          await supabase
            .from("chat_sessions")
            .delete()
            .eq("id", sessionId)
            .eq("user_id", walletAddress);
        } catch (supabaseError) {
          console.error(
            "Failed to delete chat session from Supabase (continuing anyway):",
            supabaseError
          );
        }

        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete chat session"
        );
        console.error("Error deleting chat session:", err);
        return false;
      }
    },
    [walletAddress, chatSessions]
  );

  const getChatMessages = useCallback(
    async (sessionId: string): Promise<ChatMessage[]> => {
      console.log("🔍 Loading messages for session:", sessionId);

      if (!walletAddress) {
        console.warn("⚠️ No wallet address, trying offline mode");
        // Try to get messages from localStorage even without wallet for offline mode
        const localStorageKey = `Zarfa_chat_messages_offline_${sessionId}`;
        const storedMessages = localStorage.getItem(localStorageKey);

        if (storedMessages) {
          try {
            const parsedMessages = JSON.parse(storedMessages);
            console.log("✅ Loaded offline messages:", parsedMessages.length);
            return parsedMessages;
          } catch (parseError) {
            console.error("Error parsing offline messages:", parseError);
          }
        }
        return [];
      }

      setError(null);

      // First try to get chat messages from localStorage (faster)
      const localStorageKey = `Zarfa_chat_messages_${walletAddress}_${sessionId}`;
      const storedMessages = localStorage.getItem(localStorageKey);

      if (storedMessages) {
        try {
          const parsedMessages = JSON.parse(storedMessages);
          console.log(
            "✅ Loaded messages from localStorage:",
            parsedMessages.length
          );
          return parsedMessages;
        } catch (parseError) {
          console.error(
            "Error parsing chat messages from localStorage:",
            parseError
          );
        }
      }

      // If no messages in localStorage, try to get from Supabase
      try {
        console.log("🔄 Fetching messages from Supabase...");
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("session_id", sessionId)
          .eq("user_id", walletAddress)
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          console.log("✅ Loaded messages from Supabase:", data.length);
          // Save to localStorage for future use
          localStorage.setItem(localStorageKey, JSON.stringify(data));
          return data;
        }

        console.log("📝 No existing messages found for session");
        return [];
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch chat messages"
        );
        console.error("Error fetching chat messages:", err);
        return [];
      }
    },
    [walletAddress]
  );

  const addChatMessage = useCallback(
    async (
      sessionId: string,
      type: "user" | "assistant",
      content: string
    ): Promise<ChatMessage | null> => {
      console.log("💾 Saving message:", {
        sessionId,
        type,
        content: content.substring(0, 50) + "...",
      });

      const now = new Date().toISOString();
      const newMessage: ChatMessage = {
        id: generateUUID(),
        session_id: sessionId,
        user_id: walletAddress || "offline-user",
        type: type,
        content: content,
        created_at: now,
      };

      if (!walletAddress) {
        console.warn("⚠️ No wallet address, saving in offline mode");
        // Save in offline mode
        const localStorageKey = `Zarfa_chat_messages_offline_${sessionId}`;
        const storedMessages = localStorage.getItem(localStorageKey);
        let existingMessages: ChatMessage[] = [];

        if (storedMessages) {
          try {
            existingMessages = JSON.parse(storedMessages);
          } catch (parseError) {
            console.error(
              "Error parsing existing offline messages:",
              parseError
            );
          }
        }

        const updatedMessages = [...existingMessages, newMessage];
        localStorage.setItem(localStorageKey, JSON.stringify(updatedMessages));
        console.log("✅ Message saved offline to localStorage");
        return newMessage;
      }

      setError(null);
      try {
        // Get existing messages for this session
        const localStorageKey = `Zarfa_chat_messages_${walletAddress}_${sessionId}`;
        const storedMessages = localStorage.getItem(localStorageKey);
        let existingMessages: ChatMessage[] = [];

        if (storedMessages) {
          try {
            existingMessages = JSON.parse(storedMessages);
          } catch (parseError) {
            console.error("Error parsing existing messages:", parseError);
          }
        }

        // Add new message
        const updatedMessages = [...existingMessages, newMessage];

        // Save to localStorage first (faster)
        localStorage.setItem(localStorageKey, JSON.stringify(updatedMessages));
        console.log("✅ Message saved to localStorage");

        // Update the last message in the session
        try {
          await updateChatSession(sessionId, {
            last_message_content: content,
            last_message_timestamp: now,
            updated_at: now,
          });
        } catch (updateError) {
          console.error("Failed to update session:", updateError);
        }

        // Try to also save to Supabase (background operation)
        try {
          const { error } = await supabase.from("chat_messages").insert({
            id: newMessage.id,
            session_id: sessionId,
            user_id: walletAddress,
            type: type,
            content: content,
            created_at: now,
          });

          if (error) throw error;
          console.log("✅ Message saved to Supabase");
        } catch (supabaseError) {
          console.warn(
            "Failed to save message to Supabase (localStorage backup available):",
            supabaseError
          );
        }

        return newMessage;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to add chat message"
        );
        console.error("Error adding chat message:", err);
        return null;
      }
    },
    [walletAddress, updateChatSession]
  );

  return {
    chatSessions,
    loadingSessions,
    error,
    fetchChatSessions,
    createChatSession,
    updateChatSession,
    deleteChatSession,
    getChatMessages,
    addChatMessage,
  };
};
