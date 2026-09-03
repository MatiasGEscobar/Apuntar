'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../../lib/auth';
import ImageUpload from '../../../components/upload/ImageUpload';
import { Upload, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import api from '../../../lib/api';
import { UserStatus } from '../../../types/user.types';
import toast from 'react-hot-toast';
import AppNavbar from '../../../components/AppNavbar';

export default function DocumentsUploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentUser] = useState(authService.getCurrentUser());
  const [dniImages, setDniImages] = useState<string[]>([]);
  const [cluImages, setCluImages] = useState<string[]>([]);
  const [cluExpirationDate, setCluExpirationDate] = useState(
  currentUser?.cluExpirationDate?.slice(0, 10) || ''
  );

  useEffect(() => {
    if (!currentUser) { router.push('/login'); return; }
    if (currentUser.dniFrontUrl && currentUser.dniBackUrl) {
      setDniImages([currentUser.dniFrontUrl, currentUser.dniBackUrl]);
    }
    if (currentUser.cluFrontUrl && currentUser.cluBackUrl) {
      setCluImages([currentUser.cluFrontUrl, currentUser.cluBackUrl]);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (dniImages.length !== 2) {
      toast('Debés subir el DNI (frente y reverso)');
      setLoading(false);
      return;
    }
    if (cluImages.length !== 2) {
      toast('Debés subir el CLU (frente y reverso)');
      setLoading(false);
      return;
    }
    if (!cluExpirationDate) {
      toast('Ingresá la fecha de vencimiento de tu CLU');
      setLoading(false);
      return;
    }
    try {
      const response = await api.patch(`/users/${currentUser?.id}/documents`, {
        dniFrontUrl: dniImages[0],
        dniBackUrl: dniImages[1],
        cluFrontUrl: cluImages[0],
        cluBackUrl: cluImages[1],
        cluExpirationDate,
      });
      if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(response.data));
      toast('Documentos enviados. Tu cuenta será revisada por un administrador.');
      router.push('/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al subir documentos');
    } finally {
      setLoading(false);
    }
  };

  const statusBanner = () => {
    if (!currentUser) return null;
    const config = {
      [UserStatus.PENDING]: {
        icon: <Clock className="w-5 h-5 text-yellow-400" />,
        title: 'PENDIENTE DE VERIFICACIÓN',
        msg: currentUser.dniFrontUrl && currentUser.cluFrontUrl
          ? 'Tus documentos están siendo revisados por un administrador.'
          : 'Subí tus documentos para que un administrador revise tu cuenta.',
        color: 'text-yellow-400',
        bg: 'border-yellow-900/40 bg-yellow-950/10',
      },
      [UserStatus.APPROVED]: {
        icon: <CheckCircle className="w-5 h-5 text-green-400" />,
        title: '¡CUENTA VERIFICADA!',
        msg: 'Tu cuenta fue aprobada. Ya podés comprar y vender.',
        color: 'text-green-400',
        bg: 'border-green-900/40 bg-green-950/10',
      },
      [UserStatus.REJECTED]: {
        icon: <XCircle className="w-5 h-5 text-red-400" />,
        title: 'CUENTA RECHAZADA',
        msg: currentUser.rejectionReason || 'Tu cuenta fue rechazada. Subí nuevos documentos para reintentar.',
        color: 'text-red-400',
        bg: 'border-red-900/40 bg-red-950/10',
      },
      [UserStatus.IN_REVIEW]: {
        icon: <Clock className="w-5 h-5 text-blue-400" />,
        title: 'EN REVISIÓN',
        msg: 'Un administrador está revisando tus documentos.',
        color: 'text-blue-400',
        bg: 'border-blue-900/40 bg-blue-950/10',
      },
      [UserStatus.SUSPENDED]: {
        icon: <XCircle className="w-5 h-5 text-[#888888]" />,
        title: 'CUENTA SUSPENDIDA',
        msg: 'Tu cuenta fue suspendida. Contactá al administrador.',
        color: 'text-[#888888]',
        bg: 'border-[#333333] bg-[#1a1a1a]',
      },
    };
    const s = config[currentUser.status];
    if (!s) return null;
    return (
      <div className={`border p-4 flex gap-3 mb-8 ${s.bg}`}>
        <div className="flex-shrink-0 mt-0.5">{s.icon}</div>
        <div>
          <p className={`font-tactical text-sm tracking-wider mb-1 ${s.color}`}>{s.title}</p>
          <p className="text-[#888888] font-rajdhani text-sm">{s.msg}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Navbar */}
      <AppNavbar backLabel="Ver catálogo" backHref="/products" />

      {/* Header */}
      <div className="border-b border-[#333333] bg-[#111111]">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-px bg-[#c9a227]" />
            <span className="text-[#c9a227] text-xs tracking-[0.3em] uppercase font-rajdhani">
              Verificación de identidad
            </span>
          </div>
          <h1 className="font-tactical text-5xl text-[#e8e8e8] tracking-wide">DOCUMENTACIÓN</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {statusBanner()}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* DNI */}
          <div className="border border-[#333333] bg-[#111111] p-6">
            <div className="flex items-center gap-3 mb-5">
              <FileText className="w-4 h-4 text-[#c9a227]" />
              <h3 className="font-tactical text-lg tracking-wider text-[#c9a227]">DNI</h3>
              <span className="text-[#555555] font-rajdhani text-xs uppercase tracking-wider">Frente y reverso · 2 imágenes</span>
            </div>
            <ImageUpload
              onImagesChange={setDniImages}
              maxImages={2}
              currentImages={dniImages}
              folder="documents"
            />
            <p className="text-[#555555] font-rajdhani text-xs mt-3 tracking-wide">
              Asegurate de que las imágenes sean claras, sin reflejos ni sombras
            </p>
          </div>

          {/* CLU */}
          <div className="border border-[#333333] bg-[#111111] p-6">
            <div className="flex items-center gap-3 mb-5">
              <FileText className="w-4 h-4 text-[#c9a227]" />
              <h3 className="font-tactical text-lg tracking-wider text-[#c9a227]">CLU</h3>
              <span className="text-[#555555] font-rajdhani text-xs uppercase tracking-wider">Credencial Legítimo Usuario · 2 imágenes</span>
            </div>
            <ImageUpload
              onImagesChange={setCluImages}
              maxImages={2}
              currentImages={cluImages}
              folder="documents"
            />
            <div className="mt-4">
              <label className="block text-[#888888] text-xs tracking-[0.2em] uppercase font-rajdhani mb-2">
                Fecha de vencimiento del CLU *
              </label>
              <input
                type="date"
                required
                value={cluExpirationDate}
                onChange={(e) => setCluExpirationDate(e.target.value)}
                className="input-tactical"
              />
              </div>
            <p className="text-[#555555] font-rajdhani text-xs mt-3 tracking-wide">
              El CLU debe estar vigente. Subí frente y reverso
            </p>
          </div>

          {/* Proceso */}
          <div className="border border-[#c9a227]/20 bg-[#c9a227]/5 p-5 flex gap-3">
            <Upload className="w-4 h-4 text-[#c9a227] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-tactical text-sm tracking-wider text-[#c9a227] mb-3">PROCESO DE VERIFICACIÓN</p>
              <div className="space-y-2">
                {[
                  '01 · Subí imágenes claras de tu DNI y CLU',
                  '02 · Un administrador revisará tus documentos',
                  '03 · Recibirás una notificación con el resultado',
                  '04 · Una vez aprobado podrás comprar y vender',
                ].map((step) => (
                  <p key={step} className="text-[#888888] font-rajdhani text-sm">{step}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Consejos */}
          <div className="border border-[#333333] bg-[#111111] p-5">
            <p className="font-tactical text-sm tracking-wider text-[#888888] mb-3">CONSEJOS PARA APROBACIÓN RÁPIDA</p>
            <div className="space-y-1.5">
              {[
                'Imágenes claras y completamente legibles',
                'CLU vigente, sin vencer',
                'Documento completo visible en la foto',
                'Sin reflejos, sombras ni imágenes borrosas',
              ].map((tip) => (
                <div key={tip} className="flex items-center gap-3">
                  <div className="w-1 h-1 bg-[#c9a227] rounded-full flex-shrink-0" />
                  <p className="text-[#555555] font-rajdhani text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/products')}
              className="btn-tactical-outline flex-1 py-4"
            >
              {currentUser?.dniFrontUrl ? 'VOLVER AL CATÁLOGO' : 'HACER DESPUÉS'}
            </button>
            <button
              type="submit"
              disabled={loading || dniImages.length !== 2 || cluImages.length !== 2}
              className="btn-tactical flex-1 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'ENVIANDO...' : currentUser?.dniFrontUrl ? 'ACTUALIZAR DOCUMENTOS' : 'ENVIAR DOCUMENTOS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}