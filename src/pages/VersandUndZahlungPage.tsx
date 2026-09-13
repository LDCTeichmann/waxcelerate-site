import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { checkoutEnabled } from '@/lib/data';
import { removeStaticHeadMeta } from '@/lib/utils';

// K8 (Produktkarten-Plan): diese ganze Seite beschrieb bisher den eigenen
// Stripe-Checkout ("Warenkorb", "zur Kasse", "abgewickelt über Stripe") so,
// als liefe er schon — tatsaechlich ist er inaktiv, solange kein Produkt
// eine stripePriceId traegt (checkoutEnabled in data.ts), und jeder Kauf
// geht ueber eBay. Die Versandtabelle bleibt als Referenz stehen (echte
// Deutsche-Post-Tarife), aber Einleitung und Zahlungsarten-Absatz sagen
// jetzt ehrlich, welcher Weg gerade gilt.
const metaDescription = 'Versand kostenlos innerhalb Deutschlands, werktags bis 15 Uhr bestellt am selben Tag verschickt. Lieferzeiten und Zahlungsarten bei Waxcelerate.';

export function VersandUndZahlungPage() {
  // Vorgerenderte Fassung dieser Route liefert bereits eigene title/
  // description/canonical/og-Tags (data-prerendered="true", siehe metaTags()
  // in scripts/lib/prerender.mjs) — ohne Entfernung haeuften sich zwei
  // Instanzen jedes Tags im Live-DOM nach dem Hydrieren, derselbe Fix wie
  // removeStaticJsonLd() fuer JSON-LD.
  useEffect(() => { removeStaticHeadMeta(); }, []);

  return (
    <>
      <Helmet>
        <title>Versand &amp; Zahlung | Waxcelerate</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href="https://waxcelerate.de/versand-und-zahlung" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Waxcelerate" />
        <meta property="og:locale" content="de_DE" />
        <meta property="og:title" content="Versand &amp; Zahlung | Waxcelerate" />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content="https://waxcelerate.de/versand-und-zahlung" />
        <meta property="og:image" content="https://waxcelerate.de/images/hero-chain-texture.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Versand &amp; Zahlung | Waxcelerate" />
        <meta name="twitter:description" content={metaDescription} />
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

          <h1 className="text-3xl font-bold text-wx-tx1 mb-8">Versand &amp; Zahlung</h1>

          {!checkoutEnabled && (
            <p className="text-wx-tx2 leading-relaxed mb-8 px-4 py-3 rounded-xl" style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
              Bestellungen laufen aktuell über eBay. Der Versand ist kostenlos, es fällt nichts
              zusätzlich an.
            </p>
          )}

          {/* Versand ist immer kostenlos (Luca, 13.09.2026), bei eBay wie im
              eigenen Checkout. Die Deutsche-Post-Tarife in data.ts bleiben
              als interne Portokosten, gehoeren aber nicht mehr auf diese Seite. */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Versandkosten</h2>
            <p className="text-wx-tx2 leading-relaxed">
              Der Versand innerhalb Deutschlands ist kostenlos, unabhängig von Bestellwert und
              Menge.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Lieferzeit</h2>
            <p className="text-wx-tx2 leading-relaxed">
              Werktags bis 15 Uhr bestellt, verschicken wir am selben Tag, danach am nächsten
              Werktag. Zustellung deutschlandweit meist innerhalb 1–3 Werktagen danach. Versand aus
              Stuttgart.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Zahlungsarten</h2>
            <p className="text-wx-tx2 leading-relaxed">
              {checkoutEnabled
                ? 'Kreditkarte, SEPA-Lastschrift und Klarna, abgewickelt über Stripe. Als Kleinunternehmer nach § 19 UStG weisen wir keine Umsatzsteuer aus.'
                : 'Aktuell zahlst du direkt bei eBay, mit den dort angebotenen Zahlungsarten. Als Kleinunternehmer nach § 19 UStG weisen wir keine Umsatzsteuer aus.'}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
