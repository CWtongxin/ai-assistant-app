# 🚀 GitHub自动更新完整指南

## ✅ 当前配置状态

你的应用已经完全配置好GitHub自动更新功能！

### 配置信息
- **GitHub用户**: CWtongxin
- **仓库名称**: ai-assistant-app
- **仓库地址**: https://github.com/CWtongxin/ai-assistant-app
- **当前版本**: 1.0.0
- **更新提供商**: GitHub Releases

---

## 📋 首次发布到GitHub（v1.0.0）

### 方法一：使用增强版发布脚本（推荐）

```powershell
# 打开PowerShell，进入项目目录
cd e:\AI插件

# 运行发布脚本
.\发布.ps1 -Version "1.0.0" -Title "v1.0.0 - 初始版本"
```

脚本会自动：
1. ✅ 检查安装包和配置文件是否存在
2. ✅ 提示你手动发布或自动发布（如果安装了GitHub CLI）
3. ✅ 自动打开浏览器到Release页面

### 方法二：手动发布

#### 1. 打开GitHub Release页面
访问：https://github.com/CWtongxin/ai-assistant-app/releases/new

#### 2. 填写发布信息
- **Tag version**: `v1.0.0`
- **Release title**: `v1.0.0 - 初始版本`
- **Description**: 
  ```
  AI插件应用 v1.0.0 正式发布！
  
  功能特性：
  - 🤖 支持Ollama本地AI模型
  - ☁️ 支持OpenAI API
  - 📚 学习辅导、办公效率、编程开发等多场景
  - 📎 支持PDF、Word、Excel等文件分析
  - 🎨 黑白极简设计，纯中文界面
  ```

#### 3. 上传文件
点击"Attach binaries by dropping them here or selecting them."

上传以下3个文件：
- 📦 `release/AI插件应用 Setup 1.0.0.exe` （安装包，约208MB）
- 📄 `release/latest.yml` （更新配置文件，**非常重要！**）
- 📄 `release/AI插件应用 Setup 1.0.0.exe.blockmap` （增量更新文件）

#### 4. 发布
点击 **"Publish release"** 按钮

---

## 🔄 发布新版本流程

每次发布更新的完整步骤：

### 步骤1：更新代码
修改你的应用代码，添加新功能或修复bug。

### 步骤2：更新版本号

```powershell
# 小修复（1.0.0 -> 1.0.1）
npm version patch

# 新功能（1.0.0 -> 1.1.0）
npm version minor

# 大更新（1.0.0 -> 2.0.0）
npm version major
```

### 步骤3：重新打包

```powershell
npm run electron:build:win
```

打包完成后，`release` 目录会生成：
- `AI插件应用 Setup 1.0.1.exe` - 新安装包
- `latest.yml` - 新更新配置
- `AI插件应用 Setup 1.0.1.exe.blockmap` - 增量更新文件

### 步骤4：发布到GitHub

```powershell
# 使用发布脚本
.\发布.ps1 -Version "1.0.1" -Title "v1.0.1 - 修复XXX问题"
```

或手动发布到：https://github.com/CWtongxin/ai-assistant-app/releases/new

### 步骤5：完成！
用户启动应用时会自动检测到更新并下载。

---

## 📱 用户体验

### 自动更新流程
```
用户打开应用
    ↓
后台自动检查更新（连接GitHub Releases）
    ↓
发现新版本 → 弹出通知："发现新版本 v1.0.1"
    ↓
自动在后台下载更新
    ↓
下载完成 → 弹出对话框："新版本已下载完成，是否立即重启安装？"
    ↓
用户点击"立即重启"
    ↓
自动安装并重启应用
    ↓
✅ 更新完成！
```

### 手动检查更新
用户可以通过两种方式手动检查更新：
1. **菜单栏**：文件 → 检查更新
2. **侧边栏**：点击"🔄 检查更新"按钮

---

## 🔧 高级配置

### 使用GitHub CLI自动发布

如果想实现一键自动发布，可以安装GitHub CLI：

#### 1. 安装GitHub CLI
访问：https://cli.github.com/

或使用winget安装：
```powershell
winget install GitHub.cli
```

#### 2. 认证GitHub
```powershell
gh auth login
```
按提示完成认证。

#### 3. 自动发布
```powershell
# 现在可以使用Token自动发布
.\发布.ps1 -Version "1.0.1" -Title "v1.0.1 - 更新" -Token "your_github_token"
```

---

## ⚠️ 重要注意事项

### 1. latest.yml 文件
- ❗ **每次打包都会重新生成**
- ❗ **必须和安装包一起上传到GitHub**
- ❗ **包含版本信息和文件校验和**
- ❗ **没有这个文件，自动更新会失败**

### 2. 版本号规则
三者必须严格匹配：
- `package.json` 中的 `version`: `1.0.1`
- GitHub Release 的 `Tag`: `v1.0.1`
- 文件名中的版本: `AI插件应用 Setup 1.0.1.exe`

### 3. 仓库必须公开
- 当前配置为公开仓库（`private: false`）
- 如果使用私有仓库，需要额外配置token

### 4. 增量更新
- electron-updater 支持增量更新（通过.blockmap文件）
- 用户只需下载变化的部分，速度更快
- 建议始终上传.blockmap文件

---

## 🔍 测试自动更新

### 测试步骤

1. **发布v1.0.0**
   ```powershell
   # 发布初始版本到GitHub
   .\发布.ps1 -Version "1.0.0" -Title "v1.0.0 - 初始版本"
   ```

2. **安装v1.0.0**
   - 下载并安装 `AI插件应用 Setup 1.0.0.exe`
   - 启动应用，确认运行正常

3. **发布v1.0.1**
   ```powershell
   # 修改一些代码
   npm version patch  # 1.0.0 -> 1.0.1
   npm run electron:build:win
   .\发布.ps1 -Version "1.0.1" -Title "v1.0.1 - 测试更新"
   ```

4. **测试更新**
   - 打开已安装的v1.0.0应用
   - 等待几秒，应该会自动弹出更新通知
   - 或手动点击"检查更新"
   - 确认下载和安装正常

---

## 📊 版本管理建议

### 语义化版本控制

```
主版本号.次版本号.修订号
  ↑        ↑        ↑
  |        |        |
  |        |        └─ 向下兼容的问题修正
  |        └────────── 向下兼容的功能性新增
  └─────────────────── 不兼容的API修改
```

### 示例

| 版本 | 说明 |
|------|------|
| 1.0.0 | 初始版本 |
| 1.0.1 | 修复bug |
| 1.1.0 | 新增功能 |
| 2.0.0 | 重大更新 |

---

## 🐛 常见问题

### Q1: 提示"无法连接到更新服务器"
**原因**：
- GitHub仓库配置错误
- Release未发布
- latest.yml文件缺失

**解决**：
1. 检查 `package.json` 中的 `owner` 和 `repo` 是否正确
2. 确认Release已发布（不是Draft）
3. 确认已上传 `latest.yml` 文件

### Q2: 没有收到更新通知
**原因**：
- 版本号没有更新
- Release Tag与版本号不匹配
- 应用还在开发模式

**解决**：
1. 确认 `package.json` 的 `version` 已更新
2. 确认Release Tag格式为 `v1.0.1`（带v前缀）
3. 必须打包后测试，开发模式不检查更新

### Q3: 下载失败或安装失败
**原因**：
- 网络问题
- Release附件未正确上传
- 文件不完整

**解决**：
1. 检查网络连接
2. 重新上传所有文件到Release
3. 确认文件大小和sha512匹配

### Q4: 如何回退到旧版本？
**解决**：
1. 在GitHub Releases页面删除有问题的Release
2. 重新发布旧版本的Release
3. 用户会自动检测到你发布的版本

---

## 📖 相关文件

| 文件 | 说明 |
|------|------|
| `electron/main.js` | 自动更新主逻辑（第9-72行） |
| `package.json` | GitHub发布配置（第40-45行） |
| `发布.ps1` | 增强版发布脚本 |
| `release/latest.yml` | 更新配置文件（自动生成） |

---

## 🎯 快速命令参考

```powershell
# 打包应用
npm run electron:build:win

# 更新版本号
npm version patch    # 1.0.0 -> 1.0.1
npm version minor    # 1.0.0 -> 1.1.0
npm version major    # 1.0.0 -> 2.0.0

# 查看当前版本
npm view . version

# 发布到GitHub
.\发布.ps1 -Version "1.0.1" -Title "v1.0.1 - 更新说明"
```

---

## ✨ 总结

✅ **已完成的配置**：
- electron-updater 已集成
- GitHub仓库已配置（CWtongxin/ai-assistant-app）
- 自动更新逻辑已实现
- 发布脚本已增强
- UI检查更新按钮已添加

⚠️ **你需要做的**：
1. 首次发布v1.0.0到GitHub Releases
2. 后续按流程发布新版本

🎉 **完成后**：
- 用户启动应用时自动检查更新
- 后台自动下载，提示安装
- 发布新版本只需2条命令

---

**有任何问题随时问我！** 🚀
