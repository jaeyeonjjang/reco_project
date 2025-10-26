@echo off
REM === restart_all.bat (v6) ===================================================
setlocal ENABLEEXTENSIONS ENABLEDELAYEDEXPANSION

call "%~dp0down_all.bat"
if errorlevel 1 (
  echo [FAIL] down_all.bat
  pause >NUL
  exit /b %ERRORLEVEL%
)

call "%~dp0up_all.bat"
if errorlevel 1 (
  echo [FAIL] up_all.bat
  pause >NUL
  exit /b %ERRORLEVEL%
)

echo.
echo Done.
exit /b 0
