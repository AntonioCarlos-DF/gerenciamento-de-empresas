import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}:${
        import.meta.env.VITE_API_BASE_PORT
      }/api`
    : "http://localhost:3000/api";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email: email.toLowerCase().trim(),
          password 
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erro ao registrar');
      }
      
      navigate('/');
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-purple-200">
        <h2 className="text-6xl font-black antialiased text-center text-purple-600 py-90 px-50 break-normal"> 
          GERENCIAMENTO E CADASTRO DE EMPRESAS
        </h2>
      </div>
      
      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8 rounded-2xl shadow-lg bg-white">
          <h2 className="text-3xl font-semibold text-center mb-6 text-purple-700">
            Registrar
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-gray-700">Nome</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-gray-700">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-gray-700">
                Confirme sua senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar'}
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
    </div>
  );
}