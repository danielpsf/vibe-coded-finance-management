import axios from 'axios';
import { Transaction, TransactionCreate, TransactionUpdate, ReportSummary, MonthlyReport, CategoryReport } from '../types';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const transactionApi = {
  getAll: async (params?: { 
    skip?: number; 
    limit?: number; 
    start_date?: string; 
    end_date?: string;
    category?: string;
    transaction_type?: string;
  }): Promise<Transaction[]> => {
    const response = await api.get('/transactions/', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Transaction> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  create: async (data: TransactionCreate): Promise<Transaction> => {
    const response = await api.post('/transactions/', data);
    return response.data;
  },

  update: async (id: number, data: TransactionUpdate): Promise<Transaction> => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },

  importCSV: async (file: File): Promise<{ message: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/transactions/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  exportCSV: async (params?: { start_date?: string; end_date?: string }): Promise<Blob> => {
    const response = await api.get('/transactions/export/csv', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

export const reportApi = {
  getSummary: async (params?: { start_date?: string; end_date?: string }): Promise<ReportSummary> => {
    const response = await api.get('/reports/summary', { params });
    return response.data;
  },

  getMonthly: async (): Promise<MonthlyReport[]> => {
    const response = await api.get('/reports/monthly');
    return response.data;
  },

  getByCategory: async (transaction_type?: string): Promise<CategoryReport[]> => {
    const response = await api.get('/reports/by-category', { params: { transaction_type } });
    return response.data;
  },
};