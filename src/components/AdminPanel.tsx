'use client';

import { useEffect, useState } from 'react';

type PricingItem = {
  id: number;
  keyName: string;
  displayName: string;
  unit: string;
  priceNet: number;
  priceType: string;
};

const defaultPassword = '';

export default function AdminPanel() {
  const [adminPassword, setAdminPassword] = useState(defaultPassword);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [items, setItems] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthorized) {
      fetchPricing();
    }
  }, [isAuthorized]);

  async function fetchPricing() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/pricing', {
        method: 'GET',
        headers: {
          'x-admin-password': adminPassword
        }
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Błąd pobierania cen.');
        setIsAuthorized(false);
      } else {
        setItems(data.items);
      }
    } catch (err) {
      setError('Błąd połączenia z serwerem.');
    } finally {
      setLoading(false);
    }
  }

  async function updateItem(keyName: string, priceNet: number) {
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword
        },
        body: JSON.stringify({ keyName, priceNet })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Nie udało się zapisać zmian.');
      } else {
        setItems((current) =>
          current.map((item) => (item.keyName === keyName ? data.item : item))
        );
        setMessage('Zaktualizowano cenę.');
      }
    } catch (err) {
      setError('Błąd połączenia z serwerem.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsAuthorized(true);
    setMessage('Zalogowano. Pobieranie danych...');
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70">
        <div className="mb-8 rounded-3xl bg-slate-950 px-6 py-6 text-white">
          <h1 className="text-3xl font-semibold">Panel administratora</h1>
          <p className="mt-2 text-sm text-slate-300">Edytuj ceny rynkowe przyłączy oraz parametry wyceny.</p>
        </div>

        <form onSubmit={handleLogin} className="mb-8 grid gap-4 sm:grid-cols-[1fr_auto]">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Hasło administratora</span>
            <input
              type="password"
              value={adminPassword}
              onChange={(event) => setAdminPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
            />
          </label>
          <button
            type="submit"
            className="mt-6 rounded-2xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
          >
            Zaloguj się
          </button>
        </form>

        {error ? <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
        {message ? <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div> : null}

        {isAuthorized ? (
          <div className="mt-6 space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Cennik jednostkowy</h2>
            <div className="grid gap-4">
              {items.map((item) => (
                <div key={item.keyName} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{item.displayName}</p>
                      <p className="text-sm text-slate-500">{item.unit} · {item.priceType}</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={item.priceNet}
                        className="w-32 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none"
                        onBlur={(event) => {
                          const value = Number(event.target.value);
                          if (value > 0 && value !== item.priceNet) {
                            updateItem(item.keyName, value);
                          }
                        }}
                      />
                      <span className="text-sm text-slate-500">zł / {item.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {loading ? <p className="mt-6 text-sm text-slate-500">Trwa ładowanie...</p> : null}
      </div>
    </div>
  );
}
