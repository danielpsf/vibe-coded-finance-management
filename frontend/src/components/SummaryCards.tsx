import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { ReportSummary } from '../types';

interface SummaryCardsProps {
  summary: ReportSummary;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Row className="mb-4">
      <Col md={3}>
        <Card className="h-100 border-primary">
          <Card.Body>
            <Card.Title className="text-primary">Total Income</Card.Title>
            <Card.Text className="h3 text-success">
              {formatCurrency(summary.total_income)}
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="h-100 border-danger">
          <Card.Body>
            <Card.Title className="text-danger">Total Expenses</Card.Title>
            <Card.Text className="h3 text-danger">
              {formatCurrency(summary.total_expense)}
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="h-100 border-info">
          <Card.Body>
            <Card.Title className="text-info">Net Balance</Card.Title>
            <Card.Text className={`h3 ${summary.net_balance >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(summary.net_balance)}
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="h-100 border-secondary">
          <Card.Body>
            <Card.Title className="text-secondary">Transactions</Card.Title>
            <Card.Text className="h3">
              {summary.transaction_count}
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default SummaryCards;