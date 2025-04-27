import { Dispatch, SetStateAction, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRetreiveChatsQuery, useSendQueryMutation } from '@/features/chats/chatApi';
import { Send, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  contractId: string;
}

interface Chat {
  id: string;
  aiResponse: string;
  userQuery: string;
  createdAt: string;
  contractId: string;
}

const ChatModal = ({ isOpen, setIsOpen, contractId }: ModalProps) => {
  const [message, setMessage] = useState<string>('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const formatDateString = (dateString: string) => {
    const date = new Date(dateString);
    const formattedTime = date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return formattedTime;
  };

  const { data: chatHistory, isLoading: isChatHistoryLoading, isError } = useRetreiveChatsQuery({ contractId });

  
  const [sendUserQuery, { isLoading: isSending }] = useSendQueryMutation();

  const sendChat = async () => {
    if (!message.trim()) return;
    try {
      await sendUserQuery({ contractId, chatQuery: message }).unwrap();
      setMessage('');
    } catch (error) {
      console.error('Error sending chat:', error);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  if (isError) {
    console.error('Could not retrieve chats');
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="bg-gradient-to-b from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl w-full max-w-md mx-4 max-h-[85vh] overflow-hidden relative border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Ask AI</h2>
              <motion.button
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
                aria-label="Close modal"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Chat container */}
            <div ref={chatContainerRef} className="h-[60vh] p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              {chatHistory?.length === 0 && !isChatHistoryLoading ? (
                <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400 text-sm">
                  No messages yet. Start asking AI!
                </div>
              ) : (
                <AnimatePresence>
                  {chatHistory?.map((chat: Chat) => (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="mb-4"
                    >
                      <div className="flex justify-end mb-2">
                        <div className="max-w-xs p-3 bg-blue-600 text-white rounded-2xl rounded-br-none shadow-md">
                          <p className="text-sm">{chat.userQuery}</p>
                          <p className="text-xs text-gray-200 mt-1 text-right">{formatDateString(chat.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="max-w-xs p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-none shadow-md">
                          <p className="text-sm">{chat.aiResponse}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-left">{formatDateString(chat.createdAt)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              {(isChatHistoryLoading || isSending) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center py-4"
                >
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                </motion.div>
              )}
            </div>

            {/* Input area */}
            <div className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-end gap-2">
                <textarea
                  value={message}
                  className="w-full h-16 p-3 text-sm text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                  placeholder="Type your question..."
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendChat();
                    }
                  }}
                  disabled={isSending || isChatHistoryLoading} // Disable textarea during sending or fetching
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-3 bg-blue-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isSending || isChatHistoryLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
                  aria-label="Send message"
                  onClick={sendChat}
                  disabled={isSending || isChatHistoryLoading} // Disable button during sending or fetching
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatModal;