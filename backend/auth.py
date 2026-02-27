import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models import User

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=60) # Standardize to 60 mins
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "212650704696-in08fprrggefriiej41fofr2er5qpfl5.apps.googleusercontent.com")

def verify_google_token(token: str):
    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
        return idinfo
    except Exception as e:
        print(f"Google Token Verification Error: {e}")
        return None

def get_or_create_google_user(db: Session, idinfo: dict):
    email = idinfo.get("email")
    google_id = idinfo.get("sub")
    
    # 1. Try to find by google_id
    user = db.query(User).filter(User.google_id == google_id).first()
    
    if not user:
        # 2. Try to find by email (merge strategy)
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.google_id = google_id
        else:
            # 3. Create new user
            user = User(
                email=email,
                google_id=google_id,
                role="user"
            )
            db.add(user)
    
    # Update profile info regardless
    user.full_name = idinfo.get("name")
    user.picture_url = idinfo.get("picture")
    db.commit()
    db.refresh(user)
    return user

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user
