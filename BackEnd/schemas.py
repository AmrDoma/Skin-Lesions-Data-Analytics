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

class ChatMessage(BaseModel):
    text: str
    timestamp: datetime
    sender_type: str

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    user_message: ChatMessage
    ai_response: ChatMessage

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

class ChatWithAIRequest(BaseModel):
    chat_history: List[Dict[str, Any]]
