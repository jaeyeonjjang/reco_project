@echo off
REM === up_all.bat (v10) ========================================================
setlocal ENABLEEXTENSIONS ENABLEDELAYEDEXPANSION

REM Detect docker compose CLI
set "DCCMD=docker compose"
docker compose version >NUL 2>&1
if errorlevel 1 (
  docker-compose --version >NUL 2>&1 || goto :fail_docker
  set "DCCMD=docker-compose"
)

REM Resolve compose dir absolute path
pushd "%~dp0..\docker" >NUL 2>&1 || goto :fail_path
set "COMPOSE_DIR=%CD%"
popd >NUL

set "NET=reco_net"

echo [1/5] Ensure network: %NET%
docker network inspect "%NET%" >NUL 2>&1
if errorlevel 1 (
  docker network create "%NET%" >NUL 2>&1 || goto :fail_net
)

echo [2/5] Up DB
%DCCMD% -f "%COMPOSE_DIR%\docker-compose.db.yml" up -d --build || goto :fail_db

echo [3/5] Wait for DB healthy (timeout ~150s)
set "HS="
for /l %%i in (1,1,150) do (
  for /f "delims=" %%s in ('docker inspect --format "{{.State.Health.Status}}" reco_postgres 2^>NUL') do set "HS=%%s"
  if /I "!HS!"=="healthy" goto :db_ok
  if /I "!HS!"=="unhealthy" goto :fail_db_unhealthy
  if "!HS!"=="" (
    REM container not ready yet
  )
  <nul set /p="."
  timeout /t 1 >NUL
)
echo.
goto :fail_db_timeout

:db_ok
echo.
echo DB is healthy.

echo [4/5] Up Backend
%DCCMD% -f "%COMPOSE_DIR%\docker-compose.backend.yml" up -d --build || goto :fail_api

echo [5/5] Up Frontend
%DCCMD% -f "%COMPOSE_DIR%\docker-compose.frontend.yml" up -d --build || goto :fail_web

echo.
echo Done.

REM === Open main page in default browser =======================================
echo Opening http://localhost:5173/ ...
start "" "http://localhost:5173/"
exit /b 0

:fail_docker
echo [FAIL] Docker Compose not found.
pause >NUL
exit /b 1

:fail_path
echo [FAIL] Cannot resolve compose directory: "%~dp0..\docker"
pause >NUL
exit /b 1

:fail_net
echo [FAIL] Ensure/Create network: %NET%
pause >NUL
exit /b 1

:fail_db
echo [FAIL] Up DB (check "%COMPOSE_DIR%\docker-compose.db.yml")
pause >NUL
exit /b 1

:fail_db_unhealthy
echo.
echo [FAIL] DB became UNHEALTHY. Check Postgres logs: docker logs reco_postgres
pause >NUL
exit /b 1

:fail_db_timeout
echo.
echo [FAIL] Timed out waiting for DB to be healthy.
pause >NUL
exit /b 1

:fail_api
echo [FAIL] Up Backend (check "%COMPOSE_DIR%\docker-compose.backend.yml")
pause >NUL
exit /b 1

:fail_web
echo [FAIL] Up Frontend (check "%COMPOSE_DIR%\docker-compose.frontend.yml")
pause >NUL
exit /b 1
