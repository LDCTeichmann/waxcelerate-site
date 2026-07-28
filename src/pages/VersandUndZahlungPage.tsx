import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { shipping } from '@/lib/data';

const fmt = (cents: number) => (cents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

export function VersandUndZahlungPage() {
  return (
    <>
      <Helmet>
        <title>Versand &amp; Zahlung | Waxcelerate</title>
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

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Versandkosten</h2>
            <p className="text-wx-tx2 leading-relaxed mb-4">
              Der Versandpreis richtet sich nach Gewicht und Größe deiner Bestellung und wird im
              Warenkorb angezeigt, bevor du zur Kasse gehst.
            </p>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--bd2)' }}>
              <table className="w-full text-sm">
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--bd2)' }}>
                    <td className="px-4 py-3 text-wx-tx2">{shipping.grossbrief.label} (bis {shipping.grossbrief.maxGrams}g, flach)</td>
                    <td className="px-4 py-3 text-right font-semibold text-wx-tx1 tabular-nums">{fmt(shipping.grossbrief.cents)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--bd2)' }}>
                    <td className="px-4 py-3 text-wx-tx2">{shipping.maxibrief.label} (bis {shipping.maxibrief.maxGrams}g oder dicker als 2cm)</td>
                    <td className="px-4 py-3 text-right font-semibold text-wx-tx1 tabular-nums">{fmt(shipping.maxibrief.cents)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--bd2)' }}>
                    <td className="px-4 py-3 text-wx-tx2">{shipping.paket.label} (darüber)</td>
                    <td className="px-4 py-3 text-right font-semibold text-wx-tx1 tabular-nums">{fmt(shipping.paket.cents)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-wx-tx2">Ab {fmt(shipping.freeFromCents)} Bestellwert</td>
                    <td className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--accent)' }}>kostenlos</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-wx-txf leading-relaxed mt-3">
              Ein einzelner Wachsblock ist auch unter {shipping.grossbrief.maxGrams}g ein {shipping.maxibrief.label},
              weil er dicker als das 2-cm-Limit des {shipping.grossbrief.label}s ist. Bei mehreren
              Artikeln im Warenkorb entscheidet zusätzlich das Gesamtgewicht.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Lieferzeit</h2>
            <p className="text-wx-tx2 leading-relaxed">
              Versand innerhalb 1–2 Werktagen nach Zahlungseingang, Zustellung deutschlandweit meist
              innerhalb 1–3 Werktagen danach. Versand aus Stuttgart.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Zahlungsarten</h2>
            <p className="text-wx-tx2 leading-relaxed">
              Kreditkarte, SEPA-Lastschrift und Klarna, abgewickelt über Stripe. Als Kleinunternehmer
              nach § 19 UStG weisen wir keine Umsatzsteuer aus.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
