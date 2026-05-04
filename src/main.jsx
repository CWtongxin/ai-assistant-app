import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// 错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React 渲染错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div>
            <h1 style={{ color: '#ff0000', marginBottom: '20px' }}>应用启动失败</h1>
            <p style={{ color: '#666666', marginBottom: '20px' }}>
              请刷新页面重试。如果问题持续存在，请联系开发者。
            </p>
            <details style={{ backgroundColor: '#fff5f5', padding: '15px', borderRadius: '4px', maxWidth: '600px', margin: '0 auto' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#ff0000' }}>查看错误详情</summary>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '12px', marginTop: '10px' }}>
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
