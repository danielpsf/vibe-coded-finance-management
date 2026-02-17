from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import csv
import io
import pandas as pd

from logger import get_logger
from database import get_db
from schemas import TransactionCreate, TransactionUpdate, TransactionResponse
from services.transaction_service import TransactionService

router = APIRouter(prefix="/api/transactions", tags=["transactions"])
logger = get_logger(__name__)

@router.get("/", response_model=List[TransactionResponse])
def get_transactions(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category: Optional[str] = None,
    transaction_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all transactions with optional filtering."""
    logger.info(
        f"Getting transactions: skip={skip}, limit={limit}, "
        f"start_date={start_date}, end_date={end_date}, "
        f"category={category}, type={transaction_type}"
    )
    
    try:
        service = TransactionService(db)
        transactions = service.get_transactions(skip, limit, start_date, end_date, category, transaction_type)
        logger.info(f"Retrieved {len(transactions)} transactions")
        logger.debug(f"Transactions: {[t.id for t in transactions]}")
        return transactions
    except Exception as e:
        logger.error(f"Error retrieving transactions: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error retrieving transactions")

@router.post("/", response_model=TransactionResponse)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    """Create a new transaction."""
    logger.info(f"Creating transaction: {transaction.description} - ${transaction.amount}")
    logger.debug(f"Transaction data: {transaction.model_dump()}")
    
    try:
        service = TransactionService(db)
        result = service.create_transaction(transaction)
        logger.info(f"Transaction created successfully with ID: {result.id}")
        return result
    except Exception as e:
        logger.error(f"Error creating transaction: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error creating transaction")

@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Get a specific transaction by ID."""
    logger.info(f"Getting transaction with ID: {transaction_id}")
    
    try:
        service = TransactionService(db)
        transaction = service.get_transaction(transaction_id)
        
        if not transaction:
            logger.warning(f"Transaction not found with ID: {transaction_id}")
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        logger.debug(f"Found transaction: ID={transaction.id}, Desc={transaction.description}, Amount=${transaction.amount}")
        return transaction
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving transaction {transaction_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error retrieving transaction")

@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(transaction_id: int, transaction: TransactionUpdate, db: Session = Depends(get_db)):
    """Update an existing transaction."""
    logger.info(f"Updating transaction with ID: {transaction_id}")
    logger.debug(f"Update data: {transaction.model_dump()}")
    
    try:
        service = TransactionService(db)
        updated = service.update_transaction(transaction_id, transaction)
        
        if not updated:
            logger.warning(f"Transaction not found for update with ID: {transaction_id}")
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        logger.info(f"Transaction {transaction_id} updated successfully")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating transaction {transaction_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error updating transaction")

@router.delete("/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Delete a transaction."""
    logger.info(f"Deleting transaction with ID: {transaction_id}")
    
    try:
        service = TransactionService(db)
        deleted = service.delete_transaction(transaction_id)
        
        if not deleted:
            logger.warning(f"Transaction not found for deletion with ID: {transaction_id}")
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        logger.info(f"Transaction {transaction_id} deleted successfully")
        return {"message": "Transaction deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting transaction {transaction_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error deleting transaction")

@router.post("/import")
def import_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Import transactions from a CSV file."""
    logger.info(f"Importing CSV file: {file.filename}")
    
    if not file.filename.endswith('.csv'):
        logger.warning(f"Invalid file type: {file.filename}")
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        service = TransactionService(db)
        contents = file.file.read()
        logger.debug(f"File size: {len(contents)} bytes")
        
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        logger.info(f"CSV loaded with {len(df)} rows")
        logger.debug(f"CSV columns: {list(df.columns)}")
        
        imported_count = service.import_from_dataframe(df)
        logger.info(f"Successfully imported {imported_count} transactions from CSV")
        
        return {"message": f"Successfully imported {imported_count} transactions"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error importing CSV: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Error importing CSV: {str(e)}")

@router.get("/export/csv")
def export_csv(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Export transactions to a CSV file."""
    logger.info(f"Exporting CSV: start_date={start_date}, end_date={end_date}")
    
    try:
        service = TransactionService(db)
        csv_content = service.export_to_csv(start_date, end_date)
        
        logger.info(f"CSV export successful, size: {len(csv_content)} bytes")
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=transactions.csv"}
        )
    except Exception as e:
        logger.error(f"Error exporting CSV: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error exporting CSV")