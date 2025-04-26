'use client'

import { createContext, useContext, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { useSocket } from '@/lib/socket';
import { useAppSelector } from '@/redux/store';
  
const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const user = useAppSelector(store => store.user.userInfo);
  const socket = useSocket(user?.id as string);
  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocketContext = (): Socket | null => useContext(SocketContext);

