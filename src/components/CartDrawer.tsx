import { useEffect, useState } from 'react';
import { X, ShoppingCart, Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore, cartItemCount, cartTotalPrice } from '@/store/cart';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';

export function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const isCheckingOut = useCartStore((s) => s.isCheckingOut);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const clear = useCartStore((s) => s.clear);
  const closeCart = useCartStore((s) => s.closeCart);
  const checkout = useCartStore((s) => s.checkout);

  const [agbAccepted, setAgbAccepted] = useState(false);

  const { t, lang } = useLanguage();
  const de = lang === 'de';

  const count = cartItemCount(items);
  const total = cartTotalPrice(items);

  // Lock body scroll when cart is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeCart]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(de ? 'de-DE' : 'en-US', { style: 'currency', currency: 'EUR' }).format(price);


  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.cart.title}
        className={`fixed right-0 top-0 bottom-0 z-50 w-full sm:w-96 flex flex-col transition-transform duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: 'var(--pg)', borderLeft: '1px solid var(--bd)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 h-16 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--bd)' }}
        >
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="h-4 w-4 text-wx-tx1" />
            <span className="font-semibold text-wx-tx1 text-sm">{t.cart.title}</span>
            {count > 0 && (
              <span
                className="text-[11px] font-bold text-white rounded-full flex items-center justify-center"
                style={{ background: '#1A3C6E', minWidth: '1.25rem', height: '1.25rem', padding: '0 4px' }}
              >
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-wx-tx2 hover:text-wx-tx1 transition-colors rounded-lg"
            aria-label={de ? 'Schließen' : 'Close'}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center pb-16">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}
              >
                <ShoppingCart className="h-6 w-6 text-wx-txf" />
              </div>
              <div>
                <p className="font-medium text-wx-tx1 mb-1">{t.cart.empty}</p>
                <p className="text-wx-txf text-sm">{t.cart.emptyHint}</p>
              </div>
              <button
                onClick={closeCart}
                className="text-sm font-medium transition-colors"
                style={{ color: '#1A3C6E' }}
              >
                {t.cart.browseCta}
              </button>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 py-4" style={{ borderBottom: '1px solid var(--bd2)' }}>
                  {/* Image */}
                  <div
                    className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ border: '1px solid var(--bd2)', background: 'var(--sf2)' }}
                  >
                    <img
                      src={item.image}
                      alt={de ? item.title : item.titleEn}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-wx-tx1 leading-snug mb-1 line-clamp-2">
                      {de ? item.title : item.titleEn}
                    </p>
                    <p className="text-sm font-semibold text-wx-tx1 mb-2.5">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    {/* Qty controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-wx-tx2 hover:text-wx-tx1 transition-colors"
                        style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}
                        aria-label="Minus"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-semibold text-wx-tx1 w-5 text-center tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-wx-tx2 hover:text-wx-tx1 transition-colors"
                        style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}
                        aria-label="Plus"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-1.5 text-wx-txf hover:text-red-400 transition-colors self-start flex-shrink-0"
                    aria-label={t.cart.remove}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — only when items exist */}
        {items.length > 0 && (
          <div
            className="px-5 pt-4 pb-8 flex-shrink-0 space-y-3"
            style={{ borderTop: '1px solid var(--bd)' }}
          >
            {/* Free shipping indicator */}
            {total < 50 && (
              <div
                className="rounded-lg px-3 py-2.5 text-xs"
                style={{ background: 'rgba(26,60,110,0.08)', border: '1px solid rgba(26,60,110,0.18)' }}
              >
                <span style={{ color: '#1A3C6E' }}>
                  {de
                    ? `Noch ${formatPrice(50 - total)} bis zum kostenlosen Versand`
                    : `${formatPrice(50 - total)} away from free shipping`}
                </span>
              </div>
            )}

            {/* Subtotal row */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-wx-tx2">{t.cart.subtotal}</span>
              <span className="font-semibold text-wx-tx1 tabular-nums">{formatPrice(total)}</span>
            </div>

            <p className="text-[11px] text-wx-txf leading-relaxed">{t.cart.vatNote}</p>

            {/* AGB acceptance */}
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={agbAccepted}
                onChange={(e) => setAgbAccepted(e.target.checked)}
                className="mt-0.5 flex-shrink-0 accent-[#1A3C6E] w-3.5 h-3.5"
              />
              <span className="text-[11px] leading-relaxed" style={{ color: 'var(--txf)' }}>
                {de ? (
                  <>Ich habe die{' '}
                    <Link to="/agb" onClick={closeCart} className="underline hover:text-white transition-colors">AGB</Link>
                    {' '}gelesen und akzeptiere das{' '}
                    <a href="https://www.gesetze-im-internet.de/bgb/__312g.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">14-tägige Widerrufsrecht</a>.
                  </>
                ) : (
                  <>I have read the{' '}
                    <Link to="/agb" onClick={closeCart} className="underline hover:text-white transition-colors">Terms</Link>
                    {' '}and accept the 14-day right of withdrawal.
                  </>
                )}
              </span>
            </label>

            {/* Checkout button */}
            <button
              onClick={async () => {
                try {
                  await checkout();
                } catch (err) {
                  const msg = err instanceof Error ? err.message : t.cart.error;
                  toast.error(msg);
                }
              }}
              disabled={!agbAccepted || isCheckingOut}
              className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
            >
              {isCheckingOut ? (
                <><Loader2 className="h-4 w-4 animate-spin" />{t.cart.loading}</>
              ) : (
                t.cart.checkout
              )}
            </button>

            <div className="flex items-center justify-between pt-0.5">
              <a
                href="https://www.ebay.de/usr/waxcelerate"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] transition-colors hover:text-white"
                style={{ color: 'var(--txf)' }}
              >
                {de ? 'Lieber bei eBay kaufen →' : 'Buy on eBay instead →'}
              </a>
              <button
                onClick={clear}
                className="text-xs text-wx-txf hover:text-wx-tx2 transition-colors flex-shrink-0 ml-3"
              >
                {t.cart.clear}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
