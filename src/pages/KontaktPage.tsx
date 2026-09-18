// ─── /kontakt — Kontakt mit „Über mich“ ────────────────────────────────────
//
// Seitenordnung Chat 4 (09/2026): "Über mich" (vorher eigene Seite
// /ueber-uns) und die Kontaktwege (vorher /kontakt) leben jetzt auf einer
// Seite: oben die Person hinter Waxcelerate, darunter die Kanäle. Luca hat
// das so vorgegeben (SEITENORDNUNG_PLAN.md, Chat 4). /ueber-uns bleibt als
// 301 auf #ueber-mich erreichbar (App.tsx, vercel.json).
//
// Adressen ausschließlich aus CONTACT (src/lib/data.ts) — keine
// hartkodierten wa.me-/mailto-Strings mehr. Kennzahlen aus trustStats statt
// des früher festverdrahteten "200+".

import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, Instagram, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { BackLink } from '@/components/BackLink';
import { removeStaticJsonLd, removeStaticHeadMeta } from '@/lib/utils';
import { CONTACT, trustStats } from '@/lib/data';

const BASE = 'https://waxcelerate.de';
const CANONICAL = `${BASE}/kontakt`;
const W = 'wx-frame';

export function KontaktPage() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const p = t.pages.contact;
  const [bioExpanded, setBioExpanded] = useState(false);

  useEffect(() => { removeStaticJsonLd(); removeStaticHeadMeta(); }, []);

  const mailHref = `mailto:${CONTACT.email}?subject=${encodeURIComponent(de ? '[Waxcelerate] Anfrage' : '[Waxcelerate] Inquiry')}`;
  const waHref = `${CONTACT.whatsapp}?text=${encodeURIComponent(de ? 'Hallo Luca, ich habe eine Frage zu Waxcelerate: ' : 'Hi Luca, I have a question about Waxcelerate: ')}`;

  const stats: { value: string; label: string }[] = [
    { value: de ? '1 Tag' : '1 day', label: de ? 'Versand nach Bestellung' : 'Ships after order' },
    { value: '2024', label: de ? 'In Stuttgart gegründet' : 'Founded in Stuttgart' },
    { value: trustStats.reviews, label: de ? 'eBay Top-Bewertungen' : 'eBay top reviews' },
  ];

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
          email: CONTACT.email,
          url: BASE,
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: CONTACT.email,
            availableLanguage: ['German', 'English'],
            areaServed: 'DE',
          },
        },
      },
      {
        '@type': 'AboutPage',
        name: p.metaTitle,
        description: p.metaDescription,
        url: `${CANONICAL}#ueber-mich`,
        inLanguage: de ? 'de-DE' : 'en',
        primaryImageOfPage: `${BASE}/images/people/luca-stage.jpg`,
        about: { '@id': `${BASE}/#organization` },
        // Verweist auf den Person-Knoten aus index.html (@id dort gesetzt),
        // statt ihn hier unvollstaendig zu duplizieren.
        mainEntity: { '@id': `${BASE}/#person-luca` },
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
          <p className="mt-4 text-[16px] leading-[1.7] text-wx-tx2 max-w-2xl">{p.lead}</p>

          {/* ── Über mich ──────────────────────────────────────────────── */}
          <section id="ueber-mich" className="mt-12 scroll-mt-28">
            <p className="eyebrow mb-3" style={{ color: 'var(--txf)' }}>
              {de ? 'Gründer & Expertise' : 'Founder & Expertise'}
            </p>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              <div className="space-y-4 order-2 lg:order-1">
                <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio1}</p>
                <div className={`${bioExpanded ? 'block' : 'hidden'} sm:block space-y-4`}>
                  <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio2}</p>
                </div>
                <button
                  onClick={() => setBioExpanded(v => !v)}
                  className="sm:hidden text-[13px] font-medium py-1"
                  style={{ color: 'var(--accent-soft)' }}
                >
                  {bioExpanded ? (de ? '← Weniger' : '← Less') : (de ? 'Mehr lesen →' : 'Read more →')}
                </button>
                <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio3}</p>
                <p className="text-[15px] leading-[1.8] text-wx-tx2">{t.about.bio4}</p>
                <a
                  href={CONTACT.ebay}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold pt-1"
                  style={{ color: 'var(--accent-soft)' }}
                >
                  {t.about.ebay} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="order-1 lg:order-2">
                <figure className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--bd)', boxShadow: '0 12px 48px rgba(0,0,0,0.18)' }}>
                  <picture>
                    <source srcSet="/images/people/luca-stage.avif" type="image/avif" />
                    <source srcSet="/images/people/luca-stage.webp" type="image/webp" />
                    <img src="/images/people/luca-stage.jpg" loading="lazy" decoding="async"
                      alt="eBay Seller Leadership Week 2025, San Jose"
                      className="w-full h-[260px] sm:h-[340px] object-cover" style={{ objectPosition: '60% 38%' }} />
                  </picture>
                </figure>
                <dl className="mt-0 grid grid-cols-3 gap-px rounded-b-2xl overflow-hidden"
                  style={{ border: '1px solid var(--bd)', borderTop: 'none', background: 'var(--bd2)' }}>
                  {stats.map((s) => (
                    <div key={s.label} className="p-4 text-center" style={{ background: 'var(--sf2)' }}>
                      <dt className="font-display font-bold text-wx-tx1 tabular-nums" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)' }}>{s.value}</dt>
                      <dd className="text-meta mt-1" style={{ color: 'var(--tx2)' }}>{s.label}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>

          {/* ── Schreiben ──────────────────────────────────────────────── */}
          <section id="schreiben" className="mt-14 scroll-mt-28">
            <p className="eyebrow mb-3" style={{ color: 'var(--txf)' }}>{de ? 'Kontakt' : 'Contact'}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <a href={mailHref}
                className="flex items-center gap-4 rounded-2xl p-5 transition-all hover:shadow-md"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad)', textDecoration: 'none' }}>
                <span className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--accent-wash)', border: '1px solid rgba(var(--accent-rgb),0.22)' }}>
                  <Mail className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-wx-tx1 text-[15px]">{de ? 'Per E-Mail' : 'By email'}</span>
                  <span className="block text-[13px] mt-0.5 text-wx-tx2">{CONTACT.email} · {de ? 'Antwort am selben Tag' : 'same-day reply'}</span>
                </span>
              </a>

              <a href={waHref} target="_blank" rel="noopener noreferrer"
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

            <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-[13px] font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--txm)' }}>
              <Instagram className="h-4 w-4" aria-hidden />
              Instagram
            </a>

            <p className="mt-8 text-[14px] leading-[1.7] text-wx-tx2">
              {de
                ? 'Waxcelerate wird von Luca Teichmann in Stuttgart betrieben. Versand erfolgt deutschlandweit per DHL; Bestellungen bis 15 Uhr gehen in der Regel am selben Werktag raus. Die vollständige Anbieterkennzeichnung steht im '
                : 'Waxcelerate is run by Luca Teichmann in Stuttgart. Orders ship across Germany via DHL; orders placed by 3 p.m. usually go out the same business day. Full provider details are in the '}
              <Link to="/impressum" className="underline underline-offset-2 hover:opacity-80" style={{ color: 'var(--accent)' }}>{de ? 'Impressum' : 'legal notice'}</Link>.
            </p>

            <p className="mt-4 text-[14px]">
              <Link to="/blog#fragen" className="font-medium" style={{ color: 'var(--accent)' }}>
                {de ? 'Häufige Fragen? → Blog & FAQ' : 'Frequently asked questions? → Blog & FAQ'}
              </Link>
            </p>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
              <Link to="/versand-und-zahlung" className="font-medium" style={{ color: 'var(--accent)' }}>{de ? 'Versand & Zahlung →' : 'Shipping & payment →'}</Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
