
from typing import Optional, Literal
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class AdminUserCreate(UserRegister):
    role: Literal["Admin", "Employee", "Support Staff"]


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(
        default=None, min_length=2, max_length=100
    )


class UserResponse(BaseModel):
    user_id: int
    full_name: str
    email: EmailStr
    role: str

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class RequestResponse(BaseModel):
    id: int
    request_code: str
    user_id: int
    category: str
    priority: str
    description: str
    attachment_path: Optional[str] = None
    status: str
    assigned_to: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class RequestAssign(BaseModel):
    support_staff_id: int


class RequestStatusUpdate(BaseModel):
    status: Literal["In Progress", "Resolved"]
    comment: Optional[str] = Field(default=None, max_length=1000)


class RequestDecision(BaseModel):
    decision: Literal["Approved", "Rejected"]
    comment: Optional[str] = Field(default=None, max_length=1000)


class RequestHistoryResponse(BaseModel):
    id: int
    request_id: int
    actor_id: int
    action: str
    old_status: Optional[str] = None
    new_status: Optional[str] = None
    comment: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
