'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../../lib/auth';
import { UserRole } from '../../../types/user.types';
import Logo from '../../../components/logo';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authService.login(formData);
      if (response.user.role === UserRole.ADMIN) router.push('/admin/users');
      else if (response.user.role === UserRole.SELLER) router.push('/seller/products');
      else router.push('/products');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-tactical-grid flex">

      {/* Panel izquierdo - decorativo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a]" />

        {/* Líneas decorativas */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-[#c9a227]/20 to-transparent" />
          <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#c9a227]/20 to-transparent" />
        </div>

        {/* Símbolo grande de fondo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <svg width="400" height="400" viewBox="0 0 100 100" fill="none">
            <polygon points="50,5 95,90 80,90 50,28 20,90 5,90" fill="#c9a227" />
            <polygon points="50,35 70,80 60,80 50,58 40,80 30,80" fill="#0a0a0a" />
          </svg>
        </div>

        {/* Contenido */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo size="md" />

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-[#c9a227]" />
              <span className="text-[#c9a227] text-xs tracking-[0.3em] uppercase font-rajdhani">
                Plataforma Segura
              </span>
            </div>
            <h2 className="font-tactical text-5xl text-[#e8e8e8] leading-tight mb-4">
              COMERCIO<br />
              <span className="text-[#c9a227]">LEGAL</span><br />
              DE ARMAS
            </h2>
            <p className="text-[#888888] font-rajdhani text-lg leading-relaxed max-w-sm">
              Plataforma regulada por RENAR. Todas las transacciones 
              verificadas con sistema de escrow seguro.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { num: '100%', label: 'Regulado RENAR' },
              { num: 'Escrow', label: 'Sistema de pago' },
              { num: '3 Roles', label: 'Comprador / Vendedor / Admin' },
            ].map((item) => (
              <div key={item.label} className="border border-[#333333] p-4">
                <div className="font-tactical text-xl text-[#c9a227]">{item.num}</div>
                <div className="text-[#888888] text-xs font-rajdhani mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho - formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="flex justify-center mb-10 lg:hidden">
            <Logo size="lg" />
          </div>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-px bg-[#c9a227]" />
              <span className="text-[#c9a227] text-xs tracking-[0.3em] uppercase font-rajdhani">
                Acceso al sistema
              </span>
            </div>
            <h1 className="font-tactical text-4xl text-[#e8e8e8] tracking-wide">
              INICIAR SESIÓN
            </h1>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 border border-red-800 bg-red-950/30 p-4 flex items-center gap-3">
              <div className="w-1 h-full min-h-[20px] bg-red-500 flex-shrink-0" />
              <p className="text-red-300 font-rajdhani text-sm">{error}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[#888888] text-xs tracking-[0.2em] uppercase font-rajdhani mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-tactical"
                placeholder="usuario@email.com"
              />
            </div>

            <div>
              <label className="block text-[#888888] text-xs tracking-[0.2em] uppercase font-rajdhani mb-2">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-tactical"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-tactical w-full text-center mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'VERIFICANDO...' : 'INGRESAR AL SISTEMA'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-[#333333] flex items-center justify-between">
            <span className="text-[#888888] font-rajdhani text-sm">
              ¿No tenés cuenta?
            </span>
            
            <a  href="/register"
              className="text-[#c9a227] font-rajdhani text-sm tracking-wider hover:text-[#e8c547] transition-colors uppercase"
            >
              Registrarse →
            </a>
          </div>

          <p className="mt-6 text-center text-[#555555] font-rajdhani text-xs">
            Plataforma regulada · RENAR · Argentina
          </p>
        </div>
      </div>
    </div>
  );
}