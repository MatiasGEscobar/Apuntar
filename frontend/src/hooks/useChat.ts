import { useState, useEffect } from 'react';
import { resetSocket, getSocket } from '../lib/socket';
import { Message } from '../types/transaction.types';

export const useChat = (transactionId: string, userId: string, otherUserId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);

  useEffect(() => {
    if (!transactionId || !userId) return;

    const socket = resetSocket();
    socket.connect();

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-transaction', { transactionId, userId });
      socket.emit('get-messages', { transactionId }, (response: Message[]) => {
        if (Array.isArray(response)) setMessages(response);
      });
      // Verificar si el otro usuario ya está conectado
      socket.emit('check-presence', { userId: otherUserId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setOtherUserOnline(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    socket.on('new-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
      if (message.senderId !== userId) {
        try {
          const audio = new Audio('/sounds/message.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch {}
      }
    });

    socket.on('user-status', (data: { userId: string; online: boolean }) => {
      if (data.userId === otherUserId) {
        setOtherUserOnline(data.online);
      }
    });

    return () => {
      socket.emit('leave-transaction', { transactionId });
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [transactionId, userId, otherUserId]);

  const sendMessage = (content: string) => {
    const currentSocket = getSocket();
    if (currentSocket.connected) {
      currentSocket.emit('send-message', { transactionId, senderId: userId, content });
    }
  };

  return { messages, sendMessage, isConnected, otherUserOnline };
};