'use client';

import { useState } from 'react';

export default function AdminLogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' });
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      // redirect to admin page (will render login form)
      window.location.href = '/admin';
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-slate-900/100 transition"
      aria-label="Wyloguj"
    >
      {loading ? 'Wylogowywanie...' : 'Wyloguj'}
    </button>
  );
}
