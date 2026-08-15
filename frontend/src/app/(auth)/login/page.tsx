'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../../lib/auth';
import { UserRole } from '../../../types/user.types';
import Logo from '../../../components/logo';
import Image from 'next/image';

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
  <Image
    src="/images/logo.png"
    alt=""
    width={521}
    height={479}
    style={{ width: 'auto', height: 'auto' }}
    className="object-contain"
    priority
  />
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
              Plataforma regulada por ANMAC. Todas las transacciones 
              verificadas con sistema de escrow seguro.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { num: '100%', label: 'Regulado ANMAC' },
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

          {/* Separador */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-[#333333]" />
              <span className="text-[#555555] font-rajdhani text-xs tracking-wider uppercase">o</span>
              <div className="flex-1 h-px bg-[#333333]" />
            </div>
            
          {/* Botón Google */}
            <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/api/auth/google`}
            className="w-full flex items-center justify-center gap-3 border border-[#333333] bg-[#111111] hover:border-[#c9a227] text-[#e8e8e8] py-3 transition-colors font-rajdhani text-sm tracking-wider uppercase"
            >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </a>


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
            Plataforma regulada · ANMAC · Argentina
          </p>
        </div>
      </div>
    </div>
  );
}