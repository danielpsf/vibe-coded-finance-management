import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionList from '../components/TransactionList';
import { Transaction } from '../types';

describe('TransactionList', () => {
  const mockTransactions: Transaction[] = [
    {
      id: 1,
      date: '2024-01-15',
      amount: 100.00,
      description: 'Grocery shopping',
      category: 'Food',
      transaction_type: 'expense'
    },
    {
      id: 2,
      date: '2024-01-16',
      amount: 3000.00,
      description: 'Monthly salary',
      category: 'Salary',
      transaction_type: 'income'
    }
  ];

  const mockDelete = vi.fn();
  const mockUpdate = vi.fn();

  it('renders transaction list correctly', () => {
    render(
      <TransactionList 
        transactions={mockTransactions}
        onDelete={mockDelete}
        onUpdate={mockUpdate}
      />
    );

    expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
    expect(screen.getByText('Monthly salary')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Salary')).toBeInTheDocument();
  });

  it('displays correct amount formatting', () => {
    render(
      <TransactionList 
        transactions={mockTransactions}
        onDelete={mockDelete}
        onUpdate={mockUpdate}
      />
    );

    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('$3,000.00')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    window.confirm = vi.fn(() => true);
    
    render(
      <TransactionList 
        transactions={mockTransactions}
        onDelete={mockDelete}
        onUpdate={mockUpdate}
      />
    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    expect(mockDelete).toHaveBeenCalledWith(1);
  });

  it('calls onUpdate when edit button is clicked', async () => {
    render(
      <TransactionList 
        transactions={mockTransactions}
        onDelete={mockDelete}
        onUpdate={mockUpdate}
      />
    );

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    // Edit form should appear
    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
  });

  it('renders empty state when no transactions', () => {
    render(
      <TransactionList 
        transactions={[]}
        onDelete={mockDelete}
        onUpdate={mockUpdate}
      />
    );

    expect(screen.queryByText('Grocery shopping')).not.toBeInTheDocument();
  });
});