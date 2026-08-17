'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { transactionsService } from '../../../lib/transactions';
import { authService } from '../../../lib/auth';
import { Transaction } from '../../../types/transaction.types';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, Lock, CreditCard } from 'lucide-react';
import Logo from '../../../components/logo';
import toast from 'react-hot-toast';
import api from '../../..//lib/api';

declare global {
  interface Window { MercadoPago: any; }
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [mpReady, setMpReady] = useState(false);
  const mpRef = useRef<any>(null);
  const cardFormRef = useRef<any>(null);

  useEffect(() => {
    if (params.id) loadTransaction(params.id as string);
  }, [params.id]);

  useEffect(() => {
    if (!transaction) return;

    // Cargar SDK de MP
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => initMP();
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [transaction]);

  const initMP = () => {
    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
    if (!publicKey || !window.MercadoPago) return;

    mpRef.current = new window.MercadoPago(publicKey, { locale: 'es-AR' });

    cardFormRef.current = mpRef.current.cardForm({
      amount: String(totalAmount),
      iframe: true,
      form: {
        id: 'form-checkout',
        cardNumber: { id: 'form-checkout__cardNumber', placeholder: 'Número de tarjeta' },
        expirationDate: { id: 'form-checkout__expirationDate', placeholder: 'MM/YY' },
        securityCode: { id: 'form-checkout__securityCode', placeholder: 'CVV' },
        cardholderName: { id: 'form-checkout__cardholderName', placeholder: 'Titular de la tarjeta' },
        issuer: { id: 'form-checkout__issuer' },
        installments: { id: 'form-checkout__installments' },
        identificationType: { id: 'form-checkout__identificationType' },
        identificationNumber: { id: 'form-checkout__identificationNumber', placeholder: 'DNI' },
        cardholderEmail: { id: 'form-checkout__cardholderEmail', placeholder: 'Email' },
      },
      callbacks: {
        onFormMounted: (error: any) => {
          if (error) { console.error('Error montando formulario MP:', error); return; }
          setMpReady(true);
        },
        onSubmit: async (event: any) => {
          event.preventDefault();
          const { paymentMethodId, token, installments, identificationType, identificationNumber } =
            cardFormRef.current.getCardFormData();

          setProcessing(true);
          try {
            const currentUser = authService.getCurrentUser();
            const result = await api.post(`/payments/process/${transaction!.id}`, {
              token,
              paymentMethodId,
              installments: Number(installments),
              buyerEmail: currentUser?.email || '',
              identificationType,
              identificationNumber,
            });

            if (result.data.status === 'approved') {
              toast.success('¡Pago aprobado! El dinero está en escrow.');
              router.push(`/transactions/${transaction!.id}`);
            } else if (result.data.status === 'in_process') {
              toast('Pago en proceso. Te notificaremos cuando se acredite.', { icon: '⏳' });
              router.push('/transactions');
            } else {
              toast.error(`Pago rechazado: ${result.data.statusDetail}`);
            }
          } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al procesar el pago');
          } finally {
            setProcessing(false);
          }
        },
        onError: (errors: any) => {
          console.error('Errores MP:', errors);
        },
      },
    });
  };

  const loadTransaction = async (id: string) => {
    try {
      setLoading(true);
      const data = await transactionsService.getById(id);
      setTransaction(data);
    } catch {
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!transaction) return;
    if (!confirm('¿Cancelar esta compra? El producto volverá a estar disponible.')) return;
    try {
      await transactionsService.cancel(transaction.id, 'Cancelado por el comprador');
      toast.success('Compra cancelada.');
      router.push('/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cancelar');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-2 border-[#333333] border-t-[#c9a227] rounded-full animate-spin" />
    </div>
  );

  if (!transaction) return null;

  const totalAmount = Number(transaction.amount) + Number(transaction.buyerCommission);

  const inputClass = `
    w-full bg-[#1a1a1a] border border-[#333333] text-[#e8e8e8] 
    font-rajdhani text-base px-4 py-3 outline-none 
    focus:border-[#c9a227] transition-colors
    [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0
  `;

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
              <span className="text-[#c9a227] text-xs tracking-[0.3em] uppercase font-rajdhani">Pago seguro</span>
            </div>
            <h1 className="font-tactical text-3xl text-[#e8e8e8] tracking-wide">CHECKOUT</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">

          {/* Panel izquierdo */}
          <div className="lg:col-span-3 space-y-4">

            {/* Producto */}
            <div className="border border-[#333333] bg-[#111111]">
              <div className="px-5 py-3 border-b border-[#333333]">
                <span className="font-tactical text-sm tracking-wider text-[#888888]">PRODUCTO</span>
              </div>
              <div className="p-5 flex gap-4">
                <div className="w-20 h-20 bg-[#1a1a1a] border border-[#333333] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {transaction.product.images?.[0] ? (
                    <img src={transaction.product.images[0]} alt={transaction.product.name} className="w-full h-full object-cover" />
                  ) : <div className="text-2xl opacity-20">🔫</div>}
                </div>
                <div>
                  <h3 className="font-tactical text-lg text-[#e8e8e8] tracking-wide">{transaction.product.name}</h3>
                  <p className="text-[#888888] font-rajdhani text-sm">{transaction.product.brand} · {transaction.product.caliber}</p>
                  <p className="text-[#555555] font-rajdhani text-xs mt-1">
                    Vendedor: <span className="text-[#888888]">{transaction.seller.firstName} {transaction.seller.lastName}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario de pago MP */}
            <div className="border border-[#333333] bg-[#111111]">
              <div className="px-5 py-3 border-b border-[#333333] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#c9a227]" />
                <span className="font-tactical text-sm tracking-wider text-[#888888]">DATOS DE PAGO</span>
              </div>
              <div className="p-5">
                {!mpReady && (
                  <div className="flex items-center gap-3 py-4">
                    <div className="w-5 h-5 border-2 border-[#333333] border-t-[#c9a227] rounded-full animate-spin" />
                    <p className="text-[#888888] font-rajdhani text-sm">Cargando formulario de pago...</p>
                  </div>
                )}

                <form id="form-checkout" className="space-y-4">
                  <div>
                    <label className="block text-[#888888] text-xs tracking-[0.2em] uppercase font-rajdhani mb-2">Número de tarjeta</label>
                    <div id="form-checkout__cardNumber" className={inputClass} style={{ height: '48px' }} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#888888] text-xs tracking-[0.2em] uppercase font-rajdhani mb-2">Vencimiento</label>
                      <div id="form-checkout__expirationDate" className={inputClass} style={{ height: '48px' }} />
                    </div>
                    <div>
                      <label className="block text-[#888888] text-xs tracking-[0.2em] uppercase font-rajdhani mb-2">CVV</label>
                      <div id="form-checkout__securityCode" className={inputClass} style={{ height: '48px' }} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#888888] text-xs tracking-[0.2em] uppercase font-rajdhani mb-2">Titular de la tarjeta</label>
                    <input id="form-checkout__cardholderName" className="input-tactical" placeholder="Como aparece en la tarjeta" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#888888] text-xs tracking-[0.2em] uppercase font-rajdhani mb-2">Tipo de documento</label>
                      <select id="form-checkout__identificationType" className="input-tactical cursor-pointer" />
                    </div>
                    <div>
                      <label className="block text-[#888888] text-xs tracking-[0.2em] uppercase font-rajdhani mb-2">Número de documento</label>
                      <input id="form-checkout__identificationNumber" className="input-tactical" placeholder="12345678" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#888888] text-xs tracking-[0.2em] uppercase font-rajdhani mb-2">Email</label>
                    <input id="form-checkout__cardholderEmail" type="email" className="input-tactical" placeholder="tu@email.com" />
                  </div>

                  <div style={{ display: 'none' }}>
                    <select id="form-checkout__issuer" />
                    <select id="form-checkout__installments" />
                  </div>
                </form>
              </div>
            </div>

            {/* Próximos pasos */}
            <div className="border border-[#333333] bg-[#111111] p-5 space-y-3">
              {steps.map((step, i) => (
                <div key={step.num} className="flex items-start gap-4">
                  <span className={`font-tactical text-sm flex-shrink-0 ${i === 0 ? 'text-[#c9a227]' : 'text-[#333333]'}`}>{step.num}</span>
                  <p className={`font-rajdhani text-sm ${i === 0 ? 'text-[#e8e8e8]' : 'text-[#555555]'}`}>{step.text}</p>
                </div>
              ))}
            </div>

            {/* Aviso RENAR */}
            <div className="border border-red-900/40 bg-red-950/10 p-4 flex gap-3">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-[#888888] font-rajdhani text-xs leading-relaxed">
                Entrega <strong className="text-[#e8e8e8]">presencial obligatoria</strong> con verificación de CLU vigente y DNI. Pago en escrow hasta confirmación.
              </p>
            </div>
          </div>

          {/* Resumen derecha */}
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
                    <span className="text-[#888888]">Comisión (1.5%)</span>
                    <span className="text-[#e8e8e8]">${Number(transaction.buyerCommission).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>

                <div className="border-t border-[#333333] pt-4 flex justify-between items-end">
                  <span className="text-[#888888] font-rajdhani text-xs tracking-wider uppercase">Total</span>
                  <div className="text-right">
                    <div className="font-tactical text-3xl text-[#c9a227]">
                      ${totalAmount.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-[#555555] font-rajdhani text-xs">ARS</div>
                  </div>
                </div>

                {/* Escrow info */}
                <div className="border border-[#c9a227]/20 bg-[#c9a227]/5 p-3 flex gap-2">
                  <CheckCircle className="w-4 h-4 text-[#c9a227] flex-shrink-0 mt-0.5" />
                  <p className="text-[#888888] font-rajdhani text-xs leading-relaxed">
                    Tu dinero queda retenido hasta que confirmes la entrega.
                  </p>
                </div>

                <button
                  type="submit"
                  form="form-checkout"
                  disabled={processing || !mpReady}
                  className="btn-tactical w-full text-center flex items-center justify-center gap-2 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <><div className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />PROCESANDO...</>
                  ) : (
                    <><CreditCard className="w-4 h-4" />PAGAR AHORA</>
                  )}
                </button>

                <button
                  onClick={handleCancel}
                  disabled={processing}
                  className="w-full text-center py-2 text-[#888888] hover:text-red-400 font-rajdhani text-sm tracking-wider uppercase transition-colors disabled:opacity-50"
                >
                  Cancelar compra
                </button>

                <div className="flex items-center justify-center gap-2 text-[#555555]">
                  <Lock className="w-3 h-3" />
                  <span className="font-rajdhani text-xs">Pago seguro · MP Checkout API</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}