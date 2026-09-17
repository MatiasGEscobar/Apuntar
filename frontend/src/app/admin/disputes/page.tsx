'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { transactionsService } from '../../../lib/transactions';
import { authService } from '../../../lib/auth';
import { UserRole } from '../../../types/user.types';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminNavbar from '../../../components/AdminNavbar';

export default function AdminDisputesPage() {
  const router = useRouter();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== UserRole.ADMIN) { router.push('/login'); return; }
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await transactionsService.getDisputes();
      setDisputes(data);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string, resolution: 'buyer' | 'seller') => {
    const note = notes[id] || '';
    if (!note.trim()) { toast.error('Escribí una nota sobre la resolución'); return; }
    if (!confirm(`¿Confirmás resolver a favor del ${resolution === 'buyer' ? 'comprador (reembolso)' : 'vendedor (liberar pago)'}?`)) return;
    try {
      await transactionsService.resolveDispute(id, resolution, note.trim());
      toast.success('Disputa resuelta');
      setDisputes((prev) => prev.filter((d) => d.id !== id));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al resolver la disputa');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#333333] border-t-[#c9a227] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AdminNavbar active="products" />

      <div className="border-b border-[#333333] bg-[#111111]">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-px bg-[#c9a227]" />
            <span className="text-[#c9a227] text-xs tracking-[0.3em] uppercase font-rajdhani">Panel de control</span>
          </div>
          <h1 className="font-tactical text-5xl text-[#e8e8e8] tracking-wide">DISPUTAS</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {disputes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 border border-[#333333]">
            <p className="text-[#888888] font-rajdhani tracking-widest text-sm uppercase">No hay disputas activas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((t) => (
              <div key={t.id} className="border border-orange-900/40 bg-[#111111] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <h3 className="font-tactical text-lg text-[#e8e8e8]">{t.product?.name}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm font-rajdhani">
                  <div>
                    <p className="text-[#555555] uppercase text-xs mb-1">Comprador</p>
                    <p className="text-[#e8e8e8]">{t.buyer?.firstName} {t.buyer?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-[#555555] uppercase text-xs mb-1">Vendedor</p>
                    <p className="text-[#e8e8e8]">{t.seller?.firstName} {t.seller?.lastName}</p>
                  </div>
                </div>
                <div className="border border-orange-900/40 bg-orange-950/10 p-3 mb-4">
                  <p className="text-orange-300 font-rajdhani text-sm">{t.disputeReason}</p>
                </div>
                <textarea
                  rows={2}
                  value={notes[t.id] || ''}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [t.id]: e.target.value }))}
                  className="input-tactical resize-none mb-3"
                  placeholder="Nota sobre la resolución (obligatoria)..."
                />
                <div className="flex gap-3">
                  <button onClick={() => handleResolve(t.id, 'buyer')} className="flex-1 border border-blue-800 bg-blue-950/20 text-blue-300 font-tactical text-xs tracking-wider py-3 hover:bg-blue-950/40 transition-colors">
                    A FAVOR DEL COMPRADOR (REEMBOLSO)
                  </button>
                  <button onClick={() => handleResolve(t.id, 'seller')} className="flex-1 border border-green-800 bg-green-950/20 text-green-300 font-tactical text-xs tracking-wider py-3 hover:bg-green-950/40 transition-colors">
                    A FAVOR DEL VENDEDOR (LIBERAR PAGO)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}