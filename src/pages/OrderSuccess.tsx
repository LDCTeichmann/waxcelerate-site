import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useLanguage } from '@/hooks/useLanguage';

export function OrderSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const clear = useCartStore((s) => s.clear);
  const { t } = useLanguage();

  useEffect(() => {
    if (sessionId) clear();
  }, [sessionId, clear]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center"
      style={{ background: 'var(--pg)' }}
    >
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.30)' }}
      >
        <CheckCircle className="h-8 w-8 text-green-400" />
      </div>

      {/* Text */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-wx-tx1">{t.cart.orderSuccess}</h1>
        <p className="text-wx-tx2 text-sm max-w-sm leading-relaxed">{t.cart.orderSuccessText}</p>
      </div>

      {/* CTA */}
      <Link
        to="/"
        className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white text-sm transition-all hover:opacity-90"
        style={{ background: '#4A6AEE' }}
      >
        {t.cart.backHome}
      </Link>
    </div>
  );
}
