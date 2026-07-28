import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export function DatenschutzPage() {
  return (
    <>
    <Helmet>
      <title>Datenschutzerklärung | Waxcelerate</title>
      <meta name="robots" content="noindex" />
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

        <h1 className="text-3xl font-bold text-wx-tx1 mb-8">Datenschutzerklärung</h1>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Verantwortlicher</h2>
          <p className="text-wx-tx2 leading-relaxed">
            Luca Teichmann<br />
            Florentinerstraße 17, 70619 Stuttgart<br />
            E-Mail: waxcelerate@gmail.com
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Erhobene Daten</h2>
          <p className="text-wx-tx2 leading-relaxed">
            Das Kontaktformular öffnet lediglich den E-Mail-Client des Nutzers (mailto-Link) — es
            findet keine serverseitige Speicherung von Daten statt. Das Widerrufsformular unter{' '}
            <Link to="/widerruf" className="text-[var(--accent)] hover:underline">/widerruf</Link>{' '}
            sendet Bestellnummer, Bestelldatum, Produkt und die angegebene E-Mail-Adresse serverseitig
            per E-Mail an uns, um den Widerruf zu bearbeiten und dir eine Eingangsbestätigung zu
            schicken (Art. 6 Abs. 1 lit. b DSGVO — Vertragsabwicklung). Darüber hinaus werden beim
            Besuch der Website keine personenbezogenen Daten aktiv erfasst oder gespeichert.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Zahlungsabwicklung (Stripe)</h2>
          <p className="text-wx-tx2 leading-relaxed">
            Bestellungen über den eigenen Shop werden über Stripe Payments Europe, Limited (Irland)
            abgewickelt. Dabei übermitteln wir die für die Zahlung und den Versand nötigen Daten
            (Name, Adresse, E-Mail, Zahlungsdaten) an Stripe. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b
            DSGVO (Vertragserfüllung). Stripe kann Daten zur Betrugsprävention auch in die USA
            übermitteln, abgesichert über die EU-Standardvertragsklauseln gemäß Art. 46 Abs. 2 lit. c
            DSGVO. Details in der{' '}
            <a
              href="https://stripe.com/de/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              Datenschutzerklärung von Stripe
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Hosting</h2>
          <p className="text-wx-tx2 leading-relaxed">
            Diese Website wird über Vercel Inc. (USA) gehostet. Vercel kann beim Abruf der Website
            technische Verbindungsdaten (z. B. IP-Adresse, Zeitstempel) in Server-Logs speichern.
            Die Datenübertragung in die USA erfolgt auf Grundlage der EU-Standardvertragsklauseln
            gemäß Art. 46 Abs. 2 lit. c DSGVO. Weitere Informationen finden Sie in der
            Datenschutzerklärung von Vercel: https://vercel.com/legal/privacy-policy
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Ihre Rechte</h2>
          <p className="text-wx-tx2 leading-relaxed">
            Gemäß Art. 15–21 DSGVO haben Sie folgende Rechte hinsichtlich Ihrer personenbezogenen Daten:
          </p>
          <ul className="mt-3 space-y-1.5 text-wx-tx2">
            <li>Art. 15 DSGVO — Recht auf Auskunft</li>
            <li>Art. 16 DSGVO — Recht auf Berichtigung</li>
            <li>Art. 17 DSGVO — Recht auf Löschung</li>
            <li>Art. 18 DSGVO — Recht auf Einschränkung der Verarbeitung</li>
            <li>Art. 20 DSGVO — Recht auf Datenübertragbarkeit</li>
            <li>Art. 21 DSGVO — Widerspruchsrecht</li>
          </ul>
          <p className="text-wx-tx2 leading-relaxed mt-3">
            Zur Ausübung Ihrer Rechte wenden Sie sich bitte per E-Mail an: waxcelerate@gmail.com
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Cookies</h2>
          <p className="text-wx-tx2 leading-relaxed">
            Diese Website verwendet keine Tracking-Cookies oder Analyse-Tools. Es werden ausschließlich
            technisch notwendige Funktionen eingesetzt, die für den Betrieb der Website erforderlich sind.
          </p>
        </section>
      </div>
    </div>
    </>
  );
}
