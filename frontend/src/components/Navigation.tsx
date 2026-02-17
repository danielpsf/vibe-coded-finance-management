import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand href="#" onClick={() => navigate('/')}>Finance Manager</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto" activeKey={location.pathname}>
            <Nav.Link onClick={() => navigate('/')}>Dashboard</Nav.Link>
            <Nav.Link onClick={() => navigate('/transactions')}>Transactions</Nav.Link>
            <Nav.Link onClick={() => navigate('/reports')}>Reports</Nav.Link>
            <Nav.Link onClick={() => navigate('/import-export')}>Import/Export</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;