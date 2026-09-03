import os
from collections.abc import Generator

from sqlalchemy import URL, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


# A complete DATABASE_URL is convenient when running manually. In Docker
# Compose, separate fields let URL.create() safely escape passwords containing
# reserved URL characters such as @, :, /, #, or %.
database_url = os.getenv("DATABASE_URL")
DATABASE_URL = database_url or URL.create(
    drivername="postgresql+psycopg",
    username=os.getenv("DB_USER", "taskuser"),
    password=os.getenv("DB_PASSWORD", "taskpassword"),
    host=os.getenv("DB_HOST", "localhost"),
    port=int(os.getenv("DB_PORT", "5432")),
    database=os.getenv("DB_NAME", "taskdb"),
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
