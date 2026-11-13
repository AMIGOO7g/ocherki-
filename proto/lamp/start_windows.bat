@echo off
cd /d "%~dp0"
start "OcherkiLampProto" py -m http.server 8851
timeout /t 1 >nul
start "" http://127.0.0.1:8851/index.html
