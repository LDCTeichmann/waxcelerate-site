import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Check, Thermometer, Droplets, Zap } from 'lucide-react';
import { getProductById } from '@/lib/data';
import { useLanguage } from '@/hooks/useLanguage';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const product = id ? getProductById(id) : undefined;
  const de = lang === 'de';

  if (!product) {
    return (
      <div className="min-h-screen bg-[#090909] flex flex-col items-center justify-center gap-4">
        <p className="text-[#8896B0]">{de ? 'Produkt nicht gefunden.' : 'Product not found.'}</p>
        <Link to="/" className="text-[#5B7AEE] hover:underline text-sm flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> {de ? 'Zurück' : 'Back'}
        </Link>
      </div>
    );
  }

  const isClassic = product.variant === 'classic';
  const isPro = product.variant === 'pro';
  const accentColor = isPro ? '#8B5CF6' : '#5B7AEE';
  const accentBg = isPro ? 'rgba(139,92,246,0.08)' : 'rgba(91,122,238,0.08)';

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(de ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);

  const formula = de ? product.formula : product.formulaEn;
  const highlights = de ? product.highlights : product.highlightsEn;
  const bestFor = de ? product.bestFor : product.bestForEn;
  const descriptionText = de ? product.description : product.descriptionEn;
  const titleText = de ? product.title : product.titleEn;

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      {/* Nav bar */}
      <div className="sticky top-0 z-50 bg-[#090909]/80 backdrop-blur-md border-b border-[#1A1A28]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-[#8896B0] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {de ? 'Zurück' : 'Back'}
          </Link>
          <span className="text-[#2A2A3A]">/</span>
          <span className="text-sm text-[#52576A] truncate">{titleText}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Left — image */}
          <div className="lg:sticky lg:top-20">
            <div
              className="relative rounded-2xl overflow-hidden border border-[#1A1A28] bg-[#0C0C10] aspect-square flex items-center justify-center p-6 sm:p-8 lg:p-12"
              style={{ background: `linear-gradient(160deg, #0E0E17 0%, #0A0A10 100%)` }}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{ background: `radial-gradient(60% 60% at 30% 30%, ${accentBg}, transparent)` }}
              />
              <img
                src={product.image}
                alt={titleText}
                className="relative w-full h-full object-contain"
                onError={e => { (e.target as HTMLImageElement).src = '/images/wax-block-spin.jpg'; }}
              />
              {product.badge && (
                <span
                  className="absolute top-4 right-4 text-[10px] font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full"
                  style={{ background: accentBg, color: accentColor, border: `1px solid ${accentColor}40` }}
                >
                  {de ? product.badge : product.badgeEn}
                </span>
              )}
            </div>

            {/* Interval pills below image */}
            {(product.intervalDry || product.intervalWet) && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {product.intervalDry && (
                  <IntervalPill
                    icon={<Zap className="h-3.5 w-3.5" />}
                    label={de ? 'Trocken' : 'Dry'}
                    value={product.intervalDry}
                    color={accentColor}
                  />
                )}
                {product.intervalWet && (
                  <IntervalPill
                    icon={<Droplets className="h-3.5 w-3.5" />}
                    label={de ? 'Nass' : 'Wet'}
                    value={product.intervalWet}
                    color="#64748B"
                  />
                )}
                {product.intervalTopup && (
                  <IntervalPill
                    icon={<Thermometer className="h-3.5 w-3.5" />}
                    label={de ? 'Max. (Topup)' : 'Max. (topup)'}
                    value={product.intervalTopup}
                    color={accentColor}
                    wide
                  />
                )}
              </div>
            )}
          </div>

          {/* Right — info */}
          <div className="flex flex-col gap-8">

            {/* Title + price */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
                {titleText}
              </h1>
              <p className="text-[#8896B0] text-sm leading-relaxed mb-5">{descriptionText}</p>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-white">{formatPrice(product.price)}</span>
                <a
                  href={product.ebayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: accentColor }}
                >
                  {de ? 'Bei eBay kaufen' : 'Buy on eBay'}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Highlights */}
            {highlights && highlights.length > 0 && (
              <Section title={de ? 'Das Wichtigste' : 'Key Features'}>
                <ul className="space-y-2.5">
                  {highlights.map(h => (
                    <li key={h} className="flex items-start gap-3 text-sm text-[#8896B0]">
                      <Check
                        className="h-4 w-4 mt-0.5 flex-shrink-0"
                        style={{ color: accentColor }}
                      />
                      {h}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Best for */}
            {bestFor && bestFor.length > 0 && (
              <Section title={de ? 'Am besten für' : 'Best for'}>
                <div className="flex flex-wrap gap-2">
                  {bestFor.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{ background: accentBg, color: accentColor, border: `1px solid ${accentColor}30` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Formula */}
            {formula && formula.length > 0 && (
              <Section title={de ? 'Zusammensetzung' : 'Formula'}>
                <div className="grid grid-cols-1 gap-1.5">
                  {formula.map((ingredient, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg border border-[#1A1A28] bg-[#0C0C10]"
                    >
                      <span
                        className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                        style={{ background: accentBg, color: accentColor }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm text-[#8896B0]">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Compatibility + specs */}
            <Section title={de ? 'Kompatibilität & Specs' : 'Compatibility & Specs'}>
              <div className="grid grid-cols-2 gap-2">
                {product.compatibility && (
                  <SpecRow label={de ? 'Kompatibel' : 'Compatible'} value={product.compatibility} />
                )}
                {product.weight && (
                  <SpecRow label={de ? 'Gewicht' : 'Weight'} value={product.weight} />
                )}
                {product.applications && (
                  <SpecRow label={de ? 'Anwendungen' : 'Applications'} value={product.applications} />
                )}
                <SpecRow label={de ? 'Verarbeitung' : 'Processing'} value="80–90°C" />
              </div>
            </Section>

            {/* Classic vs Pro hint */}
            {isClassic && (
              <div className="rounded-xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 p-4">
                <p className="text-xs text-[#8896B0]">
                  {de
                    ? 'Fahre viel im Herbst/Winter oder bei Regen? Das Pro mit MoS₂ bietet längere Intervalle und Rostschutz.'
                    : 'Ride a lot in autumn/winter or rain? Pro with MoS₂ offers longer intervals and rust protection.'}
                </p>
                <Link
                  to={`/produkt/${product.weight === '500g' ? 'wax-500-mos2' : 'wax-300-mos2'}`}
                  className="inline-flex items-center gap-1 mt-2 text-xs text-[#8B5CF6] hover:underline"
                >
                  {de ? 'Pro ansehen' : 'View Pro'} <ArrowLeft className="h-3 w-3 rotate-180" />
                </Link>
              </div>
            )}

            {/* Bottom CTA */}
            <a
              href={product.ebayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold text-white border border-[#2A2A3A] hover:border-[#3A3A4A] transition-all"
            >
              {de ? 'Jetzt bei eBay kaufen' : 'Buy now on eBay'}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[#52576A] mb-3">{title}</h2>
      {children}
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2.5 rounded-lg border border-[#1A1A28] bg-[#0C0C10]">
      <span className="text-[10px] uppercase tracking-wide text-[#52576A]">{label}</span>
      <span className="text-sm text-[#8896B0] font-medium">{value}</span>
    </div>
  );
}

function IntervalPill({
  icon, label, value, color, wide,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${wide ? 'col-span-2' : ''}`}
      style={{ background: `${color}0D`, borderColor: `${color}30` }}
    >
      <span style={{ color }}>{icon}</span>
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] uppercase tracking-wide text-[#52576A]">{label}</span>
        <span className="text-sm font-semibold text-white">{value}</span>
      </div>
    </div>
  );
}
