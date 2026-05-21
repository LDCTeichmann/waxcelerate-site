import { useRef } from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';

export function Contact() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const headerRef = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);

  return (
    <section id="kontakt" className="relative py-16 bg-wx-bg">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-2xl mx-auto">
          <div ref={headerRef} className="text-center mb-12">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal text={t.contact.title} />
            </h2>
            <p data-reveal="subtitle" className="text-wx-tx2">
              {t.contact.subtitle}
            </p>
          </div>

          {/* Two honest contact options */}
          <div className="grid sm:grid-cols-2 gap-4">

            {/* Email */}
            <a
              href="mailto:waxcelerate@gmail.com"
              className="group rounded-2xl p-6 flex flex-col gap-4 transition-all hover:border-white/20"
              style={{ background: 'var(--sf3)', border: '1px solid var(--bd2)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(43,82,176,0.12)', border: '1px solid rgba(43,82,176,0.2)' }}
              >
                <Mail className="h-5 w-5" style={{ color: '#2B52B0' }} />
              </div>
              <div>
                <p className="font-semibold text-wx-tx1 mb-1">{t.contact.emailCardTitle}</p>
                <p className="text-[13px] leading-relaxed text-wx-tx2 mb-3">{t.contact.emailCardDesc}</p>
                <span
                  className="text-[13px] font-medium transition-colors group-hover:underline"
                  style={{ color: '#3D67CA' }}
                >
                  {t.contact.emailCta}
                </span>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/4915751957470"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl p-6 flex flex-col gap-4 transition-all hover:border-white/20"
              style={{ background: 'var(--sf3)', border: '1px solid var(--bd2)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(37,211,102,0.10)', border: '1px solid rgba(37,211,102,0.18)' }}
              >
                <MessageCircle className="h-5 w-5" style={{ color: '#25D366' }} />
              </div>
              <div>
                <p className="font-semibold text-wx-tx1 mb-1">{t.contact.whatsappTitle}</p>
                <p className="text-[13px] leading-relaxed text-wx-tx2 mb-3">{t.contact.whatsappDesc}</p>
                <span
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-opacity group-hover:opacity-80"
                  style={{ color: '#25D366' }}
                >
                  {t.contact.whatsappCta} →
                </span>
              </div>
            </a>

          </div>

          {/* Response time note */}
          <p className="text-center text-[12px] mt-6" style={{ color: 'rgba(255,255,255,0.22)' }}>
            {de
              ? 'Antwortzeit unter 24 Stunden · Luca Teichmann · Stuttgart'
              : 'Response within 24 hours · Luca Teichmann · Stuttgart'}
          </p>

        </div>
      </div>
      {/* Bottom gradient — bridges to Footer below */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--sf3))', zIndex: 1 }}
      />
    </section>
  );
}
