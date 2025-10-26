# run.py
# 목적: 프로덕션 WSGI 서버(waitress)로 Flask 앱을 실행합니다.
from waitress import serve
from app import create_app

# 앱 팩토리로 Flask 앱 생성
app = create_app()

if __name__ == "__main__":
    # 0.0.0.0 바인딩으로 컨테이너 외부 접근 허용, 포트 8000
    serve(app, host="0.0.0.0", port=8000)
