// ─── WhatChanges — "Was sich ändert" ─────────────────────────────────────────
// Third attempt at this slot, and the first one that is not a chart.
//
// The two previous versions failed for the same reason. A tick comb and a
// sawtooth both ask the reader to decode an axis before they get anything back.
// Somebody who has never waxed a chain is not going to do that work, and they
// should not have to: they are not asking "how does the friction curve behave",
// they are asking "what changes for me".
//
// So: three rows, each one thing, alternating image and text. Photograph where a
// photograph is the argument (nobody needs a diagram to understand a clean
// chain), one very plain range bar where a number is the argument. No axes, no
// legend, no second reading. Everything here is a published figure.

import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { waxVsOil } from '@/lib/data';

// ─── The one graphic: two ranges on one scale ────────────────────────────────
// Deliberately not a chart. Two bars on a shared 0–12 W scale, each drawn from
// the low to the high end of its published range, so the gap is the picture and
// there is nothing to interpret.
function WattBars({ de }: { de: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(prefersReducedMotion());

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const t = ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => setRun(true) });
    return () => t.kill();
  }, []);

  const MAX = 12;
  const rows = [
    { label: de ? 'Kettenöl' : 'Chain oil', range: waxVsOil.watts.oil, accent: false },
    { label: de ? 'Heißwachs' : 'Hot wax', range: waxVsOil.watts.wax, accent: true },
  ];

  return (
    <div ref={ref} className="w-full">
      {rows.map(r => {
        const [lo, hi] = r.range;
        return (
          <div key={r.label} className="mb-5 last:mb-0">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-[14px]" style={{ color: r.accent ? 'var(--tx1)' : 'var(--txm)' }}>
                {r.label}
              </span>
              <span className="num-data text-[15px] font-medium"
                style={{ color: r.accent ? 'var(--accent)' : 'var(--txf)' }}>
                {lo}–{hi} W
              </span>
            </div>
            <div className="relative h-3 rounded-full" style={{ background: 'var(--bd2)' }}>
              <div className="absolute inset-y-0 rounded-full"
                style={{
                  left: `${(lo / MAX) * 100}%`,
                  width: run ? `${((hi - lo) / MAX) * 100}%` : '0%',
                  background: r.accent
                    ? 'linear-gradient(90deg, var(--accent-strong), var(--accent-soft))'
                    : 'var(--txf)',
                  opacity: r.accent ? 1 : 0.4,
                  transition: 'width .9s cubic-bezier(0.22,1,0.36,1)',
                }} />
            </div>
          </div>
        );
      })}
      <div className="flex justify-between mt-4 pt-3" style={{ borderTop: '1px solid var(--bd2)' }}>
        {[0, 4, 8, 12].map(v => (
          <span key={v} className="num-data text-[11px]" style={{ color: 'var(--txff)' }}>
            {v}{v === 12 ? ' W' : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

export function WhatChanges({ de }: { de: boolean }) {
  const rows = [
    {
      key: 'clean',
      eyebrowDe: 'Sauberkeit', eyebrowEn: 'Cleanliness',
      titleDe: 'Kein Öl an Händen, Waden und Hose.', titleEn: 'No oil on your hands, calves or trousers.',
      bodyDe: 'Wachs härtet zu einem trockenen Film aus. Da ist nichts Klebriges, an dem Staub hängen bleibt, und nichts, was abfärbt. Du kannst die Kette mit bloßen Fingern auflegen und danach ohne Umweg ins Café.',
      bodyEn: 'Wax cures to a dry film. There is nothing tacky for dust to cling to and nothing that rubs off. You can fit the chain with bare fingers and walk straight into a café afterwards.',
      // Zeigt das Problem, nicht die Loesung. Eigenes Foto statt Stockbild:
      // eine sichtbar oelig glaenzende, ungewachste Kette auf dem Kettenblatt,
      // genau das, was Haende, Waden und Hosenbein abbekommen.
      img: '/images/blog/chain-drivetrain-closeup-1600.webp',
      imgSrcSet: '/images/blog/chain-drivetrain-closeup-800.webp 800w, /images/blog/chain-drivetrain-closeup-1600.webp 1600w',
      imgAltDe: 'Ölig glänzende, ungewachste Fahrradkette auf dem Kettenblatt',
      imgAltEn: 'Oily, unwaxed bicycle chain on the chainring',
    },
    {
      key: 'watt',
      eyebrowDe: 'Antriebsverlust', eyebrowEn: 'Drivetrain loss',
      titleDe: 'Fünf Watt, die du nicht mehr wegdrückst.', titleEn: 'Five watts you no longer push through.',
      bodyDe: 'Beides sind Spannen, weil jeder Schmierstoff über seine Standzeit schlechter wird. Selbst frisch geölt liegt Öl über dem, was Wachs am Ende seines Intervalls braucht.',
      bodyEn: 'Both are ranges, because every lubricant degrades over its service life. Even freshly oiled, oil sits above what wax needs at the end of its interval.',
      graphic: true,
    },
    {
      key: 'effort',
      eyebrowDe: 'Pflege und Verschleiß', eyebrowEn: 'Care and wear',
      titleDe: 'Weniger Werkstatt, kein Schrubben.', titleEn: 'Less workshop, no scrubbing.',
      bodyDe: 'Es gibt keinen zähen Schmierfilm mehr, den du mit Bürste und Reiniger abbekommen musst. Heißes Wasser über die Kette löst das alte Wachs samt Dreck, trocknen, neu wachsen. Und weil kaum noch Abrieb entsteht, halten Kette, Kassette und Kettenblätter deutlich länger, der teure Teil am Antrieb kommt also seltener dran.',
      bodyEn: 'There is no stubborn film left to scrub off with a brush and degreaser. Hot water over the chain releases the old wax along with the grit, dry it, wax it again. And because almost nothing abrades, chain, cassette and chainrings last far longer, so the expensive part of the drivetrain comes up much less often.',
      img: '/images/rewax/step-2.webp',
      imgSrcSet: '/images/rewax/step-2-800.webp 800w, /images/rewax/step-2.webp 1200w',
      imgAltDe: 'Kette am Draht über dem heißen Wachstopf',
      imgAltEn: 'Chain on a wire above the hot wax pot',
    },
  ];

  return (
    <div className="mt-10 sm:mt-14">
      <p className="eyebrow mb-8" style={{ color: 'var(--txf)' }}>
        {de ? 'Was sich ändert' : 'What changes'}
      </p>

      <div className="space-y-10 sm:space-y-12">
        {rows.map((r, i) => (
          <div key={r.key}
            className={`grid lg:grid-cols-2 gap-6 lg:gap-12 items-center ${i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}>

            {/* Visual */}
            <div>
              {r.graphic ? (
                <div className="rounded-2xl p-6 sm:p-7"
                  style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
                  <WattBars de={de} />
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden"
                  style={{ aspectRatio: '16 / 10', background: 'var(--sf2)' }}>
                  <img src={r.img} srcSet={r.imgSrcSet}
                    sizes="(max-width: 1024px) 92vw, 46vw"
                    alt={de ? r.imgAltDe : r.imgAltEn} loading="lazy" decoding="async"
                    className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Text */}
            <div>
              <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
                {de ? r.eyebrowDe : r.eyebrowEn}
              </p>
              <h3 className="font-display font-bold text-wx-tx1 leading-[1.12] tracking-[-0.02em]"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)' }}>
                {de ? r.titleDe : r.titleEn}
              </h3>
              <p className="text-[15px] leading-relaxed mt-3.5 max-w-[46ch]" style={{ color: 'var(--txm)' }}>
                {de ? r.bodyDe : r.bodyEn}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
