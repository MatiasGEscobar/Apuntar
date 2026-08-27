'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, ChevronDown } from 'lucide-react';
import { UserRole } from '../types/user.types';
import Logo from './logo';

export default function LandingNavbar() {
  const { user, isLoading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#333333] bg-[#0a0a0a]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Logo size="sm" />

        {isLoading ? (
          <div className="w-24 h-8" />
        ) : user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 text-[#e8e8e8] hover:text-[#c9a227] transition-colors font-rajdhani text-sm tracking-wider uppercase"
            >
              <UserIcon className="w-5 h-5" />
              {user.firstName}
              <ChevronDown className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#111111] border border-[#333333] shadow-xl">
                <Link href="/products" className="block px-4 py-3 text-sm font-rajdhani text-[#e8e8e8] hover:bg-[#1a1a1a] hover:text-[#c9a227] transition-colors">
                  Ver catálogo
                </Link>
                <Link href="/transactions" className="block px-4 py-3 text-sm font-rajdhani text-[#e8e8e8] hover:bg-[#1a1a1a] hover:text-[#c9a227] transition-colors">
                  Mis transacciones
                </Link>

                {user.role === UserRole.SELLER && (
                  <Link href="/seller/products" className="block px-4 py-3 text-sm font-rajdhani text-[#e8e8e8] hover:bg-[#1a1a1a] hover:text-[#c9a227] transition-colors">
                    Mis productos
                  </Link>
                )}

                {user.role === UserRole.ADMIN && (
                  <>
                    <Link href="/admin/users" className="block px-4 py-3 text-sm font-rajdhani text-[#e8e8e8] hover:bg-[#1a1a1a] hover:text-[#c9a227] transition-colors">
                      Usuarios
                    </Link>
                    <Link href="/admin/products" className="block px-4 py-3 text-sm font-rajdhani text-[#e8e8e8] hover:bg-[#1a1a1a] hover:text-[#c9a227] transition-colors">
                      Productos
                    </Link>
                    <Link href="/admin/courses" className="block px-4 py-3 text-sm font-rajdhani text-[#e8e8e8] hover:bg-[#1a1a1a] hover:text-[#c9a227] transition-colors">
                      Cursos
                    </Link>
                  </>
                )}

                <button
                  onClick={() => { setMenuOpen(false); logout(); }}
                  className="w-full text-left px-4 py-3 text-sm font-tactical tracking-wider text-red-400 hover:bg-red-950/20 transition-colors border-t border-[#333333]"
                >
                  CERRAR SESIÓN
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[#888888] hover:text-[#e8e8e8] font-tactical text-sm tracking-wider uppercase transition-colors">
              Ingresar
            </Link>
            <Link href="/register" className="btn-tactical text-sm py-2 px-5">
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}