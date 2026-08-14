'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usersService } from '../../../lib/users';
import { authService } from '../../../lib/auth';
import { User, UserStatus, UserRole } from '../../../types/user.types';
import { Check, X, Plus, LogOut, Users, Package } from 'lucide-react';
import Logo from '../../../components/logo';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== UserRole.ADMIN) { router.push('/login'); return; }
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
  try {
    await usersService.approve(id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: UserStatus.APPROVED } : u));
    toast.success('Usuario aprobado');
  } catch (error) {
    toast.error('Error al aprobar usuario');
  }
};

  const handleReject = async (id: string) => {
  const reason = prompt('Motivo del rechazo:');
  if (!reason) return;
  try {
    await usersService.reject(id, reason);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: UserStatus.REJECTED, rejectionReason: reason } : u));
    toast.success('Usuario rechazado');
  } catch (error) {
    toast.error('Error al rechazar usuario');
  }
};

  const statusConfig: Record<UserStatus, { label: string; color: string; bg: string }> = {
    [UserStatus.PENDING]:   { label: 'PENDIENTE',   color: 'text-yellow-400', bg: 'border-yellow-900/40 bg-yellow-950/10' },
    [UserStatus.IN_REVIEW]: { label: 'EN REVISIÓN', color: 'text-blue-400',   bg: 'border-blue-900/40 bg-blue-950/10' },
    [UserStatus.APPROVED]:  { label: 'APROBADO',    color: 'text-green-400',  bg: 'border-green-900/40 bg-green-950/10' },
    [UserStatus.REJECTED]:  { label: 'RECHAZADO',   color: 'text-red-400',    bg: 'border-red-900/40 bg-red-950/10' },
    [UserStatus.SUSPENDED]: { label: 'SUSPENDIDO',  color: 'text-[#888888]',  bg: 'border-[#333333] bg-[#1a1a1a]' },
  };

  const roleConfig: Record<string, { label: string }> = {
    [UserRole.BUYER]:  { label: 'COMPRADOR' },
    [UserRole.SELLER]: { label: 'VENDEDOR' },
    [UserRole.ADMIN]:  { label: 'ADMIN' },
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-2 border-[#333333] border-t-[#c9a227] rounded-full animate-spin" />
      <p className="text-[#888888] font-rajdhani tracking-widest text-sm uppercase">Cargando operadores...</p>
    </div>
  );

  const pendingCount = users.filter(u => u.status === UserStatus.PENDING).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Navbar */}
      <nav className="border-b border-[#333333] bg-[#0a0a0a]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo size="sm" />
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => router.push('/admin/users')}
                className="flex items-center gap-2 px-4 py-2 font-tactical text-sm tracking-wider text-[#c9a227] border-b border-[#c9a227]"
              >
                <Users className="w-4 h-4" />
                USUARIOS
                {pendingCount > 0 && (
                  <span className="bg-[#c9a227] text-[#0a0a0a] text-xs font-rajdhani px-1.5 py-0.5 font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => router.push('/admin/products')}
                className="flex items-center gap-2 px-4 py-2 font-tactical text-sm tracking-wider text-[#888888] hover:text-[#c9a227] transition-colors"
              >
                <Package className="w-4 h-4" />
                PRODUCTOS
              </button>
            </div>
          </div>
          <button
  onClick={() => router.push('/admin/courses')}
  className="flex items-center gap-2 px-4 py-2 font-tactical text-sm tracking-wider text-[#888888] hover:text-[#c9a227] transition-colors"
>
  <Plus className="w-4 h-4" />
  CURSOS
</button>
          <button
            onClick={() => authService.logout()}
            className="flex items-center gap-2 text-[#888888] hover:text-red-400 transition-colors font-rajdhani text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:block">SALIR</span>
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="border-b border-[#333333] bg-[#111111]">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-px bg-[#c9a227]" />
            <span className="text-[#c9a227] text-xs tracking-[0.3em] uppercase font-rajdhani">
              Panel de control
            </span>
          </div>
          <div className="flex items-end justify-between">
            <h1 className="font-tactical text-5xl text-[#e8e8e8] tracking-wide">
              GESTIÓN DE USUARIOS
            </h1>
            <div className="text-right hidden md:block">
              <div className="font-tactical text-3xl text-[#c9a227]">{pendingCount}</div>
              <div className="text-[#888888] font-rajdhani text-xs uppercase tracking-wider">Pendientes</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 border border-[#333333]">
            <Users className="w-12 h-12 text-[#333333]" />
            <p className="text-[#888888] font-rajdhani tracking-widest text-sm uppercase">No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => {
              const status = statusConfig[user.status];
              const role = roleConfig[user.role] || { label: user.role.toUpperCase() };
              return (
                <div key={user.id} className="border border-[#333333] bg-[#111111] hover:border-[#c9a227]/30 transition-colors">
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-6">

                      {/* Info usuario */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-tactical text-xl text-[#e8e8e8] tracking-wide">
                            {user.firstName} {user.lastName}
                          </h3>
                          <span className={`font-tactical text-xs px-3 py-1 border ${status.color} ${status.bg}`}>
                            {status.label}
                          </span>
                          <span className="font-tactical text-xs px-3 py-1 border border-[#333333] text-[#888888]">
                            {role.label}
                          </span>
                        </div>

                        <p className="text-[#888888] font-rajdhani text-sm mb-4">{user.email}</p>

                        {/* DNI y CLU */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          {[
                            { label: 'DNI', value: user.dni },
                            { label: 'CLU', value: user.clu },
                          ].map((item) => (
                            <div key={item.label} className="bg-[#1a1a1a] border border-[#333333] p-3">
                              <p className="text-[#555555] font-rajdhani text-xs tracking-[0.2em] uppercase mb-1">{item.label}</p>
                              <p className="text-[#e8e8e8] font-rajdhani font-semibold text-sm">{item.value || '—'}</p>
                            </div>
                          ))}
                        </div>

                        {/* Documentos */}
                        {user.dniFrontUrl && (
                          <div className="flex flex-wrap gap-3 mb-4">
                            {[
                              { label: 'DNI Frente', url: user.dniFrontUrl },
                              { label: 'DNI Reverso', url: user.dniBackUrl },
                              { label: 'CLU Frente', url: user.cluFrontUrl },
                              { label: 'CLU Reverso', url: user.cluBackUrl },
                            ].filter(d => d.url).map((doc) => (
                              <a
                                key={doc.label}
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-tactical-outline text-xs py-1.5 px-3"
                              >
                                {doc.label} →
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Motivo rechazo */}
                        {user.rejectionReason && (
                          <div className="border border-red-900/40 bg-red-950/10 p-3">
                            <p className="text-red-300 font-rajdhani text-sm">
                              <span className="text-red-400 font-semibold">Motivo: </span>
                              {user.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      {user.status === UserStatus.PENDING && (
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="flex items-center gap-2 border border-green-700 bg-green-950/20 text-green-400 font-tactical text-xs tracking-wider px-4 py-2.5 hover:bg-green-950/40 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            APROBAR
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
                            className="flex items-center gap-2 border border-red-900 bg-red-950/20 text-red-400 font-tactical text-xs tracking-wider px-4 py-2.5 hover:bg-red-950/40 transition-colors"
                          >
                            <X className="w-3 h-3" />
                            RECHAZAR
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}