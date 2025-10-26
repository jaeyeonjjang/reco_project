# app.py
# 목적: Flask 애플리케이션 팩토리 및 블루프린트 등록.
# 컨셉: 작품/리뷰 CRUD 및 간단한 추천 API 제공.

from flask import Flask, jsonify
from flask_cors import CORS
from database import init_db, db_session
from routes import api_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    # DB 초기화 (테이블 생성)
    init_db()

    # Healthcheck 엔드포인트
    @app.route("/api/health")
    def health():
        return jsonify(status="ok")

    # API 블루프린트 등록 (/api/*)
    app.register_blueprint(api_bp, url_prefix="/api")

    # 요청 종료 시 세션 정리
    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db_session.remove()

    return app
