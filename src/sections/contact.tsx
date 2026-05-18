import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Check } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import gsap from 'gsap';

export function Contact() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const headerRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp'>('email');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bikeType: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submitted || !successRef.current) return;
    const el = successRef.current;
    gsap.fromTo(el,
      { scale: 0.85, opacity: 0, y: 12 },
      { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' }
    );
  }, [submitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(
      `Anfrage von ${formData.name}${formData.bikeType ? ` — ${formData.bikeType}` : ''}`
    );
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}${formData.bikeType ? `\nFahrrad/Bike: ${formData.bikeType}` : ''}\n\n${formData.message}`
    );
    window.location.href = `mailto:waxcelerate@gmail.com?subject=${subject}&body=${body}`;

    // Animate form out, show success
    if (formRef.current) {
      gsap.to(formRef.current, {
        opacity: 0, y: -8, duration: 0.2, ease: 'power2.in',
        onComplete: () => {
          setSubmitted(true);
          setTimeout(() => {
            setSubmitted(false);
            requestAnimationFrame(() => {
              if (formRef.current) {
                gsap.fromTo(formRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
              }
            });
            setFormData({ name: '', email: '', bikeType: '', message: '' });
          }, 3000);
        },
      });
    } else {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', bikeType: '', message: '' });
      }, 3000);
    }
  };

  return (
    <section id="kontakt" className="relative py-16 bg-wx-bg">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-2xl mx-auto">
          <div ref={headerRef} className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal text={t.contact.title} />
            </h2>
            <p data-reveal="subtitle" className="text-wx-tx2">
              {t.contact.subtitle}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: 'var(--sf3)', border: '1px solid var(--bd2)' }}>
            <button
              onClick={() => setActiveTab('email')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all"
              style={activeTab === 'email'
                ? { background: '#2B52B0', color: '#fff' }
                : { color: 'var(--txm)' }}
            >
              <Send className="h-4 w-4" />
              {t.contact.tabEmail}
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all"
              style={activeTab === 'whatsapp'
                ? { background: '#16a34a', color: '#fff' }
                : { color: 'var(--txm)' }}
            >
              <MessageCircle className="h-4 w-4" />
              {t.contact.tabWhatsapp}
            </button>
          </div>

          {/* Email Form */}
          {activeTab === 'email' && (
            <div className="rounded-xl p-6" style={{ background: 'var(--sf3)', border: '1px solid var(--bd2)' }}>
              {submitted ? (
                <div ref={successRef} className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-medium text-wx-tx1 mb-2">{t.contact.success}</h3>
                  <p className="text-wx-tx2">{t.contact.successSub}</p>
                  <p className="text-[12px] mt-3" style={{ color: 'var(--txf)' }}>
                    {de
                      ? 'Kein E-Mail-Programm geöffnet? Schreib direkt an: '
                      : "Mail client didn't open? Write directly to: "}
                    <a
                      href="mailto:waxcelerate@gmail.com"
                      className="underline"
                      style={{ color: '#2B52B0' }}
                    >
                      waxcelerate@gmail.com
                    </a>
                  </p>
                </div>
              ) : (
                <div ref={formRef}>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-name" className="block text-xs uppercase tracking-widest text-wx-tx2 mb-2">{t.contact.name} *</label>
                        <input
                          id="contact-name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all"
                          style={{ background: 'var(--sf2)', border: '1px solid var(--bd)', color: 'var(--tx1)' }}
                          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(43,82,176,0.6)')}
                          onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd)')}
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="block text-xs uppercase tracking-widest text-wx-tx2 mb-2">{t.contact.email} *</label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all"
                          style={{ background: 'var(--sf2)', border: '1px solid var(--bd)', color: 'var(--tx1)' }}
                          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(43,82,176,0.6)')}
                          onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd)')}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact-bike" className="block text-xs uppercase tracking-widest text-wx-tx2 mb-2">{t.contact.bikeType}</label>
                      <input
                        id="contact-bike"
                        placeholder={de ? 'z.B. Rennrad, 11-fach Shimano' : 'e.g. Road bike, 11-speed Shimano'}
                        value={formData.bikeType}
                        onChange={(e) => setFormData({ ...formData, bikeType: e.target.value })}
                        className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all"
                        style={{ background: 'var(--sf2)', border: '1px solid var(--bd)', color: 'var(--tx1)' }}
                        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(43,82,176,0.6)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd)')}
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="block text-xs uppercase tracking-widest text-wx-tx2 mb-2">{t.contact.message} *</label>
                      <textarea
                        id="contact-message"
                        required
                        rows={4}
                        placeholder={de ? 'Deine Nachricht, z.B. Kettentyp, Frage zur Bestellung...' : 'Your message, e.g. chain type, order question...'}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all resize-none"
                        style={{ background: 'var(--sf2)', border: '1px solid var(--bd)', color: 'var(--tx1)' }}
                        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(43,82,176,0.6)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd)')}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: '#2B52B0' }}
                    >
                      <Send className="h-4 w-4" />
                      {t.contact.send}
                    </button>

                    <p className="text-wx-txf text-xs text-center">{t.contact.emailTo}</p>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* WhatsApp */}
          {activeTab === 'whatsapp' && (
            <div className="rounded-xl p-8 text-center" style={{ background: 'var(--sf3)', border: '1px solid var(--bd2)' }}>
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <MessageCircle className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-wx-tx1 mb-2">{t.contact.whatsappTitle}</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--tx2)' }}>{t.contact.whatsappDesc}</p>
              <a
                href="https://wa.me/4915751957470"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: '#16a34a' }}
              >
                <MessageCircle className="h-4 w-4" />
                {t.contact.whatsappCta}
              </a>
            </div>
          )}
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
