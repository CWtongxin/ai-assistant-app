import { useState, useEffect, useRef } from 'react';
import './App.css';
import aiService from './services/ai';
import ollamaService from './services/ollama';
import fileService from './services/file';
import './components/PDFConfig';

// AI引擎类型
const ENGINE_TYPES = {
  ollama: { name: 'Ollama本地', icon: '💻' },
  openai: { name: 'OpenAI API', icon: '☁️' },
};

// 场景预设
const SCENARIOS = {
  general: {
    name: '全能助手',
    icon: '🌟',
    prompt: '你是一个全能的AI助手，可以帮助用户解决各种问题。',
    color: '#000000',
  },
  study: {
    name: '学习辅导',
    icon: '📚',
    prompt: '你是一个专业的学习辅导老师，擅长解答各学科问题，帮助学生理解知识点。',
    color: '#000000',
  },
  work: {
    name: '办公效率',
    icon: '💼',
    prompt: '你是一个高效的办公助手，擅长撰写邮件、报告、方案，处理数据分析等办公任务。',
    color: '#000000',
  },
  code: {
    name: '编程开发',
    icon: '💻',
    prompt: '你是一个资深程序员，精通多种编程语言，能够帮助用户解决编程问题、编写代码、调试bug。',
    color: '#000000',
  },
  write: {
    name: '写作创作',
    icon: '✍️',
    prompt: '你是一个专业的写作者，擅长写文章、写报告、写故事等各种文体创作。',
    color: '#000000',
  },
  translate: {
    name: '翻译助手',
    icon: '🌍',
    prompt: '你是一个专业的翻译，精通多国语言，能够提供准确的翻译服务。',
    color: '#000000',
  },
  image: {
    name: '图像生成',
    icon: '🎨',
    prompt: '你是一个AI图像生成助手，根据用户描述生成图片。',
    color: '#000000',
  },
};

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentScenario, setCurrentScenario] = useState('general');
  const [uploadedFile, setUploadedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // AI引擎配置
  const [engine, setEngine] = useState('ollama');
  const [apiKey, setApiKey] = useState('');
  const [ollamaURL, setOllamaURL] = useState('http://localhost:11434');
  const [currentModel, setCurrentModel] = useState('deepseek-r1');
  const [availableModels, setAvailableModels] = useState([
    { id: 'deepseek-r1', name: 'DeepSeek R1' },
    { id: 'qwen2.5', name: '通义千问 2.5' },
  ]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // 初始化
  useEffect(() => {
    const savedEngine = localStorage.getItem('ai_engine') || 'ollama';
    const savedApiKey = localStorage.getItem('openai_api_key') || '';
    const savedOllamaURL = localStorage.getItem('ollama_url') || 'http://localhost:11434';
    const savedModel = localStorage.getItem('current_model') || 'deepseek-r1';

    setEngine(savedEngine);
    setApiKey(savedApiKey);
    setOllamaURL(savedOllamaURL);
    setCurrentModel(savedModel);

    ollamaService.setBaseURL(savedOllamaURL);
    ollamaService.setModel(savedModel);

    if (savedApiKey) {
      aiService.initialize(savedApiKey);
    }

    checkConnection(savedEngine);

    if (window.electronAPI) {
      window.electronAPI.onManualCheckUpdate(async () => {
        const result = await window.electronAPI.checkForUpdates();
        if (result.status === 'dev') {
          alert('开发模式不支持更新检查，请打包后测试');
        } else if (result.status === 'error') {
          alert('检查更新失败: ' + result.message);
        }
      });
    }
  }, []);

  // 检查连接状态
  const checkConnection = async (eng) => {
    try {
      if (eng === 'ollama') {
        const connected = await ollamaService.checkConnection();
        setConnectionStatus(connected ? 'connected' : 'disconnected');
        if (connected) {
          try {
            const models = await ollamaService.fetchAvailableModels();
            if (models.length > 0) {
              setAvailableModels(models);
            }
          } catch (e) {
            console.log('使用默认模型列表');
          }
        }
      } else {
        const connected = await aiService.checkConnection();
        setConnectionStatus(connected ? 'connected' : 'disconnected');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 切换AI引擎
  const switchEngine = (newEngine) => {
    setEngine(newEngine);
    localStorage.setItem('ai_engine', newEngine);
    checkConnection(newEngine);
  };

  // 切换模型
  const switchModel = (modelId) => {
    setCurrentModel(modelId);
    localStorage.setItem('current_model', modelId);
    if (engine === 'ollama') {
      ollamaService.setModel(modelId);
    }
  };

  // 保存设置
  const saveSettings = () => {
    localStorage.setItem('ai_engine', engine);
    localStorage.setItem('openai_api_key', apiKey);
    localStorage.setItem('ollama_url', ollamaURL);
    localStorage.setItem('current_model', currentModel);

    if (engine === 'ollama') {
      ollamaService.setBaseURL(ollamaURL);
      ollamaService.setModel(currentModel);
    } else {
      aiService.initialize(apiKey);
    }

    setShowSettings(false);
    checkConnection(engine);
  };

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() && !uploadedFile) return;
    
    if (engine === 'openai' && !apiKey) {
      setShowSettings(true);
      return;
    }

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleString(),
    };

    if (uploadedFile) {
      userMessage.file = uploadedFile;
    }

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setUploadedFile(null);
    setLoading(true);

    const useOllama = engine === 'ollama';

    try {
      const scenarioPrompt = {
        role: 'system',
        content: SCENARIOS[currentScenario].prompt,
      };

      const chatMessages = [
        scenarioPrompt,
        ...messages.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content: input },
      ];

      if (uploadedFile) {
        const fileData = await fileService.parseFile(uploadedFile);
        if (fileData.type === 'image' && !useOllama) {
          const response = await aiService.analyzeImage(
            fileData.content,
            input || '请分析这张图片'
          );
          
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: response,
            timestamp: new Date().toLocaleString(),
          }]);
          setLoading(false);
          return;
        } else {
          chatMessages[chatMessages.length - 1].content = 
            `文件内容：\n${fileData.content}\n\n用户问题：${input}`;
        }
      }

      let response;
      if (useOllama) {
        response = await ollamaService.chat(chatMessages);
      } else {
        response = await aiService.chat(chatMessages);
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleString(),
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ 错误：${error.message}`,
        timestamp: new Date().toLocaleString(),
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  // 文件上传处理
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  // 生成图像
  const generateImage = async () => {
    if (!input.trim()) return;
    if (engine !== 'openai' || !apiKey) {
      alert('图像生成需要OpenAI API，请在设置中配置');
      setShowSettings(true);
      return;
    }

    setMessages(prev => [...prev, {
      role: 'user',
      content: `🎨 生成图像：${input}`,
      timestamp: new Date().toLocaleString(),
    }]);
    setInput('');
    setLoading(true);

    try {
      const images = await aiService.generateImage(input);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '✅ 图像生成成功！',
        imageUrl: images[0].url,
        timestamp: new Date().toLocaleString(),
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ 图像生成失败：${error.message}`,
        timestamp: new Date().toLocaleString(),
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  // 清空对话
  const clearChat = () => {
    setMessages([]);
  };

  // 检查更新
  const checkForUpdates = async () => {
    if (!window.electronAPI) {
      alert('当前为开发模式，更新功能需在打包后使用');
      return;
    }

    try {
      const result = await window.electronAPI.checkForUpdates();
      
      if (result.status === 'dev') {
        alert('开发模式不支持更新检查，请打包后测试');
      } else if (result.status === 'checking') {
        alert('正在检查更新...\n\n如果有新版本，将会自动下载并提示您安装。');
      } else if (result.status === 'error') {
        alert('检查更新失败: ' + result.message);
      }
    } catch (error) {
      alert('检查更新时出错: ' + error.message);
    }
  };

  return (
    <div className="app">
      {/* 侧边栏 */}
      <div className="sidebar">
        <div className="logo">
          <h1>AI助手</h1>
          <div className="engine-info">
            <span className={`status-dot ${connectionStatus}`}></span>
            <span>{ENGINE_TYPES[engine].icon} {ENGINE_TYPES[engine].name}</span>
            {engine === 'ollama' && <span className="model-name">{currentModel}</span>}
          </div>
        </div>
        
        <div className="scenarios">
          <h3>选择场景</h3>
          {Object.entries(SCENARIOS).map(([key, scenario]) => (
            <button
              key={key}
              className={`scenario-btn ${currentScenario === key ? 'active' : ''}`}
              onClick={() => setCurrentScenario(key)}
            >
              <span className="icon">{scenario.icon}</span>
              <span className="name">{scenario.name}</span>
            </button>
          ))}
        </div>

        <div className="actions">
          <button onClick={() => setShowSettings(true)} className="action-btn">
            ⚙️ 设置
          </button>
          <button onClick={clearChat} className="action-btn">
            🗑️ 清空对话
          </button>
          <button onClick={checkForUpdates} className="action-btn">
            🔄 检查更新
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="main">
        {/* 消息列表 */}
        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome">
              <h2>{SCENARIOS[currentScenario].icon} {SCENARIOS[currentScenario].name}</h2>
              <p>有什么我可以帮助你的吗？</p>
              <div className="quick-actions">
                <button onClick={() => setInput('帮我写一篇文章')}>✍️ 写文章</button>
                <button onClick={() => setInput('帮我解答一个数学问题')}>📐 解数学题</button>
                <button onClick={() => setInput('帮我写一段代码')}>💻 写代码</button>
                <button onClick={() => setInput('帮我翻译这段文字')}>🌍 翻译</button>
              </div>
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role} ${msg.isError ? 'error' : ''}`}>
              <div className="message-header">
                <span className="role">
                  {msg.role === 'user' ? '👤 你' : '🤖 AI'}
                </span>
                <span className="time">{msg.timestamp}</span>
              </div>
              <div className="message-content">
                {msg.file && (
                  <div className="file-info">📎 {msg.file.name}</div>
                )}
                <p>{msg.content}</p>
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="AI生成的图像" className="generated-image" />
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="message assistant">
              <div className="message-content">
                <div className="typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区 */}
        <div className="input-area">
          {uploadedFile && (
            <div className="file-preview">
              📎 {uploadedFile.name}
              <button onClick={() => setUploadedFile(null)}>✕</button>
            </div>
          )}
          
          <div className="input-wrapper">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={`在 ${SCENARIOS[currentScenario].name} 模式下提问...`}
              disabled={loading}
            />
            
            <div className="input-actions">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="icon-btn"
                title="上传文件"
              >
                📎
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                accept=".pdf,.txt,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
              />
              
              {currentScenario === 'image' ? (
                <button
                  onClick={generateImage}
                  className="send-btn"
                  disabled={loading || !input.trim()}
                >
                  🎨 生成
                </button>
              ) : (
                <button
                  onClick={sendMessage}
                  className="send-btn"
                  disabled={loading || (!input.trim() && !uploadedFile)}
                >
                  发送
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 设置弹窗 */}
      {showSettings && (
        <div className="modal" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>⚙️ 设置</h2>
            
            {/* AI引擎选择 */}
            <div className="setting-item">
              <label>AI引擎</label>
              <div className="engine-selector">
                {Object.entries(ENGINE_TYPES).map(([key, value]) => (
                  <button
                    key={key}
                    className={`engine-btn ${engine === key ? 'active' : ''}`}
                    onClick={() => switchEngine(key)}
                  >
                    {value.icon} {value.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Ollama配置 */}
            {engine === 'ollama' && (
              <>
                <div className="setting-item">
                  <label>模型选择</label>
                  <select
                    value={currentModel}
                    onChange={(e) => switchModel(e.target.value)}
                    className="model-select"
                  >
                    {availableModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="setting-item">
                  <label>Ollama地址</label>
                  <input
                    type="text"
                    value={ollamaURL}
                    onChange={(e) => setOllamaURL(e.target.value)}
                    placeholder="http://localhost:11434"
                  />
                  <p className="hint">
                    确保Ollama服务已启动并运行在该地址
                  </p>
                </div>
              </>
            )}

            {/* OpenAI配置 */}
            {engine === 'openai' && (
              <div className="setting-item">
                <label>OpenAI API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                />
                <p className="hint">
                  API Key仅保存在本地，不会上传到服务器
                </p>
              </div>
            )}

            {/* 连接状态 */}
            <div className="setting-item">
              <label>连接状态</label>
              <div className={`connection-status ${connectionStatus}`}>
                {connectionStatus === 'connected' ? '✅ 已连接' : '❌ 未连接'}
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowSettings(false)}>取消</button>
              <button onClick={saveSettings} className="primary">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
