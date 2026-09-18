import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { headingId } from '../headingId';
import { WAX_TOPICS, CHAIN_TOPICS } from '@/pages/product/faqTopics';

type Topic = 'Alle' | 'Wachs' | 'Ketten' | 'Allgemein';

function topicOf(q: string): Exclude<Topic, 'Alle'> {
  if (CHAIN_TOPICS.some((t) => q.includes(t))) return 'Ketten';
  if (WAX_TOPICS.some((t) => q.includes(t))) return 'Wachs';
  return 'Allgemein';
}

/**
 * "Häufige Fragen" auf /blog — vorher die eigenstaendige Seite /faq
 * (Seitenordnung Chat 4, 09/2026: FAQ lebt jetzt in „Blog & FAQ", `/faq`
 * leitet per 301 auf `/blog#fragen`). Fragen und Antworten unveraendert aus
 * `t.faq.items` (src/lib/i18n.ts), Themen ueber dieselben Stichwortlisten
 * gruppiert, mit denen auch die Produktseite ihre FAQ-Teilmenge waehlt
 * (`src/pages/product/faqTopics.ts`).
 *
 * Anker-Schema bewusst `fragen-<id>` statt `faq-<id>`: Artikel-eigene FAQ
 * (BlogArticlePage, generate-blog-html.mjs) nutzen `faq-<id>` fuer ihre
 * eigenen, andere Fragen — beide Praefixe muessen unterscheidbar bleiben,
 * weil src/lib/search/engine.ts am Praefix erkennt, ob eine Antwortkarte auf
 * einen Artikel oder auf diese Seiten-FAQ zeigt.
 */
export function FaqSection() {
  const { t } = useLanguage();
  const items = t.faq.items;
  const location = useLocation();
  const [openId, setOpenId] = useState<string | null>(null);
  const [topic, setTopic] = useState<Topic>('Alle');
  const itemRefs = useRef(new Map<string, HTMLDivElement>());

  const withTopic = items.map((it) => ({ ...it, id: `fragen-${headingId(it.q)}`, topic: topicOf(it.q) }));
  const counts: Record<Topic, number> = { Alle: withTopic.length, Wachs: 0, Ketten: 0, Allgemein: 0 };
  for (const it of withTopic) counts[it.topic] += 1;
  const visible = topic === 'Alle' ? withTopic : withTopic.filter((it) => it.topic === topic);

  // Deep-Link aus der Suche oder von aussen: #fragen-<id> oeffnet die Frage
  // und scrollt dorthin. Das Akkordeon steht sonst zu, ein reiner
  // Browser-Hash-Sprung wuerde also auf der geschlossenen Zeile landen.
  useEffect(() => {
    const hash = location.hash.replace(/^#/, '');
    if (!hash.startsWith('fragen-')) return;
    setOpenId(hash);
    const el = itemRefs.current.get(hash);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }, [location.hash]);

  return (
    <section id="fragen" aria-labelledby="fragen-titel" className="mb-20 scroll-mt-28">
      <div className="max-w-xl mb-8">
        <p className="eyebrow mb-3" style={{ color: 'var(--accent)' }}>{t.faq.eyebrow}</p>
        <h2 id="fragen-titel" className="font-display text-[28px] sm:text-[34px] font-bold text-wx-tx1 leading-[1.1] mb-3">
          {t.faq.title}
        </h2>
        <p className="text-[15px] leading-[1.7] text-wx-txm">{t.faq.subtitle}</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
        {(['Alle', 'Wachs', 'Ketten', 'Allgemein'] as Topic[]).map((tp) => (
          <button
            key={tp}
            type="button"
            onClick={() => setTopic(tp)}
            aria-pressed={topic === tp}
            className="shrink-0 text-[13px] px-4 py-2 rounded-full transition-colors"
            style={
              topic === tp
                ? { background: 'var(--accent)', color: 'var(--pg)' }
                : { border: '1px solid var(--bd)', color: 'var(--tx1)', background: 'var(--sf)' }
            }
          >
            {tp} <span className="font-mono font-normal opacity-70">{counts[tp]}</span>
          </button>
        ))}
      </div>

      <div className="max-w-[880px]">
        {visible.map((item) => {
          const open = openId === item.id;
          return (
            <div
              key={item.id}
              id={item.id}
              ref={(el) => { if (el) itemRefs.current.set(item.id, el); }}
              data-card
              className="border-b border-wx-bd last:border-0 first:border-t first:border-wx-bd scroll-mt-28"
            >
              <button
                onClick={() => setOpenId(open ? null : item.id)}
                className="w-full flex items-center justify-between py-5 text-left gap-5 hover:text-wx-tx1 transition-colors group"
              >
                <h3 className="text-wx-tx1 font-medium text-[15px] leading-snug text-left flex-1 group-hover:text-wx-tx1 transition-colors">
                  {item.q}
                </h3>
                <ChevronDown
                  className={`h-4 w-4 text-wx-txf flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-[var(--accent)]' : ''}`}
                />
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-[320ms]"
                style={{ gridTemplateRows: open ? '1fr' : '0fr', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
              >
                <div className="overflow-hidden">
                  <div className="pb-5 border-l-2 pl-4 max-w-3xl" style={{ borderColor: 'rgba(var(--accent-rgb),0.35)' }}>
                    <p className="text-wx-tx2 text-[14px] leading-[1.75]">{item.a}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
