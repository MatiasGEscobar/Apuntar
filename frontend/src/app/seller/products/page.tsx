'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productsService } from '../../../lib/products';
import { authService } from '../../../lib/auth';
import { Product, ProductStatus } from '../../../types/product.types';
import { UserRole } from '../../../types/user.types';
import { Plus, Package } from 'lucide-react';
import VerificationBanner from '../../../components/VerificationBanner';

export default function SellerProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== UserRole.SELLER) {
      router.push('/login');
      return;
    }
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsService.getAll({});
      // Filtrar solo los productos del vendedor actual
      const currentUser = authService.getCurrentUser();
      const myProducts = data.filter(p => p.sellerId === currentUser?.id);
      setProducts(myProducts);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
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
      [ProductStatus.PENDING]: 'En Revisión',
      [ProductStatus.APPROVED]: 'Publicado',
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
            <h1 className="text-2xl font-bold text-white">Mis Productos</h1>
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

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-8">
  <VerificationBanner />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Gestión de Publicaciones</h2>
          <button
            onClick={() => router.push('/seller/products/new')}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Producto
          </button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-6">No tienes productos publicados</p>
            <button
              onClick={() => router.push('/seller/products/new')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Publicar Primer Producto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                <div className="h-48 bg-slate-700 flex items-center justify-center overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl">🔫</div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">{product.name}</h3>
                    {getStatusBadge(product.status)}
                  </div>
                  <p className="text-slate-400 text-sm mb-4">
                    {product.brand} • {product.caliber}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white">
                      ${(product.price / 1000).toFixed(0)}k
                    </span>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <span>{product.views} vistas</span>
                    </div>
                  </div>

                  {product.rejectionReason && (
                    <div className="mt-4 bg-red-900 bg-opacity-20 border border-red-600 rounded-lg p-3">
                      <p className="text-red-200 text-xs">
                        <strong>Rechazado:</strong> {product.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}