import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import ForgetPasswordForm from '@/app/(auth)/_components/ForgetPasswordForm';
import { handleForgotPassword } from '@/app/actions/auth/forgot-password';
import { forgotPasswordApiResponse } from '@/app/actions/auth/type';

// Mock the module
vi.mock('@/app/actions/auth/forgot-password', () => ({
  handleForgotPassword: vi.fn(),
}));

describe('ForgetPasswordForm', () => {
  // Get the mocked function
  const mockHandleForgotPassword = handleForgotPassword as unknown as ReturnType<typeof vi.fn>;
  const mockSetIsLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetIsLogin.mockClear();
    // Setup fake timers for each test
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore real timers after each test
    vi.useRealTimers();
  });

  it('renders ForgetPasswordForm correctly', () => {
    render(<ForgetPasswordForm setIsLogin={mockSetIsLogin} />);
    expect(screen.getByPlaceholderText('EMAIL')).toBeInTheDocument();
    expect(screen.getByText(/Enter your email, and we will send you a password reset link./i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('button is initially disabled', () => {
    render(<ForgetPasswordForm setIsLogin={mockSetIsLogin} />);
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('enables button when valid email is provided', async () => {
    render(<ForgetPasswordForm setIsLogin={mockSetIsLogin} />);
    const emailInput = screen.getByPlaceholderText('EMAIL');
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(emailInput, { target: { value: 'test@lexaeon.com' } });
    
    // Wait for next tick to process validation
    await act(async () => {
      await Promise.resolve();
    });
    
    // Button should be enabled now
    expect(sendButton).not.toBeDisabled();
  });

  it('validates that email must be a lexaeon.com email', async () => {
    render(<ForgetPasswordForm setIsLogin={mockSetIsLogin} />);
    const emailInput = screen.getByPlaceholderText('EMAIL');
    const sendButton = screen.getByRole('button', { name: /send/i });

    // Enter invalid email (not lexaeon.com)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Wait for next tick to process validation
    await act(async () => {
      await Promise.resolve();
    });
    
    // Button should still be disabled
    expect(sendButton).toBeDisabled();
  });

  it('shows loading state when form is submitted', async () => {
    // Mock a pending promise that doesn't resolve yet
    const pendingPromise = new Promise<forgotPasswordApiResponse>(() => {});
    mockHandleForgotPassword.mockReturnValue(pendingPromise);
    
    render(<ForgetPasswordForm setIsLogin={mockSetIsLogin} />);
    const emailInput = screen.getByPlaceholderText('EMAIL');
    const sendButton = screen.getByRole('button', { name: /send/i });

    // Enter valid email
    fireEvent.change(emailInput, { target: { value: 'test@lexaeon.com' } });
    
    // Wait for validation
    await act(async () => {
      await Promise.resolve();
    });
    
    // Submit form
    await act(async () => {
      fireEvent.click(sendButton);
    });
    
    // Check for loading state
    expect(screen.getByRole('button', { name: /sending/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
  });

  it('shows success message when API call succeeds', async () => {
    // Mock successful response
    mockHandleForgotPassword.mockResolvedValue({ 
      success: true, 
      status: 200,
      statusText: 'OK',
      message: 'Password reset link sent'
    });
    
    const { container } = render(<ForgetPasswordForm setIsLogin={mockSetIsLogin} />);
    const emailInput = screen.getByPlaceholderText('EMAIL');
    const sendButton = screen.getByRole('button', { name: /send/i });

    // Enter valid email
    fireEvent.change(emailInput, { target: { value: 'test@lexaeon.com' } });
    
    // Wait for validation
    await act(async () => {
      await Promise.resolve();
    });
    
    // Submit form
    await act(async () => {
      fireEvent.click(sendButton);
    });
    
    // Check for success message
    expect(container.querySelector('.bg-green-50')).toBeInTheDocument();
    expect(screen.getByText('Password reset link sent')).toBeInTheDocument();
  });

  it('shows error message when API call fails', async () => {
    // Mock failed response
    mockHandleForgotPassword.mockResolvedValue({ 
      success: false, 
      status: 404,
      statusText: 'Not Found', 
      message: 'User not found' 
    });
    
    const { container } = render(<ForgetPasswordForm setIsLogin={mockSetIsLogin} />);
    const emailInput = screen.getByPlaceholderText('EMAIL');
    const sendButton = screen.getByRole('button', { name: /send/i });

    // Enter valid email
    fireEvent.change(emailInput, { target: { value: 'test@lexaeon.com' } });
    
    // Wait for validation
    await act(async () => {
      await Promise.resolve();
    });
    
    // Submit form
    await act(async () => {
      fireEvent.click(sendButton);
    });
    
    // Check for error message
    expect(container.querySelector('.bg-red-50')).toBeInTheDocument();
    expect(screen.getByText('User not found')).toBeInTheDocument();
  });

  it('removes success message after timeout', async () => {
    // Mock successful response
    mockHandleForgotPassword.mockResolvedValue({ 
      success: true, 
      status: 200,
      statusText: 'OK',
      message: 'Password reset link sent' 
    });
    
    const { container } = render(<ForgetPasswordForm setIsLogin={mockSetIsLogin} />);
    const emailInput = screen.getByPlaceholderText('EMAIL');
    const sendButton = screen.getByRole('button', { name: /send/i });

    // Enter valid email
    fireEvent.change(emailInput, { target: { value: 'test@lexaeon.com' } });
    
    // Wait for validation
    await act(async () => {
      await Promise.resolve();
    });
    
    // Submit form
    await act(async () => {
      fireEvent.click(sendButton);
    });
    
    // Verify initial success message is shown
    expect(container.querySelector('.bg-green-50')).toBeInTheDocument();
    expect(screen.getByText('Password reset link sent')).toBeInTheDocument();
    
    // Fast-forward time by 2 seconds - should show "Redirecting to login..."
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    
    // Should now show redirecting message
    expect(screen.getByText('Redirecting to login...')).toBeInTheDocument();
    
    // Fast-forward time by 3 more seconds (5 total) - should complete the flow
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    
    // setIsLogin should have been called
    expect(mockSetIsLogin).toHaveBeenCalledWith(true);
    
    // Fast-forward by 5 more seconds to clear the "Redirecting to login..." message
    // (the setSuccessWithTimeout for "Redirecting to login..." has its own 5-second timeout)
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    
    // Success message should be gone after the timeout
    expect(container.querySelector('.bg-green-50')).not.toBeInTheDocument();
  });
});