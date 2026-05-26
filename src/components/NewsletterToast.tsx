'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const TOAST_MESSAGES: Record<string, { type: 'success' | 'error' | 'warning' | 'info'; title: string; description: string }> = {
  verified: {
    type: 'success',
    title: 'Suscripción confirmada correctamente',
    description: 'Ya recibirás el informe semanal de riesgo en tu correo.',
  },
  invalid_token: {
    type: 'warning',
    title: 'El enlace de verificación no es válido o ya expiró',
    description: 'Solicita un nuevo enlace desde el formulario de suscripción.',
  },
  error: {
    type: 'error',
    title: 'Error al verificar la suscripción',
    description: 'Ocurrió un error inesperado. Inténtalo de nuevo más tarde.',
  },
  unsubscribed: {
    type: 'info',
    title: 'Te has dado de baja correctamente',
    description: 'Has sido eliminado de la lista de correo.',
  },
};

function ToastInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const newsletterParam = searchParams.get('newsletter');
  const config = newsletterParam ? TOAST_MESSAGES[newsletterParam] : null;

  useEffect(() => {
    if (config && !dismissed) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          const params = new URLSearchParams(searchParams.toString());
          params.delete('newsletter');
          const newPath = params.toString() ? `${window.location.pathname}?${params}` : window.location.pathname;
          router.replace(newPath, { scroll: false });
        }, 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [config, dismissed, router, searchParams]);

  if (!visible || !config) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <XCircle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  const bgColors = {
    success: 'bg-green-900/80 border-green-700',
    error: 'bg-red-900/80 border-red-700',
    warning: 'bg-amber-900/80 border-amber-700',
    info: 'bg-blue-900/80 border-blue-700',
  };

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('newsletter');
    const newPath = params.toString() ? `${window.location.pathname}?${params}` : window.location.pathname;
    router.replace(newPath, { scroll: false });
  };

  return (
    <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-[1040] w-full max-w-md px-4 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      <div className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-md ${bgColors[config.type]}`}>
        <div className="flex-shrink-0 mt-0.5">{icons[config.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold">{config.title}</p>
          {config.description && (
            <p className="text-slate-300 text-xs mt-1">{config.description}</p>
          )}
        </div>
        <button onClick={handleDismiss} className="flex-shrink-0 text-slate-400 hover:text-white transition-colors" aria-label="Cerrar">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function NewsletterToast() {
  return (
    <Suspense fallback={null}>
      <ToastInner />
    </Suspense>
  );
}
