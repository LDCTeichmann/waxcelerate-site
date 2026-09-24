// ─── /partner/konditionen: Partnerbereich mit Code-Login ─────────────────────
// Die Konditionen kommen ausschliesslich von /api/partner-access (nur mit
// gueltigem Cookie). Nichts davon steht im Bundle. Diese Seite ist noindex
// (Meta hier, Header in vercel.json) und in keiner Sitemap.

import { useEffect, useState, type FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { trackPartnerCodeOk, trackPartnerCta } from '@/lib/analytics';
import { PARTNER_PATH, whatsappLink } from '@/pages/partner/content';

interface Section {
  id: string;
  title: string;
  note?: string;
  table?: { head: string[]; rows: string[][] };
  items?: string[];
}
interface Access { shop: string; city: string; country: 'DE' | 'AT'; sections: Section[] }
type State = { kind: 'loading' } | { kind: 'locked'; message?: string } | { kind: 'open'; data: Access } | { kind: 'down' };

async function readAccess(res: Response): Promise<Access | null> {
  if (!res.ok) return null;
  const j = (await res.json()) as Access & { ok?: boolean };
  return j.sections ? j : null;
}

export function PartnerAreaPage() {
  const [params] = useSearchParams();
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [code, setCode] = useState(() => (params.get('c') ?? '').toUpperCase());
  const [busy, setBusy] = useState(false);

  // Einen per Link mitgegebenen Code (?c=) nur vorbefuellen und danach aus der Adresszeile nehmen,
  // damit er nicht im Verlauf oder in geteilten Links stehen bleibt.
  useEffect(() => {
    if (params.has('c')) window.history.replaceState(null, '', window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // index.html liefert eine statische "index, follow"-Meta und einen Canonical auf die Startseite.
  // Auf dieser Seite gehoert beides weg (noindex kommt zusaetzlich als Header aus vercel.json).
  useEffect(() => {
    document.querySelectorAll('meta[name="robots"][content^="index"], link[rel="canonical"]').forEach((el) => el.remove());
  }, []);

  useEffect(() => {
    let alive = true;
    fetch('/api/partner-access')
      .then(async (res) => {
        if (!alive) return;
        if (res.status === 503) return setState({ kind: 'down' });
        const data = await readAccess(res);
        setState(data ? { kind: 'open', data } : { kind: 'locked' });
      })
      .catch(() => alive && setState({ kind: 'down' }));
    return () => { alive = false; };
  }, []);

  async function login(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/partner-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (res.status === 503) return setState({ kind: 'down' });
      if (res.status === 429) return setState({ kind: 'locked', message: 'Zu viele Versuche. Bitte versuchen Sie es in 15 Minuten erneut.' });
      const data = await readAccess(res);
      if (data) {
        trackPartnerCodeOk();
        setState({ kind: 'open', data });
      } else {
        setState({ kind: 'locked', message: 'Dieser Code passt nicht. Bitte prüfen Sie die Schreibweise oder fragen Sie bei uns nach.' });
      }
    } catch {
      setState({ kind: 'down' });
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch('/api/partner-access', { method: 'DELETE' }).catch(() => undefined);
    setCode('');
    setState({ kind: 'locked' });
  }

  const wa = whatsappLink(null);

  return (
    <>
      <Helmet>
        <title>Partnerbereich | Waxcelerate</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen" style={{ background: 'var(--pg)' }}>
        <Navigation />
        <main id="main-content" style={{ color: 'var(--tx1)' }} className="pb-24 pt-32">
          <div className="wx-frame max-w-[860px]">
            <Link to={PARTNER_PATH} className="back-pill mb-8">
              <ArrowLeft className="h-4 w-4" aria-hidden /> Zur Partnerseite
            </Link>

            {state.kind === 'loading' && <p style={{ color: 'var(--tx2)' }}>Wird geladen</p>}

            {state.kind === 'down' && (
              <div>
                <h1 className="section-title">Gerade nicht erreichbar.</h1>
                <p className="mt-4" style={{ color: 'var(--tx2)' }}>Der Partnerbereich antwortet im Moment nicht. Schreiben Sie uns bitte kurz, wir schicken Ihnen die Konditionen direkt.</p>
                <a href={wa} target="_blank" rel="noopener noreferrer" onClick={() => trackPartnerCta('whatsapp')} className="btn-primary mt-6 px-6 py-3.5 text-[15px]">
                  <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
                </a>
              </div>
            )}

            {state.kind === 'locked' && (
              <div>
                <p className="eyebrow mb-4">Partnerbereich</p>
                <h1 className="section-title">Konditionen für Partner.</h1>
                <p className="mt-4 max-w-[52ch]" style={{ color: 'var(--tx2)' }}>
                  Staffelpreise, Rewax-Konditionen und Lieferregeln sehen Sie hier mit Ihrem persönlichen Code. Noch keinen? Schreiben Sie uns, wir melden uns am selben Tag.
                </p>
                <form onSubmit={login} className="mt-8 max-w-[420px] space-y-3" noValidate>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px]" style={{ color: 'var(--tx2)' }}>Partner-Code</span>
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="WX-XXXX-XXXX-XXXX"
                      autoComplete="off"
                      autoCapitalize="characters"
                      spellCheck={false}
                      className="spec-data w-full rounded-lg border bg-transparent px-3.5 py-3 text-[16px] tracking-wider outline-none focus:border-[var(--tx2)]"
                      style={{ borderColor: 'var(--bd)', color: 'var(--tx1)' }}
                    />
                  </label>
                  {state.message && <p role="alert" className="text-[14px]" style={{ color: 'var(--danger)' }}>{state.message}</p>}
                  <button type="submit" disabled={busy || code.length < 8} className="btn-primary px-6 py-3.5 text-[15px] disabled:opacity-60">
                    {busy ? 'Wird geprüft' : 'Konditionen öffnen'}
                  </button>
                </form>
              </div>
            )}

            {state.kind === 'open' && (
              <div>
                <p className="eyebrow mb-4">Partnerbereich · {state.data.shop}, {state.data.city}</p>
                <h1 className="section-title">Ihre Konditionen.</h1>
                <p className="mt-4 max-w-[56ch] text-[15px]" style={{ color: 'var(--tx2)' }}>
                  Bitte nicht weitergeben. Alle Endkundenpreise sind unverbindliche Empfehlungen, Ihre Preise bestimmen Sie.
                </p>

                <div className="mt-12 space-y-14">
                  {state.data.sections.map((s) => (
                    <section key={s.id} aria-labelledby={`c-${s.id}`}>
                      <h2 id={`c-${s.id}`} className="text-[22px] leading-snug" style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700 }}>
                        {s.title}
                      </h2>
                      {s.note && <p className="mt-2 max-w-[64ch] text-[13px] leading-relaxed" style={{ color: 'var(--txf)' }}>{s.note}</p>}
                      {s.table && (
                        <div className="mt-4 overflow-x-auto">
                          <table className="w-full min-w-[300px] border-collapse text-left text-[15px]">
                            <thead>
                              <tr>{s.table.head.map((h) => <th key={h} scope="col" className="eyebrow border-b py-2.5 pr-4 font-semibold" style={{ borderColor: 'var(--bd)' }}>{h}</th>)}</tr>
                            </thead>
                            <tbody>
                              {s.table.rows.map((r, i) => (
                                <tr key={i}>
                                  {r.map((c, j) => (
                                    <td key={j} className={`border-b py-3 pr-4 ${j > 0 ? 'whitespace-nowrap' : ''}`} style={{ borderColor: 'var(--bd)' }}><span className={j > 0 ? 'num font-semibold' : ''}>{c}</span></td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {s.items && (
                        <ul className="mt-4 space-y-2.5">
                          {s.items.map((t) => (
                            <li key={t} className="flex gap-3 text-[15px] leading-relaxed" style={{ color: 'var(--tx2)' }}><span aria-hidden style={{ color: 'var(--txf)' }}>·</span><span>{t}</span></li>
                          ))}
                        </ul>
                      )}
                    </section>
                  ))}
                </div>

                <div className="mt-16 flex flex-wrap items-center gap-4 border-t pt-8" style={{ borderColor: 'var(--bd)' }}>
                  <a href={whatsappLink(null)} target="_blank" rel="noopener noreferrer" onClick={() => trackPartnerCta('whatsapp')} className="btn-primary px-6 py-3.5 text-[15px]">
                    <MessageCircle className="h-4 w-4" aria-hidden /> Bestellen oder nachfragen
                  </a>
                  <button type="button" onClick={logout} className="btn-ghost px-5 py-3 text-[14px]">Abmelden</button>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
