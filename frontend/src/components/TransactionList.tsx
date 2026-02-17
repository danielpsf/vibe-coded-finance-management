import React, { useState } from 'react';
import { Table, Button, Badge, Pagination, Form, Row, Col } from 'react-bootstrap';
import { Transaction, TransactionUpdate } from '../types';
import TransactionForm from './TransactionForm';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: TransactionUpdate) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDelete,
  onUpdate,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleUpdate = (id: number, data: TransactionUpdate) => {
    onUpdate(id, data);
    setEditingId(null);
  };

  return (
    <div>
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedTransactions.map((transaction) => (
            <React.Fragment key={transaction.id}>
              {editingId === transaction.id ? (
                <tr>
                  <td colSpan={6}>
                    <TransactionForm
                      initialData={transaction}
                      onSubmit={(data) => handleUpdate(transaction.id, data)}
                      onCancel={() => setEditingId(null)}
                      isEdit
                    />
                  </td>
                </tr>
              ) : (
                <tr>
                  <td>{formatDate(transaction.date)}</td>
                  <td>{transaction.description}</td>
                  <td>
                    <Badge bg="secondary">{transaction.category}</Badge>
                  </td>
                  <td>
                    <Badge bg={transaction.transaction_type === 'income' ? 'success' : 'danger'}>
                      {transaction.transaction_type}
                    </Badge>
                  </td>
                  <td
                    className={
                      transaction.transaction_type === 'income' ? 'text-success' : 'text-danger'
                    }
                  >
                    {transaction.transaction_type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => setEditingId(transaction.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onDelete(transaction.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </Table>

      {totalPages > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
          <Pagination.Prev
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          />
          {[...Array(totalPages)].map((_, i) => (
            <Pagination.Item
              key={i + 1}
              active={i + 1 === currentPage}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      )}
    </div>
  );
};

export default TransactionList;