import { useState, useEffect } from 'react';
import { getSocket } from '../lib/socket';
import { Message } from '../types/transaction.types';

export const useChat = (transactionId: string, userId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    socket.connect();

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-transaction', { transactionId });
      socket.emit('get-messages', { transactionId }, (response: Message[]) => {
        setMessages(response);
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('new-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new-message');
      socket.disconnect();
    };
  }, [transactionId]);

  const sendMessage = (content: string) => {
    const socket = getSocket();
    socket.emit('send-message', {
      transactionId,
      senderId: userId,
      content,
    });
  };

  return { messages, sendMessage, isConnected };
};