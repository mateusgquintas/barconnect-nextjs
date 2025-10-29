import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DebugPageWrapper from '@/components/DebugPageWrapper';

// Mock next/navigation router
const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock })
}));

// Helper to mock useAuth from contexts/AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

import { useAuth } from '@/contexts/AuthContext';

describe('DebugPageWrapper', () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  it('redirects to home and shows auth checking when unauthenticated', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    render(
      <DebugPageWrapper title="Debug Page">
        <div>child content</div>
      </DebugPageWrapper>
    );

    expect(screen.getByText(/Verificando autenticação/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/');
    });
  });

  it('renders children when authenticated and does not redirect', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', name: 'Admin', username: 'admin', password: 'x', role: 'admin' }
    });

    render(
      <DebugPageWrapper title="Debug Page">
        <div>child content</div>
      </DebugPageWrapper>
    );

    expect(screen.getByText('child content')).toBeInTheDocument();
    expect(screen.getByText(/Página de Debug\/Admin/i)).toBeInTheDocument();
    expect(screen.getByText(/Debug Page/i)).toBeInTheDocument();

    expect(pushMock).not.toHaveBeenCalled();
  });
});
