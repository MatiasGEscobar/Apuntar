'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, User as UserIcon, ChevronDown, MessageSquare, Menu as MenuIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsProvider';
import { UserRole } from '../types/user.types';
import Logo from './logo';

interface AppNavbarProps {
  backLabel?: string;
  backHref?: string;
  showAuthLinksWhenLoggedOut?: boolean; // true en páginas públicas: courses, products
}

const PUBLIC_LINKS = [
  { href: '/products', label: 'Catálogo de Productos' },
  { href: '/accessories', label: 'Catálogo de Accesorios' },
  { href: '/courses', label: 'Catálogo de Cursos' },
];

const menuItemClass =
  'block px-4 py-3 text-sm font-rajdhani text-[#e8e8e8] hover:bg-[#1a1a1a] hover:text-[#c9a227] transition-colors';

export default function AppNavbar({
  backLabel,
  backHref,
  showAuthLinksWhenLoggedOut = false,
}: AppNavbarProps) {
  const { user, isLoading, logout } = useAuth();
  const { totalUnread, unreadCounts } = useNotifications();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => setMenuOpen(false);

  const handleChatIconClick = () => {
    const conversationsWithUnread = Object.keys(unreadCounts);
    if (conversationsWithUnread.length === 1) {
      router.push(`/transactions/${conversationsWithUnread[0]}`);
    } else {
      router.push('/transactions');
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="border-b border-[#333333] bg-[#0a0a0a]/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {backHref && backLabel ? (
            <button
              onClick={() => router.push(backHref)}
              className="flex items-center gap-2 text-[#888888] hover:text-[#c9a227] transition-colors font-rajdhani text-sm tracking-wider uppercase"
            >
              <ArrowLeft className="w-4 h-4" />
              {backLabel}
            </button>
          ) : (
            <Logo size="sm" />
          )}
        </div>

        {backHref && backLabel && <Logo size="sm" />}

        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="w-8 h-8" />
          ) : user ? (
            <>
              <button
                onClick={handleChatIconClick}
                className="relative text-[#888888] hover:text-[#c9a227] transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                {totalUnread > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#c9a227] text-[#0a0a0a] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </span>
                )}
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 text-[#e8e8e8] hover:text-[#c9a227] transition-colors font-rajdhani text-sm tracking-wider uppercase"
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="hidden md:block">{user.firstName}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#111111] border border-[#333333] shadow-xl">
                    {/* Secciones públicas */}
                    {PUBLIC_LINKS.map((l) => (
                      <Link key={l.href} href={l.href} onClick={closeMenu} className={menuItemClass}>
                        {l.label}
                      </Link>
                    ))}

                    {/* Mi cuenta */}
                    <div className="border-t border-[#333333]" />
                    <Link href="/transactions" onClick={closeMenu} className={menuItemClass}>
                      Mis transacciones
                    </Link>
                    <Link href="/accessories/mine" onClick={closeMenu} className={menuItemClass}>
                      Mis accesorios
                    </Link>
                    <Link href="/profile/documents" onClick={closeMenu} className={menuItemClass}>
                      Mis documentos
                    </Link>
                    {user.role === UserRole.SELLER && (
                      <Link href="/seller/products" onClick={closeMenu} className={menuItemClass}>
                        Mis productos
                      </Link>
                    )}

                    {/* Administración */}
                    {user.role === UserRole.ADMIN && (
                      <>
                        <div className="border-t border-[#333333]" />
                        <p className="px-4 pt-3 pb-1 text-[10px] tracking-[0.25em] uppercase font-rajdhani text-[#555555]">
                          Administración
                        </p>
                        <Link href="/admin/users" onClick={closeMenu} className={menuItemClass}>Gestión de Usuarios</Link>
                        <Link href="/admin/products" onClick={closeMenu} className={menuItemClass}>Gestión de Productos</Link>
                        <Link href="/admin/courses" onClick={closeMenu} className={menuItemClass}>Gestión de Cursos</Link>
                        <Link href="/admin/disputes" onClick={closeMenu} className={menuItemClass}>Gestión de Disputas</Link>
                        <Link href="/admin/revenue" onClick={closeMenu} className={menuItemClass}>Ingresos</Link>
                        <Link href="/admin/rankings" onClick={closeMenu} className={menuItemClass}>Rankings</Link>
                      </>
                    )}

                    <button
                      onClick={() => { closeMenu(); logout(); }}
                      className="w-full text-left px-4 py-3 text-sm font-tactical tracking-wider text-red-400 hover:bg-red-950/20 transition-colors border-t border-[#333333]"
                    >
                      CERRAR SESIÓN
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Escritorio: links en la barra */}
              <div className="hidden ld:flex items-center gap-6">
                {PUBLIC_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-[#888888] hover:text-[#c9a227] transition-colors font-rajdhani text-sm tracking-wider uppercase"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>

              {/* Mobile: los mismos links en un menú */}
              <div className="relative ld:hidden" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="text-[#888888] hover:text-[#c9a227] transition-colors"
                  aria-label="Menú"
                >
                  <MenuIcon className="w-5 h-5" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-[#111111] border border-[#333333] shadow-xl">
                    {PUBLIC_LINKS.map((l) => (
                      <Link key={l.href} href={l.href} onClick={closeMenu} className={menuItemClass}>
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {showAuthLinksWhenLoggedOut && (
                <>
                  <Link href="/login" className="text-[#888888] hover:text-[#e8e8e8] font-tactical text-sm tracking-wider uppercase transition-colors">
                    Ingresar
                  </Link>
                  <Link href="/register" className="btn-tactical text-sm py-2 px-5">
                    Registrarse
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}