'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { transactionsService } from '../../../lib/transactions';
import { authService } from '../../../lib/auth';
import { Transaction } from '../../../types/transaction.types';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, CreditCard, Lock } from 'lucide-react';
import Logo from '../../../components/logo';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (params.id) loadTransaction(params.id as string);
  }, [params.id]);

  const loadTransaction = async (id: string) => {
    try {
      setLoading(true);
      const data = await transactionsService.getById(id);
      setTransaction(data);
    } catch (error) {
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
      const redirectUrl = preference.sandboxInitPoint || preference.initPoint;
      window.location.href = redirectUrl;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al iniciar el pago');
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
  if (!transaction) return;
  if (!confirm('¿Cancelar esta compra? El producto volverá a estar disponible.')) return;

  try {
    await transactionsService.cancel(transaction.id, 'Cancelado por el comprador');
    toast.success('Compra cancelada. El producto está disponible nuevamente.');
    router.push('/products');
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Error al cancelar');
  }
};

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-2 border-[#333333] border-t-[#c9a227] rounded-full animate-spin" />
      <p className="text-[#888888] font-rajdhani tracking-widest text-sm uppercase">Cargando...</p>
    </div>
  );

  if (!transaction) return null;

  const totalAmount = Number(transaction.amount) + Number(transaction.buyerCommission);

  const steps = [
    { num: '01', text: 'Completá el pago (el dinero va a escrow)' },
    { num: '02', text: 'Coordiná la entrega con el vendedor por chat' },
    { num: '03', text: 'Verificá CLU y DNI del vendedor en persona' },
    { num: '04', text: 'Confirmá la entrega para liberar el pago' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Navbar */}
      <nav className="border-b border-[#333333] bg-[#0a0a0a]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push(`/products/${transaction.productId}`)}
            className="flex items-center gap-2 text-[#888888] hover:text-[#c9a227] transition-colors font-rajdhani text-sm tracking-wider uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al producto
          </button>
          <Logo size="sm" />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10 flex items-center gap-5">
          <div className="w-12 h-12 border border-[#c9a227] flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-[#c9a227]" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-4 h-px bg-[#c9a227]" />
              <span className="text-[#c9a227] text-xs tracking-[0.3em] uppercase font-rajdhani">
                Pago seguro
              </span>
            </div>
            <h1 className="font-tactical text-3xl text-[#e8e8e8] tracking-wide">CHECKOUT</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">

          {/* Panel principal - izquierda */}
          <div className="lg:col-span-3 space-y-4">

            {/* Producto */}
            <div className="border border-[#333333] bg-[#111111]">
              <div className="px-5 py-3 border-b border-[#333333]">
                <span className="font-tactical text-sm tracking-wider text-[#888888]">PRODUCTO</span>
              </div>
              <div className="p-5 flex gap-4">
                <div className="w-20 h-20 bg-[#1a1a1a] flex items-center justify-center overflow-hidden flex-shrink-0 border border-[#333333]">
                  {transaction.product.images?.[0] ? (
                    <img src={transaction.product.images[0]} alt={transaction.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-3xl opacity-20">🔫</div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-tactical text-xl text-[#e8e8e8] tracking-wide">{transaction.product.name}</h3>
                  <p className="text-[#888888] font-rajdhani text-sm">{transaction.product.brand} · {transaction.product.caliber}</p>
                  <p className="text-[#555555] font-rajdhani text-xs mt-2">
                    Vendedor: <span className="text-[#888888]">{transaction.seller.firstName} {transaction.seller.lastName}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Próximos pasos */}
            <div className="border border-[#333333] bg-[#111111]">
              <div className="px-5 py-3 border-b border-[#333333]">
                <span className="font-tactical text-sm tracking-wider text-[#888888]">PRÓXIMOS PASOS</span>
              </div>
              <div className="p-5 space-y-4">
                {steps.map((step, i) => (
                  <div key={step.num} className="flex items-start gap-4">
                    <span className={`font-tactical text-sm flex-shrink-0 ${i === 0 ? 'text-[#c9a227]' : 'text-[#333333]'}`}>
                      {step.num}
                    </span>
                    <div className={`w-px self-stretch ${i === 0 ? 'bg-[#c9a227]/30' : 'bg-[#222222]'} mx-1`} />
                    <p className={`font-rajdhani text-sm leading-relaxed ${i === 0 ? 'text-[#e8e8e8]' : 'text-[#555555]'}`}>
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Escrow info */}
            <div className="border border-[#c9a227]/30 bg-[#c9a227]/5 p-5 flex gap-3">
              <CheckCircle className="w-5 h-5 text-[#c9a227] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-tactical text-sm tracking-wider text-[#c9a227] mb-1">SISTEMA ESCROW</p>
                <p className="text-[#888888] font-rajdhani text-sm leading-relaxed">
                  Tu dinero queda retenido de forma segura hasta que confirmes la entrega y verificación del vendedor.
                </p>
              </div>
            </div>

            {/* Aviso ANMAC */}
            <div className="border border-red-900/40 bg-red-950/10 p-5 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-tactical text-sm tracking-wider text-red-400 mb-1">IMPORTANTE · ANMAC</p>
                <p className="text-[#888888] font-rajdhani text-sm leading-relaxed">
                  La entrega <strong className="text-[#e8e8e8]">DEBE</strong> ser presencial con verificación de CLU vigente y DNI de ambas partes.
                </p>
              </div>
            </div>
          </div>

          {/* Resumen - derecha */}
          <div className="lg:col-span-2">
            <div className="border border-[#333333] bg-[#111111] sticky top-24">
              <div className="px-5 py-3 border-b border-[#333333]">
                <span className="font-tactical text-sm tracking-wider text-[#888888]">RESUMEN DE PAGO</span>
              </div>
              <div className="p-5 space-y-4">

                <div className="space-y-3">
                  <div className="flex justify-between font-rajdhani text-sm">
                    <span className="text-[#888888]">Precio del producto</span>
                    <span className="text-[#e8e8e8]">${Number(transaction.amount).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between font-rajdhani text-sm">
                    <span className="text-[#888888]">Comisión comprador (1.5%)</span>
                    <span className="text-[#e8e8e8]">${Number(transaction.buyerCommission).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>

                <div className="border-t border-[#333333] pt-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[#888888] font-rajdhani text-xs tracking-wider uppercase">Total</span>
                    <div className="text-right">
                      <div className="font-tactical text-3xl text-[#c9a227]">
                        ${totalAmount.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-[#555555] font-rajdhani text-xs">ARS</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="btn-tactical w-full text-center flex items-center justify-center gap-2 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
                      REDIRIGIENDO...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      PAGAR CON MERCADO PAGO
                    </>
                  )}
                </button>

                <button
                  onClick={handleCancel}
                  disabled={processing}
                  className="w-full text-center py-3 text-[#888888] hover:text-red-400 font-rajdhani text-sm tracking-wider uppercase transition-colors disabled:opacity-50"
                >
                  Cancelar compra
                </button>

                <div className="flex items-center justify-center gap-2 text-[#555555]">
                  <Lock className="w-3 h-3" />
                  <span className="font-rajdhani text-xs">Pago seguro · SSL encriptado</span>
                </div>

                <p className="text-center text-[#444444] font-rajdhani text-xs">
                  Al pagar aceptás los términos y condiciones de la plataforma
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}