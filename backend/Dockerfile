# backend/Dockerfile
# 목적: Flask 백엔드 컨테이너 이미지를 빌드합니다.
FROM python:3.11-slim

# 시스템 패키지 (psycopg2 빌드 의존성 등) 설치
RUN apt-get update && apt-get install -y --no-install-recommends \ 
    build-essential libpq-dev &&     rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 의존성 먼저 복사/설치 (레이어 캐시 이점)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 앱 소스 복사
COPY . .

# 8000 포트로 실행 (waitress 사용: 운영에 적합)
EXPOSE 8000

# 컨테이너 시작 시 서버 실행
CMD ["python", "run.py"]
