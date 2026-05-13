'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productsService } from '../../../lib/products';
import { authService } from '../../../lib/auth';
import { transactionsService } from '../../../lib/transactions';
import { Product } from '../../../types/product.types';
import { ArrowLeft, MapPin, Star, Eye, ShoppingCart, AlertTriangle, Shield } from 'lucide-react';
import Logo from '../../../components/logo';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    if (params.id) loadProduct(params.id as string);
  }, [params.id]);

  const loadProduct = async (id: string) => {
    try {
      setLoading(true);
      const data = await productsService.getById(id);
      setProduct(data);
    } catch (error) {
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    const user = authService.getCurrentUser();
    if (user?.status !== 'approved') {
      toast('Debés tener tu cuenta aprobada para comprar.');
      router.push('/profile/documents');
      return;
    }
    try {
      setBuying(true);
      const transaction = await transactionsService.create(params.id as string);
      router.push(`/checkout/${transaction.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al iniciar compra');
    } finally {
      setBuying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-2 border-[#333333] border-t-[#c9a227] rounded-full animate-spin" />
      <p className="text-[#888888] font-rajdhani tracking-widest text-sm uppercase">Cargando...</p>
    </div>
  );

  if (!product) return null;

  const totalWithCommission = product.price * 1.015;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Navbar */}
      <nav className="border-b border-[#333333] bg-[#0a0a0a]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/products')}
            className="flex items-center gap-2 text-[#888888] hover:text-[#c9a227] transition-colors font-rajdhani text-sm tracking-wider uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al catálogo
          </button>
          <Logo size="sm" />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-[#555555] font-rajdhani text-xs tracking-wider uppercase">
          <span className="hover:text-[#c9a227] cursor-pointer transition-colors" onClick={() => router.push('/products')}>Catálogo</span>
          <span>/</span>
          <span className="text-[#888888]">{product.category}</span>
          <span>/</span>
          <span className="text-[#c9a227]">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">

          {/* Galería */}
          <div className="space-y-3">
            <div className="aspect-square bg-[#111111] border border-[#333333] flex items-center justify-center overflow-hidden relative">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-9xl opacity-10">🔫</div>
              )}
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#c9a227]" />
            </div>

            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square overflow-hidden border transition-colors ${
                      selectedImage === idx ? 'border-[#c9a227]' : 'border-[#333333] hover:border-[#555555]'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">

            {/* Título y badge */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="font-tactical text-4xl text-[#e8e8e8] tracking-wide leading-tight">
                  {product.name}
                </h1>
                <span className={`font-tactical text-xs px-3 py-1.5 tracking-wider flex-shrink-0 ${
                  product.condition === 'nuevo'
                    ? 'bg-[#c9a227] text-[#0a0a0a]'
                    : 'bg-[#333333] text-[#e8e8e8]'
                }`}>
                  {product.condition === 'nuevo' ? 'NUEVO' : 'USADO'}
                </span>
              </div>
              <p className="text-[#888888] font-rajdhani text-lg">
                {product.brand} · {product.model}
              </p>
            </div>

            {/* Precio */}
            <div className="border border-[#c9a227]/30 bg-[#c9a227]/5 p-5">
              <div className="flex items-end gap-3 mb-2">
                <span className="font-tactical text-5xl text-[#c9a227]">
                  ${product.price.toLocaleString('es-AR')}
                </span>
                <span className="text-[#888888] font-rajdhani pb-1">ARS</span>
              </div>
              <p className="text-[#888888] font-rajdhani text-xs tracking-wide">
                Total con comisión (1.5%): ${totalWithCommission.toLocaleString('es-AR', { maximumFractionDigits: 0 })} ARS
              </p>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Categoría', value: product.category },
                { label: 'Calibre', value: product.caliber },
                { label: 'Número de serie', value: product.serialNumber || 'No especificado' },
                { label: 'Vistas', value: `${product.views}` },
              ].map((spec) => (
                <div key={spec.label} className="bg-[#111111] border border-[#333333] p-3">
                  <p className="text-[#555555] font-rajdhani text-xs tracking-[0.2em] uppercase mb-1">{spec.label}</p>
                  <p className="text-[#e8e8e8] font-rajdhani font-semibold capitalize">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* Ubicación */}
            <div className="flex items-center gap-3 text-[#888888] font-rajdhani">
              <MapPin className="w-4 h-4 text-[#c9a227]" />
              <span>{product.city}, {product.province}</span>
            </div>

            {/* Vendedor */}
            {product.seller && (
              <div className="border border-[#333333] bg-[#111111] p-4 flex items-center justify-between">
                <div>
                  <p className="text-[#555555] font-rajdhani text-xs tracking-[0.2em] uppercase mb-1">Vendedor</p>
                  <p className="text-[#e8e8e8] font-rajdhani font-semibold">
                    {product.seller.firstName} {product.seller.lastName}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Star className="w-4 h-4 text-[#c9a227] fill-[#c9a227]" />
                    <span className="text-[#e8e8e8] font-rajdhani font-semibold">{product.seller.rating || 0}</span>
                  </div>
                  <p className="text-[#888888] font-rajdhani text-xs">{product.seller.totalSales || 0} ventas</p>
                </div>
              </div>
            )}

            {/* Descripción */}
            {product.description && (
              <div>
                <p className="text-[#555555] font-rajdhani text-xs tracking-[0.2em] uppercase mb-2">Descripción</p>
                <p className="text-[#888888] font-rajdhani leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Botón compra */}
{product.sellerId !== currentUser?.id && (
  <button
    onClick={handleBuy}
    disabled={buying}
    className="btn-tactical w-full text-center flex items-center justify-center gap-3 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {buying ? (
      <>
        <div className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
        PROCESANDO...
      </>
    ) : (
      <>
        <ShoppingCart className="w-4 h-4" />
        INICIAR COMPRA SEGURA
      </>
    )}
  </button>
)}

            {/* Aviso RENAR */}
            <div className="border border-[#c9a227]/20 p-4 flex gap-3">
              <AlertTriangle className="w-4 h-4 text-[#c9a227] flex-shrink-0 mt-0.5" />
              <p className="text-[#888888] font-rajdhani text-xs leading-relaxed">
                Entrega <strong className="text-[#e8e8e8]">presencial obligatoria</strong> con verificación de CLU vigente y DNI de ambas partes. 
                Pago en escrow hasta confirmación de entrega.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}