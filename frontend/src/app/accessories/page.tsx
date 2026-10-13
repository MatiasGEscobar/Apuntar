'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Truck, Handshake, Plus } from 'lucide-react';
import { accessoriesService, Accessory, ACCESSORY_CATEGORIES, categoryLabel } from '../../lib/accessories';
import { useAuth } from '../../context/AuthContext';
import AppNavbar from '../../components/AppNavbar';
import toast from 'react-hot-toast';

export default function AccessoriesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => load(), 300); // debounce del buscador
    return () => clearTimeout(timeout);
  }, [category, search]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await accessoriesService.getAll({
        category: category || undefined,
        search: search.trim() || undefined,
      });
      setAccessories(data);
    } catch {
      toast.error('Error cargando accesorios');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = () => {
    if (!user) { router.push('/login'); return; }
    router.push('/accessories/new');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AppNavbar backLabel="Inicio" backHref="/" showAuthLinksWhenLoggedOut />

      <div className="border-b border-[#333333] bg-[#111111]">
        <div className="max-w-7xl mx-auto px-6 py-14 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-px bg-[#c9a227]" />
              <span className="text-[#c9a227] text-xs tracking-[0.4em] uppercase font-rajdhani">Equipamiento</span>
            </div>
            <h1 className="font-tactical text-5xl md:text-6xl text-[#e8e8e8] tracking-wide mb-2">ACCESORIOS</h1>
            <p className="text-[#888888] font-rajdhani text-lg max-w-2xl">
              Portacargadores, fundas, ropa de tiro y más. Comprá sin necesidad de cuenta.
            </p>
          </div>
          <button onClick={handlePublish} className="btn-tactical flex items-center gap-2 py-3 px-6">
            <Plus className="w-4 h-4" />
            PUBLICAR ACCESORIO
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar accesorio..."
            className="input-tactical md:max-w-sm"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory('')}
              className={`font-tactical text-xs tracking-wider px-4 py-2 border transition-colors ${
                category === '' ? 'border-[#c9a227] text-[#c9a227] bg-[#c9a227]/5' : 'border-[#333333] text-[#888888] hover:text-[#c9a227]'
              }`}
            >
              TODOS
            </button>
            {ACCESSORY_CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`font-tactical text-xs tracking-wider px-4 py-2 border transition-colors uppercase ${
                  category === c.value ? 'border-[#c9a227] text-[#c9a227] bg-[#c9a227]/5' : 'border-[#333333] text-[#888888] hover:text-[#c9a227]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Listado */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#333333] border-t-[#c9a227] rounded-full animate-spin" />
          </div>
        ) : accessories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 border border-[#333333]">
            <span className="text-4xl opacity-20">🎒</span>
            <p className="text-[#888888] font-rajdhani tracking-widest text-sm uppercase">No hay accesorios publicados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {accessories.map((a) => (
              <div
                key={a.id}
                onClick={() => router.push(`/accessories/${a.id}`)}
                className="card-tactical group cursor-pointer overflow-hidden flex flex-col"
              >
                <div className="relative aspect-square bg-[#1a1a1a] overflow-hidden">
                  {a.images?.[0] ? (
                    <img src={a.images[0]} alt={a.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">🎒</div>
                  )}
                  <span className={`absolute top-3 left-3 font-tactical text-xs px-3 py-1 tracking-wider ${
                    a.condition === 'nuevo' ? 'bg-[#c9a227] text-[#0a0a0a]' : 'bg-[#333333] text-[#e8e8e8]'
                  }`}>
                    {a.condition === 'nuevo' ? 'NUEVO' : 'USADO'}
                  </span>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <p className="text-[#555555] font-rajdhani text-xs tracking-[0.2em] uppercase mb-1">
                    {categoryLabel(a.category)}
                  </p>
                  <h3 className="font-tactical text-lg text-[#e8e8e8] tracking-wide leading-tight mb-2">{a.name}</h3>

                  <div className="flex items-center gap-3 text-[#888888] mb-3">
                    {a.allowsShipping && (
                      <span className="flex items-center gap-1 font-rajdhani text-xs"><Truck className="w-3 h-3 text-[#c9a227]" /> Envío</span>
                    )}
                    {a.allowsInPerson && (
                      <span className="flex items-center gap-1 font-rajdhani text-xs"><Handshake className="w-3 h-3 text-[#c9a227]" /> En persona</span>
                    )}
                  </div>

                  <div className="mt-auto pt-3 border-t border-[#333333]">
                    <div className="font-tactical text-2xl text-[#c9a227]">
                      ${Number(a.price).toLocaleString('es-AR')}
                    </div>
                    {a.city && (
                      <p className="flex items-center gap-1 text-[#555555] font-rajdhani text-xs mt-1">
                        <MapPin className="w-3 h-3" /> {a.city}{a.province ? `, ${a.province}` : ''}
                      </p>
                    )}
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