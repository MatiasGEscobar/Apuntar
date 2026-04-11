'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../../lib/auth';
import { UserRole } from '../../../types/user.types';
import { Shield } from 'lucide-react';

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
      router.push('/products');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="w-16 h-16 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Apuntar</h1>
          <p className="text-slate-400">Crear Cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900 bg-opacity-20 border border-red-600 rounded-lg p-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Nombre
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Apellido
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Contraseña (mín. 8 caracteres, mayúscula, minúscula y número)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                DNI
              </label>
              <input
                type="text"
                required
                pattern="\d{7,8}"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
                placeholder="12345678"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                CLU (Credencial de Legítimo Usuario)
              </label>
              <input
                type="text"
                required
                value={formData.clu}
                onChange={(e) => setFormData({ ...formData, clu: e.target.value })}
                className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
                placeholder="CLU123456"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Teléfono (opcional)
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Tipo de Cuenta
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
            >
              <option value={UserRole.BUYER}>Comprador</option>
              <option value={UserRole.SELLER}>Vendedor</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 text-white py-4 rounded-xl font-semibold transition"
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>

          <p className="text-center text-slate-400 text-sm">
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="text-amber-500 hover:text-amber-400">
              Inicia sesión aquí
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}