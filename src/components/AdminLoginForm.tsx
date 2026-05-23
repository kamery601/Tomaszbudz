'use client';

import { useState, type FormEvent } from 'react';

export default function AdminLoginForm() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ login, password }),
        credentials: 'same-origin'
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.error || 'Błąd logowania. Sprawdź dane i spróbuj ponownie.');
        return;
      }

      window.location.href = '/admin';
    } catch (err) {
      setError('Błąd serwera podczas logowania. Spróbuj ponownie za chwilę.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-12">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-700 bg-slate-900/95 p-8 shadow-xl shadow-black/20">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-amber-300">Panel Administratora</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">Zaloguj się do panelu</h1>
          <p className="mt-2 text-sm text-slate-400">Wprowadź nazwę użytkownika i hasło, aby zarządzać cennikiem Elektro-Podhale.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-300">Login</span>
            <input
              type="text"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              autoComplete="username"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-300">Hasło</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>
      </div>
    </div>
  );
}
