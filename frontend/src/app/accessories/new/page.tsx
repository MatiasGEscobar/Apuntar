'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { accessoriesService, ACCESSORY_CATEGORIES, AccessoryCategory } from '../../../lib/accessories';
import { useAuth } from '../../../context/AuthContext';
import ImageUpload from '../../../components/upload/ImageUpload';
import AppNavbar from '../../../components/AppNavbar';
import toast from 'react-hot-toast';

const PROVINCIAS = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán',
];

const labelClass = 'block text-[#888888] text-xs tracking-[0.2em] uppercase font-rajdhani mb-2';
const sectionTitle = 'font-tactical text-lg tracking-wider text-[#c9a227] mb-4 pb-2 border-b border-[#333333]';

export default function NewAccessoryPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'portacargador' as AccessoryCategory,
    condition: 'nuevo' as 'nuevo' | 'usado',
    price: '',
    stock: '1',
    images: [] as string[],
    allowsShipping: true,
    allowsInPerson: false,
    city: '',
    province: '',
  });

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [isLoading, user]);

  const set = (field: string, value: any) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.allowsShipping && !formData.allowsInPerson) {
      toast.error('Elegí al menos un método de entrega');
      return;
    }

    setSaving(true);
    try {
      await accessoriesService.create({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
      });
      toast.success('Accesorio publicado');
      router.push('/accessories');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al publicar el accesorio');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#333333] border-t-[#c9a227] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AppNavbar backLabel="Accesorios" backHref="/accessories" />

      <div className="border-b border-[#333333] bg-[#111111]">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-px bg-[#c9a227]" />
            <span className="text-[#c9a227] text-xs tracking-[0.3em] uppercase font-rajdhani">Nueva publicación</span>
          </div>
          <h1 className="font-tactical text-5xl text-[#e8e8e8] tracking-wide">PUBLICAR ACCESORIO</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">

          <div className="border border-[#333333] bg-[#111111] p-6">
            <h3 className={sectionTitle}>INFORMACIÓN BÁSICA</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Nombre *</label>
                <input type="text" required value={formData.name} onChange={(e) => set('name', e.target.value)}
                  className="input-tactical" placeholder="Ej: Portacargador doble para 9mm" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Categoría *</label>
                  <select value={formData.category} onChange={(e) => set('category', e.target.value)} className="input-tactical cursor-pointer">
                    {ACCESSORY_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Condición *</label>
                  <select value={formData.condition} onChange={(e) => set('condition', e.target.value)} className="input-tactical cursor-pointer">
                    <option value="nuevo">Nuevo</option>
                    <option value="usado">Usado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Precio (ARS) *</label>
                  <input type="number" required min="1" step="1" value={formData.price} onChange={(e) => set('price', e.target.value)}
                    className="input-tactical" placeholder="18500" />
                </div>
                <div>
                  <label className={labelClass}>Stock disponible *</label>
                  <input type="number" required min="1" step="1" value={formData.stock} onChange={(e) => set('stock', e.target.value)}
                    className="input-tactical" placeholder="1" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Descripción * (mínimo 20 caracteres)</label>
                <textarea required minLength={20} rows={4} value={formData.description} onChange={(e) => set('description', e.target.value)}
                  className="input-tactical resize-none" placeholder="Describí el producto, materiales, medidas, estado..." />
              </div>
            </div>
          </div>

          <div className="border border-[#333333] bg-[#111111] p-6">
            <h3 className={sectionTitle}>MÉTODOS DE ENTREGA</h3>
            <p className="text-[#555555] font-rajdhani text-xs mb-4">
              Elegí cómo podés entregar este producto. El comprador va a poder elegir entre las opciones que habilites.
            </p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.allowsShipping} onChange={(e) => set('allowsShipping', e.target.checked)}
                  className="w-4 h-4 accent-[#c9a227]" />
                <span className="text-[#e8e8e8] font-rajdhani">Envío a domicilio</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.allowsInPerson} onChange={(e) => set('allowsInPerson', e.target.checked)}
                  className="w-4 h-4 accent-[#c9a227]" />
                <span className="text-[#e8e8e8] font-rajdhani">Entrega en persona</span>
              </label>
            </div>
          </div>

          <div className="border border-[#333333] bg-[#111111] p-6">
            <h3 className={sectionTitle}>UBICACIÓN</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Provincia *</label>
                <select required value={formData.province} onChange={(e) => set('province', e.target.value)} className="input-tactical cursor-pointer">
                  <option value="">Seleccionar...</option>
                  {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Ciudad *</label>
                <input type="text" required value={formData.city} onChange={(e) => set('city', e.target.value)}
                  className="input-tactical" placeholder="Ej: Resistencia" />
              </div>
            </div>
          </div>

          <div className="border border-[#333333] bg-[#111111] p-6">
            <h3 className={sectionTitle}>IMÁGENES</h3>
            <ImageUpload
              onImagesChange={(urls) => set('images', urls)}
              maxImages={6}
              currentImages={formData.images}
              folder="products"
            />
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={() => router.push('/accessories')} className="btn-tactical-outline flex-1 py-4">
              CANCELAR
            </button>
            <button type="submit" disabled={saving} className="btn-tactical flex-1 py-4 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'PUBLICANDO...' : 'PUBLICAR ACCESORIO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}