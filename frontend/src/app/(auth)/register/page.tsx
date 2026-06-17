'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../../lib/auth';
import { UserRole } from '../../../types/user.types';
import Logo from '../../../components/logo';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    dni: '',
    clu: '',
    phone: '',
    role: UserRole.BUYER,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.register(formData);
      router.push('/profile/documents');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "input-tactical";
  const labelClass = "block text-[#888888] text-xs tracking-[0.2em] uppercase font-rajdhani mb-2";

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-tactical-grid flex items-center justify-center p-6">

      {/* Líneas decorativas de fondo */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#c9a227]/10 to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#c9a227]/10 to-transparent" />
      </div>

      <div className="w-full max-w-2xl relative">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Logo size="md" />
          <div className="text-right">
            <div className="text-[#888888] font-rajdhani text-sm">¿Ya tenés cuenta?</div>
            <a href="/login" className="text-[#c9a227] font-rajdhani text-sm tracking-wider hover:text-[#e8c547] transition-colors uppercase">
              Iniciar sesión →
            </a>
          </div>
        </div>

        {/* Título */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-[#c9a227]" />
            <span className="text-[#c9a227] text-xs tracking-[0.3em] uppercase font-rajdhani">
              Nuevo operador
            </span>
          </div>
          <h1 className="font-tactical text-4xl text-[#e8e8e8] tracking-wide">
            CREAR CUENTA
          </h1>
        </div>

        {/* Card principal */}
        <div className="border border-[#333333] bg-[#111111] p-8">

          {error && (
            <div className="mb-6 border border-red-800 bg-red-950/30 p-4 flex items-center gap-3">
              <div className="w-1 self-stretch bg-red-500 flex-shrink-0" />
              <p className="text-red-300 font-rajdhani text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={inputClass}
                  placeholder="Juan"
                />
              </div>
              <div>
                <label className={labelClass}>Apellido *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={inputClass}
                  placeholder="Pérez"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
                placeholder="usuario@email.com"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className={labelClass}>Contraseña *</label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={inputClass}
                placeholder="Mín. 8 caracteres, mayúscula, minúscula y número"
              />
            </div>

            {/* DNI y CLU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>DNI *</label>
                <input
                  type="text"
                  required
                  pattern="\d{7,8}"
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  className={inputClass}
                  placeholder="12345678"
                />
              </div>
              <div>
                <label className={labelClass}>CLU *</label>
                <input
                  type="text"
                  required
                  value={formData.clu}
                  onChange={(e) => setFormData({ ...formData, clu: e.target.value })}
                  className={inputClass}
                  placeholder="CLU123456"
                />
              </div>
            </div>

            {/* Teléfono y Tipo de cuenta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Teléfono (opcional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={inputClass}
                  placeholder="+54 11 1234-5678"
                />
              </div>
              <div>
                <label className={labelClass}>Tipo de cuenta *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="input-tactical cursor-pointer"
                >
                  <option value={UserRole.BUYER}>Comprador</option>
                  <option value={UserRole.SELLER}>Vendedor</option>
                </select>
              </div>
            </div>

            {/* Aviso verificación */}
            <div className="border border-[#c9a227]/30 bg-[#c9a227]/5 p-4 flex gap-3">
              <div className="w-1 self-stretch bg-[#c9a227] flex-shrink-0" />
              <p className="text-[#c9a227]/80 font-rajdhani text-sm leading-relaxed">
                Después del registro deberás subir tu DNI y CLU para verificación. 
                Una vez aprobado por un administrador podrás operar en la plataforma.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-tactical w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'PROCESANDO...' : 'CREAR CUENTA'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[#555555] font-rajdhani text-xs">
          Plataforma regulada · ANMAC · Argentina
        </p>
      </div>
    </div>
  );
}