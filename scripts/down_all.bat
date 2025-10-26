@echo off
REM === down_all.bat (v6 - simple, robust) =====================================
setlocal ENABLEEXTENSIONS ENABLEDELAYEDEXPANSION

set "DCCMD=docker compose"
docker compose version >NUL 2>&1
if errorlevel 1 (
  docker-compose --version >NUL 2>&1 || goto :fail_docker
  set "DCCMD=docker-compose"
)

pushd "%~dp0..\docker" >NUL 2>&1 || goto :fail_path
set "COMPOSE_DIR=%CD%"
popd >NUL

echo [1/3] Down Frontend
%DCCMD% -f "%COMPOSE_DIR%\docker-compose.frontend.yml" down || goto :fail_web

echo [2/3] Down Backend
%DCCMD% -f "%COMPOSE_DIR%\docker-compose.backend.yml" down || goto :fail_api

echo [3/3] Down DB
%DCCMD% -f "%COMPOSE_DIR%\docker-compose.db.yml" down || goto :fail_db

echo.
echo Done.
exit /b 0

:fail_docker
echo [FAIL] Docker Compose not found.
pause >NUL
exit /b 1

:fail_path
echo [FAIL] Cannot resolve compose directory: "%~dp0..\docker"
pause >NUL
exit /b 1

:fail_web
echo [FAIL] Down Frontend
pause >NUL
exit /b 1

:fail_api
echo [FAIL] Down Backend
pause >NUL
exit /b 1

:fail_db
echo [FAIL] Down DB
pause >NUL
exit /b 1
