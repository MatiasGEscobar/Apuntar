'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketProvider';
import { Message } from '../types/transaction.types';

interface NotificationsContextValue {
  unreadCounts: Record<string, number>;
  totalUnread: number;
  setActiveTransaction: (transactionId: string | null) => void;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  unreadCounts: {},
  totalUnread: 0,
  setActiveTransaction: () => {},
});

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const activeTransactionRef = useRef<string | null>(null);

  const setActiveTransaction = useCallback((transactionId: string | null) => {
    activeTransactionRef.current = transactionId;
    if (transactionId) {
      setUnreadCounts((prev) => {
        if (!prev[transactionId]) return prev;
        const next = { ...prev };
        delete next[transactionId];
        return next;
      });
    }
  }, []);

  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (message: Message & { transactionId: string }) => {
      if (message.senderId === user.id) return;
      if (activeTransactionRef.current === message.transactionId) return; // ya la está viendo

      setUnreadCounts((prev) => ({
        ...prev,
        [message.transactionId]: (prev[message.transactionId] || 0) + 1,
      }));

      toast.custom(
        (t) => (
          <div
            onClick={() => {
              toast.dismiss(t.id);
              router.push(`/transactions/${message.transactionId}`);
            }}
            className={`cursor-pointer bg-[#111111] border border-[#c9a227] border-l-4 px-4 py-3 shadow-xl max-w-sm transition-opacity ${
              t.visible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <p className="font-tactical text-xs tracking-wider text-[#c9a227] uppercase mb-1">
              Nuevo mensaje
            </p>
            <p className="font-rajdhani text-sm text-[#e8e8e8] truncate">
              {message.content}
            </p>
          </div>
        ),
        { duration: 5000 }
      );
    };

    socket.on('new-message', handleNewMessage);
    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, user, router]);

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <NotificationsContext.Provider value={{ unreadCounts, totalUnread, setActiveTransaction }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}