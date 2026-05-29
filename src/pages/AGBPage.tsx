import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export function AGBPage() {
  return (
    <>
    <Helmet>
      <title>AGB | Waxcelerate</title>
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

        <h1 className="text-3xl font-bold text-wx-tx1 mb-8">Allgemeine Geschäftsbedingungen</h1>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Kaufabwicklung über eBay</h2>
          <p className="text-wx-tx2 leading-relaxed">
            Alle Käufe von Waxcelerate-Produkten erfolgen ausschließlich über die eBay-Plattform.
            Für diese Transaktionen gelten die{' '}
            <a
              href="https://www.ebay.de/help/policies/member-behavior-policies/allgemeine-geschaftsbedingungen?id=4076"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1A3C6E] hover:underline inline-flex items-center gap-1"
            >
              Allgemeinen Geschäftsbedingungen von eBay
              <ExternalLink className="h-3 w-3" />
            </a>
            . Mit dem Kauf eines Produkts über eBay erkennen Sie die eBay-AGB an.
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
            versendet. Die Versandbedingungen und -kosten werden im jeweiligen eBay-Listing angegeben.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-wx-tx1 mb-3">Rückgabe & Gewährleistung</h2>
          <p className="text-wx-tx2 leading-relaxed">
            Rückgaben erfolgen gemäß der eBay-Käuferschutzgarantie. Details zu Rückgabefristen und
            -bedingungen entnehmen Sie bitte dem jeweiligen eBay-Listing. Die gesetzlichen
            Gewährleistungsrechte bleiben unberührt.
          </p>
        </section>
      </div>
    </div>
    </>
  );
}
