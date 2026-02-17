import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SummaryCards from '../components/SummaryCards';
import { ReportSummary } from '../types';

describe('SummaryCards', () => {
  const mockSummary: ReportSummary = {
    total_income: 5000.00,
    total_expense: 2000.00,
    net_balance: 3000.00,
    transaction_count: 10
  };

  it('renders all summary cards correctly', () => {
    render(<SummaryCards summary={mockSummary} />);

    expect(screen.getByText('Total Income')).toBeInTheDocument();
    expect(screen.getByText('Total Expenses')).toBeInTheDocument();
    expect(screen.getByText('Net Balance')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });

  it('displays correct currency values', () => {
    render(<SummaryCards summary={mockSummary} />);

    expect(screen.getByText('$5,000.00')).toBeInTheDocument();
    expect(screen.getByText('$2,000.00')).toBeInTheDocument();
    expect(screen.getByText('$3,000.00')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('handles negative net balance', () => {
    const negativeSummary: ReportSummary = {
      total_income: 1000.00,
      total_expense: 2000.00,
      net_balance: -1000.00,
      transaction_count: 5
    };

    render(<SummaryCards summary={negativeSummary} />);
    expect(screen.getByText('-$1,000.00')).toBeInTheDocument();
  });

  it('handles zero values', () => {
    const zeroSummary: ReportSummary = {
      total_income: 0,
      total_expense: 0,
      net_balance: 0,
      transaction_count: 0
    };

    render(<SummaryCards summary={zeroSummary} />);
    expect(screen.getAllByText('$0.00')).toHaveLength(3);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});