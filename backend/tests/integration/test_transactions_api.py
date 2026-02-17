import pytest
from datetime import date

def test_create_transaction(client):
    """Test creating a transaction via API"""
    response = client.post("/api/transactions/", json={
        "date": "2024-01-15",
        "amount": 100.00,
        "description": "Test transaction",
        "category": "Food",
        "transaction_type": "expense"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["amount"] == 100.00
    assert data["description"] == "Test transaction"
    assert data["category"] == "Food"
    assert data["transaction_type"] == "expense"
    assert "id" in data

def test_get_transactions(client):
    """Test retrieving all transactions"""
    # Create a transaction first
    client.post("/api/transactions/", json={
        "date": "2024-01-15",
        "amount": 100.00,
        "description": "Test",
        "category": "Food",
        "transaction_type": "expense"
    })
    
    response = client.get("/api/transactions/")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_get_transaction_by_id(client):
    """Test retrieving a specific transaction"""
    # Create a transaction
    create_response = client.post("/api/transactions/", json={
        "date": "2024-01-15",
        "amount": 100.00,
        "description": "Test",
        "category": "Food",
        "transaction_type": "expense"
    })
    transaction_id = create_response.json()["id"]
    
    # Get it by ID
    response = client.get(f"/api/transactions/{transaction_id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == transaction_id

def test_get_transaction_not_found(client):
    """Test retrieving a non-existent transaction"""
    response = client.get("/api/transactions/99999")
    
    assert response.status_code == 404

def test_update_transaction(client):
    """Test updating a transaction"""
    # Create a transaction
    create_response = client.post("/api/transactions/", json={
        "date": "2024-01-15",
        "amount": 100.00,
        "description": "Original",
        "category": "Food",
        "transaction_type": "expense"
    })
    transaction_id = create_response.json()["id"]
    
    # Update it
    response = client.put(f"/api/transactions/{transaction_id}", json={
        "description": "Updated",
        "amount": 150.00
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["description"] == "Updated"
    assert data["amount"] == 150.00

def test_delete_transaction(client):
    """Test deleting a transaction"""
    # Create a transaction
    create_response = client.post("/api/transactions/", json={
        "date": "2024-01-15",
        "amount": 100.00,
        "description": "To delete",
        "category": "Food",
        "transaction_type": "expense"
    })
    transaction_id = create_response.json()["id"]
    
    # Delete it
    response = client.delete(f"/api/transactions/{transaction_id}")
    
    assert response.status_code == 200
    
    # Verify it's gone
    get_response = client.get(f"/api/transactions/{transaction_id}")
    assert get_response.status_code == 404

def test_filter_transactions_by_category(client):
    """Test filtering transactions by category"""
    # Create transactions
    client.post("/api/transactions/", json={
        "date": "2024-01-15",
        "amount": 50.00,
        "description": "Food item",
        "category": "Food",
        "transaction_type": "expense"
    })
    
    client.post("/api/transactions/", json={
        "date": "2024-01-16",
        "amount": 100.00,
        "description": "Transport",
        "category": "Transportation",
        "transaction_type": "expense"
    })
    
    # Filter by Food category
    response = client.get("/api/transactions/?category=Food")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["category"] == "Food"

def test_health_check(client):
    """Test the health check endpoint"""
    response = client.get("/api/health")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_create_transaction_invalid_data(client):
    """Test creating a transaction with invalid data"""
    response = client.post("/api/transactions/", json={
        "date": "invalid-date",
        "amount": "not-a-number",
        "description": "",
        "category": "",
        "transaction_type": "invalid-type"
    })
    
    assert response.status_code == 422  # Validation error