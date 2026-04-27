'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usersService } from '../../../lib/users';
import { authService } from '../../../lib/auth';
import { User, UserStatus, UserRole } from '../../../types/user.types';
import { Check, X, Shield, AlertTriangle } from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== UserRole.ADMIN) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);
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
      await loadUsers();
    } catch (error) {
      console.error('Error aprobando usuario:', error);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;

    try {
      await usersService.reject(id, reason);
      await loadUsers();
    } catch (error) {
      console.error('Error rechazando usuario:', error);
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    const styles = {
      [UserStatus.PENDING]: 'bg-yellow-600',
      [UserStatus.IN_REVIEW]: 'bg-blue-600',
      [UserStatus.APPROVED]: 'bg-green-600',
      [UserStatus.REJECTED]: 'bg-red-600',
      [UserStatus.SUSPENDED]: 'bg-gray-600',
    };

    const labels = {
      [UserStatus.PENDING]: 'Pendiente',
      [UserStatus.IN_REVIEW]: 'En Revisión',
      [UserStatus.APPROVED]: 'Aprobado',
      [UserStatus.REJECTED]: 'Rechazado',
      [UserStatus.SUSPENDED]: 'Suspendido',
    };

    return (
      <span className={`${styles[status]} text-white text-xs px-3 py-1 rounded-full`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-amber-500" />
              <span className="text-xl font-bold text-white">Panel de Administración</span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/admin/products')}
                className="text-slate-400 hover:text-white transition"
              >
                Productos
              </button>
              <button
                onClick={() => router.push('/admin/users')}
                className="text-white border-b-2 border-amber-500"
              >
                Usuarios
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

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Gestión de Usuarios</h1>

        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {user.firstName} {user.lastName}
                    </h3>
                    {getStatusBadge(user.status)}
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-600 text-white">
                      {user.role === UserRole.BUYER ? 'Comprador' : 
                       user.role === UserRole.SELLER ? 'Vendedor' : 'Admin'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-3">{user.email}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-900 rounded-lg p-3">
                      <p className="text-slate-400 text-xs mb-1">DNI</p>
                      <p className="text-white font-semibold text-sm">{user.dni}</p>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-3">
                      <p className="text-slate-400 text-xs mb-1">CLU</p>
                      <p className="text-white font-semibold text-sm">{user.clu}</p>
                    </div>
                  </div>
                  {user.dniFrontUrl && (
                    <div className="mt-4">
                      <p className="text-slate-400 text-sm mb-2">Documentos:</p>
                      <div className="grid grid-cols-2 gap-2">
                        
                        <a  href={user.dniFrontUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 underline"
                        >
                          Ver DNI Frente
                        </a>
                        
                        <a  href={user.dniBackUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 underline"
                        >
                          Ver DNI Reverso
                        </a>
                        
                        <a  href={user.cluFrontUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 underline"
                        >
                          Ver CLU Frente
                        </a>
                        
                        <a  href={user.cluBackUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 underline"
                        >
                          Ver CLU Reverso
                        </a>
                      </div>
                    </div>
                  )}

                  {user.rejectionReason && (
                    <div className="bg-red-900 bg-opacity-20 border border-red-600 rounded-lg p-3 mb-4">
                      <p className="text-red-200 text-sm">
                        <strong>Motivo:</strong> {user.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>

                {user.status === UserStatus.PENDING && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(user.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleReject(user.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">No hay usuarios registrados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

