'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { coursesService, Course } from '../../../lib/courses';
import { authService } from '../../../lib/auth';
import { UserRole } from '../../../types/user.types';
import { Plus, Pencil, Trash2, LogOut, Users, Package } from 'lucide-react';
import Logo from '../../../components/logo';
import ImageUpload from '../../../components/upload/ImageUpload';
import toast from 'react-hot-toast';

const emptyForm = {
  title: '',
  description: '',
  image: '',
  price: '',
  discountPrice: '',
  promoLabel: '',
  startDate: '',
  schedule: '',
  totalSpots: '',
  availableSpots: '',
  location: '',
  isActive: true,
};

export default function AdminCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== UserRole.ADMIN) { router.push('/login'); return; }
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await coursesService.getAllAdmin();
      setCourses(data);
    } catch {
      toast.error('Error cargando cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingId(course.id);
    setFormData({
      title: course.title,
      description: course.description,
      image: course.image || '',
      price: String(course.price),
      discountPrice: course.discountPrice ? String(course.discountPrice) : '',
      promoLabel: course.promoLabel || '',
      startDate: course.startDate?.slice(0, 16) || '',
      schedule: course.schedule || '',
      totalSpots: String(course.totalSpots),
      availableSpots: String(course.availableSpots),
      location: course.location || '',
      isActive: course.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este curso?')) return;
    try {
      await coursesService.remove(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      toast.success('Curso eliminado');
    } catch {
      toast.error('Error al eliminar curso');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        image: formData.image,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
        promoLabel: formData.promoLabel || undefined,
        startDate: formData.startDate,
        schedule: formData.schedule,
        totalSpots: Number(formData.totalSpots),
        availableSpots: Number(formData.availableSpots),
        location: formData.location,
        isActive: formData.isActive,
      };

      if (editingId) {
        const updated = await coursesService.update(editingId, payload);
        setCourses(prev => prev.map(c => c.id === editingId ? updated : c));
        toast.success('Curso actualizado');
      } else {
        const created = await coursesService.create(payload);
        setCourses(prev => [...prev, created]);
        toast.success('Curso creado');
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm);
    } catch {
      toast.error('Error al guardar curso');
    } finally {
      setSaving(false);
    }
  };

  const set = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
  const labelClass = "block text-[#888888] text-xs tracking-[0.2em] uppercase font-rajdhani mb-2";
  const sectionTitle = "font-tactical text-lg tracking-wider text-[#c9a227] mb-4 pb-2 border-b border-[#333333]";

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#333333] border-t-[#c9a227] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Navbar */}
      <nav className="border-b border-[#333333] bg-[#0a0a0a]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo size="sm" />
            <div className="hidden md:flex items-center gap-1">
              <button onClick={() => router.push('/admin/users')} className="flex items-center gap-2 px-4 py-2 font-tactical text-sm tracking-wider text-[#888888] hover:text-[#c9a227] transition-colors">
                <Users className="w-4 h-4" /> USUARIOS
              </button>
              <button onClick={() => router.push('/admin/products')} className="flex items-center gap-2 px-4 py-2 font-tactical text-sm tracking-wider text-[#888888] hover:text-[#c9a227] transition-colors">
                <Package className="w-4 h-4" /> PRODUCTOS
              </button>
              <button onClick={() => router.push('/admin/courses')} className="flex items-center gap-2 px-4 py-2 font-tactical text-sm tracking-wider text-[#c9a227] border-b border-[#c9a227]">
                <Plus className="w-4 h-4" /> CURSOS
              </button>
            </div>
          </div>
          <button onClick={() => authService.logout()} className="flex items-center gap-2 text-[#888888] hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="border-b border-[#333333] bg-[#111111]">
        <div className="max-w-7xl mx-auto px-6 py-10 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-px bg-[#c9a227]" />
              <span className="text-[#c9a227] text-xs tracking-[0.3em] uppercase font-rajdhani">Panel de control</span>
            </div>
            <h1 className="font-tactical text-5xl text-[#e8e8e8] tracking-wide">GESTIÓN DE CURSOS</h1>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setFormData(emptyForm); }}
            className="btn-tactical flex items-center gap-2 py-3 px-6"
          >
            <Plus className="w-4 h-4" />
            NUEVO CURSO
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Formulario */}
        {showForm && (
          <div className="border border-[#c9a227]/30 bg-[#111111] p-8 mb-8">
            <h2 className="font-tactical text-2xl text-[#e8e8e8] tracking-wide mb-6">
              {editingId ? 'EDITAR CURSO' : 'NUEVO CURSO'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Info básica */}
              <div>
                <h3 className={sectionTitle}>INFORMACIÓN BÁSICA</h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Título *</label>
                    <input type="text" required value={formData.title} onChange={e => set('title', e.target.value)} className="input-tactical" placeholder="Ej: Curso de Tiro Primera Experiencia" />
                  </div>
                  <div>
                    <label className={labelClass}>Descripción *</label>
                    <textarea required rows={4} value={formData.description} onChange={e => set('description', e.target.value)} className="input-tactical resize-none" placeholder="Descripción completa del curso..." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Ubicación *</label>
                      <input type="text" required value={formData.location} onChange={e => set('location', e.target.value)} className="input-tactical" placeholder="Ej: Resistencia, Chaco" />
                    </div>
                    <div>
                      <label className={labelClass}>Horario *</label>
                      <input type="text" required value={formData.schedule} onChange={e => set('schedule', e.target.value)} className="input-tactical" placeholder="Ej: 09:00 a 17:00 hs" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Fecha y hora de inicio *</label>
                    <input type="datetime-local" required value={formData.startDate} onChange={e => set('startDate', e.target.value)} className="input-tactical" />
                  </div>
                </div>
              </div>

              {/* Precio */}
              <div>
                <h3 className={sectionTitle}>PRECIO Y PROMOCIÓN</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Precio (ARS) *</label>
                    <input type="number" required min="0" value={formData.price} onChange={e => set('price', e.target.value)} className="input-tactical" placeholder="50000" />
                  </div>
                  <div>
                    <label className={labelClass}>Precio con descuento</label>
                    <input type="number" min="0" value={formData.discountPrice} onChange={e => set('discountPrice', e.target.value)} className="input-tactical" placeholder="40000" />
                  </div>
                  <div>
                    <label className={labelClass}>Etiqueta promo</label>
                    <input type="text" value={formData.promoLabel} onChange={e => set('promoLabel', e.target.value)} className="input-tactical" placeholder="Ej: 20% OFF · Últimos cupos" />
                  </div>
                </div>
              </div>

              {/* Cupos */}
              <div>
                <h3 className={sectionTitle}>CUPOS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Cupos totales *</label>
                    <input type="number" required min="1" value={formData.totalSpots} onChange={e => set('totalSpots', e.target.value)} className="input-tactical" placeholder="20" />
                  </div>
                  <div>
                    <label className={labelClass}>Cupos disponibles *</label>
                    <input type="number" required min="0" value={formData.availableSpots} onChange={e => set('availableSpots', e.target.value)} className="input-tactical" placeholder="20" />
                  </div>
                </div>
              </div>

              {/* Imagen */}
              <div>
                <h3 className={sectionTitle}>IMAGEN</h3>
                <ImageUpload
                  onImagesChange={(urls) => set('image', urls[0] || '')}
                  maxImages={1}
                  currentImages={formData.image ? [formData.image] : []}
                  folder="courses"
                />
              </div>

              {/* Estado */}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => set('isActive', e.target.checked)} className="w-4 h-4 accent-[#c9a227]" />
                <label htmlFor="isActive" className="text-[#888888] font-rajdhani text-sm uppercase tracking-wider">Curso activo (visible en la landing)</label>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-tactical-outline flex-1 py-3">CANCELAR</button>
                <button type="submit" disabled={saving} className="btn-tactical flex-1 py-3 disabled:opacity-50">
                  {saving ? 'GUARDANDO...' : editingId ? 'ACTUALIZAR CURSO' : 'CREAR CURSO'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de cursos */}
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 border border-[#333333]">
            <p className="text-[#888888] font-rajdhani tracking-widest text-sm uppercase">No hay cursos creados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="border border-[#333333] bg-[#111111] hover:border-[#c9a227]/30 transition-colors">
                <div className="p-5 flex gap-5 items-start">
                  {/* Imagen */}
                  <div className="w-24 h-24 bg-[#1a1a1a] border border-[#333333] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {course.image ? (
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl opacity-20">🎯</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-tactical text-xl text-[#e8e8e8] tracking-wide">{course.title}</h3>
                        <p className="text-[#888888] font-rajdhani text-sm">{course.location} · {course.schedule}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`font-tactical text-xs px-3 py-1 border ${course.isActive ? 'text-green-400 border-green-900/40 bg-green-950/10' : 'text-[#888888] border-[#333333]'}`}>
                          {course.isActive ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                        {course.promoLabel && (
                          <span className="font-tactical text-xs px-3 py-1 border text-[#c9a227] border-[#c9a227]/30 bg-[#c9a227]/5">
                            {course.promoLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {[
                        { label: 'Precio', value: `$${Number(course.price).toLocaleString('es-AR')}` },
                        { label: 'Precio promo', value: course.discountPrice ? `$${Number(course.discountPrice).toLocaleString('es-AR')}` : '—' },
                        { label: 'Fecha', value: new Date(course.startDate).toLocaleDateString('es-AR') },
                        { label: 'Cupos', value: `${course.availableSpots}/${course.totalSpots}` },
                      ].map((spec) => (
                        <div key={spec.label} className="bg-[#1a1a1a] border border-[#333333] p-3">
                          <p className="text-[#555555] font-rajdhani text-xs tracking-[0.2em] uppercase mb-1">{spec.label}</p>
                          <p className="text-[#e8e8e8] font-rajdhani text-sm font-semibold">{spec.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => handleEdit(course)} className="btn-tactical-outline text-xs py-2 px-4 flex items-center gap-2">
                        <Pencil className="w-3 h-3" /> EDITAR
                      </button>
                      <button onClick={() => handleDelete(course.id)} className="flex items-center gap-2 border border-red-900 bg-red-950/20 text-red-400 font-tactical text-xs tracking-wider px-4 py-2 hover:bg-red-950/40 transition-colors">
                        <Trash2 className="w-3 h-3" /> ELIMINAR
                      </button>
                    </div>
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