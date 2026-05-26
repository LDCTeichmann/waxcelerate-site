import { useRef, useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';

// WhatsApp icon — lucide doesn't include it
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function Contact() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const headerRef = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);

  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent]       = useState(false);

  const subjects = de
    ? ['Frage zur Bestellung', 'Produktfrage', 'Kettentyp-Beratung', 'Sonstiges']
    : ['Order question', 'Product question', 'Chain type advice', 'Other'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sub  = encodeURIComponent(`[Waxcelerate] ${subject || subjects[0]}: ${name}`);
    const body = encodeURIComponent(
      `Von: ${name}\nE-Mail: ${email}\nThema: ${subject || subjects[0]}\n\n${message}`
    );
    window.location.href = `mailto:waxcelerate@gmail.com?subject=${sub}&body=${body}`;
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  const waUrl = `https://wa.me/4915751957470?text=${encodeURIComponent(
    de
      ? 'Hallo Luca, ich habe eine Frage zu Waxcelerate: '
      : 'Hi Luca, I have a question about Waxcelerate: '
  )}`;

  // Input / select shared style
  const fieldStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 14,
    color: 'rgba(255,255,255,0.88)',
    outline: 'none',
    transition: 'border-color 150ms',
  };

  return (
    <section id="kontakt" className="relative py-16 bg-wx-bg">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div ref={headerRef} className="text-center mb-12">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal text={t.contact.title} />
            </h2>
            <p data-reveal="subtitle" className="text-wx-tx2">
              {t.contact.subtitle}
            </p>
          </div>

          {/* Two-column: form left, WhatsApp right */}
          <div className="grid md:grid-cols-[1fr_300px] gap-5 items-start">

            {/* ── Contact form ─────────────────────────────────────────── */}
            <div
              className="rounded-2xl p-6 sm:p-7"
              style={{
                background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
                border: '1px solid var(--bd)',
                boxShadow: 'var(--card-shad)',
              }}
            >
              {/* Card header */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(43,82,176,0.12)', border: '1px solid rgba(43,82,176,0.22)' }}
                >
                  <Mail className="h-4 w-4" style={{ color: '#3D67CA' }} />
                </div>
                <div>
                  <p className="font-semibold text-wx-tx1 text-[14px] leading-tight">
                    {de ? 'Nachricht schreiben' : 'Send a message'}
                  </p>
                  <p className="text-[12px] mt-0.5 text-wx-txf">
                    {de ? 'Öffnet deinen E-Mail-Client' : 'Opens your email client'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Name + Email row */}
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.1em] font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
                      {de ? 'Name' : 'Name'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={de ? 'Dein Name' : 'Your name'}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      style={fieldStyle}
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(61,103,202,0.55)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.1em] font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
                      E-Mail
                    </label>
                    <input
                      type="email"
                      required
                      placeholder={de ? 'deine@email.de' : 'your@email.com'}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={fieldStyle}
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(61,103,202,0.55)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
                    />
                  </div>
                </div>

                {/* Subject select */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    {de ? 'Thema' : 'Subject'}
                  </label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    style={{ ...fieldStyle, cursor: 'pointer' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(61,103,202,0.55)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
                  >
                    {subjects.map(s => (
                      <option key={s} value={s} style={{ background: '#141414', color: '#fff' }}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Message textarea */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    {de ? 'Nachricht' : 'Message'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder={de
                      ? 'Deine Frage zur Bestellung, Kettentyp oder zum Produkt…'
                      : 'Your question about the order, chain type, or product…'}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    style={{ ...fieldStyle, resize: 'vertical', minHeight: 100 }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(61,103,202,0.55)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-[14px] text-white transition-opacity hover:opacity-90 active:scale-[0.99]"
                  style={{ background: '#2B52B0' }}
                >
                  {sent
                    ? (de ? '✓ E-Mail-Client geöffnet' : '✓ Email client opened')
                    : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        {de ? 'Nachricht senden' : 'Send message'}
                      </>
                    )}
                </button>
              </form>
            </div>

            {/* ── WhatsApp CTA ──────────────────────────────────────────── */}
            <div className="flex flex-col gap-4">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl p-6 transition-all"
                style={{
                  background: 'linear-gradient(145deg, #075E54 0%, #128C7E 100%)',
                  border: '1px solid rgba(37,211,102,0.25)',
                  boxShadow: '0 8px 32px rgba(37,211,102,0.15)',
                  textDecoration: 'none',
                }}
              >
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.15)' }}
                  >
                    <WhatsAppIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-[15px] leading-tight mb-0.5">
                      {de ? 'Per WhatsApp' : 'Via WhatsApp'}
                    </p>
                    <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.68)' }}>
                      {de ? 'Direkte Antwort — meist sofort' : 'Direct reply — usually instant'}
                    </p>
                  </div>
                </div>

                <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.80)' }}>
                  {de
                    ? 'Kurze Frage zur Kette, Kettentyp-Check oder Lieferstatus? Schreib mir direkt — ich antworte persönlich.'
                    : 'Quick question about your chain, compatibility check or shipping? Write me directly — I reply personally.'}
                </p>

                <div
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-[14px] transition-all group-hover:brightness-110"
                  style={{ background: '#25D366', color: '#000' }}
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  {de ? 'WhatsApp öffnen →' : 'Open WhatsApp →'}
                </div>
              </a>

              {/* Email fallback note */}
              <div
                className="rounded-xl px-4 py-3.5 text-center"
                style={{ background: 'var(--sf3)', border: '1px solid var(--bd2)' }}
              >
                <p className="text-[12px] text-wx-txf mb-1">
                  {de ? 'Oder per E-Mail:' : 'Or by email:'}
                </p>
                <a
                  href="mailto:waxcelerate@gmail.com"
                  className="text-[13px] font-medium transition-colors hover:text-[#5580E0]"
                  style={{ color: '#3D67CA' }}
                >
                  waxcelerate@gmail.com
                </a>
              </div>

              {/* Response note */}
              <p className="text-center text-[11px]" style={{ color: 'var(--txf)' }}>
                {de
                  ? '⚡ Antwort in der Regel am selben Tag'
                  : '⚡ Reply usually the same day'}
              </p>
            </div>

          </div>
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
