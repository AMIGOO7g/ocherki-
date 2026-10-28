@echo off
cd /d "%~dp0"
start "OcherkiPaginationCheck" py local_server.py --port 8850
timeout /t 1 >nul
start "" http://127.0.0.1:8850/qa/dom-pagination-browser-check.html
