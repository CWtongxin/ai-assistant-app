# GitHub 自动发布脚本
# 用法: .\发布.ps1 -Version "1.0.1" -Title "v1.0.1 - 更新说明" -Token "your_github_token"

param(
    [string]$Version = '1.0.0',
    [string]$Title = "v$Version - 新版本发布",
    [string]$Token = '',
    [string]$Notes = '自动发布的版本更新'
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI插件应用 - GitHub自动发布工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 配置信息
$Owner = "CWtongxin"
$Repo = "ai-assistant-app"
$Installer = "release\AI插件应用 Setup $Version.exe"
$LatestYml = "release\latest.yml"
$Blockmap = "release\AI插件应用 Setup $Version.exe.blockmap"

Write-Host "📦 版本: v$Version" -ForegroundColor Yellow
Write-Host "📁 仓库: $Owner/$Repo" -ForegroundColor Yellow
Write-Host ""

# 检查文件是否存在
Write-Host "🔍 检查发布文件..." -ForegroundColor Cyan

if (-not (Test-Path $Installer)) {
    Write-Host "❌ 错误：找不到安装包 $Installer" -ForegroundColor Red
    Write-Host "💡 请先运行: npm run electron:build:win" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ 安装包存在: $Installer" -ForegroundColor Green

if (-not (Test-Path $LatestYml)) {
    Write-Host "❌ 错误：找不到更新配置文件 $LatestYml" -ForegroundColor Red
    Write-Host "💡 该文件在打包时自动生成" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ 配置文件存在: $LatestYml" -ForegroundColor Green

if (Test-Path $Blockmap) {
    Write-Host "✅ Blockmap文件存在: $Blockmap" -ForegroundColor Green
}

Write-Host ""

# 检查GitHub CLI
$hasGh = Get-Command gh -ErrorAction SilentlyContinue

if ($hasGh -and $Token) {
    Write-Host "🚀 使用GitHub CLI自动发布..." -ForegroundColor Cyan
    
    # 认证
    if ($Token) {
        Write-Host "🔑 配置GitHub Token..." -ForegroundColor Yellow
        $env:GH_TOKEN = $Token
    }
    
    # 检查认证状态
    try {
        $authStatus = gh auth status 2>&1
        Write-Host "✅ GitHub CLI已认证" -ForegroundColor Green
    } catch {
        Write-Host "❌ GitHub CLI未认证，请先运行: gh auth login" -ForegroundColor Red
        exit 1
    }
    
    # 创建Release
    Write-Host "📝 创建GitHub Release v$Version..." -ForegroundColor Cyan
    
    $releaseArgs = @(
        "release", "create", "v$Version",
        "--title", $Title,
        "--notes", $Notes,
        $Installer,
        $LatestYml
    )
    
    if (Test-Path $Blockmap) {
        $releaseArgs += $Blockmap
    }
    
    try {
        & gh @releaseArgs
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✅ 发布成功！" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 查看Release: https://github.com/$Owner/$Repo/releases/tag/v$Version" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "💡 用户将在启动应用时自动收到更新通知" -ForegroundColor Yellow
    } catch {
        Write-Host "❌ 发布失败: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "  📋 手动发布指南" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    
    if (-not $hasGh) {
        Write-Host "⚠️  未检测到GitHub CLI" -ForegroundColor Yellow
        Write-Host "💡 安装GitHub CLI后可实现自动发布: https://cli.github.com/" -ForegroundColor Yellow
        Write-Host ""
    }
    
    Write-Host "请按以下步骤手动发布：" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1️⃣  打开GitHub Release页面:" -ForegroundColor Yellow
    Write-Host "    https://github.com/$Owner/$Repo/releases/new" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2️⃣  填写发布信息:" -ForegroundColor Yellow
    Write-Host "    Tag version:     v$Version" -ForegroundColor White
    Write-Host "    Release title:   $Title" -ForegroundColor White
    Write-Host "    Description:     $Notes" -ForegroundColor White
    Write-Host ""
    Write-Host "3️⃣  上传以下文件:" -ForegroundColor Yellow
    Write-Host "    📦 $Installer" -ForegroundColor White
    Write-Host "    📄 $LatestYml" -ForegroundColor White
    if (Test-Path $Blockmap) {
        Write-Host "    📄 $Blockmap" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "4️⃣  点击 'Publish release'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  发布完成后，用户将自动收到更新！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    # 自动打开浏览器
    $openBrowser = Read-Host "是否打开GitHub Release页面？(Y/N)"
    if ($openBrowser -eq "Y" -or $openBrowser -eq "y") {
        Start-Process "https://github.com/$Owner/$Repo/releases/new"
        Write-Host "✅ 已打开浏览器" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "📖 详细文档请查看: 配置自动更新.md" -ForegroundColor Cyan
