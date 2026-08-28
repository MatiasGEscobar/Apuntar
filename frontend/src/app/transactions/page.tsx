'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { transactionsService } from '../../lib/transactions';
import { authService } from '../../lib/auth';
import { Transaction, TransactionStatus } from '../../types/transaction.types';
import { Package, MessageSquare, Eye } from 'lucide-react';
import AppNavbar from '../../components/AppNavbar';
import toast from 'react-hot-toast';

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser] = useState(authService.getCurrentUser());

useEffect(() => {
  if (!currentUser) { router.push('/login'); return; }

  const handleMPReturn = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const status = searchParams.get('status');
    const transactionId = searchParams.get('id');

    if (status && transactionId) {
      if (status === 'success') {
        toast.success('¡Pago exitoso! Tu dinero está en escrow.');
      } else if (status === 'failure') {
        try {
          await transactionsService.cancel(transactionId, 'Pago rechazado en Mercado Pago');
          toast.error('El pago fue rechazado. El producto está disponible nuevamente.');
        } catch {
          toast.error('El pago fue rechazado.');
        }
      } else if (status === 'pending') {
        toast('Tu pago está pendiente de acreditación.', { icon: '⏳' });
      }
      window.history.replaceState({}, '', '/transactions');
      loadTransactions();
    }
  };

  handleMPReturn();
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

  const statusConfig: Record<TransactionStatus, { label: string; color: string; bg: string }> = {
    [TransactionStatus.PENDING]:   { label: 'PENDIENTE',   color: 'text-yellow-400', bg: 'border-yellow-900/40 bg-yellow-950/10' },
    [TransactionStatus.ESCROW]:    { label: 'EN ESCROW',   color: 'text-blue-400',   bg: 'border-blue-900/40 bg-blue-950/10' },
    [TransactionStatus.COMPLETED]: { label: 'COMPLETADA',  color: 'text-green-400',  bg: 'border-green-900/40 bg-green-950/10' },
    [TransactionStatus.CANCELLED]: { label: 'CANCELADA',   color: 'text-red-400',    bg: 'border-red-900/40 bg-red-950/10' },
    [TransactionStatus.DISPUTED]:  { label: 'EN DISPUTA',  color: 'text-orange-400', bg: 'border-orange-900/40 bg-orange-950/10' },
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-2 border-[#333333] border-t-[#c9a227] rounded-full animate-spin" />
      <p className="text-[#888888] font-rajdhani tracking-widest text-sm uppercase">Cargando transacciones...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Navbar */}
      <AppNavbar backLabel="Ver catálogo" backHref="/products" />

      {/* Header */}
      <div className="border-b border-[#333333] bg-[#111111]">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-px bg-[#c9a227]" />
            <span className="text-[#c9a227] text-xs tracking-[0.3em] uppercase font-rajdhani">
              Operador: {currentUser?.firstName} {currentUser?.lastName}
            </span>
          </div>
          <h1 className="font-tactical text-5xl text-[#e8e8e8] tracking-wide">
            MIS TRANSACCIONES
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 border border-[#333333]">
            <Package className="w-12 h-12 text-[#333333]" />
            <p className="text-[#888888] font-rajdhani tracking-widest text-sm uppercase">
              No tenés transacciones aún
            </p>
            <button
              onClick={() => router.push('/products')}
              className="btn-tactical-outline text-sm py-2 px-6 mt-2"
            >
              VER CATÁLOGO
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const isBuyer = transaction.buyerId === currentUser?.id;
              const status = statusConfig[transaction.status];

              return (
                <div
                  key={transaction.id}
                  className="border border-[#333333] bg-[#111111] hover:border-[#c9a227]/50 transition-colors"
                >
                  <div className="p-5 flex gap-5 items-start">

                    {/* Imagen */}
                    <div className="w-20 h-20 bg-[#1a1a1a] border border-[#333333] flex items-center justify-center overflow-hidden flex-shrink-0">
                      {transaction.product.images?.[0] ? (
                        <img src={transaction.product.images[0]} alt={transaction.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-2xl opacity-20">🔫</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-tactical text-xl text-[#e8e8e8] tracking-wide truncate">
                          {transaction.product.name}
                        </h3>
                        <span className={`font-tactical text-xs px-3 py-1 border flex-shrink-0 ${status.color} ${status.bg}`}>
                          {status.label}
                        </span>
                      </div>

                      <p className="text-[#888888] font-rajdhani text-sm mb-3">
                        {transaction.product.brand} ·{' '}
                        <span className="text-[#555555]">
                          {isBuyer ? 'Comprando a' : 'Vendiendo a'}{' '}
                        </span>
                        <span className="text-[#888888]">
                          {isBuyer
                            ? `${transaction.seller.firstName} ${transaction.seller.lastName}`
                            : `${transaction.buyer.firstName} ${transaction.buyer.lastName}`
                          }
                        </span>
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="font-tactical text-2xl text-[#c9a227]">
                          ${Number(transaction.amount).toLocaleString('es-AR')}
                          <span className="text-[#555555] text-sm font-rajdhani ml-1 font-normal">ARS</span>
                        </span>

                        <button
                          onClick={() => router.push(`/transactions/${transaction.id}`)}
                          className="btn-tactical text-xs py-2 px-4 flex items-center gap-2"
                        >
                          {transaction.status === TransactionStatus.ESCROW ? (
                            <><MessageSquare className="w-3 h-3" /> IR AL CHAT</>
                          ) : (
                            <><Eye className="w-3 h-3" /> VER DETALLES</>
                          )}
                        </button>
                      </div>
                    </div>
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