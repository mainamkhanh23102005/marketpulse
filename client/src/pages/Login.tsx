import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';
      const { data } = await axios.post(`${base}/auth/login`, { email, password }, { withCredentials: true });
      login(data.accessToken);
      navigate('/dashboard');
    } catch (err) {
      const msg = axios.isAxiosError(err) ? (err.response?.data?.error ?? 'Login failed') : 'Login failed';
      showToast(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-white">Sign in</h1>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          className="bg-surface border border-border rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-400" required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
          className="bg-surface border border-border rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-400" required />
        <button type="submit" disabled={loading}
          className="bg-green-500 hover:bg-green-400 text-black font-semibold py-2 rounded disabled:opacity-50 transition">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-gray-400 text-sm text-center">
          No account? <Link to="/register" className="text-green-400 hover:underline">Register</Link>
        </p>
      </form>
    </div>
  );
}
