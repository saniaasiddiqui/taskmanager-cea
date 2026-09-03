from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models
from app.auth import ALGORITHM, SECRET_KEY
from app.database import get_db


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")
DbSession = Annotated[Session, Depends(get_db)]
TokenString = Annotated[str, Depends(oauth2_scheme)]


def get_current_user(token: TokenString, db: DbSession) -> models.User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not isinstance(username, str):
            raise credentials_error
    except InvalidTokenError as exc:
        raise credentials_error from exc

    user = db.scalar(select(models.User).where(models.User.username == username))
    if user is None:
        raise credentials_error
    return user


CurrentUser = Annotated[models.User, Depends(get_current_user)]
