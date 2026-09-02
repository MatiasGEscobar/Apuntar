'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productsService } from '../../../../lib/products';
import { authService } from '../../../../lib/auth';
import { ProductCategory, ProductCondition } from '../../../../types/product.types';
import { UserRole } from '../../../../types/user.types';
import ImageUpload from '../../../../components/upload/ImageUpload';
import toast from 'react-hot-toast';
import AppNavbar from '../../../../components/AppNavbar';

const PROVINCIAS = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán'
];

const CALIBRES = [
  '.22 LR', '.32 ACP', '.380 ACP', '9mm', '.38 Special', '.357 Magnum',
  '.40 S&W', '.45 ACP', '.44 Magnum', '12 GA', '16 GA', '20 GA',
  '.223 Remington', '.308 Winchester', '7.62x39mm'
];

const labelClass = "block text-[#888888] text-xs tracking-[0.2em] uppercase font-rajdhani mb-2";
const sectionTitle = "font-tactical text-lg tracking-wider text-[#c9a227] mb-4 pb-2 border-b border-[#333333]";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category: ProductCategory.PISTOLA, brand: '', model: '',
    caliber: '', serialNumber: '', condition: ProductCondition.NUEVO,
    price: '', description: '', images: [] as string[],
    city: '', province: '', postalCode: '',
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== UserRole.SELLER) { router.push('/login'); return; }
    if (user.status !== 'approved') {
      toast('Debés tener tu cuenta aprobada para publicar productos.');
      router.push('/profile/documents');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await productsService.create({
        ...formData,
        price: parseFloat(formData.price),
        images: formData.images.length > 0 ? formData.images : ['https://via.placeholder.com/400x300?text=Arma'],
      });
      toast('Producto creado. Pendiente de aprobación.');
      router.push('/seller/products');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear producto');
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Navbar */}
      <AppNavbar backLabel="Mis productos" backHref="/seller/products" />

      {/* Header */}
      <div className="border-b border-[#333333] bg-[#111111]">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-px bg-[#c9a227]" />
            <span className="text-[#c9a227] text-xs tracking-[0.3em] uppercase font-rajdhani">Nueva publicación</span>
          </div>
          <h1 className="font-tactical text-5xl text-[#e8e8e8] tracking-wide">PUBLICAR PRODUCTO</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Información básica */}
          <div className="border border-[#333333] bg-[#111111] p-6">
            <h3 className={sectionTitle}>INFORMACIÓN BÁSICA</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Nombre del producto *</label>
                <input type="text" required value={formData.name}
                  onChange={(e) => set('name', e.target.value)}
                  className="input-tactical" placeholder="Ej: Bersa Thunder 380" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Categoría *</label>
                  <select value={formData.category} onChange={(e) => set('category', e.target.value)} className="input-tactical cursor-pointer">
                    <option value={ProductCategory.PISTOLA}>Pistola</option>
                    <option value={ProductCategory.REVOLVER}>Revólver</option>
                    <option value={ProductCategory.RIFLE}>Rifle</option>
                    <option value={ProductCategory.ESCOPETA}>Escopeta</option>
                    <option value={ProductCategory.CARABINA}>Carabina</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Condición *</label>
                  <select value={formData.condition} onChange={(e) => set('condition', e.target.value)} className="input-tactical cursor-pointer">
                    <option value={ProductCondition.NUEVO}>Nuevo</option>
                    <option value={ProductCondition.USADO_EXCELENTE}>Usado - Excelente</option>
                    <option value={ProductCondition.USADO_BUENO}>Usado - Bueno</option>
                    <option value={ProductCondition.USADO_REGULAR}>Usado - Regular</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Marca *</label>
                  <input type="text" required value={formData.brand}
                    onChange={(e) => set('brand', e.target.value)}
                    className="input-tactical" placeholder="Ej: Bersa" />
                </div>
                <div>
                  <label className={labelClass}>Modelo *</label>
                  <input type="text" required value={formData.model}
                    onChange={(e) => set('model', e.target.value)}
                    className="input-tactical" placeholder="Ej: Thunder 380" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Calibre *</label>
                  <select value={formData.caliber} onChange={(e) => set('caliber', e.target.value)} required className="input-tactical cursor-pointer">
                    <option value="">Seleccionar...</option>
                    {CALIBRES.map(cal => <option key={cal} value={cal}>{cal}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Número de serie *</label>
                  <input type="text" required value={formData.serialNumber}
                    onChange={(e) => set('serialNumber', e.target.value)}
                    className="input-tactical" placeholder="Ej: BT380-2024-001" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Precio (ARS) *</label>
                <input type="number" required min="0" value={formData.price}
                  onChange={(e) => set('price', e.target.value)}
                  className="input-tactical" placeholder="450000" />
              </div>

              <div>
                <label className={labelClass}>Descripción * (mínimo 20 caracteres)</label>
                <textarea required minLength={20} rows={4} value={formData.description}
                  onChange={(e) => set('description', e.target.value)}
                  className="input-tactical resize-none"
                  placeholder="Describa el estado, características y cualquier detalle relevante..." />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="border border-[#333333] bg-[#111111] p-6">
            <h3 className={sectionTitle}>UBICACIÓN</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Provincia *</label>
                <select value={formData.province} onChange={(e) => set('province', e.target.value)} required className="input-tactical cursor-pointer">
                  <option value="">Seleccionar...</option>
                  {PROVINCIAS.map(prov => <option key={prov} value={prov}>{prov}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Ciudad *</label>
                <input type="text" required value={formData.city}
                  onChange={(e) => set('city', e.target.value)}
                  className="input-tactical" placeholder="Ej: Resistencia" />
              </div>
              <div>
                <label className={labelClass}>Código postal (opcional)</label>
                <input type="text" value={formData.postalCode}
                  onChange={(e) => set('postalCode', e.target.value)}
                  className="input-tactical" placeholder="Ej: 3500" />
              </div>
            </div>
          </div>

          {/* Imágenes */}
          <div className="border border-[#333333] bg-[#111111] p-6">
            <h3 className={sectionTitle}>IMÁGENES DEL PRODUCTO</h3>
            <ImageUpload
              onImagesChange={(urls) => set('images', urls)}
              maxImages={10}
              currentImages={formData.images}
              folder="products"
            />
          </div>

          {/* Aviso */}
          <div className="border border-[#c9a227]/20 bg-[#c9a227]/5 p-4 flex gap-3">
            <div className="w-1 self-stretch bg-[#c9a227] flex-shrink-0" />
            <p className="text-[#888888] font-rajdhani text-sm leading-relaxed">
              Tu producto será revisado por un administrador antes de ser publicado en el catálogo.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/seller/products')}
              className="btn-tactical-outline flex-1 py-4"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-tactical flex-1 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'PUBLICANDO...' : 'PUBLICAR PRODUCTO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}