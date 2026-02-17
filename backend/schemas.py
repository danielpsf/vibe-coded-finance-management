from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional

class TransactionBase(BaseModel):
    date: date
    amount: float
    description: str
    category: str
    transaction_type: str  # 'income' or 'expense'

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    date: Optional[date] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    category: Optional[str] = None
    transaction_type: Optional[str] = None

class TransactionResponse(TransactionBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class CategoryBase(BaseModel):
    name: str
    category_type: str

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True

class ReportSummary(BaseModel):
    total_income: float
    total_expense: float
    net_balance: float
    transaction_count: int

class MonthlyReport(BaseModel):
    month: str
    income: float
    expense: float
    net: float

class CategoryReport(BaseModel):
    category: str
    total: float
    count: int