// ── Tools-Sektion der Startseite ────────────────────────────────────────────
//
// War 1356 Zeilen: drei Rechner, zwei getrennte Renderpfade fuer Mobil und
// Desktop, zwei Zustandsvariablen fuer dieselbe Karte und drei untereinander
// widerspruechliche Konstantensaetze. Alles davon liegt jetzt in
// components/tools/ und lib/waxMath.ts, wo es auch die eigenen Rechnerseiten
// unter /rechner nutzen koennen.
//
// Hier bleibt nur die Sektion selbst: Ueberschrift, das gemeinsame Fahrprofil
// und der Track mit allen sechs Rechnern.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { useToolProfile } from '@/hooks/useToolProfile';
import { parseWaxedStamp } from '@/lib/toolState';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { Section } from '@/components/Section';
import { ProfileBar } from '@/components/tools/ProfileBar';
import { ToolDeck } from '@/components/tools/registry';
import { getToolBySlug, TOOLS } from '@/lib/toolRegistry';

export function Tools() {
  const { t } = useLanguage();
  const headerRef = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);

  const profile = useToolProfile();

  // Die Profilleiste bedient drei der sechs Rechner. Bei den anderen bleibt sie
  // stehen — sie auszublenden liesse bei jedem Kartenwechsel das Layout
  // springen —, wird aber zurueckgenommen und erklaert sich.
  const [activeKey, setActiveKey] = useState(TOOLS[0].slug);
  const handleActive = useCallback((key: string) => setActiveKey(key), []);
  const activeUsesProfile = getToolBySlug(activeKey)?.usesProfile ?? false;

  // Der QR-Code im Paket zeigt inzwischen auf /rechner/intervall?w=JJJJMMTT.
  // Aeltere Beileger und geteilte Links zeigen aber weiterhin auf die
  // Startseite — die muessen hier landen, sonst steht ihr Wachsdatum in einem
  // Rechner, den niemand sieht.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search);
    if (!parseWaxedStamp(q.get('w') || q.get('waxed'))) return;
    let attempts = 0;
    let cancelled = false;
    const go = () => {
      if (cancelled) return;
      const el = document.getElementById('tools');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else if (attempts < 20) { attempts += 1; setTimeout(go, 120); }
    };
    go();
    return () => { cancelled = true; };
  }, []);

  return (
    <Section id="tools" style={{ background: 'var(--tool-bg)' }}>
      <div ref={headerRef} className="mb-6">
        <h2 className="section-title mb-4">
          <ScrollWordReveal text={t.tools.title} />
        </h2>
        <p data-reveal="subtitle" className="text-wx-tx2 max-w-xl text-[15px]">
          {t.tools.subtitle}
        </p>
      </div>

      <ProfileBar
        profile={profile}
        inactiveNote={activeUsesProfile ? undefined : t.tools.profile.barInactive}
      />
      <ToolDeck profile={profile} onActiveChange={handleActive} />

      <div className="flex justify-center mt-6">
        <a
          href="/rechner"
          className="text-[13px] font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--brand)' }}
        >
          {t.tools.shared.allTools}
        </a>
      </div>

      {/* Verlauf nach unten — Uebergang zur FAQ */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, color-mix(in srgb, var(--pg), transparent 100%), var(--pg))', zIndex: 1 }}
      />
    </Section>
  );
}
