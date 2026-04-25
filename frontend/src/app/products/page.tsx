'use client';

import { useState, useEffect } from 'react';
import { productsService } from '../../lib/products';
import { Product, ProductCategory } from '../../types/product.types';
import { Search, Filter, MapPin, Star, Eye, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import VerificationBanner from '../../components/VerificationBanner';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    loadProducts();
  }, [filterCategory, searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsService.getAll({
        category: filterCategory !== 'all' ? filterCategory : undefined,
        status: 'approved',
        search: searchTerm || undefined,
      });
      setProducts(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (id: string) => {
    router.push(`/products/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Apuntar</h1>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/login')}
                className="text-slate-400 hover:text-white transition"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => router.push('/register')}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition"
              >
                Registrarse
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-8">
  <VerificationBanner />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="mb-8">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por marca, modelo o calibre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 text-white pl-12 pr-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-800 text-white px-6 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
            >
              <option value="all">Todas las categorías</option>
              <option value={ProductCategory.PISTOLA}>Pistolas</option>
              <option value={ProductCategory.REVOLVER}>Revólveres</option>
              <option value={ProductCategory.RIFLE}>Rifles</option>
              <option value={ProductCategory.ESCOPETA}>Escopetas</option>
              <option value={ProductCategory.CARABINA}>Carabinas</option>
            </select>
          </div>
        </div>
        </div>

        {/* Grid de productos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            <p className="text-slate-400 mt-4">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-amber-500 transition cursor-pointer"
              >
                <div className="h-48 bg-slate-700 flex items-center justify-center">
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
                    <span className="bg-amber-600 text-white text-xs px-2 py-1 rounded">
                      {product.condition === 'nuevo' ? 'Nuevo' : 'Usado'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">
                    {product.brand} • {product.caliber}
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400 text-sm">
                      {product.city}, {product.province}
                    </span>
                  </div>

                  {product.seller && (
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-white font-semibold">
                        {product.seller.rating || 0}
                      </span>
                      <span className="text-slate-400 text-sm">
                        ({product.seller.totalSales || 0} ventas)
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm">
                    <Eye className="w-4 h-4" />
                    <span>{product.views} vistas</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-3xl font-bold text-white">
                      ${(product.price / 1000).toFixed(0)}k
                    </span>
                    <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Ver
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}