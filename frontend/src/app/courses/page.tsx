'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { coursesService, Course } from '../../lib/courses';
import { authService } from '../../lib/auth';
import { MapPin, Clock, Users, Calendar, ArrowLeft } from 'lucide-react';
import Logo from '../../components/Logo';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await coursesService.getAll();
      setCourses(data);
    } catch {
      toast.error('Error cargando cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (course: Course) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (course.availableSpots <= 0) {
      toast.error('No hay cupos disponibles');
      return;
    }
    router.push(`/courses/${course.id}/checkout`);
  };

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
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-[#888888] hover:text-[#c9a227] transition-colors font-rajdhani text-sm tracking-wider uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            Inicio
          </button>
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            {currentUser ? (
              <button onClick={() => router.push('/products')} className="text-[#888888] hover:text-[#c9a227] transition-colors font-rajdhani text-sm tracking-wider uppercase">
                Marketplace
              </button>
            ) : (
              <>
                <button onClick={() => router.push('/login')} className="text-[#888888] hover:text-[#e8e8e8] font-tactical text-sm tracking-wider uppercase transition-colors">Ingresar</button>
                <button onClick={() => router.push('/register')} className="btn-tactical text-sm py-2 px-5">Registrarse</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="border-b border-[#333333] bg-[#111111]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-[#c9a227]" />
            <span className="text-[#c9a227] text-xs tracking-[0.4em] uppercase font-rajdhani">Formación táctica</span>
          </div>
          <h1 className="font-tactical text-6xl text-[#e8e8e8] tracking-wide mb-4">NUESTROS CURSOS</h1>
          <p className="text-[#888888] font-rajdhani text-xl max-w-2xl">
            Formación integral para tiradores de todos los niveles. Inscribite y pagá de forma segura con Mercado Pago.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 border border-[#333333]">
            <span className="text-4xl opacity-20">🎯</span>
            <p className="text-[#888888] font-rajdhani tracking-widest text-sm uppercase">No hay cursos disponibles por el momento</p>
            <a href="https://wa.me/543624168421" target="_blank" rel="noopener noreferrer" className="btn-tactical-outline text-sm py-2 px-6">
              CONSULTAR POR WHATSAPP
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const isFull = course.availableSpots <= 0;
              const hasPromo = course.discountPrice && course.discountPrice < course.price;
              const finalPrice = hasPromo ? course.discountPrice! : course.price;

              return (
                <div key={course.id} className="card-tactical group overflow-hidden flex flex-col">
                  {/* Imagen */}
                  <div className="relative h-52 bg-[#1a1a1a] overflow-hidden">
                    {course.image ? (
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">🎯</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {course.promoLabel && (
                        <span className="font-tactical text-xs px-3 py-1 bg-[#c9a227] text-[#0a0a0a] tracking-wider">
                          {course.promoLabel}
                        </span>
                      )}
                      {isFull && (
                        <span className="font-tactical text-xs px-3 py-1 bg-red-900 text-red-300 tracking-wider">
                          SIN CUPOS
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-tactical text-xl text-[#e8e8e8] tracking-wide mb-3">{course.title}</h3>
                    <p className="text-[#888888] font-rajdhani text-sm leading-relaxed mb-4 line-clamp-3">{course.description}</p>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-[#888888]">
                        <Calendar className="w-3 h-3 text-[#c9a227] flex-shrink-0" />
                        <span className="font-rajdhani text-xs">
                          {new Date(course.startDate).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[#888888]">
                        <Clock className="w-3 h-3 text-[#c9a227] flex-shrink-0" />
                        <span className="font-rajdhani text-xs">{course.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#888888]">
                        <MapPin className="w-3 h-3 text-[#c9a227] flex-shrink-0" />
                        <span className="font-rajdhani text-xs">{course.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#888888]">
                        <Users className="w-3 h-3 text-[#c9a227] flex-shrink-0" />
                        <span className="font-rajdhani text-xs">{course.availableSpots} cupos disponibles de {course.totalSpots}</span>
                      </div>
                    </div>

                    {/* Precio y botón */}
                    <div className="mt-auto pt-4 border-t border-[#333333]">
                      <div className="flex items-end justify-between mb-4">
                        <div>
                          {hasPromo && (
                            <div className="text-[#555555] font-rajdhani text-sm line-through">
                              ${Number(course.price).toLocaleString('es-AR')}
                            </div>
                          )}
                          <div className="font-tactical text-2xl text-[#c9a227]">
                            ${Number(finalPrice).toLocaleString('es-AR')}
                            <span className="text-[#555555] text-sm font-rajdhani ml-1 font-normal">ARS</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEnroll(course)}
                        disabled={isFull}
                        className="btn-tactical w-full text-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isFull ? 'SIN CUPOS' : 'INSCRIBIRME'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}