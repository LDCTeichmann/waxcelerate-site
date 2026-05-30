import { useRef } from 'react';
import { Mail } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';

function WhatsAppIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function Contact() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const headerRef = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);

  const waUrl = `https://wa.me/4915751957470?text=${encodeURIComponent(
    de
      ? 'Hallo Luca, ich habe eine Frage zu Waxcelerate: '
      : 'Hi Luca, I have a question about Waxcelerate: '
  )}`;

  const mailUrl = `mailto:waxcelerate@gmail.com?subject=${encodeURIComponent(
    de ? '[Waxcelerate] Anfrage' : '[Waxcelerate] Inquiry'
  )}`;

  return (
    <section id="kontakt" className="relative py-16 bg-wx-bg">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div ref={headerRef} className="text-center mb-12">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal text={t.contact.title} />
            </h2>
            <p data-reveal="subtitle" className="text-wx-tx2">
              {t.contact.subtitle}
            </p>
          </div>

          {/* Two equal contact cards */}
          <div className="grid sm:grid-cols-2 gap-4">

            {/* WhatsApp card */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-2xl p-6 transition-all"
              style={{
                background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
                border: '1px solid rgba(37,211,102,0.45)',
                boxShadow: 'var(--card-shad)',
                textDecoration: 'none',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(37,211,102,0.10)', border: '1px solid rgba(37,211,102,0.20)' }}
                >
                  <WhatsAppIcon className="h-6 w-6" style={{ color: '#1a7a4a' }} />
                </div>
                <div>
                  <p className="font-bold text-wx-tx1 text-[15px] leading-tight">
                    {de ? 'Per WhatsApp' : 'Via WhatsApp'}
                  </p>
                  <span
                    className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide"
                    style={{ background: 'rgba(37,211,102,0.10)', color: '#1a7a4a' }}
                  >
                    {de ? 'meist sofort' : 'usually instant'}
                  </span>
                </div>
              </div>

              <p className="text-[13px] leading-relaxed mb-5 flex-1 text-wx-tx2">
                {de
                  ? 'Kurze Frage, Kettentyp-Check oder Lieferstatus? Schreib direkt — ich antworte persönlich.'
                  : 'Quick question, chain check, or shipping? Write directly — I reply personally.'}
              </p>

              <div
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-[13px] transition-all group-hover:brightness-110"
                style={{ background: 'rgba(37,211,102,0.10)', color: '#1a7a4a', border: '1px solid rgba(37,211,102,0.25)' }}
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                {de ? 'WhatsApp öffnen →' : 'Open WhatsApp →'}
              </div>
            </a>

            {/* Email card */}
            <a
              href={mailUrl}
              className="group flex flex-col rounded-2xl p-6 transition-all"
              style={{
                background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
                border: '1px solid var(--bd)',
                boxShadow: 'var(--card-shad)',
                textDecoration: 'none',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(26,60,110,0.12)', border: '1px solid rgba(26,60,110,0.22)' }}
                >
                  <Mail className="h-5 w-5" style={{ color: '#264E8C' }} />
                </div>
                <div>
                  <p className="font-bold text-wx-tx1 text-[15px] leading-tight">
                    {de ? 'Per E-Mail' : 'Via Email'}
                  </p>
                  <span
                    className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide"
                    style={{ background: 'rgba(26,60,110,0.12)', color: '#264E8C' }}
                  >
                    {de ? 'am selben Tag' : 'same day'}
                  </span>
                </div>
              </div>

              <p className="text-[13px] leading-relaxed mb-3 flex-1 text-wx-tx2">
                {de
                  ? 'Für ausführlichere Anfragen oder wenn du lieber per E-Mail schreibst.'
                  : 'For detailed inquiries or if you prefer email.'}
              </p>

              <p
                className="text-[12px] text-center mb-4 font-medium"
                style={{ color: 'var(--txf)' }}
              >
                waxcelerate@gmail.com
              </p>

              <div
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-[13px] text-white transition-opacity group-hover:opacity-90"
                style={{ background: '#1A3C6E' }}
              >
                <Mail className="h-3.5 w-3.5" />
                {de ? 'E-Mail schreiben' : 'Write an email'}
              </div>
            </a>

          </div>

          {/* Response note */}
          <p className="text-center text-[11px] mt-5" style={{ color: 'var(--txf)' }}>
            {de ? 'Antwort in der Regel am selben Tag' : 'Reply usually the same day'}
          </p>

        </div>
      </div>

      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--sf3))', zIndex: 1 }}
      />
    </section>
  );
}
