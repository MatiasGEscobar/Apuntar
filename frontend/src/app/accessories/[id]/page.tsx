'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Truck, Handshake, ShoppingCart } from 'lucide-react';
import { accessoriesService, Accessory, categoryLabel } from '../../../lib/accessories';
import AppNavbar from '../../../components/AppNavbar';

export default function AccessoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [accessory, setAccessory] = useState<Accessory | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await accessoriesService.getById(params.id as string);
        setAccessory(data);
      } catch {
        router.push('/accessories');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) load();
  }, [params.id]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#333333] border-t-[#c9a227] rounded-full animate-spin" />
    </div>
  );

  if (!accessory) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AppNavbar backLabel="Volver a accesorios" backHref="/accessories" showAuthLinksWhenLoggedOut />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-2 gap-10">

          {/* Galería */}
          <div className="space-y-3">
            <div className="aspect-square bg-[#111111] border border-[#333333] flex items-center justify-center overflow-hidden relative">
              {accessory.images?.length > 0 ? (
                <img src={accessory.images[selectedImage]} alt={accessory.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-9xl opacity-10">🎒</div>
              )}
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#c9a227]" />
            </div>
            {accessory.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {accessory.images.slice(0, 4).map((img, idx) => (
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
            <div>
              <p className="text-[#555555] font-rajdhani text-xs tracking-[0.2em] uppercase mb-2">
                {categoryLabel(accessory.category)}
              </p>
              <div className="flex items-start justify-between gap-4">
                <h1 className="font-tactical text-4xl text-[#e8e8e8] tracking-wide leading-tight">{accessory.name}</h1>
                <span className={`font-tactical text-xs px-3 py-1.5 tracking-wider flex-shrink-0 ${
                  accessory.condition === 'nuevo' ? 'bg-[#c9a227] text-[#0a0a0a]' : 'bg-[#333333] text-[#e8e8e8]'
                }`}>
                  {accessory.condition === 'nuevo' ? 'NUEVO' : 'USADO'}
                </span>
              </div>
            </div>

            <div className="border border-[#c9a227]/30 bg-[#c9a227]/5 p-5">
              <div className="flex items-end gap-3">
                <span className="font-tactical text-5xl text-[#c9a227]">
                  ${Number(accessory.price).toLocaleString('es-AR')}
                </span>
                <span className="text-[#888888] font-rajdhani pb-1">ARS</span>
              </div>
              <p className="text-[#888888] font-rajdhani text-xs mt-2">
                {accessory.stock} {accessory.stock === 1 ? 'unidad disponible' : 'unidades disponibles'}
              </p>
            </div>

            {/* Métodos de entrega */}
            <div className="border border-[#333333] bg-[#111111] p-4 space-y-3">
              <p className="text-[#555555] font-rajdhani text-xs tracking-[0.2em] uppercase">Métodos de entrega</p>
              {accessory.allowsShipping && (
                <div className="flex items-center gap-3 text-[#e8e8e8] font-rajdhani">
                  <Truck className="w-4 h-4 text-[#c9a227]" /> Envío a domicilio
                </div>
              )}
              {accessory.allowsInPerson && (
                <div className="flex items-center gap-3 text-[#e8e8e8] font-rajdhani">
                  <Handshake className="w-4 h-4 text-[#c9a227]" /> Entrega en persona
                </div>
              )}
            </div>

            {accessory.city && (
              <div className="flex items-center gap-3 text-[#888888] font-rajdhani">
                <MapPin className="w-4 h-4 text-[#c9a227]" />
                <span>{accessory.city}{accessory.province ? `, ${accessory.province}` : ''}</span>
              </div>
            )}

            <div>
              <p className="text-[#555555] font-rajdhani text-xs tracking-[0.2em] uppercase mb-2">Descripción</p>
              <p className="text-[#888888] font-rajdhani leading-relaxed whitespace-pre-line">{accessory.description}</p>
            </div>

            {/* Etapa 3: acá va el checkout */}
            <button
              disabled
              className="btn-tactical w-full text-center flex items-center justify-center gap-3 py-4 opacity-50 cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              COMPRA DISPONIBLE PRÓXIMAMENTE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}