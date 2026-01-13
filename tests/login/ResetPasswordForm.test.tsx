import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRouter } from 'next/navigation';
import ResetPasswordForm from '@/app/reset-password/_components/ResetPasswordForm';
import { resetPassword } from '@/app/actions/auth/reset-password';

// Mock modules
vi.mock('next/navigation', () => ({
   useRouter: vi.fn(() => ({
      push: vi.fn(),
   })),
}));

vi.mock('@/app/actions/auth/reset-password', () => ({
   resetPassword: vi.fn(),
}));

describe('ResetPasswordForm', () => {
   // Get the mocked function
   const mockResetPassword = resetPassword as unknown as ReturnType<typeof vi.fn>;
   const mockRouter = { push: vi.fn() };

   beforeEach(() => {
      vi.clearAllMocks();
      // Mock useRouter implementation
      (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
   });

   it('button is initially disabled', () => {
      render(<ResetPasswordForm email="test@lexaeon.com" token="valid-token" />);
      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
   });

   it('enables button when passwords are valid and matching', async () => {
      render(<ResetPasswordForm email="test@lexaeon.com" token="valid-token" />);
      
      const newPasswordWrapper = screen.getByTestId('new-password-wrapper');
      const confirmPasswordWrapper = screen.getByTestId('confirm-password-wrapper');
      const newPasswordInput = within(newPasswordWrapper).getByLabelText(/new password/i);
      const confirmPasswordInput = within(confirmPasswordWrapper).getByLabelText(/repeat new password/i);
      const saveButton = screen.getByRole('button', { name: /save/i });

      // Enter valid matching passwords (satisfying all criteria)
      fireEvent.change(newPasswordInput, { target: { value: 'StrongPass1!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPass1!' } });

      // Wait for validation to complete
      await waitFor(() => {
         expect(saveButton).not.toBeDisabled();
      });
   });

   it('keeps button disabled when passwords do not match', async () => {
      render(<ResetPasswordForm email="test@lexaeon.com" token="valid-token" />);
      
      const newPasswordWrapper = screen.getByTestId('new-password-wrapper');
      const confirmPasswordWrapper = screen.getByTestId('confirm-password-wrapper');
      const newPasswordInput = within(newPasswordWrapper).getByLabelText(/new password/i);
      const confirmPasswordInput = within(confirmPasswordWrapper).getByLabelText(/repeat new password/i);
      const saveButton = screen.getByRole('button', { name: /save/i });

      // Enter valid but non-matching passwords
      fireEvent.change(newPasswordInput, { target: { value: 'StrongPass1!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPass2!' } });

      // Verify button remains disabled with non-matching passwords
      expect(saveButton).toBeDisabled();
   });

   it('keeps button disabled when password does not meet complexity requirements', async () => {
      render(<ResetPasswordForm email="test@lexaeon.com" token="valid-token" />);
      
      const newPasswordWrapper = screen.getByTestId('new-password-wrapper');
      const confirmPasswordWrapper = screen.getByTestId('confirm-password-wrapper');
      const newPasswordInput = within(newPasswordWrapper).getByLabelText(/new password/i);
      const confirmPasswordInput = within(confirmPasswordWrapper).getByLabelText(/repeat new password/i);
      const saveButton = screen.getByRole('button', { name: /save/i });

      // Enter weak but matching passwords
      fireEvent.change(newPasswordInput, { target: { value: 'weak' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'weak' } });

      // Verify button remains disabled with weak passwords
      expect(saveButton).toBeDisabled();
   });

   it('calls resetPassword action with correct data on form submission', async () => {
      // Mock successful response
      mockResetPassword.mockResolvedValueOnce({
         success: true,
         message: 'Password reset successfully!'
      });

      render(<ResetPasswordForm email="test@lexaeon.com" token="valid-token" />);
      
      const newPasswordWrapper = screen.getByTestId('new-password-wrapper');
      const confirmPasswordWrapper = screen.getByTestId('confirm-password-wrapper');
      const newPasswordInput = within(newPasswordWrapper).getByLabelText(/new password/i);
      const confirmPasswordInput = within(confirmPasswordWrapper).getByLabelText(/repeat new password/i);
      const saveButton = screen.getByRole('button', { name: /save/i });

      // Enter valid matching passwords
      fireEvent.change(newPasswordInput, { target: { value: 'StrongPass1!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPass1!' } });

      // Wait for button to be enabled
      await waitFor(() => {
         expect(saveButton).not.toBeDisabled();
      });

      // Submit the form by clicking the save button
      fireEvent.click(saveButton);

      // Verify form data and parameters are passed correctly
      await waitFor(() => {
         expect(mockResetPassword).toHaveBeenCalledTimes(1);
         
         // Check that FormData was passed along with token and email
         const formDataArg = mockResetPassword.mock.calls[0][0];
         const tokenArg = mockResetPassword.mock.calls[0][1];
         const emailArg = mockResetPassword.mock.calls[0][2];
         
         expect(formDataArg).toBeInstanceOf(FormData);
         expect(tokenArg).toBe('valid-token');
         expect(emailArg).toBe('test@lexaeon.com');
      });
   }); 
   
   it('shows error message when API returns error', async () => {
      // Mock failed response
      mockResetPassword.mockResolvedValueOnce({
         success: false,
         message: 'Invalid token'
      });

      render(<ResetPasswordForm email="test@lexaeon.com" token="valid-token" />);
      
      const newPasswordWrapper = screen.getByTestId('new-password-wrapper');
      const confirmPasswordWrapper = screen.getByTestId('confirm-password-wrapper');
      const newPasswordInput = within(newPasswordWrapper).getByLabelText(/new password/i);
      const confirmPasswordInput = within(confirmPasswordWrapper).getByLabelText(/repeat new password/i);
      const form = screen.getByRole('form');

      // Enter valid matching passwords
      fireEvent.change(newPasswordInput, { target: { value: 'StrongPass1!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPass1!' } });

      // Submit the form
      fireEvent.submit(form);

      // Verify error message appears
      await waitFor(() => {
         expect(screen.getByText(/invalid token/i)).toBeInTheDocument();
      });
   });
});
