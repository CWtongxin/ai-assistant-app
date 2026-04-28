// Ollama本地AI服务
class OllamaService {
  constructor() {
    this.baseURL = 'http://localhost:11434';
    this.currentModel = 'deepseek-r1';
    this.availableModels = [
      { id: 'deepseek-r1', name: 'DeepSeek R1', type: 'local' },
      { id: 'qwen2.5', name: '通义千问 2.5', type: 'local' },
    ];
  }

  // 设置基础URL
  setBaseURL(url) {
    this.baseURL = url;
  }

  // 切换模型
  setModel(modelId) {
    this.currentModel = modelId;
  }

  // 获取当前模型
  getCurrentModel() {
    return this.currentModel;
  }

  // 获取可用模型列表
  getAvailableModels() {
    return this.availableModels;
  }

  // 智能对话
  async chat(messages, options = {}) {
    const {
      temperature = 0.7,
      stream = false,
    } = options;

    try {
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.currentModel,
          messages: messages,
          stream: stream,
          options: {
            temperature,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API错误: ${response.status}`);
      }

      const data = await response.json();
      return data.message.content;
    } catch (error) {
      console.error('Ollama对话错误:', error);
      throw error;
    }
  }

  // 检查Ollama连接
  async checkConnection() {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`);
      if (!response.ok) {
        return false;
      }
      const data = await response.json();
      return true;
    } catch (error) {
      console.error('Ollama连接检查失败:', error);
      return false;
    }
  }

  // 获取本地可用模型列表
  async fetchAvailableModels() {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`);
      if (!response.ok) {
        throw new Error('无法获取模型列表');
      }
      const data = await response.json();
      return data.models.map(model => ({
        id: model.name,
        name: model.name,
        type: 'local',
      }));
    } catch (error) {
      console.error('获取模型列表失败:', error);
      throw error;
    }
  }
}

export default new OllamaService();
