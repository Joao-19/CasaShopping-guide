# Build Script para CasaShopping (Windows PowerShell)
# Uso: .\build.ps1 [--no-cache] [--up]

param(
    [switch]$NoCache,
    [switch]$Up
)

$ErrorActionPreference = "Stop"

# Cores para output
function Write-Step { param($msg) Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Fail { param($msg) Write-Host "[ERRO] $msg" -ForegroundColor Red }

# Ordem otimizada: dependencias primeiro
$services = @(
    "db-migration",
    "auth-service",
    "users-service",
    "stores-service",
    "products-service",
    "storage-service",
    "api-gateway",
    "web",
    "admin"
)

$startTime = Get-Date

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║   CasaShopping - Build Sequencial      ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""

$cacheArg = if ($NoCache) { "--no-cache" } else { "" }

$failed = @()
$succeeded = @()

foreach ($service in $services) {
    Write-Step "Building: $service"
    $serviceStart = Get-Date
    
    try {
        if ($NoCache) {
            docker compose build --no-cache $service
        }
        else {
            docker compose build $service
        }
        
        if ($LASTEXITCODE -eq 0) {
            $elapsed = (Get-Date) - $serviceStart
            Write-Success "$service concluido em $($elapsed.ToString('mm\:ss'))"
            $succeeded += $service
        }
        else {
            throw "Build falhou"
        }
    }
    catch {
        Write-Fail "$service falhou: $_"
        $failed += $service
    }
}

$totalTime = (Get-Date) - $startTime

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║           RESUMO DO BUILD              ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""
Write-Host "Tempo total: $($totalTime.ToString('mm\:ss'))" -ForegroundColor White
Write-Host "Sucesso: $($succeeded.Count)/$($services.Count)" -ForegroundColor $(if ($failed.Count -eq 0) { "Green" } else { "Yellow" })

if ($failed.Count -gt 0) {
    Write-Host "Falharam: $($failed -join ', ')" -ForegroundColor Red
    exit 1
}

if ($Up) {
    Write-Step "Iniciando containers..."
    docker compose up -d
}

Write-Host ""
Write-Success "Build concluido com sucesso!"
Write-Host ""
