import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { reportApi } from '../services/api';
import { MonthlyReport, CategoryReport } from '../types';

const Reports: React.FC = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyReport[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<CategoryReport[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<CategoryReport[]>([]);
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [monthly, incomeCats, expenseCats] = await Promise.all([
        reportApi.getMonthly(),
        reportApi.getByCategory('income'),
        reportApi.getByCategory('expense'),
      ]);
      setMonthlyData(monthly);
      setIncomeCategories(incomeCats);
      setExpenseCategories(expenseCats);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B', '#4ECDC4'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Reports</h1>

      <Row className="mb-4">
        <Col lg={12}>
          <Card>
            <Card.Header>
              <Card.Title>Monthly Overview</Card.Title>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="income" fill="#28a745" name="Income" />
                  <Bar dataKey="expense" fill="#dc3545" name="Expense" />
                  <Bar dataKey="net" fill="#007bff" name="Net" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={6}>
          <Card className="mb-4">
            <Card.Header>
              <Card.Title>Income by Category</Card.Title>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomeCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) =>
                      percent > 0.05 ? `${category} ${(percent * 100).toFixed(0)}%` : ''
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="total"
                    nameKey="category"
                  >
                    {incomeCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <Table striped size="sm" className="mt-3">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeCategories.map((cat) => (
                    <tr key={cat.category}>
                      <td>{cat.category}</td>
                      <td className="text-success">{formatCurrency(cat.total)}</td>
                      <td>{cat.count}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="mb-4">
            <Card.Header>
              <Card.Title>Expenses by Category</Card.Title>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) =>
                      percent > 0.05 ? `${category} ${(percent * 100).toFixed(0)}%` : ''
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="total"
                    nameKey="category"
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <Table striped size="sm" className="mt-3">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseCategories.map((cat) => (
                    <tr key={cat.category}>
                      <td>{cat.category}</td>
                      <td className="text-danger">{formatCurrency(cat.total)}</td>
                      <td>{cat.count}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Reports;