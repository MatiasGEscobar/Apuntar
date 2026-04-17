'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { transactionsService } from '../../../lib/transactions';
import { authService } from '../../../lib/auth';
import { useChat } from '../../../hooks/useChat';
import { Transaction, TransactionStatus } from '../../../types/transaction.types';
import { ArrowLeft, MessageSquare, Send, CheckCircle, Package, Star } from 'lucide-react';

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
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
    if (params.id) {
      loadTransaction(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadTransaction = async (id: string) => {
    try {
      setLoading(true);
      const data = await transactionsService.getById(id);
      setTransaction(data);
    } catch (error) {
      console.error('Error cargando transacción:', error);
      router.push('/transactions');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    sendMessage(messageInput);
    setMessageInput('');
  };

  const handleConfirmDelivery = async () => {
    if (!transaction) return;

    if (!confirm('¿Confirmas que recibiste el producto y verificaste la documentación del vendedor?')) {
      return;
    }

    try {
      await transactionsService.confirmDelivery(transaction.id);
      await loadTransaction(transaction.id);
      alert('¡Entrega confirmada! El pago ha sido liberado al vendedor.');
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
      alert('¡Gracias por tu calificación!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al enviar calificación');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!transaction || !currentUser) {
    return null;
  }

  const isBuyer = transaction.buyerId === currentUser.id;
  const otherUser = isBuyer ? transaction.seller : transaction.buyer;

  const getStatusInfo = () => {
    switch (transaction.status) {
      case TransactionStatus.PENDING:
        return {
          color: 'bg-yellow-600',
          text: 'Pago Pendiente',
          icon: Package,
        };
      case TransactionStatus.ESCROW:
        return {
          color: 'bg-blue-600',
          text: 'En Escrow - Coordinar Entrega',
          icon: MessageSquare,
        };
      case TransactionStatus.COMPLETED:
        return {
          color: 'bg-green-600',
          text: 'Completada',
          icon: CheckCircle,
        };
      case TransactionStatus.CANCELLED:
        return {
          color: 'bg-red-600',
          text: 'Cancelada',
          icon: Package,
        };
      default:
        return {
          color: 'bg-gray-600',
          text: transaction.status,
          icon: Package,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/transactions')}
            className="text-slate-400 hover:text-white flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a transacciones
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Columna izquierda - Información */}
          <div className="md:col-span-1 space-y-6">
            {/* Estado */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <StatusIcon className="w-6 h-6 text-white" />
                <div>
                  <p className="text-slate-400 text-sm">Estado</p>
                  <span className={`${statusInfo.color} text-white text-sm px-3 py-1 rounded-full inline-block mt-1`}>
                    {statusInfo.text}
                  </span>
                </div>
              </div>
            </div>

            {/* Producto */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-semibold mb-4">Producto</h3>
              <div className="flex gap-3 mb-3">
                <div className="w-20 h-20 bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {transaction.product.images?.[0] ? (
                    <img src={transaction.product.images[0]} alt={transaction.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-3xl">🔫</div>
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold">{transaction.product.name}</p>
                  <p className="text-slate-400 text-sm">{transaction.product.brand}</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                ${transaction.amount.toLocaleString()}
              </div>
            </div>

            {/* Otro usuario */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-semibold mb-4">
                {isBuyer ? 'Vendedor' : 'Comprador'}
              </h3>
              <p className="text-white mb-2">
                {otherUser.firstName} {otherUser.lastName}
              </p>
              <p className="text-slate-400 text-sm">{otherUser.email}</p>
              {otherUser.phone && (
                <p className="text-slate-400 text-sm mt-2">📱 {otherUser.phone}</p>
              )}
            </div>

            {/* Acciones */}
            {transaction.status === TransactionStatus.ESCROW && isBuyer && (
              <button
                onClick={handleConfirmDelivery}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Confirmar Entrega
              </button>
            )}
          </div>

          {/* Columna derecha - Chat */}
          <div className="md:col-span-2 bg-slate-800 rounded-xl border border-slate-700 flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                <h3 className="text-white font-semibold">Chat</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-slate-400 text-sm">{isConnected ? 'Conectado' : 'Desconectado'}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No hay mensajes aún. Inicia la conversación.</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.senderId === currentUser.id;
                  return (
                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        isOwn ? 'bg-amber-600 text-white' : 'bg-slate-700 text-white'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-amber-200' : 'text-slate-400'}`}>
                          {new Date(message.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {transaction.status === TransactionStatus.ESCROW && (
              <div className="p-4 border-t border-slate-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl transition flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {transaction.status === TransactionStatus.COMPLETED && (
              <div className="p-4 border-t border-slate-700 bg-green-900 bg-opacity-20">
                <p className="text-green-200 text-center">✓ Transacción completada</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Calificación */}
        {showRating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">Calificar {isBuyer ? 'Vendedor' : 'Comprador'}</h2>
              
              <div className="mb-6">
                <p className="text-slate-400 mb-3">¿Cómo fue tu experiencia?</p>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Comentario (opcional)
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
                  placeholder="Cuéntanos sobre tu experiencia..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRating(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl transition"
                >
                  Omitir
                </button>
                <button
                  onClick={handleSubmitRating}
                  disabled={rating === 0}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 text-white py-3 rounded-xl transition"
                >
                  Enviar Calificación
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}