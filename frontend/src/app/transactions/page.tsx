'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { transactionsService } from '../../lib/transactions';
import { authService } from '../../lib/auth';
import { Transaction, TransactionStatus } from '../../types/transaction.types';
import { Package, Eye, MessageSquare, CheckCircle } from 'lucide-react';

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionsService.getMyTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error cargando transacciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    const styles = {
      [TransactionStatus.PENDING]: 'bg-yellow-600',
      [TransactionStatus.ESCROW]: 'bg-blue-600',
      [TransactionStatus.COMPLETED]: 'bg-green-600',
      [TransactionStatus.CANCELLED]: 'bg-red-600',
      [TransactionStatus.DISPUTED]: 'bg-orange-600',
    };

    const labels = {
      [TransactionStatus.PENDING]: 'Pendiente',
      [TransactionStatus.ESCROW]: 'En Escrow',
      [TransactionStatus.COMPLETED]: 'Completada',
      [TransactionStatus.CANCELLED]: 'Cancelada',
      [TransactionStatus.DISPUTED]: 'En Disputa',
    };

    return (
      <span className={`${styles[status]} text-white text-xs px-3 py-1 rounded-full`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Mis Transacciones</h1>
            <button
              onClick={() => router.push('/products')}
              className="text-slate-400 hover:text-white transition"
            >
              Ver Catálogo
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No tienes transacciones aún</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const isBuyer = transaction.buyerId === currentUser?.id;
              return (
                <div key={transaction.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {transaction.product.images?.[0] ? (
                          <img src={transaction.product.images[0]} alt={transaction.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-4xl">🔫</div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{transaction.product.name}</h3>
                        <p className="text-slate-400 text-sm mb-2">{transaction.product.brand}</p>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <span>{isBuyer ? 'Comprando a' : 'Vendiendo a'}</span>
                          <span className="text-white">
                            {isBuyer 
                              ? `${transaction.seller.firstName} ${transaction.seller.lastName}`
                              : `${transaction.buyer.firstName} ${transaction.buyer.lastName}`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white mb-2">
                        ${transaction.amount.toLocaleString()}
                      </div>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push(`/transactions/${transaction.id}`)}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {transaction.status === TransactionStatus.ESCROW ? (
                        <>
                          <MessageSquare className="w-4 h-4" />
                          Ir al Chat
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          Ver Detalles
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}