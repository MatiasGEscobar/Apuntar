import { useState, useEffect } from 'react';
import { resetSocket } from '../lib/socket';
import { Message } from '../types/transaction.types';

export const useChat = (transactionId: string, userId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!transactionId || !userId) return;

    // Siempre crear una conexión nueva
    const socket = resetSocket();

    socket.connect();

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-transaction', { transactionId });
      socket.emit('get-messages', { transactionId }, (response: Message[]) => {
        if (Array.isArray(response)) setMessages(response);
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket error:', error.message);
      setIsConnected(false);
    });

    socket.on('new-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.emit('leave-transaction', { transactionId });
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [transactionId, userId]);

  const sendMessage = (content: string) => {
    const socket = resetSocket();
    if (!socket.connected) {
      socket.connect();
      socket.once('connect', () => {
        socket.emit('send-message', { transactionId, senderId: userId, content });
      });
    } else {
      socket.emit('send-message', { transactionId, senderId: userId, content });
    }
  };

  return { messages, sendMessage, isConnected };
};