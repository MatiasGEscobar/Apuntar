'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { reportsService, RevenueOverview } from '../../../lib/reports';
import { authService } from '../../../lib/auth';
import { UserRole } from '../../../types/user.types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import AdminNavbar from '../../../components/AdminNavbar';

export default function AdminRevenuePage() {
  const router = useRouter();
  const [data, setData] = useState<RevenueOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== UserRole.ADMIN) { router.push('/login'); return; }
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const overview = await reportsService.getRevenue();
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

  const chartData = [
    { name: 'Productos', comisión: data.products.totalCommission, ventas: data.products.totalSales },
    { name: 'Cursos', comisión: data.courses.platformCommission, ventas: data.courses.totalRevenue },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AdminNavbar active="revenue" />

      <div className="border-b border-[#333333] bg-[#111111]">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-px bg-[#c9a227]" />
            <span className="text-[#c9a227] text-xs tracking-[0.3em] uppercase font-rajdhani">Panel de control</span>
          </div>
          <h1 className="font-tactical text-5xl text-[#e8e8e8] tracking-wide">INGRESOS Y COMISIONES</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Cards resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-[#c9a227]/30 bg-[#c9a227]/5 p-6">
            <p className="text-[#c9a227] font-rajdhani text-xs tracking-[0.2em] uppercase mb-2">Comisión total de la plataforma</p>
            <p className="font-tactical text-4xl text-[#c9a227]">{fmt(data.platform.totalCommission)}</p>
          </div>
          <div className="border border-[#333333] bg-[#111111] p-6">
            <p className="text-[#888888] font-rajdhani text-xs tracking-[0.2em] uppercase mb-2">Ventas de productos</p>
            <p className="font-tactical text-3xl text-[#e8e8e8]">{fmt(data.products.totalSales)}</p>
            <p className="text-[#555555] font-rajdhani text-xs mt-1">{data.products.transactionCount} transacciones</p>
          </div>
          <div className="border border-[#333333] bg-[#111111] p-6">
            <p className="text-[#888888] font-rajdhani text-xs tracking-[0.2em] uppercase mb-2">Ingresos de cursos</p>
            <p className="font-tactical text-3xl text-[#e8e8e8]">{fmt(data.courses.totalRevenue)}</p>
            <p className="text-[#555555] font-rajdhani text-xs mt-1">{data.courses.enrollmentCount} inscripciones pagadas</p>
          </div>
        </div>

        {/* Detalle cursos */}
        <div className="border border-[#333333] bg-[#111111] p-6">
          <h3 className="font-tactical text-lg tracking-wider text-[#c9a227] mb-4 pb-2 border-b border-[#333333]">
            DESGLOSE DE CURSOS
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-[#555555] font-rajdhani text-xs uppercase tracking-wider mb-1">Ingreso total</p>
              <p className="text-[#e8e8e8] font-rajdhani font-semibold">{fmt(data.courses.totalRevenue)}</p>
            </div>
            <div>
              <p className="text-[#555555] font-rajdhani text-xs uppercase tracking-wider mb-1">Comisión plataforma (3%)</p>
              <p className="text-[#c9a227] font-rajdhani font-semibold">{fmt(data.courses.platformCommission)}</p>
            </div>
            <div>
              <p className="text-[#555555] font-rajdhani text-xs uppercase tracking-wider mb-1">Neto academia</p>
              <p className="text-green-400 font-rajdhani font-semibold">{fmt(data.courses.academiaNet)}</p>
            </div>
          </div>
        </div>

        {/* Gráfico comparativo */}
        <div className="border border-[#333333] bg-[#111111] p-6">
          <h3 className="font-tactical text-lg tracking-wider text-[#c9a227] mb-4 pb-2 border-b border-[#333333]">
            COMPARATIVA
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#888888" style={{ fontFamily: 'Rajdhani', fontSize: 12 }} />
                <YAxis stroke="#888888" style={{ fontFamily: 'Rajdhani', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#111111', border: '1px solid #333333', fontFamily: 'Rajdhani' }}
                  formatter={(value: any) => fmt(Number(value))}
                />
                <Legend wrapperStyle={{ fontFamily: 'Rajdhani', fontSize: 12 }} />
                <Bar dataKey="ventas" fill="#333333" name="Ventas/Ingresos totales" />
                <Bar dataKey="comisión" fill="#c9a227" name="Comisión plataforma" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}