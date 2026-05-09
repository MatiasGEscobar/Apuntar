'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productsService } from '../../lib/products';
import { authService } from '../../lib/auth';
import { Product, ProductCategory } from '../../types/product.types';
import { Search, MapPin, Star, Eye, ShoppingCart, LogOut, ChevronDown } from 'lucide-react';
import Logo from '../../components/logo';
import VerificationBanner from '../../components/VerificationBanner';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
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

  const categories = [
    { value: 'all', label: 'TODAS' },
    { value: ProductCategory.PISTOLA, label: 'PISTOLAS' },
    { value: ProductCategory.REVOLVER, label: 'REVÓLVERES' },
    { value: ProductCategory.RIFLE, label: 'RIFLES' },
    { value: ProductCategory.ESCOPETA, label: 'ESCOPETAS' },
    { value: ProductCategory.CARABINA, label: 'CARABINAS' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Navbar */}
      <nav className="border-b border-[#333333] bg-[#0a0a0a]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Logo size="sm" />

            <div className="flex items-center gap-6">
              {currentUser ? (
                <>
                  <span className="text-[#888888] font-rajdhani text-sm hidden md:block">
                    OP: <span className="text-[#e8e8e8]">{currentUser.firstName} {currentUser.lastName}</span>
                  </span>

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => router.push('/admin/users')}
                      className="text-[#c9a227] font-rajdhani text-sm tracking-wider hover:text-[#e8c547] transition-colors uppercase"
                    >
                      Panel Admin
                    </button>
                  )}

                  {currentUser.role === 'seller' && (
                    <button
                      onClick={() => router.push('/seller/products')}
                      className="text-[#c9a227] font-rajdhani text-sm tracking-wider hover:text-[#e8c547] transition-colors uppercase"
                    >
                      Mis Productos
                    </button>
                  )}

                  <button
                    onClick={() => router.push('/transactions')}
                    className="text-[#888888] font-rajdhani text-sm tracking-wider hover:text-[#e8e8e8] transition-colors uppercase"
                  >
                    Transacciones
                  </button>

                  <button
                    onClick={() => authService.logout()}
                    className="flex items-center gap-2 text-[#888888] hover:text-red-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/login')}
                    className="btn-tactical-outline text-sm py-2 px-5"
                  >
                    INGRESAR
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="btn-tactical text-sm py-2 px-5"
                  >
                    REGISTRARSE
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Banner verificación */}
      <VerificationBanner />

      {/* Hero header */}
      <div className="border-b border-[#333333] bg-[#111111]">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-px bg-[#c9a227]" />
            <span className="text-[#c9a227] text-xs tracking-[0.3em] uppercase font-rajdhani">
              Catálogo oficial
            </span>
          </div>
          <h1 className="font-tactical text-5xl text-[#e8e8e8] tracking-wide mb-2">
            ARMAMENTO LEGAL
          </h1>
          <p className="text-[#888888] font-rajdhani text-lg">
            Todos los productos verificados y aprobados · Regulado por RENAR
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Filtros */}
        <div className="mb-8 space-y-4">

          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888] w-4 h-4" />
            <input
              type="text"
              placeholder="      Buscar por marca, modelo o calibre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-tactical pl-11"
            />
          </div>

          {/* Categorías */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilterCategory(cat.value)}
                className={`font-tactical text-sm px-4 py-2 tracking-wider border transition-all ${
                  filterCategory === cat.value
                    ? 'bg-[#c9a227] text-[#0a0a0a] border-[#c9a227]'
                    : 'bg-transparent text-[#888888] border-[#333333] hover:border-[#c9a227] hover:text-[#c9a227]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contador */}
        {!loading && (
          <div className="mb-6 flex items-center gap-3">
            <div className="w-3 h-px bg-[#c9a227]" />
            <span className="text-[#888888] font-rajdhani text-sm tracking-wider">
              {products.length} {products.length === 1 ? 'PRODUCTO' : 'PRODUCTOS'} ENCONTRADOS
            </span>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-8 h-8 border-2 border-[#333333] border-t-[#c9a227] rounded-full animate-spin" />
            <p className="text-[#888888] font-rajdhani tracking-widest text-sm uppercase">
              Cargando armamento...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 border border-[#333333]">
            <div className="text-5xl opacity-20">🎯</div>
            <p className="text-[#888888] font-rajdhani tracking-widest text-sm uppercase">
              No se encontraron productos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => router.push(`/products/${product.id}`)}
                className="card-tactical cursor-pointer group overflow-hidden"
              >
                {/* Imagen */}
                <div className="h-52 bg-[#1a1a1a] flex items-center justify-center overflow-hidden relative">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-6xl opacity-20">🔫</div>
                  )}
                  {/* Badge condición */}
                  <div className="absolute top-3 right-3">
                    <span className={`font-tactical text-xs px-3 py-1 tracking-wider ${
                      product.condition === 'nuevo'
                        ? 'bg-[#c9a227] text-[#0a0a0a]'
                        : 'bg-[#333333] text-[#e8e8e8]'
                    }`}>
                      {product.condition === 'nuevo' ? 'NUEVO' : 'USADO'}
                    </span>
                  </div>
                  {/* Línea dorada hover */}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#c9a227] group-hover:w-full transition-all duration-300" />
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="font-tactical text-xl text-[#e8e8e8] tracking-wide leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-[#888888] font-rajdhani text-sm mt-1">
                      {product.brand} · {product.caliber}
                    </p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-[#888888]">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="font-rajdhani text-xs">
                        {product.city}, {product.province}
                      </span>
                    </div>

                    {product.seller && (
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3 text-[#c9a227] fill-[#c9a227]" />
                        <span className="text-[#e8e8e8] font-rajdhani text-xs">
                          {product.seller.rating || 0}
                        </span>
                        <span className="text-[#888888] font-rajdhani text-xs">
                          ({product.seller.totalSales || 0} ventas)
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-[#888888]">
                      <Eye className="w-3 h-3" />
                      <span className="font-rajdhani text-xs">{product.views} vistas</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#333333]">
                    <div>
                      <div className="font-tactical text-2xl text-[#c9a227]">
                        ${(product.price / 1000).toFixed(0)}k
                      </div>
                      <div className="text-[#555555] font-rajdhani text-xs">ARS</div>
                    </div>
                    <button className="btn-tactical text-xs py-2 px-4 flex items-center gap-2">
                      <ShoppingCart className="w-3 h-3" />
                      VER
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