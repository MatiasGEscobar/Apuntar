'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productsService } from '../../../lib/products';
import { authService } from '../../../lib/auth';
import { Product, ProductStatus } from '../../../types/product.types';
import { User, UserRole } from '../../../types/user.types';
import { Check, X, Shield, Eye } from 'lucide-react';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== UserRole.ADMIN) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);
    loadProducts();
  }, [filter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsService.getAll({
        status: filter !== 'all' ? filter : undefined,
      });
      setProducts(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await productsService.approve(id);
      await loadProducts();
    } catch (error) {
      console.error('Error aprobando producto:', error);
      alert('Error al aprobar producto');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;

    try {
      await productsService.reject(id, reason);
      await loadProducts();
    } catch (error) {
      console.error('Error rechazando producto:', error);
      alert('Error al rechazar producto');
    }
  };

  const getStatusBadge = (status: ProductStatus) => {
    const styles = {
      [ProductStatus.PENDING]: 'bg-yellow-600',
      [ProductStatus.APPROVED]: 'bg-green-600',
      [ProductStatus.REJECTED]: 'bg-red-600',
      [ProductStatus.SOLD]: 'bg-blue-600',
      [ProductStatus.RESERVED]: 'bg-purple-600',
    };

    const labels = {
      [ProductStatus.PENDING]: 'Pendiente',
      [ProductStatus.APPROVED]: 'Aprobado',
      [ProductStatus.REJECTED]: 'Rechazado',
      [ProductStatus.SOLD]: 'Vendido',
      [ProductStatus.RESERVED]: 'Reservado',
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
                className="text-white border-b-2 border-amber-500"
              >
                Productos
              </button>
              <button
                onClick={() => router.push('/admin/users')}
                className="text-slate-400 hover:text-white transition"
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Moderación de Productos</h1>

          {/* Filtros */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'approved'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Aprobados
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'rejected'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Rechazados
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex gap-6">
                {/* Imagen */}
                <div className="w-32 h-32 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-5xl">🔫</div>
                  )}
                </div>

                {/* Información */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{product.name}</h3>
                      <p className="text-slate-400 text-sm">
                        {product.brand} • {product.model} • {product.caliber}
                      </p>
                    </div>
                    {getStatusBadge(product.status)}
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-slate-400 text-sm">Precio</p>
                      <p className="text-white font-bold">${(product.price / 1000).toFixed(0)}k</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Condición</p>
                      <p className="text-white capitalize">{product.condition.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Ubicación</p>
                      <p className="text-white text-sm">{product.city}, {product.province}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">N° Serie</p>
                      <p className="text-white text-xs">{product.serialNumber}</p>
                    </div>
                  </div>

                  {product.seller && (
                    <div className="mb-4">
                      <p className="text-slate-400 text-sm">Vendedor</p>
                      <p className="text-white">
                        {product.seller.firstName} {product.seller.lastName}
                      </p>
                    </div>
                  )}

                  <div className="bg-slate-900 rounded-lg p-3 mb-4">
                    <p className="text-slate-400 text-sm mb-1">Descripción</p>
                    <p className="text-white text-sm line-clamp-2">{product.description}</p>
                  </div>

                  {product.rejectionReason && (
                    <div className="bg-red-900 bg-opacity-20 border border-red-600 rounded-lg p-3 mb-4">
                      <p className="text-red-200 text-sm">
                        <strong>Motivo de rechazo:</strong> {product.rejectionReason}
                      </p>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push(`/products/${product.id}`)}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalle
                    </button>

                    {product.status === ProductStatus.PENDING && (
                      <>
                        <button
                          onClick={() => handleApprove(product.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleReject(product.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Rechazar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">
                {filter === 'pending' 
                  ? 'No hay productos pendientes de moderación'
                  : `No hay productos ${filter === 'all' ? '' : filter === 'approved' ? 'aprobados' : 'rechazados'}`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}