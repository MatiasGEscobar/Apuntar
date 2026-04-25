'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productsService } from '../../../lib/products';
import { authService } from '../../../lib/auth';
import { Product } from '../../../types/product.types';
import { ArrowLeft, MapPin, Star, Eye, ShoppingCart, AlertTriangle, Phone, Mail } from 'lucide-react';
import { transactionsService } from '@/src/lib/transactions';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    if (params.id) {
      loadProduct(params.id as string);
    }
  }, [params.id]);

  const loadProduct = async (id: string) => {
    try {
      setLoading(true);
      const data = await productsService.getById(id);
      setProduct(data);
    } catch (error) {
      console.error('Error cargando producto:', error);
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
  if (!isAuthenticated) {
    router.push('/login');
    return;
  }

  const user = authService.getCurrentUser();
  
  if (user?.status !== 'approved') {
    alert('Debes tener tu cuenta aprobada para poder comprar. Por favor, sube tus documentos y espera la verificación.');
    router.push('/profile/documents');
    return;
  }

  try {
    const transaction = await transactionsService.create(params.id as string);
    router.push(`/checkout/${transaction.id}`);
  } catch (error: any) {
    alert(error.response?.data?.message || 'Error al iniciar compra');
  }
};


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navbar Simple */}
      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/products')}
            className="text-slate-400 hover:text-white flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al catálogo
          </button>
        </div>
      </nav>

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Galería de imágenes */}
          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
            <div className="h-96 bg-slate-700 flex items-center justify-center rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-9xl">🔫</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {product.images.slice(1, 5).map((img, idx) => (
                  <div key={idx} className="h-20 bg-slate-700 rounded-lg overflow-hidden">
                    <img src={img} alt={`${product.name} ${idx + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-white">{product.name}</h1>
                <span className="bg-amber-600 text-white text-sm px-3 py-1 rounded-lg">
                  {product.condition === 'nuevo' ? 'Nuevo' : 'Usado'}
                </span>
              </div>
              <p className="text-slate-400 text-lg">{product.brand} - {product.model}</p>
            </div>

            {/* Precio */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="text-4xl font-bold text-white mb-2">
                ${(product.price / 1000).toFixed(0)}k ARS
              </div>
              <p className="text-slate-400 text-sm">+ Comisión 3% (comprador 1.5% + vendedor 1.5%)</p>
            </div>

            {/* Especificaciones */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Categoría</p>
                <p className="text-white font-semibold capitalize">{product.category}</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Calibre</p>
                <p className="text-white font-semibold">{product.caliber}</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Ubicación</p>
                <p className="text-white font-semibold text-sm">{product.city}, {product.province}</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Vistas</p>
                <p className="text-white font-semibold">{product.views}</p>
              </div>
            </div>

            {/* Vendedor */}
            {product.seller && (
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-sm mb-2">Vendedor</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">
                      {product.seller.firstName} {product.seller.lastName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-white font-semibold">{product.seller.rating || 0}</span>
                      <span className="text-slate-400 text-sm">({product.seller.totalSales || 0} ventas)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Descripción */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-semibold mb-3">Descripción</h3>
              <p className="text-slate-300 leading-relaxed">{product.description}</p>
            </div>

            {/* Botón de compra */}
            <button
              onClick={handleBuy}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Iniciar Compra Segura
            </button>

            {/* Aviso legal */}
            <div className="bg-amber-900 bg-opacity-20 border border-amber-600 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-200">
                  <p className="font-semibold mb-1">Importante</p>
                  <p>
                    La entrega debe realizarse en persona con verificación de CLU vigente y DNI. 
                    El pago permanece en escrow hasta la confirmación de entrega.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}