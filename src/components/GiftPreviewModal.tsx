// ─── GiftPreviewModal — "so sieht das als Geschenk aus" ──────────────────────
//
// Die Stempelkarte ist ein reiner Code plus (beim Geschenk) eine gedruckte
// Karte — bis hier gab es davon kein Bild, nur den Satz "du bekommst eine
// gedruckte Geschenkkarte". Das Popup zeigt die Karte als Objekt und bietet in
// einem Aufwasch das Starter-Set als Beigabe an ("dazu schenken"), weil ein
// Erstwachser mit der Karte allein noch keine Kette öffnen kann.
//
// Kein Dialog-Lib im Projekt — gleiches handgerolltes Muster wie CompareModal
// in sections/products.tsx: fixed inset-0, Backdrop-Klick + Escape schließen,
// useBodyScrollLock, `if (!open) return null`.

import { useEffect } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { WaxcelerateMark } from '@/components/WaxcelerateMark';
import {
  products, accessories, starterSet, starterSetOptions, starterSetBundleProducts,
} from '@/lib/data';

const eur = (n: number, de: boolean) =>
  n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

// Das günstigste feste Bundle als Beigabe — ein Add-on soll klein neben dem
// Kartenpreis wirken, nicht mit ihm konkurrieren.
const ADDON_ID = 'starter-classic';

export function GiftPreviewModal({ open, onClose, de, data }: {
  open: boolean;
  onClose: () => void;
  de: boolean;
  data: { count: number; price: number; list: number } | null;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useBodyScrollLock(open);

  if (!open || !data) return null;

  const { count, price } = data;

  const opt = starterSetOptions.find((o) => o.id === ADDON_ID)!;
  const addon = starterSetBundleProducts.find((p) => p.id === ADDON_ID)!;
  const wax = products.find((p) => p.id === opt.waxId)!;
  const chain = products.find((p) => p.id === opt.chainId)!;
  const extras = accessories.filter((a) =>
    (starterSet.includedAccessoryIds as readonly string[]).includes(a.id));
  const addonParts = wax.price + chain.price + extras.reduce((s, a) => s + a.price, 0);
  const addonSaved = Math.round((addonParts - addon.price) * 100) / 100;
  const addonContents = [
    de ? wax.title : wax.titleEn,
    de ? chain.title : chain.titleEn,
    ...extras.map((a) => (de ? a.title : a.titleEn)),
  ];

  const waCard = `https://wa.me/4915751957470?text=${encodeURIComponent(
    de
      ? `Hi Luca, ich möchte die ${count}er-Karte als Geschenk bestellen. Name der beschenkten Person: `
      : `Hi Luca, I would like to order the ${count}-visit card as a gift. Recipient's name: `,
  )}`;
  const waCardPlusSet = `https://wa.me/4915751957470?text=${encodeURIComponent(
    de
      ? `Hi Luca, ich möchte die ${count}er-Karte als Geschenk bestellen, dazu das Starter-Set (${de ? wax.title : wax.titleEn} + ${de ? chain.title : chain.titleEn}). Name der beschenkten Person: `
      : `Hi Luca, I would like to order the ${count}-visit card as a gift, plus the starter set (${wax.titleEn} + ${chain.titleEn}). Recipient's name: `,
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'color-mix(in srgb, var(--pg) 72%, transparent)', backdropFilter: 'blur(5px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={de ? 'Geschenk-Vorschau' : 'Gift preview'}
    >
      <div
        className="relative w-full max-w-[440px] max-h-[92vh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'var(--sf)',
          border: '1px solid var(--bd)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.10)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex items-center justify-between px-5 pt-4 pb-3" style={{ borderBottom: '1px solid var(--bd)' }}>
          <h3 className="text-[15px] font-semibold text-wx-tx1 tracking-[-0.01em]">
            {de ? 'So sieht das Geschenk aus' : 'What the gift looks like'}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
            style={{ background: 'var(--sf2)', color: 'var(--txf)' }}
            aria-label={de ? 'Schließen' : 'Close'}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">

          {/* ── Karten-Mockup ── */}
          <div className="mx-auto max-w-[320px]">
            <div
              className="rounded-2xl p-4 sm:p-5"
              style={{
                background: 'linear-gradient(150deg, var(--sf2) 0%, var(--sf) 70%)',
                border: '1px solid rgba(var(--accent-rgb),0.30)',
                boxShadow: '0 14px 30px rgba(0,0,0,0.20)',
                transform: 'rotate(-1.4deg)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-5 h-5"><WaxcelerateMark className="w-full h-full" /></span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--txf)' }}>
                    {de ? 'Geschenkkarte' : 'Gift card'}
                  </span>
                </span>
                <span className="text-[11px] font-semibold" style={{ color: 'var(--accent)' }}>
                  {count}× {de ? 'Wachsen' : 'waxing'}
                </span>
              </div>

              <p className="font-display font-bold leading-none mt-3" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em', color: 'var(--tx1)' }}>
                {de ? `${count}er-Karte` : `${count}-visit card`}
              </p>

              <div className="grid grid-cols-5 gap-1.5 mt-4">
                {Array.from({ length: count }, (_, i) => (
                  <div
                    key={i}
                    className="rounded-md flex items-center justify-center"
                    style={{ aspectRatio: '1 / 1', border: '1px dashed rgba(var(--accent-rgb),0.35)', background: 'var(--sf)' }}
                  >
                    <span className="w-[58%] h-[58%]" style={{ filter: 'grayscale(1) opacity(0.28)' }}>
                      <WaxcelerateMark className="w-full h-full" />
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3" style={{ borderTop: '1px dashed var(--bd2)' }}>
                <p className="text-[11px]" style={{ color: 'var(--txf)' }}>{de ? 'Für' : 'For'}</p>
                <div className="h-4 mt-0.5" style={{ borderBottom: '1px solid var(--bd2)' }} />
                <div className="flex items-center justify-between mt-3">
                  <span className="num-data text-[10px] tracking-[0.2em]" style={{ color: 'var(--txff)' }}>
                    CODE · ● ● ● ● ● ●
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--txff)' }}>
                    {de ? 'kein Ablauf' : 'no expiry'}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[12px] leading-relaxed mt-4 text-center" style={{ color: 'var(--txm)' }}>
              {de
                ? `Du bekommst die gedruckte Karte plus den Code. ${eur(price, de)}, Rückversand inklusive, übertragbar.`
                : `You get the printed card plus the code. ${eur(price, de)}, return shipping included, transferable.`}
            </p>
          </div>

          {/* ── Add-on: Starter-Set dazu schenken ── */}
          <div className="mt-6 pt-5 rounded-xl p-4" style={{ borderTop: '1px solid var(--bd2)', background: 'var(--accent-wash-sm)', border: '1px solid rgba(var(--accent-rgb),0.18)' }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--accent)' }}>
              {de ? 'Dazu schenken' : 'Add to the gift'}
            </p>
            <div className="flex gap-3">
              <div className="flex-shrink-0 rounded-lg overflow-hidden" style={{ width: 64, height: 64, background: 'var(--sf2)' }}>
                <img src={addon.image} alt="" aria-hidden loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold" style={{ color: 'var(--tx1)' }}>
                  {de ? 'Starter-Set' : 'Starter set'}
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--txm)' }}>
                  {de ? opt.taglineDe : opt.taglineEn}
                </p>
              </div>
            </div>

            <ul className="mt-3 space-y-1">
              {addonContents.map((c) => (
                <li key={c} className="flex items-start gap-1.5 text-[12px]" style={{ color: 'var(--txm)' }}>
                  <Check className="h-3 w-3 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} aria-hidden />
                  {c}
                </li>
              ))}
            </ul>

            <div className="flex items-baseline gap-2 mt-3">
              <p className="font-display font-bold leading-none" style={{ fontSize: '1.25rem', color: 'var(--tx1)' }}>
                {eur(addon.price, de)}
              </p>
              <p className="num-data text-[11px] line-through" style={{ color: 'var(--txff)' }}>{eur(addonParts, de)}</p>
              <p className="text-[11px]" style={{ color: 'var(--accent)' }}>
                {de ? `Du sparst ${eur(addonSaved, de)}` : `You save ${eur(addonSaved, de)}`}
              </p>
            </div>
          </div>

          {/* ── CTAs ── */}
          <div className="mt-5 space-y-2">
            <a
              href={waCardPlusSet}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {de ? 'Karte + Starter-Set anfragen' : 'Request card + starter set'}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <a
              href={waCard}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-opacity hover:opacity-80"
              style={{ color: 'var(--txm)' }}
            >
              {de ? 'Nur die Karte anfragen' : 'Request the card only'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
