import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import ImportExport from './pages/ImportExport';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-vh-100 bg-light">
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/import-export" element={<ImportExport />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;