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

// Geometrie des Decks. Die Karte ist ueber left:50% + translate(-50%)
// zentriert, das zusaetzliche translateX schiebt ihre Mitte nach aussen.
// 0,70 w > 0,5 w heisst, die Mitte der Nachbarkarte liegt ausserhalb der
// aktiven Karte, ihre Beschriftung bleibt also lesbar; 0,70 w + 0,92 w/2 =
// 1,16 w bleibt bei 42 % Kartenbreite innerhalb der Spalte (bei 1024, 1280
// und 1440 geprueft).
//
// Flacher gedreht als vorher (14 statt 18 Grad, scale 0,92 statt 0,90): die
// Karte ist seit dem Hoehen-Umbau breiter als hoch, und in dem Format liest
// sich eine starke Drehung als Verzerrung statt als Tiefe.
function slotTransform(rel: number, count: number): React.CSSProperties {
  if (rel === 0) {
    return { transform: 'translate(-50%) rotateY(0deg) scale(1)', zIndex: 30, opacity: 1 };
  }
  if (rel === 1) {
    return { transform: 'translate(-50%) translateX(70%) rotateY(-14deg) scale(0.92)', zIndex: 20, opacity: 1 };
  }
  if (rel === count - 1) {
    return { transform: 'translate(-50%) translateX(-70%) rotateY(14deg) scale(0.92)', zIndex: 20, opacity: 1 };
  }
  // Alles Weitere steht als Stapel hinter der aktiven Karte. Unsichtbar, aber
  // vorhanden — so hat der Uebergang beim Weiterblaettern etwas zu animieren,
  // statt dass eine Karte aus dem Nichts erscheint.
  return { transform: 'translate(-50%) scale(0.86)', zIndex: 10, opacity: 0, pointerEvents: 'none' };
}

// ── Kartenhoehe ────────────────────────────────────────────────────────────
//
// Vorher zwei feste Zahlen (840/850 px), geeicht auf einen Karteninhalt mit
// Skizzen. Damit war die Sektion rund 1250 px hoch: man musste scrollen, um
// Eingabe UND Antwort zu sehen — bei einem Werkzeug, dessen ganzer Sinn der
// Zusammenhang zwischen beidem ist.
//
// Die Hoehe kommt jetzt vom Bildschirm: alles, was ausser der Karte in der
// Sektion steht, wird von 100svh abgezogen. `svh` und nicht `vh`/`dvh`, weil
// sich der Wert dann nicht aendert, wenn die mobile Adressleiste ein- und
// ausfaehrt (dieselbe Regel wie beim Hero, siehe index.css).
//
// Der Abzug von 300 px ist gemessen, nicht geschaetzt: feste Navigation 60,
// Profilleiste 112 + 16 Abstand, Reiterzeile 64, „Alle Rechner" 36, dazu das
// Sektionspolster. Was sich davon nicht ausgeht, faengt die Ueberschrift auf —
// die darf oben aus dem Bild laufen, alles Bedienbare nicht.
// Nachgemessen bei 1440x800 (Karte 500, Leiste bis Link 735 + 60 Navigation)
// und 1440x900 (Karte 580, 815 + 60).
//
// Untergrenze: die Hoehe, in die der laengste der sechs Rechner (Verschleiss)
// gerade noch passt, ohne dass etwas abgeschnitten wird — mit aufgehobener
// Hoehenbindung ueber alle sechs Karten gemessen. Die beiden Werte
// unterscheiden sich, weil die Karte im Deck bei 1024 px Fensterbreite nur
// 344 px breit ist (42 % der Spalte) und damit schmaler als auf dem Handy:
// mehr Zeilenumbrueche, 488 px statt 482 px Bedarf.
// Obergrenze 580 px, damit die Karte auf einem grossen Monitor nicht ins
// Leere waechst.
const DECK_HEIGHT = 'clamp(492px, calc(100svh - 300px), 580px)';
const TRACK_HEIGHT = 'clamp(485px, calc(100svh - 285px), 580px)';

function DeckSlot({ item, rel, count, active, onActivate, de, index }: {
  item: TrackItem; rel: number; count: number; active: boolean; onActivate: () => void;
  de: boolean; index: number;
}) {
  const { Icon } = item;
  return (
    <div className="deck-slot absolute inset-y-0 left-1/2 w-[42%]" style={slotTransform(rel, count)}>
      <div className="relative w-full h-full">
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

            Aufbau wie die offene Karte, nicht als zentrierter Block: Kopf
            (Nummer + Icon) oben, Frage und Hinweis in der Mitte, die
            Aufforderung unten hinter einer Trennlinie. Vorher stand alles
            mittig in einer sonst leeren Flaeche — bei einer 840 px hohen Karte
            waren das zwei grosse dunkle Rechtecke links und rechts. */}
        <button
          type="button"
          onClick={onActivate}
          aria-label={de ? `${item.label} anzeigen` : `Show ${item.label}`}
          aria-hidden={active}
          tabIndex={active ? -1 : 0}
          className="deck-cover absolute inset-0 z-10 rounded-3xl flex flex-col items-stretch text-left px-6 py-6 overflow-hidden"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--tool-card-bd)',
            boxShadow: 'var(--tool-card-shad)',
            opacity: active ? 0 : 1,
            pointerEvents: active ? 'none' : 'auto',
          }}
        >
          {/* Weicher Akzentschimmer aus der oberen Ecke — gibt dem Stapel
              Tiefe, ohne eine zweite Farbe einzufuehren (DESIGN.md §1). */}
          <span
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(120% 80% at 15% 0%, rgba(var(--accent-rgb),0.10) 0%, transparent 62%)',
            }}
          />

          <span className="relative flex items-center justify-between">
            <span
              className="w-10 h-10 rounded-xl grid place-items-center"
              style={{
                background: 'linear-gradient(135deg, rgba(var(--accent-rgb),0.22) 0%, rgba(var(--accent-rgb),0.06) 100%)',
                border: '1px solid rgba(var(--accent-rgb),0.30)',
              }}
            >
              <Icon className="h-[18px] w-[18px]" style={{ color: 'var(--txm)' }} />
            </span>
            <span className="text-meta uppercase tracking-[0.14em] font-semibold tabular-nums" style={{ color: 'var(--txff)' }}>
              {String(index + 1).padStart(2, '0')}
            </span>
          </span>

          <span className="relative flex flex-col gap-2.5 my-auto">
            <span className="text-meta uppercase tracking-[0.14em] font-semibold" style={{ color: 'var(--brand)' }}>
              {item.label}
            </span>
            <span className="text-[19px] font-semibold leading-snug tracking-[-0.01em]" style={{ color: 'var(--tx1)' }}>
              {item.cover}
            </span>
            <span className="text-[12.5px] leading-relaxed" style={{ color: 'var(--txf)' }}>
              {item.hint}
            </span>
          </span>

          <span
            className="relative flex items-center justify-between pt-3 text-[12px] font-medium"
            style={{ borderTop: '1px solid var(--inset-bd)', color: 'var(--brand)' }}
          >
            <span>{de ? 'Rechner öffnen' : 'Open calculator'}</span>
            <ChevronRight className="h-3.5 w-3.5" />
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
   *  Pfeile) statt in einer eigenen darunter — eine eigene Zeile kostete
   *  36 px, und die Sektion soll auf eine Bildschirmhoehe passen. */
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
        <div
          className="overflow-hidden"
          style={{ height: TRACK_HEIGHT }}
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
            className="flex items-start h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {items.map((item, i) => (
              <div key={item.key} className="min-w-full h-full" inert={active !== i}>{item.node}</div>
            ))}
          </div>
        </div>
        {/* Keine Punktreihe mehr unter der Karte: sie sagte dasselbe wie die
            Reiterleiste darueber (welcher von sechs Rechnern steht vorne) und
            kostete mit ihren 44-px-Trefferflaechen 32 px Hoehe. Auf dem Handy
            ist genau das der Unterschied zwischen „Antwort und Knopf sichtbar"
            und „scrollen". Gewischt wird unveraendert weiter; die Reiterleiste
            scrollt den aktiven Reiter dabei mittig (siehe Effekt oben). */}
      </div>

      {/* ── Ab lg: dasselbe als 3D-Deck ── */}
      <div className="hidden lg:block">
        {/* Feste Hoehe fuer alle sechs Rechner (DECK_HEIGHT) statt gemessener
            — overflow-hidden bleibt als Sicherheitsnetz, falls eine Uebersetzung
            oder ein Sonderfall den knappen Rahmen doch einmal sprengt. */}
        <div
          className="relative overflow-hidden"
          style={{ perspective: '1900px', height: DECK_HEIGHT }}
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
              index={i}
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
