'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../lib/auth';
import { usersService } from '../lib/users';
import { productsService } from '../lib/products';
import { coursesService } from '../lib/courses';
import { Users, Package, BookOpen, LogOut } from 'lucide-react';
import Logo from './logo';

interface AdminNavbarProps {
  active: 'users' | 'products' | 'courses';
}

export default function AdminNavbar({ active }: AdminNavbarProps) {
  const router = useRouter();
  const [pendingUsers, setPendingUsers] = useState(0);
  const [pendingProducts, setPendingProducts] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [users, products, courses] = await Promise.all([
          usersService.getAll(),
          productsService.getAll({ status: 'pending' }),
          coursesService.getAllAdmin(),
        ]);
        setPendingUsers(users.filter((u: any) => u.status === 'pending').length);
        setPendingProducts(products.length);
        setTotalCourses(courses.length);
      } catch {}
    };
    loadCounts();
  }, []);

  const navItems = [
    {
      key: 'users',
      label: 'USUARIOS',
      icon: Users,
      count: pendingUsers,
      path: '/admin/users',
    },
    {
      key: 'products',
      label: 'PRODUCTOS',
      icon: Package,
      count: pendingProducts,
      path: '/admin/products',
    },
    {
      key: 'courses',
      label: 'CURSOS',
      icon: BookOpen,
      count: totalCourses,
      path: '/admin/courses',
    },
  ];

  return (
    <nav className="border-b border-[#333333] bg-[#0a0a0a]/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="/admin/users"><Logo size="sm" /></a>
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => router.push(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 font-tactical text-sm tracking-wider transition-colors ${
                    isActive
                      ? 'text-[#c9a227] border-b border-[#c9a227]'
                      : 'text-[#888888] hover:text-[#c9a227]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {item.count > 0 && (
                    <span className="bg-[#c9a227] text-[#0a0a0a] text-xs font-rajdhani px-1.5 py-0.5 font-bold">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <button
          onClick={() => authService.logout()}
          className="flex items-center gap-2 text-[#888888] hover:text-red-400 transition-colors font-rajdhani text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:block">SALIR</span>
        </button>
      </div>
    </nav>
  );
}