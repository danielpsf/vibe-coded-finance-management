import pytest
from datetime import date
from services.transaction_service import TransactionService
from schemas import TransactionCreate, TransactionUpdate

class TestTransactionService:
    """Unit tests for TransactionService"""
    
    def test_create_transaction(self, db_session):
        """Test creating a new transaction"""
        service = TransactionService(db_session)
        
        transaction_data = TransactionCreate(
            date=date(2024, 1, 15),
            amount=100.00,
            description="Test transaction",
            category="Food",
            transaction_type="expense"
        )
        
        result = service.create_transaction(transaction_data)
        
        assert result.id is not None
        assert result.amount == 100.00
        assert result.description == "Test transaction"
        assert result.category == "Food"
        assert result.transaction_type == "expense"
    
    def test_get_transaction(self, db_session):
        """Test retrieving a transaction by ID"""
        service = TransactionService(db_session)
        
        # Create a transaction first
        transaction_data = TransactionCreate(
            date=date(2024, 1, 15),
            amount=50.00,
            description="Grocery shopping",
            category="Food",
            transaction_type="expense"
        )
        created = service.create_transaction(transaction_data)
        
        # Retrieve it
        result = service.get_transaction(created.id)
        
        assert result is not None
        assert result.id == created.id
        assert result.description == "Grocery shopping"
    
    def test_get_transaction_not_found(self, db_session):
        """Test retrieving a non-existent transaction"""
        service = TransactionService(db_session)
        
        result = service.get_transaction(9999)
        
        assert result is None
    
    def test_update_transaction(self, db_session):
        """Test updating a transaction"""
        service = TransactionService(db_session)
        
        # Create a transaction
        transaction_data = TransactionCreate(
            date=date(2024, 1, 15),
            amount=100.00,
            description="Original",
            category="Food",
            transaction_type="expense"
        )
        created = service.create_transaction(transaction_data)
        
        # Update it
        update_data = TransactionUpdate(
            description="Updated",
            amount=150.00
        )
        result = service.update_transaction(created.id, update_data)
        
        assert result is not None
        assert result.description == "Updated"
        assert result.amount == 150.00
        assert result.category == "Food"  # Unchanged
    
    def test_delete_transaction(self, db_session):
        """Test deleting a transaction"""
        service = TransactionService(db_session)
        
        # Create a transaction
        transaction_data = TransactionCreate(
            date=date(2024, 1, 15),
            amount=100.00,
            description="To be deleted",
            category="Food",
            transaction_type="expense"
        )
        created = service.create_transaction(transaction_data)
        
        # Delete it
        result = service.delete_transaction(created.id)
        
        assert result is True
        
        # Verify it's gone
        deleted = service.get_transaction(created.id)
        assert deleted is None
    
    def test_delete_nonexistent_transaction(self, db_session):
        """Test deleting a transaction that doesn't exist"""
        service = TransactionService(db_session)
        
        result = service.delete_transaction(9999)
        
        assert result is False
    
    def test_get_transactions_with_filters(self, db_session):
        """Test filtering transactions"""
        service = TransactionService(db_session)
        
        # Create multiple transactions
        service.create_transaction(TransactionCreate(
            date=date(2024, 1, 15),
            amount=100.00,
            description="Food 1",
            category="Food",
            transaction_type="expense"
        ))
        
        service.create_transaction(TransactionCreate(
            date=date(2024, 1, 16),
            amount=200.00,
            description="Transport",
            category="Transportation",
            transaction_type="expense"
        ))
        
        service.create_transaction(TransactionCreate(
            date=date(2024, 1, 17),
            amount=3000.00,
            description="Salary",
            category="Salary",
            transaction_type="income"
        ))
        
        # Test category filter
        food_transactions = service.get_transactions(category="Food")
        assert len(food_transactions) == 1
        assert food_transactions[0].category == "Food"
        
        # Test type filter
        income_transactions = service.get_transactions(transaction_type="income")
        assert len(income_transactions) == 1
        assert income_transactions[0].transaction_type == "income"
        
        # Test date range filter
        filtered = service.get_transactions(
            start_date=date(2024, 1, 15),
            end_date=date(2024, 1, 16)
        )
        assert len(filtered) == 2