import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { TransactionCreate, TransactionUpdate } from '../types';

interface TransactionFormProps {
  initialData?: Partial<TransactionCreate>;
  onSubmit: (data: TransactionCreate | TransactionUpdate) => void;
  onCancel?: () => void;
  isEdit?: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState<TransactionCreate>({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    amount: initialData?.amount || 0,
    description: initialData?.description || '',
    category: initialData?.category || '',
    transaction_type: initialData?.transaction_type || 'expense',
  });

  const categories = [
    'Food',
    'Transportation',
    'Housing',
    'Entertainment',
    'Utilities',
    'Healthcare',
    'Shopping',
    'Salary',
    'Investment',
    'Other',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if (!isEdit) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        description: '',
        category: '',
        transaction_type: 'expense',
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Select
              name="transaction_type"
              value={formData.transaction_type}
              onChange={handleChange}
              required
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              required
            />
          </Form.Group>
        </Col>
      </Row>
      <div className="d-flex gap-2">
        <Button variant="primary" type="submit">
          {isEdit ? 'Update' : 'Add'} Transaction
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </Form>
  );
};

export default TransactionForm;