'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { transactionsService } from '../../../lib/transactions';
import { authService } from '../../../lib/auth';
import { useChat } from '../../../hooks/useChat';
import { Transaction, TransactionStatus } from '../../../types/transaction.types';
import { ArrowLeft, MessageSquare, Send, CheckCircle, Package, Star, Shield, AlertTriangle } from 'lucide-react';
import Logo from '../../../components/logo';

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser] = useState(authService.getCurrentUser());
  const [messageInput, setMessageInput] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, isConnected } = useChat(
    params.id as string,
    currentUser?.id || ''
  );

  useEffect(() => {
    if (params.id) loadTransaction(params.id as string);
  }, [params.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadTransaction = async (id: string) => {
    try {
      setLoading(true);
      const data = await transactionsService.getById(id);
      setTransaction(data);
    } catch (error) {
      router.push('/transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    sendMessage(messageInput);
    setMessageInput('');
  };

  const handleConfirmDelivery = async () => {
    if (!transaction) return;
    if (!confirm('¿Confirmás que recibiste el producto y verificaste la documentación del vendedor?')) return;
    try {
      await transactionsService.confirmDelivery(transaction.id);
      await loadTransaction(transaction.id);
      setShowRating(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al confirmar entrega');
    }
  };

  const handleSubmitRating = async () => {
    if (!transaction || rating === 0) return;
    try {
      await transactionsService.addRating(transaction.id, rating, review);
      await loadTransaction(transaction.id);
      setShowRating(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al enviar calificación');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-2 border-[#333333] border-t-[#c9a227] rounded-full animate-spin" />
      <p className="text-[#888888] font-rajdhani tracking-widest text-sm uppercase">Cargando...</p>
    </div>
  );

  if (!transaction || !currentUser) return null;

  const isBuyer = transaction.buyerId === currentUser.id;
  const otherUser = isBuyer ? transaction.seller : transaction.buyer;

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    [TransactionStatus.PENDING]:   { label: 'PAGO PENDIENTE',        color: 'text-yellow-400', icon: Package },
    [TransactionStatus.ESCROW]:    { label: 'EN ESCROW · COORDINAR', color: 'text-blue-400',   icon: Shield },
    [TransactionStatus.COMPLETED]: { label: 'COMPLETADA',            color: 'text-green-400',  icon: CheckCircle },
    [TransactionStatus.CANCELLED]: { label: 'CANCELADA',             color: 'text-red-400',    icon: AlertTriangle },
  };

  const status = statusConfig[transaction.status] || { label: transaction.status, color: 'text-[#888888]', icon: Package };
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Navbar */}
      <nav className="border-b border-[#333333] bg-[#0a0a0a]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/transactions')}
            className="flex items-center gap-2 text-[#888888] hover:text-[#c9a227] transition-colors font-rajdhani text-sm tracking-wider uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            Mis transacciones
          </button>
          <Logo size="sm" />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Columna izquierda */}
          <div className="space-y-4">

            {/* Estado */}
            <div className="border border-[#333333] bg-[#111111] p-5">
              <p className="text-[#555555] font-rajdhani text-xs tracking-[0.2em] uppercase mb-3">Estado</p>
              <div className="flex items-center gap-3">
                <StatusIcon className={`w-5 h-5 ${status.color}`} />
                <span className={`font-tactical text-sm tracking-wider ${status.color}`}>
                  {status.label}
                </span>
              </div>
            </div>

            {/* Producto */}
            <div className="border border-[#333333] bg-[#111111] p-5">
              <p className="text-[#555555] font-rajdhani text-xs tracking-[0.2em] uppercase mb-4">Producto</p>
              <div className="flex gap-3 mb-4">
                <div className="w-16 h-16 bg-[#1a1a1a] border border-[#333333] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {transaction.product.images?.[0] ? (
                    <img src={transaction.product.images[0]} alt={transaction.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-2xl opacity-20">🔫</div>
                  )}
                </div>
                <div>
                  <p className="font-tactical text-lg text-[#e8e8e8] tracking-wide leading-tight">{transaction.product.name}</p>
                  <p className="text-[#888888] font-rajdhani text-sm">{transaction.product.brand}</p>
                </div>
              </div>
              <div className="border-t border-[#333333] pt-3">
                <span className="font-tactical text-2xl text-[#c9a227]">
                  ${Number(transaction.amount).toLocaleString('es-AR')}
                </span>
                <span className="text-[#555555] font-rajdhani text-xs ml-1">ARS</span>
              </div>
            </div>

            {/* Contraparte */}
            <div className="border border-[#333333] bg-[#111111] p-5">
              <p className="text-[#555555] font-rajdhani text-xs tracking-[0.2em] uppercase mb-3">
                {isBuyer ? 'Vendedor' : 'Comprador'}
              </p>
              <p className="font-rajdhani font-semibold text-[#e8e8e8] mb-1">
                {otherUser.firstName} {otherUser.lastName}
              </p>
              <p className="text-[#888888] font-rajdhani text-sm">{otherUser.email}</p>
              {otherUser.phone && (
                <p className="text-[#888888] font-rajdhani text-sm mt-1">📱 {otherUser.phone}</p>
              )}
            </div>

            {/* Confirmar entrega */}
            {transaction.status === TransactionStatus.ESCROW && isBuyer && (
              <button
                onClick={handleConfirmDelivery}
                className="w-full border border-green-700 bg-green-950/20 text-green-400 font-tactical text-sm tracking-wider py-4 hover:bg-green-950/40 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                CONFIRMAR ENTREGA
              </button>
            )}
          </div>

          {/* Chat - columna derecha */}
          <div className="lg:col-span-2 border border-[#333333] bg-[#111111] flex flex-col h-[600px]">

            {/* Header chat */}
            <div className="px-5 py-4 border-b border-[#333333] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-[#c9a227]" />
                <span className="font-tactical text-sm tracking-wider text-[#e8e8e8]">
                  CHAT CON {isBuyer ? 'VENDEDOR' : 'COMPRADOR'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-[#555555] font-rajdhani text-xs uppercase tracking-wider">
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <MessageSquare className="w-10 h-10 text-[#333333]" />
                  <p className="text-[#555555] font-rajdhani text-sm uppercase tracking-wider">
                    Sin mensajes aún
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.senderId === currentUser.id;
                  return (
                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 ${
                        isOwn
                          ? 'bg-[#c9a227] text-[#0a0a0a]'
                          : 'bg-[#1a1a1a] border border-[#333333] text-[#e8e8e8]'
                      }`}>
                        <p className="font-rajdhani text-sm">{message.content}</p>
                        <p className={`font-rajdhani text-xs mt-1 ${isOwn ? 'text-[#0a0a0a]/60' : 'text-[#555555]'}`}>
                          {new Date(message.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {transaction.status === TransactionStatus.ESCROW && (
              <div className="p-4 border-t border-[#333333] flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Escribí un mensaje..."
                  className="input-tactical flex-1"
                />
                <button
                  onClick={handleSendMessage}
                  className="btn-tactical px-4 py-2 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}

            {transaction.status === TransactionStatus.COMPLETED && (
              <div className="p-4 border-t border-green-900/40 bg-green-950/10 text-center">
                <p className="text-green-400 font-tactical text-sm tracking-wider">
                  ✓ TRANSACCIÓN COMPLETADA
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal calificación */}
      {showRating && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-[#333333] w-full max-w-md">
            <div className="px-6 py-4 border-b border-[#333333]">
              <h2 className="font-tactical text-2xl text-[#e8e8e8] tracking-wide">
                CALIFICAR {isBuyer ? 'VENDEDOR' : 'COMPRADOR'}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-[#888888] font-rajdhani text-sm mb-4 uppercase tracking-wider">
                  ¿Cómo fue tu experiencia?
                </p>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setRating(star)}>
                      <Star className={`w-10 h-10 transition-colors ${
                        star <= rating
                          ? 'text-[#c9a227] fill-[#c9a227]'
                          : 'text-[#333333] hover:text-[#c9a227]/50'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#555555] font-rajdhani text-xs tracking-[0.2em] uppercase mb-2">
                  Comentario (opcional)
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={3}
                  className="input-tactical resize-none"
                  placeholder="Contanos tu experiencia..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowRating(false)}
                  className="btn-tactical-outline flex-1 py-3"
                >
                  OMITIR
                </button>
                <button
                  onClick={handleSubmitRating}
                  disabled={rating === 0}
                  className="btn-tactical flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ENVIAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}