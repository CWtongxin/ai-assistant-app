$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI Plugin - Auto Publish" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$Token = $env:GITHUB_TOKEN
if (-not $Token) {
    Write-Host "Error: GITHUB_TOKEN not set" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Update version..." -ForegroundColor Cyan
npm version patch
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$newVersion = $packageJson.version
Write-Host "Version: v$newVersion" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Build app..." -ForegroundColor Cyan
npm run electron:build:win
Write-Host "Build complete" -ForegroundColor Green
Write-Host ""

$Installer = "release/AI.Setup.$newVersion.exe"
$LatestYml = "release/latest.yml"
$Blockmap = "release/AI.Setup.$newVersion.exe.blockmap"

if (-not (Test-Path $Installer)) {
    $Installer = Get-ChildItem release -Filter "*.exe" | Select-Object -First 1 | ForEach-Object { $_.FullName }
    if (-not $Installer) {
        Write-Host "Error: Installer not found" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Step 3: Upload to GitHub..." -ForegroundColor Cyan
$headers = @{ Authorization = "token $Token" }

$body = @{
    tag_name = "v$newVersion"
    name = "v$newVersion - Update"
    body = "AI Plugin v$newVersion"
} | ConvertTo-Json

try {
    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/CWtongxin/ai-assistant-app/releases" -Method Post -Headers $headers -Body $body -ContentType "application/json"
    $releaseId = $release.id
    Write-Host "Release created" -ForegroundColor Green
} catch {
    $releases = Invoke-RestMethod -Uri "https://api.github.com/repos/CWtongxin/ai-assistant-app/releases" -Headers $headers
    $release = $releases | Where-Object { $_.tag_name -eq "v$newVersion" }
    $releaseId = $release.id
    Write-Host "Using existing Release" -ForegroundColor Yellow
}

$uploadHeaders = @{ 
    Authorization = "token $Token"
    "Content-Type" = "application/octet-stream"
}

Write-Host "  Upload latest.yml..."
$uploadUrl = "https://uploads.github.com/repos/CWtongxin/ai-assistant-app/releases/$releaseId/assets?name=latest.yml"
try {
    Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers $uploadHeaders -InFile $LatestYml | Out-Null
    Write-Host "  OK: latest.yml" -ForegroundColor Green
} catch {
    Write-Host "  Skip: latest.yml (exists)" -ForegroundColor Yellow
}

Write-Host "  Upload installer..."
$uploadUrl = "https://uploads.github.com/repos/CWtongxin/ai-assistant-app/releases/$releaseId/assets?name=AI.Setup.$newVersion.exe"
try {
    Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers $uploadHeaders -InFile $Installer | Out-Null
    Write-Host "  OK: installer" -ForegroundColor Green
} catch {
    Write-Host "  Skip: installer (exists)" -ForegroundColor Yellow
}

if (Test-Path $Blockmap) {
    Write-Host "  Upload blockmap..."
    $uploadUrl = "https://uploads.github.com/repos/CWtongxin/ai-assistant-app/releases/$releaseId/assets?name=AI.Setup.$newVersion.exe.blockmap"
    try {
        Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers $uploadHeaders -InFile $Blockmap | Out-Null
        Write-Host "  OK: blockmap" -ForegroundColor Green
    } catch {
        Write-Host "  Skip: blockmap (exists)" -ForegroundColor Yellow
    }
}

git add .
git commit -m "Release v$newVersion" 2>$null
git push origin master 2>$null

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Success! v$newVersion" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
