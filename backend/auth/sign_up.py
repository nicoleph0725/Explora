from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import os
from datetime import datetime, timezone, timedelta
from typing import Optional  
from sqlmodel import Session, SQLModel, select
from database import engine, get_session
from models import User
from jose import JWTError, jwt
from passlib.context import CryptContext #for password hashing


from pathlib import Path
from dotenv import load_dotenv

# Load .env relative to backend root
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key_change_in_prod")
ALGORITHM = os.getenv("ALGORITHM", "HS256") 
ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter(prefix="/auth", tags=["auth"])


# ==========================================                                                                                                                                      
    # Schemas (Data Transfer Objects)                                                                                                                                                 
# ========================================== 

class Token(SQLModel):
    access_token: str
    token_type: str

class TokenData(SQLModel):
    email: Optional[str] = None

class UserCreate(SQLModel):
    full_name: str
    email: str
    password: str

# Password hashing context using Bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Tells FastAPI where the frontend should send credentials to get a token (URL path: /auth/token) 
oauth_2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


# ==========================================                                                                                                                                      
    # Helper Functions                                                                                                                                                 
# ========================================== 

"""
 Checks if hashed input password matches
 the hashed password stored in the db
"""
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Generates a hash from a raw password
def get_password_hash(password):
    return pwd_context.hash(password)

# Queries the db to fetch user object using email
def get_user(db: Session, email: str):
    statement = select(User).where(User.email == email)
    return db.exec(statement).first()

# Verifies user credentials during login
def authenticate_user(db: Session, email: str, password: str):
    user = get_user(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False

    return user


# ==========================================                                                                                                                                      
    # Token Management & Auth Dependencies                                                                                                                                            
# ==========================================    

# Encodes user data and exp time into a signed JWT string
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

"""                                                                                                                                                                           
FastAPI dependency that extracts the Bearer token from incoming request headers,                                                                                              
decodes & verifies the JWT, and loads the corresponding user from DB.                                                                                                         
"""            
async def get_current_user(token: str = Depends(oauth_2_scheme), db: Session = Depends(get_session)):
    credential_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credential_exception

        token_data = TokenData(email=email)

    except JWTError:
        raise credential_exception

    user = get_user(db, email=token_data.email)
    if user is None:
        raise credential_exception

    return user

# Dependency wrapper for active user validation (can extend with is_active check)
async def get_current_active_user(current_user: User = Depends(get_current_user)):
    return current_user


# ==========================================                                                                                                                                      
    # API Routes                                                                                                                                                                      
# ========================================== 

# Logs in an existing user and returns a signed JWT access token
@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_session)):
    user = authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

# Returns profile details of the currently authenticated use
@router.get("/users/me/", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

# Registers a new user, saves their hashed password to DB, and returns an access token
@router.post("/signup", response_model=Token)
async def sign_up(data: UserCreate, db: Session = Depends(get_session)):
    existing_user = get_user(db, email=data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )
    
    hashed_password = get_password_hash(data.password)
    new_user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": new_user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}
