'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productsService } from '../../../lib/products';
import { authService } from '../../../lib/auth';
import { Product, ProductStatus } from '../../../types/product.types';
import { UserRole } from '../../../types/user.types';
import { Plus, Package, LogOut, Eye } from 'lucide-react';
import Logo from '../../../components/logo';
import VerificationBanner from '../../../components/VerificationBanner';

export default function SellerProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== UserRole.SELLER) { router.push('/login'); return; }
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsService.getAll({});
      const myProducts = data.filter((p: Product) => p.sellerId === currentUser?.id);
      setProducts(myProducts);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig: Record<ProductStatus, { label: string; color: string; bg: string }> = {
    [ProductStatus.PENDING]:  { label: 'EN REVISIÓN', color: 'text-yellow-400', bg: 'border-yellow-900/40 bg-yellow-950/10' },
    [ProductStatus.APPROVED]: { label: 'PUBLICADO',   color: 'text-green-400',  bg: 'border-green-900/40 bg-green-950/10' },
    [ProductStatus.REJECTED]: { label: 'RECHAZADO',   color: 'text-red-400',    bg: 'border-red-900/40 bg-red-950/10' },
    [ProductStatus.SOLD]:     { label: 'VENDIDO',     color: 'text-blue-400',   bg: 'border-blue-900/40 bg-blue-950/10' },
    [ProductStatus.RESERVED]: { label: 'RESERVADO',   color: 'text-purple-400', bg: 'border-purple-900/40 bg-purple-950/10' },
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-2 border-[#333333] border-t-[#c9a227] rounded-full animate-spin" />
      <p className="text-[#888888] font-rajdhani tracking-widest text-sm uppercase">Cargando...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Navbar */}
      <nav className="border-b border-[#333333] bg-[#0a0a0a]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/products')}
              className="text-[#888888] hover:text-[#c9a227] transition-colors font-rajdhani text-sm tracking-wider uppercase"
            >
              Ver catálogo
            </button>
            <button
              onClick={() => authService.logout()}
              className="flex items-center gap-2 text-[#888888] hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <VerificationBanner />

      {/* Header */}
      <div className="border-b border-[#333333] bg-[#111111]">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-px bg-[#c9a227]" />
            <span className="text-[#c9a227] text-xs tracking-[0.3em] uppercase font-rajdhani">
              Vendedor: {currentUser?.firstName} {currentUser?.lastName}
            </span>
          </div>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="font-tactical text-5xl text-[#e8e8e8] tracking-wide">MIS PRODUCTOS</h1>
            <button
              onClick={() => router.push('/seller/products/new')}
              className="btn-tactical flex items-center gap-2 py-3 px-6"
            >
              <Plus className="w-4 h-4" />
              NUEVO PRODUCTO
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6 border border-[#333333]">
            <Package className="w-12 h-12 text-[#333333]" />
            <div className="text-center">
              <p className="text-[#888888] font-rajdhani tracking-widest text-sm uppercase mb-2">
                No tenés productos publicados
              </p>
              <p className="text-[#555555] font-rajdhani text-sm">
                Publicá tu primer producto para comenzar a vender
              </p>
            </div>
            <button
              onClick={() => router.push('/seller/products/new')}
              className="btn-tactical py-3 px-8 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              PUBLICAR PRIMER PRODUCTO
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => {
              const status = statusConfig[product.status];
              return (
                <div key={product.id} className="card-tactical group">
                  <div className="h-48 bg-[#1a1a1a] flex items-center justify-center overflow-hidden relative">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="text-6xl opacity-10">🔫</div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`font-tactical text-xs px-3 py-1 border ${status.color} ${status.bg}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#c9a227] group-hover:w-full transition-all duration-300" />
                  </div>

                  <div className="p-5">
                    <h3 className="font-tactical text-xl text-[#e8e8e8] tracking-wide mb-1">{product.name}</h3>
                    <p className="text-[#888888] font-rajdhani text-sm mb-4">{product.brand} · {product.caliber}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-[#333333]">
                      <div>
                        <div className="font-tactical text-2xl text-[#c9a227]">
                          ${(product.price / 1000).toFixed(0)}k
                        </div>
                        <div className="text-[#555555] font-rajdhani text-xs">{product.views} vistas</div>
                      </div>
                      <button
                        onClick={() => router.push(`/products/${product.id}`)}
                        className="btn-tactical-outline text-xs py-2 px-4 flex items-center gap-2"
                      >
                        <Eye className="w-3 h-3" />
                        VER
                      </button>
                    </div>

                    {product.rejectionReason && (
                      <div className="mt-4 border border-red-900/40 bg-red-950/10 p-3">
                        <p className="text-red-300 font-rajdhani text-xs">
                          <span className="text-red-400 font-semibold">Rechazado: </span>
                          {product.rejectionReason}
                        </p>
                      </div>
                    )}
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