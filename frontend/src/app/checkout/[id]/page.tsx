'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { transactionsService } from '../../../lib/transactions';
import { authService } from '../../../lib/auth';
import { Transaction, TransactionStatus } from '../../../types/transaction.types';
import { ArrowLeft, CreditCard, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadTransaction(params.id as string);
    }
  }, [params.id]);

  const loadTransaction = async (id: string) => {
    try {
      setLoading(true);
      const data = await transactionsService.getById(id);
      setTransaction(data);
    } catch (error) {
      console.error('Error cargando transacción:', error);
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

const handlePayment = async () => {
  if (!transaction) return;

  setProcessing(true);

  try {
    const currentUser = authService.getCurrentUser();

    const preference = await transactionsService.createPaymentPreference(
      transaction.id,
      currentUser?.email || '',
      transaction.product.name,
    );

    // Redirigir a Mercado Pago
    // En pruebas usamos sandboxInitPoint, en producción initPoint
    const redirectUrl = preference.sandboxInitPoint || preference.initPoint;
    window.location.href = redirectUrl;

  } catch (error: any) {
    alert(error.response?.data?.message || 'Error al iniciar el pago');
    setProcessing(false);
  }
  // No ponemos setProcessing(false) en el try porque el usuario es redirigido
};

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!transaction) {
    return null;
  }

  const totalAmount = Number(transaction.amount) + Number(transaction.buyerCommission);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push(`/products/${transaction.productId}`)}
            className="text-slate-400 hover:text-white flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al producto
          </button>
        </div>
      </nav>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Checkout Seguro</h1>
            <p className="text-slate-400">Completa tu compra de forma segura</p>
          </div>

          {/* Resumen de la compra */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-semibold mb-4">Resumen de Compra</h3>
              
              <div className="flex gap-4 mb-4">
                <div className="w-24 h-24 bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {transaction.product.images && transaction.product.images.length > 0 ? (
                    <img
                      src={transaction.product.images[0]}
                      alt={transaction.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl">🔫</div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold mb-1">{transaction.product.name}</h4>
                  <p className="text-slate-400 text-sm">
                    {transaction.product.brand} • {transaction.product.caliber}
                  </p>
                  <p className="text-slate-400 text-sm mt-2">
                    Vendedor: {transaction.seller.firstName} {transaction.seller.lastName}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Precio del producto</span>
                  <span>${transaction.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Comisión de comprador (1.5%)</span>
                  <span>${transaction.buyerCommission.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-700 pt-2 flex justify-between text-white text-xl font-bold">
                  <span>Total a Pagar</span>
                  <span>${totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Información de Escrow */}
            <div className="bg-blue-900 bg-opacity-20 border border-blue-600 rounded-xl p-6">
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-blue-200 font-semibold mb-2">Sistema de Escrow</h4>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    Tu dinero estará retenido de forma segura hasta que confirmes que recibiste el producto
                    y verificaste la documentación. Solo entonces se liberará el pago al vendedor.
                  </p>
                </div>
              </div>
            </div>

            {/* Proceso de entrega */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-semibold mb-4">Próximos Pasos</h3>
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <span className="bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
                  <span className="text-slate-300">Completa el pago (el dinero va a escrow)</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-slate-700 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
                  <span className="text-slate-300">Coordina la entrega con el vendedor por chat</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-slate-700 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
                  <span className="text-slate-300">Verifica CLU y DNI del vendedor en persona</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-slate-700 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
                  <span className="text-slate-300">Confirma la entrega para liberar el pago</span>
                </li>
              </ol>
            </div>

            {/* Aviso legal */}
            <div className="bg-amber-900 bg-opacity-20 border border-amber-600 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-200">
                  <p className="font-semibold mb-1">Importante</p>
                  <p>
                    La entrega DEBE ser presencial con verificación de CLU vigente y DNI de ambas partes.
                    El incumplimiento de las regulaciones RENAR puede resultar en sanciones legales.
                  </p>
                </div>
              </div>
            </div>

            {/* Botón de pago */}
            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 text-white py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-lg"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pagar ${totalAmount.toLocaleString()} con Mercado Pago
                </>
              )}
            </button>

            <p className="text-center text-slate-500 text-xs">
              Al completar el pago, aceptas nuestros términos y condiciones
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}