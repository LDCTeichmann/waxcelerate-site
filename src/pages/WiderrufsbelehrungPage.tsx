import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { removeStaticHeadMeta } from '@/lib/utils';

// Structure only — the actual clause comes from the BMJ's official template
// (bmjv.de/DE/service/formulare/form_widerrufsrecht), filled in with Luca's
// details. Using that template correctly is what makes the withdrawal
// disclosure legally privileged; a self-written text would not have that
// protection, so this page intentionally doesn't invent one. The template
// itself predates § 356a BGB and doesn't mention the electronic withdrawal
// button yet — that's the one addition below the template placeholder.
export function WiderrufsbelehrungPage() {
  // Vorgerenderte Fassung dieser Route liefert bereits eigene title/
  // description/canonical/og-Tags (data-prerendered="true", siehe metaTags()
  // in scripts/lib/prerender.mjs) — ohne Entfernung haeuften sich zwei
  // Instanzen jedes Tags im Live-DOM nach dem Hydrieren, derselbe Fix wie
  // removeStaticJsonLd() fuer JSON-LD.
  useEffect(() => { removeStaticHeadMeta(); }, []);

  return (
    <>
      <Helmet>
        <title>Widerrufsbelehrung | Waxcelerate</title>
        <meta name="description" content="Widerrufsrecht, Fristen und Folgen des Widerrufs für Bestellungen bei Waxcelerate." />
        <link rel="canonical" href="https://waxcelerate.de/widerrufsbelehrung" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Waxcelerate" />
        <meta property="og:locale" content="de_DE" />
        <meta property="og:title" content="Widerrufsbelehrung | Waxcelerate" />
        <meta property="og:description" content="Widerrufsrecht, Fristen und Folgen des Widerrufs für Bestellungen bei Waxcelerate." />
        <meta property="og:url" content="https://waxcelerate.de/widerrufsbelehrung" />
        <meta property="og:image" content="https://waxcelerate.de/images/hero-chain-texture.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Widerrufsbelehrung | Waxcelerate" />
        <meta name="twitter:description" content="Widerrufsrecht, Fristen und Folgen des Widerrufs für Bestellungen bei Waxcelerate." />
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

          <h1 className="text-3xl font-bold text-wx-tx1 mb-8">Widerrufsbelehrung</h1>

          <section
            className="mb-8 rounded-xl p-5"
            style={{ background: 'var(--accent-wash)', border: '1px dashed rgba(var(--accent-rgb),0.35)' }}
          >
            <p className="text-sm leading-relaxed" style={{ color: 'var(--tx1)' }}>
              <strong>Platzhalter.</strong> Hier kommt das amtliche Muster des Bundesjustizministeriums
              hin (Widerrufsrecht + Muster-Widerrufsformular), ausgefüllt mit Namen, Anschrift, E-Mail
              und der 14-tägigen Frist. Nur das amtliche Muster korrekt ausgefüllt ist rechtlich
              privilegiert — ein selbst geschriebener Text wäre das nicht.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Widerruf über die Website</h2>
            <p className="text-wx-tx2 leading-relaxed">
              Zusätzlich zu den im Muster genannten Wegen kannst du den Vertrag auch direkt über die{' '}
              <Link to="/widerruf" className="text-[var(--accent)] hover:underline">
                Widerrufs-Seite
              </Link>{' '}
              widerrufen. Dort reichen Bestellnummer, Bestelldatum, Produkt und eine E-Mail-Adresse für
              die Eingangsbestätigung — ein Grund wird nicht abgefragt.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
