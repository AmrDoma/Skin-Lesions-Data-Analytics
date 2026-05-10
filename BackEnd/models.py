from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
import secrets

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    messages = relationship("Message", back_populates="user", cascade="all, delete-orphan")
    images = relationship("Image", back_populates="user", cascade="all, delete-orphan")
    token = relationship("Token", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Token(Base):
    __tablename__ = "tokens"

    key = Column(String, primary_key=True, index=True, default=lambda: secrets.token_hex(20))
    user_id = Column(Integer, ForeignKey("users.id"))
    created = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="token")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    sender_type = Column(String, default='user') # 'user' or 'ai'
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="messages")


class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    media_link = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    predicted_class = Column(String, nullable=True)
    probabilities = Column(JSON, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="images")
