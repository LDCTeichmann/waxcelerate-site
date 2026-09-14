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

// Geometrie des Decks.
//
// Alle Karten liegen per Grid-Stacking in derselben Zelle (grid-area 1/1).
// Die Zeile wird damit so hoch wie die HOECHSTE der Karten, und jede Karte
// streckt sich auf diese Hoehe (align-self: stretch). Alle Karten sind also
// immer exakt gleich gross, ohne Messung per JavaScript und ohne Sprung beim
// Blaettern. Vorher bekam das Deck die gemessene Hoehe der aktiven Karte —
// beim Wechsel von Intervall (kurz) zu Umstieg (lang) sprang die ganze Sektion.
// Die Hoehe haelt die Gestaltung der Karten klein (Ziel <= 600 px am Desktop,
// siehe docs/DESIGN.md „Rechner-Karten").
//
// Nachbarkarten: kleiner (0,88) und um --tilt (9 Grad, index.css) mit der
// Aussenkante nach hinten geneigt. Die Drehachse liegt an der INNENkante
// (transform-origin), nicht in der Kartenmitte wie bei der alten 12-Grad-
// Fassung: so geht die Aussenkante weg, der sichtbare Streifen mit dem
// Deckeltext bleibt nahezu unverzerrt (Tiefe dort ~0,14 x Kartenbreite, bei
// 2400 px Perspektive rund 4 % Verkleinerung). Alle Zustaende nutzen dieselbe
// Funktionsliste translateX/rotateY/scale, damit der Flip sauber interpoliert.
// --deck-shift: Aussenkante in der Spalte, also (shift + 0,38) x Kartenbreite
// <= halbe Spalte — bei 64 % (lg) hoechstens 40 %, bei 58 % (xl) hoechstens
// 48 %; gesetzt 40 und 47 %. Sichtbar bleiben (shift - 0,12) x Kartenbreite,
// --cover-w (21 / 29 %) haelt den Deckeltext >= 20 px vor der aktiven Karte.
function slotTransform(rel: number, count: number): React.CSSProperties {
  if (rel === 0) {
    return { transform: 'translateX(0) rotateY(0deg) scale(1)', transformOrigin: '50% 50%', zIndex: 30, opacity: 1 };
  }
  // Seit v6 wie ein aufgeschlagenes Buch: die Aussenkante kommt dem Betrachter
  // ENTGEGEN (rechts rotateY negativ, links positiv), die Achse bleibt innen.
  // Die nach vorn kommende Kante wird perspektivisch groesser, deshalb 0,84.
  if (rel === 1) {
    return { transform: 'translateX(var(--deck-shift)) rotateY(calc(var(--tilt) * -1)) scale(0.84)', transformOrigin: '0% 50%', zIndex: 20, opacity: 1 };
  }
  if (rel === count - 1) {
    return { transform: 'translateX(calc(var(--deck-shift) * -1)) rotateY(var(--tilt)) scale(0.84)', transformOrigin: '100% 50%', zIndex: 20, opacity: 1 };
  }
  // Alles Weitere steht als Stapel hinter der aktiven Karte. Unsichtbar, aber
  // vorhanden — so hat der Uebergang beim Weiterblaettern etwas zu animieren,
  // statt dass eine Karte aus dem Nichts erscheint.
  return { transform: 'translateX(0) rotateY(0deg) scale(0.8)', transformOrigin: '50% 50%', zIndex: 10, opacity: 0, pointerEvents: 'none' };
}

function DeckSlot({ item, rel, count, active, onActivate, de }: {
  item: TrackItem; rel: number; count: number; active: boolean; onActivate: () => void;
  de: boolean;
}) {
  const { Icon } = item;
  // Welche Seite der Nachbarkarte sichtbar ist: bei der rechten der rechte
  // Streifen, bei der linken der linke. Der Deckelinhalt steht genau dort.
  const side: 'left' | 'right' = rel === count - 1 ? 'left' : 'right';
  const neighbour = rel === 1 || rel === count - 1;
  return (
    <div
      className={`deck-slot group [grid-area:1/1] justify-self-center w-[64%] xl:w-[58%] ${neighbour ? 'deck-neighbour' : ''}`}
      style={slotTransform(rel, count)}
    >
      {/* Nachbarn abschneiden; die aktive nicht, sonst faellt ihr Schatten weg. */}
      <div className={`relative w-full h-full rounded-3xl ${active ? '' : 'overflow-hidden'}`}>
        {/* `inert` nimmt die ganze inaktive Karte in einem Zug aus
            Tab-Reihenfolge und Accessibility-Baum — eine Karte im Hintergrund
            darf weder per Tab erreichbar sein noch vorgelesen werden, als
            stuende sie vorne. */}
        <div className="h-full" inert={!active}>{item.node}</div>

        {/* Deckel fuer alle Karten ausser der vorderen. Sechs offene Rechner
            nebeneinander sind Laerm; der Deckel reduziert jede Karte auf die
            Frage, die sie beantwortet, und blendet sich beim Nachvornedrehen
            aus — das liest sich als Aufklappen. Bleibt montiert, damit die
            Blende in beide Richtungen etwas zu animieren hat.

            Der Text steht im sichtbaren Streifen (--cover-w), gerade und in
            voller Deckkraft. Abgedunkelt wird nur die Flaeche: ein Verlauf von
            der verdeckten Innenkante zur hellen Aussenkante. */}
        <button
          type="button"
          onClick={onActivate}
          aria-label={de ? `${item.label} anzeigen` : `Show ${item.label}`}
          aria-hidden={active}
          tabIndex={active ? -1 : 0}
          className={`deck-cover absolute inset-0 z-10 rounded-3xl flex flex-col py-8 overflow-hidden cursor-pointer ${side === 'right' ? 'items-end text-left pr-7' : 'items-start text-right pl-7'}`}
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--tool-card-bd)',
            boxShadow: 'var(--tool-card-shad)',
            opacity: active ? 0 : 1,
            pointerEvents: active ? 'none' : 'auto',
          }}
        >
          <span
            aria-hidden
            className="deck-cover-shade absolute inset-0 pointer-events-none"
            style={{
              // Wie eine aufgeschlagene Seite: Falzschatten an der Innenkante,
              // zur Aussenkante hin, die dem Betrachter entgegenkommt, heller.
              background: `linear-gradient(${side === 'right' ? '90deg' : '270deg'}, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.07) 22%, transparent 55%, rgba(255,255,255,0.05) 100%)`,
            }}
          />

          <span className="relative w-[var(--cover-w)] flex">
            <span
              className={`w-10 h-10 rounded-xl grid place-items-center ${side === 'left' ? 'ml-auto' : ''}`}
              style={{
                background: 'linear-gradient(135deg, rgba(var(--accent-rgb),0.22) 0%, rgba(var(--accent-rgb),0.06) 100%)',
                border: '1px solid rgba(var(--accent-rgb),0.30)',
              }}
            >
              <Icon className="h-[18px] w-[18px]" style={{ color: 'var(--txm)' }} />
            </span>
          </span>

          <span className="relative w-[var(--cover-w)] flex flex-col gap-2.5 my-auto">
            <span className="text-meta uppercase tracking-[0.14em] font-semibold" style={{ color: 'var(--brand)' }}>
              {item.label}
            </span>
            <span className="text-[19px] xl:text-[22px] font-semibold leading-tight tracking-[-0.01em]" style={{ color: 'var(--tx1)' }}>
              {item.cover}
            </span>
            <span className="text-[13px] leading-relaxed" style={{ color: 'var(--txm)' }}>
              {item.hint}
            </span>
          </span>

          <span
            className={`relative w-[var(--cover-w)] flex items-center justify-between pt-3 text-[13px] font-medium ${side === 'left' ? 'flex-row-reverse' : ''}`}
            style={{ borderTop: '1px solid var(--inset-bd)', color: 'var(--brand)' }}
          >
            <span>{de ? 'Rechner öffnen' : 'Open calculator'}</span>
            {side === 'left' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        </button>

        {/* Haarlinie in Akzentfarbe auf der Oberkante der vorderen Karte:
            sagt auch ohne Bewegung, welche Karte bedienbar ist. */}
        <span
          aria-hidden
          className="deck-cover absolute top-0 left-8 right-8 h-px z-20 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(var(--accent-rgb),0.55), transparent)',
            opacity: active ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
}

export function ToolTrack({ items, onActiveChange, trailing }: {
  items: TrackItem[];
  /** Steht in derselben Zeile wie die Bedienelemente (Punkte bzw. Reiter und
   *  Pfeile) statt in einer eigenen darunter. */
  trailing?: React.ReactNode;
  /** Meldet den Schluessel der aktiven Karte — die Sektion braucht ihn, um die
   *  Profilleiste zu deaktivieren, wenn der Rechner davorne sie nicht nutzt. */
  onActiveChange?: (key: string) => void;
}) {
  const { lang } = useLanguage();
  const de = lang === 'de';
  const count = items.length;

  const [active, setActive] = useState(0);
  const labels = useMemo(() => items.map(i => i.label), [items]);

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

  // Horizontales Wischen auf dem Trackpad blaettert das Deck. Eine Geste
  // liefert Dutzende Wheel-Events — nach einem Blaettern ist bis zum Ende der
  // Uebergangsanimation Ruhe.
  const wheelLock = useRef(0);
  const onDeckWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) < 24 || Math.abs(e.deltaX) < Math.abs(e.deltaY) * 1.5) return;
    const now = Date.now();
    if (now < wheelLock.current) return;
    wheelLock.current = now + 700;
    setActive(a => (a + (e.deltaX > 0 ? 1 : -1) + count) % count);
  };

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
          className="relative flex p-1 rounded-2xl mb-3 overflow-x-auto hide-scrollbar"
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
              // flex-1 hat die Reiter unter ihre Textbreite gestaucht: bei
              // sechs Rechnern liefen „Passende Kette", „Kettenlänge" und
              // „Umstieg" auf dem Handy ineinander. Feste Breite nach Inhalt,
              // die Leiste scrollt stattdessen (sie tut das ohnehin schon,
              // siehe den Effekt, der den aktiven Reiter mittig scrollt).
              className="relative z-10 flex-shrink-0 px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-colors whitespace-nowrap"
              style={{ color: active === i ? 'var(--tx1)' : 'var(--tx2)', letterSpacing: active === i ? '-0.01em' : '0' }}
            >
              {item.label}
            </button>
          ))}
        </div>
        {/* Keine feste Hoehe: die Karten stehen in einer Flex-Zeile mit
            items-stretch, die Zeile ist so hoch wie der hoechste Rechner und
            jede Karte fuellt sie. Beim Wischen aendert sich nichts an der Hoehe. */}
        <div
          className="overflow-hidden"
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
            className="flex items-stretch transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {items.map((item, i) => (
              <div key={item.key} className="min-w-full" inert={active !== i}>{item.node}</div>
            ))}
          </div>
        </div>
        {/* Keine Punktreihe unter der Karte: sie sagte dasselbe wie die
            Reiterleiste darueber. Gewischt wird unveraendert; die Reiterleiste
            scrollt den aktiven Reiter dabei mittig (siehe Effekt oben). */}
      </div>

      {/* ── Ab lg: dasselbe als 3D-Deck ── */}
      <div className="hidden lg:block">
        {/* Grid-Stacking: alle Karten in einer Zelle, Hoehe = hoechste Karte
            (siehe slotTransform). overflow-x nur als Netz, falls ein Schatten
            ueber die Spalte hinausragt. */}
        <div
          className="relative grid py-2 overflow-x-clip [--deck-shift:40%] [--cover-w:21%] xl:[--deck-shift:47%] xl:[--cover-w:29%]"
          style={{ perspective: '1800px', perspectiveOrigin: '50% 45%' }}
          onWheel={onDeckWheel}
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

        <div className="relative flex items-center justify-center gap-3 mt-3">
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
                  color: active === i ? 'var(--tx1)' : 'var(--tx2)',
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

          {/* Erst ab xl: bei 1024 px Fensterbreite stossen Reiterleiste und
              Link aneinander (Reiter + Pfeile brauchen dort 640 px der 912 px
              breiten Spalte). Eine eigene Zeile fuer den Link kostete 36 px,
              die bei dieser Fensterhoehe nicht da sind — und die Reiterleiste
              fuehrt ohnehin zu jedem der sechs Rechner. */}
          {trailing && (
            <span className="hidden xl:block absolute right-0 top-1/2 -translate-y-1/2">{trailing}</span>
          )}
        </div>
      </div>
    </>
  );
}
