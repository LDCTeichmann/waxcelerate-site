// ─── /partner: B2B-Partnerseite (Ziel des QR-Codes im Partner-Infoblatt) ─────
// Konzept, Sichtbarkeitsregeln und Betrieb: docs/plaene/PARTNER_SEITE.md.
// Indexierbar, aber nur ueber einen kleinen Footer-Link erreichbar (nicht in
// Topbar/Menue/Startseite). Oeffentliche Zahlen wie im Infoblatt; Staffelpreise
// und Konditionen stehen ausschliesslich im Partnerbereich (/partner/konditionen).
//
// Optik wie der Rest der Website (docs/DESIGN.md §3): Theme-Tokens statt fester
// Farben, Haarlinien statt gefuellter Kacheln, Foto nur im Einstieg (mit Scrim),
// grosse Serifzahlen sparsam. Dunkel sind nur der Einstieg und das Abschlussband
// (wie das gedruckte Infoblatt, dort traegt Gold die Geldzahlen).

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, MessageCircle, Phone } from 'lucide-react';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { GiftCardObject } from '@/components/GiftCardObject';
import { removeStaticJsonLd, removeStaticHeadMeta } from '@/lib/utils';
import { trackPartnerView, trackPartnerCta } from '@/lib/analytics';
import { shopFromSlug } from '@/pages/partner/shops';
import { PartnerRequestForm } from '@/pages/partner/PartnerRequestForm';
import {
  BASE, PARTNER_PATH, PARTNER_AREA_PATH, PARTNER_TITLE, PARTNER_DESCRIPTION, PARTNER_H1, PARTNER_LEAD,
  PHONE_DISPLAY, PHONE_HREF, whatsappLink, TRUST_LINE, GAP, WAYS, WAYS_NOTE, CYCLE, CYCLE_NOTE, EXAMPLE,
  exampleResult, EXAMPLE_NOTE, EFFORT, PROOF, RANGE_NOTE, WAX_NOTE, CHAINS_NOTE, CARDS, partnerWax,
  partnerChains, TRIAL, STEPS, FAQ, EXCLUSIVITY, LEGAL_LINE,
} from '@/pages/partner/content';

const GOLD = '#B9A67E';
const SERIF = "'Fraunces', Georgia, serif";

// Dunkle Baender setzen die Theme-Variablen lokal, damit .eyebrow, .section-title
// und die Buttons ohne Sonderfall nutzbar bleiben.
const DARK_VARS = {
  '--pg': '#0A0A0A', '--sf': '#111113', '--sf2': '#1C1C1F',
  '--tx1': '#FAFAFA', '--tx2': '#A1A1A1', '--txm': '#8C8C8C', '--txf': '#8C8C8C', '--txff': '#858585',
  '--bd': 'rgba(255,255,255,0.14)', '--accent': GOLD, '--danger': '#F87171',
  '--cta-bg': '#FAFAFA', '--cta-fg': '#0A0A0A', '--cta-hover': '#E4E4E7',
} as CSSProperties;

const eur = (n: number) => `${n.toFixed(2).replace('.', ',')} €`;
const hours = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 1 });

function Band({ id, alt, children }: { id?: string; alt?: boolean; children: ReactNode }) {
  return (
    <section
      id={id}
      style={{ background: alt ? 'var(--sf)' : 'var(--pg)', borderTop: '1px solid var(--bd)' }}
      className="py-16 sm:py-24"
    >
      <div className="wx-frame">{children}</div>
    </section>
  );
}

/** Grosse Serifzahl, nur fuer die wenigen Kernzahlen der Seite. */
function BigNumber({ children, color = 'var(--tx1)', className = '' }: { children: ReactNode; color?: string; className?: string }) {
  return (
    <span className={`num block leading-none ${className}`} style={{ fontFamily: SERIF, fontWeight: 700, color }}>
      {children}
    </span>
  );
}

/** Preis in Libre Franklin (.num), wie auf Regal und Produktseiten. */
function Price({ children }: { children: ReactNode }) {
  return <span className="num text-[17px] font-semibold" style={{ color: 'var(--tx1)' }}>{children}</span>;
}

export function PartnerPage() {
  const [params] = useSearchParams();
  const slug = params.get('s');
  const source = params.get('q') ?? '';
  const shop = shopFromSlug(slug);
  const wa = whatsappLink(shop);

  useEffect(() => { removeStaticJsonLd(); removeStaticHeadMeta(); }, []);
  useEffect(() => { trackPartnerView(source); }, [source]);

  // Feste Kontaktleiste (nur Handy) erst nach dem Hero und nicht im Abschlussband,
  // sonst stehen dort zwei gleiche WhatsApp-Buttons uebereinander.
  const [showBar, setShowBar] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const closing = document.getElementById('anfrage')?.getBoundingClientRect().top ?? Infinity;
      setShowBar(window.scrollY > window.innerHeight * 0.7 && closing > window.innerHeight * 0.5);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const canonical = `${BASE}${PARTNER_PATH}`;
  const wax = partnerWax();
  const chains = partnerChains();
  // Gleiches Schema wie im Vorrender (scripts/generate-blog-html.mjs, breadcrumb()).
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Startseite', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Für den Fachhandel', item: canonical },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{PARTNER_TITLE}</title>
        <meta name="description" content={PARTNER_DESCRIPTION} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={PARTNER_TITLE} />
        <meta property="og:description" content={PARTNER_DESCRIPTION} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Waxcelerate" />
        <meta property="og:locale" content="de_DE" />
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      </Helmet>

      <div className="min-h-screen" style={{ background: 'var(--pg)' }}>
        <Navigation />

        <main id="main-content">
          {/* ── 1 · Einstieg: Foto mit Scrim ─────────────────────────── */}
          <section style={{ ...DARK_VARS, background: '#0A0A0A', color: 'var(--tx1)' }} className="relative isolate overflow-hidden">
            <img
              src="/images/rewax/hero.webp"
              alt="Gewachste Kette vor einem Waxcelerate-Karton auf einer Schiefermauer über Stuttgart"
              width={1200}
              height={800}
              fetchPriority="high"
              className="absolute inset-0 -z-20 h-full w-full object-cover object-[68%_50%]"
            />
            {/* Handy: Text liegt ueber dem ganzen Motiv, deshalb kraeftiger Scrim von unten. */}
            <div
              aria-hidden
              className="absolute inset-0 -z-10 md:hidden"
              style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.84) 52%, rgba(10,10,10,0.55) 100%)' }}
            />
            {/* Desktop: Foto rechts frei, Scrim von unten und von links. */}
            <div
              aria-hidden
              className="absolute inset-0 -z-10 hidden md:block"
              style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.35) 45%, rgba(10,10,10,0.15) 100%), linear-gradient(90deg, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.5) 48%, rgba(10,10,10,0) 78%)' }}
            />
            <div className="wx-frame flex min-h-[min(92svh,760px)] flex-col justify-end pb-14 pt-40 sm:pb-20 sm:pt-48">
              <p className="eyebrow mb-5" style={{ color: '#C4C4C8' }}>{shop ? `Für ${shop.name}` : 'Partner-Infoblatt Fachhandel'}</p>
              <h1
                className="section-title max-w-[16ch]"
                style={{ color: '#FAFAFA', WebkitTextFillColor: '#FAFAFA', fontSize: 'clamp(2.6rem, 8vw, 4.75rem)' }}
              >
                {PARTNER_H1}
              </h1>
              <p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed" style={{ color: '#D4D4D8' }}>{PARTNER_LEAD}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href={wa} target="_blank" rel="noopener noreferrer" onClick={() => trackPartnerCta('whatsapp')} className="btn-primary px-6 py-3.5 text-[15px]">
                  <MessageCircle className="h-4 w-4" aria-hidden /> Per WhatsApp schreiben
                </a>
                <a href="#anfrage" className="btn-ghost px-6 py-3.5 text-[15px]">
                  Testpaket anfragen <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
              <p className="mt-8 text-[13px]" style={{ color: 'var(--txf)' }}>{TRUST_LINE}</p>
            </div>
          </section>

          {/* ── 2 · Die Luecke ───────────────────────────────────────── */}
          <Band id="luecke">
            <p className="eyebrow mb-4">Die Lücke</p>
            <h2 className="section-title max-w-[22ch]">{GAP.question}</h2>
            <div className="mt-12 grid gap-10 sm:grid-cols-2">
              {GAP.items.map((it) => (
                <div key={it.label} className="border-t pt-5" style={{ borderColor: 'var(--bd)' }}>
                  <p className="eyebrow mb-3">{it.label}</p>
                  <BigNumber className="text-[clamp(3rem,9vw,4.5rem)]">{it.value}</BigNumber>
                  <p className="mt-3 text-[15px]" style={{ color: 'var(--tx2)' }}>{it.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 max-w-[70ch] text-[13px] leading-relaxed" style={{ color: 'var(--txf)' }}>{GAP.source}</p>
            <div className="mt-14 border-t pt-8" style={{ borderColor: 'var(--bd)' }}>
              <p className="text-[clamp(1.5rem,4vw,2.25rem)] leading-tight" style={{ fontFamily: SERIF, fontWeight: 700 }}>{GAP.frequency}</p>
              <p className="mt-3 max-w-[60ch] text-[15px]" style={{ color: 'var(--tx2)' }}>{GAP.frequencyNote}</p>
            </div>
          </Band>

          {/* ── 3 · Drei Wege, Kreislauf, Rechenbeispiel ─────────────── */}
          <Band id="wege" alt>
            <p className="eyebrow mb-4">So verdienen Sie</p>
            <h2 className="section-title">Drei Wege. Stapelbar.</h2>
            <div className="mt-12 grid gap-10 md:grid-cols-3">
              {WAYS.map((w) => (
                <div key={w.no} className="border-t pt-5" style={{ borderColor: 'var(--bd)' }}>
                  <p className="eyebrow mb-3">{w.no} · {w.name}</p>
                  <p className="text-[clamp(1.5rem,3.4vw,1.9rem)] leading-tight" style={{ fontFamily: SERIF, fontWeight: 700 }}>{w.figure}</p>
                  <p className="mt-3 text-[15px] leading-relaxed" style={{ color: 'var(--tx2)' }}>{w.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-[15px]" style={{ color: 'var(--tx1)' }}>{WAYS_NOTE}</p>

            <div className="mt-20">
              <p className="eyebrow mb-4">Der Kreislauf</p>
              <ol className="grid gap-10 md:grid-cols-3">
                {CYCLE.map((c, i) => (
                  <li key={c.who} className="border-t pt-5" style={{ borderColor: 'var(--bd)' }}>
                    <p className="eyebrow mb-3">{String(i + 1).padStart(2, '0')} · {c.who}</p>
                    <p className="text-[15px] leading-relaxed" style={{ color: 'var(--tx2)' }}>{c.text}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-8 max-w-[64ch] text-[15px] leading-relaxed" style={{ color: 'var(--tx2)' }}>{CYCLE_NOTE}</p>
            </div>

            <div className="mt-20">
              <p className="eyebrow mb-4">Was der Kreislauf je Werkstattstunde bringt</p>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
                <div>
                  <dt className="eyebrow mb-2">Tausche im Jahr</dt>
                  <dd><span className="num text-[32px] font-semibold leading-none">{exampleResult.swaps}</span><p className="mt-1.5 text-[13px]" style={{ color: 'var(--txf)' }}>{EXAMPLE.customers} Rotationskunden, je {EXAMPLE.swapsPerYear} Tausche</p></dd>
                </div>
                <div>
                  <dt className="eyebrow mb-2">Werkstattzeit</dt>
                  <dd><span className="num text-[32px] font-semibold leading-none">{hours(exampleResult.hours)} h</span><p className="mt-1.5 text-[13px]" style={{ color: 'var(--txf)' }}>{exampleResult.swaps} × {EXAMPLE.minutesPerSwap} Minuten</p></dd>
                </div>
                <div>
                  <dt className="eyebrow mb-2">Rohertrag</dt>
                  <dd><BigNumber className="text-[44px]">{Math.round(exampleResult.revenue)} €</BigNumber><p className="mt-1.5 text-[13px]" style={{ color: 'var(--txf)' }}>bei {eur(EXAMPLE.feeEur)} Tauschgebühr</p></dd>
                </div>
                <div>
                  <dt className="eyebrow mb-2">Je Werkstattstunde</dt>
                  <dd><span className="num text-[32px] font-semibold leading-none">rund {Math.round(exampleResult.perHour)} €</span><p className="mt-1.5 text-[13px]" style={{ color: 'var(--txf)' }}>ohne Wachs, Ketten und Karten</p></dd>
                </div>
              </dl>
              <p className="mt-6 max-w-[70ch] text-[13px] leading-relaxed" style={{ color: 'var(--txf)' }}>{EXAMPLE_NOTE}</p>
            </div>
          </Band>

          {/* ── 4 · Aufwand und Beleg ────────────────────────────────── */}
          <Band id="beleg">
            <p className="eyebrow mb-4">Der Aufwand</p>
            <h2 className="section-title">{EFFORT.title}</h2>
            <p className="mt-5 max-w-[58ch] text-[16px] leading-relaxed" style={{ color: 'var(--tx2)' }}>{EFFORT.lead}</p>
            <div className="mt-12 grid gap-10 md:grid-cols-2">
              {[EFFORT.before, EFFORT.after].map((b) => (
                <div key={b.label} className="border-t pt-5" style={{ borderColor: 'var(--bd)' }}>
                  <p className="eyebrow mb-3">{b.label}</p>
                  <span className="num block text-[clamp(2.25rem,6vw,3rem)] font-semibold leading-none">{b.value}</span>
                  <p className="mt-3 text-[15px] leading-relaxed" style={{ color: 'var(--tx2)' }}>{b.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 max-w-[70ch] text-[13px] leading-relaxed" style={{ color: 'var(--txf)' }}>{EFFORT.note}</p>

            <div className="mt-20 grid gap-12 md:grid-cols-[1.4fr_1fr]">
              <div>
                <p className="eyebrow mb-3">Der Beleg</p>
                <h3 className="text-[clamp(1.5rem,3.5vw,2rem)] leading-tight" style={{ fontFamily: SERIF, fontWeight: 700 }}>{PROOF.title}</h3>
                <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed" style={{ color: 'var(--tx2)' }}>{PROOF.text}</p>
              </div>
              <div className="space-y-8">
                {[PROOF.keep, PROOF.take].map((b) => (
                  <div key={b.title} className="border-t pt-4" style={{ borderColor: 'var(--bd)' }}>
                    <p className="eyebrow mb-2">{b.title}</p>
                    <p className="text-[15px] leading-relaxed" style={{ color: 'var(--tx2)' }}>{b.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Band>

          {/* ── 5 · Sortiment ────────────────────────────────────────── */}
          <Band id="sortiment" alt>
            <p className="eyebrow mb-4">Sortiment</p>
            <h2 className="section-title">Ihr Angebot.</h2>
            <p className="mt-4 max-w-[58ch] text-[15px]" style={{ color: 'var(--tx2)' }}>{RANGE_NOTE}</p>

            <div className="mt-12 grid gap-14 lg:grid-cols-2">
              <div>
                <p className="eyebrow mb-4">Kettenwachs</p>
                <ul>
                  {wax.map((p) => (
                    <li key={p.id} className="flex items-baseline justify-between gap-4 border-t py-3.5" style={{ borderColor: 'var(--bd)' }}>
                      <span className="text-[15px]">
                        {p.variant === 'pro' ? 'MoS₂ Pro Edition' : 'Classic Edition'}
                        <span className="ml-2 text-[13px]" style={{ color: 'var(--txf)' }}>{(p.weight ?? '').replace(/(\d)g$/, '$1 g')}</span>
                      </span>
                      <Price>{eur(p.price)}</Price>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[13px] leading-relaxed" style={{ color: 'var(--txf)' }}>{WAX_NOTE}</p>
              </div>

              <div>
                <p className="eyebrow mb-4">Vorgewachste Ketten</p>
                <ul>
                  {chains.map((p) => (
                    <li key={p.id} className="flex items-baseline justify-between gap-4 border-t py-3" style={{ borderColor: 'var(--bd)' }}>
                      <span className="text-[15px]">
                        {[p.chainBrand, p.chainModel].filter(Boolean).join(' ')}
                        <span className="ml-2 text-[13px]" style={{ color: 'var(--txf)' }}>{p.chainSpeed}</span>
                      </span>
                      <Price>{eur(p.price)}</Price>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[13px] leading-relaxed" style={{ color: 'var(--txf)' }}>{CHAINS_NOTE}</p>
              </div>
            </div>

            <div className="mt-16 grid items-center gap-10 border-t pt-10 md:grid-cols-[1fr_auto]" style={{ borderColor: 'var(--bd)' }}>
              <div>
                <p className="eyebrow mb-3">{CARDS.title}</p>
                <p className="max-w-[56ch] text-[15px] leading-relaxed" style={{ color: 'var(--tx2)' }}>{CARDS.lead}</p>
                <p className="mt-4 text-[15px]">{CARDS.sizes.join(' und ')}</p>
                <p className="mt-4 max-w-[60ch] text-[13px] leading-relaxed" style={{ color: 'var(--txf)' }}>{CARDS.note}</p>
              </div>
              <div className="mx-auto w-[min(100%,340px)] md:mx-0">
                <GiftCardObject count={3} de animate={false} />
              </div>
            </div>
          </Band>

          {/* ── 6 · Fragen ───────────────────────────────────────────── */}
          <Band id="fragen">
            <p className="eyebrow mb-4">Fragen von Inhabern</p>
            <h2 className="section-title">Kurz beantwortet.</h2>
            <div className="mt-10 max-w-[760px] border-t" style={{ borderColor: 'var(--bd)' }}>
              {FAQ.map((f) => (
                <details key={f.q} className="group border-b py-5" style={{ borderColor: 'var(--bd)' }}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-medium">
                    {f.q}
                    <span aria-hidden className="text-xl transition-transform motion-reduce:transition-none group-open:rotate-45" style={{ color: 'var(--txf)' }}>+</span>
                  </summary>
                  <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed" style={{ color: 'var(--tx2)' }}>{f.a}</p>
                </details>
              ))}
            </div>
          </Band>

          {/* ── 7 · Abschluss: Testpaket, Start, Kontakt (dunkel) ────── */}
          <section id="anfrage" style={{ ...DARK_VARS, background: '#0A0A0A', color: 'var(--tx1)', borderTop: '1px solid var(--bd)' }} className="py-16 sm:py-24">
            <div className="wx-frame">
              <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr]">
                <div>
                  <p className="eyebrow mb-4">{TRIAL.title}</p>
                  <BigNumber color={GOLD} className="text-[clamp(2.5rem,7vw,3.75rem)]">{TRIAL.badge}</BigNumber>
                  <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed" style={{ color: 'var(--tx2)' }}>{TRIAL.lead}</p>
                  <ul className="mt-6 space-y-2.5">
                    {TRIAL.items.map((t) => (
                      <li key={t} className="flex gap-3 text-[15px]"><span aria-hidden style={{ color: GOLD }}>·</span><span>{t}</span></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="eyebrow mb-4">So starten Sie</p>
                  <ol className="space-y-5">
                    {STEPS.map((s) => (
                      <li key={s.no} className="flex gap-4 border-t pt-4" style={{ borderColor: 'var(--bd)' }}>
                        <span className="num eyebrow pt-0.5">{s.no}</span>
                        <span className="text-[16px]">{s.text}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="mt-20 grid gap-14 border-t pt-16 lg:grid-cols-[1fr_1.1fr]" style={{ borderColor: 'var(--bd)' }}>
                <div>
                  <p className="eyebrow mb-4">Kontakt</p>
                  <h2 className="section-title" style={{ color: '#FAFAFA', WebkitTextFillColor: '#FAFAFA' }}>Wollen wir es probieren?</h2>
                  <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed" style={{ color: 'var(--tx2)' }}>
                    Schreiben Sie kurz oder rufen Sie an. Die Antwort kommt am selben Tag. {EXCLUSIVITY}
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                    <a href={wa} target="_blank" rel="noopener noreferrer" onClick={() => trackPartnerCta('whatsapp')} className="btn-primary px-6 py-3.5 text-[15px]">
                      <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
                    </a>
                    <a href={PHONE_HREF} onClick={() => trackPartnerCta('phone')} className="btn-ghost px-6 py-3.5 text-[15px]">
                      <Phone className="h-4 w-4" aria-hidden /> {PHONE_DISPLAY}
                    </a>
                  </div>
                  <p className="mt-10 text-[14px]" style={{ color: 'var(--txf)' }}>
                    Schon Partner?{' '}
                    <Link to={PARTNER_AREA_PATH} onClick={() => trackPartnerCta('code')} className="underline underline-offset-4" style={{ color: 'var(--tx1)' }}>
                      Konditionen ansehen
                    </Link>
                  </p>
                </div>
                <div>
                  <PartnerRequestForm shop={shop} shopSlug={shop ? slug : null} source={source} />
                </div>
              </div>
              <p className="mt-16 text-[12px]" style={{ color: 'var(--txff)' }}>{LEGAL_LINE}</p>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      {/* Feste Kontaktleiste nur auf dem Handy (der QR wird im Laden am Handy gescannt). */}
      <div
        aria-hidden={!showBar}
        className={`fixed inset-x-0 bottom-0 z-40 border-t px-4 py-2.5 transition-transform duration-300 motion-reduce:transition-none lg:hidden ${showBar ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ ...DARK_VARS, background: 'rgba(10,10,10,0.94)', backdropFilter: 'blur(8px)', paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom))' }}
      >
        <a href={wa} target="_blank" rel="noopener noreferrer" tabIndex={showBar ? 0 : -1} onClick={() => trackPartnerCta('whatsapp')} className="btn-primary w-full py-3 text-[15px]">
          <MessageCircle className="h-4 w-4" aria-hidden /> Partner werden: WhatsApp
        </a>
      </div>
    </>
  );
}
