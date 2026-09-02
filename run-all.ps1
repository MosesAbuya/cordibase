# Bypass pnpm and turbo completely to avoid install hangs

Write-Host "Starting Cordibase Services natively..." -ForegroundColor Cyan

# Define the paths
$baseDir = Get-Location

$services = @(
    @{ Name = "Web Frontend"; Path = "apps\web"; Cmd = "npx.cmd"; Args = @("next", "dev", "-p", "3000") },
    @{ Name = "Core Service"; Path = "apps\service-core"; Cmd = "npx.cmd"; Args = @("tsx", "watch", "src/index.ts") },
    @{ Name = "CRM Service"; Path = "apps\service-crm"; Cmd = "npx.cmd"; Args = @("tsx", "watch", "src/index.ts") },
    @{ Name = "Accounting"; Path = "apps\service-accounting"; Cmd = "npx.cmd"; Args = @("tsx", "watch", "src/index.ts") },
    @{ Name = "HRM Service"; Path = "apps\service-hrm"; Cmd = "npx.cmd"; Args = @("tsx", "watch", "src/index.ts") }
)

foreach ($service in $services) {
    Write-Host "Booting $($service.Name)..." -ForegroundColor Yellow
    Start-Process -FilePath $service.Cmd -ArgumentList $service.Args -WorkingDirectory (Join-Path $baseDir $service.Path)
}

Write-Host "All services have been launched in background terminal windows!" -ForegroundColor Green
Write-Host "The UI will be ready at http://localhost:3000 in a few seconds." -ForegroundColor Green
