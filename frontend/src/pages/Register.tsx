import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const API_PORT = import.meta.env.VITE_API_BASE_PORT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}${API_PORT}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erro ao registrar');
      }
      navigate('/'); // volta para login
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Registrar</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Registrar
          </button>
        </form>
        <p className="mt-4 text-center">
          Já tem conta?{' '}
          <Link to="/" className="text-blue-600 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}