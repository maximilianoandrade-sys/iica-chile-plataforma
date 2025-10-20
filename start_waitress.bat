@echo off
setlocal ENABLEDELAYEDEXPANSION
REM Activar venv y lanzar Waitress en puerto 5004
pushd %~dp0
if exist venv\Scripts\activate.bat (
  call venv\Scripts\activate.bat
)
waitress-serve --host=0.0.0.0 --port=5004 app_working:app
popd
endlocal
