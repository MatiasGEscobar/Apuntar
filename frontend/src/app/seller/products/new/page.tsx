'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productsService } from '../../../../lib/products';
import { authService } from '../../../../lib/auth';
import { ProductCategory, ProductCondition } from '../../../../types/product.types';
import { UserRole } from '../../../../types/user.types';
import { Shield, ArrowLeft } from 'lucide-react';

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

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: ProductCategory.PISTOLA,
    brand: '',
    model: '',
    caliber: '',
    serialNumber: '',
    condition: ProductCondition.NUEVO,
    price: '',
    description: '',
    images: [] as string[],
    city: '',
    province: '',
    postalCode: '',
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== UserRole.SELLER) {
      router.push('/login');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await productsService.create({
        ...formData,
        price: parseFloat(formData.price),
        images: formData.images.length > 0 ? formData.images : ['https://via.placeholder.com/400x300?text=Arma'],
      });

      alert('Producto creado exitosamente. Está pendiente de aprobación.');
      router.push('/seller/products');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/seller/products')}
            className="text-slate-400 hover:text-white flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a mis productos
          </button>
        </div>
      </nav>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Publicar Producto</h1>
            <p className="text-slate-400">Complete todos los campos requeridos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900 bg-opacity-20 border border-red-600 rounded-lg p-4">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg">Información Básica</h3>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
                  placeholder="Ej: Bersa Thunder 380"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
                  >
                    <option value={ProductCategory.PISTOLA}>Pistola</option>
                    <option value={ProductCategory.REVOLVER}>Revólver</option>
                    <option value={ProductCategory.RIFLE}>Rifle</option>
                    <option value={ProductCategory.ESCOPETA}>Escopeta</option>
                    <option value={ProductCategory.CARABINA}>Carabina</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Condición *
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as ProductCondition })}
                    className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
                  >
                    <option value={ProductCondition.NUEVO}>Nuevo</option>
                    <option value={ProductCondition.USADO_EXCELENTE}>Usado - Excelente</option>
                    <option value={ProductCondition.USADO_BUENO}>Usado - Bueno</option>
                    <option value={ProductCondition.USADO_REGULAR}>Usado - Regular</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Marca *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
                    placeholder="Ej: Bersa"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
                    placeholder="Ej: Thunder 380"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Calibre *
                  </label>
                  <select
                    value={formData.caliber}
                    onChange={(e) => setFormData({ ...formData, caliber: e.target.value })}
                    required
                    className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">Seleccionar...</option>
                    {CALIBRES.map(cal => (
                      <option key={cal} value={cal}>{cal}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Número de Serie *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
                    placeholder="Ej: BT380-2024-001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Precio (ARS) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
                  placeholder="450000"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Descripción (mínimo 20 caracteres) *
                </label>
                <textarea
                  required
                  minLength={20}
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
                  placeholder="Describa el estado, características y cualquier detalle relevante del arma..."
                />
              </div>
            </div>

            {/* Ubicación */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg">Ubicación</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Provincia *
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    required
                    className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">Seleccionar...</option>
                    {PROVINCIAS.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
                    placeholder="Ej: Resistencia"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Código Postal (opcional)
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none"
                  placeholder="Ej: 3500"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push('/seller/products')}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-xl font-semibold transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 text-white py-4 rounded-xl font-semibold transition"
              >
                {loading ? 'Publicando...' : 'Publicar Producto'}
              </button>
            </div>

            {/* Aviso */}
            <div className="bg-blue-900 bg-opacity-20 border border-blue-600 rounded-lg p-4">
              <p className="text-blue-200 text-sm">
                <strong>Nota:</strong> Tu producto será revisado por un administrador antes de ser publicado en el catálogo.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}