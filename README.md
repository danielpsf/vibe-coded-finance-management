# Finance Manager

A full-stack web application for organizing personal finances, built with Python (FastAPI), TypeScript, React, and Bootstrap CSS.

> **⚡ Vibe Coded Disclaimer**
> 
> This entire project was completed using **vibe coding** with [OpenCode](https://github.com/opencode-ai/opencode) and **OpenCode Zen** powered by **Kimi K2.5 Free**.
> 
> From downloading and installing OpenCode to having a fully functional, tested, and documented application took **less than 1 hour**.
> 
> This demonstrates the power of AI-assisted development where you can:
> - Scaffold a complete full-stack application
> - Implement CRUD operations with SQLite
> - Add CSV import/export functionality
> - Create interactive charts and reports
> - Build comprehensive test suites (unit, integration, E2E)
> - Set up Docker containers and CI/CD pipelines
> - Add security scanning and logging
> - Fix vulnerabilities and polish the codebase
> 
> All through natural language conversations with an AI assistant. Welcome to the future of coding! 🚀

---

## Features

- Add, edit, delete, and view financial transactions
- Categorize transactions as income or expense
- Filter transactions by date, category, and type
- Import transactions from CSV files
- Export transactions to CSV
- Visual reports with charts (monthly trends, category breakdowns)
- Dashboard with summary statistics
- SQLite database for data persistence

## Tech Stack

**Backend:**
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- SQLite (database)
- Pandas (CSV processing)

**Frontend:**
- React 18
- TypeScript
- Vite (build tool)
- React Bootstrap (UI components)
- Recharts (data visualization)
- Axios (HTTP client)

## Quick Start with Docker Compose (Recommended)

The easiest way to run the application is using Docker Compose:

```bash
# Navigate to the project directory
cd finance-app

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

To stop the application:
```bash
docker-compose down
```

To stop and remove all data (including the database):
```bash
docker-compose down -v
```

## Project Structure

```
finance-app/
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── database.py          # Database models and connection
│   ├── schemas.py           # Pydantic models
│   ├── Dockerfile           # Backend Docker configuration
│   ├── requirements.txt     # Python dependencies
│   ├── routes/
│   │   ├── transactions.py  # Transaction API endpoints
│   │   └── reports.py       # Reports API endpoints
│   └── services/
│       └── transaction_service.py  # Business logic
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main React component
│   │   ├── main.tsx         # React entry point
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   └── types/           # TypeScript interfaces
│   ├── Dockerfile           # Frontend Docker configuration
│   ├── package.json         # Node.js dependencies
│   ├── tsconfig.json        # TypeScript configuration
│   └── vite.config.ts       # Vite configuration
├── docker-compose.yml       # Docker Compose configuration
└── README.md
```

## Manual Setup (Without Docker)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd finance-app/backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:8000`
   
   API documentation will be at:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd finance-app/frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## CSV Import Format

The CSV file should have the following columns:
- `date`: Date in YYYY-MM-DD format
- `amount`: Numeric value
- `description`: Text description
- `category`: Category name
- `transaction_type`: Either "income" or "expense"

Example:
```csv
date,amount,description,category,transaction_type
2024-01-15,2500.00,Monthly Salary,Salary,income
2024-01-16,50.00,Groceries,Food,expense
```

## Usage

1. Open the frontend in your browser at `http://localhost:5173`
2. Use the Dashboard to see your financial overview
3. Navigate to Transactions to add, edit, or delete entries
4. Go to Reports to see detailed analytics
5. Use Import/Export to manage CSV files

## API Endpoints

### Transactions
- `GET /api/transactions/` - List all transactions
- `POST /api/transactions/` - Create new transaction
- `GET /api/transactions/{id}` - Get specific transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction
- `POST /api/transactions/import` - Import from CSV
- `GET /api/transactions/export/csv` - Export to CSV

### Reports
- `GET /api/reports/summary` - Get financial summary
- `GET /api/reports/monthly` - Get monthly breakdown
- `GET /api/reports/by-category` - Get category breakdown

## Environment Variables

### Backend
- `DATABASE_URL` - SQLite database URL (default: `sqlite:///./finance.db`)

### Frontend
- `VITE_API_URL` - Backend API URL (default: `http://localhost:8000/api`)

## License

MIT License