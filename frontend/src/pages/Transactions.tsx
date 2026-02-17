import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { transactionApi } from '../services/api';
import { Transaction, TransactionCreate, TransactionUpdate } from '../types';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    category: '',
    transaction_type: '',
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionApi.getAll();
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: TransactionCreate) => {
    try {
      await transactionApi.create(data);
      fetchTransactions();
    } catch (err) {
      setError('Failed to create transaction');
      console.error(err);
    }
  };

  const handleUpdate = async (id: number, data: TransactionUpdate) => {
    try {
      await transactionApi.update(id, data);
      fetchTransactions();
    } catch (err) {
      setError('Failed to update transaction');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      await transactionApi.delete(id);
      fetchTransactions();
    } catch (err) {
      setError('Failed to delete transaction');
      console.error(err);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.category) params.category = filters.category;
      if (filters.transaction_type) params.transaction_type = filters.transaction_type;
      
      const data = await transactionApi.getAll(params);
      setTransactions(data);
    } catch (err) {
      setError('Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      start_date: '',
      end_date: '',
      category: '',
      transaction_type: '',
    });
    fetchTransactions();
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Transactions</h1>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Header>
          <Card.Title>Add New Transaction</Card.Title>
        </Card.Header>
        <Card.Body>
          <TransactionForm onSubmit={handleCreate} />
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <Card.Title>Filters</Card.Title>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="start_date"
                  value={filters.start_date}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="end_date"
                  value={filters.end_date}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  <option value="Food">Food</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Housing">Housing</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Salary">Salary</option>
                  <option value="Investment">Investment</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  name="transaction_type"
                  value={filters.transaction_type}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex gap-2">
            <Button variant="primary" onClick={applyFilters}>
              Apply Filters
            </Button>
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Transaction List</Card.Title>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <h5>Loading transactions...</h5>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <h5>No transactions found</h5>
            </div>
          ) : (
            <TransactionList
              transactions={transactions}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Transactions;