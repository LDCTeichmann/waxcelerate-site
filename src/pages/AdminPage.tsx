/**
 * /admin — Stock management page (password-protected)
 *
 * Reads and writes stock levels via /api/admin.
 * Stock -1 = unlimited, 0 = sold out, >0 = units available.
 */

import { useState, useEffect, useCallback } from 'react';
import { Lock, RefreshCw, CheckCircle, AlertCircle, Package } from 'lucide-react';

interface StockItem {
  id: string;
  title: string;
  price: number;
  stock: number;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({});

  const fetchStock = useCallback(async (pw: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin?password=${encodeURIComponent(pw)}`);
      if (res.status === 401) {
        setError('Wrong password');
        setAuthed(false);
        return;
      }
      if (!res.ok) throw new Error('Server error');
      const data = await res.json() as {
        stock: Record<string, number>;
        catalog: Record<string, { title: string; price: number }>;
      };
      setItems(
        Object.entries(data.catalog).map(([id, { title, price }]) => ({
          id,
          title,
          price,
          stock: data.stock[id] ?? -1,
        }))
      );
      setAuthed(true);
    } catch {
      setError('Failed to load stock');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchStock(password);
  };

  const updateStock = async (id: string, stock: number) => {
    setSaveState((s) => ({ ...s, [id]: 'saving' }));
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, stock, password }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, stock } : item));
      setSaveState((s) => ({ ...s, [id]: 'saved' }));
      setTimeout(() => setSaveState((s) => ({ ...s, [id]: 'idle' })), 2000);
    } catch {
      setSaveState((s) => ({ ...s, [id]: 'error' }));
      setTimeout(() => setSaveState((s) => ({ ...s, [id]: 'idle' })), 3000);
    }
  };

  // Keep draft values separate from saved stock
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    const init: Record<string, string> = {};
    items.forEach((item) => {
      if (!(item.id in drafts)) init[item.id] = String(item.stock);
    });
    if (Object.keys(init).length) setDrafts((d) => ({ ...init, ...d }));
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

  const stockLabel = (stock: number) => {
    if (stock === -1) return { text: 'Unlimited', color: '#8896B0' };
    if (stock === 0) return { text: 'Out of stock', color: '#f87171' };
    if (stock <= 5) return { text: `Low: ${stock}`, color: '#f59e0b' };
    return { text: `In stock: ${stock}`, color: '#4ade80' };
  };

  if (!authed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'var(--pg)' }}
      >
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-4 p-8 rounded-2xl"
          style={{ background: '#141414', border: '1px solid var(--bd)' }}
        >
          <div className="flex items-center gap-2.5 mb-6">
            <Lock className="h-5 w-5 text-wx-txf" />
            <h1 className="text-lg font-semibold text-wx-tx1">Admin — Stock Management</h1>
          </div>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm text-wx-tx1 outline-none"
            style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}
            autoFocus
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-2.5 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: '#4A6AEE' }}
          >
            {loading ? 'Loading…' : 'Sign in'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 py-10"
      style={{ background: 'var(--pg)' }}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Package className="h-5 w-5 text-wx-txf" />
            <h1 className="text-lg font-semibold text-wx-tx1">Stock Management</h1>
          </div>
          <button
            onClick={() => void fetchStock(password)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-wx-tx2 hover:text-wx-tx1 transition-colors disabled:opacity-50"
            style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <p className="text-xs text-wx-txf leading-relaxed">
          Set stock to <code className="text-wx-tx2">-1</code> for unlimited,{' '}
          <code className="text-wx-tx2">0</code> to mark as sold out, or a positive number to
          track exact units. Changes take effect immediately.
        </p>

        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => {
            const draft = drafts[item.id] ?? String(item.stock);
            const draftNum = parseInt(draft, 10);
            const isDirty = !isNaN(draftNum) && draftNum !== item.stock;
            const label = stockLabel(item.stock);
            const state = saveState[item.id] ?? 'idle';

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl space-y-3"
                style={{ background: '#141414', border: '1px solid var(--bd)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-wx-tx1">{item.title}</p>
                    <p className="text-xs text-wx-txf mt-0.5">€{item.price.toFixed(2)} · {item.id}</p>
                  </div>
                  <span className="text-xs font-medium flex-shrink-0" style={{ color: label.color }}>
                    {label.text}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={-1}
                    value={draft}
                    onChange={(e) => setDrafts((d) => ({ ...d, [item.id]: e.target.value }))}
                    className="w-24 px-3 py-2 rounded-lg text-sm text-wx-tx1 tabular-nums outline-none"
                    style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}
                  />

                  <button
                    onClick={() => {
                      if (!isNaN(draftNum) && draftNum >= -1) {
                        void updateStock(item.id, draftNum);
                      }
                    }}
                    disabled={!isDirty || isNaN(draftNum) || draftNum < -1 || state === 'saving'}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
                    style={{ background: '#4A6AEE' }}
                  >
                    {state === 'saving' ? 'Saving…' : 'Save'}
                  </button>

                  {state === 'saved' && <CheckCircle className="h-4 w-4 text-green-400" />}
                  {state === 'error' && <AlertCircle className="h-4 w-4 text-red-400" />}
                </div>

                {/* Quick presets */}
                <div className="flex gap-1.5">
                  {[-1, 0, 5, 10, 20, 50].map((v) => (
                    <button
                      key={v}
                      onClick={() => setDrafts((d) => ({ ...d, [item.id]: String(v) }))}
                      className="px-2 py-0.5 rounded text-[11px] text-wx-txf hover:text-wx-tx1 transition-colors"
                      style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}
                    >
                      {v === -1 ? '∞' : v}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
