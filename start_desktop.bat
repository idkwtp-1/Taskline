@echo off
title TASKLINE // DESKTOP LAUNCHER

:: Check if run with --silent or from scheduler
set "SILENT_MODE=0"
if "%1"=="--silent" set "SILENT_MODE=1"

if "%SILENT_MODE%"=="1" (
    where pythonw >nul 2>nul
    if %errorlevel% equ 0 (
        start "" pythonw "%~dp0desktop_launcher.py"
    ) else (
        start "" python "%~dp0desktop_launcher.py"
    )
) else (
    echo [TaskLine] Starting TaskLine desktop app...
    python "%~dp0desktop_launcher.py"
    if %errorlevel% neq 0 (
        echo [Error] Failed to launch TaskLine. Make sure Python is in your PATH.
        pause
    )
)
