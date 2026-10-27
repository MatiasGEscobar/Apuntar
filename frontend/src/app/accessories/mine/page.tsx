'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Truck, Handshake, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { accessoriesService, Accessory, AccessorySale, categoryLabel } from '../../../lib/accessories';
import { useAuth } from '../../../context/AuthContext';
import AppNavbar from '../../../components/AppNavbar';

type Tab = 'listings' | 'sales';

export default function MyAccessoriesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('listings');
  const [listings, setListings] = useState<Accessory[]>([]);
  const [sales, setSales] = useState<AccessorySale[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Accessory | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    load();
  }, [authLoading, user]);

  const load = async () => {
    try {
      setLoading(true);
      const [mine, mySales] = await Promise.all([
        accessoriesService.getMine(),
        accessoriesService.getMySales(),
      ]);
      setListings(mine);
      setSales(mySales);
    } catch {
      toast.error('Error cargando tus accesorios');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (a: Accessory) => {
    setEditing(a);
    setEditPrice(String(Number(a.price)));
    setEditStock(String(a.stock));
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await accessoriesService.update(editing.id, {
        price: Number(editPrice),
        stock: parseInt(editStock, 10),
      });
      setListings((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      toast.success('Accesorio actualizado');
      setEditing(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (a: Accessory) => {
    try {
      const updated = await accessoriesService.update(a.id, { isActive: !a.isActive });
      setListings((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      toast.success(updated.isActive ? 'Publicación activada' : 'Publicación pausada');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    }
  };

  const handleDelete = async (a: Accessory) => {
    if (!confirm(`¿Eliminar "${a.name}"?`)) return;
    try {
      const { deleted } = await accessoriesService.remove(a.id);
      toast.success(
        deleted
          ? 'Accesorio eliminado'
          : 'Tenía ventas: se desactivó en vez de eliminarse, para conservar tu historial',
      );
      await load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    }
  };

  const handleFulfill = async (sale: AccessorySale) => {
    if (!confirm('¿Confirmás que ya entregaste este pedido?')) return;
    try {
      await accessoriesService.fulfillOrder(sale.id);
      setSales((prev) =>
        prev.map((s) => (s.id === sale.id ? { ...s, fulfilledAt: new Date().toISOString() } : s)),
      );
      toast.success('Pedido marcado como entregado');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar el pedido');
    }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-AR');
  const pendingSales = sales.filter((s) => !s.fulfilledAt).length;
  const sortedSales = [...sales].sort((a, b) => {
    if (!!a.fulfilledAt !== !!b.fulfilledAt) return a.fulfilledAt ? 1 : -1; // pendientes primero
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (authLoading || loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#333333] border-t-[#c9a227] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AppNavbar backLabel="Accesorios" backHref="/accessories" />

      <div className="border-b border-[#333333] bg-[#111111]">
        <div className="max-w-5xl mx-auto px-6 py-10 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-px bg-[#c9a227]" />
              <span className="text-[#c9a227] text-xs tracking-[0.3em] uppercase font-rajdhani">Mi cuenta</span>
            </div>
            <h1 className="font-tactical text-5xl text-[#e8e8e8] tracking-wide">MIS ACCESORIOS</h1>
          </div>
          <button onClick={() => router.push('/accessories/new')} className="btn-tactical flex items-center gap-2 py-3 px-6">
            <Plus className="w-4 h-4" /> PUBLICAR
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('listings')}
            className={`font-tactical text-sm tracking-wider px-5 py-2 border transition-colors ${
              tab === 'listings' ? 'border-[#c9a227] text-[#c9a227] bg-[#c9a227]/5' : 'border-[#333333] text-[#888888]'
            }`}
          >
            PUBLICACIONES ({listings.length})
          </button>
          <button
            onClick={() => setTab('sales')}
            className={`font-tactical text-sm tracking-wider px-5 py-2 border transition-colors flex items-center gap-2 ${
              tab === 'sales' ? 'border-[#c9a227] text-[#c9a227] bg-[#c9a227]/5' : 'border-[#333333] text-[#888888]'
            }`}
          >
            VENTAS ({sales.length})
            {pendingSales > 0 && (
              <span className="bg-[#c9a227] text-[#0a0a0a] text-xs font-rajdhani font-bold px-1.5 py-0.5">
                {pendingSales} por entregar
              </span>
            )}
          </button>
        </div>

        {/* Publicaciones */}
        {tab === 'listings' && (
          listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 border border-[#333333]">
              <p className="text-[#888888] font-rajdhani tracking-widest text-sm uppercase">Todavía no publicaste accesorios</p>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((a) => (
                <div key={a.id} className="border border-[#333333] bg-[#111111] p-5 flex gap-5 items-start">
                  <div className="w-20 h-20 bg-[#1a1a1a] border border-[#333333] overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {a.images?.[0]
                      ? <img src={a.images[0]} alt={a.name} className="w-full h-full object-cover" />
                      : <span className="text-2xl opacity-20">🎒</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div>
                        <h3 className="font-tactical text-lg text-[#e8e8e8] tracking-wide">{a.name}</h3>
                        <p className="text-[#555555] font-rajdhani text-xs uppercase tracking-wider">{categoryLabel(a.category)}</p>
                      </div>
                      <span className={`font-tactical text-xs px-3 py-1 border flex-shrink-0 ${
                        !a.isActive
                          ? 'text-[#888888] border-[#333333]'
                          : a.stock <= 0
                            ? 'text-red-400 border-red-900/40 bg-red-950/10'
                            : 'text-green-400 border-green-900/40 bg-green-950/10'
                      }`}>
                        {!a.isActive ? 'PAUSADO' : a.stock <= 0 ? 'SIN STOCK' : 'ACTIVO'}
                      </span>
                    </div>
                    <p className="font-rajdhani text-sm text-[#888888] mb-3">
                      <span className="text-[#c9a227] font-semibold">${Number(a.price).toLocaleString('es-AR')}</span>
                      {' · '}{a.stock} en stock{' · '}{a.views} vistas
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => openEdit(a)} className="btn-tactical-outline text-xs py-2 px-4 flex items-center gap-2">
                        <Pencil className="w-3 h-3" /> PRECIO / STOCK
                      </button>
                      <button onClick={() => handleToggleActive(a)} className="btn-tactical-outline text-xs py-2 px-4">
                        {a.isActive ? 'PAUSAR' : 'ACTIVAR'}
                      </button>
                      <button onClick={() => handleDelete(a)} className="flex items-center gap-2 border border-red-900 bg-red-950/20 text-red-400 font-tactical text-xs tracking-wider px-4 py-2 hover:bg-red-950/40 transition-colors">
                        <Trash2 className="w-3 h-3" /> ELIMINAR
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Ventas */}
        {tab === 'sales' && (
          sortedSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 border border-[#333333]">
              <p className="text-[#888888] font-rajdhani tracking-widest text-sm uppercase">Todavía no tenés ventas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedSales.map((s) => (
                <div key={s.id} className={`border bg-[#111111] p-5 ${s.fulfilledAt ? 'border-[#333333]' : 'border-[#c9a227]/40'}`}>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-[#1a1a1a] border border-[#333333] overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {s.accessoryImage
                          ? <img src={s.accessoryImage} alt={s.accessoryName} className="w-full h-full object-cover" />
                          : <span className="text-xl opacity-20">🎒</span>}
                      </div>
                      <div>
                        <h3 className="font-tactical text-lg text-[#e8e8e8] tracking-wide">
                          {s.accessoryName} <span className="text-[#888888]">× {s.quantity}</span>
                        </h3>
                        <p className="text-[#555555] font-rajdhani text-xs">
                          Orden #{s.id.slice(0, 8).toUpperCase()} · {fmtDate(s.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="font-tactical text-xl text-[#c9a227] flex-shrink-0">
                      ${Number(s.amount).toLocaleString('es-AR')}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#1a1a1a] border border-[#333333] p-3">
                      <p className="text-[#555555] font-rajdhani text-xs uppercase tracking-wider mb-2">Comprador</p>
                      <p className="text-[#e8e8e8] font-rajdhani font-semibold">{s.buyerName}</p>
                      <p className="text-[#888888] font-rajdhani text-sm">{s.buyerEmail}</p>
                      <p className="text-[#888888] font-rajdhani text-sm">📱 {s.buyerPhone}</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#333333] p-3">
                      <p className="text-[#555555] font-rajdhani text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                        {s.deliveryMethod === 'shipping'
                          ? <><Truck className="w-3 h-3 text-[#c9a227]" /> Envío a domicilio</>
                          : <><Handshake className="w-3 h-3 text-[#c9a227]" /> Entrega en persona</>}
                      </p>
                      {s.deliveryMethod === 'shipping' ? (
                        <p className="text-[#e8e8e8] font-rajdhani text-sm">
                          {s.shippingAddress}, {s.shippingCity}, {s.shippingProvince}
                          {s.shippingPostalCode ? ` (${s.shippingPostalCode})` : ''}
                        </p>
                      ) : (
                        <p className="text-[#888888] font-rajdhani text-sm">
                          Coordiná el punto y horario con el comprador.
                        </p>
                      )}
                    </div>
                  </div>

                  {s.fulfilledAt ? (
                    <div className="flex items-center gap-2 text-green-400 font-tactical text-xs tracking-wider">
                      <CheckCircle className="w-4 h-4" /> ENTREGADO EL {fmtDate(s.fulfilledAt)}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleFulfill(s)}
                      className="border border-green-700 bg-green-950/20 text-green-400 font-tactical text-xs tracking-wider px-4 py-2.5 hover:bg-green-950/40 transition-colors"
                    >
                      MARCAR COMO ENTREGADO
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Modal precio / stock */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-[#333333] w-full max-w-md">
            <div className="px-6 py-4 border-b border-[#333333]">
              <h2 className="font-tactical text-xl text-[#e8e8e8] tracking-wide">EDITAR — {editing.name}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[#888888] text-xs tracking-[0.2em] uppercase font-rajdhani mb-2">Precio (ARS)</label>
                <input type="number" min="1" step="1" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="input-tactical" />
              </div>
              <div>
                <label className="block text-[#888888] text-xs tracking-[0.2em] uppercase font-rajdhani mb-2">Stock</label>
                <input type="number" min="0" step="1" value={editStock} onChange={(e) => setEditStock(e.target.value)} className="input-tactical" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditing(null)} className="btn-tactical-outline flex-1 py-3">CANCELAR</button>
                <button onClick={handleSaveEdit} disabled={saving} className="btn-tactical flex-1 py-3 disabled:opacity-50">
                  {saving ? 'GUARDANDO...' : 'GUARDAR'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}