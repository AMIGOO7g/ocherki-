@echo off
cd /d "%~dp0"
start "OcherkiSharedLayoutCheck" py local_server.py --port 8850
timeout /t 1 >nul
start "" http://127.0.0.1:8850/qa/shared-layout-browser-check.html
