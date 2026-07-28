@echo off
setlocal enabledelayedexpansion

echo ========================================
echo  ContentHub - Development Server Starter
echo ========================================
echo(

REM Step 1: Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 goto start_docker
echo [1/3] Docker Desktop is already running.
goto step2

:start_docker
echo [1/3] Docker Desktop is not running. Starting it...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
echo        Waiting for Docker to start (this may take a moment)...

set count=0
:wait_docker
timeout /t 3 /nobreak >nul
docker info >nul 2>&1
if !errorlevel! neq 0 (
    set /a count+=1
    if !count! lss 20 goto wait_docker
    echo [ERROR] Docker failed to start within 60 seconds.
    echo         Please start Docker Desktop manually and try again.
    pause
    exit /b 1
)
echo        Docker Desktop is now running.

:step2
REM Step 2: Start PostgreSQL container
echo [2/3] Starting PostgreSQL container...
docker start contenthub-postgres >nul 2>&1
if %errorlevel% neq 0 goto create_container
echo        PostgreSQL container started successfully.
goto step3

:create_container
echo        Container not found. Creating and starting...
docker run -d --name contenthub-postgres --restart unless-stopped -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=contenthub -p 5432:5432 postgres:16-alpine

:step3
REM Step 3: Wait for PostgreSQL to accept connections
echo        Waiting for PostgreSQL to be ready...
set count=0
:wait_postgres
timeout /t 2 /nobreak >nul
docker exec contenthub-postgres pg_isready -U postgres >nul 2>&1
if !errorlevel! neq 0 (
    set /a count+=1
    if !count! lss 15 goto wait_postgres
    echo [ERROR] PostgreSQL failed to start within 30 seconds.
    pause
    exit /b 1
)
echo        PostgreSQL is ready! (connected on localhost:5432)

REM Step 4: Start Next.js dev server
echo [3/3] Starting Next.js development server...
echo(
npm run dev:next
