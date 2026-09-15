// Classic/Pro-Vergleich als eigenes Modul: rendert nur nach Klick auf
// „Vergleichen" und zieht productContent (≈23 KB) mit — beides muss nicht im
// Startchunk liegen (Mobile-Audit 15.09.2026). products.tsx laedt es lazy,
// ProductDetailPage direkt (die ist ohnehin ein eigener Chunk).
import { X, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { TranslationType } from '@/lib/i18n';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { products } from '@/lib/data';
import { richContent } from '@/lib/productContent';
import { CompareTable } from '@/components/CompareTable';

// ── Compare Modal ──────────────────────────────────────────────────────────

const CLASSIC_ACCENT = 'var(--accent-soft)';
const PRO_ACCENT = 'var(--accent-soft)';

// Gleiches Muster wie eur() in ProductShelf.tsx — CompareModal bekommt keine
// lang-basierte Intl.NumberFormat-Instanz durchgereicht (die des Elternteils
// ist an dessen eigenen `formatter`/`formatPrice` gebunden), daher lokal.
const eur = (n: number, de: boolean) =>
  n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

// Exportiert: die Produktseite (ProductDetailPage.tsx) verlinkt jetzt
// ebenfalls auf den Classic/Pro-Vergleich statt eines reinen Textlinks zum
// Pro-Produkt (Produktkarten-Neugliederung, siehe Plan Phase 3).
export function CompareModal({ open, onClose, de, t }: {
  open: boolean;
  onClose: () => void;
  de: boolean;
  t: TranslationType;
}) {
  const [classicOpen, setClassicOpen] = useState(false);
  const [proOpen, setProOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useBodyScrollLock(open);

  if (!open) return null;

  const classicRc = richContent['wax-500'];
  const proRc = richContent['wax-500-mos2'];
  const pt = t.products;

  // War als literaler, nur-deutscher String hardcodiert (CLAUDE.md: "Nur
  // src/lib/data.ts fuer Produktdaten") — desynct bei jeder Preisaenderung
  // und zeigte im englischen UI trotzdem "29,95 €" statt "€29.95". Gleiches
  // Muster wie eur() in ProductShelf.tsx.
  const classicPrice = eur(products.find(p => p.id === 'wax-500')!.price, de);
  const proPrice = eur(products.find(p => p.id === 'wax-500-mos2')!.price, de);

  const rawRows = [
    {
      label: de ? 'Wirkstoff' : 'Active ingredient',
      classic: 'PTFE-Film',
      pro: 'MoS₂-Transferfilm',
    },
    {
      label: de ? 'Reibungskoeffizient' : 'Friction coeff.',
      classic: '0,05–0,07',
      pro: '0,03–0,06',
    },
    {
      label: de ? 'Intervall trocken' : 'Dry interval',
      classic: '250–450 km',
      pro: '300–550 km',
    },
    {
      label: de ? 'Nässe & Kälte' : 'Wet & cold',
      classic: de ? 'geht, kürzeres Intervall' : 'works, shorter interval',
      pro: de ? 'hält länger, bis −8°C' : 'lasts longer, to −8°C',
      proCheck: true,
    },
    {
      label: de ? 'Rostschutz' : 'Rust protection',
      classic: de ? 'Standard' : 'Standard',
      pro: de ? 'Hydrophob' : 'Hydrophobic',
      proCheck: true,
    },
    {
      label: 'PFAS / PTFE-frei',
      classic: '—',
      pro: '✓',
      proCheck: true,
      classicDim: true,
    },
  ];

  // Fuer <CompareTable> (Produktkarten-Neugliederung, Phase 6): proCheck/
  // classicDim aus rawRows werden zu winCol/dimCols, damit dieselbe
  // Komponente wie im PDP-Akkordeon greift, statt einer dritten eigenen
  // Grid-Implementierung. Nur Zeilen mit explizitem proCheck heben Pro
  // farblich hervor (Wirkstoff/Reibung/Intervall sind Abwaegungen, keine
  // klaren "Gewinner" — das war schon im alten Markup so und bleibt hier
  // erhalten).
  const compareRows = rawRows.map(row => ({
    label: row.label,
    cols: [row.classic, row.pro],
    winCol: row.proCheck ? 1 : undefined,
    dimCols: row.classicDim ? [0] : undefined,
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'color-mix(in srgb, var(--pg) 72%, transparent)', backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[620px] max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'var(--sf)',
          border: '1px solid var(--bd)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-5 pt-4 pb-3"
          style={{ borderBottom: '1px solid var(--bd)' }}
        >
          <div>
            <h3 className="text-[15px] font-semibold text-wx-tx1 tracking-[-0.01em]">{pt.compareTitle}</h3>
            <p className="text-meta mt-0.5" style={{ color: 'var(--txff)' }}>
              {de ? 'Alle Angaben für 500g Blöcke' : 'All figures for 500g blocks'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            style={{ background: 'var(--sf2)', color: 'var(--txf)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--sf3)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--sf2)'; }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* ── Comparison table — mit Fotos statt reinem Namens-Header
              (Luca: "vielleicht auch mit Bildern, der zwei Wachse
              nebeneinander mit der Information unten drunter"). Die Regal-
              Crops sind bereits im Browser (WaxPanel laedt dieselben
              Dateien), kein zusaetzlicher Download. */}
          <div className="px-4 pt-4 pb-2">
            <CompareTable
              headers={['Classic', 'Pro MoS₂']}
              images={['/images/shelf/wax-classic-800.webp', '/images/shelf/wax-pro-800.webp']}
              rows={compareRows}
              // Hex-Literal statt PRO_ACCENT ('var(--accent-soft)') — CompareTable
              // haengt einen Alpha-Suffix an (`${accentColor}0F`), der nur mit
              // Hex funktioniert, nicht mit einem CSS-Var-String. Gleicher Wert
              // wie cardAccent fuer isPro in ProductDetailPage.tsx.
              accentColor="#4A72D4"
              de={de}
            />
            {/* "Fuer wen" — dieselben, bereits abgesegneten Saetze wie im
                Regal (t.products.shelf.classicFor/proFor), statt einer
                dritten, leicht abweichenden Formulierung ("Sommer &
                Einsteiger") direkt im Modal-Header. */}
            <div className="grid grid-cols-2 gap-2.5 mt-2.5 text-center">
              <p className="text-meta" style={{ color: 'var(--txff)' }}>{pt.shelf.classicFor}</p>
              <p className="text-meta" style={{ color: 'var(--txff)' }}>{pt.shelf.proFor}</p>
            </div>
          </div>

          {/* ── Formula accordions ── */}
          <div className="px-4 pt-3 pb-4 space-y-2">

            {/* Classic Formula */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--bd2)', background: 'var(--sf2)' }}>
              <button
                onClick={() => setClassicOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-meta font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: 'rgba(var(--accent-soft-rgb), 0.08)', color: CLASSIC_ACCENT }}
                  >
                    Classic
                  </span>
                  <span className="text-[12px] font-medium text-wx-tx1">{pt.compareFormulaClassic}</span>
                  <span className="text-meta" style={{ color: 'var(--txff)' }}>
                    · {classicRc.formulaDetails?.length} {pt.compareComponents}
                  </span>
                </div>
                <ChevronDown
                  className="h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200"
                  style={{ color: 'var(--txf)', transform: classicOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-[280ms] ease-in-out"
                style={{ gridTemplateRows: classicOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <div style={{ borderTop: '1px solid var(--bd2)' }}>
                    {classicRc.formulaDetails?.map((f, i, arr) => (
                      <div
                        key={i}
                        className="flex gap-3.5 px-4 py-3"
                        style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bd2)' : 'none' }}
                      >
                        <span className="text-meta font-bold tabular-nums flex-shrink-0 mt-0.5 w-5 text-right" style={{ color: CLASSIC_ACCENT }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <div className="text-[12px] font-semibold text-wx-tx1 mb-0.5">{f.name}</div>
                          <div className="text-meta leading-relaxed" style={{ color: 'var(--txm)' }}>{f.detail}</div>
                        </div>
                      </div>
                    ))}
                    {classicRc.techNote && (
                      <div
                        className="mx-4 mb-3 mt-1 rounded-lg p-3"
                        style={{ background: 'rgba(var(--accent-soft-rgb), 0.03)', border: '1px solid rgba(var(--accent-soft-rgb), 0.13)' }}
                      >
                        <div className="text-meta font-semibold uppercase tracking-widest mb-1" style={{ color: CLASSIC_ACCENT }}>
                          {classicRc.techNote.title}
                        </div>
                        <p className="text-meta leading-relaxed" style={{ color: 'var(--txm)' }}>
                          {classicRc.techNote.body}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Formula */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(var(--accent-soft-rgb), 0.19)', background: 'rgba(var(--accent-soft-rgb), 0.02)' }}
            >
              <button
                onClick={() => setProOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-meta font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: 'rgba(var(--accent-soft-rgb), 0.09)', color: PRO_ACCENT }}
                  >
                    Pro MoS₂
                  </span>
                  <span className="text-[12px] font-medium text-wx-tx1">{pt.compareFormulaPro}</span>
                  <span className="text-meta" style={{ color: 'var(--txff)' }}>
                    · {proRc.formulaDetails?.length} {pt.compareComponents}
                  </span>
                </div>
                <ChevronDown
                  className="h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200"
                  style={{ color: 'var(--txf)', transform: proOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-[280ms] ease-in-out"
                style={{ gridTemplateRows: proOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <div style={{ borderTop: '1px solid rgba(var(--accent-soft-rgb), 0.13)' }}>
                    {proRc.formulaDetails?.map((f, i, arr) => (
                      <div
                        key={i}
                        className="flex gap-3.5 px-4 py-3"
                        style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bd2)' : 'none' }}
                      >
                        <span className="text-meta font-bold tabular-nums flex-shrink-0 mt-0.5 w-5 text-right" style={{ color: PRO_ACCENT }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <div className="text-[12px] font-semibold text-wx-tx1 mb-0.5">{f.name}</div>
                          <div className="text-meta leading-relaxed" style={{ color: 'var(--txm)' }}>{f.detail}</div>
                        </div>
                      </div>
                    ))}
                    {proRc.techNote && (
                      <div
                        className="mx-4 mb-3 mt-1 rounded-lg p-3"
                        style={{ background: 'rgba(var(--accent-soft-rgb), 0.03)', border: '1px solid rgba(var(--accent-soft-rgb), 0.13)' }}
                      >
                        <div className="text-meta font-semibold uppercase tracking-widest mb-1" style={{ color: PRO_ACCENT }}>
                          {proRc.techNote.title}
                        </div>
                        <p className="text-meta leading-relaxed" style={{ color: 'var(--txm)' }}>
                          {proRc.techNote.body}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer CTAs ── */}
        <div
          className="flex-shrink-0 grid grid-cols-2 gap-2.5 px-4 py-3.5"
          style={{ borderTop: '1px solid var(--bd)', background: 'var(--sf2)' }}
        >
          <Link
            to="/produkt/wax-500"
            onClick={onClose}
            className="flex flex-col items-center gap-0.5 py-3 rounded-xl text-center transition-all hover:opacity-80 active:scale-[0.98]"
            style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}
          >
            <span className="text-[12px] font-semibold" style={{ color: 'var(--tx1)' }}>Classic</span>
            <span className="text-meta" style={{ color: 'var(--txff)' }}>{classicPrice}</span>
          </Link>
          <Link
            to="/produkt/wax-500-mos2"
            onClick={onClose}
            className="flex flex-col items-center gap-0.5 py-3 rounded-xl text-center transition-all hover:opacity-80 active:scale-[0.98]"
            style={{ background: 'rgba(var(--accent-soft-rgb), 0.07)', border: '1px solid rgba(var(--accent-soft-rgb), 0.25)' }}
          >
            <span className="text-[12px] font-semibold" style={{ color: PRO_ACCENT }}>Pro MoS₂</span>
            <span className="text-meta" style={{ color: 'rgba(var(--accent-soft-rgb), 0.6)' }}>{proPrice}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
