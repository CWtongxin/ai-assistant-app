@echo off
chcp 65001 >nul
setlocal

echo ======================================
echo       AI插件应用 - 一键发布更新
echo ======================================
echo.

REM 读取当前版本号
for /f "tokens=2 delims=:" %%a in ('findstr /C:"\"version\"" package.json') do (
    set "v=%%a"
)
set "v=%v:"=%"
set "v=%v:,=%"
set "v=%v: =%"
echo 当前版本: %v%

REM 解析版本号
for /f "tokens=1-3 delims=." %%a in ("%v%") do (
    set major=%%a
    set minor=%%b
    set patch=%%c
)

REM 递增修订版本号
set /a patch+=1
set "new_version=%major%.%minor%.%patch%"
echo 新版本号: %new_version%
echo.

REM 更新 package.json
powershell -Command "$p=Get-Content 'package.json' -Raw; $p -replace '\"version\":\s*\"[^\"]+\"', '\"version\": \"%new_version%\"' | Set-Content 'package.json'"

REM 提交代码
echo [1/4] 提交代码到 Git...
git add package.json src/
git commit -m "Auto update: version %new_version%"
git push origin master

REM 构建应用
echo.
echo [2/4] 构建应用...
npm run electron:build:win

REM 创建 GitHub Release
echo.
echo [3/4] 创建 GitHub Release...
gh release create "v%new_version%" --notes "自动更新 v%new_version%" --title "v%new_version%"

REM 上传安装包
echo.
echo [4/4] 上传安装包...
gh release upload "v%new_version%" "release\AI插件应用 Setup %new_version%.exe"

echo.
echo ======================================
echo 发布完成! 新版本 v%new_version% 已发布
echo ======================================
pause