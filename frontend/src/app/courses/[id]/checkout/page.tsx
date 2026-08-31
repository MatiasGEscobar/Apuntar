'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { coursesService, Course } from '../../../../lib/courses';
import { useAuth } from '../../../../context/AuthContext';
import { Shield, CreditCard, Lock, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../../lib/api';
import AppNavbar from '../../../../components/AppNavbar';

declare global {
  interface Window { MercadoPago: any; }
}

export default function CourseCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const userRef = useRef(user);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [mpReady, setMpReady] = useState(false);
  const [participantName, setParticipantName] = useState('');
  const participantNameRef = useRef(''); // evita closure stale en onSubmit de MP
  const mpRef = useRef<any>(null);
  const cardFormRef = useRef<any>(null);
  const [participantDni, setParticipantDni] = useState('');
  const [termsOpen, setTermsOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const participantDniRef = useRef('');
  const acceptedTermsRef = useRef(false);


  useEffect(() => { participantDniRef.current = participantDni; }, [participantDni]);
  useEffect(() => { acceptedTermsRef.current = acceptedTerms; }, [acceptedTerms]);  

  useEffect(() => {
  userRef.current = user; 
}, [user]);

  useEffect(() => {
    participantNameRef.current = participantName;
  }, [participantName]);

  useEffect(() => {
    if (params.id) loadCourse(params.id as string);
  }, [params.id]);

  useEffect(() => {
    if (!course) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => initMP();
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [course]);

  const loadCourse = async (id: string) => {
    try {
      setLoading(true);
      const data = await coursesService.getById(id);
      setCourse(data);
    } catch {
      router.push('/courses');
    } finally {
      setLoading(false);
    }
  };

  const initMP = () => {
    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
    if (!publicKey || !window.MercadoPago || !course) return;

    const amount = course.discountPrice ?? course.price;
    mpRef.current = new window.MercadoPago(publicKey, { locale: 'es-AR' });

    cardFormRef.current = mpRef.current.cardForm({
      amount: String(amount),
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

          if (!userRef.current?.id) {
            toast.error('Tenés que iniciar sesión para inscribirte');
            return;
            }

          if (participantNameRef.current.trim().split(/\s+/).length < 2) {
            toast.error('Ingresá nombre y apellido completos');
            return;
          }

          if (!participantDniRef.current.trim()) {
            toast.error('Ingresá el DNI del participante');
            return;
          }
          if (!acceptedTermsRef.current) {
            toast.error('Tenés que aceptar los términos y condiciones del curso');
            return;
          }

          const { paymentMethodId, token, installments, identificationType, identificationNumber } =
            cardFormRef.current.getCardFormData();

          setProcessing(true);
          try {
            const result = await api.post(`/payments/process-course/${course!.id}`, {
              participantName: participantNameRef.current.trim(),
              participantDni: participantDniRef.current.trim(),
              acceptedTerms: acceptedTermsRef.current,
              token,
              paymentMethodId,
              installments: Number(installments),
              buyerEmail: user?.email || '',
              identificationType,
              identificationNumber,
              userId: userRef.current?.id,
            });

            if (result.data.status === 'approved') {
              toast.success('¡Inscripción confirmada!');
              router.push('/courses');
            } else if (result.data.status === 'in_process') {
              toast('Pago en proceso. Te notificaremos cuando se confirme.', { icon: '⏳' });
              router.push('/courses');
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

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-2 border-[#333333] border-t-[#c9a227] rounded-full animate-spin" />
    </div>
  );

  if (!course) return null;

  const amount = course.discountPrice ?? course.price;
  const inputClass = `
    w-full bg-[#1a1a1a] border border-[#333333] text-[#e8e8e8] 
    font-rajdhani text-base px-4 py-3 outline-none 
    focus:border-[#c9a227] transition-colors
    [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0
  `;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AppNavbar backLabel="Volver a cursos" backHref="/courses" />

      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="mb-10 flex items-center gap-5">
          <div className="w-12 h-12 border border-[#c9a227] flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-[#c9a227]" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-4 h-px bg-[#c9a227]" />
              <span className="text-[#c9a227] text-xs tracking-[0.3em] uppercase font-rajdhani">Inscripción</span>
            </div>
            <h1 className="font-tactical text-3xl text-[#e8e8e8] tracking-wide">CHECKOUT DEL CURSO</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">

          <div className="lg:col-span-3 space-y-4">

            {/* Curso */}
            <div className="border border-[#333333] bg-[#111111]">
              <div className="px-5 py-3 border-b border-[#333333]">
                <span className="font-tactical text-sm tracking-wider text-[#888888]">CURSO</span>
              </div>
              <div className="p-5 flex gap-4">
                <div className="w-20 h-20 bg-[#1a1a1a] border border-[#333333] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {course.image ? (
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  ) : <div className="text-2xl opacity-20">🎯</div>}
                </div>
                <div>
                  <h3 className="font-tactical text-lg text-[#e8e8e8] tracking-wide">{course.title}</h3>
                  <p className="text-[#888888] font-rajdhani text-sm">
                    {new Date(course.startDate).toLocaleDateString('es-AR')} · {course.schedule}
                  </p>
                  {course.location && (
                    <p className="text-[#555555] font-rajdhani text-xs mt-1">{course.location}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Nombre del participante */}
            <div className="border border-[#333333] bg-[#111111]">
              <div className="px-5 py-3 border-b border-[#333333] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#c9a227]" />
                <span className="font-tactical text-sm tracking-wider text-[#888888]">PARTICIPANTE</span>
              </div>
              <div className="p-5">
                <label className="block text-[#888888] text-xs tracking-[0.2em] uppercase font-rajdhani mb-2">
                  Nombre completo del participante *
                </label>
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  className="input-tactical"
                  placeholder="Nombre y apellido de quien asiste"
                />
                <p className="text-[#555555] font-rajdhani text-xs mt-2">
                  Podés inscribir a más de una persona en compras separadas — cada una necesita un nombre distinto.
                </p>
              </div>
            </div>

            {/* Nombre del participante */}
            <div className="border border-[#333333] bg-[#111111]">
              <div className="px-5 py-3 border-b border-[#333333] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#c9a227]" />
                <span className="font-tactical text-sm tracking-wider text-[#888888]">PARTICIPANTE</span>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[#888888] text-xs tracking-[0.2em] uppercase font-rajdhani mb-2">
                    Nombre y apellido del participante *
                  </label>
                  <input
                    type="text"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    className="input-tactical"
                    placeholder="Nombre y apellido de quien asiste"
                  />
                </div>
                <div>
                  <label className="block text-[#888888] text-xs tracking-[0.2em] uppercase font-rajdhani mb-2">
                    DNI del participante *
                  </label>
                  <input
                    type="text"
                    value={participantDni}
                    onChange={(e) => setParticipantDni(e.target.value)}
                    className="input-tactical"
                    placeholder="12345678"
                  />
                </div>
                <p className="text-[#555555] font-rajdhani text-xs">
                  Podés inscribir a más de una persona en compras separadas — cada una necesita un DNI distinto.
                </p>
                            
                {/* Términos y condiciones */}
                <div className="flex items-start gap-3 pt-2 border-t border-[#333333]">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 mt-1 accent-[#c9a227]"
                  />
                  <label htmlFor="acceptTerms" className="text-[#888888] font-rajdhani text-sm">
                    Leí y acepto los{' '}
                    <button
                      type="button"
                      onClick={() => setTermsOpen(true)}
                      className="text-[#c9a227] hover:text-[#e8c547] underline"
                    >
                      términos y condiciones
                    </button>{' '}
                    de este curso *
                  </label>
                </div>
              </div>
            </div>
                            
            {/* Modal de términos */}
            {termsOpen && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-[#111111] border border-[#333333] w-full max-w-2xl max-h-[80vh] flex flex-col">
                  <div className="px-6 py-4 border-b border-[#333333] flex items-center justify-between">
                    <h2 className="font-tactical text-xl text-[#e8e8e8] tracking-wide">
                      TÉRMINOS Y CONDICIONES
                    </h2>
                    <button onClick={() => setTermsOpen(false)} className="text-[#888888] hover:text-[#e8e8e8]">✕</button>
                  </div>
                  <div
                    className="p-6 overflow-y-auto text-[#e8e8e8] font-rajdhani text-sm leading-relaxed prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: course.termsAndConditions || '<p>Este curso no tiene términos y condiciones cargados.</p>',
                    }}
                  />
                  <div className="p-4 border-t border-[#333333]">
                    <button
                      onClick={() => {
                        setAcceptedTerms(true);
                        setTermsOpen(false);
                      }}
                      className="btn-tactical w-full py-3"
                    >
                      LEÍ Y ACEPTO
                    </button>
                  </div>
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
          </div>

          {/* Resumen */}
          <div className="lg:col-span-2">
            <div className="border border-[#333333] bg-[#111111] sticky top-24">
              <div className="px-5 py-3 border-b border-[#333333]">
                <span className="font-tactical text-sm tracking-wider text-[#888888]">RESUMEN</span>
              </div>
              <div className="p-5 space-y-4">
                {course.discountPrice && (
                  <div className="flex justify-between font-rajdhani text-sm">
                    <span className="text-[#888888]">Precio regular</span>
                    <span className="text-[#555555] line-through">
                      ${Number(course.price).toLocaleString('es-AR')}
                    </span>
                  </div>
                )}

                <div className="border-t border-[#333333] pt-4 flex justify-between items-end">
                  <span className="text-[#888888] font-rajdhani text-xs tracking-wider uppercase">Total</span>
                  <div className="text-right">
                    <div className="font-tactical text-3xl text-[#c9a227]">
                      ${Number(amount).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
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
                    <><CreditCard className="w-4 h-4" />CONFIRMAR INSCRIPCIÓN</>
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