# 🤖 超级全能AI助手 ✅

基于 Vite + React + Electron 打造的**全能AI助手**，学生、白领、开发者都能用！

## 🎉 打包成功！

Windows安装包：`release/AI插件应用 Setup 1.0.0.exe` (约 80 MB)

直接运行该文件即可安装到您的Windows系统。

---

## ✨ 核心功能

### 🌟 8大场景模式
- **全能助手** - 通用问答，解决各种问题
- **学习辅导** - 作业解答、知识点讲解、论文写作
- **办公效率** - 邮件撰写、报告生成、数据分析
- **编程开发** - 代码生成、Bug修复、代码审查
- **写作创作** - 文章撰写、文案创作、故事编写
- **翻译助手** - 多语言翻译、口语练习
- **图像生成** - AI绘画、图片创作
- **文件处理** - PDF/Word/Excel智能分析

### 💪 强大能力
- 📝 **智能对话** - 支持多轮对话，上下文理解
- 📎 **文件上传** - 支持PDF、TXT、图片等文件解析
- 🖼️ **图像识别** - 上传图片，AI帮你分析
- 🎨 **图像生成** - 文字描述生成精美图片
- 🎵 **语音功能** - 语音识别 + 语音合成（开发中）
- 💾 **本地存储** - API Key安全保存在本地

## 🚀 快速开始

### 首次使用
1. 安装并打开应用
2. 点击左下角"⚙️ 设置"
3. 输入你的OpenAI API Key
4. 开始对话！

### 获取API Key
1. 访问 https://platform.openai.com
2. 注册账号
3. 在 API Keys 页面创建新Key
4. 复制到应用中

## 开发

```bash
# 启动开发模式（Vite + Electron）
npm run electron:dev

# 仅启动Vite开发服务器
npm run dev
```

## 打包

```bash
# 打包Windows应用
npm run electron:build:win

# 或者使用通用打包命令
npm run electron:build
```

打包完成后，可执行文件位于 `release` 目录。

## 项目结构

```
├── electron/          # Electron主进程
│   └── main.js       # 主进程入口
├── src/              # React源代码
│   ├── services/     # AI服务模块
│   │   ├── ai.js    # AI对话、图像、语音服务
│   │   └── file.js  # 文件处理服务
│   ├── App.jsx      # 主组件
│   └── main.jsx     # React入口
├── build/            # 构建资源（如图标）
├── dist/             # Vite构建输出
├── release/          # Electron打包输出
├── index.html        # HTML模板
├── vite.config.js    # Vite配置
└── package.json      # 项目配置
```

## 注意事项

1. **API Key安全**：Key仅保存在浏览器本地存储，不会上传到任何服务器
2. **图标文件**：在 `build/` 目录放置 `icon.ico` 作为应用图标（可选）
3. **开发模式**：会自动打开开发者工具
4. **网络连接**：使用AI功能需要联网访问OpenAI API

## 技术要求

- Node.js 16+
- npm 或 yarn
- OpenAI API Key

## 下一步计划

- [ ] 语音输入输出
- [ ] 更多文件类型支持（Word/Excel）
- [ ] 对话历史记录
- [ ] 自定义提示词模板
- [ ] 离线模式（本地AI模型）
- [ ] 插件系统
