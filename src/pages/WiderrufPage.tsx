import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

// § 356a BGB, in force since 19.06.2026: B2C distance contracts with a
// statutory right of withdrawal need an electronic withdrawal function —
// a clearly reachable button, a form asking only for contract ID + a
// contact method (never a reason), and a receipt confirmation. This page
// and api/widerruf.ts are that function.
export function WiderrufPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [product, setProduct] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const inputClass = 'w-full px-4 py-2.5 rounded-xl text-sm text-wx-tx1 outline-none';
  const inputStyle = { background: 'var(--sf2)', border: '1px solid var(--bd2)' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/widerruf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, orderDate, product, email }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? 'Der Widerruf konnte nicht übermittelt werden.');
      }
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Der Widerruf konnte nicht übermittelt werden.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Vertrag widerrufen | Waxcelerate</title>
      </Helmet>
      <div className="bg-wx-bg min-h-screen py-20">
        <div className="max-w-2xl mx-auto px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-wx-tx2 hover:text-wx-tx1 transition-colors mb-10"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Link>

          <h1 className="text-3xl font-bold text-wx-tx1 mb-4">Vertrag widerrufen</h1>
          <p className="text-wx-tx2 leading-relaxed mb-8">
            Du hast das Recht, deinen Vertrag innerhalb von 14 Tagen ohne Angabe von Gründen zu
            widerrufen. Details dazu stehen in der{' '}
            <Link to="/widerrufsbelehrung" className="text-[var(--accent)] hover:underline">
              Widerrufsbelehrung
            </Link>
            . Für den Widerruf selbst brauchen wir nur die Angaben unten — keinen Grund.
          </p>

          {status === 'done' ? (
            <div
              className="flex items-start gap-3 rounded-xl p-5"
              style={{ background: 'var(--accent-wash)', border: '1px solid rgba(var(--accent-rgb),0.25)' }}
            >
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
              <p className="text-sm leading-relaxed" style={{ color: 'var(--tx1)' }}>
                Dein Widerruf ist eingegangen. Du erhältst in Kürze eine Bestätigung per E-Mail an{' '}
                <strong>{email}</strong> mit den weiteren Schritten zur Rücksendung und Erstattung.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium text-wx-tx2 mb-1.5">
                  Bestellnummer
                </label>
                <input
                  id="orderNumber"
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="orderDate" className="block text-sm font-medium text-wx-tx2 mb-1.5">
                  Bestelldatum
                </label>
                <input
                  id="orderDate"
                  type="date"
                  required
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="product" className="block text-sm font-medium text-wx-tx2 mb-1.5">
                  Produkt
                </label>
                <input
                  id="product"
                  type="text"
                  required
                  placeholder="z. B. Kettenwachs 500g — Classic"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-wx-tx2 mb-1.5">
                  E-Mail für die Eingangsbestätigung
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              {error && <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
              >
                {status === 'sending' ? 'Wird gesendet …' : 'Widerruf bestätigen'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
