import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { removeStaticHeadMeta } from '@/lib/utils';

// Text below is Anlage 1/Anlage 2 EGBGB (amtliches Muster für Widerrufsbelehrung
// und Widerrufsformular bei Warenkäufen im Fernabsatz), nur mit Waxcelerates
// Kontaktdaten ausgefüllt — nicht selbst formuliert. Nur die wortgetreue
// Verwendung dieses Musters ist rechtlich privilegiert (siehe RECHTSTEXTE.md).
// Der Hinweis zur elektronischen Widerrufsfunktion (§356a BGB, seit 19.06.2026)
// ist eine ergänzende, nicht musterprivilegierte Informationspflicht — dafür
// beschreibt der Abschnitt "Widerruf über die Website" unten in eigenen Worten,
// wo und wie die Funktion bereitsteht (/widerruf).
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

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Widerrufsrecht</h2>
            <p className="text-wx-tx2 leading-relaxed mb-4">
              Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu
              widerrufen.
            </p>
            <p className="text-wx-tx2 leading-relaxed mb-4">
              Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem du oder ein von dir benannter
              Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen hast bzw. hat.
            </p>
            <p className="text-wx-tx2 leading-relaxed mb-4">
              Um dein Widerrufsrecht auszuüben, musst du uns (Luca Teichmann, Waxcelerate,
              Florentinerstraße 17, 70619 Stuttgart, E-Mail: waxcelerate@gmail.com) mittels einer
              eindeutigen Erklärung (z.&nbsp;B. ein mit der Post versandter Brief oder eine E-Mail) über
              deinen Entschluss, diesen Vertrag zu widerrufen, informieren. Du kannst dafür das
              beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
              Zusätzlich kannst du dafür auch die{' '}
              <Link to="/widerruf" className="text-[var(--accent)] hover:underline">
                Widerrufs-Seite
              </Link>{' '}
              dieser Website nutzen.
            </p>
            <p className="text-wx-tx2 leading-relaxed">
              Zur Wahrung der Widerrufsfrist reicht es aus, dass du die Mitteilung über die Ausübung
              des Widerrufsrechts vor Ablauf der Widerrufsfrist absendest.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Folgen des Widerrufs</h2>
            <p className="text-wx-tx2 leading-relaxed mb-4">
              Wenn du diesen Vertrag widerrufst, haben wir dir alle Zahlungen, die wir von dir erhalten
              haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich
              daraus ergeben, dass du eine andere Art der Lieferung als die von uns angebotene,
              günstigste Standardlieferung gewählt hast), unverzüglich und spätestens binnen vierzehn
              Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über deinen Widerruf dieses
              Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe
              Zahlungsmittel, das du bei der ursprünglichen Transaktion eingesetzt hast, es sei denn,
              mit dir wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden dir wegen
              dieser Rückzahlung Entgelte berechnet.
            </p>
            <p className="text-wx-tx2 leading-relaxed mb-4">
              Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder
              bis du den Nachweis erbracht hast, dass du die Waren zurückgesandt hast, je nachdem,
              welches der frühere Zeitpunkt ist.
            </p>
            <p className="text-wx-tx2 leading-relaxed mb-4">
              Du hast die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem
              Tag, an dem du uns über den Widerruf dieses Vertrags unterrichtest, an uns
              zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn du die Waren vor Ablauf
              der Frist von vierzehn Tagen absendest.
            </p>
            <p className="text-wx-tx2 leading-relaxed">
              Du musst für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser
              Wertverlust auf einen zur Prüfung der Beschaffenheit, Eigenschaften und
              Funktionsweise der Waren nicht notwendigen Umgang mit ihnen zurückzuführen ist.
            </p>
          </section>

          <section
            className="mb-8 rounded-xl p-5"
            style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}
          >
            <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Muster-Widerrufsformular</h2>
            <p className="text-sm text-wx-tx2 leading-relaxed mb-3">
              (Wenn du den Vertrag widerrufen willst, dann fülle bitte dieses Formular aus und sende es
              zurück — oder nutze stattdessen die{' '}
              <Link to="/widerruf" className="text-[var(--accent)] hover:underline">
                Widerrufs-Seite
              </Link>
              .)
            </p>
            <p className="text-sm text-wx-tx2 leading-relaxed mb-1">
              An: Luca Teichmann, Waxcelerate, Florentinerstraße 17, 70619 Stuttgart,
              E-Mail: waxcelerate@gmail.com
            </p>
            <p className="text-sm text-wx-tx2 leading-relaxed mb-1">
              Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den
              Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)
            </p>
            <p className="text-sm text-wx-tx2 leading-relaxed mb-1">Bestellt am (*)/erhalten am (*)</p>
            <p className="text-sm text-wx-tx2 leading-relaxed mb-1">Name des/der Verbraucher(s)</p>
            <p className="text-sm text-wx-tx2 leading-relaxed mb-1">Anschrift des/der Verbraucher(s)</p>
            <p className="text-sm text-wx-tx2 leading-relaxed mb-1">
              Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)
            </p>
            <p className="text-sm text-wx-tx2 leading-relaxed mb-3">Datum</p>
            <p className="text-xs text-wx-txf">(*) Unzutreffendes streichen.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Widerruf über die Website</h2>
            <p className="text-wx-tx2 leading-relaxed">
              Zusätzlich zu den oben genannten Wegen kannst du den Vertrag auch direkt über die{' '}
              <Link to="/widerruf" className="text-[var(--accent)] hover:underline">
                Widerrufs-Seite
              </Link>{' '}
              widerrufen — die elektronische Widerrufsfunktion nach § 356a BGB. Dort reichen
              Bestellnummer, Bestelldatum, Produkt und eine E-Mail-Adresse für die
              Eingangsbestätigung; ein Grund wird nicht abgefragt.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
