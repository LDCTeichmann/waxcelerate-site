import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export function ImpressumPage() {
  return (
    <>
    <Helmet>
      <title>Impressum | Waxcelerate</title>
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

        <h1 className="text-3xl font-bold text-wx-tx1 mb-8">Impressum</h1>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Angaben gemäß § 5 TMG</h2>
          <p className="text-wx-tx2 leading-relaxed">
            Luca Teichmann<br />
            Florentinerstraße 17, 70619 Stuttgart<br />
            E-Mail: waxcelerate@gmail.com
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Umsatzsteuer</h2>
          <p className="text-wx-tx2 leading-relaxed">
            Kleingewerbetreibender — keine Umsatzsteuer-Identifikationsnummer vorhanden.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Haftungsausschluss</h2>
          <p className="text-wx-tx2 leading-relaxed">
            Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit,
            Vollständigkeit und Aktualität der Inhalte übernehme ich jedoch keine Gewähr. Als
            Diensteanbieter bin ich gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den
            allgemeinen Gesetzen verantwortlich. Als Diensteanbieter bin ich jedoch nicht verpflichtet,
            übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu
            forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder
            Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
          </p>
        </section>
      </div>
    </div>
    </>
  );
}
