# 영화·드라마·웹툰 AI 추천 프로젝트 (Docker Skeleton)

## 구성
- **DB(PostgreSQL)**: `docker/docker-compose.db.yml` — named volume(`reco_pgdata`)로 데이터 영속
- **Backend(Flask)**: `docker/docker-compose.backend.yml` — SQLAlchemy + psycopg2, 간단 REST API
- **Frontend(React/Vite)**: `docker/docker-compose.frontend.yml` — Vite 빌드 후 Nginx 서빙

모든 서비스는 공용 네트워크 **reco_net** 에 묶입니다.

## 빠른 시작 (Windows)
1) Docker Desktop 실행
2) `scripts\up_all.bat` 더블클릭
   - DB(5432), API(8000), WEB(5173) 순으로 올라갑니다.
3) 브라우저에서 http://localhost:5173 접속

## API 예시
- 헬스체크: `GET http://localhost:8000/api/health`
- 작품목록: `GET http://localhost:8000/api/works`
- 작품등록: `POST http://localhost:8000/api/works` ({"title":"인셉션","kind":"movie"})
- 리뷰등록: `POST http://localhost:8000/api/works/1/reviews` ({"user_name":"홍길동","rating":5,"comment":"명작"})
- 추천: `GET http://localhost:8000/api/recommendations`

## 개별 제어
- DB만 올리기: `scripts\db_up.bat` / 내리기: `scripts\db_down.bat`
- Backend만 올리기: `scripts\backend_up.bat` / 내리기: `scripts\backend_down.bat`
- Frontend만 올리기: `scripts\frontend_up.bat` / 내리기: `scripts\frontend_down.bat`
- 전체 내리기: `scripts\down_all.bat` (네트워크/볼륨 유지)

## 메모
- Postgres 데이터는 named volume `reco_pgdata`에 저장됩니다. 컨테이너 재기동/재배포 시에도 데이터가 보존됩니다.
- 초기 스키마/샘플 데이터는 `db/init.sql`에서 생성됩니다.
