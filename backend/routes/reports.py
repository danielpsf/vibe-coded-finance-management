from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from sqlalchemy import func

from logger import get_logger
from database import get_db, Transaction
from schemas import ReportSummary, MonthlyReport, CategoryReport

router = APIRouter(prefix="/api/reports", tags=["reports"])
logger = get_logger(__name__)

@router.get("/summary")
def get_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Get financial summary report."""
    logger.info(f"Generating summary report: start_date={start_date}, end_date={end_date}")
    
    try:
        query = db.query(Transaction)
        
        if start_date:
            query = query.filter(Transaction.date >= start_date)
            logger.debug(f"Applied start_date filter: {start_date}")
        if end_date:
            query = query.filter(Transaction.date <= end_date)
            logger.debug(f"Applied end_date filter: {end_date}")
        
        income = query.filter(Transaction.transaction_type == 'income').with_entities(
            func.sum(Transaction.amount)
        ).scalar() or 0
        
        expense = query.filter(Transaction.transaction_type == 'expense').with_entities(
            func.sum(Transaction.amount)
        ).scalar() or 0
        
        count = query.count()
        
        logger.info(
            f"Summary report generated: income=${income}, expense=${expense}, "
            f"net=${income - expense}, count={count}"
        )
        
        return ReportSummary(
            total_income=income,
            total_expense=expense,
            net_balance=income - expense,
            transaction_count=count
        )
    except Exception as e:
        logger.error(f"Error generating summary report: {e}", exc_info=True)
        raise

@router.get("/monthly")
def get_monthly_report(db: Session = Depends(get_db)):
    """Get monthly breakdown report."""
    logger.info("Generating monthly report")
    
    try:
        from sqlalchemy import extract
        
        results = db.query(
            extract('year', Transaction.date).label('year'),
            extract('month', Transaction.date).label('month'),
            Transaction.transaction_type,
            func.sum(Transaction.amount).label('total')
        ).group_by(
            extract('year', Transaction.date),
            extract('month', Transaction.date),
            Transaction.transaction_type
        ).all()
        
        logger.debug(f"Monthly query returned {len(results)} rows")
        
        monthly_data = {}
        for year, month, trans_type, total in results:
            key = f"{int(year)}-{int(month):02d}"
            if key not in monthly_data:
                monthly_data[key] = {'income': 0, 'expense': 0}
            monthly_data[key][trans_type] = total
        
        reports = []
        for month, data in sorted(monthly_data.items()):
            reports.append(MonthlyReport(
                month=month,
                income=data['income'],
                expense=data['expense'],
                net=data['income'] - data['expense']
            ))
        
        logger.info(f"Monthly report generated with {len(reports)} months")
        return reports
    except Exception as e:
        logger.error(f"Error generating monthly report: {e}", exc_info=True)
        raise

@router.get("/by-category")
def get_category_report(
    transaction_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get category breakdown report."""
    logger.info(f"Generating category report: transaction_type={transaction_type}")
    
    try:
        query = db.query(
            Transaction.category,
            func.sum(Transaction.amount).label('total'),
            func.count(Transaction.id).label('count')
        )
        
        if transaction_type:
            query = query.filter(Transaction.transaction_type == transaction_type)
            logger.debug(f"Applied transaction_type filter: {transaction_type}")
        
        results = query.group_by(Transaction.category).all()
        
        logger.debug(f"Category query returned {len(results)} rows")
        
        report = [
            CategoryReport(category=r.category, total=r.total, count=r.count)
            for r in results
        ]
        
        logger.info(f"Category report generated with {len(report)} categories")
        return report
    except Exception as e:
        logger.error(f"Error generating category report: {e}", exc_info=True)
        raise