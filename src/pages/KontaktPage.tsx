// ─── /kontakt — eigene, indexierbare Kontaktseite ──────────────────────────
//
// Vorher nur Startseiten-Anker #kontakt. Kontaktangaben sind ein Kernfakt,
// den Suchmaschinen und KI-Systeme eindeutig erfassen können sollen — als
// eigene URL mit ContactPage-Schema, nicht als Fragment.
//
// Kanäle und Antwortzeit wortgleich mit src/sections/contact.tsx.

import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { BackLink } from '@/components/BackLink';
import { removeStaticJsonLd, removeStaticHeadMeta } from '@/lib/utils';

const BASE = 'https://waxcelerate.de';
const CANONICAL = `${BASE}/kontakt`;
const W = 'mx-auto w-full max-w-3xl px-6 sm:px-10';

const WA_URL = 'https://wa.me/4915751957470';
const MAIL = 'waxcelerate@gmail.com';

export function KontaktPage() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const p = t.pages.contact;

  useEffect(() => { removeStaticJsonLd(); removeStaticHeadMeta(); }, []);

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        name: p.metaTitle,
        description: p.metaDescription,
        url: CANONICAL,
        inLanguage: de ? 'de-DE' : 'en',
        mainEntity: {
          '@id': `${BASE}/#organization`,
          '@type': 'Organization',
          name: 'Waxcelerate',
          email: MAIL,
          url: BASE,
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: MAIL,
            availableLanguage: ['German', 'English'],
            areaServed: 'DE',
          },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: de ? 'Startseite' : 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: p.h1, item: CANONICAL },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-wx-bg">
      <Helmet>
        <title>{p.metaTitle}</title>
        <meta name="description" content={p.metaDescription} />
        <link rel="canonical" href={CANONICAL} />
        <script type="application/ld+json">{JSON.stringify(graph)}</script>
      </Helmet>

      <Navigation />

      <main id="main-content" className="pt-24 sm:pt-28 pb-16">
        <div className={W}>
          <BackLink de={de} className="mb-6" />
          <h1 className="font-display font-bold text-wx-tx1 leading-tight"
            style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', letterSpacing: '-0.02em' }}>
            {p.h1}
          </h1>
          <p className="mt-4 text-[16px] leading-[1.7] text-wx-tx2">{p.lead}</p>

          <div className="mt-10 space-y-4">
            <a href={`mailto:${MAIL}?subject=${encodeURIComponent(de ? '[Waxcelerate] Anfrage' : '[Waxcelerate] Inquiry')}`}
              className="flex items-center gap-4 rounded-2xl p-5 transition-all hover:shadow-md"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad)', textDecoration: 'none' }}>
              <span className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--accent-wash)', border: '1px solid rgba(var(--accent-rgb),0.22)' }}>
                <Mail className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-wx-tx1 text-[15px]">{de ? 'Per E-Mail' : 'By email'}</span>
                <span className="block text-[13px] mt-0.5 text-wx-tx2">{MAIL} · {de ? 'Antwort am selben Tag' : 'same-day reply'}</span>
              </span>
            </a>

            <a href={`${WA_URL}?text=${encodeURIComponent(de ? 'Hallo Luca, ich habe eine Frage zu Waxcelerate: ' : 'Hi Luca, I have a question about Waxcelerate: ')}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl p-5 transition-all hover:shadow-md"
              style={{ background: 'var(--card-bg)', border: '1px solid rgba(var(--ext-whatsapp-rgb),0.45)', boxShadow: 'var(--card-shad)', textDecoration: 'none' }}>
              <span className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(var(--ext-whatsapp-rgb),0.10)', border: '1px solid rgba(var(--ext-whatsapp-rgb),0.20)' }}>
                <MessageCircle className="h-5 w-5" style={{ color: 'var(--ext-whatsapp)' }} />
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-wx-tx1 text-[15px]">{de ? 'Per WhatsApp' : 'By WhatsApp'}</span>
                <span className="block text-[13px] mt-0.5 text-wx-tx2">{de ? 'Für kurze Fragen — meist sofort' : 'For quick questions — usually instant'}</span>
              </span>
            </a>
          </div>

          <p className="mt-8 text-[14px] leading-[1.7] text-wx-tx2">
            {de
              ? 'Waxcelerate wird von Luca Teichmann in Stuttgart betrieben. Versand erfolgt deutschlandweit per DHL; Bestellungen vor 14 Uhr gehen in der Regel am selben Werktag raus. Die vollständige Anbieterkennzeichnung steht im '
              : 'Waxcelerate is run by Luca Teichmann in Stuttgart. Orders ship across Germany via DHL; orders before 2 p.m. usually go out the same business day. Full provider details are in the '}
            <Link to="/impressum" className="underline underline-offset-2 hover:opacity-80" style={{ color: 'var(--accent)' }}>{de ? 'Impressum' : 'legal notice'}</Link>.
          </p>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
            <Link to="/faq" className="font-medium" style={{ color: 'var(--accent)' }}>{de ? 'Häufige Fragen →' : 'FAQ →'}</Link>
            <Link to="/versand-und-zahlung" className="font-medium" style={{ color: 'var(--accent)' }}>{de ? 'Versand & Zahlung →' : 'Shipping & payment →'}</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
