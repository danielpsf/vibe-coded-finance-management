import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionForm from '../components/TransactionForm';
import { TransactionCreate } from '../types';

describe('TransactionForm', () => {
  const mockSubmit = vi.fn();

  it('renders all form fields', () => {
    render(<TransactionForm onSubmit={mockSubmit} />);

    expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onSubmit={mockSubmit} />);

    // Fill in the form
    await user.clear(screen.getByLabelText(/amount/i));
    await user.type(screen.getByLabelText(/amount/i), '100.50');
    
    await user.clear(screen.getByLabelText(/description/i));
    await user.type(screen.getByLabelText(/description/i), 'Test transaction');

    // Select category
    await user.selectOptions(screen.getByLabelText(/category/i), 'Food');

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add transaction/i }));

    // Verify submit was called with correct data
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
      amount: 100.50,
      description: 'Test transaction',
      category: 'Food',
      transaction_type: 'expense'
    }));
  });

  it('validates required fields', () => {
    render(<TransactionForm onSubmit={mockSubmit} />);

    const amountInput = screen.getByLabelText(/amount/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    expect(amountInput).toHaveAttribute('required');
    expect(descriptionInput).toHaveAttribute('required');
  });

  it('resets form after submission when not in edit mode', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onSubmit={mockSubmit} />);

    await user.type(screen.getByLabelText(/description/i), 'Test');
    fireEvent.click(screen.getByRole('button', { name: /add transaction/i }));

    // Form should reset, description should be empty
    expect(screen.getByLabelText(/description/i)).toHaveValue('');
  });

  it('shows update button in edit mode', () => {
    const initialData = {
      date: '2024-01-15',
      amount: 50.00,
      description: 'Existing transaction',
      category: 'Food',
      transaction_type: 'expense' as const
    };

    render(
      <TransactionForm 
        onSubmit={mockSubmit} 
        initialData={initialData}
        isEdit={true}
      />
    );

    expect(screen.getByRole('button', { name: /update transaction/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });
});