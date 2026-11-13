@echo off
cd /d "%~dp0"
start "OcherkiArchiveProto" py -m http.server 8853
timeout /t 1 >nul
start "" http://127.0.0.1:8853/proto/archive/index.html
