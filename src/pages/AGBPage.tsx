import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { removeStaticHeadMeta } from '@/lib/utils';

export function AGBPage() {
  // Vorgerenderte Fassung dieser Route liefert bereits eigene title/
  // description/canonical/og-Tags (data-prerendered="true", siehe metaTags()
  // in scripts/lib/prerender.mjs) — ohne Entfernung haeuften sich zwei
  // Instanzen jedes Tags im Live-DOM nach dem Hydrieren, derselbe Fix wie
  // removeStaticJsonLd() fuer JSON-LD.
  useEffect(() => { removeStaticHeadMeta(); }, []);

  return (
    <>
    <Helmet>
      <title>AGB | Waxcelerate</title>
      <meta name="description" content="Vertragsbedingungen für Bestellungen bei Waxcelerate: Vertragsschluss, Preise, Lieferung und Zahlung." />
      <link rel="canonical" href="https://waxcelerate.de/agb" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Waxcelerate" />
      <meta property="og:locale" content="de_DE" />
      <meta property="og:title" content="AGB | Waxcelerate" />
      <meta property="og:description" content="Vertragsbedingungen für Bestellungen bei Waxcelerate: Vertragsschluss, Preise, Lieferung und Zahlung." />
      <meta property="og:url" content="https://waxcelerate.de/agb" />
      <meta property="og:image" content="https://waxcelerate.de/images/hero-chain-texture.jpg" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="AGB | Waxcelerate" />
      <meta name="twitter:description" content="Vertragsbedingungen für Bestellungen bei Waxcelerate: Vertragsschluss, Preise, Lieferung und Zahlung." />
      <meta name="twitter:image" content="https://waxcelerate.de/images/hero-chain-texture.jpg" />
    </Helmet>
    <div className="bg-wx-bg min-h-screen py-20">
      <div className="max-w-2xl mx-auto px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-wx-tx2 hover:text-wx-tx1 transition-colors mb-10"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Link>

        <h1 className="text-3xl font-bold text-wx-tx1 mb-8">Allgemeine Geschäftsbedingungen</h1>

        {/* This page used to claim every purchase runs exclusively through eBay
            and points to eBay's buyer protection for returns — both became false
            the moment the site's own checkout could take an order, so they're
            removed rather than left half-right. Full AGB content (or the decision
            to run without any) is still Luca's to make — see docs/aufgaben/RECHTSTEXTE.md. */}
        <section
          className="mb-8 rounded-xl p-5"
          style={{ background: 'var(--accent-wash)', border: '1px dashed rgba(var(--accent-rgb),0.35)' }}
        >
          <p className="text-sm leading-relaxed" style={{ color: 'var(--tx1)' }}>
            <strong>In Überarbeitung.</strong> AGB sind gesetzlich nicht vorgeschrieben — ohne sie gilt
            das Gesetz. Diese Seite wird gerade auf den Verkauf über den eigenen Shop umgestellt.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Vertriebswege</h2>
          <p className="text-wx-tx2 leading-relaxed">
            Waxcelerate-Produkte werden sowohl über eBay als auch direkt über{' '}
            <a href="https://waxcelerate.de" className="text-[var(--accent)] hover:underline">waxcelerate.de</a>{' '}
            verkauft. Für Käufe über eBay gelten zusätzlich die{' '}
            <a
              href="https://www.ebay.de/help/policies/member-behavior-policies/allgemeine-geschaftsbedingungen?id=4076"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline inline-flex items-center gap-1"
            >
              Allgemeinen Geschäftsbedingungen von eBay
              <ExternalLink className="h-3 w-3" />
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Produkte</h2>
          <p className="text-wx-tx2 leading-relaxed">
            Alle Waxcelerate-Produkte (Heißwachsblöcke und vorgewachste Fahrradketten) werden
            handgemacht in Stuttgart hergestellt. Produktbeschreibungen und Abbildungen auf dieser
            Website dienen ausschließlich Informationszwecken.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Versand</h2>
          <p className="text-wx-tx2 leading-relaxed">
            Bestellungen werden in der Regel innerhalb von 1–2 Werktagen nach Zahlungseingang
            versendet. Versandkosten und Lieferzeit für Bestellungen über den eigenen Shop stehen
            unter{' '}
            <Link to="/versand-und-zahlung" className="text-[var(--accent)] hover:underline">
              Versand &amp; Zahlung
            </Link>
            ; für eBay-Käufe gelten die Angaben im jeweiligen Listing.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Widerruf &amp; Gewährleistung</h2>
          <p className="text-wx-tx2 leading-relaxed">
            Für Bestellungen über den eigenen Shop gilt das gesetzliche 14-tägige Widerrufsrecht —
            Details in der{' '}
            <Link to="/widerrufsbelehrung" className="text-[var(--accent)] hover:underline">
              Widerrufsbelehrung
            </Link>
            . Für Käufe über eBay gilt die eBay-Käuferschutzgarantie. Die gesetzlichen
            Gewährleistungsrechte bleiben in beiden Fällen unberührt.
          </p>
        </section>
      </div>
    </div>
    </>
  );
}
