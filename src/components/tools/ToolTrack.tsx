// ── Ein Track, ein Zustand, zwei Darstellungen ──────────────────────────────
//
// Vorher rendete die Tools-Sektion zwei getrennte DOM-Baeume mit zwei
// Zustandsvariablen (`activeTab` fuer den mobilen Swipe-Track, `activeCard`
// fuer das 3D-Deck) fuer dieselbe Sache. Wer am Desktop das Fenster verkleinerte,
// landete auf einer anderen Karte als der, die er gerade las.
//
// Hier gibt es genau einen `active`-Zustand und genau eine Kartenliste. Unter lg
// laeuft sie als Swipe-Track, ab lg als 3D-Deck — der Flip-Effekt bleibt exakt
// erhalten, er ist nur noch eine Darstellung desselben Zustands statt eine
// zweite Implementierung.
//
// Zweite Aenderung: DECK_POS war eine feste Dreier-Tabelle. Mit sechs Rechnern
// gibt es keine drei Slots mehr — slotTransform() rechnet die Position aus dem
// relativen Abstand zur aktiven Karte, und alles, was weder vorne noch direkt
// daneben liegt, steht deckungsgleich dahinter und ist unsichtbar.

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { useLanguage } from '@/hooks/useLanguage';

export interface TrackItem {
  key: string;
  /** Kurzes Wort fuer Reiter und Punkte. */
  label: string;
  /** Die Frage, die dieser Rechner beantwortet — steht auf der Rueckseite. */
  cover: string;
  hint: string;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  node: React.ReactNode;
}

// Geometrie wie beim alten Deck: die Karte ist ueber left:50% + translate(-50%)
// zentriert, das zusaetzliche translateX(±72 %) schiebt ihre Mitte nach aussen.
// 0,72 w > 0,5 w heisst, die Mitte der Nachbarkarte liegt ausserhalb der
// aktiven Karte, ihre Beschriftung bleibt also lesbar; 0,72 w + 0,9 w/2 = 1,17 w
// bleibt bei 42 % Kartenbreite innerhalb der Spalte (bei 1024 und 1440 geprueft).
function slotTransform(rel: number, count: number): React.CSSProperties {
  if (rel === 0) {
    return { transform: 'translate(-50%) rotateY(0deg) scale(1)', zIndex: 30, opacity: 1 };
  }
  if (rel === 1) {
    return { transform: 'translate(-50%) translateX(72%) rotateY(-18deg) scale(0.9)', zIndex: 20, opacity: 0.96 };
  }
  if (rel === count - 1) {
    return { transform: 'translate(-50%) translateX(-72%) rotateY(18deg) scale(0.9)', zIndex: 20, opacity: 0.96 };
  }
  // Alles Weitere steht als Stapel hinter der aktiven Karte. Unsichtbar, aber
  // vorhanden — so hat der Uebergang beim Weiterblaettern etwas zu animieren,
  // statt dass eine Karte aus dem Nichts erscheint.
  return { transform: 'translate(-50%) scale(0.86)', zIndex: 10, opacity: 0, pointerEvents: 'none' };
}

/**
 * Startwert, bis gemessen ist. Die tatsaechliche Hoehe folgt danach der jeweils
 * aktiven Karte (siehe useMeasuredHeight) — die sechs Rechner liegen inzwischen
 * in einem engen Band, eine feste Hoehe fuer alle wuerde aber je nach Rechner
 * trotzdem entweder etwas abschneiden oder unnoetig Leere stehen lassen.
 */
const DECK_FALLBACK_HEIGHT = 640;

/**
 * Misst die aktive Karte und gibt die Hoehe zurueck, die ihr Container
 * braucht — fuer das Desktop-Deck (Kinder unter `.deck-slot > div`) genauso
 * wie fuer den mobilen Swipe-Track (Kinder direkt im Container): eine
 * Flex-Row ohne eigene Hoehenangabe zieht sich sonst immer auf die hoechste
 * aller Karten hoch, egal welche gerade sichtbar ist — hier bekommt jede
 * Ansicht die Hoehe der jeweils aktiven Karte.
 */
function useMeasuredHeight(active: number, childSelector: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(DECK_FALLBACK_HEIGHT);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const cards = container.querySelectorAll<HTMLElement>(childSelector);
    const card = cards[active];
    if (!card) return;
    const measure = () => {
      // scrollHeight statt getBoundingClientRect: die Slots sind skaliert, und
      // die Randkarten stehen auf scale(0.9) — gemessen werden soll die
      // ungeskalierte Inhaltshoehe der aktiven Karte.
      const h = card.scrollHeight;
      if (h > 0) setHeight(h);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(card);
    return () => ro.disconnect();
  }, [active, childSelector]);

  return { containerRef, height };
}

function DeckSlot({ item, rel, count, active, onActivate, de }: {
  item: TrackItem; rel: number; count: number; active: boolean; onActivate: () => void; de: boolean;
}) {
  const { Icon } = item;
  // items-center: die Karten sind unterschiedlich hoch, seit sie ihre
  // natuerliche Hoehe behalten. Vertikal zentriert stehen sie damit auf einer
  // gemeinsamen Mittelachse, statt oben zu kleben und unten Luft zu lassen.
  return (
    <div className="deck-slot absolute inset-y-0 left-1/2 w-[42%] flex items-center" style={slotTransform(rel, count)}>
      <div className="relative w-full">
        {/* `inert` nimmt die ganze inaktive Karte in einem Zug aus
            Tab-Reihenfolge und Accessibility-Baum — eine Karte im Hintergrund
            darf weder per Tab erreichbar sein noch vorgelesen werden, als
            stuende sie vorne. */}
        <div inert={!active}>{item.node}</div>

      {/* Deckel fuer alle Karten ausser der vorderen. Sechs offene Rechner
          nebeneinander sind Laerm; der Deckel reduziert jede Karte auf die
          Frage, die sie beantwortet, und blendet sich beim Nachvornedrehen aus —
          das liest sich als Aufklappen. Bleibt montiert, damit die Blende in
          beide Richtungen etwas zu animieren hat. */}
      <button
        type="button"
        onClick={onActivate}
        aria-label={de ? `${item.label} anzeigen` : `Show ${item.label}`}
        aria-hidden={active}
        tabIndex={active ? -1 : 0}
        className="deck-cover absolute inset-0 z-10 rounded-3xl flex flex-col items-center justify-center gap-4 px-8 text-center"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--bd)',
          boxShadow: 'var(--card-shad)',
          opacity: active ? 0 : 1,
          pointerEvents: active ? 'none' : 'auto',
        }}
      >
        <span
          className="w-12 h-12 rounded-2xl grid place-items-center"
          style={{
            background: 'linear-gradient(135deg, rgba(var(--accent-rgb),0.22) 0%, rgba(var(--accent-rgb),0.06) 100%)',
            border: '1px solid rgba(var(--accent-rgb),0.30)',
          }}
        >
          <Icon className="h-5 w-5" style={{ color: 'var(--txm)' }} />
        </span>
        <span className="text-[16px] font-semibold leading-snug" style={{ color: 'var(--tx1)' }}>{item.cover}</span>
        <span className="text-[12.5px] leading-relaxed max-w-[26ch]" style={{ color: 'var(--txf)' }}>{item.hint}</span>
        <span className="text-[12px] font-medium mt-1" style={{ color: 'var(--brand)' }}>
          {de ? 'Rechner öffnen →' : 'Open calculator →'}
        </span>
        </button>
      </div>
    </div>
  );
}

export function ToolTrack({ items, onActiveChange }: {
  items: TrackItem[];
  /** Meldet den Schluessel der aktiven Karte — die Sektion braucht ihn, um die
   *  Profilleiste zu deaktivieren, wenn der Rechner davorne sie nicht nutzt. */
  onActiveChange?: (key: string) => void;
}) {
  const { lang } = useLanguage();
  const de = lang === 'de';
  const count = items.length;

  const [active, setActive] = useState(0);
  const labels = useMemo(() => items.map(i => i.label), [items]);
  const { containerRef: deckRef, height: deckHeight } = useMeasuredHeight(active, '.deck-slot > div');
  const { containerRef: trackRef, height: trackHeight } = useMeasuredHeight(active, ':scope > div');

  const activeKey = items[active]?.key;
  useEffect(() => {
    if (activeKey) onActiveChange?.(activeKey);
  }, [activeKey, onActiveChange]);

  // ── Mobiler Reiter-Balken ────────────────────────────────────────────────
  const tabBarRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabPillRef = useRef<HTMLDivElement>(null);
  const deckTabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStart = useRef<{ x: number; y: number; isSlider: boolean }>({ x: 0, y: 0, isSlider: false });

  const pillX = (btnRect: DOMRect, barRect: DOMRect) =>
    btnRect.left - barRect.left + (tabBarRef.current?.scrollLeft ?? 0) - 1;

  // Erste Positionierung ohne Animation.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const btn = tabButtonRefs.current[0], bar = tabBarRef.current, pill = tabPillRef.current;
      if (!btn || !bar || !pill) return;
      gsap.set(pill, { x: pillX(btn.getBoundingClientRect(), bar.getBoundingClientRect()), width: btn.getBoundingClientRect().width });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const btn = tabButtonRefs.current[active], bar = tabBarRef.current, pill = tabPillRef.current;
    if (!btn || !bar || !pill) return;
    gsap.to(pill, {
      x: pillX(btn.getBoundingClientRect(), bar.getBoundingClientRect()),
      width: btn.getBoundingClientRect().width,
      duration: 0.35, ease: 'power3.inOut', overwrite: 'auto',
    });
    // Neu gegenueber der Dreier-Version: bei sechs Reitern passt der Balken
    // nicht mehr auf einen Handy-Bildschirm, der aktive muss also sichtbar
    // gescrollt werden — sonst wischt man zu einer Karte, deren Reiter im
    // abgeschnittenen Teil der Leiste liegt.
    //
    // Bewusst NICHT scrollIntoView: das scrollt JEDEN scrollbaren Vorfahren,
    // also auch das Dokument. Dieser Effekt laeuft schon beim Mount, und da
    // liegt die Reiterleiste mehrere Bildschirme unterhalb des Viewports —
    // die Startseite sprang dadurch beim Laden von allein nach unten
    // (gemessen: scrollY 0 -> 6579 innerhalb von 1,6 s). `block: 'nearest'`
    // verhindert das nicht, es bestimmt nur, welche Kante angefahren wird.
    // Gewollt ist ausschliesslich das horizontale Zentrieren INNERHALB der
    // Leiste, deshalb wird hier direkt deren scrollLeft gesetzt.
    const barRect = bar.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    bar.scrollTo({
      left: bar.scrollLeft + (btnRect.left - barRect.left) - (barRect.width - btnRect.width) / 2,
      behavior: 'smooth',
    });
  }, [active, labels]);

  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;
    const observer = new ResizeObserver(() => {
      const btn = tabButtonRefs.current[activeRef.current], pill = tabPillRef.current;
      if (!btn || !pill) return;
      gsap.set(pill, { x: pillX(btn.getBoundingClientRect(), bar.getBoundingClientRect()), width: btn.getBoundingClientRect().width });
    });
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  // Roving Tabindex: nur der gewaehlte Reiter ist tabbar, der Fokus muss also
  // mitwandern, wenn die Pfeiltasten die Auswahl verschieben.
  const moveDeck = (next: number) => {
    setActive(next);
    deckTabRefs.current[next]?.focus();
  };

  return (
    <>
      {/* ── Bis lg: wischbare Reiter ── */}
      <div className="lg:hidden">
        <div
          ref={tabBarRef}
          role="tablist"
          className="relative flex p-1 rounded-2xl mb-5 overflow-x-auto hide-scrollbar"
          style={{ background: 'var(--tab-track-bg)', border: '1px solid var(--tab-track-bd)' }}
        >
          <div
            ref={tabPillRef}
            className="absolute top-1 bottom-1 rounded-xl pointer-events-none"
            style={{ width: 0, background: 'var(--tab-pill-bg)', border: '1px solid var(--tab-pill-bd)', boxShadow: 'var(--tab-pill-shadow)' }}
          />
          {items.map((item, i) => (
            <button
              key={item.key}
              ref={el => { tabButtonRefs.current[i] = el; }}
              onClick={() => setActive(i)}
              role="tab"
              aria-selected={active === i}
              className="relative z-10 flex-1 min-w-[76px] px-3 py-2 rounded-xl text-[13px] font-semibold transition-colors whitespace-nowrap"
              style={{ color: active === i ? 'var(--tx1)' : 'var(--txf)', letterSpacing: active === i ? '-0.01em' : '0' }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div
          className="overflow-hidden transition-[height] duration-500 ease-out"
          style={{ height: trackHeight }}
          onTouchStart={e => {
            const target = e.target as HTMLElement;
            touchStart.current = {
              x: e.touches[0].clientX,
              y: e.touches[0].clientY,
              // Ein Wisch auf dem Slider verstellt den Slider, er blaettert nicht.
              isSlider: !!target.closest('[role="slider"], [data-orientation]'),
            };
          }}
          onTouchEnd={e => {
            if (touchStart.current.isSlider) return;
            const dx = e.changedTouches[0].clientX - touchStart.current.x;
            const dy = e.changedTouches[0].clientY - touchStart.current.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
              if (dx < 0 && active < count - 1) setActive(active + 1);
              if (dx > 0 && active > 0) setActive(active - 1);
            }
          }}
        >
          <div
            ref={trackRef}
            className="flex items-start transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {items.map((item, i) => (
              <div key={item.key} className="min-w-full" inert={active !== i}>{item.node}</div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          {items.map((item, i) => (
            <button
              key={item.key}
              onClick={() => setActive(i)}
              className="relative transition-all duration-300 after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-11 after:h-11"
              aria-label={item.label}
              style={{
                width: i === active ? '20px' : '6px', height: '6px', borderRadius: '3px',
                background: i === active ? 'var(--accent)' : 'var(--bd)',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Ab lg: dasselbe als 3D-Deck ── */}
      <div className="hidden lg:block">
        {/* Hoehe folgt der aktiven Karte, mit Uebergang — der Wechsel liest
            sich dadurch als Bewegung und nicht als Sprung. overflow-hidden
            faengt den Rest ab: die Nachbarkarten stehen zentriert in dieser
            Hoehe, und bei sechs unterschiedlich hohen Rechnern ist eine
            Nachbarkarte gelegentlich hoeher als die aktive — ohne Deckel
            ragte sie sichtbar oben aus dem Stapel heraus. */}
        <div
          ref={deckRef}
          className="relative overflow-hidden transition-[height] duration-500 ease-out"
          style={{ perspective: '1900px', height: deckHeight }}
        >
          {items.map((item, i) => (
            <DeckSlot
              key={item.key}
              item={item}
              rel={(i - active + count) % count}
              count={count}
              active={i === active}
              onActivate={() => setActive(i)}
              de={de}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={() => setActive((active - 1 + count) % count)}
            aria-label={de ? 'Vorheriger Rechner' : 'Previous calculator'}
            className="w-11 h-11 rounded-full grid place-items-center transition-colors hover:opacity-80"
            style={{ border: '1px solid var(--bd)', background: 'var(--sf)', color: 'var(--tx2)' }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div
            role="tablist"
            aria-label={de ? 'Rechner' : 'Calculators'}
            className="flex items-center gap-1 p-1 rounded-full"
            style={{ background: 'var(--tab-track-bg)', border: '1px solid var(--tab-track-bd)' }}
            onKeyDown={e => {
              if (e.key === 'ArrowRight') { e.preventDefault(); moveDeck((active + 1) % count); }
              if (e.key === 'ArrowLeft')  { e.preventDefault(); moveDeck((active - 1 + count) % count); }
              if (e.key === 'Home')       { e.preventDefault(); moveDeck(0); }
              if (e.key === 'End')        { e.preventDefault(); moveDeck(count - 1); }
            }}
          >
            {items.map((item, i) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                ref={el => { deckTabRefs.current[i] = el; }}
                aria-selected={active === i}
                tabIndex={active === i ? 0 : -1}
                onClick={() => setActive(i)}
                className="px-4 py-2.5 rounded-full text-[13px] font-semibold transition-colors whitespace-nowrap"
                style={{
                  background: active === i ? 'var(--tab-pill-bg)' : 'transparent',
                  border: active === i ? '1px solid var(--tab-pill-bd)' : '1px solid transparent',
                  boxShadow: active === i ? 'var(--tab-pill-shadow)' : 'none',
                  color: active === i ? 'var(--tx1)' : 'var(--txf)',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setActive((active + 1) % count)}
            aria-label={de ? 'Nächster Rechner' : 'Next calculator'}
            className="w-11 h-11 rounded-full grid place-items-center transition-colors hover:opacity-80"
            style={{ border: '1px solid var(--bd)', background: 'var(--sf)', color: 'var(--tx2)' }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
