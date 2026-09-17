// ─── /kette-wachsen-lassen/:stadt — Stadtseite ──────────────────────────────
// Eigene Zahlen je Stadt (Klima → Intervall, Tür-zu-Tür-Dauer), darunter
// dieselben Bausteine wie die Hauptseite (Stufenformular, Ablauf, Preise).
// Daten und Texte: src/pages/rewax/cities.ts (auch vom Prerender genutzt).

import { useEffect, useState } from 'react';
import { WaxWeek } from '@/pages/rewax/WaxWeek';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ChevronDown, MapPin } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { removeStaticJsonLd, removeStaticHeadMeta } from '@/lib/utils';
import { trustStats } from '@/lib/data';
import { eur } from '@/pages/rewax/content';
import {
  cityBySlug, REWAX_CITIES, cityMeta, cityLead, cityClimateSentence, cityIntervalKm, rewaxesPerYear, cardFor,
  cityFaqItems, cityServiceSchema, cityBreadcrumbSchema, cityFaqSchema, cityUrl, DOOR_TO_DOOR, type RewaxCity,
} from '@/pages/rewax/cities';
import { RewaxRequestForm, RewaxSteps, PriceMatrix } from '@/pages/RewaxPage';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { NotFoundPage } from '@/pages/NotFoundPage';

const W = 'wx-frame';

function ClimateBlock({ city, de }: { city: RewaxCity; de: boolean }) {
  const [km, setKm] = useState(3000);
  const n = rewaxesPerYear(city, km);
  const card = cardFor(n);
  const name = de ? city.name : city.nameEn;
  return (
    <section className="py-14 sm:py-20" style={{ borderTop: '1px solid var(--bd2)' }}>
      <div className={W}>
        <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>{de ? `Klima ${name}` : `${name} climate`}</p>
        <h2 className="font-display font-bold text-wx-tx1 leading-tight"
          style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', letterSpacing: '-0.02em' }}>
          {de ? `Wie oft du in ${name} nachwachsen musst.` : `How often to rewax in ${name}.`}
        </h2>
        <p className="text-[14.5px] leading-relaxed mt-4 max-w-[62ch]" style={{ color: 'var(--txm)' }}>
          {cityClimateSentence(city, de)} {de ? city.localDe : city.localEn}
        </p>

        <dl className="grid grid-cols-3 gap-3 mt-8 max-w-[640px]">
          {[
            { v: `${city.precipMm} mm`, l: de ? 'Niederschlag im Jahr' : 'precipitation a year' },
            { v: `${city.wetDays}`, l: de ? 'Tage mit ≥ 1 mm' : 'days with ≥ 1 mm' },
            { v: `${cityIntervalKm(city)} km`, l: de ? 'Nachwachs-Intervall' : 'rewax interval' },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl p-4" style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
              <dt className="sr-only">{s.l}</dt>
              <dd>
                <p className="font-display font-bold leading-none" style={{ fontSize: '1.5rem', color: 'var(--tx1)' }}>{s.v}</p>
                <p className="text-[12px] sm:text-[11.5px] mt-1.5" style={{ color: 'var(--txm)' }}>{s.l}</p>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 max-w-[640px] rounded-2xl p-5" style={{ background: 'var(--accent-wash-sm)', border: '1px solid rgba(var(--accent-rgb),0.18)' }}>
          <p className="text-[13px] font-semibold" style={{ color: 'var(--tx1)' }}>{de ? 'Wie viel fährst du im Jahr?' : 'How far do you ride a year?'}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {[1500, 3000, 5000, 8000].map((v) => (
              <button key={v} type="button" onClick={() => setKm(v)}
                className="rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors"
                style={{ background: km === v ? 'var(--accent)' : 'var(--sf)', color: km === v ? '#fff' : 'var(--tx1)', border: `1px solid ${km === v ? 'var(--accent)' : 'var(--bd2)'}` }}>
                {v.toLocaleString(de ? 'de-DE' : 'en-US')} km
              </button>
            ))}
          </div>
          <p className="text-[14px] leading-relaxed mt-4" style={{ color: 'var(--txm)' }}>
            {de ? <>Etwa <strong style={{ color: 'var(--tx1)' }}>{n} Auffrischungen</strong> im Jahr.</> : <>About <strong style={{ color: 'var(--tx1)' }}>{n} rewaxes</strong> a year.</>}{' '}
            {card
              ? (de
                ? <>Dafür passt die <a href="/kette-wachsen-lassen#geschenk" className="font-semibold underline underline-offset-2" style={{ color: 'var(--accent)' }}>{card.count}er-Karte</a>: {eur(card.price / card.count, de)} statt {eur(card.list / card.count, de)} je Mal.</>
                : <>The <a href="/kette-wachsen-lassen#geschenk" className="font-semibold underline underline-offset-2" style={{ color: 'var(--accent)' }}>{card.count}-visit card</a> fits: {eur(card.price / card.count, de)} instead of {eur(card.list / card.count, de)} each time.</>)
              : (de ? 'Da reicht die einzelne Auffrischung.' : 'A single rewax each time is enough.')}
          </p>
          <p className="text-[12px] sm:text-[11px] mt-3" style={{ color: 'var(--txff)' }}>
            {de
              ? `Quelle: Deutscher Wetterdienst, Station ${city.dwdStation}, Mittel 1991–2020 (Niederschlag und Tage ≥ 1 mm). Annahme: gleich viel Fahren bei jedem Wetter, Straße.`
              : `Source: Deutscher Wetterdienst, station ${city.dwdStation}, 1991–2020 means (precipitation and days ≥ 1 mm). Assumes riding equally in all weather, on road.`}
          </p>
        </div>

        <WaxWeek slug={city.slug} name={name} de={de} />
      </div>
    </section>
  );
}

export function RewaxCityPage() {
  const { stadt } = useParams();
  const city = cityBySlug(stadt);
  const { lang } = useLanguage();
  const de = lang === 'de';

  useEffect(() => { removeStaticJsonLd(); removeStaticHeadMeta(); }, []);

  if (!city) return <NotFoundPage />;

  const name = de ? city.name : city.nameEn;
  const { title, description } = cityMeta(city, de);
  const canonical = cityUrl(city);
  const faq = cityFaqItems(city, de);
  const neighbors = city.neighbors.map((s) => cityBySlug(s)!).filter(Boolean);

  return (
    <div className="min-h-screen bg-wx-bg">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Waxcelerate" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content="https://waxcelerate.de/images/rewax/hero.webp" />
        <script type="application/ld+json">{JSON.stringify(cityServiceSchema(city, de))}</script>
        <script type="application/ld+json">{JSON.stringify(cityBreadcrumbSchema(city, de))}</script>
        <script type="application/ld+json">{JSON.stringify(cityFaqSchema(city, de))}</script>
      </Helmet>

      <Navigation />

      <main id="main-content">
        <section className="pt-28 sm:pt-36 pb-14 sm:pb-20" style={{ background: 'var(--pg)' }}>
          <div className={`${W} grid lg:grid-cols-[minmax(0,1fr)_420px] gap-10 lg:gap-14 items-start`}>
            <div>
              <nav aria-label="Breadcrumb" className="text-[12px] mb-5" style={{ color: 'var(--txf)' }}>
                <Link to="/kette-wachsen-lassen" className="hover:underline">{de ? 'Kette wachsen lassen' : 'Chain waxing'}</Link>
                {' / '}<span style={{ color: 'var(--txm)' }}>{name}</span>
              </nav>
              <p className="eyebrow mb-3 inline-flex items-center gap-1.5" style={{ color: 'var(--accent-soft)' }}>
                <MapPin className="h-3.5 w-3.5" aria-hidden /> {de ? `Per Post aus ${name}` : `By mail from ${name}`}
              </p>
              <h1 className="font-display font-bold leading-[1.04]"
                style={{ color: 'var(--tx1)', fontSize: 'clamp(2.1rem, 4.6vw, 3.2rem)', letterSpacing: '-0.025em' }}>
                {de ? `Fahrradkette wachsen lassen in ${name}.` : `Get your chain waxed in ${name}.`}
              </h1>
              <p className="text-[15.5px] leading-relaxed mt-4 max-w-[52ch]" style={{ color: 'var(--txm)' }}>{cityLead(city, de)}</p>
              <div className="rounded-2xl overflow-hidden mt-8" style={{ aspectRatio: '16 / 9', background: 'var(--sf2)' }}>
                <img src="/images/rewax/hero.webp" srcSet="/images/rewax/hero-800.webp 800w, /images/rewax/hero.webp 1200w"
                  sizes="(max-width: 1024px) 92vw, 50vw" alt={de ? 'Frisch gewachste Ketten hängen zum Aushärten' : 'Freshly waxed chains hanging to cure'}
                  className="w-full h-full object-cover" />
              </div>
              <p className="text-[12.5px] mt-3" style={{ color: 'var(--txm)' }}>
                {de ? `Tür zu Tür meist ${DOOR_TO_DOOR.de} · ★ ${trustStats.reviews} Bewertungen, 100 % positiv` : `Door to door usually ${DOOR_TO_DOOR.en} · ★ ${trustStats.reviews} reviews, 100% positive`}
              </p>
            </div>
            <div id="rewax-form" className="scroll-mt-24 lg:sticky lg:top-24">
              <RewaxRequestForm de={de} preselect={null} />
            </div>
          </div>
        </section>

        <ClimateBlock city={city} de={de} />
        <RewaxSteps de={de} />

        <section className="py-14 sm:py-20" style={{ borderTop: '1px solid var(--bd2)' }}>
          <div className={`${W} max-w-[760px] lg:max-w-[calc(760px+7rem)]`}>
            <PriceMatrix de={de} />
          </div>
        </section>

        <section className="py-14 sm:py-20" style={{ borderTop: '1px solid var(--bd2)', background: 'var(--sf)' }}>
          <div className={W}>
            <h2 className="font-display font-bold text-wx-tx1 leading-tight mb-6"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '-0.02em' }}>
              {de ? `Fragen aus ${name}` : `Questions from ${name}`}
            </h2>
            <div className="max-w-[720px]">
              {faq.map((item, i) => (
                <details key={item.q} className="group py-5" style={{ borderBottom: i < faq.length - 1 ? '1px solid var(--bd2)' : 'none' }}>
                  <summary className="flex items-center justify-between gap-5 cursor-pointer list-none">
                    <h3 className="text-[15px] font-medium" style={{ color: 'var(--tx1)' }}>{item.q}</h3>
                    <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform duration-300 group-open:rotate-180" style={{ color: 'var(--txf)' }} aria-hidden />
                  </summary>
                  <p className="text-[14px] leading-relaxed mt-3 max-w-[62ch]" style={{ color: 'var(--txm)' }}>{item.a}</p>
                </details>
              ))}
            </div>

            <div className="mt-10 pt-8 max-w-[720px]" style={{ borderTop: '1px solid var(--bd2)' }}>
              <p className="text-small uppercase tracking-[0.16em] mb-4" style={{ color: 'var(--txf)' }}>{de ? 'Auch per Post aus' : 'Also by mail from'}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] font-semibold">
                {neighbors.map((c) => (
                  <Link key={c.slug} to={`/kette-wachsen-lassen/${c.slug}`} className="inline-flex items-center gap-1.5" style={{ color: 'var(--tx1)' }}>
                    {de ? c.name : c.nameEn} <ArrowRight className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
                  </Link>
                ))}
                <Link to="/kette-wachsen-lassen" className="inline-flex items-center gap-1.5" style={{ color: 'var(--txm)' }}>
                  {de ? `Alle ${REWAX_CITIES.length} Städte` : `All ${REWAX_CITIES.length} cities`} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
