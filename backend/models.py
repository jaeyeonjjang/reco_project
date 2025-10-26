# models.py
# 목적: 작품(Work)과 한줄평(Review)에 대한 SQLAlchemy 모델 정의.

from sqlalchemy import Column, Integer, String, Text, ForeignKey, CheckConstraint, func, DateTime
from sqlalchemy.orm import relationship
from database import Base

class Work(Base):
    __tablename__ = "works"
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    kind = Column(String(20), nullable=False)  # movie | drama | webtoon
    created_at = Column(DateTime, server_default=func.now())

    reviews = relationship("Review", back_populates="work", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("kind IN ('movie','drama','webtoon')", name="ck_works_kind"),
    )

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True)
    work_id = Column(Integer, ForeignKey("works.id", ondelete="CASCADE"), nullable=False)
    user_name = Column(String(100), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    work = relationship("Work", back_populates="reviews")

    __table_args__ = (
        CheckConstraint("rating BETWEEN 1 AND 5", name="ck_reviews_rating"),
    )
