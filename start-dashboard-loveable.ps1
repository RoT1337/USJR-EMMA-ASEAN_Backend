<#
  start-dashboard-loveable.ps1

  Opens three separate PowerShell windows, one per EMMA service, so you can
  spin up the whole stack for the Loveable-UI dashboard testing ground with
  a single command:

    1. Laravel API            (laravel/)              -> http://localhost:8000
    2. Python agent service   (agents/)                -> http://localhost:8001
    3. Dashboard (Loveable UI) (dashboard-loveable/)   -> http://localhost:5174

  This assumes you've already done first-time setup for each service at least
  once (see README.md and dashboard-loveable/README.md): composer install,
  `.env` files filled in, DB migrated/seeded, Python venv created + deps
  installed, `npm install` run in dashboard-loveable/. This script only
  launches the already-configured services -- it does not provision them.

  Usage (from the repo root, in PowerShell):
      .\start-dashboard-loveable.ps1

  If PowerShell blocks the script with an "execution policy" error, run this
  once (as your normal user, not Administrator) and try again:
      Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
#>

$root = $PSScriptRoot

function Start-ServiceWindow {
    param(
        [string]$Title,
        [string]$WorkingDir,
        [string]$Command
    )
    $fullCommand = "cd `"$WorkingDir`"; `$Host.UI.RawUI.WindowTitle = '$Title'; $Command"
    Start-Process powershell -ArgumentList '-NoExit', '-Command', $fullCommand | Out-Null
}

Write-Host "Starting EMMA services for the Loveable UI testing ground..." -ForegroundColor Cyan

# 1. Laravel API (port 8000)
$laravelDir = Join-Path $root 'laravel'
Start-ServiceWindow -Title 'EMMA - Laravel :8000' -WorkingDir $laravelDir -Command 'php artisan serve'
Start-Sleep -Seconds 2

# 2. Python agent service (port 8001)
$agentsDir = Join-Path $root 'agents'
$venvActivate = Join-Path $agentsDir 'venv\Scripts\Activate.ps1'
if (Test-Path $venvActivate) {
    Start-ServiceWindow -Title 'EMMA - Agents :8001' -WorkingDir $agentsDir -Command '. .\venv\Scripts\Activate.ps1; uvicorn main:app --reload --port 8001'
} else {
    Write-Host "No venv found at agents\venv -- create one first (README.md, 'Python agent service' section)." -ForegroundColor Yellow
    Start-ServiceWindow -Title 'EMMA - Agents :8001' -WorkingDir $agentsDir -Command 'uvicorn main:app --reload --port 8001'
}
Start-Sleep -Seconds 2

# 3. Dashboard with the new Loveable UI (port 5174, kept distinct from the
#    real dashboard's usual 5173 so you can run both side by side)
$dashboardDir = Join-Path $root 'dashboard-loveable'
Start-ServiceWindow -Title 'EMMA - Dashboard-Loveable :5174' -WorkingDir $dashboardDir -Command 'npm run dev -- --port 5174'

Write-Host ""
Write-Host "Three windows launched:" -ForegroundColor Green
Write-Host "  Laravel   -> http://localhost:8000"
Write-Host "  Agents    -> http://localhost:8001/health"
Write-Host "  Dashboard -> http://localhost:5174 (once Vite finishes starting)"
