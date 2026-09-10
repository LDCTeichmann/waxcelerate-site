import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

export function MobileStickyCTA() {
  const location = useLocation();
  const { lang } = useLanguage();
  // Tracks "has the user scrolled past the hero" and "is the footer on
  // screen" separately — the bar shows whenever the first is true and the
  // second is false. Mobile-Plan B2: vorher wurde die Leiste ausgeblendet,
  // solange #produkte im Bild war. Seit B1 (Produkte nach vorn) sitzt die
  // Produktsektion bei Bildschirm ~1,1 statt ~4,0 — mit der alten Logik
  // waere die Leiste fast nie sichtbar, weil "past hero" und "on products"
  // fast denselben Scrollbereich abdecken. Jetzt bleibt sie durchgehend
  // sichtbar, sobald der Hero durch ist, und blendet sich nur im
  // Footer-Bereich aus (dort gibt es eigene Kontakt-/Rechtslinks statt
  // eines Kauf-CTAs, siehe docs/plaene/MOBILE_PLAN.md B2).
  const [pastHero, setPastHero] = useState(false);
  const [inFooter, setInFooter] = useState(false);
  // Dritter Fall neben Hero und Footer: die Rechner-Sektion. Sie ist so
  // gebaut, dass Profilleiste, Karte und Bedienelemente zusammen auf eine
  // Bildschirmhoehe passen (ToolTrack.tsx) — die 52 px dieser Leiste wuerden
  // dort genau den Knopf unter dem Ergebnis verdecken. Die Sektion hat mit
  // dem CTA in jeder Karte einen eigenen Weiterweg, es geht also keiner
  // verloren; die Leiste kommt danach von selbst zurueck.
  const [inTools, setInTools] = useState(false);

  const isMain = location.pathname === '/';

  useEffect(() => {
    if (!isMain) return;
    const home = document.getElementById('home');
    const footer = document.querySelector('footer');
    if (!home || !footer) return;

    const homeObserver = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { threshold: 0 }
    );

    const footerObserver = new IntersectionObserver(
      ([entry]) => setInFooter(entry.isIntersecting),
      { rootMargin: '0px 0px -50% 0px', threshold: 0 }
    );

    // -20 % oben und unten: die Leiste soll erst weichen, wenn die Sektion
    // wirklich im Bild steht, nicht schon wenn ihre Kante hereinragt.
    const toolsObserver = new IntersectionObserver(
      ([entry]) => setInTools(entry.isIntersecting),
      { rootMargin: '-20% 0px -20% 0px', threshold: 0 }
    );

    homeObserver.observe(home);
    footerObserver.observe(footer);

    // Die Rechner-Sektion wird nachgeladen (Suspense in App.tsx) und steht
    // beim ersten Lauf dieses Effekts noch nicht im DOM — direkt zu
    // beobachten ging deshalb ins Leere. Kurz nachfassen, bis sie da ist.
    let attempts = 0;
    let timer: number | undefined;
    const attach = () => {
      const tools = document.getElementById('tools');
      if (tools) { toolsObserver.observe(tools); return; }
      if (attempts++ < 40) timer = window.setTimeout(attach, 150);
    };
    attach();

    return () => {
      homeObserver.disconnect();
      footerObserver.disconnect();
      toolsObserver.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [isMain]);

  const visible = pastHero && !inFooter && !inTools;

  if (!isMain) return null;

  // Solange der Klick nur scrollt, muss die Beschriftung das auch sagen —
  // "Jetzt bestellen" suggeriert einen abgeschlossenen Kauf, den es (noch)
  // nicht gibt. Sobald C1 einen echten Checkout anbindet, darf hier wieder
  // "Jetzt bestellen" stehen (siehe docs/plaene/MOBILE_PLAN.md B2, Frage 1).
  const label = lang === 'de' ? 'Zu den Produkten →' : 'To the products →';

  const handleClick = () => {
    document.getElementById('produkte')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      // translate-y-full moves this off-screen but doesn't remove it from
      // the tab order — rendered before <Navigation/> in App.tsx, so before
      // this fix a keyboard user's very first Tab press on page load landed
      // on this invisible button instead of the header's new skip link.
      // Same root-cause fix as the mobile nav panel / CartDrawer.
      aria-hidden={!visible}
      inert={!visible}
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}
    >
      <button
        onClick={handleClick}
        className="w-full py-4 text-sm font-semibold"
        style={{
          background: 'var(--cta-bg)',
          color: 'var(--cta-fg)',
          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
        }}
      >
        {label}
      </button>
    </div>
  );
}
