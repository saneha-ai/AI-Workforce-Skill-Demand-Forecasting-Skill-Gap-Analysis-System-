from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models import User, AuthLog

# Configuration
SECRET_KEY = "SECRET_KEY_GOES_HERE_FOR_DEMO" # In production use env var
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440 # 24 Hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter(prefix="/auth", tags=["auth"])

# -- Schemas --
class UserSignup(BaseModel):
    fullname: str
    email: str
    phone: Optional[str] = None
    password: str
    skill_category: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

# -- Utils --
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str, db: Session):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None
    
    user = db.query(User).filter(User.email == email).first()
    return user

def verify_token_header(authorization: str = Header(...), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
         raise HTTPException(status_code=401, detail="Invalid token header")
    token = authorization.split(" ")[1]
    user = get_current_user(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

# -- Endpoints --

@router.post("/signup", response_model=Token)
def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already registered")
    
    # Create User
    hashed_pw = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_pw,
        full_name=user_data.fullname,
        phone=user_data.phone,
        skill_category=user_data.skill_category
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate Token
    access_token = create_access_token(data={"sub": new_user.email})
    
    # Log (Optional: we can log signup too)
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "fullname": new_user.full_name
        }
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db), user_agent: Optional[str] = Header(None)):
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="User does not exist")
    
    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Generate Token
    access_token = create_access_token(data={"sub": user.email})
    
    # Log Login
    try:
        log = AuthLog(user_id=user.id, device_info=user_agent or "Unknown")
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"Log error: {e}")

    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "fullname": user.full_name
        }
    }

@router.get("/me")
def read_users_me(current_user: User = Depends(verify_token_header)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "fullname": current_user.full_name,
        "phone": current_user.phone,
        "skill_category": current_user.skill_category
    }
