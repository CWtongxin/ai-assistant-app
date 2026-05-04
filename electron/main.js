const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater')

// 开发环境判断
const isDev = !app.isPackaged

// 自动更新配置
function setupAutoUpdater() {
  if (isDev) {
    console.log('开发模式，跳过自动更新')
    return
  }

  // 延迟3秒后检查更新，避免阻塞启动
  setTimeout(() => {
    try {
      // 配置更新服务器
      autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'CWtongxin',
        repo: 'ai-assistant-app',
        private: false
      })

      // 启动时自动检查更新
      autoUpdater.checkForUpdatesAndNotify()
    } catch (error) {
      console.error('自动更新配置失败:', error)
    }
  }, 3000)

  // 更新可用时
  autoUpdater.on('update-available', (info) => {
    console.log('发现新版本:', info.version)
    dialog.showMessageBox({
      type: 'info',
      title: '发现新版本',
      message: `发现新版本 v${info.version}`,
      detail: '正在后台下载更新，下载完成后会提示您安装。',
      buttons: ['确定']
    })
  })

  // 更新不可用时
  autoUpdater.on('update-not-available', (info) => {
    console.log('当前已是最新版本')
  })

  // 下载进度
  autoUpdater.on('download-progress', (progressObj) => {
    let logMessage = `下载速度: ${progressObj.bytesPerSecond}`
    logMessage = logMessage + ' - ' + progressObj.percent + '%'
    logMessage = logMessage + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
    console.log(logMessage)
  })

  // 下载完成
  autoUpdater.on('update-downloaded', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: '更新已下载',
      message: '新版本已下载完成',
      detail: `版本 v${info.version} 已准备好安装。应用将重启以安装更新。`,
      buttons: ['立即重启', '稍后']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
  })

  // 更新错误
  autoUpdater.on('error', (err) => {
    console.error('更新错误:', err)
  })
}

// 手动检查更新
ipcMain.handle('check-for-updates', async () => {
  if (isDev) {
    return { status: 'dev', message: '开发模式不支持更新检查' }
  }
  
  try {
    await autoUpdater.checkForUpdates()
    return { status: 'checking', message: '正在检查更新...' }
  } catch (error) {
    return { status: 'error', message: error.message }
  }
})

// 创建中文菜单
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建窗口',
          accelerator: 'CmdOrCtrl+N',
          click: () => createWindow()
        },
        { type: 'separator' },
        {
          label: '检查更新',
          click: async (item, focusedWindow) => {
            if (focusedWindow) {
              focusedWindow.webContents.send('manual-check-update')
            }
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', role: 'undo' },
        { label: '重做', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', role: 'cut' },
        { label: '复制', role: 'copy' },
        { label: '粘贴', role: 'paste' },
        { label: '全选', role: 'selectAll' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { label: '刷新', role: 'reload' },
        { label: '强制刷新', role: 'forceReload' },
        { type: 'separator' },
        { label: '放大', role: 'zoomIn' },
        { label: '缩小', role: 'zoomOut' },
        { label: '实际大小', role: 'resetZoom' },
        { type: 'separator' },
        { label: '全屏', role: 'togglefullscreen' }
      ]
    },
    {
      label: '窗口',
      submenu: [
        { label: '最小化', role: 'minimize' },
        { label: '关闭', role: 'close' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            const { dialog } = require('electron')
            dialog.showMessageBox({
              type: 'info',
              title: '关于 AI助手',
              message: `AI助手 v${app.getVersion()}`,
              detail: '超级全能AI助手\n支持Ollama本地模型和OpenAI API',
              buttons: ['确定']
            })
          }
        }
      ]
    }
  ]

  if (isDev) {
    template.push({
      label: '开发',
      submenu: [
        {
          label: '开发者工具',
          accelerator: 'F12',
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              focusedWindow.webContents.toggleDevTools()
            }
          }
        }
      ]
    })
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // 加载应用
  if (isDev) {
    win.loadURL('http://localhost:5173')
    // 打开开发者工具
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createMenu()
  createWindow()
  setupAutoUpdater()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
