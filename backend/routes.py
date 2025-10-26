# routes.py
# 목적: REST API 엔드포인트 정의 (작품 목록/등록, 리뷰 작성/목록, 간단 추천).
from flask import Blueprint, request, jsonify, abort
from sqlalchemy import select, func, desc
from database import db_session
from models import Work, Review

api_bp = Blueprint("api", __name__)

@api_bp.get("/works")
def list_works():
    """작품 목록 조회 (?kind=movie|drama|webtoon)"""
    kind = request.args.get("kind")
    stmt = select(Work)
    if kind:
        stmt = stmt.where(Work.kind == kind)
    works = db_session.execute(stmt.order_by(Work.id.desc())).scalars().all()
    data = [
        {"id": w.id, "title": w.title, "kind": w.kind}
        for w in works
    ]
    return jsonify(data)

@api_bp.post("/works")
def create_work():
    """작품 등록 (title, kind)"""
    data = request.get_json(force=True, silent=True) or {}
    title = data.get("title")
    kind = data.get("kind")
    if not title or kind not in ("movie","drama","webtoon"):
        abort(400, "title과 kind(movie|drama|webtoon)가 필요합니다.")
    w = Work(title=title, kind=kind)
    db_session.add(w)
    db_session.commit()
    return jsonify({"id": w.id, "title": w.title, "kind": w.kind}), 201

@api_bp.get("/works/<int:work_id>/reviews")
def list_reviews(work_id: int):
    """특정 작품의 리뷰 목록 조회"""
    work = db_session.get(Work, work_id)
    if not work:
        abort(404, "작품을 찾을 수 없습니다.")
    stmt = select(Review).where(Review.work_id == work_id).order_by(Review.id.desc())
    reviews = db_session.execute(stmt).scalars().all()
    data = [
        {
            "id": r.id,
            "user_name": r.user_name,
            "rating": r.rating,
            "comment": r.comment,
        } for r in reviews
    ]
    return jsonify(data)

@api_bp.post("/works/<int:work_id>/reviews")
def create_review(work_id: int):
    """특정 작품에 한줄평 등록 (user_name, rating[1..5], comment)"""
    work = db_session.get(Work, work_id)
    if not work:
        abort(404, "작품을 찾을 수 없습니다.")
    data = request.get_json(force=True, silent=True) or {}
    user_name = data.get("user_name")
    rating = data.get("rating")
    comment = data.get("comment")
    if not user_name or not isinstance(rating, int) or not (1 <= rating <= 5) or not comment:
        abort(400, "user_name, rating(1..5), comment가 필요합니다.")
    rv = Review(work_id=work_id, user_name=user_name, rating=rating, comment=comment)
    db_session.add(rv)
    db_session.commit()
    return jsonify({"id": rv.id}), 201

@api_bp.get("/recommendations")
def recommendations():
    """간단 추천: 평균 평점 상위 작품 5개 반환 (kind 필터 가능)"""
    kind = request.args.get("kind")
    # 평균 평점 계산
    subq = (
        db_session.query(
            Review.work_id.label("work_id"),
            func.avg(Review.rating).label("avg_rating"),
            func.count(Review.id).label("cnt"),
        )
        .group_by(Review.work_id)
        .subquery()
    )

    q = (
        db_session.query(Work, subq.c.avg_rating, subq.c.cnt)
        .join(subq, Work.id == subq.c.work_id)
    )
    if kind:
        q = q.filter(Work.kind == kind)

    rows = q.order_by(desc(subq.c.avg_rating), desc(subq.c.cnt)).limit(5).all()
    result = [
        {
            "id": w.id,
            "title": w.title,
            "kind": w.kind,
            "avg_rating": float(avg or 0),
            "review_count": int(cnt or 0),
        }
        for (w, avg, cnt) in rows
    ]
    return jsonify(result)
