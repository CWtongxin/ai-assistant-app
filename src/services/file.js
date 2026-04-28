// 文件处理服务
import * as pdfjsLib from 'pdfjs-dist';

class FileService {
  // 读取文本文件
  async readTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  // 读取PDF文件
  async readPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n';
    }
    
    return text;
  }

  // 读取Word文件（需要mammoth.js）
  async readWord(file) {
    // 这里需要安装 mammoth.js
    // npm install mammoth
    throw new Error('请安装 mammoth.js: npm install mammoth');
  }

  // 读取Excel文件（需要sheetjs）
  async readExcel(file) {
    // 这里需要安装 xlsx
    // npm install xlsx
    throw new Error('请安装 xlsx: npm install xlsx');
  }

  // 图片转Base64
  imageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  // 智能文件解析
  async parseFile(file) {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    try {
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        return {
          type: 'pdf',
          content: await this.readPDF(file),
        };
      }

      if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        return {
          type: 'text',
          content: await this.readTextFile(file),
        };
      }

      if (fileType.startsWith('image/')) {
        return {
          type: 'image',
          content: await this.imageToBase64(file),
        };
      }

      if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
          fileName.endsWith('.docx')) {
        return {
          type: 'word',
          content: await this.readWord(file),
        };
      }

      if (fileType === 'application/vnd.ms-excel' || 
          fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        return {
          type: 'excel',
          content: await this.readExcel(file),
        };
      }

      throw new Error(`不支持的文件类型: ${fileType}`);
    } catch (error) {
      console.error('文件解析错误:', error);
      throw error;
    }
  }

  // 文件下载
  downloadFile(content, filename, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export default new FileService();
