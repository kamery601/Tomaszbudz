'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type { PricingConfig } from '@/lib/pricing';

interface AdminPricingEditorProps {
  initialPricing: PricingConfig;
  adminName: string;
}

export default function AdminPricingEditor({ initialPricing, adminName }: AdminPricingEditorProps) {
  const [cablePrices, setCablePrices] = useState<Record<string, number>>(
    Object.fromEntries(Object.entries(initialPricing.cables).map(([key, value]) => [key, value.price_net]))
  );
  const [itemPrices, setItemPrices] = useState<Record<string, number>>(
    Object.fromEntries(Object.entries(initialPricing.items).map(([key, value]) => [key, value.price]))
  );
  const [notification, setNotification] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const totalEditable = useMemo(() => {
    const cableSum = Object.values(cablePrices).reduce((sum, value) => sum + value, 0);
    const itemSum = Object.values(itemPrices).reduce((sum, value) => sum + value, 0);
    return cableSum + itemSum;
  }, [cablePrices, itemPrices]);

  const handleCableChange = (key: string, value: string) => {
    setCablePrices((current) => ({ ...current, [key]: Number(value) || 0 }));
  };

  const handleItemChange = (key: string, value: string) => {
    setItemPrices((current) => ({ ...current, [key]: Number(value) || 0 }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotification('');
    setSaving(true);

    try {
      const response = await fetch('/api/admin/update-pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cables: cablePrices, items: itemPrices })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Nie udało się zapisać cen.');
        return;
      }

      setNotification('Ceny zostały zapisane i od razu urealnione.');
    } catch (err) {
      setError('Błąd po stronie serwera. Spróbuj ponownie.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 rounded-3xl bg-slate-950 p-5 text-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Panel Zarządzania Cenami</p>
          <h1 className="mt-2 text-2xl font-semibold">Tomasz Budz Elektro-Podhale</h1>
          <p className="mt-1 text-sm text-slate-300">Zalogowany jako: <span className="font-semibold text-white">{adminName}</span></p>
        </div>
        <div className="rounded-3xl bg-slate-800 px-4 py-3 text-sm text-slate-300">Suma wartości edytowalnych: {totalEditable.toFixed(2)} PLN</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Ceny kabli</h2>
              <p className="text-sm text-slate-500">Edytuj bezpośrednio stawki YAKY i YKY.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(initialPricing.cables).map(([key, item]) => (
              <label key={key} className="grid gap-2 rounded-3xl border border-slate-200 bg-white p-4">
                <span className="text-sm font-medium text-slate-700">{item.name}</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={cablePrices[key]}
                  onChange={(event) => handleCableChange(key, event.target.value)}
                  className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                />
                <span className="text-xs text-slate-500">Cena netto za metr</span>
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Pozostałe stawki i pozycje</h2>
              <p className="text-sm text-slate-500">Wartości robocizny, materiały i szafki ZKP/erbetka.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(initialPricing.items).map(([key, item]) => (
              <label key={key} className="grid gap-2 rounded-3xl border border-slate-200 bg-white p-4">
                <span className="text-sm font-medium text-slate-700">{item.name}</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={itemPrices[key]}
                  onChange={(event) => handleItemChange(key, event.target.value)}
                  className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                />
                <span className="text-xs text-slate-500">Cena netto za {item.unit}</span>
              </label>
            ))}
          </div>
        </section>

        {error && <div className="rounded-3xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {notification && <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notification}</div>}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? 'Zapisywanie...' : 'Zapisz i urealnij ceny'}
          </button>
          <p className="text-xs text-slate-500">Zmiany mają natychmiastowy wpływ na kalkulator po ponownym odświeżeniu strony.</p>
        </div>
      </form>
    </div>
  );
}
