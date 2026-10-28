@echo off
cd /d "%~dp0"
start "OcherkiLocalServerV15" py local_server.py --port 8849
timeout /t 1 >nul
start "" http://127.0.0.1:8849/book-renderer/master-proof.html
