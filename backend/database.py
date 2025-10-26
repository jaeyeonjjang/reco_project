# database.py
# 목적: SQLAlchemy ORM과 Postgres 연결을 설정하고, 세션/베이스 객체를 제공합니다.

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker, declarative_base

# 환경변수로부터 DB URL 로드 (docker-compose.backend.yml에서 주입)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://appuser:apppass@localhost:5432/appdb")

# Engine 생성 (pool_pre_ping으로 죽은 커넥션 감지)
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# thread-local 세션
db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

# Declarative Base
Base = declarative_base()
Base.query = db_session.query_property()

def init_db():
    """모델을 import한 뒤 Base.metadata.create_all로 테이블 생성."""
    from models import Work, Review  # noqa: F401
    Base.metadata.create_all(bind=engine)
