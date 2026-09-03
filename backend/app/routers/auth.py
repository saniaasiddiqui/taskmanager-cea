from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import or_, select

from app import models, schemas
from app.auth import create_access_token, hash_password, verify_password
from app.dependencies import DbSession


router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=schemas.UserRead, status_code=status.HTTP_201_CREATED)
def register(user_data: schemas.UserCreate, db: DbSession) -> models.User:
    existing = db.scalar(
        select(models.User).where(
            or_(
                models.User.username == user_data.username,
                models.User.email == user_data.email,
            )
        )
    )
    if existing:
        raise HTTPException(status_code=400, detail="Username or email is already registered")

    user = models.User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/token", response_model=schemas.Token)
def login(
    db: DbSession,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> schemas.Token:
    # OAuth2 calls this field "username"; users log in with their username.
    user = db.scalar(select(models.User).where(models.User.username == form_data.username))
    if user is None or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return schemas.Token(
        access_token=create_access_token(user.username), token_type="bearer"
    )
