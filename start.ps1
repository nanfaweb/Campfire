$rootDir = $PSScriptRoot

Write-Host "Starting Marshmellow Python backend on http://localhost:8000" -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$rootDir\marshmellow'; '$rootDir\venv\Scripts\python.exe' -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
)

Start-Sleep -Seconds 2

Write-Host "Starting Next.js frontend on http://localhost:3000" -ForegroundColor Cyan
Set-Location $rootDir
npm run dev
