import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-rajdhani">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#333333] bg-[#0a0a0a]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="Apuntar Academia" width={521} height={479} style={{ height: 36, width: 'auto' }} priority />
            <Image src="/images/letras.png" alt="Apuntar Academia" width={713} height={200} style={{ height: 22, width: 'auto' }} className="hidden sm:block" />
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-[#888888] hover:text-[#e8e8e8] font-tactical text-sm tracking-wider uppercase transition-colors"
            >
              Ingresar
            </Link>
            <Link
              href="/register"
              className="btn-tactical text-sm py-2 px-5"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <Image
            src="/images/curso_tiro_inicial.png"
            alt="Apuntar Academia"
            fill
            className="object-cover object-center opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
        </div>

        {/* Grilla táctica */}
        <div className="absolute inset-0 bg-tactical-grid opacity-40" />

        {/* Contenido */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-[#c9a227]" />
              <span className="text-[#c9a227] text-xs tracking-[0.4em] uppercase">
                Formación Táctica Integral
              </span>
            </div>
            <h1 className="font-tactical text-6xl md:text-8xl text-[#e8e8e8] leading-none tracking-wide mb-6">
              APUNTÁ<br />
              <span className="text-[#c9a227]">MÁS ALTO</span>
            </h1>
            <p className="text-[#888888] text-xl leading-relaxed mb-10 max-w-lg">
              Formación táctica de élite, comercio legal de armas y una comunidad que te impulsa a superarte. Todo en un solo lugar.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="btn-tactical text-base py-4 px-8">
                COMENZAR AHORA
              </Link>
              <a
                href="https://wa.me/543624168421"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-tactical-outline text-base py-4 px-8 flex items-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#c9a227">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                CONTACTAR
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-8 bg-gradient-to-b from-[#c9a227] to-transparent" />
        </div>
      </section>

      {/* QUÉ OFRECEMOS */}
      <section className="py-24 border-t border-[#333333]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-px bg-[#c9a227]" />
              <span className="text-[#c9a227] text-xs tracking-[0.4em] uppercase">Lo que hacemos</span>
              <div className="w-8 h-px bg-[#c9a227]" />
            </div>
            <h2 className="font-tactical text-5xl text-[#e8e8e8] tracking-wide">
              FORMACIÓN INTEGRAL
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: '🎯',
                title: 'FORMACIÓN TÁCTICA',
                desc: 'Cursos de tiro de precisión, dinámico y defensa personal. Formación por niveles para principiantes y avanzados.',
              },
              {
                icon: '⚖️',
                title: 'COMERCIO LEGAL',
                desc: 'Plataforma regulada por ANMAC para la compra y venta segura de armas en Argentina. Sistema de escrow que protege cada transacción.',
              },
              {
                icon: '🤝',
                title: 'COMUNIDAD',
                desc: 'Rodeate de personas que comparten tu pasión y te impulsan a superarte. Eventos, jornadas y competencias en todo el país.',
              },
            ].map((item) => (
              <div key={item.title} className="card-tactical p-8 group">
                <div className="text-4xl mb-6">{item.icon}</div>
                <h3 className="font-tactical text-xl text-[#c9a227] tracking-wider mb-4">{item.title}</h3>
                <p className="text-[#888888] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALERÍA / COMUNIDAD */}
      <section className="py-24 border-t border-[#333333] bg-[#111111]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-px bg-[#c9a227]" />
                <span className="text-[#c9a227] text-xs tracking-[0.4em] uppercase">Nuestra comunidad</span>
              </div>
              <h2 className="font-tactical text-5xl text-[#e8e8e8] tracking-wide leading-tight mb-6">
                RODEATE DE<br />
                <span className="text-[#c9a227]">PERSONAS QUE</span><br />
                TE IMPULSAN
              </h2>
              <p className="text-[#888888] text-lg leading-relaxed mb-8">
                En Apuntar Academia no solo aprendés a tirar. Formás parte de una comunidad comprometida con la excelencia, el respeto y la formación continua.
              </p>
              <a
                href="https://www.instagram.com/apuntar.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-tactical-outline flex items-center gap-3 w-fit"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#c9a227">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                SEGUINOS EN INSTAGRAM
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative h-64 overflow-hidden border border-[#333333]">
                <Image src="/images/te motiven a impulsarte.png" alt="Comunidad Apuntar" fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="relative h-64 overflow-hidden border border-[#333333]">
                <Image src="/images/julian.png" alt="Instructor Apuntar" fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="relative h-64 overflow-hidden border border-[#333333] col-span-2">
                <Image src="/images/sniper.jpg" alt="Tiro de precisión" fill className="object-cover object-top hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARKETPLACE */}
      <section className="py-24 border-t border-[#333333]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 overflow-hidden border border-[#c9a227]/30">
              <Image src="/images/curso tiro inicial.png" alt="Marketplace Apuntar" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
              <div className="absolute bottom-6 left-6">
                <span className="font-tactical text-xs text-[#c9a227] tracking-[0.3em] uppercase">Plataforma regulada · ANMAC</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-px bg-[#c9a227]" />
                <span className="text-[#c9a227] text-xs tracking-[0.4em] uppercase">Marketplace</span>
              </div>
              <h2 className="font-tactical text-5xl text-[#e8e8e8] tracking-wide leading-tight mb-6">
                COMPRÁ Y VENDÉ<br />
                <span className="text-[#c9a227]">CON SEGURIDAD</span>
              </h2>
              <p className="text-[#888888] text-lg leading-relaxed mb-8">
                La primera plataforma argentina de comercio legal de armas. Verificación de identidad, sistema de escrow y moderación por administradores certificados.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'Verificación CLU y DNI obligatoria',
                  'Sistema de escrow que protege tu dinero',
                  'Chat integrado para coordinar la entrega',
                  'Calificaciones y reputación de vendedores',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-[#c9a227] rounded-full flex-shrink-0" />
                    <span className="text-[#888888]">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/products" className="btn-tactical text-base py-3 px-8">
                VER CATÁLOGO
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 border-t border-[#333333] bg-[#111111] relative overflow-hidden">
        <div className="absolute inset-0 bg-tactical-grid opacity-30" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-[#c9a227]" />
            <span className="text-[#c9a227] text-xs tracking-[0.4em] uppercase">Sumate</span>
            <div className="w-8 h-px bg-[#c9a227]" />
          </div>
          <h2 className="font-tactical text-6xl text-[#e8e8e8] tracking-wide mb-6">
            ¿LISTO PARA<br />
            <span className="text-[#c9a227]">APUNTAR?</span>
          </h2>
          <p className="text-[#888888] text-xl leading-relaxed mb-10">
            Creá tu cuenta gratis y accedé al marketplace de armas legales más completo de Argentina.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register" className="btn-tactical text-base py-4 px-10">
              CREAR CUENTA GRATIS
            </Link>
            <a
              href="https://wa.me/543624168421"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactical-outline text-base py-4 px-10"
            >
              HABLAR CON NOSOTROS
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#333333] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="Apuntar" width={521} height={479} style={{ height: 28, width: 'auto' }} />
            <span className="text-[#555555] font-rajdhani text-sm">Apuntar Academia · Formación Táctica Integral</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://www.instagram.com/apuntar.ar" target="_blank" rel="noopener noreferrer" className="text-[#555555] hover:text-[#c9a227] transition-colors font-rajdhani text-sm uppercase tracking-wider">Instagram</a>
            <a href="https://wa.me/543624168421" target="_blank" rel="noopener noreferrer" className="text-[#555555] hover:text-[#c9a227] transition-colors font-rajdhani text-sm uppercase tracking-wider">WhatsApp</a>
            <Link href="/products" className="text-[#555555] hover:text-[#c9a227] transition-colors font-rajdhani text-sm uppercase tracking-wider">Marketplace</Link>
          </div>
          <p className="text-[#444444] font-rajdhani text-xs">© 2026 Apuntar Academia · Regulado por ANMAC</p>
        </div>
      </footer>

    </div>
  );
}