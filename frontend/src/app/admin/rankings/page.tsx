'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { reportsService, RankingsOverview } from '../../../lib/reports';
import { authService } from '../../../lib/auth';
import { UserRole } from '../../../types/user.types';
import { Trophy, Eye, Users as UsersIcon } from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar';

export default function AdminRankingsPage() {
  const router = useRouter();
  const [data, setData] = useState<RankingsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== UserRole.ADMIN) { router.push('/login'); return; }
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const overview = await reportsService.getRankings();
      setData(overview);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#333333] border-t-[#c9a227] rounded-full animate-spin" />
    </div>
  );

  const fmt = (n: number) => `$${n.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AdminNavbar active="rankings" />

      <div className="border-b border-[#333333] bg-[#111111]">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-px bg-[#c9a227]" />
            <span className="text-[#c9a227] text-xs tracking-[0.3em] uppercase font-rajdhani">Panel de control</span>
          </div>
          <h1 className="font-tactical text-5xl text-[#e8e8e8] tracking-wide">RANKINGS</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Top vendedores */}
        <div className="border border-[#333333] bg-[#111111] p-6">
          <div className="flex items-center gap-3 mb-4 pb-2 border-b border-[#333333]">
            <Trophy className="w-4 h-4 text-[#c9a227]" />
            <h3 className="font-tactical text-lg tracking-wider text-[#c9a227]">TOP VENDEDORES</h3>
          </div>
          {data.topSellers.length === 0 ? (
            <p className="text-[#888888] font-rajdhani text-sm py-4">Todavía no hay ventas registradas.</p>
          ) : (
            <div className="space-y-2">
              {data.topSellers.map((s, i) => (
                <div key={s.sellerId} className="flex items-center justify-between bg-[#1a1a1a] border border-[#333333] p-4">
                  <div className="flex items-center gap-4">
                    <span className="font-tactical text-2xl text-[#c9a227] w-8">#{i + 1}</span>
                    <div>
                      <p className="font-rajdhani font-semibold text-[#e8e8e8]">{s.sellerName}</p>
                      <p className="text-[#555555] font-rajdhani text-xs">{s.salesCount} ventas</p>
                    </div>
                  </div>
                  <p className="font-tactical text-lg text-[#c9a227]">{fmt(s.totalRevenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Productos más vistos */}
        <div className="border border-[#333333] bg-[#111111] p-6">
          <div className="flex items-center gap-3 mb-4 pb-2 border-b border-[#333333]">
            <Eye className="w-4 h-4 text-[#c9a227]" />
            <h3 className="font-tactical text-lg tracking-wider text-[#c9a227]">PRODUCTOS MÁS VISTOS</h3>
          </div>
          {data.mostViewedProducts.length === 0 ? (
            <p className="text-[#888888] font-rajdhani text-sm py-4">No hay productos cargados.</p>
          ) : (
            <div className="space-y-2">
              {data.mostViewedProducts.map((p, i) => (
                <div key={p.id} className="flex items-center justify-between bg-[#1a1a1a] border border-[#333333] p-4">
                  <div className="flex items-center gap-4">
                    <span className="font-tactical text-2xl text-[#c9a227] w-8">#{i + 1}</span>
                    <div className="w-12 h-12 bg-[#0a0a0a] border border-[#333333] overflow-hidden flex-shrink-0">
                      {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <p className="font-rajdhani font-semibold text-[#e8e8e8]">{p.name}</p>
                      <p className="text-[#555555] font-rajdhani text-xs">
                        {p.seller?.firstName} {p.seller?.lastName} · {fmt(p.price)}
                      </p>
                    </div>
                  </div>
                  <p className="font-tactical text-lg text-[#c9a227] flex items-center gap-2">
                    <Eye className="w-4 h-4" /> {p.views}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top cursos */}
        <div className="border border-[#333333] bg-[#111111] p-6">
          <div className="flex items-center gap-3 mb-4 pb-2 border-b border-[#333333]">
            <UsersIcon className="w-4 h-4 text-[#c9a227]" />
            <h3 className="font-tactical text-lg tracking-wider text-[#c9a227]">CURSOS CON MÁS INSCRIPTOS</h3>
          </div>
          {data.topCourses.length === 0 ? (
            <p className="text-[#888888] font-rajdhani text-sm py-4">Todavía no hay inscripciones pagadas.</p>
          ) : (
            <div className="space-y-2">
              {data.topCourses.map((c, i) => (
                <div key={c.courseId} className="flex items-center justify-between bg-[#1a1a1a] border border-[#333333] p-4">
                  <div className="flex items-center gap-4">
                    <span className="font-tactical text-2xl text-[#c9a227] w-8">#{i + 1}</span>
                    <div>
                      <p className="font-rajdhani font-semibold text-[#e8e8e8]">{c.courseTitle}</p>
                      <p className="text-[#555555] font-rajdhani text-xs">{c.enrollmentCount} inscriptos</p>
                    </div>
                  </div>
                  <p className="font-tactical text-lg text-[#c9a227]">{fmt(c.totalRevenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}