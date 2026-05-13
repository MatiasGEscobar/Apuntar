'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productsService } from '../../../lib/products';
import { authService } from '../../../lib/auth';
import { Product, ProductStatus } from '../../../types/product.types';
import { UserRole } from '../../../types/user.types';
import { Check, X, Eye, LogOut, Users, Package } from 'lucide-react';
import Logo from '../../../components/logo';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== UserRole.ADMIN) { router.push('/login'); return; }
    loadProducts();
  }, [filter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsService.getAll({ status: filter !== 'all' ? filter : undefined });
      setProducts(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try { await productsService.approve(id); await loadProducts(); }
    catch { toast.error('Error al aprobar producto'); }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;
    try { await productsService.reject(id, reason); await loadProducts(); }
    catch { toast.error('Error al rechazar producto'); }
  };

  const statusConfig: Record<ProductStatus, { label: string; color: string; bg: string }> = {
    [ProductStatus.PENDING]:  { label: 'PENDIENTE',  color: 'text-yellow-400', bg: 'border-yellow-900/40 bg-yellow-950/10' },
    [ProductStatus.APPROVED]: { label: 'APROBADO',   color: 'text-green-400',  bg: 'border-green-900/40 bg-green-950/10' },
    [ProductStatus.REJECTED]: { label: 'RECHAZADO',  color: 'text-red-400',    bg: 'border-red-900/40 bg-red-950/10' },
    [ProductStatus.SOLD]:     { label: 'VENDIDO',    color: 'text-blue-400',   bg: 'border-blue-900/40 bg-blue-950/10' },
    [ProductStatus.RESERVED]: { label: 'RESERVADO',  color: 'text-purple-400', bg: 'border-purple-900/40 bg-purple-950/10' },
  };

  const filters = [
    { value: 'all',      label: 'TODOS' },
    { value: 'pending',  label: 'PENDIENTES' },
    { value: 'approved', label: 'APROBADOS' },
    { value: 'rejected', label: 'RECHAZADOS' },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-2 border-[#333333] border-t-[#c9a227] rounded-full animate-spin" />
      <p className="text-[#888888] font-rajdhani tracking-widest text-sm uppercase">Cargando productos...</p>
    </div>
  );

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
                className="flex items-center gap-2 px-4 py-2 font-tactical text-sm tracking-wider text-[#888888] hover:text-[#c9a227] transition-colors"
              >
                <Users className="w-4 h-4" />
                USUARIOS
              </button>
              <button
                onClick={() => router.push('/admin/products')}
                className="flex items-center gap-2 px-4 py-2 font-tactical text-sm tracking-wider text-[#c9a227] border-b border-[#c9a227]"
              >
                <Package className="w-4 h-4" />
                PRODUCTOS
              </button>
            </div>
          </div>
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
            <span className="text-[#c9a227] text-xs tracking-[0.3em] uppercase font-rajdhani">Panel de control</span>
          </div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h1 className="font-tactical text-5xl text-[#e8e8e8] tracking-wide">MODERACIÓN</h1>
            <div className="flex gap-2 flex-wrap">
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value as any)}
                  className={`font-tactical text-xs px-4 py-2 tracking-wider border transition-all ${
                    filter === f.value
                      ? 'bg-[#c9a227] text-[#0a0a0a] border-[#c9a227]'
                      : 'bg-transparent text-[#888888] border-[#333333] hover:border-[#c9a227] hover:text-[#c9a227]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 border border-[#333333]">
            <Package className="w-12 h-12 text-[#333333]" />
            <p className="text-[#888888] font-rajdhani tracking-widest text-sm uppercase">
              No hay productos {filter !== 'all' ? filter === 'pending' ? 'pendientes' : filter === 'approved' ? 'aprobados' : 'rechazados' : ''}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => {
              const status = statusConfig[product.status];
              return (
                <div key={product.id} className="border border-[#333333] bg-[#111111] hover:border-[#c9a227]/30 transition-colors">
                  <div className="p-6 flex gap-6">

                    {/* Imagen */}
                    <div className="w-28 h-28 bg-[#1a1a1a] border border-[#333333] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-4xl opacity-20">🔫</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-tactical text-xl text-[#e8e8e8] tracking-wide">{product.name}</h3>
                          <p className="text-[#888888] font-rajdhani text-sm">
                            {product.brand} · {product.model} · {product.caliber}
                          </p>
                        </div>
                        <span className={`font-tactical text-xs px-3 py-1 border flex-shrink-0 ${status.color} ${status.bg}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {[
                          { label: 'Precio', value: `$${(product.price / 1000).toFixed(0)}k` },
                          { label: 'Condición', value: product.condition.replace('_', ' ') },
                          { label: 'Ubicación', value: `${product.city}, ${product.province}` },
                          { label: 'N° Serie', value: product.serialNumber || '—' },
                        ].map((spec) => (
                          <div key={spec.label} className="bg-[#1a1a1a] border border-[#333333] p-3">
                            <p className="text-[#555555] font-rajdhani text-xs tracking-[0.2em] uppercase mb-1">{spec.label}</p>
                            <p className="text-[#e8e8e8] font-rajdhani text-sm font-semibold capitalize">{spec.value}</p>
                          </div>
                        ))}
                      </div>

                      {product.seller && (
                        <p className="text-[#888888] font-rajdhani text-sm mb-3">
                          Vendedor: <span className="text-[#e8e8e8]">{product.seller.firstName} {product.seller.lastName}</span>
                        </p>
                      )}

                      {product.description && (
                        <p className="text-[#555555] font-rajdhani text-sm line-clamp-1 mb-3">{product.description}</p>
                      )}

                      {product.rejectionReason && (
                        <div className="border border-red-900/40 bg-red-950/10 p-3 mb-3">
                          <p className="text-red-300 font-rajdhani text-sm">
                            <span className="text-red-400 font-semibold">Motivo: </span>
                            {product.rejectionReason}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-3 flex-wrap">
                        <button
                          onClick={() => router.push(`/products/${product.id}`)}
                          className="btn-tactical-outline text-xs py-2 px-4 flex items-center gap-2"
                        >
                          <Eye className="w-3 h-3" />
                          VER DETALLE
                        </button>
                        {product.status === ProductStatus.PENDING && (
                          <>
                            <button
                              onClick={() => handleApprove(product.id)}
                              className="flex items-center gap-2 border border-green-700 bg-green-950/20 text-green-400 font-tactical text-xs tracking-wider px-4 py-2 hover:bg-green-950/40 transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              APROBAR
                            </button>
                            <button
                              onClick={() => handleReject(product.id)}
                              className="flex items-center gap-2 border border-red-900 bg-red-950/20 text-red-400 font-tactical text-xs tracking-wider px-4 py-2 hover:bg-red-950/40 transition-colors"
                            >
                              <X className="w-3 h-3" />
                              RECHAZAR
                            </button>
                          </>
                        )}
                      </div>
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