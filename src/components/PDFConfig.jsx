import { useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// 配置PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;

function PDFConfig() {
  useEffect(() => {
    // PDF.js configuration is set above
  }, []);
  
  return null;
}

export default PDFConfig;
