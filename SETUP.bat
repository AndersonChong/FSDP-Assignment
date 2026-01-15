@echo off
REM Quick Setup Script for AI Agent Platform

echo.
echo ========================================
echo   AI Agent Platform - Quick Setup
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found. Install Python 3.8+ first.
    exit /b 1
)

echo [1/5] Creating virtual environment...
cd backend
python -m venv venv
call venv\Scripts\activate.bat

echo [2/5] Installing dependencies...
pip install -r requirements.txt -q

echo [3/5] Backend ready!
echo.
echo ========================================
echo   NEXT STEPS:
echo ========================================
echo.
echo IMPORTANT: Open TWO PowerShell windows
echo.
echo Window 1 - Backend:
echo   cd backend
echo   .\venv\Scripts\Activate.ps1
echo   $env:OPENAI_API_KEY = "sk-your-openai-key"
echo   $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\serviceaccount.json"
echo   uvicorn main:app --reload --port 8000
echo.
echo Window 2 - Frontend:
echo   npm start
echo.
echo Then follow: TESTING_GUIDE.md
echo.
