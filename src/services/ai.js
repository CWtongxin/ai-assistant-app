import OpenAI from 'openai';

class AIService {
  constructor() {
    this.client = null;
    this.apiKey = null;
  }

  // 初始化OpenAI客户端
  initialize(apiKey, baseURL = null) {
    this.apiKey = apiKey;
    const config = {
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    };
    
    if (baseURL) {
      config.baseURL = baseURL;
    }
    
    this.client = new OpenAI(config);
  }

  // 智能对话
  async chat(messages, options = {}) {
    if (!this.client) {
      throw new Error('请先配置API密钥');
    }

    const {
      model = 'gpt-4o',
      temperature = 0.7,
      maxTokens = 4000,
      stream = false,
    } = options;

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream,
      });

      if (stream) {
        return response;
      }

      return response.choices[0].message.content;
    } catch (error) {
      console.error('AI对话错误:', error);
      throw error;
    }
  }

  // 图像生成
  async generateImage(prompt, options = {}) {
    if (!this.client) {
      throw new Error('请先配置API密钥');
    }

    const {
      model = 'dall-e-3',
      size = '1024x1024',
      quality = 'standard',
      n = 1,
    } = options;

    try {
      const response = await this.client.images.generate({
        model,
        prompt,
        size,
        quality,
        n,
      });

      return response.data;
    } catch (error) {
      console.error('图像生成错误:', error);
      throw error;
    }
  }

  // 图像识别
  async analyzeImage(imageUrl, prompt, options = {}) {
    if (!this.client) {
      throw new Error('请先配置API密钥');
    }

    const {
      model = 'gpt-4o',
      maxTokens = 2000,
    } = options;

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: maxTokens,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('图像识别错误:', error);
      throw error;
    }
  }

  // 语音转文字（需要音频文件）
  async speechToText(audioFile) {
    if (!this.client) {
      throw new Error('请先配置API密钥');
    }

    try {
      const transcription = await this.client.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
      });

      return transcription.text;
    } catch (error) {
      console.error('语音识别错误:', error);
      throw error;
    }
  }

  // 文字转语音
  async textToSpeech(text, options = {}) {
    if (!this.client) {
      throw new Error('请先配置API密钥');
    }

    const {
      model = 'tts-1',
      voice = 'alloy',
      responseFormat = 'mp3',
      speed = 1.0,
    } = options;

    try {
      const response = await this.client.audio.speech.create({
        model,
        voice,
        input: text,
        response_format: responseFormat,
        speed,
      });

      return response;
    } catch (error) {
      console.error('语音合成错误:', error);
      throw error;
    }
  }

  // 文本嵌入（用于语义搜索）
  async embeddings(text, options = {}) {
    if (!this.client) {
      throw new Error('请先配置API密钥');
    }

    const {
      model = 'text-embedding-ada-002',
    } = options;

    try {
      const response = await this.client.embeddings.create({
        model,
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('嵌入错误:', error);
      throw error;
    }
  }

  // 检查API连接
  async checkConnection() {
    if (!this.client) {
      throw new Error('未初始化AI服务');
    }

    try {
      await this.chat([
        { role: 'user', content: 'Hi' }
      ], { maxTokens: 10 });
      return true;
    } catch (error) {
      console.error('API连接检查失败:', error);
      return false;
    }
  }
}

export default new AIService();
