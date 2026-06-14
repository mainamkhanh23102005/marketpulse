import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { vi } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';

vi.mock('../services/api', () => ({ default: {}, setAccessToken: vi.fn() }));
vi.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

function StatusDisplay() {
  const { accessToken, loading } = useAuth();
  if (loading) return <div>Loading</div>;
  return <div>{accessToken ? 'authenticated' : 'unauthenticated'}</div>;
}

describe('AuthContext', () => {
  it('starts loading then resolves unauthenticated when refresh fails', async () => {
    (mockAxios.post as jest.Mock).mockRejectedValueOnce(new Error('no cookie'));
    render(<MemoryRouter><AuthProvider><StatusDisplay /></AuthProvider></MemoryRouter>);
    expect(screen.getByText('Loading')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('unauthenticated')).toBeInTheDocument());
  });

  it('resolves authenticated when refresh succeeds', async () => {
    (mockAxios.post as jest.Mock).mockResolvedValueOnce({ data: { accessToken: 'tok_123' } });
    render(<MemoryRouter><AuthProvider><StatusDisplay /></AuthProvider></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('authenticated')).toBeInTheDocument());
  });
});

describe('ProtectedRoute', () => {
  it('redirects to /login when not authenticated', async () => {
    (mockAxios.post as jest.Mock).mockRejectedValueOnce(new Error('no cookie'));
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><div>secret</div></ProtectedRoute>} />
            <Route path="/login" element={<div>login page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('login page')).toBeInTheDocument());
  });
});
