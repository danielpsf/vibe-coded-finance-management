export interface Transaction {
  id: number;
  date: string;
  amount: number;
  description: string;
  category: string;
  transaction_type: 'income' | 'expense';
  created_at?: string;
  updated_at?: string;
}

export interface TransactionCreate {
  date: string;
  amount: number;
  description: string;
  category: string;
  transaction_type: 'income' | 'expense';
}

export interface TransactionUpdate {
  date?: string;
  amount?: number;
  description?: string;
  category?: string;
  transaction_type?: 'income' | 'expense';
}

export interface ReportSummary {
  total_income: number;
  total_expense: number;
  net_balance: number;
  transaction_count: number;
}

export interface MonthlyReport {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryReport {
  category: string;
  total: number;
  count: number;
}