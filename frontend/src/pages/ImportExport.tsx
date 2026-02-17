import React, { useState, useRef } from 'react';
import { Container, Card, Row, Col, Form, Button, Alert, Table } from 'react-bootstrap';
import { transactionApi } from '../services/api';

const ImportExport: React.FC = () => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [exportDateRange, setExportDateRange] = useState({
    start_date: '',
    end_date: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
      setImportMessage(null);
      setImportError(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      setImportError('Please select a file to import');
      return;
    }

    try {
      const result = await transactionApi.importCSV(importFile);
      setImportMessage(result.message);
      setImportFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setImportError('Failed to import CSV file. Please check the file format.');
      console.error(err);
    }
  };

  const handleExport = async () => {
    try {
      const params: Record<string, string> = {};
      if (exportDateRange.start_date) params.start_date = exportDateRange.start_date;
      if (exportDateRange.end_date) params.end_date = exportDateRange.end_date;

      const blob = await transactionApi.exportCSV(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    }
  };

  const sampleCSV = `date,amount,description,category,transaction_type
2024-01-15,2500.00,Monthly Salary,Salary,income
2024-01-16,50.00,Groceries,Food,expense
2024-01-17,30.00,Gas,Transportation,expense
2024-01-18,1200.00,Rent,Housing,expense`;

  const downloadSample = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_transactions.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Import & Export</h1>

      <Row>
        <Col lg={6}>
          <Card className="mb-4">
            <Card.Header>
              <Card.Title>Import Transactions</Card.Title>
            </Card.Header>
            <Card.Body>
              {importMessage && (
                <Alert variant="success" dismissible onClose={() => setImportMessage(null)}>
                  {importMessage}
                </Alert>
              )}
              {importError && (
                <Alert variant="danger" dismissible onClose={() => setImportError(null)}>
                  {importError}
                </Alert>
              )}
              
              <Form.Group className="mb-3">
                <Form.Label>Select CSV File</Form.Label>
                <Form.Control
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                <Form.Text className="text-muted">
                  CSV must have columns: date, amount, description, category, transaction_type
                </Form.Text>
              </Form.Group>

              <Button
                variant="primary"
                onClick={handleImport}
                disabled={!importFile}
                className="me-2"
              >
                Import CSV
              </Button>
              <Button variant="outline-secondary" onClick={downloadSample}>
                Download Sample
              </Button>

              <Card className="mt-4 bg-light">
                <Card.Body>
                  <Card.Title className="h6">Expected CSV Format:</Card.Title>
                  <Table striped bordered size="sm" className="mt-2">
                    <thead>
                      <tr>
                        <th>date</th>
                        <th>amount</th>
                        <th>description</th>
                        <th>category</th>
                        <th>transaction_type</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>2024-01-15</td>
                        <td>2500.00</td>
                        <td>Monthly Salary</td>
                        <td>Salary</td>
                        <td>income</td>
                      </tr>
                      <tr>
                        <td>2024-01-16</td>
                        <td>50.00</td>
                        <td>Groceries</td>
                        <td>Food</td>
                        <td>expense</td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="mb-4">
            <Card.Header>
              <Card.Title>Export Transactions</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Start Date (optional)</Form.Label>
                <Form.Control
                  type="date"
                  value={exportDateRange.start_date}
                  onChange={(e) =>
                    setExportDateRange((prev) => ({ ...prev, start_date: e.target.value }))
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>End Date (optional)</Form.Label>
                <Form.Control
                  type="date"
                  value={exportDateRange.end_date}
                  onChange={(e) =>
                    setExportDateRange((prev) => ({ ...prev, end_date: e.target.value }))
                  }
                />
              </Form.Group>

              <Button variant="success" onClick={handleExport}>
                Export to CSV
              </Button>

              <div className="mt-4">
                <p className="text-muted">
                  <strong>Note:</strong> Leave date fields empty to export all transactions.
                  The exported CSV will include all transaction fields and can be re-imported later.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ImportExport;