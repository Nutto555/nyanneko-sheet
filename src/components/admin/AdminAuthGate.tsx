import { useState, type ReactNode, type FormEvent } from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface AdminAuthGateProps {
  children: ReactNode;
}

export function AdminAuthGate({ children }: AdminAuthGateProps) {
  const { isAuthenticated, login } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <>{children}</>;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const success = login(password);
    if (!success) {
      setError('Incorrect password');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-24 p-8 rounded-xl border border-slate-700 bg-slate-800/50">
      <h2 className="text-xl font-semibold text-white">Admin Access</h2>
      <p className="text-sm text-gray-400 mt-1 mb-6">
        Enter the admin password to continue
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded text-sm bg-slate-800 border border-slate-700 text-white"
        />

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button
          type="submit"
          className="px-4 py-2 rounded text-sm font-medium bg-amber-600 hover:bg-amber-500 text-white"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
