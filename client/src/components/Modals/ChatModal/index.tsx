import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import axios from 'axios';
import { useSocketContext } from '@/Context/SocketContext';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  contractId : string;
}

const ChatModal = ({ isOpen, setIsOpen, contractId}: ModalProps) => {
  // const [chats, setChats] = useState();
  const [message, setMessage] = useState<string>('');
  const  socket  = useSocketContext();

  const sendChat = async () => {
    try {
      const data = await axios.post(`http://localhost:4000/chat/${contractId}`,{
        chatQuery : message
      }, {
        withCredentials : true
      });

      console.log("data chat modal ", data.data.data)
    } catch (error) {
      console.error(error)
    }
  }

  function newMessage (data : any) {
   console.log("newMessage on Client side =>>> " , data)
  } 
  useEffect(()=> {
 
   socket?.on("newMessage", newMessage)  

  return () => {socket?.off('newMessage', newMessage)}

  }, [socket])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Chat-like box */}
            <div className="h-96 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              {/* Empty for now, as per request */}
            </div>

            {/* Input area */}
            <div className="p-4 bg-white dark:bg-gray-800">
              <div className="flex items-end gap-2">
                <textarea
                  className="w-full h-20 p-3 text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                  placeholder="Type your message..."
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  aria-label="Send message"
                  onClick={sendChat}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatModal;