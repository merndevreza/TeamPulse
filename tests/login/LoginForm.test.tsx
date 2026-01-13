import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock modules before import
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

vi.mock('@/app/actions/auth/login', () => ({
  handleLogin: vi.fn(),
}));

// Mock AuthContext with explicit named exports
vi.mock('@/app/contexts/AuthContext', () => {
  const mockContext = {
    Provider: ({ children }: { children: React.ReactNode }) => children,
    Consumer: ({ children }: { children: React.ReactNode }) => children
  };
  
  return {
    default: mockContext,
    AuthProvider: ({ children }: { children: React.ReactNode }) => children
  };
});

// Now correctly mock useAuth using the context
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    setUser: vi.fn(),
  }),
}));

// Import after mocks
import LoginForm from '@/app/(auth)/_components/LoginForm';
import { handleLogin } from '@/app/actions/auth/login';

describe('LoginForm', () => {
  // Get mock functions after they have been created by vi.mock
  const mockHandleLogin = handleLogin as unknown as ReturnType<typeof vi.fn>;

  // Create a wrapper for the LoginForm - no need to use AuthProvider since we mocked useAuth
  const renderLoginForm = () => {
    return render(<LoginForm />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders LoginForm correctly', () => {
    renderLoginForm();
    expect(screen.getByPlaceholderText('EMAIL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('PASSWORD')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('button is initially disabled', () => {
    renderLoginForm();
    const loginButton = screen.getByRole('button', { name: /log in/i });
    expect(loginButton).toBeDisabled();
  });

  it('enables button when valid email and password are provided', async () => {
    renderLoginForm();
    const emailInput = screen.getByPlaceholderText('EMAIL');
    const passwordInput = screen.getByPlaceholderText('PASSWORD');
    const loginButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@lexaeon.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

    // Wait for validation to complete
    await waitFor(() => {
      expect(loginButton).not.toBeDisabled();
    });
  });

  it('displays error message when login fails', async () => {
    mockHandleLogin.mockResolvedValueOnce({
      success: false,
      status: 401,
      message: 'Invalid credentials',
    });

    renderLoginForm();
    const emailInput = screen.getByPlaceholderText('EMAIL');
    const passwordInput = screen.getByPlaceholderText('PASSWORD');
    const loginButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@lexaeon.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

    // Wait for validation to complete
    await waitFor(() => {
      expect(loginButton).not.toBeDisabled();
    });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockHandleLogin).toHaveBeenCalledWith({
        email: 'test@lexaeon.com',
        password: 'Password123!',
      });
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('calls handleLogin with correct data on successful login', async () => {
    mockHandleLogin.mockResolvedValueOnce({
      success: true,
      status: 200,
      data: {
        user_id: '123',
        role: 'user',
        access: 'access-token',
        refresh: 'refresh-token',
      },
    });

    renderLoginForm();
    const emailInput = screen.getByPlaceholderText('EMAIL');
    const passwordInput = screen.getByPlaceholderText('PASSWORD');
    const loginButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@lexaeon.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

    // Wait for validation to complete
    await waitFor(() => {
      expect(loginButton).not.toBeDisabled();
    });

    fireEvent.click(loginButton);

    // Just verify handleLogin was called correctly 
    await waitFor(() => {
      expect(mockHandleLogin).toHaveBeenCalledWith({
        email: 'test@lexaeon.com',
        password: 'Password123!',
      });
    });
    
    // We can see from the console output that login was successful
    // The actual navigation happens via Next.js router which is hard to test
  });

  it('shows loading state when form is submitting', async () => {
    // Create a Promise that we can manually resolve later
    let resolvePromise: (value: unknown) => void;
    const loginPromise = new Promise<unknown>((resolve) => {
      resolvePromise = resolve;
    });
    
    mockHandleLogin.mockReturnValueOnce(loginPromise);

    renderLoginForm();
    const emailInput = screen.getByPlaceholderText('EMAIL');
    const passwordInput = screen.getByPlaceholderText('PASSWORD');
    const loginButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@lexaeon.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

    // Wait for validation to complete
    await waitFor(() => {
      expect(loginButton).not.toBeDisabled();
    });

    fireEvent.click(loginButton);

    // Check for loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
    });

    // Resolve the promise to complete the test
    resolvePromise!({
      success: true,
      status: 200,
      data: {
        user_id: '123',
        role: 'user',
        access: 'access-token',
        refresh: 'refresh-token',
      },
    });
  });

  it('handles unexpected errors during login', async () => {
    mockHandleLogin.mockRejectedValueOnce(new Error('Network error'));

    renderLoginForm();
    const emailInput = screen.getByPlaceholderText('EMAIL');
    const passwordInput = screen.getByPlaceholderText('PASSWORD');
    const loginButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@lexaeon.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

    // Wait for validation to complete
    await waitFor(() => {
      expect(loginButton).not.toBeDisabled();
    });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderLoginForm();
    const emailInput = screen.getByPlaceholderText('EMAIL');
    const passwordInput = screen.getByPlaceholderText('PASSWORD');
    const loginButton = screen.getByRole('button', { name: /log in/i });

    // Invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    
    // The button should remain disabled
    expect(loginButton).toBeDisabled();

    // Fix email to be valid
    fireEvent.change(emailInput, { target: { value: 'valid@lexaeon.com' } });
    
    // Now the button should become enabled
    await waitFor(() => {
      expect(loginButton).not.toBeDisabled();
    });
  });

  it('prevents duplicate submission while loading', async () => {
    // Create a promise that we won't resolve during this test
    const loginPromise = new Promise(() => {});
    mockHandleLogin.mockReturnValueOnce(loginPromise);

    renderLoginForm();
    const emailInput = screen.getByPlaceholderText('EMAIL');
    const passwordInput = screen.getByPlaceholderText('PASSWORD');
    const loginButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@lexaeon.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

    // Wait for validation to complete
    await waitFor(() => {
      expect(loginButton).not.toBeDisabled();
    });

    // Click once
    fireEvent.click(loginButton);
    
    // Verify loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
    });

    // Click again
    fireEvent.click(loginButton);
    
    // Verify handleLogin was only called once
    expect(mockHandleLogin).toHaveBeenCalledTimes(1);
  });
});
