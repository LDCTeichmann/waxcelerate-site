import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Link } from 'react-router-dom';

interface Props {
  faqIds: number[];
  accentColor?: string;
}

export function ProductFAQ({ faqIds, accentColor = '#2B52B0' }: Props) {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const [open, setOpen] = useState<number | null>(null);

  const items = faqIds
    .map((i) => t.faq.items[i] as { q: string; a: string } | undefined)
    .filter((item): item is { q: string; a: string } => !!item);

  if (items.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--txff)' }}>
          {de ? 'Häufige Fragen' : 'Common questions'}
        </h2>
        <Link
          to="/#faq"
          className="text-[11px] hover:underline"
          style={{ color: accentColor }}
        >
          {de ? 'Alle Fragen →' : 'All FAQs →'}
        </Link>
      </div>

      <div style={{ border: '1px solid var(--bd2)', borderRadius: '12px', overflow: 'hidden' }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{ borderBottom: i < items.length - 1 ? '1px solid var(--bd2)' : 'none' }}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left gap-4"
            >
              <span className="text-[13px] font-medium text-wx-tx1 flex-1 leading-snug">
                {item.q}
              </span>
              <ChevronDown
                className="h-4 w-4 flex-shrink-0 transition-transform duration-200"
                style={{
                  color: 'var(--txff)',
                  transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-200 ease-in-out"
              style={{ gridTemplateRows: open === i ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div
                  className="px-4 pb-4 text-[13px] leading-[1.75]"
                  style={{ borderLeft: `2px solid ${accentColor}40`, marginLeft: '4px', color: 'var(--txm)' }}
                >
                  {item.a}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
