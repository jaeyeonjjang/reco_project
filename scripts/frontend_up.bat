@echo off
REM === frontend_up.bat (v6) =====================================================
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

%DCCMD% -f "%COMPOSE_DIR%\docker-compose.frontend.yml" up -d --build || goto :fail_up
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

:fail_up
echo [FAIL] Up frontend (check "%COMPOSE_DIR%\docker-compose.frontend.yml")
pause >NUL
exit /b 1
