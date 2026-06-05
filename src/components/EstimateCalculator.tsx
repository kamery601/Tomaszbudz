'use client';

import { useState } from 'react';
import { calculateMultiEstimate, type EstimateResult, type CableType, type TerrainType, type JobType } from '@/lib/estimate-engine';

const initialData = {
  jobType: 'cable_connection' as JobType,
  length: 20,
  cableType: 'YAKY_4x35' as CableType,
  terrainType: 'earth' as TerrainType,
  depth: 0.7,
  conduitsCount: 0,
  meterBoxOwned: 'yes' as 'yes' | 'no',
  name: '',
  phone: '',
  email: '',
  vatRate: 0.23 as 0.08 | 0.23
};

type FormData = typeof initialData;

const jobLabels: Record<JobType, string> = {
  cable_connection: 'Nowe przyłącze kablowe (od granicy sieci do posesji)',
  move_meter: 'Wyniesienie licznika na zewnątrz budynku',
  overhead_to_cable: 'Przejście z przyłącza napowietrznego na kabel ziemny',
  power_increase: 'Zwiększenie mocy/modernizacja do 3 faz (pompa ciepła, indukcja)',
  building_site: 'Prąd budowlany (Erbetka) na plac budowy'
};

export default function EstimateCalculator() {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const showEarthWorks = ['cable_connection', 'move_meter', 'overhead_to_cable', 'power_increase'].includes(formData.jobType);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);

    try {
      if (!formData.name || !formData.phone) {
        throw new Error('Uzupełnij imię oraz telefon, aby wygenerować kosztorys.');
      }

      if (showEarthWorks) {
        if (Number(formData.length) < 1 || Number(formData.length) > 500) {
          throw new Error('Długość trasy kabla musi mieścić się w zakresie 1–500 m.');
        }

        if (Number(formData.depth) < 0.5 || Number(formData.depth) > 2.0) {
          throw new Error('Głębokość wykopu musi mieścić się w zakresie 0.5–2.0 m.');
        }

        if (Number(formData.conduitsCount) < 0 || Number(formData.conduitsCount) > 20) {
          throw new Error('Łączna długość przepustów (m) musi mieścić się w zakresie 0–20.');
        }
      }

      const calculation = calculateMultiEstimate({
        jobType: formData.jobType,
        length: showEarthWorks ? Number(formData.length) : 0,
        cableType: formData.cableType,
        terrainType: formData.terrainType,
        depth: Number(formData.depth),
        conduitsCount: Number(formData.conduitsCount),
        meterBoxOwned: formData.meterBoxOwned,
        vatRate: formData.vatRate
      });

      setResult(calculation);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Wystąpił błąd podczas obliczeń kosztorysu.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPdf = () => {
    if (!result) return;
    window.print();
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50">
        <div className="mb-8 grid gap-4 rounded-3xl bg-slate-950 p-6 text-white md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Tomasz Budz Elektro-Podhale</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Uniwersalny Asystent Przyłączeniowo-Remontowy</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Wycena orientacyjna prac związanych z przyłączami, licznikami i modernizacjami wykonywanymi zgodnie z wymaganiami TAURON Dystrybucja.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-800 p-5 text-sm leading-6 text-slate-200">
            <p className="font-semibold text-amber-300">Najczęściej realizowane prace</p>
            <ul className="mt-3 space-y-2">
              <li>Wyniesienie licznika na elewację lub ogrodzenie</li>
              <li>Przejście z napowietrznego na kabel ziemny</li>
              <li>Zwiększenie mocy do 3 faz pod pompę ciepła/indukcję</li>
              <li>Prąd budowlany (erbetka) z pomiarami i dokumentacją</li>
            </ul>
          </div>
        </div>

        <form noValidate onSubmit={handleSubmit} className="space-y-6 print:hidden">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6 rounded-3xl border border-slate-200 p-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">1. Wybierz zakres zadania</h2>
                <p className="mt-1 text-sm text-slate-500">Zaznacz, jaką orientacyjną wycenę chcesz przygotować dla prac realizowanych zgodnie z wymaganiami TAURON.</p>
              </div>
              <select
                value={formData.jobType}
                onChange={(event) => setFormData({
                  ...formData,
                  jobType: event.target.value as JobType,
                  length: ['power_increase', 'building_site'].includes(event.target.value) ? 0 : formData.length
                })}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
              >
                <option value="cable_connection">Nowe przyłącze kablowe (sieć do granicy działki)</option>
                <option value="move_meter">Wyniesienie licznika na zewnątrz budynku</option>
                <option value="overhead_to_cable">Przejście z napowietrznego na kablowe ziemne</option>
                <option value="power_increase">Zwiększenie mocy / 3 fazy (pompa ciepła, indukcja)</option>
                <option value="building_site">Prąd budowlany (Erbetka na plac budowy)</option>
              </select>
              <p className="text-sm text-slate-500">Wybrany typ pracy: <span className="font-semibold text-slate-900">{jobLabels[formData.jobType]}</span></p>
            </div>

            <div className="space-y-6 rounded-3xl border border-slate-200 p-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">2. Dane inwestora</h2>
                <p className="mt-1 text-sm text-slate-500">Imię, telefon i e-mail do kontaktu oraz przesłania wyceny.</p>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Imię i nazwisko / firma</span>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Telefon</span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Stawka VAT</span>
                <select
                  value={formData.vatRate}
                  onChange={(event) => setFormData({ ...formData, vatRate: Number(event.target.value) as 0.08 | 0.23 })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                >
                  <option value={0.23}>23% — standardowo / firmy / pozostałe przypadki</option>
                  <option value={0.08}>8% — budownictwo mieszkaniowe, jeśli kwalifikuje się podatkowo</option>
                </select>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Stawka 8% może mieć zastosowanie wyłącznie dla kwalifikujących się robót w budownictwie mieszkaniowym; ostateczną stawkę potwierdza wykonawca przed fakturą.
                </p>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">E-mail</span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                />
              </label>
            </div>
          </div>

          {showEarthWorks && (
            <div className="space-y-6 rounded-3xl border border-slate-200 p-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">3. Szczegóły trasy kablowej</h2>
                <p className="mt-1 text-sm text-slate-500">Wprowadź informacje o trasie, jeśli zadanie obejmuje kabel ziemny.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Długość trasy kabla (m)</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.length}
                    onChange={(event) => setFormData({ ...formData, length: Number(event.target.value) })}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Łączna długość przepustów (m)</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.conduitsCount}
                    onChange={(event) => setFormData({ ...formData, conduitsCount: Number(event.target.value) })}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Rodzaj kabla</span>
                  <select
                    value={formData.cableType}
                    onChange={(event) => setFormData({ ...formData, cableType: event.target.value as CableType })}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                  >
                    <option value="YAKY_4x35">YAKY 4x35 mm² (Aluminium - standardowy przydział sieci)</option>
                    <option value="YAKY_4x50">YAKY 4x50 mm² (Aluminium - większa moc)</option>
                    <option value="YAKXS_4x70">YAKXS 4x70 mm² (Aluminium - większe moce / pensjonat / usługi)</option>
                    <option value="YAKXS_4x120">YAKXS 4x120 mm² (Aluminium - większy obiekt usługowy)</option>
                    <option value="YAKXS_4x240">YAKXS 4x240 mm² (Aluminium - duża moc / wyciąg / większy obiekt)</option>
                    <option value="YKY_5x10">YKY 5x10 mm² (Miedź - WLZ do domu)</option>
                    <option value="YKY_5x16">YKY 5x16 mm² (Miedź - WLZ pod pompę ciepła)</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Czy posiadasz własną skrzynkę licznikową?</span>
                  <select
                    value={formData.meterBoxOwned}
                    onChange={(event) => setFormData({ ...formData, meterBoxOwned: event.target.value as 'yes' | 'no' })}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                  >
                    <option value="yes">Tak, posiadam własną skrzynkę</option>
                    <option value="no">Nie, potrzebna nowa skrzynka</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Rodzaj terenu</span>
                  <select
                    value={formData.terrainType}
                    onChange={(event) => setFormData({ ...formData, terrainType: event.target.value as TerrainType })}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                  >
                    <option value="earth">Ziemia (nieutwardzony)</option>
                    <option value="roots">Ziemia utrudniona (korzenie, skarpa)</option>
                    <option value="paving">Kostka brukowa</option>
                    <option value="asphalt">Asfalt</option>
                    <option value="difficult">Kamienie / Podhale</option>
                    <option value="rock">Skała wymagająca kucia</option>
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Głębokość wykopu (m)</span>
                <input
                  type="number"
                  min="0.3"
                  step="0.1"
                  value={formData.depth}
                  onChange={(event) => setFormData({ ...formData, depth: Number(event.target.value) })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                />
              </label>
            </div>
          )}

          <div className="text-right print:hidden">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? 'Obliczanie...' : 'Wygeneruj orientacyjną wycenę'}
            </button>
          </div>
        </form>

        {error && <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 print:hidden">{error}</div>}

        {result && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Orientacyjna wycena prac elektroinstalacyjnych</h2>
                <p className="mt-1 text-sm text-slate-600">Szacunkowy koszt realizacji zadania przed wizją lokalną i weryfikacją dokumentów TAURON.</p>
                <p className="mt-2 text-sm font-medium text-slate-700">Skrzynka licznikowa: {formData.meterBoxOwned === 'yes' ? 'własna' : 'do realizacji'}</p>
              </div>
              <div className="rounded-3xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                VAT {(formData.vatRate * 100).toFixed(0)}%
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
              {result.items.map((item) => (
                <div key={item.name} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.qty} {item.unit}</p>
                    </div>
                    <p className="text-right text-sm text-slate-700">{item.totalNet.toLocaleString('pl-PL')} PLN</p>
                  </div>
                  <div className="mt-3 text-sm text-slate-500">Cena netto: {item.priceNet.toFixed(2)} PLN / {item.unit}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>Suma netto pozycji</span>
                <span>{result.summary.subTotalNet.toLocaleString('pl-PL')} PLN</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 pt-2">
                <span>Narzut firmy (15%)</span>
                <span>{result.summary.markup.toLocaleString('pl-PL')} PLN</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 pt-2 font-semibold">
                <span>Wartość netto ogółem</span>
                <span>{result.summary.totalNet.toLocaleString('pl-PL')} PLN</span>
              </div>
              <div className="flex justify-between pt-2">
                <span>Podatek VAT</span>
                <span>{result.summary.vat.toLocaleString('pl-PL')} PLN</span>
              </div>
              <div className="flex justify-between pt-4 text-lg font-semibold text-emerald-700">
                <span>Orientacyjna kwota brutto</span>
                <span>{result.summary.totalBrutto.toLocaleString('pl-PL')} PLN</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
              <button
                type="button"
                onClick={handlePrintPdf}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Pobierz / Drukuj kosztorys PDF
              </button>
              <p className="text-xs italic text-slate-500">
                *Kalkulacja orientacyjna. Ostateczna wycena wymaga wizji lokalnej i weryfikacji dokumentów TAURON.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
