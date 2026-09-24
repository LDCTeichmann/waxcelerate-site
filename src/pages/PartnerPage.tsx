// ─── /partner: B2B-Partnerseite (Ziel des QR-Codes im Partner-Infoblatt) ─────
// Konzept und Sichtbarkeitsregeln: siehe docs/plaene/PARTNER_SEITE.md.
// Indexierbar, aber nur ueber einen kleinen Footer-Link erreichbar (nicht in
// Topbar/Menue/Startseite). Oeffentliche Zahlen wie im Infoblatt; Staffelpreise
// und Konditionen stehen ausschliesslich im Partnerbereich (/partner/konditionen).

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, MessageCircle, Phone } from 'lucide-react';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
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

// Jedes Band setzt die Theme-Variablen selbst auf dunkel. So bleiben .eyebrow,
// .section-title und die Buttons ohne Sonderfall nutzbar, und die Seite sieht
// im hellen wie im dunklen Site-Theme gleich aus (wie das gedruckte Infoblatt).
const DARK_VARS = {
  '--pg': '#0A0A0A', '--sf': '#111113', '--sf2': '#1C1C1F',
  '--tx1': '#FAFAFA', '--tx2': '#A1A1A1', '--txm': '#8C8C8C', '--txf': '#8C8C8C', '--txff': '#858585',
  '--bd': 'rgba(255,255,255,0.14)', '--accent': GOLD,
  '--cta-bg': '#FAFAFA', '--cta-fg': '#0A0A0A', '--cta-hover': '#E4E4E7',
} as CSSProperties;

const eur = (n: number) => `${n.toFixed(2).replace('.', ',')} €`;
const h = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 1 });

function Band({ id, alt, children }: { id?: string; alt?: boolean; children: ReactNode }) {
  return (
    <section
      id={id}
      style={{ ...DARK_VARS, background: alt ? '#101012' : '#0A0A0A', color: 'var(--tx1)', borderTop: '1px solid var(--bd)' }}
      className="py-16 sm:py-24"
    >
      <div className="wx-frame">{children}</div>
    </section>
  );
}

function Title({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="section-title" style={{ color: '#FAFAFA', WebkitTextFillColor: '#FAFAFA' }}>
      {children}
    </h2>
  );
}

function Gold({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`spec-data ${className}`} style={{ color: GOLD, fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700 }}>
      {children}
    </span>
  );
}

export function PartnerPage() {
  const [params] = useSearchParams();
  const slug = params.get('s');
  const source = params.get('q') ?? '';
  const shop = shopFromSlug(slug);
  const wa = whatsappLink(shop);

  useEffect(() => { removeStaticJsonLd(); removeStaticHeadMeta(); }, []);
  useEffect(() => { trackPartnerView(source); }, [source]);

  // Feste Kontaktleiste (nur Handy) erst nach dem Hero, sonst stehen zwei
  // gleiche WhatsApp-Buttons auf dem ersten Bildschirm.
  const [showBar, setShowBar] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const canonical = `${BASE}${PARTNER_PATH}`;
  const wax = partnerWax();
  const chains = partnerChains();

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
      </Helmet>

      <div className="min-h-screen" style={{ background: '#0A0A0A' }}>
        <Navigation />

        <main id="main-content" className="pt-16">
          {/* ── 1 · Hero ─────────────────────────────────────────────── */}
          <section style={{ ...DARK_VARS, background: '#0A0A0A', color: 'var(--tx1)' }} className="pb-16 pt-14 sm:pb-24 sm:pt-24">
            <div className="wx-frame">
              <p className="eyebrow mb-5">
                {shop ? `Für ${shop.name}` : 'Partner-Infoblatt Fachhandel'}
              </p>
              <h1
                className="section-title max-w-[16ch]"
                style={{ color: '#FAFAFA', WebkitTextFillColor: '#FAFAFA', fontSize: 'clamp(2.6rem, 8vw, 4.75rem)' }}
              >
                {PARTNER_H1}
              </h1>
              <p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed" style={{ color: 'var(--tx2)' }}>{PARTNER_LEAD}</p>
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
          <Band id="luecke" alt>
            <p className="eyebrow mb-4">Die Lücke</p>
            <Title>{GAP.question}</Title>
            <div className="mt-12 grid gap-10 sm:grid-cols-2">
              {GAP.items.map((it) => (
                <div key={it.label} className="border-t pt-5" style={{ borderColor: 'var(--bd)' }}>
                  <p className="eyebrow mb-3">{it.label}</p>
                  <Gold className="block text-[clamp(3rem,9vw,4.5rem)] leading-none">{it.value}</Gold>
                  <p className="mt-3 text-[15px]" style={{ color: 'var(--tx2)' }}>{it.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 max-w-[70ch] text-[13px] leading-relaxed" style={{ color: 'var(--txf)' }}>{GAP.source}</p>
            <div className="mt-14 border-t pt-8" style={{ borderColor: 'var(--bd)' }}>
              <p className="text-[clamp(1.5rem,4vw,2.25rem)] leading-tight" style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700 }}>
                {GAP.frequency}
              </p>
              <p className="mt-3 max-w-[60ch] text-[15px]" style={{ color: 'var(--tx2)' }}>{GAP.frequencyNote}</p>
            </div>
          </Band>

          {/* ── 3 · Drei Wege + Kreislauf ────────────────────────────── */}
          <Band id="wege">
            <p className="eyebrow mb-4">So verdienen Sie</p>
            <Title>Drei Wege. Stapelbar.</Title>
            <div className="mt-12 grid gap-10 md:grid-cols-3">
              {WAYS.map((w) => (
                <div key={w.no} className="border-t pt-5" style={{ borderColor: 'var(--bd)' }}>
                  <p className="eyebrow mb-3">{w.no} · {w.name}</p>
                  <Gold className="block text-[clamp(1.6rem,4vw,2.1rem)] leading-tight">{w.figure}</Gold>
                  <p className="mt-3 text-[15px] leading-relaxed" style={{ color: 'var(--tx2)' }}>{w.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-[15px]" style={{ color: 'var(--tx1)' }}>{WAYS_NOTE}</p>

            <div className="mt-20">
              <p className="eyebrow mb-4">Der Kreislauf</p>
              <ol className="grid gap-6 md:grid-cols-3">
                {CYCLE.map((c, i) => (
                  <li key={c.who} className="relative rounded-xl border p-5" style={{ borderColor: 'var(--bd)', background: '#111113' }}>
                    <p className="eyebrow mb-2">{String(i + 1).padStart(2, '0')} · {c.who}</p>
                    <p className="text-[15px] leading-relaxed" style={{ color: 'var(--tx2)' }}>{c.text}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-6 max-w-[64ch] text-[15px] leading-relaxed" style={{ color: 'var(--tx2)' }}>{CYCLE_NOTE}</p>
            </div>

            <div className="mt-20">
              <p className="eyebrow mb-4">Was der Kreislauf je Werkstattstunde bringt</p>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
                <div><dt className="eyebrow mb-2">Tausche im Jahr</dt><dd><Gold className="text-4xl">{exampleResult.swaps}</Gold><p className="mt-1 text-[13px]" style={{ color: 'var(--txf)' }}>{EXAMPLE.customers} Rotationskunden, je {EXAMPLE.swapsPerYear} Tausche</p></dd></div>
                <div><dt className="eyebrow mb-2">Werkstattzeit</dt><dd><Gold className="text-4xl">{h(exampleResult.hours)} h</Gold><p className="mt-1 text-[13px]" style={{ color: 'var(--txf)' }}>{exampleResult.swaps} × {EXAMPLE.minutesPerSwap} Minuten</p></dd></div>
                <div><dt className="eyebrow mb-2">Rohertrag</dt><dd><Gold className="text-4xl">{Math.round(exampleResult.revenue)} €</Gold><p className="mt-1 text-[13px]" style={{ color: 'var(--txf)' }}>bei {eur(EXAMPLE.feeEur)} Tauschgebühr</p></dd></div>
                <div><dt className="eyebrow mb-2">Je Werkstattstunde</dt><dd><Gold className="text-4xl">rund {Math.round(exampleResult.perHour)} €</Gold><p className="mt-1 text-[13px]" style={{ color: 'var(--txf)' }}>ohne Wachs, Ketten und Karten</p></dd></div>
              </dl>
              <p className="mt-6 max-w-[70ch] text-[13px] leading-relaxed" style={{ color: 'var(--txf)' }}>{EXAMPLE_NOTE}</p>
            </div>
          </Band>

          {/* ── 4 · Aufwand und Beleg ────────────────────────────────── */}
          <Band id="beleg" alt>
            <p className="eyebrow mb-4">Der Aufwand</p>
            <Title>{EFFORT.title}</Title>
            <p className="mt-5 max-w-[58ch] text-[16px] leading-relaxed" style={{ color: 'var(--tx2)' }}>{EFFORT.lead}</p>
            <div className="mt-12 grid gap-10 md:grid-cols-2">
              {[EFFORT.before, EFFORT.after].map((b) => (
                <div key={b.label} className="border-t pt-5" style={{ borderColor: 'var(--bd)' }}>
                  <p className="eyebrow mb-3">{b.label}</p>
                  <Gold className="block text-[clamp(2.75rem,8vw,4rem)] leading-none">{b.value}</Gold>
                  <p className="mt-3 text-[15px] leading-relaxed" style={{ color: 'var(--tx2)' }}>{b.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 max-w-[70ch] text-[13px] leading-relaxed" style={{ color: 'var(--txf)' }}>{EFFORT.note}</p>

            <div className="mt-20 grid gap-12 md:grid-cols-[1.4fr_1fr]">
              <div>
                <p className="eyebrow mb-3">Der Beleg</p>
                <h3 className="text-[clamp(1.5rem,3.5vw,2rem)] leading-tight" style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, color: '#FAFAFA' }}>{PROOF.title}</h3>
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
          <Band id="sortiment">
            <p className="eyebrow mb-4">Sortiment und Testpaket</p>
            <Title>Ihr Angebot.</Title>
            <p className="mt-4 max-w-[58ch] text-[15px]" style={{ color: 'var(--tx2)' }}>{RANGE_NOTE}</p>

            <div className="mt-12 grid gap-14 lg:grid-cols-2">
              <div>
                <p className="eyebrow mb-4">Kettenwachs</p>
                <ul className="divide-y" style={{ borderColor: 'var(--bd)' }}>
                  {wax.map((p) => (
                    <li key={p.id} className="flex items-baseline justify-between gap-4 py-3.5" style={{ borderColor: 'var(--bd)' }}>
                      <span className="text-[15px]">
                        {p.variant === 'pro' ? 'MoS₂ Pro Edition' : 'Classic Edition'}
                        <span className="ml-2 text-[13px]" style={{ color: 'var(--txf)' }}>{(p.weight ?? '').replace(/(\d)g$/, '$1 g')}</span>
                      </span>
                      <Gold className="text-[19px]">{eur(p.price)}</Gold>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[13px] leading-relaxed" style={{ color: 'var(--txf)' }}>{WAX_NOTE}</p>
              </div>

              <div>
                <p className="eyebrow mb-4">Vorgewachste Ketten</p>
                <ul className="divide-y" style={{ borderColor: 'var(--bd)' }}>
                  {chains.map((p) => (
                    <li key={p.id} className="flex items-baseline justify-between gap-4 py-3" style={{ borderColor: 'var(--bd)' }}>
                      <span className="text-[15px]">
                        {[p.chainBrand, p.chainModel].filter(Boolean).join(' ')}
                        <span className="ml-2 text-[13px]" style={{ color: 'var(--txf)' }}>{p.chainSpeed}</span>
                      </span>
                      <Gold className="text-[19px]">{eur(p.price)}</Gold>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[13px] leading-relaxed" style={{ color: 'var(--txf)' }}>{CHAINS_NOTE}</p>
              </div>
            </div>

            <div className="mt-16 border-t pt-8" style={{ borderColor: 'var(--bd)' }}>
              <p className="eyebrow mb-3">{CARDS.title}</p>
              <p className="max-w-[60ch] text-[15px] leading-relaxed" style={{ color: 'var(--tx2)' }}>{CARDS.lead}</p>
              <div className="mt-6 flex flex-wrap gap-x-12 gap-y-4">
                {[CARDS.five, CARDS.ten].map((c) => (
                  <div key={c.name}><p className="eyebrow mb-1.5">{c.name}</p><Gold className="text-[28px]">{c.uvp}</Gold></div>
                ))}
              </div>
              <p className="mt-5 max-w-[64ch] text-[13px] leading-relaxed" style={{ color: 'var(--txf)' }}>{CARDS.note}</p>
            </div>
          </Band>

          {/* ── 6 · Testpaket + Start ────────────────────────────────── */}
          <Band id="start" alt>
            <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <p className="eyebrow mb-4">{TRIAL.title}</p>
                <Gold className="block text-[clamp(2.5rem,7vw,3.75rem)] leading-none">{TRIAL.badge}</Gold>
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
                      <span className="spec-data eyebrow pt-0.5">{s.no}</span>
                      <span className="text-[16px]">{s.text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Band>

          {/* ── 7 · Fragen ───────────────────────────────────────────── */}
          <Band id="fragen">
            <p className="eyebrow mb-4">Fragen von Inhabern</p>
            <Title>Kurz beantwortet.</Title>
            <div className="mt-10 max-w-[760px] divide-y" style={{ borderTop: '1px solid var(--bd)' }}>
              {FAQ.map((f) => (
                <details key={f.q} className="group py-5" style={{ borderColor: 'var(--bd)' }}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-medium">
                    {f.q}
                    <span aria-hidden className="text-xl transition-transform group-open:rotate-45" style={{ color: 'var(--txf)' }}>+</span>
                  </summary>
                  <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed" style={{ color: 'var(--tx2)' }}>{f.a}</p>
                </details>
              ))}
            </div>
          </Band>

          {/* ── 8 · Kontakt ──────────────────────────────────────────── */}
          <Band id="anfrage" alt>
            <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr]">
              <div>
                <p className="eyebrow mb-4">Kontakt</p>
                <Title>Wollen wir es probieren?</Title>
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
          </Band>
        </main>

        <Footer />
      </div>

      {/* Feste Kontaktleiste nur auf dem Handy (der QR wird im Laden am Handy gescannt). */}
      <div
        aria-hidden={!showBar}
        className={`fixed inset-x-0 bottom-0 z-40 border-t px-4 py-2.5 transition-transform duration-300 lg:hidden ${showBar ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ ...DARK_VARS, background: 'rgba(10,10,10,0.94)', backdropFilter: 'blur(8px)', paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom))' }}
      >
        <a href={wa} target="_blank" rel="noopener noreferrer" tabIndex={showBar ? 0 : -1} onClick={() => trackPartnerCta('whatsapp')} className="btn-primary w-full py-3 text-[15px]">
          <MessageCircle className="h-4 w-4" aria-hidden /> Partner werden: WhatsApp
        </a>
      </div>
    </>
  );
}
