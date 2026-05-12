from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    password2: str

class UserLogin(BaseModel):
    username: str
    password: str

class ImageUploadRequest(BaseModel):
    image: str

class ImageResponse(BaseModel):
    id: int
    media_link: str
    uploaded_at: datetime
    predicted_class: Optional[str] = None
    probabilities: Optional[Dict[str, float]] = None

    class Config:
        from_attributes = True

