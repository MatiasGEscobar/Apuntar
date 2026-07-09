'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));

        // Guardar en localStorage igual que el login normal
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Redirigir según el rol
        if (user.role === 'admin') router.push('/admin/users');
        else if (user.role === 'seller') router.push('/seller/products');
        else router.push('/products');
      } catch {
        router.push('/login?error=google_auth_failed');
      }
    } else {
      router.push('/login?error=google_auth_failed');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#333333] border-t-[#c9a227] rounded-full animate-spin" />
        <p className="text-[#888888] font-rajdhani tracking-widest text-sm uppercase">
          Autenticando con Google...
        </p>
      </div>
    </div>
  );
}