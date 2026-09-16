// ─── Kopf der Starter-Set-Seite = Kaufbox ───────────────────────────────────
// v3 (16.09.2026, Luca): Aufbau wie WaxHero/ChainHero — links eine ruhige
// Bildstrecke in festen Karten, rechts die Kaufbox. Vorher standen hier ein
// ausgeblendetes Foto, vier Set-Kacheln, eine Bühne und ein separater
// Konfigurator untereinander. Jetzt ist die Kaufbox der Konfigurator:
//   1. Wachs: Classic/Pro × 300/500 g
//   2. Kette: ohne (Basis, vorgewählt) oder vorgewachst, mit Filter
//   3. Preis mit echtem Rabatt, grünem Versand-Hinweis, Inhalt aufklappbar
// Die drei festen Kettensets sind Schnellwahl-Chips darüber.

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { canCheckout, trustStats } from '@/lib/data';
import { getEstimatedDelivery } from '@/lib/utils';
import { useDispatchLine } from '@/hooks/useDispatchLine';
import { trackStarterInterest } from '@/lib/analytics';
import { AddToCartButton } from '@/components/AddToCartButton';
import { PriceNote } from '@/components/PriceNote';
import { Stars } from '@/components/Stars';
import type { useLanguage } from '@/hooks/useLanguage';
import { Ico } from '@/pages/product/wax/Ico';
import {
  GALLERY, QUICK_PICKS, WAX_IDS, comboFromSetId, waxLineOf, eur, shortChainName,
  type SetCombo, type WaxLine, type WaxSize,
} from '@/pages/starter/content';
import { comboFacts, setRequestHref } from '@/pages/starter/setFacts';
import { ChainPicker } from '@/pages/starter/ChainPicker';
import { preferredChainId } from '@/pages/starter/chainFilter';
import '@/pages/product/wax/wax.css';
import './starter.css';

export function SetBuyButton({ combo, de, compact = false }: { combo: SetCombo; de: boolean; compact?: boolean }) {
  const { bundle } = comboFacts(combo);
  if (canCheckout(bundle)) return <AddToCartButton product={bundle} fullWidth size={compact ? 'sm' : 'md'} />;
  return (
    <a className={`wxp-cta${compact ? ' wxs-cta-sm' : ''}`} href={setRequestHref(combo, de)} target="_blank" rel="noopener noreferrer"
      onClick={() => trackStarterInterest(comboFacts(combo).optionId ?? 'custom')}>
      {de ? 'Set anfragen' : 'Request this set'}
      {!compact && <Ico name="arrow" className="wxp-ico" style={{ width: 16, height: 16 }} />}
    </a>
  );
}

export function SetHero({ de, t, combo, setCombo, buyRef }: {
  de: boolean;
  t: ReturnType<typeof useLanguage>['t'];
  combo: SetCombo;
  setCombo: (c: SetCombo) => void;
  buyRef: React.RefObject<HTMLDivElement | null>;
}) {
  const dispatch = useDispatchLine(de);
  const [slide, setSlide] = useState(0);
  // Zuletzt gewählte Kette, damit Aus-/Einschalten sie nicht vergisst.
  const [lastChain, setLastChain] = useState(() => combo.chainId ?? preferredChainId());
  const f = comboFacts(combo);
  const { line, size } = waxLineOf(combo.waxId);
  const withChain = combo.chainId !== null;
  const fmt = (n: number) => n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const setWax = (l: WaxLine, s: WaxSize) => setCombo({ ...combo, waxId: WAX_IDS[l][s] });
  const setChain = (id: string | null) => {
    if (id) setLastChain(id);
    setCombo({ ...combo, chainId: id });
  };

  // Zweites Bild zeigt die gewählte Kette, sobald eine dabei ist.
  const gallery = GALLERY.map((g, i) => (i === 1 && f.chain
    ? { src: f.chain.image, title: shortChainName(f.chain), fact: de ? 'vorgewachst' : 'pre-waxed' }
    : { src: g.src, title: de ? g.de : g.en, fact: de ? g.factDe : g.factEn }));

  const rows = [
    { k: de ? f.wax.title : f.wax.titleEn, v: f.wax.price },
    ...(f.chain ? [{ k: de ? f.chain.title : f.chain.titleEn, v: f.chain.price }] : []),
    ...f.extras.map((a) => ({ k: de ? a.title : a.titleEn, v: a.price })),
  ];
  const partsLine = de
    ? `${rows.length} Teile · Wachs${f.chain ? ', Kette' : ''}, Zange, 3 Drähte`
    : `${rows.length} parts · wax${f.chain ? ', chain' : ''}, pliers, 3 wires`;

  return (
    <section className="wxp-hero wxs-hero">
      <div className="wxp-wrap wxp-hero-grid">
        <div className="min-w-0">
          <div className="wxp-gallery wxs-gallery" aria-label={de ? 'Bilder' : 'Images'}
            onScroll={(e) => {
              const el = e.currentTarget; const w = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 1;
              setSlide(Math.round(el.scrollLeft / (w + 10)));
            }}>
            {gallery.map((g, i) => (
              <figure key={g.src} className={`g${i}`}>
                <img src={g.src} alt={i === 0 ? (de ? 'Starter-Set mit Wachs, Zange und Draht' : 'Starter set with wax, pliers and wire') : g.title}
                  loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : undefined} decoding="async" />
                <figcaption><b>{g.title}</b><span>{g.fact}</span></figcaption>
              </figure>
            ))}
          </div>
          <p className="wxp-gcount" aria-hidden>{slide + 1} / {gallery.length}</p>
        </div>

        <aside className="wxp-buy" aria-label={de ? 'Set zusammenstellen und kaufen' : 'Build and buy the set'}>
          <p className="eyebrow wxp-eyebrow">
            Starter-Set<span className="wxp-stock">{de ? 'Auf Lager' : 'In stock'}</span>
          </p>
          <h1>{de ? 'Alles da, beim ersten Mal.' : 'Everything there, first time.'}</h1>
          <a className="wxp-rating" href="#fragen">
            <Stars rating={5} color="#F5A623" />
            {trustStats.reviews} {de ? 'Bewertungen · 100 % positiv' : 'reviews · 100 % positive'}
          </a>
          <p className="wxp-lede">
            {de ? 'Wachs, Zange und Draht in einem Paket. Die Kette ist optional.' : 'Wax, pliers and wire in one parcel. The chain is optional.'}
          </p>

          <div className="wxs-quick">
            <span>{de ? 'Beliebt:' : 'Popular:'}</span>
            {QUICK_PICKS.map((q) => (
              <button key={q.id} type="button" aria-pressed={f.optionId === q.id}
                onClick={() => { const c = comboFromSetId(q.id); if (c) { if (c.chainId) setLastChain(c.chainId); setCombo(c); } }}>
                {de ? q.de : q.en}
              </button>
            ))}
          </div>

          <div className="wxp-lbl">1 · {de ? 'Wachs' : 'Wax'} <a href="#fragen">{de ? '300 oder 500 g?' : '300 or 500 g?'}</a></div>
          <div className="wxs-seg2">
            <div className="wxs-seg" role="group" aria-label={de ? 'Wachssorte' : 'Wax line'}>
              {(['classic', 'pro'] as const).map((l) => (
                <button key={l} type="button" aria-pressed={line === l} onClick={() => setWax(l, size)}>
                  <b>{l === 'classic' ? 'Classic' : 'Pro MoS₂'}</b>
                  <span>{l === 'classic' ? (de ? 'trocken' : 'dry') : (de ? 'nass, E-Bike' : 'wet, e-bike')}</span>
                </button>
              ))}
            </div>
            <div className="wxs-seg" role="group" aria-label={de ? 'Größe' : 'Size'}>
              {(['300', '500'] as const).map((s) => (
                <button key={s} type="button" aria-pressed={size === s} onClick={() => setWax(line, s)}>
                  <b>{s} g</b>
                  <span>{s === '300' ? (de ? '1 Kette' : '1 chain') : (de ? 'mehrere' : 'several')}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="wxp-lbl">2 · {de ? 'Kette' : 'Chain'}</div>
          <div className="wxs-seg wxs-seg-full" role="group" aria-label={de ? 'Kette dazu' : 'Add a chain'}>
            <button type="button" aria-pressed={!withChain} onClick={() => setChain(null)}>
              <b>{de ? 'Ohne Kette' : 'No chain'}</b><span>{de ? 'Basis · für deine Kette' : 'Basic · for your chain'}</span>
            </button>
            <button type="button" aria-pressed={withChain} onClick={() => setChain(lastChain)}>
              <b>{de ? 'Mit Kette' : 'With chain'}</b><span>{de ? 'vorgewachst, kein Entfetten' : 'pre-waxed, no degreasing'}</span>
            </button>
          </div>
          {withChain && combo.chainId && (
            <ChainPicker de={de} chainId={combo.chainId} onChange={(id) => setChain(id)} />
          )}

          <div ref={buyRef} className="wxp-card wxp-pricecard wxs-pricecard">
            <div className="wxp-pricetop">
              <p className="wxp-price">{fmt(f.price)}<span style={{ fontSize: 22, marginLeft: 3, color: 'var(--tx2)', fontWeight: 600 }}>€</span>
                <s>{fmt(f.partsSum)} €</s></p>
              <span className="wxp-ship"><Ico name="truck" />{de ? 'Versand kostenlos' : 'Free shipping'}</span>
            </div>
            <p className="wxs-save">
              <span className="wxs-savepill">−{f.pct} %</span>
              {de ? `Du sparst ${eur(f.saved, de)} gegenüber einzeln` : `You save ${eur(f.saved, de)} vs. separately`}
            </p>
            <details className="wxs-contents">
              <summary>{partsLine}<ChevronDown className="h-4 w-4" aria-hidden /></summary>
              <ul>
                {rows.map((r) => (
                  <li key={r.k}><span>{r.k}</span><span className="num">{eur(r.v, de)}</span></li>
                ))}
                <li className="sum"><span>{de ? 'Einzeln zusammen' : 'Separately'}</span><span className="num">{eur(f.partsSum, de)}</span></li>
              </ul>
            </details>
            <SetBuyButton combo={combo} de={de} />
            <div className="wxp-legal"><PriceNote de={de} t={t} /></div>
          </div>

          <div className="wxp-dispatch" aria-live="polite"><span className="wxp-pulse" aria-hidden />
            <span>{dispatch}</span></div>

          <div className="wxp-trust">
            <div><Ico name="calendar" /><span><b>{getEstimatedDelivery(de ? 'de' : 'en')}</b>{de ? 'voraussichtlich bei dir' : 'estimated delivery'}</span></div>
            <div><Ico name="pin" /><span><b>Stuttgart</b>{de ? 'ein Paket' : 'one parcel'}</span></div>
            <div><Ico name="shield" /><span><b>{de ? '14 Tage' : '14 days'}</b>{de ? 'Rückgabe, unbenutzt' : 'return, unused'}</span></div>
          </div>
        </aside>
      </div>
    </section>
  );
}
