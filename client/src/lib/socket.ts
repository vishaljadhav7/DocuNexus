import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL

export const useSocket = (userId : string): Socket | null => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SERVER_URL, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on('connect', () => {
        console.log('Socket.IO connected:', socketRef.current?.id);
      });

      socketRef.current.emit("join", {userId});

      socketRef.current.on('connect_error', (err: Error) => {
        console.error('Socket.IO connection error:', err.message);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket.IO disconnected');
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userId]);

  return socketRef.current;
};