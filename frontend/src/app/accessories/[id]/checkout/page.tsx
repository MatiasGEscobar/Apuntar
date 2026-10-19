'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Shield, CreditCard, Lock, Truck, Handshake, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../../lib/api';
import { authService } from '../../../../lib/auth';
import { accessoriesService, Accessory } from '../../../../lib/accessories';
import { useAuth } from '../../../../context/AuthContext';
import { User } from '../../../../types/user.types';
import AppNavbar from '../../../../components/AppNavbar';

declare global {
  interface Window { MercadoPago: any; }
}

type DeliveryMethod = '' | 'shipping' | 'in_person';

const PROVINCIAS = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán',
];

const labelClass = 'block text-[#888888] text-xs tracking-[0.2em] uppercase font-rajdhani mb-2';

export default function AccessoryCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [accessory, setAccessory] = useState<Accessory | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [mpReady, setMpReady] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [result, setResult] = useState<{ orderId: string; status: 'approved' | 'in_process' } | null>(null);
  const [form, setForm] = useState({
    quantity: 1,
    deliveryMethod: '' as DeliveryMethod,
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingProvince: '',
    shippingPostalCode: '',
  });

  // Refs para que el callback de Mercado Pago lea siempre los valores actuales
  const formRef = useRef(form);
  const userRef = useRef(user);
  const accessoryRef = useRef<Accessory | null>(null);
  const mpRef = useRef<any>(null);
  const cardFormRef = useRef<any>(null);

  useEffect(() => { formRef.current = form; }, [form]);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { accessoryRef.current = accessory; }, [accessory]);

  const set = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  // Cargar accesorio
  useEffect(() => {
    const load = async () => {
      try {
        const data = await accessoriesService.getById(params.id as string);
        if (!data.isActive || data.stock <= 0) {
          toast.error('Este accesorio ya no está disponible');
          router.push('/accessories');
          return;
        }
        setAccessory(data);
        setForm((prev) => ({ ...prev, deliveryMethod: data.allowsShipping ? 'shipping' : 'in_person' }));
      } catch {
        router.push('/accessories');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) load();
  }, [params.id]);

  // Si hay sesión, traer el perfil fresco para precargar sus datos
  useEffect(() => {
    if (authLoading || !user) return;
    authService.getProfile()
      .then((p) => {
        setProfile(p);
        setForm((prev) => ({
          ...prev,
          buyerPhone: p.phone || '',
          shippingAddress: p.address || '',
          shippingCity: p.city || '',
          shippingProvince: p.province || '',
          shippingPostalCode: p.postalCode || '',
        }));
      })
      .catch(() => {});
  }, [authLoading, user]);

  // El vendedor no puede comprar su propio accesorio
  useEffect(() => {
    if (user && accessory && user.id === accessory.sellerId) {
      toast.error('No podés comprar tu propio accesorio');
      router.push('/accessories');
    }
  }, [user, accessory]);

  // SDK de Mercado Pago
  useEffect(() => {
    if (!accessory) return;
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => initMP();
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [accessory]);

  const initMP = () => {
    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
    const acc = accessoryRef.current;
    if (!publicKey || !window.MercadoPago || !acc) return;

    mpRef.current = new window.MercadoPago(publicKey, { locale: 'es-AR' });

    cardFormRef.current = mpRef.current.cardForm({
      amount: String(Number(acc.price)),
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

          const f = formRef.current;
          const u = userRef.current;
          const a = accessoryRef.current;
          if (!a) return;

          if (!f.deliveryMethod) { toast.error('Elegí un método de entrega'); return; }
          if (!u && (!f.buyerName.trim() || !f.buyerEmail.trim())) {
            toast.error('Completá tu nombre y email'); return;
          }
          if (!f.buyerPhone.trim()) { toast.error('Ingresá un teléfono de contacto'); return; }
          if (f.deliveryMethod === 'shipping' &&
              (!f.shippingAddress.trim() || !f.shippingCity.trim() || !f.shippingProvince.trim())) {
            toast.error('Completá la dirección de envío'); return;
          }

          const { paymentMethodId, token, installments, identificationType, identificationNumber } =
            cardFormRef.current.getCardFormData();

          setProcessing(true);
          try {
            const res = await api.post(`/payments/process-accessory/${a.id}`, {
              quantity: f.quantity,
              deliveryMethod: f.deliveryMethod,
              buyerName: f.buyerName.trim(),
              buyerEmail: f.buyerEmail.trim(),
              buyerPhone: f.buyerPhone.trim(),
              shippingAddress: f.shippingAddress.trim(),
              shippingCity: f.shippingCity.trim(),
              shippingProvince: f.shippingProvince.trim(),
              shippingPostalCode: f.shippingPostalCode.trim(),
              token,
              paymentMethodId,
              installments: Number(installments) || 1,
              identificationType,
              identificationNumber,
            });

            if (res.data.status === 'approved') {
              setResult({ orderId: res.data.orderId, status: 'approved' });
            } else if (res.data.status === 'in_process') {
              setResult({ orderId: res.data.orderId, status: 'in_process' });
            } else if (res.data.status === 'out_of_stock') {
              toast.error('Se agotó el stock mientras pagabas. Te reembolsamos el pago.');
              router.push('/accessories');
            } else {
              toast.error(`Pago rechazado: ${res.data.statusDetail}`);
            }
          } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al procesar el pago');
          } finally {
            setProcessing(false);
          }
        },
        onError: (errors: any) => console.error('Errores MP:', errors),
      },
    });
  };

  if (loading || authLoading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#333333] border-t-[#c9a227] rounded-full animate-spin" />
    </div>
  );

  if (!accessory) return null;

  // Pantalla de confirmación (sirve también para invitados, que no tienen "mis compras")
  if (result) return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AppNavbar showAuthLinksWhenLoggedOut />
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <div className="w-16 h-16 border border-[#c9a227] flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-[#c9a227]" />
        </div>
        <h1 className="font-tactical text-4xl text-[#e8e8e8] tracking-wide mb-2">
          {result.status === 'approved' ? '¡COMPRA CONFIRMADA!' : 'PAGO EN PROCESO'}
        </h1>
        <p className="text-[#c9a227] font-tactical tracking-wider mb-6">
          ORDEN #{result.orderId.slice(0, 8).toUpperCase()}
        </p>
        <p className="text-[#888888] font-rajdhani leading-relaxed mb-8">
          {result.status === 'approved'
            ? form.deliveryMethod === 'shipping'
              ? 'El vendedor se va a comunicar con vos para coordinar el envío a tu domicilio.'
              : 'El vendedor se va a comunicar con vos para coordinar la entrega en persona.'
            : 'Tu pago está siendo verificado. Cuando se acredite, el vendedor se va a comunicar con vos.'}
        </p>
        <p className="text-[#555555] font-rajdhani text-sm mb-8">
          Guardá el número de orden por cualquier consulta.
        </p>
        <button onClick={() => router.push('/accessories')} className="btn-tactical py-3 px-8">
          SEGUIR COMPRANDO
        </button>
      </div>
    </div>
  );

  const total = Number(accessory.price) * form.quantity;
  const hasProfileAddress = !!(profile?.address && profile?.city && profile?.province);
  const showAddressFields =
    form.deliveryMethod === 'shipping' && (!user || !hasProfileAddress || editAddress);
  const showPhoneField = !user || !profile?.phone;

  const inputClass = `
    w-full bg-[#1a1a1a] border border-[#333333] text-[#e8e8e8]
    font-rajdhani text-base px-4 py-3 outline-none
    focus:border-[#c9a227] transition-colors
    [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0
  `;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AppNavbar backLabel="Volver al accesorio" backHref={`/accessories/${accessory.id}`} showAuthLinksWhenLoggedOut />

      <div className="max-w-5xl mx-auto px-6 py-10">
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

        {!user && (
          <div className="border border-[#c9a227]/20 bg-[#c9a227]/5 p-4 mb-6">
            <p className="text-[#888888] font-rajdhani text-sm">
              Estás comprando como invitado. Si tenés cuenta, <a href="/login" className="text-[#c9a227] hover:text-[#e8c547] underline">iniciá sesión</a> y no vas a tener que cargar tus datos.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">

            {/* Producto + cantidad */}
            <div className="border border-[#333333] bg-[#111111]">
              <div className="px-5 py-3 border-b border-[#333333]">
                <span className="font-tactical text-sm tracking-wider text-[#888888]">ACCESORIO</span>
              </div>
              <div className="p-5 flex gap-4">
                <div className="w-20 h-20 bg-[#1a1a1a] border border-[#333333] overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {accessory.images?.[0]
                    ? <img src={accessory.images[0]} alt={accessory.name} className="w-full h-full object-cover" />
                    : <span className="text-2xl opacity-20">🎒</span>}
                </div>
                <div className="flex-1">
                  <h3 className="font-tactical text-lg text-[#e8e8e8] tracking-wide">{accessory.name}</h3>
                  <p className="text-[#888888] font-rajdhani text-sm">
                    ${Number(accessory.price).toLocaleString('es-AR')} c/u · {accessory.stock} disponibles
                  </p>
                  {accessory.stock > 1 && (
                    <div className="flex items-center gap-3 mt-2">
                      <label className="text-[#555555] font-rajdhani text-xs uppercase tracking-wider">Cantidad</label>
                      <input
                        type="number"
                        min={1}
                        max={accessory.stock}
                        value={form.quantity}
                        onChange={(e) => {
                          const n = Math.max(1, Math.min(accessory.stock, parseInt(e.target.value, 10) || 1));
                          set('quantity', n);
                        }}
                        className="input-tactical w-24"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Método de entrega */}
            <div className="border border-[#333333] bg-[#111111]">
              <div className="px-5 py-3 border-b border-[#333333]">
                <span className="font-tactical text-sm tracking-wider text-[#888888]">MÉTODO DE ENTREGA</span>
              </div>
              <div className="p-5 space-y-3">
                {accessory.allowsShipping && (
                  <label className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                    form.deliveryMethod === 'shipping' ? 'border-[#c9a227] bg-[#c9a227]/5' : 'border-[#333333]'
                  }`}>
                    <input type="radio" name="delivery" checked={form.deliveryMethod === 'shipping'}
                      onChange={() => set('deliveryMethod', 'shipping')} className="accent-[#c9a227]" />
                    <Truck className="w-4 h-4 text-[#c9a227]" />
                    <span className="text-[#e8e8e8] font-rajdhani">Envío a domicilio</span>
                  </label>
                )}
                {accessory.allowsInPerson && (
                  <label className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                    form.deliveryMethod === 'in_person' ? 'border-[#c9a227] bg-[#c9a227]/5' : 'border-[#333333]'
                  }`}>
                    <input type="radio" name="delivery" checked={form.deliveryMethod === 'in_person'}
                      onChange={() => set('deliveryMethod', 'in_person')} className="accent-[#c9a227]" />
                    <Handshake className="w-4 h-4 text-[#c9a227]" />
                    <span className="text-[#e8e8e8] font-rajdhani">
                      Entrega en persona{accessory.city ? ` (${accessory.city})` : ''}
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Datos de contacto y envío */}
            {(!user || showPhoneField || form.deliveryMethod === 'shipping') && (
              <div className="border border-[#333333] bg-[#111111]">
                <div className="px-5 py-3 border-b border-[#333333]">
                  <span className="font-tactical text-sm tracking-wider text-[#888888]">TUS DATOS</span>
                </div>
                <div className="p-5 space-y-4">
                  {!user && (
                    <>
                      <div>
                        <label className={labelClass}>Nombre y apellido *</label>
                        <input type="text" value={form.buyerName} onChange={(e) => set('buyerName', e.target.value)}
                          className="input-tactical" placeholder="Juan Pérez" />
                      </div>
                      <div>
                        <label className={labelClass}>Email *</label>
                        <input type="email" value={form.buyerEmail} onChange={(e) => set('buyerEmail', e.target.value)}
                          className="input-tactical" placeholder="tu@email.com" />
                      </div>
                    </>
                  )}

                  {showPhoneField && (
                    <div>
                      <label className={labelClass}>Teléfono de contacto *</label>
                      <input type="tel" value={form.buyerPhone} onChange={(e) => set('buyerPhone', e.target.value)}
                        className="input-tactical" placeholder="+54 362 123-4567" />
                    </div>
                  )}

                  {form.deliveryMethod === 'shipping' && user && hasProfileAddress && !editAddress && (
                    <div className="flex items-start justify-between gap-4 border border-[#333333] bg-[#1a1a1a] p-3">
                      <div>
                        <p className="text-[#555555] font-rajdhani text-xs uppercase tracking-wider mb-1">Enviar a</p>
                        <p className="text-[#e8e8e8] font-rajdhani text-sm">
                          {profile?.address}, {profile?.city}, {profile?.province}
                          {profile?.postalCode ? ` (${profile.postalCode})` : ''}
                        </p>
                      </div>
                      <button type="button" onClick={() => setEditAddress(true)}
                        className="text-[#c9a227] hover:text-[#e8c547] font-rajdhani text-xs uppercase tracking-wider flex-shrink-0">
                        Cambiar
                      </button>
                    </div>
                  )}

                  {showAddressFields && (
                    <>
                      <div>
                        <label className={labelClass}>Dirección (calle y número) *</label>
                        <input type="text" value={form.shippingAddress} onChange={(e) => set('shippingAddress', e.target.value)}
                          className="input-tactical" placeholder="Av. Sarmiento 1234" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Ciudad *</label>
                          <input type="text" value={form.shippingCity} onChange={(e) => set('shippingCity', e.target.value)}
                            className="input-tactical" placeholder="Resistencia" />
                        </div>
                        <div>
                          <label className={labelClass}>Provincia *</label>
                          <select value={form.shippingProvince} onChange={(e) => set('shippingProvince', e.target.value)}
                            className="input-tactical cursor-pointer">
                            <option value="">Seleccionar...</option>
                            {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Código postal</label>
                        <input type="text" value={form.shippingPostalCode} onChange={(e) => set('shippingPostalCode', e.target.value)}
                          className="input-tactical" placeholder="3500" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

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
                    <label className={labelClass}>Número de tarjeta</label>
                    <div id="form-checkout__cardNumber" className={inputClass} style={{ height: '48px' }} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Vencimiento</label>
                      <div id="form-checkout__expirationDate" className={inputClass} style={{ height: '48px' }} />
                    </div>
                    <div>
                      <label className={labelClass}>CVV</label>
                      <div id="form-checkout__securityCode" className={inputClass} style={{ height: '48px' }} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Titular de la tarjeta</label>
                    <input id="form-checkout__cardholderName" className="input-tactical" placeholder="Como aparece en la tarjeta" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Tipo de documento</label>
                      <select id="form-checkout__identificationType" className="input-tactical cursor-pointer" />
                    </div>
                    <div>
                      <label className={labelClass}>Número de documento</label>
                      <input id="form-checkout__identificationNumber" className="input-tactical" placeholder="12345678" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input id="form-checkout__cardholderEmail" type="email" className="input-tactical" placeholder="tu@email.com" />
                  </div>
                  <div style={{ display: 'none' }}>
                    <select id="form-checkout__issuer" />
                    <select id="form-checkout__installments" />
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-2">
            <div className="border border-[#333333] bg-[#111111] sticky top-24">
              <div className="px-5 py-3 border-b border-[#333333]">
                <span className="font-tactical text-sm tracking-wider text-[#888888]">RESUMEN</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between font-rajdhani text-sm">
                  <span className="text-[#888888]">{accessory.name} × {form.quantity}</span>
                  <span className="text-[#e8e8e8]">${total.toLocaleString('es-AR')}</span>
                </div>

                <div className="border-t border-[#333333] pt-4 flex justify-between items-end">
                  <span className="text-[#888888] font-rajdhani text-xs tracking-wider uppercase">Total</span>
                  <div className="text-right">
                    <div className="font-tactical text-3xl text-[#c9a227]">
                      ${total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-[#555555] font-rajdhani text-xs">ARS</div>
                  </div>
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