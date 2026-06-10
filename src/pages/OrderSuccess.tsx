import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, MessageCircle, Mail, Loader2, Thermometer, Wrench, Droplets } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { PageTransition } from '@/components/PageTransition';
import { useLanguage } from '@/hooks/useLanguage';
import { getEstimatedDelivery } from '@/lib/utils';

interface OrderItem {
  name: string;
  image: string | null;
  quantity: number;
  amount: number;
}

interface OrderDetails {
  items: OrderItem[];
  total: number;
  currency: string;
  customerEmail: string | null;
  shippingName: string | null;
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

export function OrderSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const clear = useCartStore((s) => s.clear);
  const closeCart = useCartStore((s) => s.closeCart);
  const { lang } = useLanguage();
  const de = lang === 'de';

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(!!sessionId);

  useEffect(() => {
    if (!sessionId) return;
    clear();
    closeCart();
    fetch(`/api/order-details?session_id=${sessionId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setOrder(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId, clear, closeCart]);

  const deliveryDate = getEstimatedDelivery(de ? 'de' : 'en');

  const prepSteps = de
    ? [
        {
          icon: <Droplets className="h-5 w-5" />,
          title: 'Kette entfetten',
          text: 'Neue Kette oder gebrauchte Kette gründlich mit Kettenreiniger oder Isopropanol entfetten.',
        },
        {
          icon: <Thermometer className="h-5 w-5" />,
          title: 'Wachs schmelzen',
          text: 'Waxcelerate im Slow Cooker oder Topf auf 90–95 °C erhitzen, bis es vollständig flüssig ist.',
        },
        {
          icon: <Wrench className="h-5 w-5" />,
          title: 'Kette einlegen',
          text: 'Kette 5–10 Minuten ins flüssige Wachs tauchen, herausnehmen, abkühlen lassen — fertig.',
        },
      ]
    : [
        {
          icon: <Droplets className="h-5 w-5" />,
          title: 'Degrease your chain',
          text: 'Thoroughly degrease a new or used chain with chain cleaner or isopropyl alcohol.',
        },
        {
          icon: <Thermometer className="h-5 w-5" />,
          title: 'Melt the wax',
          text: 'Heat Waxcelerate in a slow cooker or pot to 90–95 °C until fully liquid.',
        },
        {
          icon: <Wrench className="h-5 w-5" />,
          title: 'Submerge chain',
          text: 'Dip the chain into the liquid wax for 5–10 minutes, remove, let cool — done.',
        },
      ];

  const waMsg = encodeURIComponent(
    de
      ? 'Hi Luca! Ich habe gerade bestellt und habe eine Frage:'
      : 'Hi Luca! I just placed an order and have a question:'
  );

  return (
    <PageTransition>
      <div className="min-h-screen" style={{ background: 'var(--pg)' }}>
        {/* Header */}
        <header className="border-b" style={{ borderColor: 'var(--bd)', background: 'var(--pg)' }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
            <Link to="/" className="font-display font-bold text-lg tracking-tight text-wx-tx1">
              WAX<span style={{ color: '#1A3C6E' }}>CELERATE</span>
            </Link>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          {/* Success header */}
          <div className="flex flex-col items-center text-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.30)' }}
            >
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-wx-tx1 mb-1">
                {de ? 'Vielen Dank für deine Bestellung!' : 'Thank you for your order!'}
              </h1>
              <p className="text-[14px] text-wx-txm">
                {order?.customerEmail
                  ? de
                    ? `Bestätigung wird an ${order.customerEmail} gesendet.`
                    : `Confirmation sent to ${order.customerEmail}.`
                  : de
                  ? 'Bestätigung wird per E-Mail gesendet.'
                  : 'Confirmation will be sent by email.'}
              </p>
            </div>
          </div>

          {/* Order summary */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--bd)', background: 'var(--sf)' }}
          >
            {/* Delivery estimate header */}
            <div
              className="px-5 py-3 flex items-center gap-2 border-b"
              style={{ borderColor: 'var(--bd)', background: 'rgba(43,82,176,0.08)' }}
            >
              <Package className="h-4 w-4 shrink-0" style={{ color: '#2B52B0' }} />
              <p className="text-[13px] font-medium" style={{ color: '#2B52B0' }}>
                {de
                  ? `Versand heute · Lieferung voraussichtlich ${deliveryDate}`
                  : `Ships today · Estimated delivery ${deliveryDate}`}
              </p>
            </div>

            {/* Line items */}
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-wx-txf" />
              </div>
            ) : order ? (
              <div className="divide-y" style={{ borderColor: 'var(--bd)' }}>
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover shrink-0"
                        style={{ border: '1px solid var(--bd)' }}
                      />
                    ) : (
                      <div
                        className="w-14 h-14 rounded-lg shrink-0 flex items-center justify-center"
                        style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}
                      >
                        <Package className="h-6 w-6 text-wx-txf" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-wx-tx1 truncate">{item.name}</p>
                      <p className="text-[13px] text-wx-txm">
                        {de ? `Menge: ${item.quantity}` : `Qty: ${item.quantity}`}
                      </p>
                    </div>
                    <p className="text-[14px] font-semibold text-wx-tx1 shrink-0">
                      {formatAmount(item.amount, order.currency)}
                    </p>
                  </div>
                ))}
                {/* Total row */}
                <div
                  className="flex items-center justify-between px-5 py-4"
                  style={{ background: 'rgba(0,0,0,0.15)' }}
                >
                  <p className="text-[14px] font-semibold text-wx-tx1">{de ? 'Gesamt' : 'Total'}</p>
                  <p className="text-[16px] font-bold text-wx-tx1">
                    {formatAmount(order.total, order.currency)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="px-5 py-6 text-center">
                <p className="text-[13px] text-wx-txm">
                  {de
                    ? 'Bestelldetails konnten nicht geladen werden. Deine Bestätigungs-E-Mail enthält alle Informationen.'
                    : 'Could not load order details. Your confirmation email contains all information.'}
                </p>
              </div>
            )}
          </div>

          {/* Prep guide */}
          <div
            className="rounded-xl p-5"
            style={{ border: '1px solid var(--bd)', background: 'var(--sf)' }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#2B52B0' }}>
              {de ? 'Während du wartest' : 'While you wait'}
            </p>
            <h2 className="text-[16px] font-bold text-wx-tx1 mb-5">
              {de ? 'So bereitest du dich vor' : 'How to prepare'}
            </h2>
            <div className="space-y-4">
              {prepSteps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div
                    className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center"
                    style={{ background: 'rgba(43,82,176,0.12)', color: '#2B52B0' }}
                  >
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-wx-tx1 mb-0.5">{step.title}</p>
                    <p className="text-[13px] leading-relaxed text-wx-txm">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact row */}
          <div
            className="rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            style={{ border: '1px solid var(--bd)', background: 'var(--sf)' }}
          >
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-wx-tx1 mb-0.5">
                {de ? 'Frage zur Bestellung?' : 'Question about your order?'}
              </p>
              <p className="text-[13px] text-wx-txm">
                {de ? 'Ich antworte in der Regel binnen einer Stunde.' : 'I usually reply within an hour.'}
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <a
                href={`https://wa.me/4915751957470?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-opacity hover:opacity-90"
                style={{ background: '#25D366', color: '#fff' }}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href="mailto:luca@waxcelerate.de"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-opacity hover:opacity-90"
                style={{ background: 'var(--sf2)', border: '1px solid var(--bd)', color: 'var(--tx1)' }}
              >
                <Mail className="h-4 w-4" />
                E-Mail
              </a>
            </div>
          </div>

          {/* Back home */}
          <div className="flex justify-center pt-2 pb-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-[14px] font-medium hover:underline"
              style={{ color: '#264E8C' }}
            >
              ← {de ? 'Zurück zur Startseite' : 'Back to homepage'}
            </Link>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
