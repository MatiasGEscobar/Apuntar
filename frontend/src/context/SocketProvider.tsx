'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from '../lib/socket';
import { useAuth } from './AuthContext';
import { Message } from '../types/transaction.types';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      disconnectSocket();
      socketRef.current = null;
      setIsConnected(false);
      return;
    }

    const socket = getSocket();
    socketRef.current = socket;
    if (!socket.connected) socket.connect();

    const handleConnect = () => {
      setIsConnected(true);
      socket.emit('register-user', { userId: user.id });
    }
    
    const handleDisconnect = () => setIsConnected(false);

    // Sonido global: suena sin importar en qué página estés
    const handleNewMessage = (message: Message) => {
      if (message.senderId !== user.id) {
        try {
          const audio = new Audio('/sounds/message.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch {}
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('new-message', handleNewMessage);
    if (socket.connected) setIsConnected(true);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('new-message', handleNewMessage);
      // OJO: nunca desconectamos acá, el socket vive mientras dure la sesión
    };
  }, [user, isLoading]);

  // Solo se desconecta si el usuario cierra sesión (ver arriba) o cierra la pestaña
  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}