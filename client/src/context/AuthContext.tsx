import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { setAccessToken } from '../services/api';

interface AuthState {
  accessToken: string | null;
  loading: boolean;
}

type AuthAction =
  | { type: 'SET_TOKEN'; token: string }
  | { type: 'CLEAR' }
  | { type: 'DONE_LOADING' };

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_TOKEN': return { accessToken: action.token, loading: false };
    case 'CLEAR': return { accessToken: null, loading: false };
    case 'DONE_LOADING': return { ...state, loading: false };
  }
}

interface AuthContextValue {
  accessToken: string | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { accessToken: null, loading: true });

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';
    axios.post(`${base}/auth/refresh`, {}, { withCredentials: true })
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        dispatch({ type: 'SET_TOKEN', token: data.accessToken });
      })
      .catch(() => dispatch({ type: 'DONE_LOADING' }));
  }, []);

  function login(token: string) {
    setAccessToken(token);
    dispatch({ type: 'SET_TOKEN', token });
  }

  async function logout() {
    const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';
    await axios.post(`${base}/auth/logout`, {}, { withCredentials: true }).catch(() => {});
    setAccessToken('');
    dispatch({ type: 'CLEAR' });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
