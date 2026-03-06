from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class RequestCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    justification: Optional[str] = None
    category_id: Optional[UUID] = None
    cost_center_id: Optional[UUID] = None
    expense_date: Optional[datetime] = None
    vendor_name: Optional[str] = None
    amount: float = Field(..., gt=0)
    currency: str = "BRL"


class RequestUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    justification: Optional[str] = None
    category_id: Optional[UUID] = None
    cost_center_id: Optional[UUID] = None
    expense_date: Optional[datetime] = None
    vendor_name: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)


class RequestResponse(BaseModel):
    id: UUID
    employee_id: UUID
    category_id: Optional[UUID] = None
    cost_center_id: Optional[UUID] = None
    title: str
    description: Optional[str] = None
    justification: Optional[str] = None
    expense_date: Optional[datetime] = None
    vendor_name: Optional[str] = None
    amount: float
    currency: str
    status: str
    current_version: int
    submitted_at: Optional[datetime] = None
    ai_risk_score: Optional[int] = None
    ai_risk_level: Optional[str] = None
    ai_recommendation: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_attention_points: Optional[list] = None
    ai_policy_violations: Optional[list] = None
    ai_analyzed_at: Optional[datetime] = None
    ai_skipped: Optional[bool] = None
    amount_brl: Optional[float] = None
    exchange_rate: Optional[float] = None
    manager_sla_due_at: Optional[datetime] = None
    finance_sla_due_at: Optional[datetime] = None
    correction_sla_due_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RequestListResponse(BaseModel):
    data: List[RequestResponse]
    total: int
    page: int
    per_page: int


class ActionRequest(BaseModel):
    justification: Optional[str] = None
    comment: Optional[str] = None
