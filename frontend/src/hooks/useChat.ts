import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketProvider';
import { Message } from '../types/transaction.types';
import { useNotifications } from '../context/NotificationsProvider';

export const useChat = (transactionId: string, userId: string, otherUserId: string) => {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const { setActiveTransaction } = useNotifications();

  useEffect(() => {
  if (!transactionId) return;
  setActiveTransaction(transactionId);
  return () => setActiveTransaction(null);
}, [transactionId, setActiveTransaction]);

  useEffect(() => {
    if (!socket || !transactionId || !userId) return;

    const joinAndLoad = () => {
      socket.emit('join-transaction', { transactionId, userId });
      socket.emit('get-messages', { transactionId }, (response: Message[]) => {
        if (Array.isArray(response)) setMessages(response);
      });
      socket.emit('check-presence', { userId: otherUserId });
    };

    if (socket.connected) joinAndLoad();
    else socket.once('connect', joinAndLoad);

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]); // el sonido ya lo maneja SocketProvider
    };

    const handleUserStatus = (data: { userId: string; online: boolean }) => {
      if (data.userId === otherUserId) setOtherUserOnline(data.online);
    };

    socket.on('new-message', handleNewMessage);
    socket.on('user-status', handleUserStatus);

    return () => {
      socket.emit('leave-transaction', { transactionId });
      socket.off('new-message', handleNewMessage);
      socket.off('user-status', handleUserStatus);
      socket.off('connect', joinAndLoad);
      // NO desconectamos el socket: es compartido con toda la app
    };
  }, [socket, transactionId, userId, otherUserId]);

  const sendMessage = useCallback(
    (content: string) => {
      if (socket?.connected) {
        socket.emit('send-message', { transactionId, senderId: userId, recipientId: otherUserId, content });
      }
    },
    [socket, transactionId, userId, otherUserId]
  );

  return { messages, sendMessage, isConnected, otherUserOnline };
};