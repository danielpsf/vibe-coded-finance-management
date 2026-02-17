# Testing Documentation

This document describes how to run all tests for the Finance Manager application.

## Test Structure

The application has three levels of testing:

1. **Unit Tests** - Test individual components in isolation
2. **Integration Tests** - Test API endpoints and service interactions
3. **E2E Tests** - Test complete user workflows using Playwright

## Backend Tests

### Unit Tests

Unit tests for the backend are located in `backend/tests/unit/` and test individual services and business logic.

```bash
cd finance-app/backend
python3 -m pytest tests/unit/ -v
```

### Integration Tests

Integration tests are located in `backend/tests/integration/` and test API endpoints with a test database.

```bash
cd finance-app/backend
python3 -m pytest tests/integration/ -v
```

### Run All Backend Tests

```bash
cd finance-app/backend
python3 -m pytest tests/ -v
```

### Test Coverage

```bash
cd finance-app/backend
python3 -m pytest tests/ --cov=. --cov-report=html
```

## Frontend Tests

### Unit Tests (Vitest)

Frontend unit tests are located in `frontend/src/__tests__/` and use Vitest with React Testing Library.

```bash
cd finance-app/frontend
npm install  # Install dependencies including test libraries
npm test
```

### Run Tests in UI Mode

```bash
cd finance-app/frontend
npm run test:ui
```

### Test Coverage

```bash
cd finance-app/frontend
npm run coverage
```

## E2E Tests (Playwright)

E2E tests are located in `frontend/e2e/` and test complete user workflows.

### Install Playwright Browsers

```bash
cd finance-app/frontend
npx playwright install
```

### Run E2E Tests

```bash
cd finance-app/frontend
npm run e2e
```

### Run E2E Tests in UI Mode

```bash
cd finance-app/frontend
npm run e2e:ui
```

### Debug E2E Tests

```bash
cd finance-app/frontend
npm run e2e:debug
```

## Running Tests in Docker

### Run Backend Tests

```bash
cd finance-app
docker-compose run --rm backend python3 -m pytest tests/ -v
```

### Run Frontend Unit Tests

```bash
cd finance-app
docker-compose run --rm frontend npm test
```

### Run E2E Tests

```bash
cd finance-app
docker-compose up -d  # Start the application
docker-compose run --rm frontend npm run e2e
docker-compose down
```

## Test Files Overview

### Backend Tests

- `tests/unit/test_transaction_service.py` - Unit tests for TransactionService
- `tests/integration/test_transactions_api.py` - Integration tests for transaction endpoints
- `tests/conftest.py` - Test fixtures and configuration

### Frontend Tests

- `src/__tests__/SummaryCards.test.tsx` - Tests for SummaryCards component
- `src/__tests__/TransactionForm.test.tsx` - Tests for TransactionForm component
- `src/__tests__/TransactionList.test.tsx` - Tests for TransactionList component
- `e2e/finance-app.spec.ts` - End-to-end tests for complete workflows

## Writing New Tests

### Backend Unit Tests

```python
# tests/unit/test_new_service.py
import pytest
from services.new_service import NewService
from schemas import SomeCreate

class TestNewService:
    def test_some_functionality(self, db_session):
        service = NewService(db_session)
        data = SomeCreate(field="value")
        result = service.create(data)
        assert result.field == "value"
```

### Backend Integration Tests

```python
# tests/integration/test_new_api.py
def test_new_endpoint(client):
    response = client.post("/api/new-endpoint/", json={
        "field": "value"
    })
    assert response.status_code == 200
    assert response.json()["field"] == "value"
```

### Frontend Unit Tests

```typescript
// src/__tests__/NewComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NewComponent from '../components/NewComponent';

describe('NewComponent', () => {
  it('renders correctly', () => {
    render(<NewComponent prop="value" />);
    expect(screen.getByText('value')).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
// e2e/new-feature.spec.ts
import { test, expect } from '@playwright/test';

test.describe('New Feature', () => {
  test('should complete workflow', async ({ page }) => {
    await page.goto('/');
    await page.click('button');
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

## Troubleshooting

### Backend Tests

**Issue**: `ModuleNotFoundError: No module named 'pytest'`
**Solution**: Install test dependencies: `pip install pytest pytest-asyncio httpx`

**Issue**: Test database not being cleaned up
**Solution**: The `db_session` fixture handles cleanup. If you see issues, check that you're using it in your tests.

### Frontend Tests

**Issue**: `ReferenceError: document is not defined`
**Solution**: Make sure you're using `jsdom` environment in vitest.config.ts

**Issue**: E2E tests fail to start
**Solution**: Make sure Playwright browsers are installed: `npx playwright install`

### Common Issues

**Issue**: Port already in use
**Solution**: Kill any running processes:
```bash
lsof -ti:8000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**Issue**: Tests pass locally but fail in CI
**Solution**: 
- Check for hardcoded paths or environment-specific values
- Ensure all dependencies are in requirements.txt or package.json
- Check that tests don't depend on specific timing