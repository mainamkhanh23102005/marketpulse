import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { accessToken, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
      <Link to="/dashboard" className="text-xl font-bold text-white tracking-tight">
        Market<span className="text-green-400">Pulse</span>
      </Link>
      {accessToken && (
        <div className="flex gap-4 items-center text-sm">
          <Link to="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
          <Link to="/settings" className="text-gray-300 hover:text-white">Watchlist</Link>
          <button onClick={handleLogout} className="text-red-400 hover:text-red-300">Logout</button>
        </div>
      )}
    </nav>
  );
}
