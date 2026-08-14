'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { coursesService, Course } from '../lib/courses';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';

export default function CoursesSection() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesService.getAll()
      .then(data => setCourses(data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || courses.length === 0) return null;

  return (
    <section className="py-24 border-t border-[#333333]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-16 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-[#c9a227]" />
              <span className="text-[#c9a227] text-xs tracking-[0.4em] uppercase">Próximas fechas</span>
            </div>
            <h2 className="font-tactical text-5xl text-[#e8e8e8] tracking-wide">CURSOS DISPONIBLES</h2>
          </div>
          <button
            onClick={() => router.push('/courses')}
            className="btn-tactical-outline flex items-center gap-2 py-3 px-6"
          >
            VER TODOS <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.map((course) => {
            const hasPromo = course.discountPrice && course.discountPrice < course.price;
            const finalPrice = hasPromo ? course.discountPrice! : course.price;
            const isFull = course.availableSpots <= 0;

            return (
              <div key={course.id} className="card-tactical group overflow-hidden">
                {/* Imagen */}
                <div className="relative h-44 bg-[#1a1a1a] overflow-hidden">
                  {course.image ? (
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🎯</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                  {course.promoLabel && (
                    <div className="absolute top-3 left-3">
                      <span className="font-tactical text-xs px-3 py-1 bg-[#c9a227] text-[#0a0a0a] tracking-wider">
                        {course.promoLabel}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-tactical text-lg text-[#e8e8e8] tracking-wide mb-3">{course.title}</h3>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-[#888888]">
                      <Calendar className="w-3 h-3 text-[#c9a227]" />
                      <span className="font-rajdhani text-xs">
                        {new Date(course.startDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[#888888]">
                      <MapPin className="w-3 h-3 text-[#c9a227]" />
                      <span className="font-rajdhani text-xs">{course.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#888888]">
                      <Users className="w-3 h-3 text-[#c9a227]" />
                      <span className="font-rajdhani text-xs">{course.availableSpots} cupos disponibles</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#333333]">
                    <div>
                      {hasPromo && (
                        <div className="text-[#555555] font-rajdhani text-xs line-through">
                          ${Number(course.price).toLocaleString('es-AR')}
                        </div>
                      )}
                      <div className="font-tactical text-xl text-[#c9a227]">
                        ${Number(finalPrice).toLocaleString('es-AR')}
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/courses/${course.id}/checkout`)}
                      disabled={isFull}
                      className="btn-tactical text-xs py-2 px-4 disabled:opacity-50"
                    >
                      {isFull ? 'SIN CUPOS' : 'INSCRIBIRME'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}