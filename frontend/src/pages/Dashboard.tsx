import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { reportApi } from '../services/api';
import { ReportSummary, MonthlyReport, CategoryReport } from '../types';
import SummaryCards from '../components/SummaryCards';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<ReportSummary>({
    total_income: 0,
    total_expense: 0,
    net_balance: 0,
    transaction_count: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyReport[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, monthlyRes, categoryRes] = await Promise.all([
        reportApi.getSummary(),
        reportApi.getMonthly(),
        reportApi.getByCategory('expense'),
      ]);
      setSummary(summaryRes);
      setMonthlyData(monthlyRes.slice(-6)); // Last 6 months
      setCategoryData(categoryRes.slice(0, 5)); // Top 5 categories
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <h3>Loading...</h3>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Dashboard</h1>
      
      <SummaryCards summary={summary} />

      <Row className="mt-4">
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <Card.Title>Monthly Income vs Expenses</Card.Title>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="income" fill="#28a745" name="Income" />
                  <Bar dataKey="expense" fill="#dc3545" name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <Card.Title>Top Expense Categories</Card.Title>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) =>
                      `${category} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                    nameKey="category"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;