import { useState, type FormEvent } from 'react';
import { trackPartnerCta } from '@/lib/analytics';
import type { PartnerShop } from './shops';

type Status = 'idle' | 'sending' | 'done' | 'error';

const fieldClass =
  'w-full rounded-lg border bg-transparent px-3.5 py-3 text-[15px] outline-none transition-colors focus:border-[var(--tx2)]';
const fieldStyle = { borderColor: 'var(--bd)', color: 'var(--tx1)' } as const;

export function PartnerRequestForm({ shop, shopSlug, source }: { shop: PartnerShop | null; shopSlug: string | null; source: string }) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'sending') return;
    const f = new FormData(e.currentTarget);
    setStatus('sending');
    setError('');
    trackPartnerCta('form');
    try {
      const res = await fetch('/api/partner-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName: f.get('shopName'),
          city: f.get('city'),
          name: f.get('name'),
          contact: f.get('contact'),
          message: f.get('message'),
          testpaket: f.get('testpaket') === 'on',
          shopSlug: shopSlug ?? undefined,
          source,
          honeypot: f.get('website'),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Das hat nicht geklappt. Schreiben Sie uns bitte kurz per WhatsApp.');
        setStatus('error');
        return;
      }
      setStatus('done');
    } catch {
      setError('Keine Verbindung. Schreiben Sie uns bitte kurz per WhatsApp.');
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div role="status" className="rounded-xl border p-6" style={{ borderColor: 'var(--bd)' }}>
        <p className="font-semibold" style={{ color: 'var(--tx1)' }}>Danke, die Anfrage ist bei uns.</p>
        <p className="mt-2 text-[15px]" style={{ color: 'var(--tx2)' }}>
          Wir melden uns am selben Tag. Das Testpaket ist in der Regel in 48–72 Stunden bei Ihnen.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3.5" noValidate>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px]" style={{ color: 'var(--tx2)' }}>Name des Ladens</span>
          <input name="shopName" required autoComplete="organization" defaultValue={shop?.name ?? ''} className={fieldClass} style={fieldStyle} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px]" style={{ color: 'var(--tx2)' }}>Stadt</span>
          <input name="city" required autoComplete="address-level2" defaultValue={shop?.city ?? ''} className={fieldClass} style={fieldStyle} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px]" style={{ color: 'var(--tx2)' }}>Ansprechpartner</span>
          <input name="name" required autoComplete="name" className={fieldClass} style={fieldStyle} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px]" style={{ color: 'var(--tx2)' }}>E-Mail oder Telefon</span>
          <input name="contact" required autoComplete="email" inputMode="email" className={fieldClass} style={fieldStyle} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-[13px]" style={{ color: 'var(--tx2)' }}>Nachricht (optional)</span>
        <textarea name="message" rows={3} className={fieldClass} style={fieldStyle} />
      </label>
      {/* Honeypot: fuer Menschen unsichtbar, Bots fuellen ihn aus. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      <label className="flex items-start gap-2.5 text-[14px]" style={{ color: 'var(--tx2)' }}>
        <input type="checkbox" name="testpaket" defaultChecked className="mt-1 h-4 w-4" />
        <span>Ich möchte das Testpaket (Wachs auf Kommission, 0 € Warenrisiko).</span>
      </label>
      {status === 'error' && (
        <p role="alert" className="text-[14px]" style={{ color: '#F0A0A0' }}>{error}</p>
      )}
      <button type="submit" disabled={status === 'sending'} className="btn-primary px-6 py-3.5 text-[15px] disabled:opacity-60">
        {status === 'sending' ? 'Wird gesendet' : 'Anfrage senden'}
      </button>
      <p className="text-[12px]" style={{ color: 'var(--txf)' }}>
        Wir nutzen Ihre Angaben nur, um Ihnen zu antworten. Mehr dazu in der{' '}
        <a href="/datenschutz" className="underline underline-offset-2">Datenschutzerklärung</a>.
      </p>
    </form>
  );
}
