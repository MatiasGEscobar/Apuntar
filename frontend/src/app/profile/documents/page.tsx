'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../../lib/auth';
import ImageUpload from '../../../components/upload/ImageUpload';
import { Shield, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import api from '../../../lib/api';
import { UserStatus } from '../../../types/user.types';

export default function DocumentsUploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [dniImages, setDniImages] = useState<string[]>([]);
  const [cluImages, setCluImages] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    // Si ya tiene documentos subidos, mostrarlos
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
      alert('Debes subir el DNI (frente y reverso)');
      setLoading(false);
      return;
    }

    if (cluImages.length !== 2) {
      alert('Debes subir el CLU (frente y reverso)');
      setLoading(false);
      return;
    }

    try {
      // Actualizar usuario con las URLs de los documentos
      await api.patch(`/users/${currentUser?.id}`, {
        dniFrontUrl: dniImages[0],
        dniBackUrl: dniImages[1],
        cluFrontUrl: cluImages[0],
        cluBackUrl: cluImages[1],
      });

      alert('Documentos subidos exitosamente. Tu cuenta será revisada por un administrador.');
      
      // Actualizar usuario en localStorage
      const updatedUser = {
        ...currentUser,
        dniFrontUrl: dniImages[0],
        dniBackUrl: dniImages[1],
        cluFrontUrl: cluImages[0],
        cluBackUrl: cluImages[1],
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      router.push('/products');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al subir documentos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBanner = () => {
    if (!currentUser) return null;

    switch (currentUser.status) {
      case UserStatus.PENDING:
        return (
          <div className="bg-yellow-900 bg-opacity-20 border border-yellow-600 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-yellow-500" />
              <div>
                <p className="text-yellow-200 font-semibold">Pendiente de Verificación</p>
                <p className="text-yellow-200 text-sm">
                  {currentUser.dniFrontUrl && currentUser.cluFrontUrl
                    ? 'Tus documentos están siendo revisados.'
                    : 'Sube tus documentos para que un administrador revise tu cuenta.'}
                </p>
              </div>
            </div>
          </div>
        );
      case UserStatus.APPROVED:
        return (
          <div className="bg-green-900 bg-opacity-20 border border-green-600 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-green-200 font-semibold">¡Cuenta Verificada!</p>
                <p className="text-green-200 text-sm">Tu cuenta ha sido aprobada. Ya puedes comprar y vender.</p>
              </div>
            </div>
          </div>
        );
      case UserStatus.REJECTED:
        return (
          <div className="bg-red-900 bg-opacity-20 border border-red-600 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-500" />
              <div>
                <p className="text-red-200 font-semibold">Cuenta Rechazada</p>
                <p className="text-red-200 text-sm">
                  {currentUser.rejectionReason || 'Tu cuenta fue rechazada. Sube nuevos documentos para reintentar.'}
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">ArmaLegal.ar</h1>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/products')}
                className="text-slate-400 hover:text-white transition"
              >
                Ver Catálogo
              </button>
              <button
                onClick={() => authService.logout()}
                className="text-slate-400 hover:text-white transition"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Verificación de Identidad</h1>
            <p className="text-slate-400">Sube tus documentos para completar tu registro</p>
          </div>

          {getStatusBanner()}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Upload DNI */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                DNI (Frente y Reverso) *
              </label>
              <ImageUpload
                onImagesChange={setDniImages}
                maxImages={2}
                currentImages={dniImages}
                folder="documents"
              />
              <p className="text-slate-500 text-xs mt-2">
                📄 Sube 2 imágenes claras: frente y reverso de tu DNI
              </p>
            </div>

            {/* Upload CLU */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                CLU - Credencial de Legítimo Usuario (Frente y Reverso) *
              </label>
              <ImageUpload
                onImagesChange={setCluImages}
                maxImages={2}
                currentImages={cluImages}
                folder="documents"
              />
              <p className="text-slate-500 text-xs mt-2">
                📄 Sube 2 imágenes claras: frente y reverso de tu CLU vigente
              </p>
            </div>

            {/* Aviso legal */}
            <div className="bg-blue-900 bg-opacity-20 border border-blue-600 rounded-xl p-4">
              <div className="flex gap-3">
                <Upload className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-200">
                  <p className="font-semibold mb-1">Proceso de Verificación</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Sube imágenes claras de tu DNI y CLU</li>
                    <li>Un administrador revisará tus documentos</li>
                    <li>Recibirás una notificación con el resultado</li>
                    <li>Una vez aprobado, podrás comprar y vender</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push('/products')}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-xl font-semibold transition"
              >
                {currentUser?.dniFrontUrl ? 'Volver al Catálogo' : 'Hacer Después'}
              </button>
              <button
                type="submit"
                disabled={loading || dniImages.length !== 2 || cluImages.length !== 2}
                className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 text-white py-4 rounded-xl font-semibold transition"
              >
                {loading ? 'Subiendo...' : currentUser?.dniFrontUrl ? 'Actualizar Documentos' : 'Enviar Documentos'}
              </button>
            </div>

            {/* Ayuda */}
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-300 text-sm mb-2">💡 <strong>Consejos para una aprobación rápida:</strong></p>
              <ul className="text-slate-400 text-xs space-y-1 ml-4">
                <li>• Asegúrate de que las imágenes sean claras y legibles</li>
                <li>• El CLU debe estar vigente (no vencido)</li>
                <li>• Las fotos deben mostrar el documento completo</li>
                <li>• Evita reflejos, sombras o imágenes borrosas</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}