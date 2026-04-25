'use client';

import { authService } from '../lib/auth';
import { UserStatus } from '../types/user.types';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VerificationBanner() {
  const user = authService.getCurrentUser();
  const router = useRouter();

  if (!user) return null;

  if (user.status === UserStatus.APPROVED) return null;

  const getBannerConfig = () => {
    switch (user.status) {
      case UserStatus.PENDING:
        return {
          icon: Clock,
          bgColor: 'bg-yellow-900 bg-opacity-30',
          borderColor: 'border-yellow-600',
          textColor: 'text-yellow-200',
          iconColor: 'text-yellow-500',
          title: 'Cuenta Pendiente de Verificación',
          message: 'Para poder comprar o vender, debes subir tus documentos y esperar la aprobación.',
          action: 'Subir Documentos',
          actionLink: '/profile/documents',
        };
      case UserStatus.IN_REVIEW:
        return {
          icon: Clock,
          bgColor: 'bg-blue-900 bg-opacity-30',
          borderColor: 'border-blue-600',
          textColor: 'text-blue-200',
          iconColor: 'text-blue-500',
          title: 'Cuenta en Revisión',
          message: 'Tus documentos están siendo revisados por un administrador. Recibirás una notificación pronto.',
          action: null,
          actionLink: null,
        };
      case UserStatus.REJECTED:
        return {
          icon: XCircle,
          bgColor: 'bg-red-900 bg-opacity-30',
          borderColor: 'border-red-600',
          textColor: 'text-red-200',
          iconColor: 'text-red-500',
          title: 'Cuenta Rechazada',
          message: user.rejectionReason || 'Tu cuenta fue rechazada. Contacta a soporte para más información.',
          action: 'Reintentar Verificación',
          actionLink: '/profile/documents',
        };
      case UserStatus.SUSPENDED:
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-900 bg-opacity-30',
          borderColor: 'border-red-600',
          textColor: 'text-red-200',
          iconColor: 'text-red-500',
          title: 'Cuenta Suspendida',
          message: 'Tu cuenta ha sido suspendida. Contacta a soporte para más información.',
          action: null,
          actionLink: null,
        };
      default:
        return null;
    }
  };

  const config = getBannerConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-xl p-4 mb-6`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h3 className={`${config.textColor} font-semibold mb-1`}>{config.title}</h3>
          <p className={`${config.textColor} text-sm`}>{config.message}</p>
          {config.action && config.actionLink && (
            <button
              onClick={() => router.push(config.actionLink)}
              className="mt-3 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              {config.action}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}