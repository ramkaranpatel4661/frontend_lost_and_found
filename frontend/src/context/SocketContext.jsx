import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) return;
    
    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://backend-lost-found.onrender.com';
    
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      withCredentials: true
    });
    
    newSocket.on('connect', () => console.log('Socket connected:', newSocket.id));
    newSocket.on('disconnect', () => console.log('Socket disconnected'));
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [token]);

  const joinChat = (itemId) => socket?.emit('join_item_chat', itemId);
  const leaveChat = (itemId) => socket?.emit('leave_item_chat', itemId);
  const sendMessage = (itemId, content) => socket?.emit('send_message', { itemId, content });

  return (
    <SocketContext.Provider value={{ socket, joinChat, leaveChat, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};