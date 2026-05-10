import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session
from database import get_db
import models

token_header = APIKeyHeader(name="Authorization", auto_error=True)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def get_current_user(token: str = Depends(token_header), db: Session = Depends(get_db)):
    # Expecting token to be like "Token <key>"
    if token.startswith("Token "):
        token_key = token.split(" ")[1]
    else:
        token_key = token
        
    db_token = db.query(models.Token).filter(models.Token.key == token_key).first()
    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Token"},
        )
    return db_token.user
