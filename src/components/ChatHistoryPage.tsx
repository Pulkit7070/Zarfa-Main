import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, Trash2, Search, Calendar, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../hooks/useChat'; // Import useChat hook
import type { ChatSession as DBChatSession, ChatMessage as DBChatMessage } from '../lib/supabase'; // Import DB types

interface ChatSessionDisplay extends DBChatSession {
  messageCount: number;
  messages: DBChatMessage[];
}

interface ChatHistoryPageProps {
  onSelectSession: (sessionId: string) => void; // Callback to select a session
}

export const ChatHistoryPage: React.FC<ChatHistoryPageProps> = ({ onSelectSession }) => {
  const { chatSessions, loadingSessions, fetchChatSessions, deleteChatSession, getChatMessages } = useChat();
  const [sessionsForDisplay, setSessionsForDisplay] = useState<ChatSessionDisplay[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSessionDisplay | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch sessions on mount and when chatSessions from hook updates
  useEffect(() => {
    const prepareSessions = async () => {
      const sessionsWithDetails: ChatSessionDisplay[] = await Promise.all(
        chatSessions.map(async (session) => {
          const messages = await getChatMessages(session.id);
          return {
            ...session,
            messageCount: messages.length,
            messages: messages,
          };
        })
      );
      setSessionsForDisplay(sessionsWithDetails);
      // If a session was previously selected, re-select it to update its details
      if (selectedSession) {
        const updatedSelected = sessionsWithDetails.find(s => s.id === selectedSession.id);
        if (updatedSelected) {
          setSelectedSession(updatedSelected);
        } else {
          setSelectedSession(null); // Session might have been deleted
        }
      }
    };

    if (!loadingSessions) {
      prepareSessions();
    }
  }, [chatSessions, loadingSessions, getChatMessages]);

  const filteredSessions = sessionsForDisplay.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (session.last_message_content && session.last_message_content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteSession = async (sessionId: string) => {
    const success = await deleteChatSession(sessionId);
    if (success) {
      setShowDeleteConfirm(null);
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
        if (isMobile) {
          setShowMobileDetail(false);
        }
      }
      // Re-fetch sessions to ensure UI is up-to-date
      fetchChatSessions();
    }
  };

  const handleSelectSession = async (session: DBChatSession) => {
    setLoadingMessages(true);
    try {
      const messages = await getChatMessages(session.id);
      setSelectedSession({
        ...session,
        messageCount: messages.length,
        messages: messages,
      });
      if (isMobile) {
        setShowMobileDetail(true);
      }
    } catch (error) {
      console.error('Failed to load messages for session:', error);
      setSelectedSession(null);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleBackToList = () => {
    if (isMobile) {
      setShowMobileDetail(false);
      setSelectedSession(null);
    } else {
      setSelectedSession(null);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loadingSessions) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-900 font-medium text-sm sm:text-base">Loading chat history...</div>
        </div>
      </div>
    );
  }

  // Mobile view with single panel
  if (isMobile) {
    return (
      <div className="h-full flex flex-col">
        {!showMobileDetail ? (
          // Mobile Sessions List
          <div className="flex-1 bg-white flex flex-col">
            {/* Header */}
            <div className="p-3 sm:p-6 border-b border-gray-200">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg pl-8 sm:pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto">
              {filteredSessions.length > 0 ? (
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  {filteredSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 sm:p-4 rounded-lg border bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                      onClick={() => handleSelectSession(session)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 truncate flex-1 text-sm sm:text-base">
                          {session.title}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(session.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 sm:mb-3">
                        {session.last_message_content || 'No messages yet.'}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{session.last_message_timestamp ? formatTimestamp(session.last_message_timestamp) : formatTimestamp(session.created_at)}</span>
                        </div>
                        <span>{session.messageCount} messages</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
                  <div className="text-center">
                    <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-600 mb-2">
                      {searchTerm ? 'No matching conversations' : 'No chat history yet'}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {searchTerm 
                        ? 'Try adjusting your search terms'
                        : 'Start a conversation with the AI assistant to see your history here'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Mobile Detail View
          selectedSession && (
            <div className="flex-1 bg-white flex flex-col">
              {/* Chat Header */}
              <div className="p-3 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <button
                      onClick={handleBackToList}
                      className="p-1 text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                    >
                      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base sm:text-xl font-bold text-gray-900 truncate">{selectedSession.title}</h2>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        {selectedSession.messageCount} messages • {selectedSession.last_message_timestamp ? formatTimestamp(selectedSession.last_message_timestamp) : formatTimestamp(selectedSession.created_at)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectSession(selectedSession.id)}
                    className="btn-primary text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 ml-2"
                  >
                    Continue
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 sm:w-10 sm:h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : selectedSession.messages.length > 0 ? (
                  selectedSession.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-2 sm:space-x-3 max-w-full sm:max-w-3xl ${
                        message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.type === 'user' 
                            ? 'bg-gray-900' 
                            : 'bg-black'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          ) : (
                            <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          )}
                        </div>
                        
                        <div className={`rounded-lg px-3 py-2 sm:px-4 sm:py-3 ${
                          message.type === 'user'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{message.content}</div>
                          <div className={`text-xs mt-1 sm:mt-2 ${
                            message.type === 'user' ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-600 mb-2">No messages in this conversation</h3>
                      <p className="text-gray-500 text-sm">Start typing to begin the conversation.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white border border-gray-200 rounded-2xl max-w-md w-full"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-red-600 rounded-full flex items-center justify-center">
                      <Trash2 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-red-800">Delete Conversation</h3>
                      <p className="text-red-700 text-xs sm:text-sm">This action cannot be undone</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
                    Are you sure you want to delete this conversation? All messages will be permanently removed.
                  </p>
                  
                  <div className="flex space-x-2 sm:space-x-3">
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteSession(showDeleteConfirm)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop view with two panels
  return (
    <div className="h-full flex">
      {/* Chat Sessions List */}
      <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Chat History</h1>
              <p className="text-gray-600 text-sm">Your AI conversation history</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {filteredSessions.length > 0 ? (
            <div className="p-4 space-y-3">
              {filteredSessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedSession?.id === session.id
                      ? 'bg-gray-100 border-gray-300'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectSession(session)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 truncate flex-1">
                      {session.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(session.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {session.last_message_content || 'No messages yet.'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{session.last_message_timestamp ? formatTimestamp(session.last_message_timestamp) : formatTimestamp(session.created_at)}</span>
                    </div>
                    <span>{session.messageCount} messages</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  {searchTerm ? 'No matching conversations' : 'No chat history yet'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'Start a conversation with the AI assistant to see your history here'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages View */}
      <div className="flex-1 bg-white flex flex-col">
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedSession.title}</h2>
                  <p className="text-gray-600 text-sm">
                    {selectedSession.messageCount} messages • {selectedSession.last_message_timestamp ? formatTimestamp(selectedSession.last_message_timestamp) : formatTimestamp(selectedSession.created_at)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectSession(selectedSession.id)}
                    className="btn-primary text-sm px-4 py-2"
                  >
                    Continue Chat
                  </button>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : selectedSession.messages.length > 0 ? (
                selectedSession.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-3xl ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-gray-900' 
                          : 'bg-black'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      
                      <div className={`rounded-lg px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        <div className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No messages in this conversation</h3>
                    <p className="text-gray-500">Start typing to begin the conversation.</p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">Select a Conversation</h3>
              <p className="text-gray-500">Choose a chat session from the left to view the conversation</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border border-gray-200 rounded-2xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Delete Conversation</h3>
                    <p className="text-red-700 text-sm">This action cannot be undone</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete this conversation? All messages will be permanently removed.
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 py-3 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteSession(showDeleteConfirm)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};