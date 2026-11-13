@echo off
cd /d "%~dp0"
start "OcherkiLampProto3" py -m http.server 8852
timeout /t 1 >nul
start "" http://127.0.0.1:8852/index.html
