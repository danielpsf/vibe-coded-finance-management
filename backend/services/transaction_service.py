from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from datetime import date, datetime
import csv
import io
import pandas as pd

from logger import get_logger
from database import Transaction
from schemas import TransactionCreate, TransactionUpdate, MonthlyReport, CategoryReport

logger = get_logger(__name__)

class TransactionService:
    """Service class for handling transaction business logic."""
    
    def __init__(self, db: Session):
        self.db = db
        logger.debug("TransactionService initialized")
    
    def get_transactions(
        self,
        skip: int = 0,
        limit: int = 100,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        category: Optional[str] = None,
        transaction_type: Optional[str] = None
    ) -> List[Transaction]:
        """Retrieve transactions with optional filtering."""
        logger.debug(
            f"Querying transactions: skip={skip}, limit={limit}, "
            f"start_date={start_date}, end_date={end_date}, "
            f"category={category}, transaction_type={transaction_type}"
        )
        
        query = self.db.query(Transaction)
        
        if start_date:
            query = query.filter(Transaction.date >= start_date)
            logger.debug(f"Applied start_date filter: {start_date}")
        if end_date:
            query = query.filter(Transaction.date <= end_date)
            logger.debug(f"Applied end_date filter: {end_date}")
        if category:
            query = query.filter(Transaction.category == category)
            logger.debug(f"Applied category filter: {category}")
        if transaction_type:
            query = query.filter(Transaction.transaction_type == transaction_type)
            logger.debug(f"Applied transaction_type filter: {transaction_type}")
        
        results = query.order_by(Transaction.date.desc()).offset(skip).limit(limit).all()
        logger.debug(f"Query returned {len(results)} transactions")
        return results
    
    def get_transaction(self, transaction_id: int) -> Optional[Transaction]:
        """Retrieve a single transaction by ID."""
        logger.debug(f"Querying transaction with ID: {transaction_id}")
        
        transaction = self.db.query(Transaction).filter(Transaction.id == transaction_id).first()
        
        if transaction:
            logger.debug(f"Found transaction: {transaction.id} - {transaction.description}")
        else:
            logger.debug(f"No transaction found with ID: {transaction_id}")
        
        return transaction
    
    def create_transaction(self, transaction_data: TransactionCreate) -> Transaction:
        """Create a new transaction."""
        logger.debug(f"Creating transaction with data: {transaction_data.model_dump()}")
        
        try:
            db_transaction = Transaction(**transaction_data.model_dump())
            self.db.add(db_transaction)
            self.db.commit()
            self.db.refresh(db_transaction)
            
            logger.info(f"Transaction created successfully: ID={db_transaction.id}, "
                       f"Description={db_transaction.description}, "
                       f"Amount=${db_transaction.amount}")
            return db_transaction
        except Exception as e:
            logger.error(f"Error creating transaction: {e}", exc_info=True)
            self.db.rollback()
            raise
    
    def update_transaction(self, transaction_id: int, transaction_data: TransactionUpdate) -> Optional[Transaction]:
        """Update an existing transaction."""
        logger.debug(f"Updating transaction {transaction_id} with data: {transaction_data.model_dump()}")
        
        db_transaction = self.get_transaction(transaction_id)
        if not db_transaction:
            logger.warning(f"Transaction {transaction_id} not found for update")
            return None
        
        try:
            update_data = transaction_data.model_dump(exclude_unset=True)
            logger.debug(f"Applying updates: {update_data}")
            
            for key, value in update_data.items():
                setattr(db_transaction, key, value)
            
            db_transaction.updated_at = datetime.now()
            self.db.commit()
            self.db.refresh(db_transaction)
            
            logger.info(f"Transaction {transaction_id} updated successfully")
            return db_transaction
        except Exception as e:
            logger.error(f"Error updating transaction {transaction_id}: {e}", exc_info=True)
            self.db.rollback()
            raise
    
    def delete_transaction(self, transaction_id: int) -> bool:
        """Delete a transaction."""
        logger.debug(f"Attempting to delete transaction {transaction_id}")
        
        db_transaction = self.get_transaction(transaction_id)
        if not db_transaction:
            logger.warning(f"Transaction {transaction_id} not found for deletion")
            return False
        
        try:
            self.db.delete(db_transaction)
            self.db.commit()
            logger.info(f"Transaction {transaction_id} deleted successfully")
            return True
        except Exception as e:
            logger.error(f"Error deleting transaction {transaction_id}: {e}", exc_info=True)
            self.db.rollback()
            raise
    
    def import_from_dataframe(self, df: pd.DataFrame) -> int:
        """Import transactions from a pandas DataFrame."""
        logger.info(f"Starting import from DataFrame with {len(df)} rows")
        
        required_columns = ['date', 'amount', 'description', 'category', 'transaction_type']
        
        # Map common column names
        column_mapping = {
            'Date': 'date',
            'date': 'date',
            'Amount': 'amount',
            'amount': 'amount',
            'Description': 'description',
            'description': 'description',
            'Category': 'category',
            'category': 'category',
            'Type': 'transaction_type',
            'type': 'transaction_type',
            'Transaction Type': 'transaction_type'
        }
        
        df = df.rename(columns=column_mapping)
        logger.debug(f"DataFrame columns after mapping: {list(df.columns)}")
        
        # Ensure all required columns exist
        for col in required_columns:
            if col not in df.columns:
                logger.error(f"Missing required column: {col}")
                raise ValueError(f"Missing required column: {col}")
        
        count = 0
        errors = 0
        
        for index, row in df.iterrows():
            try:
                logger.debug(f"Importing row {index}: {row.to_dict()}")
                
                transaction = Transaction(
                    date=pd.to_datetime(row['date']).date(),
                    amount=float(row['amount']),
                    description=str(row['description']),
                    category=str(row['category']),
                    transaction_type=str(row['transaction_type']).lower()
                )
                self.db.add(transaction)
                count += 1
                
                # Commit every 100 records to avoid memory issues
                if count % 100 == 0:
                    self.db.commit()
                    logger.debug(f"Committed batch of 100 records")
                    
            except Exception as e:
                logger.error(f"Error importing row {index}: {e}", exc_info=True)
                errors += 1
                continue
        
        # Final commit
        self.db.commit()
        
        logger.info(f"Import completed: {count} transactions imported, {errors} errors")
        return count
    
    def export_to_csv(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> str:
        """Export transactions to CSV format."""
        logger.info(f"Starting CSV export: start_date={start_date}, end_date={end_date}")
        
        try:
            transactions = self.get_transactions(
                skip=0,
                limit=10000,
                start_date=start_date,
                end_date=end_date
            )
            
            logger.debug(f"Exporting {len(transactions)} transactions to CSV")
            
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(['date', 'amount', 'description', 'category', 'transaction_type'])
            
            for t in transactions:
                writer.writerow([
                    t.date.strftime('%Y-%m-%d'),
                    t.amount,
                    t.description,
                    t.category,
                    t.transaction_type
                ])
            
            csv_content = output.getvalue()
            logger.info(f"CSV export completed: {len(csv_content)} bytes generated")
            return csv_content
            
        except Exception as e:
            logger.error(f"Error exporting to CSV: {e}", exc_info=True)
            raise