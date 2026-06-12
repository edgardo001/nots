@echo off
set "PATH=%USERPROFILE%\.bun\bin;%PATH%"
cd /d "%~dp0src\frontend"
bun run dev
pause
